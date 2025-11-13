import React from 'react';
import {
	Button,
	Image,
	Modal,
	StatusBar,
	StyleSheet,
	Text,
	TouchableOpacity,
	View,
	SafeAreaView,
	ScrollView,
	ActivityIndicator,
} from 'react-native';
import DocumentPicker, {
	types,
} from '@react-native-documents/picker';
import debounce from 'lodash/debounce';
import * as dateFns from 'date-fns';
import toast from '../utils/toast';

import * as Qiscus from '../qiscus';
import { IQMessage, IQChatRoom, IQUser } from 'qiscus-sdk-javascript/types/model';
import { qiscusEvents } from '../qiscus';
import Toolbar from '../components/Toolbar';
import MessageList from '../components/MessageList';
import Form from '../components/Form';
import Empty from '../components/EmptyChat';
import { getFileExtension, isImageFile, isUnSupportFileType, isVideoFile } from '../qiscus';
import * as ImagePicker from 'react-native-image-picker';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { multichannelApi } from '../qiscus/multichannelApi';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';

// Type definitions
type RootStackParamList = {
	Chat: { roomId: number };
	Login: undefined;
};

type Props = NativeStackScreenProps<RootStackParamList, 'Chat'>;

// Use SDK v3 types directly
type Message = IQMessage;
type Room = IQChatRoom;

interface ChatScreenState {
	room: IQChatRoom | null;
	messages: Record<string, IQMessage>;
	isLoadMoreable: boolean;
	isOnline: boolean;
	isTyping: boolean;
	lastOnline: Date | null;
	typingUsername: string | null;
	isModalVisible: boolean;
	scroll: boolean;
	error: string | null;
	isLoading: boolean;
	debugInfo: string[];
}

interface FileSource {
	uri: string;
	name: string;
	type: string;
	size?: number;
}

export default class ChatScreen extends React.Component<Props, ChatScreenState> {
	state: ChatScreenState = {
		room: null,
		messages: {},
		isLoadMoreable: true,
		isOnline: false,
		isTyping: false,
		lastOnline: null,
		typingUsername: null,
		isModalVisible: false,
		scroll: false,
		error: null,
		isLoading: false,
		debugInfo: [],
	};

	newMessageListener: any;
	readListener: any;
	deliveredListener: any;
	presenceListener: any;
	typingListener: any;

	// Debug helper
	addDebugLog = (message: string, data?: any) => {
		const timestamp = new Date().toISOString();
		const logMessage = `[${timestamp}] ${message}`;
		console.log(logMessage, data || '');
		this.setState(state => ({
			debugInfo: [...state.debugInfo.slice(-50), logMessage].slice(-50), // Keep last 50 logs
		}));
	};

	// Error handler
	handleError = (context: string, error: any, showToast = true) => {
		const errorMessage = error?.message || error?.toString() || 'Unknown error';
		const fullError = `${context}: ${errorMessage}`;
		
		console.error(`[ChatScreen Error] ${fullError}`, error);
		this.addDebugLog(`ERROR in ${context}`, { error: errorMessage, stack: error?.stack });
		
		this.setState({ error: fullError });
		
		if (showToast) {
			toast(`Error: ${errorMessage}`);
		}
		
		return fullError;
	};

	// Clear error
	clearError = () => {
		this.setState({ error: null });
	};

