# Authentication

## Overview

Auth state lives in `ChatContext` (`src/context/ChatContext.tsx`). The `useAuth` hook exposes it to screens.

```
ChatProvider (wraps the whole app)
  └─ login / logout → AsyncStorage + qiscusClient.setUser / disconnect
       └─ useAuth() ← consumed by LoginScreen, RoomListScreen, etc.
```

## Login

```ts
const { login } = useAuth();
await login(userId, userKey);
```

Internally this calls `qiscusClient.setUser(userId, userKey, userId)` and persists the returned user object to `AsyncStorage` under the key `'qiscus_user'`.

## Session restore

On app launch, `ChatProvider` reads `AsyncStorage` and calls `qiscusClient.setUserWithIdentityToken({ user })` to restore the session without a network round-trip.

## Logout

```ts
const { logout } = useAuth();
await logout();
```

Clears `AsyncStorage`, calls `qiscusClient.disconnect()`, and resets `currentUser` / `isConnected` to null / false.

## Current user

```ts
const { currentUser, isConnected } = useAuth();
// currentUser: QiscusUser | null
// isConnected: boolean
```

`QiscusUser` shape:
```ts
interface QiscusUser {
  id: number;
  email: string;       // used as the unique userId
  username: string;    // display name
  avatar_url: string;
  extras?: Record<string, unknown>;
}
```

## Test credentials (sdksample App ID)

| userId | userKey |
|--------|---------|
| guest-101 | passkey |
| guest-102 | passkey |
