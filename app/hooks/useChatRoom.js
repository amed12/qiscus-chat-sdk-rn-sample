/**
 * Custom Hook for Chat Room Management
 * Handles room loading, messages, and event listeners
 */
import { useEffect, useCallback } from 'react';
import * as Qiscus from '../qiscus';
import { qiscusEvents } from '../qiscus';
import { useChatStore } from '../store/chatStore';
import { updateMessageStatus } from '../utils/messageUtils';
import { MESSAGE_STATUS, TIMING } from '../config/constants';
import debounce from 'lodash/debounce';

export const useChatRoom = (roomId) => {
  const {
    setRoom,
    addMessage,
    updateMessage,
    addMessages,
    setLoadMoreable,
    setOnlineStatus,
    setTyping,
    messages,
    getMessages,
  } = useChatStore();

  /**
   * Load room data and messages
   */
  const loadRoomData = useCallback(async () => {
    try {
      if (!Qiscus.qiscus.isLogin || !Qiscus.qiscus.userData) {
        console.log('[useChatRoom] User not logged in');
        return;
      }

      // Set room
      const room = { id: roomId };
      setRoom(room);

      // Wait for Qiscus to be ready
      await new Promise(resolve => setTimeout(resolve, TIMING.QISCUS_INIT_DELAY));

      // Load messages
      const loadedMessages = await Qiscus.qiscus.loadComments(roomId);
      const message = loadedMessages[0] || {};
      const isLoadMoreable = message.comment_before_id !== 0;

      const formattedMessages = loadedMessages.reduce((result, msg) => {
        result[msg.unique_temp_id] = msg;
        return result;
      }, {});

      addMessages(loadedMessages);
      setLoadMoreable(isLoadMoreable);
    } catch (error) {
      console.error('[useChatRoom] Error loading room data:', error);
    }
  }, [roomId, setRoom, addMessages, setLoadMoreable]);

  /**
   * Handle new message
   */
  const handleNewMessage = useCallback((message) => {
    console.log('[useChatRoom] New message received:', message);
    addMessage(message);
  }, [addMessage]);

  /**
   * Handle message read
   */
  const handleMessageRead = useCallback(({ comment }) => {
    const messagesArray = getMessages();
    const updatedMessages = updateMessageStatus(
      messagesArray,
      comment,
      MESSAGE_STATUS.READ
    );
    
    Object.values(updatedMessages).forEach(msg => {
      addMessage(msg);
    });
  }, [getMessages, addMessage]);

  /**
   * Handle message delivered
   */
  const handleMessageDelivered = useCallback(({ comment }) => {
    const messagesArray = getMessages();
    const updatedMessages = updateMessageStatus(
      messagesArray,
      comment,
      MESSAGE_STATUS.DELIVERED
    );
    
    Object.values(updatedMessages).forEach(msg => {
      addMessage(msg);
    });
  }, [getMessages, addMessage]);

  /**
   * Handle online presence
   */
  const handlePresence = useCallback((data) => {
    setOnlineStatus(data.isOnline, data.lastOnline);
  }, [setOnlineStatus]);

  /**
   * Handle typing indicator
   */
  const handleTyping = useCallback(
    debounce(({ username, room_id }) => {
      if (Number(room_id) === roomId) {
        setTyping(true, username);
        setTimeout(() => {
          setTyping(false, null);
        }, TIMING.TYPING_INDICATOR_TIMEOUT);
      }
    }, TIMING.TYPING_DEBOUNCE_DELAY),
    [roomId, setTyping]
  );

  /**
   * Load more messages
   */
  const loadMoreMessages = useCallback(async () => {
    const messagesArray = getMessages();
    if (messagesArray.length === 0) return;

    const lastCommentId = messagesArray[0].id;

    try {
      const loadedMessages = await Qiscus.qiscus.loadComments(roomId, {
        last_comment_id: lastCommentId,
      });

      const isLoadMoreable = loadedMessages[0]?.comment_before_id !== 0;
      addMessages(loadedMessages);
      setLoadMoreable(isLoadMoreable);
    } catch (error) {
      console.error('[useChatRoom] Error loading more messages:', error);
    }
  }, [roomId, getMessages, addMessages, setLoadMoreable]);

  /**
   * Send text message
   */
  const sendMessage = useCallback(async (text, tempMessage) => {
    try {
      const response = await Qiscus.qiscus.sendComment(
        roomId,
        text,
        tempMessage.unique_temp_id
      );
      updateMessage(tempMessage, response);
      return response;
    } catch (error) {
      console.error('[useChatRoom] Error sending message:', error);
      throw error;
    }
  }, [roomId, updateMessage]);

  /**
   * Setup event listeners
   */
  useEffect(() => {
    const listeners = {
      newMessage: (messages) => messages.forEach(handleNewMessage),
      read: handleMessageRead,
      delivered: handleMessageDelivered,
      presence: handlePresence,
      typing: handleTyping,
    };

    qiscusEvents.on('new-messages', listeners.newMessage);
    qiscusEvents.on('comment-read', listeners.read);
    qiscusEvents.on('comment-delivered', listeners.delivered);
    qiscusEvents.on('presence', listeners.presence);
    qiscusEvents.on('typing', listeners.typing);

    return () => {
      qiscusEvents.off('new-messages', listeners.newMessage);
      qiscusEvents.off('comment-read', listeners.read);
      qiscusEvents.off('comment-delivered', listeners.delivered);
      qiscusEvents.off('presence', listeners.presence);
      qiscusEvents.off('typing', listeners.typing);
      
      Qiscus.qiscus.exitChatRoom();
    };
  }, [handleNewMessage, handleMessageRead, handleMessageDelivered, handlePresence, handleTyping]);

  /**
   * Load room on mount
   */
  useEffect(() => {
    if (roomId) {
      loadRoomData();
    }
  }, [roomId, loadRoomData]);

  return {
    loadMoreMessages,
    sendMessage,
  };
};

export default useChatRoom;
