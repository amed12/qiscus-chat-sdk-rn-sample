import React, { useCallback, useEffect, useState } from 'react';
import { View, FlatList, TouchableOpacity, StyleSheet, Text, ActivityIndicator } from 'react-native';
import { useTranslation } from 'react-i18next';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Toolbar, UserItem } from '@/components';
import { qiscusClient } from '@/client';
import { colors, spacing, fontSize } from '@/theme';
import type { RootStackParamList } from '@/navigation/types';
import type { QiscusUser } from '@/client';

type Props = NativeStackScreenProps<RootStackParamList, 'UserList'>;

export function UserListScreen({ navigation }: Props) {
  const { t } = useTranslation();
  const [users, setUsers] = useState<QiscusUser[]>([]);
  const [loading, setLoading] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const { users: list } = await qiscusClient.getUsers(null, 1, 100);
      setUsers(list);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const handleUserPress = useCallback(
    async (userId: string) => {
      try {
        const room = await qiscusClient.chatTarget(userId);
        navigation.push('Chat', { roomId: room.id });
      } catch (e) {
        // user already navigated away
      }
    },
    [navigation],
  );

  return (
    <View style={styles.container}>
      <Toolbar
        title={t('userList.title')}
        left={
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Text style={styles.backBtn}>‹</Text>
          </TouchableOpacity>
        }
      />

      <TouchableOpacity style={styles.groupBtn} onPress={() => navigation.push('CreateGroup')}>
        <Text style={styles.groupBtnText}>{t('userList.createGroup')}</Text>
      </TouchableOpacity>

      <View style={styles.sectionHeader}>
        <Text style={styles.sectionLabel}>{t('userList.contact')}</Text>
      </View>

      {loading ? (
        <ActivityIndicator style={styles.loader} color={colors.primary} />
      ) : (
        <FlatList<QiscusUser>
          data={users}
          keyExtractor={(u) => u.email}
          renderItem={({ item }) => (
            <UserItem user={item} onPress={() => handleUserPress(item.email)} />
          )}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  loader: { flex: 1 },
  backBtn: { fontSize: 28, color: colors.primary, lineHeight: 32 },
  groupBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.lg,
    backgroundColor: colors.surface,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.border,
  },
  groupBtnText: { fontSize: fontSize.base, color: colors.textPrimary },
  sectionHeader: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    backgroundColor: colors.background,
  },
  sectionLabel: {
    fontSize: fontSize.xs,
    fontWeight: '600',
    textTransform: 'uppercase',
    color: colors.textSecondary,
    letterSpacing: 0.5,
  },
});
