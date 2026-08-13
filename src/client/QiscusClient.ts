// eslint-disable-next-line @typescript-eslint/no-require-imports
const QiscusSDK = require('qiscus-sdk-core');
import { qiscusEvents } from './events';
import type { QiscusUser, QiscusRoom, QiscusMessage, UploadFileSource } from './types';

// qiscus-sdk-core ships no TypeScript declarations; we cast at the boundary.
// eslint-disable-next-line @typescript-eslint/no-explicit-any
type SDK = any;

const APP_ID = 'sdksample';

class QiscusClient {
  private readonly sdk: SDK;
  private _initialized = false;

  constructor() {
    this.sdk = new QiscusSDK();
  }

  init(): void {
    if (this._initialized) return;
    this._initialized = true;

    this.sdk.init({
      AppId: APP_ID,
      options: {
        loginSuccessCallback: (authData: unknown) => {
          qiscusEvents.emit('login-success', authData as { user: unknown });
        },
        newMessagesCallback: (messages: unknown[]) => {
          (messages as QiscusMessage[]).forEach((msg) => qiscusEvents.emit('new-message', msg));
        },
        presenceCallback: (raw: string) => {
          const parts = raw.split(':');
          qiscusEvents.emit('online-presence', {
            isOnline: parts[0] === '1',
            lastOnline: new Date(Number(parts[1])),
          });
        },
        commentReadCallback: (data: unknown) => {
          qiscusEvents.emit('comment-read', data as { comment: QiscusMessage });
        },
        commentDeliveredCallback: (data: unknown) => {
          qiscusEvents.emit('comment-delivered', data as { comment: QiscusMessage });
        },
        typingCallback: (data: unknown) => {
          qiscusEvents.emit('typing', data as { room_id: string; username: string; isTyping: boolean });
        },
        chatRoomCreatedCallback: (room: unknown) => {
          qiscusEvents.emit('chat-room-created', room as QiscusRoom);
        },
      },
    });
  }

  get isLogin(): boolean {
    return this.sdk.isLogin as boolean;
  }

  get currentUser(): QiscusUser | null {
    return (this.sdk.userData as QiscusUser) ?? null;
  }

  setUser(userId: string, userKey: string, displayName?: string): Promise<{ user: QiscusUser }> {
    return this.sdk.setUser(userId, userKey, displayName ?? userId) as Promise<{ user: QiscusUser }>;
  }

  setUserWithIdentityToken(data: { user: QiscusUser }): void {
    this.sdk.setUserWithIdentityToken({ user: data.user });
  }

  disconnect(): void {
    this.sdk.disconnect();
  }

  updateProfile(opts: { avatar_url?: string; extras?: Record<string, unknown> }): Promise<void> {
    return this.sdk.updateProfile(opts) as Promise<void>;
  }

  registerDeviceToken(token: string): Promise<void> {
    return this.sdk.registerDeviceToken(token) as Promise<void>;
  }

  // ── Rooms ─────────────────────────────────────────────────────────────────

  loadRoomList(params?: {
    page?: number;
    limit?: number;
    show_participants?: boolean;
  }): Promise<QiscusRoom[]> {
    return this.sdk.loadRoomList(params) as Promise<QiscusRoom[]>;
  }

  getRoomById(roomId: number): Promise<QiscusRoom> {
    return this.sdk.getRoomById(roomId) as Promise<QiscusRoom>;
  }

  getRoomsInfo(params: { room_ids: string[] }): Promise<{
    results: { rooms_info: QiscusRoom[] };
  }> {
    return this.sdk.getRoomsInfo(params) as Promise<{ results: { rooms_info: QiscusRoom[] } }>;
  }

  chatTarget(userId: string): Promise<QiscusRoom> {
    return this.sdk.chatTarget(userId) as Promise<QiscusRoom>;
  }

  createGroupRoom(name: string, userIds: string[], avatarURL?: string): Promise<QiscusRoom> {
    return this.sdk.createGroupRoom(name, userIds, avatarURL) as Promise<QiscusRoom>;
  }

  updateRoom(params: {
    id: number;
    room_name?: string;
    avatar_url?: string;
  }): Promise<QiscusRoom> {
    return this.sdk.updateRoom(params) as Promise<QiscusRoom>;
  }

  addParticipantsToGroup(roomId: number, userIds: string[]): Promise<QiscusUser[]> {
    return this.sdk.addParticipantsToGroup(roomId, userIds) as Promise<QiscusUser[]>;
  }

  removeParticipantsFromGroup(roomId: number, userIds: string[]): Promise<void> {
    return this.sdk.removeParticipantsFromGroup(roomId, userIds) as Promise<void>;
  }

  exitChatRoom(): void {
    this.sdk.exitChatRoom();
  }

  // ── Messages ──────────────────────────────────────────────────────────────

  loadComments(roomId: number, params?: { last_comment_id?: number }): Promise<QiscusMessage[]> {
    return this.sdk.loadComments(roomId, params) as Promise<QiscusMessage[]>;
  }

  sendComment(
    roomId: number,
    text: string,
    uniqueId: string,
    type?: string,
    payload?: string,
  ): Promise<QiscusMessage> {
    return this.sdk.sendComment(roomId, text, uniqueId, type, payload) as Promise<QiscusMessage>;
  }

  // ── Upload ────────────────────────────────────────────────────────────────

  upload(
    file: UploadFileSource,
    callback: (error: Error | null, progress: { percent: number } | null, url: string | null) => void,
  ): void {
    this.sdk.upload(file, callback);
  }

  // ── Users ─────────────────────────────────────────────────────────────────

  getUsers(query: string | null, page: number, limit: number): Promise<{ users: QiscusUser[] }> {
    return this.sdk.getUsers(query, page, limit) as Promise<{ users: QiscusUser[] }>;
  }
}

export const qiscusClient = new QiscusClient();
