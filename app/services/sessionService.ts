import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Qiscus from '../qiscus';
import type { MultichannelSession } from '../types/qiscus.types';

const USER_STORAGE_KEY = 'qiscus';
const ROOM_STORAGE_KEY = 'qiscus_current_room';
const MULTICHANNEL_SESSION_KEY = 'qiscus:multichannel_session';

type StoredUser = {
  email?: string;
  username?: string;
};

export async function getStoredUser(): Promise<StoredUser | null> {
  const result = await AsyncStorage.getItem(USER_STORAGE_KEY);
  return result ? JSON.parse(result) : null;
}

export async function getStoredUserId(): Promise<string | null> {
  const user = await getStoredUser();
  if (!user) {
    return null;
  }
  return user.email || user.username || null;
}

export async function saveUser(identifier: string): Promise<void> {
  await AsyncStorage.setItem(
    USER_STORAGE_KEY,
    JSON.stringify({
      email: identifier,
      username: identifier,
    })
  );
}

export async function saveRoomId(roomId: number): Promise<void> {
  await AsyncStorage.setItem(ROOM_STORAGE_KEY, JSON.stringify({ roomId }));
}

export async function clearStoredSession(): Promise<void> {
  await AsyncStorage.multiRemove([USER_STORAGE_KEY, ROOM_STORAGE_KEY, MULTICHANNEL_SESSION_KEY]);
  Qiscus.qiscus.clearUser();
}

export async function saveMultichannelSession(session: MultichannelSession): Promise<void> {
  await AsyncStorage.setItem(MULTICHANNEL_SESSION_KEY, JSON.stringify(session));
}

export async function loadMultichannelSession(appId: string): Promise<MultichannelSession | null> {
  const raw = await AsyncStorage.getItem(MULTICHANNEL_SESSION_KEY);
  if (!raw) {
    return null;
  }
  try {
    const session: MultichannelSession = JSON.parse(raw);
    if (session.appId !== appId) {
      return null;
    }
    return session;
  } catch (error) {
    console.warn('[SessionService] Failed to parse stored session', error);
    return null;
  }
}

export async function clearMultichannelSession(): Promise<void> {
  await AsyncStorage.removeItem(MULTICHANNEL_SESSION_KEY);
}