	// Normalize message format from API (snake_case) to SDK v3 IQMessage format
	normalizeMessage = (msg: any): IQMessage => {
		if (!msg) return msg;
		
		// If already normalized (has uniqueId and text), return as is
		if (msg.uniqueId && msg.text && msg.sender && msg.timestamp instanceof Date) {
			return msg as IQMessage;
		}
		
		// Normalize from API format to SDK v3 IQMessage format
		const normalized: IQMessage = {
			id: msg.id,
			uniqueId: msg.uniqueId || msg.unique_temp_id || msg.unique_id || String(msg.id),
			text: msg.text || msg.message || '',
			timestamp: msg.timestamp instanceof Date 
				? msg.timestamp 
				: msg.timestamp 
					? new Date(msg.timestamp) 
					: msg.unix_timestamp 
						? new Date(msg.unix_timestamp * 1000) 
						: new Date(),
			chatRoomId: msg.chatRoomId || msg.room_id || msg.topic_id,
			previousMessageId: msg.previousMessageId || msg.comment_before_id || 0,
			status: msg.status || 'sent',
			type: msg.type || 'text',
			sender: msg.sender || {
				id: msg.user_id_str || msg.user_id?.toString() || msg.email || 'unknown',
				name: msg.username || 'Unknown',
				avatarUrl: msg.user_avatar_url,
				extras: msg.user_extras,
			},
			extras: msg.extras,
			payload: msg.payload,
		};
		
		return normalized;
	};

	componentDidMount() {
		try {
			this.addDebugLog('Component mounted');
			const roomId = this.props.route.params?.roomId ?? null;
			
			if (roomId == null) {
				this.handleError('componentDidMount', new Error('No roomId provided'));
				return this.props.navigation.replace('Login');
			}

			this.addDebugLog('Loading room data', { roomId });
			// Load room and messages
			this.loadRoomData(roomId);

			this.addDebugLog('Setting up event listeners');
			// Setup global event listeners
			this.setupEventListeners();
		} catch (error) {
			this.handleError('componentDidMount', error);
		}
	}

	loadRoomData = async (roomId: number): Promise<void> => {
		this.setState({ isLoading: true, error: null });
		try {
			this.addDebugLog('loadRoomData started', { roomId });
			
			// v3: Check if user is logged in
			const isLoggedIn = await Qiscus.isUserLoggedIn();
			this.addDebugLog('User login status', { isLoggedIn });
			
			if (!isLoggedIn) {
				throw new Error('User not logged in');
			}

			// Load room and messages using getChatRoomWithMessages
			this.addDebugLog('Fetching room and messages from API');
			const [roomData, messagesList] = await Qiscus.qiscus.getChatRoomWithMessages(roomId);
			this.addDebugLog('Room data received', { 
				roomId: roomData.id, 
				messageCount: messagesList.length 
			});
			
			// Normalize all messages from API format
			this.addDebugLog('Normalizing messages');
			const normalizedMessages = messagesList.map(msg => this.normalizeMessage(msg));
			
			// Load more initial messages if available
			if (normalizedMessages.length > 0) {
				try {
					this.addDebugLog('Loading older messages');
					// v3: getPreviousMessagesById(roomId, limit, messageId)
					const olderMessages = await Qiscus.qiscus.getPreviousMessagesById(
						roomData.id,
						20,
						normalizedMessages[0].id
					);
					this.addDebugLog('Older messages loaded', { count: olderMessages.length });
					// Add older messages to the beginning
					olderMessages.forEach(msg => {
						normalizedMessages.push(this.normalizeMessage(msg));
					});
				} catch (err) {
					this.addDebugLog('No more older messages available');
				}
			}

			// Format messages as Record
			const formattedMessages = normalizedMessages.reduce((result: Record<string, any>, msg: any) => {
				const key = msg.uniqueId;
				if (key) {
					result[key] = msg;
				}
				return result;
			}, {});

			// Check if more messages are available (previousMessageId > 0)
			const firstMessage = normalizedMessages[0];
			const isLoadMoreable = firstMessage ? firstMessage.previousMessageId > 0 : false;

			this.addDebugLog('Setting state with loaded data', {
				messageCount: Object.keys(formattedMessages).length,
				isLoadMoreable
			});

			// Set state
			this.setState({
				room: roomData,
				messages: formattedMessages,
				isLoadMoreable,
				isLoading: false,
			});

			// IMPORTANT: Subscribe to room for room-specific events
			// This enables real-time updates for this specific room
			if (roomData) {
				this.addDebugLog('Subscribing to chat room', { roomId: roomData.id });
				Qiscus.qiscus.subscribeChatRoom(roomData);
			}

			this.addDebugLog('Room data loaded successfully');
		} catch (error) {
			this.handleError('loadRoomData', error);
			this.setState({ isLoading: false });
		}
	};

