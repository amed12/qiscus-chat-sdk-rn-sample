import React, { createContext, useContext, useEffect, useRef, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { qiscusClient } from '@/client';
import type { QiscusUser } from '@/client';

interface ChatContextValue {
  currentUser: QiscusUser | null;
  isConnected: boolean;
  login: (userId: string, userKey: string) => Promise<void>;
  logout: () => Promise<void>;
}

const ChatContext = createContext<ChatContextValue | null>(null);

const STORAGE_KEY = 'qiscus_user';

export function ChatProvider({ children }: { children: React.ReactNode }) {
  const [currentUser, setCurrentUser] = useState<QiscusUser | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const initialized = useRef(false);

  useEffect(() => {
    if (initialized.current) return;
    initialized.current = true;

    qiscusClient.init();

    AsyncStorage.getItem(STORAGE_KEY).then((raw) => {
      if (!raw) return;
      try {
        const user = JSON.parse(raw) as QiscusUser;
        qiscusClient.setUserWithIdentityToken({ user });
        setCurrentUser(user);
        setIsConnected(true);
      } catch {
        // stale data — ignore
      }
    });
  }, []);

  const login = async (userId: string, userKey: string) => {
    const { user } = await qiscusClient.setUser(userId, userKey, userId);
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(user));
    setCurrentUser(user as QiscusUser);
    setIsConnected(true);
  };

  const logout = async () => {
    await AsyncStorage.removeItem(STORAGE_KEY);
    qiscusClient.disconnect();
    setCurrentUser(null);
    setIsConnected(false);
  };

  return (
    <ChatContext.Provider value={{ currentUser, isConnected, login, logout }}>
      {children}
    </ChatContext.Provider>
  );
}

export function useChatContext(): ChatContextValue {
  const ctx = useContext(ChatContext);
  if (!ctx) throw new Error('useChatContext must be used inside ChatProvider');
  return ctx;
}
