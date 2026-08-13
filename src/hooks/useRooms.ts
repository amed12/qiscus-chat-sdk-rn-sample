import { useCallback, useEffect, useRef, useState } from 'react';
import { qiscusClient, qiscusEvents } from '@/client';
import type { QiscusRoom, QiscusMessage } from '@/client';

export function useRooms() {
  const [rooms, setRooms] = useState<QiscusRoom[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const mounted = useRef(true);

  useEffect(() => {
    mounted.current = true;
    return () => { mounted.current = false; };
  }, []);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const list = await qiscusClient.loadRoomList({ show_participants: true });
      if (mounted.current) setRooms(list);
    } catch (e) {
      if (mounted.current) setError(e as Error);
    } finally {
      if (mounted.current) setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  useEffect(() => {
    const unsub = qiscusEvents.on('new-message', (message: QiscusMessage) => {
      setRooms((prev) => {
        const roomId = message.room_id;
        const idx = prev.findIndex((r) => r.id === roomId);
        if (idx === -1) {
          load();
          return prev;
        }
        const updated = { ...prev[idx] };
        updated.unread_count = (updated.unread_count || 0) + 1;
        updated.last_comment_message = message.message;
        const next = prev.filter((r) => r.id !== roomId);
        return [updated, ...next];
      });
    });
    return unsub;
  }, [load]);

  return { rooms, loading, error, reload: load };
}
