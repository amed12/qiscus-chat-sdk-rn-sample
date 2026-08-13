import React, { useCallback, useRef } from 'react';
import {
  View,
  FlatList,
  Text,
  TouchableOpacity,
  StyleSheet,
  Modal,
  Button,
  Alert,
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import * as DocumentPicker from 'expo-document-picker';
import { format, isSameDay } from 'date-fns';
import { useTranslation } from 'react-i18next';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Toolbar, MessageBubble, MessageInput, TypingIndicator, Avatar } from '@/components';
import { useAuth, useMessages, useSendMessage, useTyping, useOnlinePresence } from '@/hooks';
import { isUnsupportedFileType, fileSizeMB, MAX_FILE_SIZE_MB, MAX_IMAGE_SIZE_MB } from '@/client';
import { colors, spacing, fontSize } from '@/theme';
import type { RootStackParamList } from '@/navigation/types';
import type { QiscusMessage } from '@/client';

type Props = NativeStackScreenProps<RootStackParamList, 'Chat'>;

type ListItem = QiscusMessage | { id: string; type: 'date'; message: string };

function buildListItems(messages: QiscusMessage[]): ListItem[] {
  const items: ListItem[] = [];
  for (let i = 0; i < messages.length; i++) {
    const msg = messages[i];
    const prev = messages[i - 1];
    const msgDate = new Date(msg.timestamp);
    const prevDate = prev ? new Date(prev.timestamp) : null;
    if (!prevDate || !isSameDay(msgDate, prevDate)) {
      items.push({ id: `date-${msg.id}`, type: 'date', message: format(msgDate, 'dd MMM yyyy') });
    }
    items.push(msg);
  }
  return items;
}

