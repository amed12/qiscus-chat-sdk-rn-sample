declare module 'qiscus-sdk-core' {
  class QiscusSDK {
    isLogin: boolean;
    isInit: boolean;
    userData: import('./types').QiscusUser | null;
    init(opts: {
      AppId: string;
      options?: {
        loginSuccessCallback?: (data: unknown) => void;
        newMessagesCallback?: (messages: unknown[]) => void;
        presenceCallback?: (data: string) => void;
        commentReadCallback?: (data: unknown) => void;
        commentDeliveredCallback?: (data: unknown) => void;
        typingCallback?: (data: unknown) => void;
        chatRoomCreatedCallback?: (room: unknown) => void;
      };
    }): void;
    setUser(userId: string, userKey: string, displayName?: string): Promise<{ user: unknown }>;
    setUserWithIdentityToken(data: { user: unknown }): void;
    disconnect(): void;
    updateProfile(opts: Record<string, unknown>): Promise<void>;
    registerDeviceToken(token: string): Promise<void>;
    loadRoomList(params?: Record<string, unknown>): Promise<unknown[]>;
    getRoomById(id: number): Promise<unknown>;
    getRoomsInfo(params: Record<string, unknown>): Promise<unknown>;
    chatTarget(userId: string): Promise<unknown>;
    createGroupRoom(name: string, userIds: string[], avatarURL?: string): Promise<unknown>;
    updateRoom(params: Record<string, unknown>): Promise<unknown>;
    addParticipantsToGroup(roomId: number, userIds: string[]): Promise<unknown[]>;
    removeParticipantsFromGroup(roomId: number, userIds: string[]): Promise<void>;
    exitChatRoom(): void;
    loadComments(roomId: number, params?: Record<string, unknown>): Promise<unknown[]>;
    sendComment(
      roomId: number,
      text: string,
      uniqueId: string,
      type?: string,
      payload?: string,
    ): Promise<unknown>;
    upload(
      file: Record<string, unknown>,
      callback: (
        error: Error | null,
        progress: { percent: number } | null,
        url: string | null,
      ) => void,
    ): void;
    getUsers(query: string | null, page: number, limit: number): Promise<{ users: unknown[] }>;
  }
  export = QiscusSDK;
}
