/**
 * Message Utilities Tests
 */
import {
  updateMessageStatus,
  prepareTextMessage,
  prepareFileMessage,
  sortMessagesByTimestamp,
  messagesToSortedArray,
  upsertMessage,
  mergeMessages,
  createFileMessagePayload,
} from '../../app/utils/messageUtils';
import { MESSAGE_STATUS } from '../../app/config/constants';

describe('messageUtils', () => {
  describe('updateMessageStatus', () => {
    const mockMessages = [
      { unique_temp_id: '1', timestamp: 1000, status: 'sent' },
      { unique_temp_id: '2', timestamp: 2000, status: 'sent' },
      { unique_temp_id: '3', timestamp: 3000, status: 'sent' },
    ];

    it('should update messages with timestamp <= comment timestamp', () => {
      const comment = { timestamp: 2000 };
      const result = updateMessageStatus(mockMessages, comment, MESSAGE_STATUS.DELIVERED);
      
      expect(result['1'].status).toBe(MESSAGE_STATUS.DELIVERED);
      expect(result['2'].status).toBe(MESSAGE_STATUS.DELIVERED);
      expect(result['3']).toBeUndefined(); // Not updated
    });

    it('should not downgrade status from read to delivered', () => {
      const messagesWithRead = [
        { unique_temp_id: '1', timestamp: 1000, status: MESSAGE_STATUS.READ },
        { unique_temp_id: '2', timestamp: 2000, status: MESSAGE_STATUS.SENT },
      ];
      const comment = { timestamp: 2000 };
      const result = updateMessageStatus(messagesWithRead, comment, MESSAGE_STATUS.DELIVERED);
      
      expect(result['1']).toBeUndefined(); // Not downgraded
      expect(result['2'].status).toBe(MESSAGE_STATUS.DELIVERED);
    });
  });

  describe('prepareTextMessage', () => {
    it('should create text message object', () => {
      const message = prepareTextMessage('Hello', 'user@example.com');
      
      expect(message).toHaveProperty('id');
      expect(message).toHaveProperty('unique_temp_id');
      expect(message.type).toBe('text');
      expect(message.status).toBe(MESSAGE_STATUS.SENDING);
      expect(message.message).toBe('Hello');
      expect(message.email).toBe('user@example.com');
    });

    it('should generate unique IDs based on timestamp', async () => {
      const msg1 = prepareTextMessage('Test 1', 'user@example.com');
      // Wait 1ms to ensure different timestamp
      await new Promise(resolve => setTimeout(resolve, 1));
      const msg2 = prepareTextMessage('Test 2', 'user@example.com');
      
      expect(msg1.unique_temp_id).not.toBe(msg2.unique_temp_id);
    });
  });

  describe('prepareFileMessage', () => {
    it('should create file message object', () => {
      const message = prepareFileMessage('File attachment', 'file://test.jpg', 'user@example.com');
      
      expect(message.type).toBe('upload');
      expect(message.fileURI).toBe('file://test.jpg');
      expect(message.message).toBe('File attachment');
    });
  });

  describe('sortMessagesByTimestamp', () => {
    it('should sort messages in ascending order', () => {
      const messages = [
        { timestamp: 3000 },
        { timestamp: 1000 },
        { timestamp: 2000 },
      ];
      
      const sorted = sortMessagesByTimestamp(messages);
      
      expect(sorted[0].timestamp).toBe(1000);
      expect(sorted[1].timestamp).toBe(2000);
      expect(sorted[2].timestamp).toBe(3000);
    });
  });

  describe('messagesToSortedArray', () => {
    it('should convert object to sorted array', () => {
      const messagesObject = {
        'id3': { unique_temp_id: 'id3', timestamp: 3000 },
        'id1': { unique_temp_id: 'id1', timestamp: 1000 },
        'id2': { unique_temp_id: 'id2', timestamp: 2000 },
      };
      
      const result = messagesToSortedArray(messagesObject);
      
      expect(result).toHaveLength(3);
      expect(result[0].timestamp).toBe(1000);
      expect(result[2].timestamp).toBe(3000);
    });
  });

  describe('upsertMessage', () => {
    it('should add new message', () => {
      const messagesObject = {};
      const message = { unique_temp_id: '1', text: 'Hello' };
      
      const result = upsertMessage(messagesObject, message);
      
      expect(result['1']).toEqual(message);
    });

    it('should update existing message', () => {
      const messagesObject = {
        '1': { unique_temp_id: '1', text: 'Hello', status: 'sending' },
      };
      const updatedMessage = { unique_temp_id: '1', text: 'Hello', status: 'sent' };
      
      const result = upsertMessage(messagesObject, updatedMessage);
      
      expect(result['1'].status).toBe('sent');
    });
  });

  describe('mergeMessages', () => {
    it('should merge new messages into existing object', () => {
      const messagesObject = {
        '1': { unique_temp_id: '1', text: 'First' },
      };
      const newMessages = [
        { unique_temp_id: '2', text: 'Second' },
        { unique_temp_id: '3', text: 'Third' },
      ];
      
      const result = mergeMessages(messagesObject, newMessages);
      
      expect(Object.keys(result)).toHaveLength(3);
      expect(result['2'].text).toBe('Second');
      expect(result['3'].text).toBe('Third');
    });
  });

  describe('createFileMessagePayload', () => {
    it('should create JSON payload for file message', () => {
      const payload = createFileMessagePayload(
        'https://example.com/file.jpg',
        'file.jpg',
        'image',
        'Test caption'
      );
      
      const parsed = JSON.parse(payload);
      
      expect(parsed.type).toBe('image');
      expect(parsed.content.url).toBe('https://example.com/file.jpg');
      expect(parsed.content.file_name).toBe('file.jpg');
      expect(parsed.content.caption).toBe('Test caption');
    });

    it('should handle empty caption', () => {
      const payload = createFileMessagePayload(
        'https://example.com/file.pdf',
        'file.pdf',
        'file'
      );
      
      const parsed = JSON.parse(payload);
      
      expect(parsed.content.caption).toBe('');
    });
  });
});
