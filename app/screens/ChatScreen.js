import React from 'react';
import {Button, Image, Modal, StatusBar, StyleSheet, Text, TouchableOpacity, View,} from 'react-native';
import DocumentPicker, {isInProgress, types,} from 'react-native-document-picker';
import css from 'css-to-rn.macro';
import debounce from 'lodash.debounce';
import xs from 'xstream';
import * as dateFns from 'date-fns';
import toast from 'utils/toast';

import * as Qiscus from 'qiscus';
import Toolbar from 'components/Toolbar';
import MessageList from 'components/MessageList';
import Form from 'components/Form';
import Empty from 'components/EmptyChat';
import {getFileExtension, isImageFile, isUnSupportFileType, isVideoFile, uploadAttachment} from "../qiscus";
import * as ImagePicker from 'react-native-image-picker';
import RNFetchBlob from "rn-fetch-blob";

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
		const roomId = this.props.navigation.getParam('roomId', null);
		if (roomId == null) {
			return this.props.navigation.replace('RoomList');
		}
		const subscription1 = Qiscus.isLogin$()
			.take(1)
			.map(() => xs.from(Qiscus.qiscus?.getRoomById(roomId)))
			.flatten()
			.subscribe({
				next: (room) => this.setState({ room }),
			});
		const subscription2 = Qiscus.isLogin$()
			.take(1)
			.map(() => xs.from(Qiscus.qiscus?.loadComments(roomId)))
			.flatten()
			.subscribe({
				next: (messages) => {
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
				},
			});

		this.subscription = xs
			.merge(
				Qiscus.newMessage$().map(this._onNewMessage),
				Qiscus.messageRead$().map(this._onMessageRead),
				Qiscus.messageDelivered$().map(this._onMessageDelivered),
				Qiscus.onlinePresence$().map(this._onOnline),
				Qiscus.typing$()
					.filter((it) => Number(it.room_id) === this.state.room.id)
					.map(this._onTyping)
			)
			.subscribe({
				next: () => {},
				error: (error) => console.log('subscription error', error),
			});
	}

	componentWillUnmount() {
		Qiscus.qiscus?.exitChatRoom();

		this.subscription && this.subscription.unsubscribe();
	}

	render() {
		const { room, isTyping, isOnline, lastOnline, typingUsername } = this.state;
		const messages = this.messages;
		const roomName = room ? room.name : 'Chat';
		const avatarURL = room ? room.avatar : null;

		const showTyping = room != null && !this.isGroup && isTyping;

		return (
			<View
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
			</View>
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
		const resp = await Qiscus.qiscus?.sendComment(
			this.state.room.id,
			text,
			message.unique_temp_id
		);
		this._updateMessage(message, resp);
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
		const options = {
			title: 'Select Image',
			storageOptions: {
				skipBackup: true,
				path: 'images'
			},
		};
		ImagePicker.showImagePicker(options,(resp) => {
				console.log('masuk then', resp);
				if (resp.didCancel) return console.log('user cancel');

				let fileName;
				if (!fileName) {
					const _fileName = resp.uri.split('/').pop();
					const _fileType = resp.type
						? resp.type.split('/').pop()
						: 'jpeg';
					fileName = `${_fileName}.${_fileType}`;
				}
				const source = {
					uri: resp.uri,
					name: fileName,
					type: resp.type,
					size: resp.fileSize,
				};
				let sizeInMB = parseFloat((source.size / (1024 * 1024)).toFixed(2));
				console.log("ini image", source, sizeInMB, fileName)
				if (isNaN(sizeInMB) || sizeInMB === 0) {
					return Promise.reject('File size required or empty');
				}
				if (!(sizeInMB <= 2)) {
					// Example limitation
					return Promise.reject('File size cannot over from 2mb and cannot empty');
				}
				this._onSendingFileOrMedia(source)
			}
		)
	}
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

	_generateCurlCommand = (baseUrl, headers, payload) => {
		const headersString = Object.keys(headers)
			.map(key => `-H '${key}: ${headers[key]}'`)
			.join(' ');
		return `curl --location --request POST '${baseUrl}' ${headersString} \
--form 'file=@"${payload.filePath}"' \
--form 'name="${payload.name}"' \
--form 'type="${payload.type}"'`;
	};
	_uploadMessage = (file) =>
		new Promise(async (resolve, reject) => {
			/*
			Qiscus.qiscus.upload(file, (error, progress, fileURL) => {
				if (error) {
					return console.log('error when uploading', error);
				}
				if (progress) {
					return console.log(progress.percent);
				}
				if (fileURL != null) {
					resolve({
						url: fileURL
					})
				}else {
					reject("Upload failed")
				}
			})
			 */
			let tokenSdk = Qiscus.qiscus?.userData?.token;
			let appId = Qiscus.qiscus?.AppId;
			let userId = Qiscus.qiscus?.user_id;
			let version = Qiscus.qiscus?.version;
			const headerUpload = {
				'qiscus_sdk_app_id': appId,
				'qiscus_sdk_user_id': userId,
				'qiscus_sdk_token': tokenSdk,
				'qiscus_chat_version': version,
				'Content-Type': 'multipart/form-data'
			};
			console.log("Please inform curl below!!");
			console.log(this._generateCurlCommand(uploadAttachment(Qiscus.qiscus?.baseURL), headerUpload, {
				name : file.name,
				type : file.type,
				filePath : file.uri
			}));
			try {
				const response = await RNFetchBlob.fetch(
					'POST',
					`${uploadAttachment(Qiscus.qiscus?.baseURL)}`,
					 headerUpload,
					[
						{
							name: 'file',
							filename: file.name,
							type: file.type,
							data: RNFetchBlob.wrap(file.uri),
						},
					]
				);

				let responseJson = await response.json();

				if (responseJson.status === 200) {
					console.log('Upload response:', responseJson);
					resolve(responseJson.results.file)
				}else {
					reject(responseJson)
				}
			} catch (error) {
				console.error('Upload error:', error);
			}
		});

	_loadMore = () => {
		if (!this.state.isLoadMoreable) {
			return;
		}
		const roomId = this.props.navigation.getParam('roomId', null);
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
				return this._uploadMessage(obj)
			})
			.then(res =>{
				if (res.url) {
					const payload = JSON.stringify({
						type: isImageFile(mediaOrDocs.name) || isVideoFile(mediaOrDocs.name) ? 'image' : mediaOrDocs.type,
						content: {
							url: res.url,
							file_name: mediaOrDocs.name,
							caption: '',
						},
					});
					Qiscus.qiscus?.sendComment(
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
			})
			.catch((error) => {
				console.log('Catch me if you can', error);
			});
	}

}

const styles = StyleSheet.create(css`
	.container {
		display: flex;
		align-items: center;
		background-color: #fafafa;
		height: 100%;
		width: 100%;
	}
	.onlineStatus {
	}
	.onlineStatusText {
		font-size: 12px;
		color: #94ca62;
	}
	.typingText {
		font-size: 12px;
		color: #979797;
	}
	.titleText {
		font-size: 16px;
	}
`);
