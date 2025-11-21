import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Qiscus from '../qiscus';
import type { MultichannelSession } from '../types/qiscus.types';

const MULTICHANNEL_SESSION_KEY = 'qiscus:multichannel_session';

export async function clearStoredSession(): Promise<void> {
  await AsyncStorage.removeItem(MULTICHANNEL_SESSION_KEY);
  Qiscus.qiscus.clearUser();
}

export async function saveMultichannelSession(session: MultichannelSession): Promise<void> {
  await AsyncStorage.setItem(MULTICHANNEL_SESSION_KEY, JSON.stringify(session));
}

export async function loadMultichannelSession(appId?: string): Promise<MultichannelSession | null> {
  const raw = await AsyncStorage.getItem(MULTICHANNEL_SESSION_KEY);
  if (!raw) {
    return null;
  }
  try {
    const session: MultichannelSession = JSON.parse(raw);
    // Optional appId validation for backward compatibility
    if (appId && session.appId !== appId) {
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