	_handleLogout = async (): Promise<void> => {
		try {
			console.log('[ChatScreen] Logging out...');

			// Clear session storage
			await multichannelApi.clearSession();

			// Clear user storage
			await AsyncStorage.removeItem('qiscus');

			// v3: Clear Qiscus SDK using clearUser()
			Qiscus.qiscus.clearUser();

			console.log('[ChatScreen] Logout successful');

			// Navigate to Login screen
			this.props.navigation.replace('Login');
		} catch (error) {
			console.error('[ChatScreen] Logout error:', error);
			toast('Failed to logout');
		}
	};

	setupEventListeners = (): void => {
		try {
			this.addDebugLog('Setting up event listeners');
			
			// Listen for new messages from Qiscus callbacks
			this.newMessageListener = qiscusEvents.on('new-messages', (messages: any[]) => {
				try {
					this.addDebugLog('Received new messages event', { count: messages.length });
					messages.forEach((message) => this._onNewMessage(message));
				} catch (error) {
					this.handleError('new-messages event', error);
				}
			});

			// Listen for message read
			this.readListener = qiscusEvents.on('comment-read', (data: any) => {
				try {
					this.addDebugLog('Message read event');
					this._onMessageRead(data);
				} catch (error) {
					this.handleError('comment-read event', error);
				}
			});

			// Listen for message delivered
			this.deliveredListener = qiscusEvents.on('comment-delivered', (data: any) => {
				try {
					this.addDebugLog('Message delivered event');
					this._onMessageDelivered(data);
				} catch (error) {
					this.handleError('comment-delivered event', error);
				}
			});

			// Listen for online presence
			this.presenceListener = qiscusEvents.on('presence', (data: any) => {
				try {
					this._onOnline(data);
				} catch (error) {
					this.handleError('presence event', error);
				}
			});

			// Listen for typing
			this.typingListener = qiscusEvents.on('typing', (data: any) => {
				try {
					if (this.state.room && Number(data.room_id) === this.state.room.id) {
						this._onTyping(data);
					}
				} catch (error) {
					this.handleError('typing event', error);
				}
			});
			
			this.addDebugLog('All event listeners set up successfully');
		} catch (error) {
			this.handleError('setupEventListeners', error);
		}
	};;

	componentWillUnmount() {
		try {
			this.addDebugLog('Component unmounting, cleaning up listeners');
			
			// IMPORTANT: Unsubscribe from room to stop room-specific events
			if (this.state.room) {
				this.addDebugLog('Unsubscribing from chat room', { roomId: this.state.room.id });
				Qiscus.qiscus.unsubscribeChatRoom(this.state.room as any);
			}
			
			// Remove event listeners
			if (this.newMessageListener) qiscusEvents.off('new-messages', this.newMessageListener);
			if (this.readListener) qiscusEvents.off('comment-read', this.readListener);
			if (this.deliveredListener) qiscusEvents.off('comment-delivered', this.deliveredListener);
			if (this.presenceListener) qiscusEvents.off('presence', this.presenceListener);
			if (this.typingListener) qiscusEvents.off('typing', this.typingListener);
			
			this.addDebugLog('Component unmounted successfully');
		} catch (error) {
			console.error('[ChatScreen] Error during unmount:', error);
		}
	}

