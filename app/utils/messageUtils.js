/**
 * Message Handling Utilities
 * Reduces code duplication in message status updates
 */
import { MESSAGE_STATUS } from '../config/constants';

/**
 * Update messages with new status based on timestamp
 * @param {Array} messages - Current messages array
 * @param {Object} comment - Comment object with timestamp
 * @param {string} newStatus - New status to set
 * @returns {Object} Updated messages object keyed by unique_id
 */
export const updateMessageStatus = (messages, comment, newStatus) => {
  const results = messages
    .filter((msg) => {
      // Only update messages up to the comment timestamp
      return msg.timestamp <= comment.timestamp;
    })
    .filter((msg) => {
      // Don't downgrade status (read > delivered > sent)
      if (newStatus === MESSAGE_STATUS.DELIVERED && msg.status === MESSAGE_STATUS.READ) {
        return false;
      }
      return true;
    })
    .map((msg) => ({
      ...msg,
      status: newStatus,
    }));

  // Convert array to object keyed by unique_id
  return results.reduce((result, item) => {
    const uniqueId = item.unique_id || item.unique_temp_id;
    result[uniqueId] = item;
    return result;
  }, {});
};

/**
 * Prepare a new text message object
 * @param {string} text - Message text
 * @param {string} userEmail - Current user email
 * @returns {Object} Message object
 */
export const prepareTextMessage = (text, userEmail) => {
  const date = new Date();
  return {
    id: date.getTime(),
    uniqueId: '' + date.getTime(),
    unique_temp_id: '' + date.getTime(),
    timestamp: date.getTime(),
    type: 'text',
    status: MESSAGE_STATUS.SENDING,
    message: text,
    email: userEmail,
  };
};

/**
 * Prepare a file/media message object
 * @param {string} message - Message text/caption
 * @param {string} fileURI - File URI
 * @param {string} userEmail - Current user email
 * @returns {Object} Message object
 */
export const prepareFileMessage = (message, fileURI, userEmail) => {
  return {
    ...prepareTextMessage(message, userEmail),
    type: 'upload',
    fileURI,
  };
};

/**
 * Sort messages by timestamp (ascending)
 * @param {Array} messages - Messages array
 * @returns {Array} Sorted messages
 */
export const sortMessagesByTimestamp = (messages) => {
  return messages.sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));
};

/**
 * Convert messages object to sorted array
 * @param {Object} messagesObject - Messages keyed by unique_id
 * @returns {Array} Sorted messages array
 */
export const messagesToSortedArray = (messagesObject) => {
  const messagesArray = Object.values(messagesObject);
  return sortMessagesByTimestamp(messagesArray);
};

/**
 * Add or update a message in messages object
 * @param {Object} messagesObject - Current messages object
 * @param {Object} message - Message to add/update
 * @returns {Object} Updated messages object
 */
export const upsertMessage = (messagesObject, message) => {
  return {
    ...messagesObject,
    [message.unique_temp_id]: message,
  };
};

/**
 * Merge multiple messages into messages object
 * @param {Object} messagesObject - Current messages object
 * @param {Array} newMessages - Array of new messages
 * @returns {Object} Updated messages object
 */
export const mergeMessages = (messagesObject, newMessages) => {
  const newMessagesObject = newMessages.reduce((result, message) => {
    result[message.unique_temp_id] = message;
    return result;
  }, {});

  return {
    ...messagesObject,
    ...newMessagesObject,
  };
};

/**
 * Create message payload for file upload
 * @param {string} fileURL - Uploaded file URL
 * @param {string} fileName - File name
 * @param {string} contentType - Content type ('image' or 'file')
 * @param {string} caption - Optional caption
 * @returns {string} JSON stringified payload
 */
export const createFileMessagePayload = (fileURL, fileName, contentType, caption = '') => {
  return JSON.stringify({
    type: contentType,
    content: {
      url: fileURL,
      file_name: fileName,
      caption,
    },
  });
};

export default {
  updateMessageStatus,
  prepareTextMessage,
  prepareFileMessage,
  sortMessagesByTimestamp,
  messagesToSortedArray,
  upsertMessage,
  mergeMessages,
  createFileMessagePayload,
};
