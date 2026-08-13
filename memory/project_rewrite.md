---
name: project-rewrite-expo-ts
description: Qiscus Chat SDK RN Sample — ongoing modernization rewrite to Expo+TypeScript on branch rewrite/expo-ts
metadata:
  type: project
---

Branch `rewrite/expo-ts` adalah rewrite total dari RN CLI + JavaScript ke Expo SDK 52 + TypeScript.

**Why:** Stack lama (RN 0.64, xstream, macro, react-nav v4) sulit dipelihara dan bukan contoh kelas dunia.

**Status (2026-08-13):** Scaffolding lengkap. Semua file src/ sudah dibuat:
- `src/client/` — QiscusClient, TypedEventEmitter, types, fileUtils
- `src/context/` — ChatContext (auth)
- `src/hooks/` — useAuth, useRooms, useMessages, useSendMessage, useTyping, useOnlinePresence, usePushToken
- `src/components/` — Toolbar, Avatar, RoomItem, MessageBubble, MessageInput, TypingIndicator, UserItem
- `src/screens/` — Login, RoomList, Chat, UserList, CreateGroup, Profile, RoomInfo (semua TSX functional)
- `src/navigation/` — RootNavigator (react-navigation v7 native stack)
- `src/theme/` — tokens (colors, spacing, fontSize, radius, shadow)
- `src/i18n/` — en.ts + id.ts
- App.tsx, index.ts, app.config.ts, tsconfig.json, babel.config.js, eslint.config.js, commitlint.config.js
- CLAUDE.md, README.md, CONTRIBUTING.md, docs/

**Next steps:**
1. `yarn install` untuk install deps baru (Expo SDK 52)
2. `yarn android` untuk run pertama
3. Fix any runtime issues / missing assets / type errors
4. Setup husky + lint-staged hooks
5. Tulis unit tests untuk hooks (useMessages, useSendMessage)

**How to apply:** Ini branch baru, repo lama (`master`/`upstream-sync`) tidak diubah.
