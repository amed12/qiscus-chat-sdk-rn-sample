import React from 'react';
import {
	Button,
	Image, Modal,
	StatusBar,
	StyleSheet,
	Text,
	TouchableOpacity,
	View,
	SafeAreaView,
} from 'react-native';
import DocumentPicker, {
	isInProgress,
	types,
} from '@react-native-documents/picker';
import debounce from 'lodash/debounce';
import * as dateFns from 'date-fns';
import toast from 'utils/toast';

import * as Qiscus from 'qiscus';
import {qiscusEvents} from 'qiscus';
import Toolbar from 'components/Toolbar';
import MessageList from 'components/MessageList';
import Form from 'components/Form';
import Empty from 'components/EmptyChat';
import {getFileExtension, isImageFile, isUnSupportFileType, isVideoFile} from "../qiscus";
import * as ImagePicker from 'react-native-image-picker';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {multichannelApi} from '../qiscus/multichannelApi';

export default class ChatScreen extends React.Component {
	state = {
		room: null,
		messages: {},
		isLoadMoreable: true,
		isOnline: false,
		isTyping: false,
		lastOnline: null,
		typingUsername: null,
		isModalVisible: false
	};

	componentDidMount() {
		const roomId = this.props.route.params?.roomId ?? null;
		if (roomId == null) {
			return this.props.navigation.replace('RoomList');
		}
		
		// Load room and messages
		this.loadRoomData(roomId);
		
		// Setup event listeners
		this.setupEventListeners();
	}
	
	loadRoomData = async (roomId) => {
		try {
			if (!Qiscus.qiscus.isLogin || !Qiscus.qiscus.userData) {
				console.log('User not logged in');
				return;
			}
			
			// Load room
			const room = {id: roomId};
			this.setState({ room });
			// wait for qiscus ready on 3 seconds
			await new Promise(resolve => setTimeout(resolve, 300));
			
			// Load messages
			const messages = await Qiscus.qiscus.loadComments(roomId);
			const message = messages[0] || {};
			const isLoadMoreable = message.comment_before_id !== 0;
			const formattedMessages = messages.reduce((result, message) => {
				result[message.unique_temp_id] = message;
				return result;
			}, {});
			this.setState({
				messages: formattedMessages,
				isLoadMoreable,
			});
		} catch (error) {
			console.error('Error loading room data:', error);
		}
	};
	
	_handleLogout = async () => {
		try {
			console.log('[ChatScreen] Logging out...');
			
			// Clear session storage
			await multichannelApi.clearSession();
			
			// Clear user storage
			await AsyncStorage.removeItem('qiscus');
			
			// Clear Qiscus SDK
			if (Qiscus.qiscus.isLogin) {
				await Qiscus.qiscus.disconnect();
			}
			
			console.log('[ChatScreen] Logout successful');
			
			// Navigate to Login screen
			this.props.navigation.replace('Login');
		} catch (error) {
			console.error('[ChatScreen] Logout error:', error);
			toast('Failed to logout');
		}
	};
	
	setupEventListeners = () => {
		// Listen for new messages from Qiscus callbacks
		this.newMessageListener = qiscusEvents.on('new-messages', (messages) => {
			messages.forEach((message) => this._onNewMessage(message));
		});
		
		// Listen for message read
		this.readListener = qiscusEvents.on('comment-read', (data) => {
			this._onMessageRead(data);
		});
		
		// Listen for message delivered
		this.deliveredListener = qiscusEvents.on('comment-delivered', (data) => {
			this._onMessageDelivered(data);
		});
		
		// Listen for online presence
		this.presenceListener = qiscusEvents.on('presence', (data) => {
			this._onOnline(data);
		});
		
		// Listen for typing
		this.typingListener = qiscusEvents.on('typing', (data) => {
			if (this.state.room && Number(data.room_id) === this.state.room.id) {
				this._onTyping(data);
			}
		});
	}

