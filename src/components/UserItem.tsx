import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Avatar } from './Avatar';
import { colors, palette, spacing, fontSize } from '@/theme';
import type { QiscusUser } from '@/client';

interface UserItemProps {
  user: QiscusUser;
  onPress: () => void;
  right?: React.ReactNode;
  selected?: boolean;
}

export function UserItem({ user, onPress, right, selected }: UserItemProps) {
  return (
    <TouchableOpacity
      style={[styles.container, selected && styles.containerSelected]}
      onPress={onPress}
    >
      <Avatar uri={user.avatar_url} name={user.username} size={40} />
      <View style={styles.body}>
        <Text style={styles.name} numberOfLines={1}>{user.username}</Text>
        <Text style={styles.email} numberOfLines={1}>{user.email}</Text>
      </View>
      {right}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    backgroundColor: colors.surface,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.border,
  },
  containerSelected: { backgroundColor: palette.telaga50 },
  body: { flex: 1, marginLeft: spacing.md },
  name: { fontSize: fontSize.base, fontWeight: '600', color: colors.text },
  email: { fontSize: fontSize.md, color: colors.textMuted },
});
