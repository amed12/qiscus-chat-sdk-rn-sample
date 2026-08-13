import { useCallback, useEffect, useRef, useState } from 'react';
import { qiscusClient, qiscusEvents } from '@/client';
import type { QiscusMessage, QiscusRoom } from '@/client';

function sortMessages(map: Record<string, QiscusMessage>): QiscusMessage[] {
  return Object.values(map).sort((a, b) => a.timestamp - b.timestamp);
}

export function useMessages(roomId: number | null) {
  const [room, setRoom] = useState<QiscusRoom | null>(null);
  const [messageMap, setMessageMap] = useState<Record<string, QiscusMessage>>({});
  const [isLoadMoreable, setIsLoadMoreable] = useState(true);
  const [loading, setLoading] = useState(false);
  const mounted = useRef(true);

  useEffect(() => {
    mounted.current = true;
    return () => {
      mounted.current = false;
      qiscusClient.exitChatRoom();
    };
  }, []);

  const loadInitial = useCallback(async () => {
    if (roomId == null) return;
    setLoading(true);
    try {
      const [roomData, messages] = await Promise.all([
        qiscusClient.getRoomById(roomId),
        qiscusClient.loadComments(roomId),
      ]);
      if (!mounted.current) return;
      setRoom(roomData);
      const map = messages.reduce<Record<string, QiscusMessage>>((acc, m) => {
        acc[m.unique_temp_id] = m;
        return acc;
      }, {});
      setMessageMap(map);
      setIsLoadMoreable((messages[0]?.comment_before_id ?? 0) !== 0);
    } finally {
      if (mounted.current) setLoading(false);
    }
  }, [roomId]);

  const loadMore = useCallback(async () => {
    if (!isLoadMoreable || roomId == null) return;
    const msgs = sortMessages(messageMap);
    const lastId = msgs[0]?.id;
    if (!lastId) return;
    const older = await qiscusClient.loadComments(roomId, { last_comment_id: lastId });
    if (!mounted.current) return;
    setIsLoadMoreable((older[0]?.comment_before_id ?? 0) !== 0);
    setMessageMap((prev) => {
      const next = { ...prev };
      older.forEach((m) => { next[m.unique_temp_id] = m; });
      return next;
    });
  }, [isLoadMoreable, messageMap, roomId]);

  useEffect(() => {
    loadInitial();
  }, [loadInitial]);

  // real-time new messages
  useEffect(() => {
    const unsub = qiscusEvents.on('new-message', (msg: QiscusMessage) => {
      if (msg.room_id !== roomId) return;
      setMessageMap((prev) => ({ ...prev, [msg.unique_temp_id]: msg }));
    });
    return unsub;
  }, [roomId]);

  // read receipts
  useEffect(() => {
    const unsub = qiscusEvents.on('comment-read', ({ comment }) => {
      setMessageMap((prev) => {
        const next = { ...prev };
        Object.values(next).forEach((m) => {
          if (m.timestamp <= comment.timestamp) {
            next[m.unique_temp_id] = { ...m, status: 'read' };
          }
        });
        return next;
      });
    });
    return unsub;
  }, []);

  // delivered receipts
  useEffect(() => {
    const unsub = qiscusEvents.on('comment-delivered', ({ comment }) => {
      setMessageMap((prev) => {
        const next = { ...prev };
        Object.values(next).forEach((m) => {
          if (m.timestamp <= comment.timestamp && m.status !== 'read') {
            next[m.unique_temp_id] = { ...m, status: 'delivered' };
          }
        });
        return next;
      });
    });
    return unsub;
  }, []);

  const messages = sortMessages(messageMap);

  const addOptimistic = useCallback((msg: QiscusMessage) => {
    setMessageMap((prev) => ({ ...prev, [msg.unique_temp_id]: msg }));
  }, []);

  const updateMessage = useCallback((tempId: string, updated: QiscusMessage) => {
    setMessageMap((prev) => ({ ...prev, [tempId]: updated }));
  }, []);

  return { room, messages, loading, isLoadMoreable, loadMore, addOptimistic, updateMessage };
}