	componentWillUnmount() {
		Qiscus.qiscus.exitChatRoom();
		
		// Remove event listeners
		if (this.newMessageListener) qiscusEvents.off('new-messages', this.newMessageListener);
		if (this.readListener) qiscusEvents.off('comment-read', this.readListener);
		if (this.deliveredListener) qiscusEvents.off('comment-delivered', this.deliveredListener);
		if (this.presenceListener) qiscusEvents.off('presence', this.presenceListener);
		if (this.typingListener) qiscusEvents.off('typing', this.typingListener);
	}

	render() {
		const { room, isTyping, isOnline, lastOnline, typingUsername } = this.state;
		const messages = this.messages;
		const roomName = room ? room.name : 'Chat';
		const avatarURL = room ? room.avatar : null;

		const showTyping = room != null && !this.isGroup && isTyping;

		return (
			<SafeAreaView
				style={styles.container}
				keyboardVerticalOffset={StatusBar.currentHeight}
				behavior="padding"
				enabled>
				<Toolbar
					title={<Text style={styles.titleText}>{roomName}</Text>}
					onPress={this._onToolbarClick}
					renderLeftButton={() => (
						<TouchableOpacity
							onPress={() => this.props.navigation.replace('RoomList')}
							style={{
								display: 'flex',
								flexDirection: 'row',
								flex: 0,
							}}>
							<Image
								source={require('assets/ic_back.png')}
								style={{
									width: 25,
									height: 25,
									resizeMode: 'contain',
								}}
							/>
							<Image
								source={{ uri: avatarURL }}
								style={{
									width: 25,
									height: 25,
									resizeMode: 'cover',
									borderRadius: 50,
									marginLeft: 10,
								}}
							/>
						</TouchableOpacity>
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
						isLoadMoreable={this.state.isLoadMoreable}
						messages={messages}
						scroll={this.state.scroll}
						onLoadMore={this._loadMore}
					/>
				)}

				<Modal visible={this.state.isModalVisible} animationType="slide">
					<View>
						<Text>Please select an option:</Text>
						<Button title="File" onPress={this._onSelectFile} />
						<Button title="Image" onPress={this._onSelectImage}/>
					</View>
				</Modal>

				<Form
					onSubmit={this._submitMessage}
					onSelectFile={this._onSelectModal}
				/>
			</SafeAreaView>
		);
	}

	_renderOnlineStatus = () => {
		const { isGroup } = this;
		const { isTyping, isOnline, lastOnline, room } = this.state;
		if (room == null) {
			return;
		}
		if (isGroup || isTyping) {
			return;
		}

		const lastOnlineText = dateFns.isSameDay(lastOnline, new Date())
			? dateFns.format(lastOnline, 'hh:mm')
			: '';

		return (
			<>
				{isOnline && <Text style={styles.onlineStatusText}>Online</Text>}
				{!isOnline && <Text style={styles.typingText}>{lastOnlineText}</Text>}
			</>
		);
	};