export function ChatScreen({ navigation, route }: Props) {
  const { t } = useTranslation();
  const { roomId } = route.params;
  const { currentUser } = useAuth();
  const { room, messages, isLoadMoreable, loadMore, addOptimistic, updateMessage } =
    useMessages(roomId);
  const { sendText, sendFile, buildOptimistic } = useSendMessage();
  const { isTyping, typingUsername } = useTyping(roomId);
  const presence = useOnlinePresence();
  const listRef = useRef<FlatList>(null);
  const [attachModalVisible, setAttachModalVisible] = React.useState(false);

  const isGroup = room?.room_type === 'group';
  const participants = room?.participants
    .slice(0, 3)
    .map((p) => p.username.split(' ')[0])
    .join(', ') ?? '';

  const scrollToBottom = useCallback(() => {
    listRef.current?.scrollToEnd({ animated: true });
  }, []);

  const handleSend = useCallback(
    async (text: string) => {
      if (!currentUser) return;
      const optimistic = buildOptimistic(text, currentUser, roomId);
      addOptimistic(optimistic);
      scrollToBottom();
      try {
        const sent = await sendText(roomId, text, currentUser);
        updateMessage(optimistic.unique_temp_id, sent);
      } catch {
        updateMessage(optimistic.unique_temp_id, { ...optimistic, status: 'failed' });
      }
    },
    [currentUser, buildOptimistic, roomId, addOptimistic, scrollToBottom, sendText, updateMessage],
  );

  const handleFilePick = useCallback(async () => {
    setAttachModalVisible(false);
    const result = await DocumentPicker.getDocumentAsync({ multiple: false });
    if (result.canceled || !result.assets.length) return;
    const asset = result.assets[0];
    if (isUnsupportedFileType(asset.name)) {
      return Alert.alert('Error', t('chat.fileUnsupported'));
    }
    const sizeMB = fileSizeMB(asset.size ?? 0);
    if (sizeMB > MAX_FILE_SIZE_MB) {
      return Alert.alert('Error', t('chat.fileTooLarge', { max: MAX_FILE_SIZE_MB }));
    }
    if (!currentUser) return;
    const file = { uri: asset.uri, name: asset.name, type: asset.mimeType ?? 'application/octet-stream' };
    const optimistic = buildOptimistic(`File: ${asset.name}`, currentUser, roomId);
    addOptimistic(optimistic);
    try {
      const sent = await sendFile(roomId, file, currentUser);
      updateMessage(optimistic.unique_temp_id, sent);
    } catch {
      updateMessage(optimistic.unique_temp_id, { ...optimistic, status: 'failed' });
    }
  }, [t, currentUser, buildOptimistic, roomId, addOptimistic, sendFile, updateMessage]);

  const handleImagePick = useCallback(async () => {
    setAttachModalVisible(false);
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.All,
      allowsMultipleSelection: false,
    });
    if (result.canceled || !result.assets.length) return;
    const asset = result.assets[0];
    const sizeMB = fileSizeMB(asset.fileSize ?? 0);
    if (sizeMB > MAX_IMAGE_SIZE_MB) {
      return Alert.alert('Error', t('chat.fileTooLarge', { max: MAX_IMAGE_SIZE_MB }));
    }
    if (!currentUser) return;
    const ext = asset.uri.split('.').pop() ?? 'jpg';
    const name = `image.${ext}`;
    const file = { uri: asset.uri, name, type: asset.type ?? 'image/jpeg' };
    const optimistic = buildOptimistic('Image', currentUser, roomId);
    addOptimistic(optimistic);
    try {
      const sent = await sendFile(roomId, file, currentUser);
      updateMessage(optimistic.unique_temp_id, sent);
    } catch {
      updateMessage(optimistic.unique_temp_id, { ...optimistic, status: 'failed' });
    }
  }, [t, currentUser, buildOptimistic, roomId, addOptimistic, sendFile, updateMessage]);

  const listItems = buildListItems(messages);

  const renderItem = ({ item }: { item: ListItem }) => {
    if (item.type === 'date') {
      return (
        <View style={styles.dateRow}>
          <View style={styles.dateBadge}>
            <Text style={styles.dateText}>{item.message}</Text>
          </View>
        </View>
      );
    }
    const msg = item as QiscusMessage;
    const isMe = msg.email === currentUser?.email;
    return <MessageBubble message={msg} isMe={isMe} />;
  };

  return (
    <View style={styles.container}>
      <Toolbar
        title={room?.name ?? 'Chat'}
        left={
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Avatar uri={room?.avatar_url} name={room?.name} size={28} />
          </TouchableOpacity>
        }
        right={
          <TouchableOpacity onPress={() => navigation.push('RoomInfo', { roomId })}>
            <Text style={styles.infoBtn}>ⓘ</Text>
          </TouchableOpacity>
        }
        meta={
          <View>
            {!isGroup && !isTyping && presence.isOnline && (
              <Text style={styles.onlineText}>{t('chat.online')}</Text>
            )}
            <TypingIndicator visible={isTyping && !isGroup} username={typingUsername} />
            {isGroup && <Text style={styles.participantsText}>{participants}</Text>}
          </View>
        }
      />

      <FlatList<ListItem>
        ref={listRef}
        data={listItems}
        keyExtractor={(item) => {
          if ('unique_temp_id' in item) return item.unique_temp_id;
          return item.id;
        }}
        renderItem={renderItem}
        onEndReached={isLoadMoreable ? loadMore : undefined}
        onEndReachedThreshold={0.2}
        onContentSizeChange={scrollToBottom}
        style={styles.list}
      />

      <MessageInput onSend={handleSend} onAttach={() => setAttachModalVisible(true)} />

      <Modal
        visible={attachModalVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setAttachModalVisible(false)}
      >
        <TouchableOpacity style={styles.modalOverlay} onPress={() => setAttachModalVisible(false)}>
          <View style={styles.modalSheet}>
            <Button title="Image / Video" onPress={handleImagePick} />
            <View style={styles.modalDivider} />
            <Button title="File" onPress={handleFilePick} />
          </View>
        </TouchableOpacity>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  list: { flex: 1 },
  dateRow: { alignItems: 'center', marginVertical: spacing.sm },
  dateBadge: {
    backgroundColor: colors.primary,
    borderRadius: 12,
    paddingHorizontal: spacing.md,
    paddingVertical: 3,
  },
  dateText: { color: colors.onPrimary, fontSize: fontSize.xs },
  onlineText: { fontSize: fontSize.xs, color: colors.online },
  participantsText: { fontSize: fontSize.xs, color: colors.textMuted },
  infoBtn: { fontSize: 20, color: colors.primary },
  modalOverlay: { flex: 1, justifyContent: 'flex-end', backgroundColor: 'rgba(0,0,0,0.3)' },
  modalSheet: {
    backgroundColor: colors.surface,
    padding: spacing.xl,
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
  },
  modalDivider: { height: spacing.sm },
});
