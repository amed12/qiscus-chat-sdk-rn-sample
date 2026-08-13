import { useEffect, useState } from 'react';
import { qiscusEvents } from '@/client';
import type { OnlinePresence } from '@/client';

export function useOnlinePresence() {
  const [presence, setPresence] = useState<OnlinePresence>({
    isOnline: false,
    lastOnline: new Date(0),
  });

  useEffect(() => {
    const unsub = qiscusEvents.on('online-presence', (data: OnlinePresence) => {
      setPresence(data);
    });
    return unsub;
  }, []);

  return presence;
}
