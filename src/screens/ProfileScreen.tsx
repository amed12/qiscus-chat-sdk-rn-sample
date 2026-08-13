import React, { useCallback, useRef, useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Image,
  ImageBackground,
  StyleSheet,
  Alert,
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { useTranslation } from 'react-i18next';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Toolbar } from '@/components';
import { useAuth } from '@/hooks';
import { qiscusClient } from '@/client';
import { colors, spacing, fontSize } from '@/theme';
import type { RootStackParamList } from '@/navigation/types';

type Props = NativeStackScreenProps<RootStackParamList, 'Profile'>;

export function ProfileScreen({ navigation }: Props) {
  const { t } = useTranslation();
  const { currentUser, logout } = useAuth();
  const [displayName, setDisplayName] = useState(currentUser?.username ?? '');
  const [avatarUri, setAvatarUri] = useState(currentUser?.avatar_url ?? '');
  const [isEditingName, setIsEditingName] = useState(false);
  const inputRef = useRef<TextInput>(null);

  const handleLogout = useCallback(async () => {
    await logout();
    navigation.replace('Login');
  }, [logout, navigation]);

  const handlePickAvatar = useCallback(async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
    });
    if (result.canceled || !result.assets.length) return;
    const asset = result.assets[0];
    const ext = asset.uri.split('.').pop() ?? 'jpg';
    const file = { uri: asset.uri, name: `avatar.${ext}`, type: `image/${ext}` };
    qiscusClient.upload(file, (error, _progress, url) => {
      if (error) return Alert.alert('Error', t('common.error'));
      if (url) {
        setAvatarUri(url);
        qiscusClient.updateProfile({ avatar_url: url }).catch(() => {});
      }
    });
  }, [t]);

  const handleSubmitName = useCallback(async () => {
    if (!displayName.trim()) return;
    setIsEditingName(false);
    try {
      await qiscusClient.updateProfile({});
    } catch {
      // non-critical
    }
  }, [displayName]);

  const handleEditName = useCallback(() => {
    setIsEditingName(true);
    setTimeout(() => inputRef.current?.focus(), 100);
  }, []);

  const avatarUrl = avatarUri || 'https://via.placeholder.com/500x500';

  return (
    <View style={styles.container}>
      <Toolbar
        title={t('profile.title')}
        left={
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Text style={styles.backBtn}>‹</Text>
          </TouchableOpacity>
        }
      />

      <View style={styles.avatarSection}>
        <ImageBackground source={{ uri: avatarUrl }} style={styles.avatarBg}>
          <TouchableOpacity style={styles.cameraBtn} onPress={handlePickAvatar}>
            <Text style={styles.cameraBtnText}>📷</Text>
          </TouchableOpacity>
        </ImageBackground>
      </View>

      <View style={styles.infoSection}>
        <Text style={styles.sectionHeader}>{t('profile.information')}</Text>

        {/* Display name */}
        <View style={styles.field}>
          <TextInput
            ref={inputRef}
            style={styles.fieldInput}
            value={displayName}
            onChangeText={setDisplayName}
            editable={isEditingName}
            onSubmitEditing={handleSubmitName}
          />
          {!isEditingName && (
            <TouchableOpacity style={styles.fieldAction} onPress={handleEditName}>
              <Text style={styles.fieldActionText}>{t('common.edit')}</Text>
            </TouchableOpacity>
          )}
        </View>

        {/* User ID */}
        <View style={styles.field}>
          <TextInput
            style={styles.fieldInput}
            value={currentUser?.email ?? ''}
            editable={false}
          />
        </View>

        {/* Logout */}
        <TouchableOpacity style={styles.logoutBtn} onPress={handleLogout}>
          <Text style={styles.logoutText}>{t('common.logout')}</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  backBtn: { fontSize: 28, color: colors.primary, lineHeight: 32 },
  avatarSection: { height: 280, backgroundColor: 'lightblue' },
  avatarBg: { flex: 1 },
  cameraBtn: {
    position: 'absolute',
    bottom: 10,
    right: 10,
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: 'rgba(255,255,255,0.8)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  cameraBtnText: { fontSize: 20 },
  infoSection: { flex: 1, backgroundColor: colors.bg },
  sectionHeader: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    fontSize: fontSize.xs,
    fontWeight: '600',
    textTransform: 'uppercase',
    color: colors.textMuted,
  },
  field: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.border,
    paddingHorizontal: spacing.lg,
    height: 46,
  },
  fieldInput: { flex: 1, fontSize: fontSize.base, color: colors.text },
  fieldAction: { paddingLeft: spacing.sm },
  fieldActionText: { color: colors.primary, fontSize: fontSize.md },
  logoutBtn: {
    marginTop: 'auto',
    paddingHorizontal: spacing.lg,
    height: 46,
    justifyContent: 'center',
    backgroundColor: colors.surface,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: colors.border,
  },
  logoutText: { color: colors.errorSolid, fontSize: fontSize.base },
});
