import React, { useCallback, useEffect, useState } from 'react';
import {
  View,
  FlatList,
  TouchableOpacity,
  Text,
  TextInput,
  StyleSheet,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { useTranslation } from 'react-i18next';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Toolbar, UserItem } from '@/components';
import { qiscusClient } from '@/client';
import { colors, spacing, fontSize } from '@/theme';
import type { RootStackParamList } from '@/navigation/types';
import type { QiscusUser } from '@/client';

type Props = NativeStackScreenProps<RootStackParamList, 'CreateGroup'>;
type Page = 'choose' | 'info';

export function CreateGroupScreen({ navigation }: Props) {
  const { t } = useTranslation();
  const [page, setPage] = useState<Page>('choose');
  const [users, setUsers] = useState<QiscusUser[]>([]);
  const [selected, setSelected] = useState<QiscusUser[]>([]);
  const [groupName, setGroupName] = useState('');
  const [loading, setLoading] = useState(false);
  const [creating, setCreating] = useState(false);

  useEffect(() => {
    setLoading(true);
    qiscusClient
      .getUsers(null, 1, 100)
      .then(({ users: list }) => setUsers(list))
      .finally(() => setLoading(false));
  }, []);

  const toggleSelect = useCallback((user: QiscusUser) => {
    setSelected((prev) =>
      prev.find((u) => u.email === user.email)
        ? prev.filter((u) => u.email !== user.email)
        : [...prev, user],
    );
  }, []);

  const handleCreate = useCallback(async () => {
    if (!groupName.trim()) return Alert.alert('Error', t('createGroup.groupName'));
    if (selected.length === 0) return;
    setCreating(true);
    try {
      const userIds = selected.map((u) => u.email);
      const room = await qiscusClient.createGroupRoom(groupName.trim(), userIds);
      navigation.replace('Chat', { roomId: room.id });
    } catch {
      Alert.alert('Error', t('common.error'));
    } finally {
      setCreating(false);
    }
  }, [groupName, selected, navigation, t]);

  if (page === 'info') {
    return (
      <View style={styles.container}>
        <Toolbar
          title={t('createGroup.groupName')}
          left={
            <TouchableOpacity onPress={() => setPage('choose')}>
              <Text style={styles.backBtn}>‹</Text>
            </TouchableOpacity>
          }
          right={
            <TouchableOpacity onPress={handleCreate} disabled={creating}>
              {creating ? (
                <ActivityIndicator color={colors.primary} />
              ) : (
                <Text style={styles.doneBtn}>{t('createGroup.create')}</Text>
              )}
            </TouchableOpacity>
          }
        />
        <View style={styles.nameField}>
          <TextInput
            style={styles.nameInput}
            placeholder={t('createGroup.groupNamePlaceholder')}
            placeholderTextColor={colors.textMuted}
            value={groupName}
            onChangeText={setGroupName}
            autoFocus
          />
        </View>
        <Text style={styles.sectionLabel}>
          {selected.length} {t('createGroup.chooseMembers')}
        </Text>
        <FlatList<QiscusUser>
          data={selected}
          keyExtractor={(u) => u.email}
          renderItem={({ item }) => (
            <UserItem user={item} onPress={() => toggleSelect(item)} selected />
          )}
        />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Toolbar
        title={t('createGroup.chooseMembers')}
        left={
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Text style={styles.backBtn}>‹</Text>
          </TouchableOpacity>
        }
        right={
          selected.length > 0 ? (
            <TouchableOpacity onPress={() => setPage('info')}>
              <Text style={styles.doneBtn}>Next</Text>
            </TouchableOpacity>
          ) : null
        }
      />
      {loading ? (
        <ActivityIndicator style={styles.loader} color={colors.primary} />
      ) : (
        <FlatList<QiscusUser>
          data={users}
          keyExtractor={(u) => u.email}
          renderItem={({ item }) => (
            <UserItem
              user={item}
              onPress={() => toggleSelect(item)}
              selected={!!selected.find((u) => u.email === item.email)}
            />
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
  doneBtn: { fontSize: fontSize.base, color: colors.primary, fontWeight: '600' },
  nameField: {
    backgroundColor: colors.surface,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.border,
  },
  nameInput: { fontSize: fontSize.lg, color: colors.textPrimary },
  sectionLabel: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    fontSize: fontSize.xs,
    fontWeight: '600',
    textTransform: 'uppercase',
    color: colors.textSecondary,
  },
});