	render() {
		const { room, isTyping, isOnline, lastOnline, typingUsername } = this.state;
		const messages = this.messages;
		const roomName = room ? room.name : 'Chat';
		const avatarURL = room ? room.avatarUrl : null;

		const showTyping = room != null && !this.isGroup && isTyping;

		return (
			<SafeAreaView
				style={styles.container}>
				<Toolbar
					title={roomName || 'Chat'}
					renderLeftButton={() => (
						<View style={{
							display: 'flex',
							flexDirection: 'row',
							flex: 0,
							alignItems: 'center',
						}}>
							<Image
								source={{ uri: avatarURL || undefined }}
								style={{
									width: 35,
									height: 35,
									resizeMode: 'cover',
									borderRadius: 50,
								}}
							/>
						</View>
					)}
					renderRightButton={() => (
						<TouchableOpacity
							onPress={this._handleLogout}
							style={{
								paddingHorizontal: 15,
								paddingVertical: 5,
								backgroundColor: '#FF4444',
								borderRadius: 5,
							}}>
							<Text style={{ color: '#FFFFFF', fontWeight: '600' }}>Logout</Text>
						</TouchableOpacity>
					)}
					renderMeta={() => (
						<View style={styles.onlineStatus}>
							{this._renderOnlineStatus()}
							{showTyping && (
								<Text style={styles.typingText}>
									{typingUsername} is typing...
								</Text>
							)}
							{this.isGroup && (
								<Text style={styles.typingText}>{this.participants}</Text>
							)}
						</View>
					)}
				/>

				{messages.length === 0 && <Empty />}
				{messages.length > 0 && (
					<MessageList
						messages={messages as any}
						onLoadMore={this._loadMore}
					/>
				)}

				<Modal visible={this.state.isModalVisible} animationType="slide">
					<View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
						<Text>Please select an option:</Text>
						<Button title="File" onPress={this._onSelectFile} />
						<Button title="Image" onPress={this._onSelectImage} />
					</View>
				</Modal>

				<Form
					onSubmit={this._submitMessage}
					onSelectFile={this._onSelectModal}
				/>
			</SafeAreaView>
		);
	}

	_renderOnlineStatus = (): React.ReactElement | null => {
		const { isGroup } = this;
		const { isTyping, isOnline, lastOnline, room } = this.state;
		if (room == null) {
			return null;
		}
		if (isGroup || isTyping) {
			return null;
		}

		const lastOnlineText = lastOnline && dateFns.isSameDay(lastOnline, new Date())
			? dateFns.format(lastOnline, 'hh:mm')
			: '';

		return (
			<>
				{isOnline && <Text style={styles.onlineStatusText}>Online</Text>}
				{!isOnline && <Text style={styles.typingText}>{lastOnlineText}</Text>}
			</>
		);
	};

	_onTyping = debounce(({ username }: { username: string }) => {
		this.setState(
			{
				isTyping: true,
				typingUsername: username,
			},
			() => {
				setTimeout(
					() =>
						this.setState({
							isTyping: false,
							typingUsername: null,
						}),
					850
				);
			}
		);
	}, 300);

	_onSelectModal = (): void => {
		this.setState({
			isModalVisible: true,
		});
	};

	_onOnline = (data: any): [string, any] => {
		this.setState({
			isOnline: data.isOnline,
			lastOnline: data.lastOnline,
		});
		return ['Online presence', data];
	};

	_onNewMessage = (message: IQMessage): string => {
		console.log('[ChatScreen] New message:', message);
		this.addDebugLog('New message received', { id: message.id, text: message.text });
		
		// SDK v3 already provides normalized IQMessage
		this.setState((state) => ({
			messages: {
				...state.messages,
				[message.uniqueId]: message,
			},
		}));
		
		return 'New message';
	};

	_onMessageRead = ({ comment }: { comment: IQMessage }): string => {
		toast('message read');
		const commentTime = comment.timestamp.getTime();
		const results = this.messages
			.filter((it) => it.timestamp.getTime() <= commentTime)
			.map((it) => ({ ...it, status: 'read' as const }));

		const messages = results.reduce((result: Record<string, IQMessage>, item: IQMessage) => {
			result[item.uniqueId] = item;
			return result;
		}, {});
		this.setState((state) => ({
			messages: {
				...state.messages,
				...messages,
			},
		}));
		return 'Message read';
	};

