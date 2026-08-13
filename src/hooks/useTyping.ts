import { useEffect, useRef, useState } from 'react';
import { qiscusEvents } from '@/client';
import type { TypingData } from '@/client';

const TYPING_TIMEOUT_MS = 1500;

export function useTyping(roomId: number | null) {
  const [isTyping, setIsTyping] = useState(false);
  const [typingUsername, setTypingUsername] = useState<string | null>(null);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    const unsub = qiscusEvents.on('typing', (data: TypingData) => {
      if (roomId == null || Number(data.room_id) !== roomId) return;
      if (timerRef.current) clearTimeout(timerRef.current);
      setIsTyping(true);
      setTypingUsername(data.username);
      timerRef.current = setTimeout(() => {
        setIsTyping(false);
        setTypingUsername(null);
      }, TYPING_TIMEOUT_MS);
    });
    return () => {
      unsub();
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [roomId]);

  return { isTyping, typingUsername };
}
