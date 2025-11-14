/**
 * Application Constants
 * Centralized constants for timeouts, limits, and other magic numbers
 */

// Timing Constants
export const TIMING = {
  // Qiscus SDK initialization wait time
  QISCUS_INIT_DELAY: 300,
  
  // Typing indicator timeout
  TYPING_INDICATOR_TIMEOUT: 850,
  
  // Typing debounce delay
  TYPING_DEBOUNCE_DELAY: 300,
  
  // Message scroll animation delay
  MESSAGE_SCROLL_DELAY: 400,
  
  // Login check interval
  LOGIN_CHECK_INTERVAL: 300,
  
  // Login timeout
  LOGIN_TIMEOUT: 10000,
};

// File Upload Limits
export const FILE_LIMITS = {
  // Maximum file size for documents (in MB)
  MAX_DOCUMENT_SIZE_MB: 20,
  
  // Maximum file size for images/videos (in MB)
  MAX_MEDIA_SIZE_MB: 2,
  
  // Convert MB to bytes
  MB_TO_BYTES: 1024 * 1024,
};

// Supported File Types
export const SUPPORTED_FILE_TYPES = {
  IMAGES: ['png', 'jpg', 'jpeg', 'gif'],
  VIDEOS: {
    ANDROID: ['mp4'],
    IOS: ['mp4', 'mov'],
  },
  DOCUMENTS: [
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
    'apk',
  ],
};

// Message Status
export const MESSAGE_STATUS = {
  SENDING: 'sending',
  SENT: 'sent',
  DELIVERED: 'delivered',
  READ: 'read',
  FAILED: 'failed',
};

// Message Types
export const MESSAGE_TYPE = {
  TEXT: 'text',
  UPLOAD: 'upload',
  CUSTOM: 'custom',
  IMAGE: 'image',
};

// Room Types
export const ROOM_TYPE = {
  SINGLE: 'single',
  GROUP: 'group',
};

// UI Constants
export const UI = {
  // Maximum participants to show in group chat
  MAX_PARTICIPANTS_DISPLAY: 3,
};

export default {
  TIMING,
  FILE_LIMITS,
  SUPPORTED_FILE_TYPES,
  MESSAGE_STATUS,
  MESSAGE_TYPE,
  ROOM_TYPE,
  UI,
};