	_onMessageDelivered = ({ comment }: { comment: IQMessage }): string => {
		toast('message delivered');
		const commentTime = comment.timestamp.getTime();

		const results = this.messages
			.filter((it) => it.timestamp.getTime() <= commentTime && it.status !== 'read')
			.map((it) => ({ ...it, status: 'delivered' as const }));

		const messages = results.reduce((result: Record<string, IQMessage>, item: IQMessage) => {
			result[item.uniqueId] = item;
			return result;
		}, {});

		this.setState((state) => ({
			messages: {
				...state.messages,
				...messages,
			},
		}));
		return 'Message delivered';
	};

	// Use SDK's generateMessage method
	generateMessage = (text: string): IQMessage => {
		if (!this.state.room) {
			throw new Error('No room available');
		}
		
		return Qiscus.qiscus.generateMessage({
			roomId: this.state.room.id,
			text,
		});
	};

	// Generate file attachment message using SDK method
	generateFileMessage = (caption: string, url: string, filename: string): IQMessage => {
		if (!this.state.room) {
			throw new Error('No room available');
		}
		
		return Qiscus.qiscus.generateFileAttachmentMessage({
			roomId: this.state.room.id,
			caption,
			url,
			text: caption,
			filename,
		});
	};

	_submitMessage = async (text: string): Promise<void> => {
		try {
			this.addDebugLog('Submitting message', { text });
			
			// Generate message using SDK method
			const message = this.generateMessage(text);
			this.addDebugLog('Message generated', { uniqueId: message.uniqueId });
			
			// Add to local state immediately for optimistic UI
			await this._addMessage(message, true);
			this.addDebugLog('Message added to state');
			
			// Send message using SDK v3 sendMessage
			const sentMessage = await Qiscus.qiscus.sendMessage(message);
			
			this.addDebugLog('Message sent successfully', { messageId: sentMessage.id });
			// Update with server response
			this._updateMessage(message, sentMessage);
			toast('Message sent!');
		} catch (error) {
			this.handleError('_submitMessage', error);
		}
	};

	_handleError = (err: any): void => {
		if (err?.message?.includes('cancel')) {
			console.warn('cancelled');
		} else if (err?.message?.includes('progress')) {
			console.warn('multiple pickers were opened, only the last will be considered');
		} else {
			console.error('[ChatScreen] Error:', err);
		}
	};

	_onSelectFile = (): void => {
		this.setState({
			isModalVisible: false,
		});
		DocumentPicker.pick({
			allowMultiSelection: true,
			type: [types.allFiles],
		})
			.then((resp) => {
				resp.forEach((responses) => {
					let fileName = responses.name;
					if (!fileName) {
						const _fileName = responses.uri.split('/').pop();
						const _fileType = responses.type
							? responses.type.split('/').pop()
							: 'jpeg';
						fileName = `${_fileName}.${_fileType}`;
					}
					const source: FileSource = {
						uri: responses.uri,
						name: fileName,
						type: responses.type || 'application/octet-stream',
						size: responses.size,
					};
					if (isUnSupportFileType(source?.name)) {
						return Promise.reject('File not supported');
					}
					let sizeInMB = parseFloat(((source.size || 0) / (1024 * 1024)).toFixed(2));
					if (isNaN(sizeInMB)) {
						return Promise.reject('File size required');
					}
					if (!(sizeInMB <= 20)) {
						return Promise.reject('File size over');
					}
					this._onSendingFileOrMedia(source);
				});
			})
			.catch(this._handleError);
	};

	_onSelectImage = (): void => {
		this.setState({
			isModalVisible: false,
		});
		ImagePicker.launchImageLibrary(
			{
				mediaType: 'mixed',
				includeBase64: false,
				selectionLimit: 0,
				includeExtra: true,
			},
			(resp) => {
				if (resp?.didCancel) return console.log('user cancel');
				if (resp?.errorMessage)
					return console.log('error when getting file', resp.errorMessage);
				resp?.assets?.forEach((responses) => {
					let fileName = responses.fileName;
					if (!fileName) {
						const _fileName = responses.uri?.split('/').pop();
						const _fileType = responses.type
							? responses.type.split('/').pop()
							: 'jpeg';
						fileName = `${_fileName}.${_fileType}`;
					}
					const source: FileSource = {
						uri: responses.uri || '',
						name: fileName || 'image',
						type: responses.type || 'image/jpeg',
						size: responses.fileSize,
					};
					let sizeInMB = parseFloat(((source.size || 0) / (1024 * 1024)).toFixed(2));
					if (isNaN(sizeInMB) || sizeInMB === 0) {
						return Promise.reject('File size required or empty');
					}
					if (!(sizeInMB <= 2)) {
						return Promise.reject('File size cannot over from 2mb and cannot empty');
					}
					this._onSendingFileOrMedia(source);
				});
			}
		);
	};

