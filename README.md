# Qiscus Chat SDK — React Native Sample App

A **production-quality sample app** demonstrating all major features of the [Qiscus Chat SDK](https://documentation.qiscus.com/chat-sdk/react-native) for React Native.

Built with **Expo SDK 52 + TypeScript**, following patterns inspired by [GetStream](https://github.com/GetStream/stream-chat-react-native).

---

## Features

| Category | Feature |
|----------|---------|
| **Auth** | Login with userId + userKey, persist session, logout |
| **Rooms** | Room list with unread badge, 1-on-1 DM, group chat |
| **Messaging** | Send/receive text, optimistic UI, pagination (load more) |
| **Attachments** | Image/video picker, file picker, upload with progress, size/type validation |
| **Realtime** | Typing indicator, online presence, read/delivered receipts |
| **Group** | Create group, add/remove participants, edit name |
| **Profile** | Edit display name, change avatar, view user info |
| **Push** | expo-notifications device token registration |
| **i18n** | English + Bahasa Indonesia via i18next |

## Architecture

```
src/
├── client/       QiscusClient (typed SDK wrapper), events, types, fileUtils
├── context/      ChatContext — connection state & auth
├── hooks/        useAuth, useRooms, useMessages, useSendMessage, useTyping,
│                 useOnlinePresence, usePushToken
├── components/   Toolbar, Avatar, RoomItem, MessageBubble, MessageInput…
├── screens/      Login, RoomList, Chat, UserList, CreateGroup, Profile, RoomInfo
├── navigation/   RootNavigator (React Navigation v7 native stack)
├── theme/        Design tokens (colors, spacing, fontSize)
└── i18n/         en.ts + id.ts
```

Data flows: `QiscusSDK` → `QiscusClient` → `qiscusEvents` → hooks → screens.  
Screens never import the SDK directly.

## Getting started

### Prerequisites

- Node 20+, yarn 4+
- Android Studio + emulator **or** Xcode + simulator
- Expo CLI: `npm i -g expo-cli`

### Install & run

```bash
git clone https://github.com/qiscus/qiscus-chat-sdk-rn-sample
cd qiscus-chat-sdk-rn-sample
git checkout rewrite/expo-ts

yarn install
yarn android        # or: yarn ios
```

### App ID

The app uses the public `sdksample` App ID by default. To use your own:

```bash
QISCUS_APP_ID=your-app-id yarn android
```

Or edit `src/client/QiscusClient.ts` directly.

### Default credentials

| Field | Value |
|-------|-------|
| User ID | `guest-101` |
| User Key | `passkey` |

Try multiple accounts (`guest-101`, `guest-102`) to test realtime messaging between users.

## Scripts

```bash
yarn start          # Expo Metro bundler
yarn android        # build + run Android
yarn ios            # build + run iOS
yarn lint           # ESLint
yarn format         # Prettier
yarn type-check     # TypeScript
yarn test           # Jest
```

## Docs

- [Getting started](docs/getting-started.md)
- [Architecture](docs/architecture.md)
- [Features: Auth](docs/features/auth.md)
- [Features: Messaging](docs/features/messaging.md)
- [Features: Attachments](docs/features/attachments.md)
- [Features: Realtime](docs/features/realtime.md)
- [Features: Group](docs/features/group.md)
- [Features: Push notifications](docs/features/push-notifications.md)
- [Contributing](CONTRIBUTING.md)

## Contributing

See [CONTRIBUTING.md](CONTRIBUTING.md). Commits follow [Conventional Commits](https://www.conventionalcommits.org/).

## License

MIT
