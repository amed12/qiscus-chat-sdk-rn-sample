/**
 * Multichannel API Tests
 */
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import { multichannelApi } from '../../app/qiscus/multichannelApi';
import * as Qiscus from '../../app/qiscus';

// Mock dependencies
jest.mock('axios');
jest.mock('@react-native-async-storage/async-storage');
jest.mock('../../app/qiscus', () => ({
  qiscus: {
    getNonce: jest.fn(),
    verifyIdentityToken: jest.fn(),
    setUserWithIdentityToken: jest.fn(),
    isLogin: true,
    userData: { email: 'test@example.com' },
  },
}));

describe('multichannelApi', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('authenticateWithToken', () => {
    it('should authenticate user successfully', async () => {
      const userData = { user: { email: 'test@example.com' } };
      Qiscus.qiscus.setUserWithIdentityToken.mockResolvedValue();

      const result = await multichannelApi.authenticateWithToken(userData);

      expect(result).toBe(true);
      expect(Qiscus.qiscus.setUserWithIdentityToken).toHaveBeenCalledWith(userData);
    });

    it('should return false on authentication failure', async () => {
      const userData = { user: { email: 'test@example.com' } };
      Qiscus.qiscus.setUserWithIdentityToken.mockRejectedValue(new Error('Auth failed'));

      const result = await multichannelApi.authenticateWithToken(userData);

      expect(result).toBe(false);
    });
  });

  describe('checkSessional', () => {
    it('should return true for sessional app', async () => {
      axios.get.mockResolvedValue({
        data: { data: { is_sessional: true } },
      });

      const result = await multichannelApi.checkSessional('test-app-id');

      expect(result).toBe(true);
    });

    it('should return false for non-sessional app', async () => {
      axios.get.mockResolvedValue({
        data: { data: { is_sessional: false } },
      });

      const result = await multichannelApi.checkSessional('test-app-id');

      expect(result).toBe(false);
    });

    it('should default to false on API error', async () => {
      axios.get.mockRejectedValue(new Error('API error'));

      const result = await multichannelApi.checkSessional('test-app-id');

      expect(result).toBe(false);
    });
  });

  describe('saveSession', () => {
    it('should save session to AsyncStorage', async () => {
      AsyncStorage.multiSet.mockResolvedValue();

      await multichannelApi.saveSession(
        'app-id',
        'user-id',
        12345,
        { email: 'test@example.com' },
        false
      );

      expect(AsyncStorage.multiSet).toHaveBeenCalledWith(
        expect.arrayContaining([
          ['qiscus:lastAppId', 'app-id'],
          ['qiscus:lastUserId', 'user-id'],
          ['qiscus:lastRoomId', '12345'],
          ['qiscus:lastRoomIsResolved', 'false'],
        ])
      );
    });
  });

  describe('clearSession', () => {
    it('should clear all session data', async () => {
      AsyncStorage.multiRemove.mockResolvedValue();

      await multichannelApi.clearSession();

      expect(AsyncStorage.multiRemove).toHaveBeenCalled();
    });
  });

  describe('tryRestoreSession', () => {
    it('should restore valid session', async () => {
      AsyncStorage.multiGet.mockResolvedValue([
        ['qiscus:lastAppId', 'test-app-id'],
        ['qiscus:lastUserId', 'user-123'],
        ['qiscus:lastUserData', JSON.stringify({ email: 'test@example.com' })],
        ['qiscus:lastRoomId', '12345'],
        ['qiscus:lastRoomIsResolved', 'false'],
      ]);

      const result = await multichannelApi.tryRestoreSession('test-app-id');

      expect(result).toEqual({
        userId: 'user-123',
        roomId: 12345,
        isResolved: false,
        userData: { email: 'test@example.com' },
      });
    });

    it('should return null for incomplete session data', async () => {
      AsyncStorage.multiGet.mockResolvedValue([
        ['qiscus:lastAppId', 'test-app-id'],
        ['qiscus:lastUserId', null],
        ['qiscus:lastUserData', null],
        ['qiscus:lastRoomId', null],
        ['qiscus:lastRoomIsResolved', null],
      ]);

      const result = await multichannelApi.tryRestoreSession('test-app-id');

      expect(result).toBeNull();
    });

    it('should clear session on appId mismatch', async () => {
      AsyncStorage.multiGet.mockResolvedValue([
        ['qiscus:lastAppId', 'different-app-id'],
        ['qiscus:lastUserId', 'user-123'],
        ['qiscus:lastUserData', JSON.stringify({ email: 'test@example.com' })],
        ['qiscus:lastRoomId', '12345'],
        ['qiscus:lastRoomIsResolved', 'false'],
      ]);
      AsyncStorage.multiRemove.mockResolvedValue();

      const result = await multichannelApi.tryRestoreSession('test-app-id');

      expect(result).toBeNull();
      expect(AsyncStorage.multiRemove).toHaveBeenCalled();
    });
  });

  describe('initiateChat', () => {
    it('should create new chat session', async () => {
      // Mock no existing session
      AsyncStorage.multiGet.mockResolvedValue([
        ['qiscus:lastAppId', null],
        ['qiscus:lastUserId', null],
        ['qiscus:lastUserData', null],
        ['qiscus:lastRoomId', null],
        ['qiscus:lastRoomIsResolved', null],
      ]);

      Qiscus.qiscus.getNonce.mockResolvedValue({ nonce: 'test-nonce' });
      axios.post.mockResolvedValue({
        data: {
          data: {
            identity_token: 'test-token',
            customer_room: {
              room_id: '12345',
              is_resolved: false,
            },
          },
        },
      });
      Qiscus.qiscus.verifyIdentityToken.mockResolvedValue({ email: 'test@example.com' });
      Qiscus.qiscus.setUserWithIdentityToken.mockResolvedValue();
      Qiscus.qiscus.userData = { email: 'test@example.com' };
      AsyncStorage.multiSet.mockResolvedValue();

      const result = await multichannelApi.initiateChat(
        'test-app-id',
        'test-channel-id',
        {
          userId: 'user-123',
          displayName: 'Test User',
        }
      );

      expect(result).toEqual({
        userId: 'test@example.com',
        roomId: 12345,
        restored: false,
        userData: { email: 'test@example.com' },
      });
    });

    it('should restore existing unresolved session', async () => {
      AsyncStorage.multiGet.mockResolvedValue([
        ['qiscus:lastAppId', 'test-app-id'],
        ['qiscus:lastUserId', 'user-123'],
        ['qiscus:lastUserData', JSON.stringify({ email: 'test@example.com' })],
        ['qiscus:lastRoomId', '12345'],
        ['qiscus:lastRoomIsResolved', 'false'],
      ]);
      Qiscus.qiscus.setUserWithIdentityToken.mockResolvedValue();

      const result = await multichannelApi.initiateChat(
        'test-app-id',
        'test-channel-id',
        {
          userId: 'user-123',
          displayName: 'Test User',
        }
      );

      expect(result).toEqual({
        userId: 'user-123',
        roomId: 12345,
        restored: true,
        userData: { email: 'test@example.com' },
      });
    });
  });
});
