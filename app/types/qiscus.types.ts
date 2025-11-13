/**
 * Qiscus SDK Type Definitions
 * For qiscus-sdk-javascript v3.4.2
 */

export interface IQAccount {
  id: number;
  email: string;
  username: string;
  avatar_url: string;
  extras?: Record<string, any>;
  token: string;
  rtKey: string;
}

export interface IQUser {
  id: string;
  email: string;
  username: string;
  avatar_url: string;
  extras?: Record<string, any>;
}

export interface IQMessage {
  id: number;
  chat_room_id: number;
  unique_id: string;
  unique_temp_id: string;
  message: string;
  type: string;
  status: 'sending' | 'sent' | 'delivered' | 'read' | 'failed';
  timestamp: string;
  unix_timestamp: number;
  user_id: string;
  username: string;
  user_avatar_url: string;
  payload?: Record<string, any>;
  extras?: Record<string, any>;
}

export interface IQChatRoom {
  id: number;
  unique_id: string;
  name: string;
  avatar_url: string;
  room_type: 'single' | 'group' | 'channel';
  participants: IQParticipant[];
  last_comment?: IQMessage;
  unread_count: number;
  extras?: Record<string, any>;
}

export interface IQParticipant {
  id: string;
  email: string;
  username: string;
  avatar_url: string;
  extras?: Record<string, any>;
}

export type IQCallback<T> = (data?: T, error?: Error) => void;

export interface IQProgressListener<T> {
  onSuccess?: (data: T) => void;
  onError?: (error: Error) => void;
  onProgress?: (progress: number) => void;
}

export interface Subscription {
  unsubscribe: () => void;
}

// Multichannel API Types
export interface MultichannelInitiateChatRequest {
  app_id: string;
  user_id: string;
  name: string;
  avatar?: string;
  user_properties?: Record<string, any>;
  channel_id: number;
  nonce: string;
}

export interface MultichannelInitiateChatResponse {
  identity_token: string;
  customer_room: {
    room_id: string;
    is_resolved: boolean;
  };
}

export interface MultichannelSession {
  appId: string;
  userId: string;
  userData: any;
  roomId: number;
  isResolved: boolean;
}

export interface InitiateChatResult {
  userId: string;
  roomId: number;
  restored: boolean;
  userData?: any;
}