	_onTyping = debounce(({ username }) => {
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

	_onSelectModal = () => {
		this.setState(
			{
				isModalVisible: true,
			})
	};
	_onOnline = (data) => {
		this.setState({
			isOnline: data.isOnline,
			lastOnline: data.lastOnline,
		});
		return ['Online presence', data];
	};
	_onNewMessage = (message) => {
		console.log("halo")
		console.log(message)
		this.setState((state) => ({
			messages: {
				...state.messages,
				[message.unique_temp_id]: message,
			},
		}));
		return 'New message';
	};

	_onMessageRead = ({ comment }) => {
		toast('message read');
		// const date = new Date(comment.timestamp);
		const results = this.messages
			// .filter(it => new Date(it.timestamp) <= date)
			.filter((it) => it.timestamp <= comment.timestamp)
			.map((it) => ({ ...it, status: 'read' }));

		const messages = results.reduce((result, item) => {
			const uniqueId = item.unique_id || item.unique_temp_id;
			result[uniqueId] = item;
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

	_onMessageDelivered = ({ comment }) => {
		toast('message delivered');

		const results = this.messages
			.filter((it) => it.timestamp <= comment.timestamp && it.status !== 'read')
			.map((it) => ({ ...it, status: 'delivered' }));

		const messages = results.reduce((result, item) => {
			const uniqueId = item.unique_id || item.unique_temp_id;
			result[uniqueId] = item;
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

	_prepareMessage = (message) => {
		const date = new Date();
		return {
			id: date.getTime(),
			uniqueId: '' + date.getTime(),
			unique_temp_id: '' + date.getTime(),
			timestamp: date.getTime(),
			type: 'text',
			status: 'sending',
			message: message,
			email: Qiscus.currentUser().email,
		};
	};

	_prepareFileMessage = (message, fileURI) => {
		return {
			...this._prepareMessage(message),
			type: 'upload',
			fileURI,
		};
	};

	_submitMessage = async (text) => {
		const message = this._prepareMessage(text);
		await this._addMessage(message, true);
		const resp = await Qiscus.qiscus.sendComment(
			this.state.room.id,
			text,
			message.unique_temp_id
		);
		this._updateMessage(message, resp);
		toast('Success sending message!');
	};

	_handleError = (err) => {
		if (DocumentPicker.isCancel(err)) {
			console.warn('cancelled');
			// User cancelled the picker, exit any dialogs or menus and move on
		} else if (isInProgress(err)) {
			console.warn(
				'multiple pickers were opened, only the last will be considered'
			);
		} else {
			throw err;
		}
	};

	_onSelectFile = () => {
		this.setState(
			{
				isModalVisible: false,
			});
		DocumentPicker.pick({
			allowMultiSelection: true,
			type: [types.allFiles],
		})
			.then((resp) => {
				resp.map((responses)=> {
					let fileName = responses.name;
					if (!fileName) {
						const _fileName = responses.uri.split('/').pop();
						const _fileType = responses.type
							? responses.type.split('/').pop()
							: 'jpeg';
						fileName = `${_fileName}.${_fileType}`;
					}
					const source = {
						uri: responses.uri,
						name: fileName,
						type: responses.type,
						size: responses.size,
					};
					if (isUnSupportFileType(source?.name)) {
						return Promise.reject('File not supported');
					}
					let sizeInMB = parseFloat((source.size / (1024 * 1024)).toFixed(2));
					if (isNaN(sizeInMB)) {
						return Promise.reject('File size required');
					}
					if (!(sizeInMB <= 20)) {
						return Promise.reject('File size over');
					}
					this._onSendingFileOrMedia(source)
				})
			})
			.catch(this._handleError);
	};

	_onSelectImage = () => {
		this.setState(
			{
				isModalVisible: false,
			});
		ImagePicker.launchImageLibrary(
			{
				mediaType: "mixed",
				includeBase64: false,
				selectionLimit: 0,
				includeExtra: true
			},
			null,
		).then((resp) => {
			if (resp.didCancel) return console.log('user cancel');
			if (resp.errorMessage)
				return console.log('error when getting file', resp.errorMessage);
			resp.assets.map((responses) => {
				let fileName;
				if (!fileName) {
					const _fileName = responses.uri.split('/').pop();
					const _fileType = responses.type
						? responses.type.split('/').pop()
						: 'jpeg';
					fileName = `${_fileName}.${_fileType}`;
				}
				const source = {
					uri: responses.uri,
					name: fileName,
					type: responses.type,
					size: responses.fileSize,
				};
				let sizeInMB = parseFloat((source.size / (1024 * 1024)).toFixed(2));
				if (isNaN(sizeInMB) || sizeInMB === 0) {
					return Promise.reject('File size required or empty');
				}
				if (!(sizeInMB <= 2)) {
					// Example limitation
					return Promise.reject('File size cannot over from 2mb and cannot empty');
				}
				this._onSendingFileOrMedia(source)
			})
		}).catch(this._handleError);
	};

	_addMessage = (message, scroll = false) =>
		new Promise((resolve) => {
			this.setState(
				(state) => ({
					messages: {
						...state.messages,
						[message.unique_temp_id]: message,
					},
					scroll,
				}),
				() => {
					if (scroll === false) {
						return;
					}
					const timeoutId = setTimeout(() => {
						this.setState({ scroll: false }, () => {
							clearTimeout(timeoutId);
							resolve();
						});
					}, 400);
				}
			);
		});

	_updateMessage = (message, newMessage) => {
		this.setState((state) => ({
			messages: {
				...state.messages,
				[message.unique_temp_id]: newMessage,
			},
		}));
	};

	_loadMore = () => {
		if (!this.state.isLoadMoreable) {
			return;
		}
		const roomId = this.props.route.params?.roomId ?? null;
		if (roomId == null) {
			return;
		}

		const lastCommentId = this.messages[0].id;
		toast(`Loading more message ${lastCommentId}`);

		Qiscus.qiscus
			.loadComments(roomId, { last_comment_id: lastCommentId })
			.then((messages) => {
				toast('Done loading message');
				const isLoadMoreable = messages[0].comment_before_id !== 0;
				this.setState((state) => ({
					messages: {
						...state.messages,
						...messages.reduce(
							(result, item) => ((result[item.unique_temp_id] = item), result),
							{}
						),
					},
					isLoadMoreable,
				}));
			})
			.catch((error) => console.log('Error when loading more comment', error));
	};

	_sortMessage = (messages) =>
		messages.sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));

	_onToolbarClick = () => {
		const roomId = this.state.room.id;
		this.props.navigation.navigate('RoomInfo', { roomId });
	};

	get isGroup() {
		if (this.state.room == null || this.state.room.room_type == null) {
			return false;
		}
		return this.state.room.room_type === 'group';
	}

	get participants() {
		const room = this.state.room;
		if (room == null || room.participants == null) {
			return;
		}
		const limit = 3;
		const overflowCount = room.participants.length - limit;
		const participants = room.participants
			.slice(0, limit)
			.map((it) => it.username.split(' ')[0]);
		if (room.participants.length <= limit) {
			return participants.join(', ');
		}
		return participants.concat(`and ${overflowCount} others.`).join(', ');
	}

	get messages() {
		return this._sortMessage(Object.values(this.state.messages));
	}

	_onSendingFileOrMedia(mediaOrDocs) {
		const message = this._prepareFileMessage('File attachment '+getFileExtension(mediaOrDocs.name), mediaOrDocs.uri);
		this._addMessage(message, true)
			.then(() => {
				const obj = {
					uri: mediaOrDocs.uri,
					type: mediaOrDocs.type,
					name: mediaOrDocs.name,
				};
				return Qiscus.qiscus.upload(obj, (error, progress, fileURL) => {
					if (error) {
						return console.log('error when uploading', error);
					}
					if (progress) {
						return console.log(progress.percent);
					}
					if (fileURL != null) {
						const payload = JSON.stringify({
							type: isImageFile(mediaOrDocs.name) || isVideoFile(mediaOrDocs.name) ? 'image' : mediaOrDocs.type,
							content: {
								url: fileURL,
								file_name: mediaOrDocs.name,
								caption: '',
							},
						});
						Qiscus.qiscus
							.sendComment(
								this.state.room.id,
								message.message,
								message.uniqueId,
								'custom', // message type
								payload,
							)
							.then((resp) => {
								this._updateMessage(message, resp);
							});
					}
				});
			})
			.catch((error) => {
				console.log('Catch me if you can', error);
			});
	}

}

const styles = StyleSheet.create({
	container: {
		display: 'flex',
		alignItems: 'center',
		backgroundColor: '#fafafa',
		height: '100%',
		width: '100%',
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
});
