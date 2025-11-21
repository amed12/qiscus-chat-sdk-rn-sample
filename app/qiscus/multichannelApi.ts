import axios, { AxiosResponse } from 'axios';
import * as Qiscus from './index';
import { APP_CONFIG } from '../config/appConfig';
import {
  clearMultichannelSession,
  loadMultichannelSession,
  saveMultichannelSession,
} from '../services/sessionService';
import type {
  MultichannelInitiateChatRequest,
  MultichannelInitiateChatResponse,
  MultichannelSession,
  InitiateChatResult,
} from '../types/qiscus.types';

const MULTICHANNEL_API = APP_CONFIG.api.multichannel;
const QISMO_API = APP_CONFIG.api.qismo;

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

      const session = await loadMultichannelSession(appId);

      // Validate session data
      if (!session || !session.appId || !session.userId || !session.userDataToken || !session.roomId) {
        console.log('[MultichannelAPI] Incomplete session data');
        return null;
      }

      // Verify appId matches
      if (session.appId !== appId) {
        console.log('[MultichannelAPI] AppId mismatch, clearing old session');
        await this.clearSession();
        return null;
      }

      console.log('[MultichannelAPI] Session restored:', session);

      return session;
    } catch (error) {
      console.error('[MultichannelAPI] Session restoration failed:', error);
      return null;
    }
  },

  /**
   * Save session to storage
   */
  async saveSession(session: MultichannelSession): Promise<void> {
    try {
      await saveMultichannelSession(session);
      console.log('[MultichannelAPI] Session saved:', session);
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
      await clearMultichannelSession();
      console.log('[MultichannelAPI] Session cleared');
    } catch (error) {
      console.error('[MultichannelAPI] Failed to clear session:', error);
      throw error;
    }
  },

  /**
   * Helper: Restore user session with identity token
   */
  async restoreUserSession(userDataToken: string): Promise<boolean> {
    if (!Qiscus.qiscus.isLogin) {
      try {
        await Qiscus.qiscus.setUserWithIdentityToken(userDataToken);
        await new Promise((resolve) => setTimeout(resolve, 300));
        console.log('[MultichannelAPI] Session restored with internal storage');
        return true;
      } catch (error) {
        console.error('[MultichannelAPI] Failed to set user with identity token:', error);
        return false;
      }
    }
    return true;
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
        // Determine if we should reuse the existing session
        const shouldReuseSession = !existingSession.isResolved || 
          !(existingSession.isSessional || (await this.checkSessional(appId)));

        if (shouldReuseSession) {
          const reason = !existingSession.isResolved 
            ? 'Room not resolved' 
            : 'Not sessional';
          console.log(`[MultichannelAPI] ${reason}, reusing existing room`);
          
          const restored = await this.restoreUserSession(existingSession.userDataToken);
          return {
            userId: existingSession.userId,
            roomId: existingSession.roomId,
            restored,
            userDataToken: existingSession.userDataToken,
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
      const isSessional = await this.checkSessional(appId);

      console.log('[MultichannelAPI] Initiate chat result:', response.data.data);

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
      await this.saveSession({
        appId,
        userId: userIdFromSDK,
        userDataToken: identity_token,
        roomId,
        isResolved,
        isSessional,
      });

      return {
        userId: userIdFromSDK,
        roomId,
        restored: false,
        userDataToken: identity_token,
      };
    } catch (error) {
      console.error('[MultichannelAPI] Initiate chat error:', error);
      throw error;
    }
  },
};

export default multichannelApi;
