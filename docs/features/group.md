# Group Chat

## Create a group

`CreateGroupScreen` (`src/screens/CreateGroupScreen.tsx`) handles group creation:

1. Search users via `qiscusClient.getUsers(query, page, limit)`
2. Select participants
3. Call `qiscusClient.createGroupRoom(name, userIds, avatarURL?)`

The `chat-room-created` event fires after a successful group creation — `useRooms` listens to it and prepends the new room to the list.

## Room types

| `room_type` | Description |
|-------------|-------------|
| `single` | 1-on-1 DM — opened via `qiscusClient.chatTarget(userId)` |
| `group` | Multi-participant group — created via `createGroupRoom` |
| `channel` | Broadcast channel (not implemented in this sample) |

## View room info

`RoomInfoScreen` shows participants and allows:
- Adding participants: `qiscusClient.addParticipantsToGroup(roomId, [userId])`
- Removing participants: `qiscusClient.removeParticipantsFromGroup(roomId, [userId])`

The `roomId` parameter type is `number` (not string).

## Update group name / avatar

```ts
await qiscusClient.updateRoom({ id: roomId, room_name: 'New Name', avatar_url: '...' });
```

## `QiscusRoom` shape

```ts
interface QiscusRoom {
  id: number;
  name: string;
  avatar_url: string;
  room_type: 'single' | 'group' | 'channel';
  unique_id: string;
  count_notif: number;
  unread_count: number;
  last_comment_message?: string;
  last_comment_timestamp?: string;
  participants: QiscusParticipant[];
}
```

## User list

`qiscusClient.getUsers(query, page, limit)` returns `{ users: QiscusUser[] }`. Page is 1-indexed. Used in `UserListScreen` and `CreateGroupScreen`.
