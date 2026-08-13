import QiscusSDK from 'qiscus-sdk-core';
import { qiscusEvents } from './events';
import type {
  QiscusUser,
  QiscusRoom,
  QiscusMessage,
  UploadFileSource,
} from './types';

const APP_ID = 'sdksample';

class QiscusClient {
  private readonly sdk: InstanceType<typeof QiscusSDK>;
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
        loginSuccessCallback: (authData: { user: unknown }) => {
          qiscusEvents.emit('login-success', authData as { user: unknown });
        },
        newMessagesCallback: (messages: QiscusMessage[]) => {
          messages.forEach((msg) => qiscusEvents.emit('new-message', msg));
        },
        presenceCallback: (raw: string) => {
          const parts = raw.split(':');
          qiscusEvents.emit('online-presence', {
            isOnline: parts[0] === '1',
            lastOnline: new Date(Number(parts[1])),
          });
        },
        commentReadCallback: (data: { comment: QiscusMessage }) => {
          qiscusEvents.emit('comment-read', data);
        },
        commentDeliveredCallback: (data: { comment: QiscusMessage }) => {
          qiscusEvents.emit('comment-delivered', data);
        },
        typingCallback: (data: { room_id: string; username: string; isTyping: boolean }) => {
          qiscusEvents.emit('typing', data);
        },
        chatRoomCreatedCallback: (room: QiscusRoom) => {
          qiscusEvents.emit('chat-room-created', room);
        },
      },
    });
  }

  get isLogin(): boolean {
    return this.sdk.isLogin;
  }

  get currentUser(): QiscusUser | null {
    return this.sdk.userData ?? null;
  }

  setUser(userId: string, userKey: string, displayName?: string): Promise<{ user: QiscusUser }> {
    return this.sdk.setUser(userId, userKey, displayName ?? userId);
  }

  setUserWithIdentityToken(data: { user: QiscusUser }): void {
    this.sdk.setUserWithIdentityToken({ user: data.user });
  }

  disconnect(): void {
    this.sdk.disconnect();
  }

  updateProfile(opts: { avatar_url?: string; extras?: Record<string, unknown> }): Promise<void> {
    return this.sdk.updateProfile(opts);
  }

  registerDeviceToken(token: string): Promise<void> {
    return this.sdk.registerDeviceToken(token);
  }

  // ── Rooms ─────────────────────────────────────────────────────────────────

  loadRoomList(params?: {
    page?: number;
    limit?: number;
    show_participants?: boolean;
  }): Promise<QiscusRoom[]> {
    return this.sdk.loadRoomList(params);
  }

  getRoomById(roomId: number): Promise<QiscusRoom> {
    return this.sdk.getRoomById(roomId);
  }

  getRoomsInfo(params: { room_ids: string[] }): Promise<{
    results: { rooms_info: QiscusRoom[] };
  }> {
    return this.sdk.getRoomsInfo(params);
  }

  chatTarget(userId: string): Promise<QiscusRoom> {
    return this.sdk.chatTarget(userId);
  }

  createGroupRoom(
    name: string,
    userIds: string[],
    avatarURL?: string,
  ): Promise<QiscusRoom> {
    return this.sdk.createGroupRoom(name, userIds, avatarURL);
  }

  updateRoom(params: {
    id: number;
    room_name?: string;
    avatar_url?: string;
  }): Promise<QiscusRoom> {
    return this.sdk.updateRoom(params);
  }

  addParticipantsToGroup(roomId: number, userIds: string[]): Promise<QiscusUser[]> {
    return this.sdk.addParticipantsToGroup(roomId, userIds);
  }

  removeParticipantsFromGroup(roomId: number, userIds: string[]): Promise<void> {
    return this.sdk.removeParticipantsFromGroup(roomId, userIds);
  }

  exitChatRoom(): void {
    this.sdk.exitChatRoom();
  }

  // ── Messages ──────────────────────────────────────────────────────────────

  loadComments(
    roomId: number,
    params?: { last_comment_id?: number },
  ): Promise<QiscusMessage[]> {
    return this.sdk.loadComments(roomId, params);
  }

  sendComment(
    roomId: number,
    text: string,
    uniqueId: string,
    type?: string,
    payload?: string,
  ): Promise<QiscusMessage> {
    return this.sdk.sendComment(roomId, text, uniqueId, type, payload);
  }

  // ── Upload ────────────────────────────────────────────────────────────────

  upload(
    file: UploadFileSource,
    callback: (error: Error | null, progress: { percent: number } | null, url: string | null) => void,
  ): void {
    this.sdk.upload(file, callback);
  }

  // ── Users ─────────────────────────────────────────────────────────────────

  getUsers(
    query: string | null,
    page: number,
    limit: number,
  ): Promise<{ users: QiscusUser[] }> {
    return this.sdk.getUsers(query, page, limit);
  }
}

export const qiscusClient = new QiscusClient();
