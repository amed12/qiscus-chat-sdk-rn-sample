import QiscusSDK from 'qiscus-sdk-core';
import { Platform } from 'react-native';
import EventEmitter from 'eventemitter3';
import { APP_CONFIG } from '../config/appConfig';

export const qiscus = new QiscusSDK();

// Create event emitter to bridge Qiscus callbacks to components
export const qiscusEvents = new EventEmitter();
export const getFileExtension = (name) =>
	name?.slice((Math.max(0, name.lastIndexOf('.')) || Infinity) + 1);
/*
Just Example for limit type of media file (image or video) , in Qiscus we support all type
 */
export let SupportImageType = ['png', 'jpg', 'jpeg', 'gif'];
export let SupportVideoType =
	Platform.OS === 'android' ? ['mp4'] : ['mp4', 'mov'];

export const isImageFile = (name) => {
	return SupportImageType.includes(getFileExtension(name?.toLowerCase()));
}

export const isVideoFile = (name) => SupportVideoType.includes(getFileExtension(name?.toLowerCase()))

/*
Just Example for limit type of attachment file, in Qiscus we support all type
 */
export let SupportDocumentType = [
	'doc',
	'docx',
	'xls',
	'xlsx',
	'ppt',
	'pptx',
	'odp',
	'ods',
	'odt',
	'pdf',
	'apk'
];

/*
Just Example for limit supported file, in Qiscus we support all type
 */
export const isUnSupportFileType = (name) =>
	!SupportImageType.concat(SupportVideoType, SupportDocumentType).includes(
		getFileExtension(name?.toLowerCase())
	);

export function init() {
	console.log('initiate qiscus');
	qiscus.init({
		AppId: APP_CONFIG.qiscus.appId,
		options: {
			loginSuccessCallback(authData) {
				console.log('Login success:', authData);
				qiscusEvents.emit('login-success', authData);
			},
			newMessagesCallback(messages) {
				console.log('New messages:', messages);
				qiscusEvents.emit('new-messages', messages);
			},
			presenceCallback(data) {
				const parts = data.split(':');
				const isOnline = parts[0] === '1';
				const lastOnline = new Date(Number(parts[1]));
				console.log('Presence:', { isOnline, lastOnline });
				qiscusEvents.emit('presence', { isOnline, lastOnline });
			},
			commentReadCallback: (data) => {
				console.log('Comment read:', data);
				qiscusEvents.emit('comment-read', data);
			},
			commentDeliveredCallback(data) {
				console.log('Comment delivered:', data);
				qiscusEvents.emit('comment-delivered', data);
			},
			typingCallback(data) {
				console.log('Typing:', data);
				qiscusEvents.emit('typing', data);
			},
			chatRoomCreatedCallback(data) {
				console.log('Chat room created:', data);
				qiscusEvents.emit('chat-room-created', data);
			},
		},
	});
	qiscus.debugMode = true;
}

export const currentUser = () => qiscus.userData;

export function setDeviceToken(token) {
	console.log('qiscus.isLogin', qiscus.isLogin);
	console.log('qiscus.userData', qiscus.userData);
	console.log('data qiscus token', token);

	return qiscus.registerDeviceToken(token);
}

// Helper function to wait for login
export const waitForLogin = () => {
	return new Promise((resolve) => {
		if (qiscus.isLogin) {
			resolve(true);
			return;
		}
		
		const checkInterval = setInterval(() => {
			if (qiscus.isLogin) {
				clearInterval(checkInterval);
				resolve(true);
			}
		}, 300);
		
		// Timeout after 10 seconds
		setTimeout(() => {
			clearInterval(checkInterval);
			resolve(false);
		}, 10000);
	});
};
