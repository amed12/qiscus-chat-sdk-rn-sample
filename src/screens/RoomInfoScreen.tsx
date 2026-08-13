import React, { useCallback, useEffect, useState } from 'react';
import {
  View,
  Text,
  Image,
  FlatList,
  TouchableOpacity,
  TextInput,
  StyleSheet,
  ActivityIndicator,
} from 'react-native';
import { useTranslation } from 'react-i18next';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Toolbar, UserItem } from '@/components';
import { qiscusClient } from '@/client';
import { useAuth } from '@/hooks';
import { colors, spacing, fontSize } from '@/theme';
import type { RootStackParamList } from '@/navigation/types';
import type { QiscusRoom, QiscusParticipant } from '@/client';

type Props = NativeStackScreenProps<RootStackParamList, 'RoomInfo'>;

export function RoomInfoScreen({ navigation, route }: Props) {
  const { t } = useTranslation();
  const { currentUser } = useAuth();
  const { roomId } = route.params;
  const [room, setRoom] = useState<QiscusRoom | null>(null);
  const [loading, setLoading] = useState(true);
  const [isEditingName, setIsEditingName] = useState(false);
  const [roomName, setRoomName] = useState('');

  useEffect(() => {
    qiscusClient
      .getRoomsInfo({ room_ids: [`${roomId}`] })
      .then((res) => {
        const r = res.results.rooms_info[0];
        setRoom(r);
        setRoomName(r?.name ?? '');
      })
      .finally(() => setLoading(false));
  }, [roomId]);

  const isGroup = room?.room_type === 'group';
  const participants = room?.participants.filter((p) => p.email !== currentUser?.email) ?? [];

  const handleSaveName = useCallback(async () => {
    if (!room || !roomName.trim()) return;
    setIsEditingName(false);
    const updated = await qiscusClient.updateRoom({ id: room.id, room_name: roomName.trim() });
    setRoom(updated);
  }, [room, roomName]);

  const handleRemove = useCallback(
    async (participant: QiscusParticipant) => {
      if (!room) return;
      await qiscusClient.removeParticipantsFromGroup(room.id, [participant.email]);
      setRoom((r) =>
        r ? { ...r, participants: r.participants.filter((p) => p.id !== participant.id) } : r,
      );
    },
    [room],
  );

  if (loading) {
    return (
      <View style={[styles.container, styles.centered]}>
        <ActivityIndicator color={colors.primary} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Toolbar
        title={t('roomInfo.title')}
        left={
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Text style={styles.backBtn}>‹</Text>
          </TouchableOpacity>
        }
      />

      <View style={styles.avatarSection}>
        {room?.avatar_url ? (
          <Image source={{ uri: room.avatar_url }} style={styles.avatar} />
        ) : null}
        {isGroup && (
          <View style={styles.nameRow}>
            <TextInput
              style={[styles.nameInput, isEditingName && styles.nameInputEditing]}
              value={roomName}
              onChangeText={setRoomName}
              editable={isEditingName}
              onSubmitEditing={handleSaveName}
            />
            <TouchableOpacity
              style={styles.editBtn}
              onPress={() => (isEditingName ? handleSaveName() : setIsEditingName(true))}
            >
              <Text style={styles.editBtnText}>{isEditingName ? t('common.save') : t('common.edit')}</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>

      {isGroup ? (
        <>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionLabel}>{t('roomInfo.participants')}</Text>
          </View>
          <TouchableOpacity
            style={styles.addParticipantBtn}
            onPress={() => navigation.push('UserList')}
          >
            <Text style={styles.addParticipantText}>{t('roomInfo.addParticipants')}</Text>
          </TouchableOpacity>
          <FlatList<QiscusParticipant>
            data={participants}
            keyExtractor={(p) => `${p.id}`}
            renderItem={({ item }) => (
              <UserItem
                user={{ ...item, avatar_url: item.avatar_url }}
                onPress={() => {}}
                right={
                  <TouchableOpacity style={styles.removeBtn} onPress={() => handleRemove(item)}>
                    <Text style={styles.removeBtnText}>{t('roomInfo.removeParticipant')}</Text>
                  </TouchableOpacity>
                }
              />
            )}
          />
        </>
      ) : (
        <View style={styles.infoSection}>
          <Text style={styles.sectionLabel}>{t('profile.information')}</Text>
          {participants[0] && (
            <>
              <View style={styles.field}>
                <Text style={styles.fieldText}>{participants[0].username}</Text>
              </View>
              <View style={styles.field}>
                <Text style={styles.fieldText}>{participants[0].email}</Text>
              </View>
            </>
          )}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg },
  centered: { alignItems: 'center', justifyContent: 'center' },
  backBtn: { fontSize: 28, color: colors.primary, lineHeight: 32 },
  avatarSection: {
    height: 200,
    backgroundColor: 'lightblue',
    overflow: 'hidden',
    position: 'relative',
  },
  avatar: { width: '100%', height: '100%', resizeMode: 'cover' },
  nameRow: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.2)',
    padding: spacing.sm,
  },
  nameInput: { flex: 1, color: '#fff', fontSize: fontSize.lg, padding: spacing.xs },
  nameInputEditing: { backgroundColor: 'rgba(255,255,255,0.3)', borderRadius: 4 },
  editBtn: { paddingHorizontal: spacing.sm },
  editBtnText: { color: '#fff', fontWeight: '600' },
  sectionHeader: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.md,
    paddingBottom: spacing.xs,
  },
  sectionLabel: {
    fontSize: fontSize.xs,
    fontWeight: '600',
    textTransform: 'uppercase',
    color: colors.textMuted,
    letterSpacing: 0.5,
  },
  addParticipantBtn: {
    padding: spacing.lg,
    backgroundColor: colors.surface,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.border,
  },
  addParticipantText: { color: colors.primary, fontWeight: '600' },
  removeBtn: { paddingHorizontal: spacing.sm },
  removeBtnText: { color: colors.errorSolid, fontSize: fontSize.md },
  infoSection: {
    backgroundColor: colors.surface,
    marginTop: spacing.md,
    paddingHorizontal: spacing.lg,
  },
  field: {
    paddingVertical: spacing.md,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.border,
  },
  fieldText: { fontSize: fontSize.base, color: colors.text },
});
