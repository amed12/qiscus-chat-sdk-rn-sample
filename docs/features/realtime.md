# Realtime Events

## Event bus

All realtime events flow through `qiscusEvents` (`src/client/events.ts`), a zero-dependency typed event emitter.

```ts
import { qiscusEvents } from '@/client';
```

## Subscribing in a hook

Always subscribe inside `useEffect` and unsubscribe on cleanup:

```ts
useEffect(() => {
  const unsub = qiscusEvents.on('new-message', (msg) => {
    // handle msg: QiscusMessage
  });
  return unsub; // unsub() is the cleanup
}, []);
```

## Event reference

| Event | Payload type | When fired |
|-------|-------------|------------|
| `login-success` | `{ user: unknown }` | After `setUser` resolves |
| `new-message` | `QiscusMessage` | Incoming message in any subscribed room |
| `comment-read` | `{ comment: QiscusMessage }` | Recipient read a message |
| `comment-delivered` | `{ comment: QiscusMessage }` | Recipient received a message |
| `online-presence` | `{ isOnline: boolean, lastOnline: Date }` | Presence change for subscribed user |
| `typing` | `{ room_id: string, username: string, isTyping: boolean }` | Someone is typing |
| `chat-room-created` | `QiscusRoom` | New chat room created |

## Typing indicator

The `useTyping` hook (`src/hooks/useTyping.ts`) subscribes to `typing` and exposes:
- `isTyping: boolean` — is anyone typing in the current room?
- `typingUser: string | null` — username of who is typing

## Online presence

The `useOnlinePresence` hook (`src/hooks/useOnlinePresence.ts`) subscribes to `online-presence` and exposes:
- `isOnline: boolean`
- `lastOnline: Date | null`

## How events originate

```
qiscus-sdk-core callback (e.g. newMessagesCallback)
    │
    ▼
QiscusClient.init() translates it
    │
    ▼
qiscusEvents.emit('new-message', msg)
    │
    ▼
hooks subscribed via qiscusEvents.on(...)
    │
    ▼
setState → React re-render
```

`QiscusClient.init()` is called once by `ChatProvider` on app mount.
