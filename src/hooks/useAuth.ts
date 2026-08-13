import { useChatContext } from '@/context/ChatContext';

export function useAuth() {
  const { currentUser, isConnected, login, logout } = useChatContext();
  return { currentUser, isConnected, login, logout };
}
