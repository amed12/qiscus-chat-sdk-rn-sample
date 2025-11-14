/**
 * Auth Store - Zustand State Management
 * Manages authentication state and user data
 */
import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Qiscus from '../qiscus';
import { multichannelApi } from '../qiscus/multichannelApi';

export const useAuthStore = create((set, get) => ({
  // State
  user: null,
  isAuthenticated: false,
  isLoading: false,
  error: null,

  // Actions
  setUser: (user) => set({ user, isAuthenticated: !!user }),

  setLoading: (isLoading) => set({ isLoading }),

  setError: (error) => set({ error }),

  /**
   * Login user and initiate chat
   */
  login: async (appId, channelId, userConfig) => {
    try {
      set({ isLoading: true, error: null });

      const result = await multichannelApi.initiateChat(appId, channelId, userConfig);

      // Save user data
      await AsyncStorage.setItem(
        'qiscus',
        JSON.stringify({
          email: result.userId,
          username: result.userId,
        })
      );

      set({
        user: result.userData,
        isAuthenticated: true,
        isLoading: false,
      });

      return result;
    } catch (error) {
      set({
        error: error.message,
        isLoading: false,
      });
      throw error;
    }
  },

  /**
   * Logout user and clear session
   */
  logout: async () => {
    try {
      set({ isLoading: true });

      // Clear session storage
      await multichannelApi.clearSession();

      // Clear user storage
      await AsyncStorage.removeItem('qiscus');

      // Disconnect from Qiscus
      if (Qiscus.qiscus.isLogin) {
        await Qiscus.qiscus.disconnect();
      }

      set({
        user: null,
        isAuthenticated: false,
        isLoading: false,
        error: null,
      });
    } catch (error) {
      set({
        error: error.message,
        isLoading: false,
      });
      throw error;
    }
  },

  /**
   * Restore user session from storage
   */
  restoreSession: async () => {
    try {
      set({ isLoading: true });

      const storedData = await AsyncStorage.multiGet(
        STORAGE_KEYS.lastAppId,
        STORAGE_KEYS.lastUserId,
        STORAGE_KEYS.lastUserData,
        STORAGE_KEYS.lastRoomId,
        STORAGE_KEYS.lastRoomIsResolved,
      );
      if (!storedData) {
        set({ isLoading: false });
        return null;
      }

      const userData = JSON.parse(storedData[2]);
      set({
        user: userData,
        isAuthenticated: true,
        isLoading: false,
        roomId: storedData[3],
        roomIsResolved: storedData[4],
      });

      return userData;
    } catch (error) {
      set({
        error: error.message,
        isLoading: false,
      });
      return null;
    }
  },

  /**
   * Clear error
   */
  clearError: () => set({ error: null }),
}));

export default useAuthStore;
