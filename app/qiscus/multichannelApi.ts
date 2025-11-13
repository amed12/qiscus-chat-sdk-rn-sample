import axios, { AxiosResponse } from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Qiscus from './index';
import { APP_CONFIG } from '../config/appConfig';
import type {
  MultichannelInitiateChatRequest,
  MultichannelInitiateChatResponse,
  MultichannelSession,
  InitiateChatResult,
} from '../types/qiscus.types';

const MULTICHANNEL_API = APP_CONFIG.api.multichannel;
const QISMO_API = APP_CONFIG.api.qismo;

// Storage keys
const STORAGE_KEYS = {
  lastAppId: 'qiscus:lastAppId',
  lastUserId: 'qiscus:lastUserId',
  lastUserData: 'qiscus:lastUserData',
  lastRoomId: 'qiscus:lastRoomId',
  lastRoomIsResolved: 'qiscus:lastRoomIsResolved',
} as const;

interface SessionalResponse {
  data: {
    is_sessional: boolean;
  };
}

export const multichannelApi = {
  /**
   * Check if app is sessional
   * Sessional = create new room when previous room is resolved
   */
  async checkSessional(appId: string): Promise<boolean> {
    try {
      const response: AxiosResponse<SessionalResponse> = await axios.get(
        `${QISMO_API}/${appId}/get_session`
      );
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
  async tryRestoreSession(appId: string): Promise<MultichannelSession | null> {
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
      const session: MultichannelSession = {
        appId: sessionData[0][1] || '',
        userId: sessionData[1][1] || '',
        userData: sessionData[2][1] ? JSON.parse(sessionData[2][1]) : null,
        roomId: Number(sessionData[3][1]),
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
        userData: session.userData,
      });

      return session;
    } catch (error) {
      console.error('[MultichannelAPI] Session restoration failed:', error);
      return null;
    }
  },

  /**
   * Save session to storage
   */
  async saveSession(
    appId: string,
    userId: string,
    roomId: number,
    userData: any,
    isResolved: boolean = false
  ): Promise<void> {
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
        userData,
      });
    } catch (error) {
      console.error('[MultichannelAPI] Failed to save session:', error);
      throw error;
    }
  },

  /**
   * Clear session from storage
   */
  async clearSession(): Promise<void> {
    try {
      await AsyncStorage.multiRemove([
        STORAGE_KEYS.lastAppId,
        STORAGE_KEYS.lastUserId,
        STORAGE_KEYS.lastUserData,
        STORAGE_KEYS.lastRoomId,
        STORAGE_KEYS.lastRoomIsResolved,
      ]);
      console.log('[MultichannelAPI] Session cleared');
    } catch (error) {
      console.error('[MultichannelAPI] Failed to clear session:', error);
      throw error;
    }
  },

  /**
   * Initiate chat with Multichannel API
   * Handles session restoration and new chat creation
   */
  async initiateChat(
    appId: string,
    channelId: number,
    userId: string,
    username: string,
    avatarUrl?: string,
    userProperties?: Record<string, any>
  ): Promise<InitiateChatResult> {
    try {
      console.log('[MultichannelAPI] Initiating chat...', {
        appId,
        channelId,
        userId,
        username,
      });

      // Step 1: Try to restore existing session
      const existingSession = await this.tryRestoreSession(appId);

      if (existingSession) {
        // If room not resolved, always reuse
        if (!existingSession.isResolved) {
          console.log('[MultichannelAPI] Room not resolved, reusing existing room');
          try {
            // v3: setUserWithIdentityToken accepts token directly
            await Qiscus.qiscus.setUserWithIdentityToken(existingSession.userData.token);
            
            // CRITICAL: Manually set internal storage for session restoration
            // This is required by SDK v3 for proper session management
            // @ts-ignore - Internal SDK storage API
            Qiscus.qiscus.storage.setAppId(appId);
            // @ts-ignore - Internal SDK storage API
            Qiscus.qiscus.storage.setCurrentUser(existingSession.userData);
            // @ts-ignore - Internal SDK storage API
            Qiscus.qiscus.storage.setToken(existingSession.userData.token);
            
            console.log('[MultichannelAPI] Session restored with internal storage');
          } catch (error) {
            console.error('[MultichannelAPI] Failed to set user with identity token:', error);
            return {
              userId: existingSession.userId,
              roomId: existingSession.roomId,
              restored: false,
              userData: existingSession.userData,
            };
          }
          return {
            userId: existingSession.userId,
            roomId: existingSession.roomId,
            restored: true,
            userData: existingSession.userData,
          };
        }

        // If room is resolved, check if app is sessional
        const isSessional = await this.checkSessional(appId);

        if (!isSessional) {
          // Not sessional, reuse existing room even if resolved
          console.log('[MultichannelAPI] Not sessional, reusing existing room');
          try {
            await Qiscus.qiscus.setUserWithIdentityToken(existingSession.userData.token);
            
            // CRITICAL: Set internal storage
            // @ts-ignore
            Qiscus.qiscus.storage.setAppId(appId);
            // @ts-ignore
            Qiscus.qiscus.storage.setCurrentUser(existingSession.userData);
            // @ts-ignore
            Qiscus.qiscus.storage.setToken(existingSession.userData.token);
          } catch (error) {
            console.error('[MultichannelAPI] Failed to set user with identity token:', error);
            return {
              userId: existingSession.userId,
              roomId: existingSession.roomId,
              restored: false,
              userData: existingSession.userData,
            };
          }
          return {
            userId: existingSession.userId,
            roomId: existingSession.roomId,
            restored: true,
            userData: existingSession.userData,
          };
        }

        // Sessional and resolved, create new room
        console.log('[MultichannelAPI] Sessional app with resolved room, creating new room');
      }

      // Step 2: No existing session or need new room - initiate new chat
      console.log('[MultichannelAPI] Creating new chat session');

      // Step 3: Generate JWT nonce (v3: getNonce -> getJWTNonce)
      const nonce = await Qiscus.qiscus.getJWTNonce();
      console.log('[MultichannelAPI] Nonce generated');

      // Step 4: Call initiate_chat API
      const payload: MultichannelInitiateChatRequest = {
        app_id: appId,
        user_id: userId,
        name: username,
        avatar: avatarUrl,
        user_properties: userProperties,
        channel_id: channelId,
        nonce,
      };

      const response: AxiosResponse<{ data: MultichannelInitiateChatResponse }> = await axios.post(
        `${MULTICHANNEL_API}/initiate_chat`,
        payload
      );
      const { identity_token, customer_room } = response.data.data;

      const roomId = Number(customer_room.room_id);
      const isResolved = customer_room.is_resolved;

      console.log('[MultichannelAPI] Chat initiated:', { roomId, isResolved });

      // Step 5: Set user with identity token (v3: simplified)
      const userData = await Qiscus.qiscus.setUserWithIdentityToken(identity_token);
      
      // CRITICAL: Set internal storage for new session
      // This ensures SDK maintains the session properly
      // @ts-ignore - Internal SDK storage API
      Qiscus.qiscus.storage.setAppId(appId);
      // @ts-ignore - Internal SDK storage API
      Qiscus.qiscus.storage.setCurrentUser(userData);
      // @ts-ignore - Internal SDK storage API
      Qiscus.qiscus.storage.setToken(Qiscus.qiscus.token);

      // Get user info from SDK (v3: IQAccount has id as number)
      const userIdFromSDK = userId; // Use the original userId passed in

      console.log('[MultichannelAPI] User authenticated with internal storage:', {
        userId: userIdFromSDK,
        userData,
        token: Qiscus.qiscus.token,
      });

      // Step 6: Save session to storage
      await this.saveSession(appId, userIdFromSDK, roomId, userData, isResolved);

      return {
        userId: userIdFromSDK,
        roomId,
        restored: false,
        userData,
      };
    } catch (error) {
      console.error('[MultichannelAPI] Initiate chat error:', error);
      throw error;
    }
  },
};

export default multichannelApi;
