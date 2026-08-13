import type { QiscusMessage, QiscusRoom, OnlinePresence, TypingData } from './types';

export type QiscusEventMap = {
  'login-success': { user: unknown };
  'new-message': QiscusMessage;
  'comment-read': { comment: QiscusMessage };
  'comment-delivered': { comment: QiscusMessage };
  'online-presence': OnlinePresence;
  typing: TypingData;
  'chat-room-created': QiscusRoom;
};

type Listener<T> = (data: T) => void;

class TypedEventEmitter {
  private listeners: { [K in keyof QiscusEventMap]?: Array<Listener<QiscusEventMap[K]>> } = {};

  on<K extends keyof QiscusEventMap>(event: K, listener: Listener<QiscusEventMap[K]>): () => void {
    if (!this.listeners[event]) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (this.listeners as any)[event] = [];
    }
    (this.listeners[event] as Array<Listener<QiscusEventMap[K]>>).push(listener);
    return () => this.off(event, listener);
  }

  off<K extends keyof QiscusEventMap>(event: K, listener: Listener<QiscusEventMap[K]>): void {
    const list = this.listeners[event] as Array<Listener<QiscusEventMap[K]>> | undefined;
    if (!list) return;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (this.listeners as any)[event] = list.filter((l) => l !== listener);
  }

  emit<K extends keyof QiscusEventMap>(event: K, data: QiscusEventMap[K]): void {
    const list = this.listeners[event] as Array<Listener<QiscusEventMap[K]>> | undefined;
    if (!list) return;
    list.forEach((l) => l(data));
  }

  once<K extends keyof QiscusEventMap>(
    event: K,
    listener: Listener<QiscusEventMap[K]>,
  ): () => void {
    const wrapped: Listener<QiscusEventMap[K]> = (data) => {
      listener(data);
      this.off(event, wrapped);
    };
    return this.on(event, wrapped);
  }
}

export const qiscusEvents = new TypedEventEmitter();
