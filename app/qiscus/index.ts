import QiscusSDK from 'qiscus-sdk-javascript';
import type * as QiscusTypes from 'qiscus-sdk-javascript/types/model';
import type { Subscription } from 'qiscus-sdk-javascript/types/defs';
import { Platform } from 'react-native';
import EventEmitter from 'eventemitter3';
import { APP_CONFIG } from '../config/appConfig';

// Initialize Qiscus SDK instance
export const qiscus = new QiscusSDK();

// Create event emitter to bridge Qiscus events to components
export const qiscusEvents = new EventEmitter();

// File type helpers
export const getFileExtension = (name?: string): string => {
  if (!name) return '';
  return name.slice((Math.max(0, name.lastIndexOf('.')) || Infinity) + 1);
};

// Supported file types
export const SupportImageType = ['png', 'jpg', 'jpeg', 'gif'];
export const SupportVideoType = Platform.OS === 'android' ? ['mp4'] : ['mp4', 'mov'];
export const SupportDocumentType = [
  'doc', 'docx', 'xls', 'xlsx', 'ppt', 'pptx',
  'odp', 'ods', 'odt', 'pdf', 'apk'
];

export const isImageFile = (name?: string): boolean => {
  return SupportImageType.includes(getFileExtension(name?.toLowerCase()));
};

export const isVideoFile = (name?: string): boolean => {
  return SupportVideoType.includes(getFileExtension(name?.toLowerCase()));
};

export const isUnSupportFileType = (name?: string): boolean => {
  return !SupportImageType
    .concat(SupportVideoType, SupportDocumentType)
    .includes(getFileExtension(name?.toLowerCase()));
};

// Event subscriptions storage
let messageReceivedSubscription: Subscription | null = null;
let messageDeliveredSubscription: Subscription | null = null;
let messageReadSubscription: Subscription | null = null;
let userTypingSubscription: Subscription | null = null;
let userPresenceSubscription: Subscription | null = null;

/**
 * Initialize Qiscus SDK with v3 API
 */
export async function init(): Promise<void> {
  console.log('[Qiscus] Initializing SDK v3...');
  
  try {
    // Setup SDK (v3: init -> setup)
    await qiscus.setup(APP_CONFIG.qiscus.appId);
    
    console.log('[Qiscus] SDK initialized successfully');
    
    // Setup event handlers
    setupEventHandlers();
    
  } catch (error) {
    console.error('[Qiscus] Failed to initialize SDK:', error);
    throw error;
  }
}

/**
 * Setup event handlers for realtime events
 */
function setupEventHandlers(): void {
  // Message received handler
  messageReceivedSubscription = qiscus.onMessageReceived((message: QiscusTypes.IQMessage) => {
    console.log('[Qiscus] Message received:', message);
    qiscusEvents.emit('new-messages', [message]);
  });

  // Message delivered handler
  messageDeliveredSubscription = qiscus.onMessageDelivered((message: QiscusTypes.IQMessage) => {
    console.log('[Qiscus] Message delivered:', message);
    qiscusEvents.emit('comment-delivered', { comment: message });
  });

  // Message read handler
  messageReadSubscription = qiscus.onMessageRead((message: QiscusTypes.IQMessage) => {
    console.log('[Qiscus] Message read:', message);
    qiscusEvents.emit('comment-read', { comment: message });
  });

  // User typing handler
  userTypingSubscription = qiscus.onUserTyping((userId: string, roomId: number, isTyping: boolean) => {
    console.log('[Qiscus] User typing:', { userId, roomId, isTyping });
    qiscusEvents.emit('typing', { userId, roomId, isTyping });
  });

  // User presence handler
  userPresenceSubscription = qiscus.onUserOnlinePresence((userId: string, isOnline: boolean, lastSeen: Date) => {
    console.log('[Qiscus] User presence:', { userId, isOnline, lastSeen });
    qiscusEvents.emit('presence', { isOnline, lastOnline: lastSeen });
  });
}

/**
 * Cleanup event subscriptions
 */
export function cleanup(): void {
  if (messageReceivedSubscription) messageReceivedSubscription();
  if (messageDeliveredSubscription) messageDeliveredSubscription();
  if (messageReadSubscription) messageReadSubscription();
  if (userTypingSubscription) userTypingSubscription();
  if (userPresenceSubscription) userPresenceSubscription();
}

/**
 * Get current user data (v3: use getUserData method)
 */
export async function currentUser(): Promise<QiscusTypes.IQAccount | null> {
  try {
    return await qiscus.getUserData();
  } catch (error) {
    console.error('[Qiscus] Failed to get user data:', error);
    return null;
  }
}

/**
 * Register device token for push notifications
 */
export async function setDeviceToken(token: string): Promise<boolean> {
  console.log('[Qiscus] Registering device token:', token);
  
  try {
    const isDevelopment = __DEV__;
    const result = await qiscus.registerDeviceToken(token, isDevelopment);
    console.log('[Qiscus] Device token registered:', result);
    return result;
  } catch (error) {
    console.error('[Qiscus] Failed to register device token:', error);
    throw error;
  }
}

/**
 * Check if user is logged in (v3: isLogin -> hasSetupUser)
 */
export async function isUserLoggedIn(): Promise<boolean> {
  try {
    return await qiscus.hasSetupUser();
  } catch (error) {
    console.error('[Qiscus] Failed to check user status:', error);
    return false;
  }
}

/**
 * Wait for user to be logged in
 */
export const waitForLogin = (): Promise<boolean> => {
  return new Promise(async (resolve) => {
    const isLoggedIn = await isUserLoggedIn();
    if (isLoggedIn) {
      resolve(true);
      return;
    }
    
    const checkInterval = setInterval(async () => {
      const loggedIn = await isUserLoggedIn();
      if (loggedIn) {
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

// Export QiscusSDK instance and types
export { QiscusSDK };
export type { 
  IQMessage, 
  IQAccount, 
  IQChatRoom, 
  IQUser, 
  IQParticipant 
} from 'qiscus-sdk-javascript/types/model';
