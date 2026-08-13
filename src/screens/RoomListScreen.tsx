import React from 'react';
import {
  View,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  Text,
  ActivityIndicator,
} from 'react-native';
import { useTranslation } from 'react-i18next';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Toolbar, RoomItem, Avatar } from '@/components';
import { useAuth, useRooms, usePushToken } from '@/hooks';
import { colors } from '@/theme';
import type { RootStackParamList } from '@/navigation/types';
import type { QiscusRoom } from '@/client';

type Props = NativeStackScreenProps<RootStackParamList, 'RoomList'>;

export function RoomListScreen({ navigation }: Props) {
  const { t } = useTranslation();
  const { currentUser } = useAuth();
  const { rooms, loading } = useRooms();
  usePushToken(true);

  const handleRoomPress = (roomId: number) => {
    navigation.push('Chat', { roomId });
  };

  return (
    <View style={styles.container}>
      <Toolbar
        title={t('roomList.title')}
        left={
          <TouchableOpacity onPress={() => navigation.push('Profile')}>
            <Avatar uri={currentUser?.avatar_url} name={currentUser?.username} size={30} />
          </TouchableOpacity>
        }
        right={
          <TouchableOpacity onPress={() => navigation.push('UserList')}>
            <Avatar name="+" size={30} />
          </TouchableOpacity>
        }
      />
      {loading && rooms.length === 0 ? (
        <ActivityIndicator style={styles.loader} color={colors.primary} />
      ) : rooms.length === 0 ? (
        <View style={styles.empty}>
          <Text style={styles.emptyText}>{t('roomList.empty')}</Text>
        </View>
      ) : (
        <FlatList<QiscusRoom>
          data={rooms}
          keyExtractor={(r) => `${r.id}`}
          renderItem={({ item }) => (
            <RoomItem room={item} onPress={handleRoomPress} />
          )}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg },
  loader: { flex: 1 },
  empty: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  emptyText: { color: colors.textMuted },
});
