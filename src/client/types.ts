export interface QiscusUser {
  id: number;
  email: string;
  username: string;
  avatar_url: string;
  extras?: Record<string, unknown>;
}

export interface QiscusParticipant {
  id: number;
  email: string;
  username: string;
  avatar_url: string;
  last_message_received_id?: number;
  last_message_read_id?: number;
}

export type RoomType = 'single' | 'group' | 'channel';

export interface QiscusRoom {
  id: number;
  name: string;
  avatar_url: string;
  room_type: RoomType;
  chat_type?: string;
  unique_id: string;
  count_notif: number;
  unread_count: number;
  last_comment_message?: string;
  last_comment_timestamp?: string;
  participants: QiscusParticipant[];
}

export type MessageStatus = 'sending' | 'sent' | 'delivered' | 'read' | 'failed';
export type MessageType = 'text' | 'custom' | 'upload' | 'date';

export interface MessagePayload {
  type: string;
  content: {
    url: string;
    file_name: string;
    caption?: string;
    size?: number;
  };
}

export interface QiscusMessage {
  id: number;
  unique_id: string;
  unique_temp_id: string;
  room_id: number;
  email: string;
  username: string;
  message: string;
  type: MessageType | string;
  status: MessageStatus;
  timestamp: number;
  payload?: MessagePayload | null;
  comment_before_id?: number;
}

export interface UploadFileSource {
  uri: string;
  name: string;
  type: string;
  size?: number;
}

export interface OnlinePresence {
  isOnline: boolean;
  lastOnline: Date;
}

export interface TypingData {
  room_id: string;
  username: string;
  isTyping: boolean;
}
