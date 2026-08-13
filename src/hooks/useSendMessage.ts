import { useCallback } from 'react';
import { qiscusClient } from '@/client';
import type { QiscusMessage, QiscusUser, UploadFileSource } from '@/client';
import { isImageFile, isVideoFile } from '@/client';

interface SendMessageHook {
  sendText: (roomId: number, text: string, currentUser: QiscusUser) => Promise<QiscusMessage>;
  sendFile: (
    roomId: number,
    file: UploadFileSource,
    currentUser: QiscusUser,
    onProgress?: (percent: number) => void,
  ) => Promise<QiscusMessage>;
  buildOptimistic: (text: string, currentUser: QiscusUser, roomId: number) => QiscusMessage;
}

function uniqueId(): string {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

export function useSendMessage(): SendMessageHook {
  const buildOptimistic = useCallback(
    (text: string, currentUser: QiscusUser, roomId: number): QiscusMessage => ({
      id: Date.now(),
      unique_id: uniqueId(),
      unique_temp_id: uniqueId(),
      room_id: roomId,
      email: currentUser.email,
      username: currentUser.username,
      message: text,
      type: 'text',
      status: 'sending',
      timestamp: Date.now(),
      payload: null,
    }),
    [],
  );

  const sendText = useCallback(
    async (roomId: number, text: string, currentUser: QiscusUser): Promise<QiscusMessage> => {
      const tempId = uniqueId();
      return qiscusClient.sendComment(roomId, text, tempId);
    },
    [],
  );

  const sendFile = useCallback(
    (
      roomId: number,
      file: UploadFileSource,
      currentUser: QiscusUser,
      onProgress?: (percent: number) => void,
    ): Promise<QiscusMessage> => {
      const tempId = uniqueId();
      return new Promise((resolve, reject) => {
        qiscusClient.upload(file, (error, progress, fileURL) => {
          if (error) return reject(error);
          if (progress && onProgress) onProgress(progress.percent);
          if (fileURL) {
            const isMedia = isImageFile(file.name) || isVideoFile(file.name);
            const payload = JSON.stringify({
              type: isMedia ? 'image' : file.type,
              content: { url: fileURL, file_name: file.name, caption: '' },
            });
            qiscusClient
              .sendComment(roomId, `File attachment`, tempId, 'custom', payload)
              .then(resolve)
              .catch(reject);
          }
        });
      });
    },
    [],
  );

  return { sendText, sendFile, buildOptimistic };
}
