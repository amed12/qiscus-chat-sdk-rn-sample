import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { format, isToday } from 'date-fns';
import { Avatar } from './Avatar';
import { colors, spacing, fontSize } from '@/theme';
import type { QiscusRoom } from '@/client';

interface RoomItemProps {
  room: QiscusRoom;
  onPress: (roomId: number) => void;
}

export function RoomItem({ room, onPress }: RoomItemProps) {
  const lastTime = room.last_comment_timestamp
    ? (() => {
        const d = new Date(room.last_comment_timestamp);
        return isToday(d) ? format(d, 'HH:mm') : format(d, 'dd/MM/yy');
      })()
    : '';

  return (
    <TouchableOpacity style={styles.container} onPress={() => onPress(room.id)}>
      <Avatar uri={room.avatar_url} name={room.name} size={46} />
      <View style={styles.body}>
        <View style={styles.headerRow}>
          <Text style={styles.name} numberOfLines={1}>
            {room.name}
          </Text>
          <Text style={styles.time}>{lastTime}</Text>
        </View>
        <View style={styles.previewRow}>
          <Text style={styles.lastMsg} numberOfLines={1}>
            {room.last_comment_message ?? ''}
          </Text>
          {room.unread_count > 0 && (
            <View style={styles.badge}>
              <Text style={styles.badgeText}>
                {room.unread_count > 99 ? '99+' : room.unread_count}
              </Text>
            </View>
          )}
        </View>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    backgroundColor: colors.surface,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.border,
  },
  body: { flex: 1, marginLeft: spacing.md },
  headerRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 2 },
  previewRow: { flexDirection: 'row', alignItems: 'center' },
  name: {
    flex: 1,
    fontSize: fontSize.base,
    fontWeight: '600',
    color: colors.textPrimary,
  },
  time: { fontSize: fontSize.xs, color: colors.textMuted },
  lastMsg: { flex: 1, fontSize: fontSize.md, color: colors.textSecondary },
  badge: {
    backgroundColor: colors.primary,
    borderRadius: 10,
    minWidth: 20,
    height: 20,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 4,
  },
  badgeText: { color: colors.onPrimary, fontSize: fontSize.xs, fontWeight: '700' },
});
