/**
 * Chat Store - Zustand State Management
 * Manages chat messages, room state, and UI state
 */
import { create } from 'zustand';
import { messagesToSortedArray, upsertMessage, mergeMessages } from '../utils/messageUtils';

export const useChatStore = create((set, get) => ({
  // State
  room: null,
  messages: {},
  isLoadMoreable: true,
  isOnline: false,
  isTyping: false,
  lastOnline: null,
  typingUsername: null,
  scroll: false,

  // Actions
  setRoom: (room) => set({ room }),

  addMessage: (message) =>
    set((state) => ({
      messages: upsertMessage(state.messages, message),
    })),

  updateMessage: (oldMessage, newMessage) =>
    set((state) => ({
      messages: upsertMessage(state.messages, newMessage),
    })),

  addMessages: (newMessages) =>
    set((state) => ({
      messages: mergeMessages(state.messages, newMessages),
    })),

  setMessages: (messages) => set({ messages }),

  clearMessages: () => set({ messages: {} }),

  setLoadMoreable: (isLoadMoreable) => set({ isLoadMoreable }),

  setOnlineStatus: (isOnline, lastOnline = null) =>
    set({ isOnline, lastOnline }),

  setTyping: (isTyping, typingUsername = null) =>
    set({ isTyping, typingUsername }),

  setScroll: (scroll) => set({ scroll }),

  reset: () =>
    set({
      room: null,
      messages: {},
      isLoadMoreable: true,
      isOnline: false,
      isTyping: false,
      lastOnline: null,
      typingUsername: null,
      scroll: false,
    }),

  // Selectors
  getMessages: () => messagesToSortedArray(get().messages),
  
  getMessageCount: () => Object.keys(get().messages).length,
  
  isGroupChat: () => {
    const { room } = get();
    return room?.room_type === 'group';
  },
}));

export default useChatStore;
