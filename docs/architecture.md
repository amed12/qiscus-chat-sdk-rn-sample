# Architecture

## Data flow

```
Qiscus SDK (qiscus-sdk-core)
        │
        ▼
  QiscusClient          ← thin typed wrapper, singleton
  (src/client/)
        │
        ├─ qiscusEvents  ← TypedEventEmitter (replaces xstream + mitt)
        │        │
        │        └─ hooks subscribe via useEffect → setState
        │
        └─ direct calls  ← hooks call SDK methods and await promises
                 │
                 ▼
           React hooks   ← useRooms, useMessages, useSendMessage, …
                 │
                 ▼
          Screens / UI   ← call hooks only, never qiscusClient directly*
```

*Exception: `UserListScreen`, `CreateGroupScreen`, `RoomInfoScreen` call `qiscusClient` for simple one-shot fetches.

## Key decisions

### Why Expo instead of RN CLI?

Expo SDK 52 provides managed builds, faster CI, and first-party packages (`expo-notifications`, `expo-image-picker`, `expo-document-picker`) that replace fragile native modules like `rn-fetch-blob` and `react-native-push-notification`.

### Why React Context + hooks instead of Redux?

The app state is shallow: current user, room list, messages per room. A context + hooks architecture is easier to follow for SDK evaluators (the primary audience of a sample app) and avoids boilerplate.

### Why typed EventEmitter instead of xstream?

`xstream` is an Observable library that requires understanding functional reactive programming. A simple typed `EventEmitter` (30 lines, no dependency) is easier to understand, debug, and test.

### Why React Navigation v7?

react-navigation v4 (the original) is unmaintained and incompatible with React 18. v7 with the native stack gives native-feeling transitions on both platforms with minimal config.

## Realtime event lifecycle

1. SDK fires a callback (e.g. `newMessagesCallback`)
2. `QiscusClient.init()` translates it to `qiscusEvents.emit('new-message', msg)`
3. `useMessages` subscribes with `qiscusEvents.on('new-message', ...)` inside `useEffect`
4. Handler calls `setMessageMap(...)` → React re-renders

The subscription returns an unsubscribe function called in the `useEffect` cleanup.

## Optimistic messages

When the user sends a message:
1. `useSendMessage.buildOptimistic()` creates a local message with `status: 'sending'` and a temporary ID
2. `addOptimistic(msg)` inserts it into the message map immediately (instant UI feedback)
3. The SDK call resolves → `updateMessage(tempId, serverMsg)` replaces the optimistic entry
4. On error → `updateMessage(tempId, {...optimistic, status: 'failed'})`