	_addMessage = (message: IQMessage, scroll = false): Promise<void> =>
		new Promise((resolve) => {
			const key = message.uniqueId;
			this.setState(
				(state) => ({
					messages: {
						...state.messages,
						[key]: message,
					},
					scroll,
				}),
				() => {
					if (scroll === false) {
						resolve();
						return;
					}
					setTimeout(() => {
						this.setState({ scroll: false }, () => {
							resolve();
						});
					}, 400);
				}
			);
		});

	_updateMessage = (oldMessage: IQMessage, newMessage: IQMessage): void => {
		const key = oldMessage.uniqueId;
		this.setState((state) => ({
			messages: {
				...state.messages,
				[key]: newMessage,
			},
		}));
	};

	_loadMore = (): void => {
		try {
			if (!this.state.isLoadMoreable) {
				this.addDebugLog('Load more: not loadable');
				return;
			}
			
			if (!this.state.room) {
				this.addDebugLog('Load more: no room');
				return;
			}

			const firstMessage = this.messages[0];
			if (!firstMessage) {
				this.addDebugLog('Load more: no first message');
				return;
			}

			const lastMessageId = firstMessage.id;
			this.addDebugLog('Loading more messages', { lastMessageId });

			// v3: getPreviousMessagesById(roomId, limit, messageId)
			Qiscus.qiscus
				.getPreviousMessagesById(this.state.room.id, 20, lastMessageId)
				.then((moreMessages: IQMessage[]) => {
					this.addDebugLog('More messages loaded', { count: moreMessages.length });
					
					if (moreMessages.length === 0) {
						this.setState({ isLoadMoreable: false });
						return;
					}
					
					// Check if more messages available based on first message's previousMessageId
					const isLoadMoreable = moreMessages[0]?.previousMessageId > 0;

					// Convert messages to Record format
					const formattedMessages = moreMessages.reduce((result: Record<string, IQMessage>, msg: IQMessage) => {
						result[msg.uniqueId] = msg;
						return result;
					}, {});

					this.setState((state) => ({
						messages: {
							...formattedMessages,
							...state.messages,
						},
						isLoadMoreable,
					}));
				})
				.catch((error) => {
					this.handleError('_loadMore', error, false);
					this.setState({ isLoadMoreable: false });
				});
		} catch (error) {
			this.handleError('_loadMore outer', error);
		}
	};

	_sortMessage = (messages: IQMessage[]): IQMessage[] =>
		messages.filter(m => m && m.timestamp).sort((a, b) => {
			const aTime = a.timestamp instanceof Date ? a.timestamp.getTime() : a.timestamp;
			const bTime = b.timestamp instanceof Date ? b.timestamp.getTime() : b.timestamp;
			return aTime - bTime;
		});

	get isGroup(): boolean {
		if (this.state.room == null) {
			return false;
		}
		return this.state.room.type === 'group' || this.state.room.type === 'channel';
	}

	get participants(): string {
		const room = this.state.room;
		if (room == null || room.participants == null) {
			return '';
		}
		const limit = 3;
		const overflowCount = room.participants.length - limit;
		const participants = room.participants
			.slice(0, limit)
			.map((it) => it.name.split(' ')[0]);
		if (room.participants.length <= limit) {
			return participants.join(', ');
		}
		return participants.concat(`and ${overflowCount} others.`).join(', ');
	}

