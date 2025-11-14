import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Qiscus from './index';
import { APP_CONFIG } from '../config/appConfig';
import { TIMING } from '../config/constants';

const MULTICHANNEL_API = APP_CONFIG.api.multichannel;
const QISMO_API = APP_CONFIG.api.qismo;

// Storage keys
const STORAGE_KEYS = {
  lastAppId: 'qiscus:lastAppId',
  lastUserId: 'qiscus:lastUserId',
  lastUserData: 'qiscus:lastUserData',
  lastRoomId: 'qiscus:lastRoomId',
  lastRoomIsResolved: 'qiscus:lastRoomIsResolved',
};

export const multichannelApi = {
  /**
   * Authenticate user with identity token
   * Reusable function to verify and set user with proper wait time
   */
  async authenticateWithToken(userData) {
    try {
      await Qiscus.qiscus.setUserWithIdentityToken(userData);
      // Give wait time for qiscus to load
      await new Promise(resolve => setTimeout(resolve, TIMING.QISCUS_INIT_DELAY));
      return true;
    } catch (error) {
      console.error('[MultichannelAPI] Failed to authenticate with token:', error);
      return false;
    }
  },

  /**
   * Check if app is sessional
   * Sessional = create new room when previous room is resolved
   */
  async checkSessional(appId) {
    try { 
      const response = await axios.get(`${QISMO_API}/${appId}/get_session`);
      return response.data.data.is_sessional === true;
    } catch (error) {
      console.error('[MultichannelAPI] Check sessional error:', error);
      // Default to non-sessional if API fails
      return false;
    }
  },

  /**
   * Try to restore existing session from storage
   */
  async tryRestoreSession(appId) {
    try {
      console.log('[MultichannelAPI] Attempting to restore session...');
      
      const sessionData = await AsyncStorage.multiGet([
        STORAGE_KEYS.lastAppId,
        STORAGE_KEYS.lastUserId,
        STORAGE_KEYS.lastUserData,
        STORAGE_KEYS.lastRoomId,
        STORAGE_KEYS.lastRoomIsResolved,
      ]);

      // Parse stored values
      const session = {
        appId: sessionData[0][1],
        userId: sessionData[1][1],
        userData: JSON.parse(sessionData[2][1]),
        roomId: sessionData[3][1],
        isResolved: sessionData[4][1] === 'true',
      };

      // Validate session data
      if (!session.appId || !session.userId || !session.userData || !session.roomId) {
        console.log('[MultichannelAPI] Incomplete session data');
        return null;
      }

      // Verify appId matches
      if (session.appId !== appId) {
        console.log('[MultichannelAPI] AppId mismatch, clearing old session');
        await this.clearSession();
        return null;
      }

      console.log('[MultichannelAPI] Session restored:', {
        userId: session.userId,
        roomId: session.roomId,
        isResolved: session.isResolved,
        userData: session.userData
      });

      return {
        userId: session.userId,
        roomId: Number(session.roomId),
        isResolved: session.isResolved,
        userData: session.userData
      };
    } catch (error) {
      console.error('[MultichannelAPI] Session restoration failed:', error);
      return null;
    }
  },

  /**
   * Save session to storage
   */
  async saveSession(appId, userId, roomId, userData, isResolved = false) {
    try {
      await AsyncStorage.multiSet([
        [STORAGE_KEYS.lastAppId, appId],
        [STORAGE_KEYS.lastUserId, userId],
        [STORAGE_KEYS.lastUserData, JSON.stringify(userData)],
        [STORAGE_KEYS.lastRoomId, String(roomId)],
        [STORAGE_KEYS.lastRoomIsResolved, String(isResolved)],
      ]);
      
      console.log('[MultichannelAPI] Session saved:', {
        appId,
        userId,
        roomId,
        isResolved,
        userData
      });
    } catch (error) {
      console.error('[MultichannelAPI] Failed to save session:', error);
    }
  },

  /**
   * Clear session from storage
   */
  async clearSession() {
    try {
      await AsyncStorage.multiRemove(Object.values(STORAGE_KEYS));
      console.log('[MultichannelAPI] Session cleared');
    } catch (error) {
      console.error('[MultichannelAPI] Failed to clear session:', error);
    }
  },

  /**
   * Initiate chat dengan Multichannel API
   * Includes session restoration logic
   */
  async initiateChat(appId, channelId, userConfig) {
    try {
      console.log('[MultichannelAPI] Initiating chat...');

      // Check if user has existing session
      const existingSession = await this.tryRestoreSession(appId);

      if (existingSession) {
        console.log('[MultichannelAPI] Existing session found');

        // If room not resolved, always reuse
        if (!existingSession.isResolved) {
          console.log('[MultichannelAPI] Room not resolved, reusing existing room');
          const authenticated = await this.authenticateWithToken(existingSession.userData);
          return {
            userId: existingSession.userId,
            roomId: existingSession.roomId,
            restored: authenticated,
            userData: existingSession.userData
          };
        }

        // Room is resolved, check if app is sessional
        const isSessional = await this.checkSessional(appId);
        console.log(`[MultichannelAPI] Room resolved: true, Sessional: ${isSessional}`);
        
        if (!isSessional) {
          // Not sessional, reuse existing room even if resolved
          console.log('[MultichannelAPI] Not sessional, reusing existing room');
          const authenticated = await this.authenticateWithToken(existingSession.userData);
          return {
            userId: existingSession.userId,
            roomId: existingSession.roomId,
            restored: authenticated,
            userData: existingSession.userData
          };
        }
        
        // Sessional + resolved = create new room
        console.log('[MultichannelAPI] Sessional + resolved, creating new room...');
      }

      console.log('[MultichannelAPI] Creating new session...');

      // Step 1: Get nonce from SDK
      const { nonce } = await Qiscus.qiscus.getNonce();
      console.log('[MultichannelAPI] Nonce generated', nonce);

      // Step 2: Prepare API payload
      const payload = {
        app_id: appId,
        user_id: userConfig.userId,
        name: userConfig.displayName || userConfig.userId,
        avatar: userConfig.avatarUrl || null,
        sdk_user_extras: userConfig.extras || {},
        user_properties: userConfig.userProperties || {},
        nonce,
      };

      if (channelId) {
        payload.channel_id = channelId;
      }

      // Step 3: Call initiate chat API
      const response = await axios.post(`${MULTICHANNEL_API}/initiate_chat`, payload);
      const { identity_token, customer_room } = response.data.data;
      
      const roomId = Number(customer_room.room_id);
      const isResolved = customer_room.is_resolved;
      
      console.log('[MultichannelAPI] Chat initiated:', { roomId, isResolved });

      // Step 4: Verify and set user with identity token
      const userData = await Qiscus.qiscus.verifyIdentityToken(identity_token);
      await this.authenticateWithToken(userData);
      
      // Get user info from SDK
      const userId = Qiscus.qiscus.userData.email || Qiscus.qiscus.userData.id_str || Qiscus.qiscus.user_id;
      
      console.log('[MultichannelAPI] User authenticated:', {
        userId,
        userData: userData,
        email: Qiscus.qiscus.userData.email,
        isLogin: Qiscus.qiscus.isLogin
      });

      // Step 5: Save session to storage
      await this.saveSession(appId, userId, roomId, userData, isResolved);

      return {
        userId,
        roomId,
        restored: false,
        userData
      };
    } catch (error) {
      console.error('[MultichannelAPI] Initiate chat error:', error);
      
      // Better error handling
      if (error.response) {
        const errorMessage = error.response.data?.errors?.message || error.response.data?.message || 'Failed to initiate chat';
        throw new Error(errorMessage);
      } else if (error.request) {
        throw new Error('No response from server. Please check your connection.');
      } else {
        throw new Error(error.message || 'Failed to initiate chat');
      }
    }
  },
};
