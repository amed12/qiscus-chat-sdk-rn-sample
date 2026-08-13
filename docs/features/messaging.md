# Messaging

## Loading messages

The `useMessages(roomId)` hook (`src/hooks/useMessages.ts`) manages the message list for a single room.

```ts
const { messages, loading, isLoadMoreable, loadMore, addOptimistic, updateMessage } =
  useMessages(room.id);
```

On mount it calls:
- `qiscusClient.getRoomById(roomId)` — room metadata
- `qiscusClient.loadComments(roomId)` — latest messages

Messages are stored in a `Record<unique_temp_id, QiscusMessage>` map and exposed as a sorted array (ascending `timestamp`).

## Pagination (load more)

```ts
await loadMore();
```

Calls `qiscusClient.loadComments(roomId, { last_comment_id: oldestId })`. `isLoadMoreable` is `false` once `comment_before_id === 0` (no older messages).

## Sending a text message

```ts
const { sendText, buildOptimistic } = useSendMessage();
const { currentUser } = useAuth();

// 1. Insert optimistic message immediately
const optimistic = buildOptimistic(text, currentUser, room.id);
addOptimistic(optimistic);

// 2. Send to server
try {
  const serverMsg = await sendText(room.id, text, currentUser);
  updateMessage(optimistic.unique_temp_id, serverMsg);
} catch {
  updateMessage(optimistic.unique_temp_id, { ...optimistic, status: 'failed' });
}
```

## Message status lifecycle

```
sending → sent → delivered → read
                           ↗ failed (on error)
```

Statuses are updated by:
- `comment-delivered` event → marks all messages with `timestamp ≤ event.timestamp` as `delivered`
- `comment-read` event → marks all messages with `timestamp ≤ event.timestamp` as `read`

## Message types

| `type` | Description |
|--------|-------------|
| `text` | Plain text |
| `custom` | File attachment (payload carries URL + metadata) |
| `date` | Date separator (local only, not sent to server) |

## `QiscusMessage` shape

```ts
interface QiscusMessage {
  id: number;
  unique_id: string;
  unique_temp_id: string;   // used as the map key (stable for optimistic → server swap)
  room_id: number;
  email: string;            // sender userId
  username: string;         // sender display name
  message: string;          // text content (or caption for files)
  type: MessageType | string;
  status: MessageStatus;
  timestamp: number;        // unix ms
  payload?: MessagePayload | null;
  comment_before_id?: number;
}
```
