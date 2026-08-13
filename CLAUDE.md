# CLAUDE.md — AI-Friendly Codebase Guide

This file is read by AI coding assistants (Claude, Copilot, etc.) to understand the project before making changes.

## What this project is

A **sample app** demonstrating every major feature of the Qiscus Chat SDK for React Native.  
It is a single Expo (SDK 52) + TypeScript app — **not** a monorepo, library, or UI kit.  
Platform target: **Android** and iOS. Tested primarily on Android (emulator-5554).

## Stack

| Concern | Choice |
|---------|--------|
| Framework | Expo SDK 52 (dev-client mode) |
| Language | TypeScript 5 (strict) |
| Navigation | React Navigation v7 — native stack |
| State | React Context + custom hooks (no Redux/Zustand) |
| Styling | StyleSheet (no macro, no CSS-in-JS) |
| i18n | i18next + react-i18next (en + id) |
| Push | expo-notifications |
| File pick | expo-document-picker + expo-image-picker |
| Tests | jest-expo + @testing-library/react-native |
| Lint/fmt | ESLint flat config (eslint-config-expo) + Prettier |
| Commits | Conventional Commits (commitlint + husky) |

## Directory layout

```
src/
  client/         ← QiscusClient.ts (SDK wrapper), events.ts, types.ts, fileUtils.ts
  context/        ← ChatContext.tsx (auth + connection state provider)
  hooks/          ← useAuth, useRooms, useMessages, useSendMessage, useTyping,
                     useOnlinePresence, usePushToken
  components/     ← Toolbar, Avatar, RoomItem, MessageBubble, MessageInput,
                     TypingIndicator, UserItem
  screens/        ← LoginScreen, RoomListScreen, ChatScreen, UserListScreen,
                     CreateGroupScreen, ProfileScreen, RoomInfoScreen
  navigation/     ← RootNavigator.tsx, types.ts (RootStackParamList)
  theme/          ← tokens.ts (colors, spacing, fontSize, radius, shadow)
  i18n/           ← index.ts, locales/en.ts, locales/id.ts
```

## Key rules

1. **Screens never import `qiscusClient` directly** — they use hooks (`useMessages`, `useSendMessage`, etc.).  
   Exception: `UserListScreen`, `RoomInfoScreen`, `CreateGroupScreen` call `qiscusClient` for one-shot data fetches where a dedicated hook adds no value.

2. **Events are typed** — `qiscusEvents` is a `TypedEventEmitter`. Always use `qiscusEvents.on('event-name', handler)` which returns an unsubscribe function. Call it in `useEffect` cleanup.

3. **No xstream / mitt / reactive macros** — replaced by the typed emitter and React state.

4. **Styling** — use tokens from `src/theme/tokens.ts`. No inline hex colours. No `css-to-rn.macro`.

5. **i18n** — wrap every user-facing string with `t('namespace.key')`. Add keys to both `en.ts` and `id.ts`.

6. **Optimistic messages** — `useSendMessage.buildOptimistic()` creates a local message with `status: 'sending'`. On success call `updateMessage(tempId, serverMessage)`, on failure set `status: 'failed'`.

7. **File validation** — use `isUnsupportedFileType`, `fileSizeMB`, `MAX_FILE_SIZE_MB` from `src/client/fileUtils.ts`.

## Qiscus AppId

Hard-coded to `sdksample` in `QiscusClient.ts`. To change it set `QISCUS_APP_ID` env var (read via `app.config.ts` → `extra.qiscusAppId`, then pass to `QiscusClient`).

## Running the app

```bash
yarn install
yarn start                  # Expo dev server
yarn android                # build + run on Android emulator
yarn ios                    # build + run on iOS simulator
```

## Common SDK methods (quick reference)

| Feature | Method |
|---------|--------|
| Login | `qiscusClient.setUser(userId, userKey, displayName)` |
| Room list | `qiscusClient.loadRoomList()` |
| Open DM | `qiscusClient.chatTarget(userId)` |
| Load messages | `qiscusClient.loadComments(roomId)` |
| Send text | `qiscusClient.sendComment(roomId, text, uniqueId)` |
| Send file | `qiscusClient.upload(file, cb)` → then `sendComment` with `type:'custom'` |
| Update profile | `qiscusClient.updateProfile({ avatar_url, extras })` |
| Add participant | `qiscusClient.addParticipantsToGroup(roomId, [email])` |
| Remove participant | `qiscusClient.removeParticipantsFromGroup(roomId, [email])` |

## Realtime events

Subscribed via `qiscusEvents.on(eventName, handler)`:

| Event | Payload |
|-------|---------|
| `new-message` | `QiscusMessage` |
| `comment-read` | `{ comment: QiscusMessage }` |
| `comment-delivered` | `{ comment: QiscusMessage }` |
| `online-presence` | `{ isOnline: boolean, lastOnline: Date }` |
| `typing` | `{ room_id: string, username: string, isTyping: boolean }` |
| `chat-room-created` | `QiscusRoom` |
| `login-success` | `{ user: unknown }` |

## Tests

```bash
yarn test
```

Tests live in `src/**/__tests__/` or `*.test.ts(x)` files.  
Use `@testing-library/react-native` for component/hook tests.  
Do **not** mock `qiscusClient` in integration tests unless testing network-failure paths.

## Docs

See `docs/` for feature-level guides:  
`getting-started.md`, `features/auth.md`, `features/messaging.md`, `features/attachments.md`,  
`features/realtime.md`, `features/group.md`, `features/push-notifications.md`, `architecture.md`.