	get messages(): IQMessage[] {
		return this._sortMessage(Object.values(this.state.messages).filter(m => m != null));
	}

	_onSendingFileOrMedia = async (mediaOrDocs: FileSource): Promise<void> => {
		try {
			this.addDebugLog('Uploading file', { name: mediaOrDocs.name, type: mediaOrDocs.type });
			
			// Create temporary message for upload
			const tempMessage = this.generateMessage('File attachment: ' + mediaOrDocs.name);
			await this._addMessage({ ...tempMessage, status: 'sending' }, true);

			const obj = {
				uri: mediaOrDocs.uri,
				type: mediaOrDocs.type,
				name: mediaOrDocs.name,
			};

			Qiscus.qiscus.upload(obj as any, (error: any, progress: any, fileURL: string) => {
				if (error) {
					return console.log('[ChatScreen] Error uploading:', error);
				}
				if (progress) {
					return console.log('[ChatScreen] Upload progress:', progress.percent);
				}
				if (fileURL != null) {
					this.addDebugLog('File uploaded successfully', { url: fileURL });
					
					// Generate file attachment message using SDK method
					const fileMessage = this.generateFileMessage(
						mediaOrDocs.name,
						fileURL,
						mediaOrDocs.name
					);
					
					// Send the file message
					(async () => {
						try {
							const sentMessage = await Qiscus.qiscus.sendMessage(fileMessage);
							this.addDebugLog('File message sent', { id: sentMessage.id });
							this._updateMessage(tempMessage, sentMessage);
							toast('File sent successfully!');
						} catch (error) {
							this.handleError('sendFileMessage', error);
						}
					})();
				}
			});
		} catch (error) {
			console.log('[ChatScreen] Error sending file:', error);
		}
	};
}

const styles = StyleSheet.create({
	container: {
		display: 'flex',
		flex: 1,
		backgroundColor: '#fafafa',
	},
	onlineStatus: {},
	onlineStatusText: {
		fontSize: 12,
		color: '#94ca62',
	},
	typingText: {
		fontSize: 12,
		color: '#979797',
	},
	titleText: {
		fontSize: 16,
	},
	// Debug Panel Styles
	debugPanel: {
		position: 'absolute',
		bottom: 70,
		left: 10,
		right: 10,
		backgroundColor: 'rgba(0, 0, 0, 0.85)',
		borderRadius: 8,
		padding: 10,
		maxHeight: 200,
		zIndex: 1000,
	},
	loadingContainer: {
		flexDirection: 'row',
		alignItems: 'center',
		padding: 8,
		backgroundColor: 'rgba(0, 122, 255, 0.1)',
		borderRadius: 4,
		marginBottom: 8,
	},
	loadingText: {
		color: '#007AFF',
		marginLeft: 8,
		fontSize: 12,
		fontWeight: '600',
	},
	errorContainer: {
		padding: 8,
		backgroundColor: 'rgba(255, 59, 48, 0.1)',
		borderRadius: 4,
		marginBottom: 8,
	},
	errorTitle: {
		color: '#FF3B30',
		fontSize: 12,
		fontWeight: 'bold',
		marginBottom: 4,
	},
	errorText: {
		color: '#FF3B30',
		fontSize: 11,
		marginBottom: 8,
	},
	clearErrorButton: {
		alignSelf: 'flex-end',
		paddingHorizontal: 12,
		paddingVertical: 4,
		backgroundColor: '#FF3B30',
		borderRadius: 4,
	},
	clearErrorText: {
		color: '#FFFFFF',
		fontSize: 10,
		fontWeight: '600',
	},
	debugLogContainer: {
		maxHeight: 120,
	},
	debugTitle: {
		color: '#FFFFFF',
		fontSize: 11,
		fontWeight: 'bold',
		marginBottom: 6,
	},
	debugScroll: {
		maxHeight: 100,
	},
	debugLogText: {
		color: '#00FF00',
		fontSize: 9,
		fontFamily: 'Courier',
		marginBottom: 2,
	},
});
