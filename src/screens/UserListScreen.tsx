import React, { useCallback, useState } from 'react';
import {
  View,
  TouchableOpacity,
  StyleSheet,
  Text,
  TextInput,
  ActivityIndicator,
  Alert,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { useTranslation } from 'react-i18next';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Toolbar } from '@/components';
import { qiscusClient } from '@/client';
import { colors, spacing, fontSize, radius } from '@/theme';
import type { RootStackParamList } from '@/navigation/types';

type Props = NativeStackScreenProps<RootStackParamList, 'UserList'>;
type Tab = 'single' | 'group' | 'channel';

export function UserListScreen({ navigation }: Props) {
  const { t } = useTranslation();
  const insets = useSafeAreaInsets();
  const [activeTab, setActiveTab] = useState<Tab>('single');

  // Forms state
  const [submitting, setSubmitting] = useState(false);
  
  // Single Tab
  const [singleUserId, setSingleUserId] = useState('');
  
  // Group Tab
  const [groupName, setGroupName] = useState('');
  const [groupIdsInput, setGroupIdsInput] = useState('');
  const [groupAvatarUrl, setGroupAvatarUrl] = useState('');

  // Channel Tab
  const [channelId, setChannelId] = useState('');
  const [channelName, setChannelName] = useState('');
  const [channelAvatarUrl, setChannelAvatarUrl] = useState('');

  // Actions
  const handleStartSingleChat = useCallback(
    async (userId: string) => {
      const trimmed = userId.trim();
      if (!trimmed) return;
      setSubmitting(true);
      try {
        const room = await qiscusClient.chatTarget(trimmed);
        navigation.push('Chat', { roomId: room.id });
      } catch (e) {
        console.error(e);
        Alert.alert('Error', t('userList.chatError'));
      } finally {
        setSubmitting(false);
      }
    },
    [navigation, t],
  );

  const handleCreateGroup = useCallback(async () => {
    const nameTrimmed = groupName.trim();
    const idsTrimmed = groupIdsInput.trim();
    if (!nameTrimmed || !idsTrimmed) return;
    
    setSubmitting(true);
    try {
      const userIds = idsTrimmed
        .split(',')
        .map((id) => id.trim())
        .filter((id) => id.length > 0);

      const room = await qiscusClient.createGroupRoom(
        nameTrimmed,
        userIds,
        groupAvatarUrl.trim() || undefined,
      );
      navigation.push('Chat', { roomId: room.id });
    } catch (e) {
      console.error(e);
      Alert.alert('Error', t('userList.groupError'));
    } finally {
      setSubmitting(false);
    }
  }, [groupName, groupIdsInput, groupAvatarUrl, navigation, t]);

  const handleCreateJoinChannel = useCallback(async () => {
    const chanIdTrimmed = channelId.trim();
    const chanNameTrimmed = channelName.trim();
    const avatarTrimmed = channelAvatarUrl.trim();
    if (!chanIdTrimmed) return;

    setSubmitting(true);
    try {
      const room = await qiscusClient.getOrCreateRoomByChannel(
        chanIdTrimmed,
        chanNameTrimmed || undefined,
        avatarTrimmed || undefined,
      );

      // If metadata updates are provided, ensure room is updated
      if (chanNameTrimmed || avatarTrimmed) {
        await qiscusClient.updateRoom({
          id: room.id,
          room_name: chanNameTrimmed || undefined,
          avatar_url: avatarTrimmed || undefined,
        });
      }
      navigation.push('Chat', { roomId: room.id });
    } catch (e) {
      console.error(e);
      Alert.alert('Error', t('userList.channelError'));
    } finally {
      setSubmitting(false);
    }
  }, [channelId, channelName, channelAvatarUrl, navigation, t]);

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

      {/* Tab Switcher */}
      <View style={styles.tabContainer}>
        <TouchableOpacity
          style={[styles.tabButton, activeTab === 'single' && styles.tabButtonActive]}
          onPress={() => setActiveTab('single')}
        >
          <Text style={[styles.tabText, activeTab === 'single' && styles.tabTextActive]}>
            {t('userList.tabSingle')}
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tabButton, activeTab === 'group' && styles.tabButtonActive]}
          onPress={() => setActiveTab('group')}
        >
          <Text style={[styles.tabText, activeTab === 'group' && styles.tabTextActive]}>
            {t('userList.tabGroup')}
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tabButton, activeTab === 'channel' && styles.tabButtonActive]}
          onPress={() => setActiveTab('channel')}
        >
          <Text style={[styles.tabText, activeTab === 'channel' && styles.tabTextActive]}>
            {t('userList.tabChannel')}
          </Text>
        </TouchableOpacity>
      </View>

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={{ flex: 1 }}
      >
        {activeTab === 'single' && (
          <ScrollView contentContainerStyle={[styles.formScroll, { paddingBottom: insets.bottom + spacing.xl }]}>
            <View style={styles.formContainer}>
              <Text style={styles.formLabel}>{t('auth.userId')}</Text>
              <View style={styles.inputWrapper}>
                <TextInput
                  style={styles.input}
                  placeholder={t('userList.userIdPlaceholder')}
                  placeholderTextColor={colors.textPlaceholder}
                  value={singleUserId}
                  onChangeText={setSingleUserId}
                  autoCapitalize="none"
                  autoCorrect={false}
                />
              </View>
              <Text style={styles.helperText}>{t('userList.userIdHelper')}</Text>

              <TouchableOpacity
                style={[
                  styles.submitBtn,
                  (!singleUserId.trim() || submitting) && styles.submitBtnDisabled,
                ]}
                disabled={!singleUserId.trim() || submitting}
                onPress={() => handleStartSingleChat(singleUserId)}
              >
                {submitting ? (
                  <ActivityIndicator color={colors.onPrimary} size="small" />
                ) : (
                  <Text style={styles.submitBtnText}>{t('userList.btnStartChat')}</Text>
                )}
              </TouchableOpacity>
            </View>
          </ScrollView>
        )}

        {activeTab === 'group' && (
          <ScrollView contentContainerStyle={[styles.formScroll, { paddingBottom: insets.bottom + spacing.xl }]}>
            <View style={styles.formContainer}>
              <Text style={styles.formLabel}>{t('userList.groupNameLabel')}</Text>
              <View style={styles.inputWrapper}>
                <TextInput
                  style={styles.input}
                  placeholder={t('userList.groupNamePlaceholder')}
                  placeholderTextColor={colors.textPlaceholder}
                  value={groupName}
                  onChangeText={setGroupName}
                />
              </View>

              <Text style={styles.formLabel}>{t('userList.userIdsLabel')}</Text>
              <View style={styles.inputWrapper}>
                <TextInput
                  style={styles.input}
                  placeholder={t('userList.userIdsPlaceholder')}
                  placeholderTextColor={colors.textPlaceholder}
                  value={groupIdsInput}
                  onChangeText={setGroupIdsInput}
                  autoCapitalize="none"
                  autoCorrect={false}
                />
              </View>
              <Text style={styles.helperText}>{t('userList.userIdsHelper')}</Text>

              <Text style={styles.formLabel}>{t('userList.avatarUrlLabel')}</Text>
              <View style={styles.inputWrapper}>
                <TextInput
                  style={styles.input}
                  placeholder={t('userList.avatarUrlPlaceholder')}
                  placeholderTextColor={colors.textPlaceholder}
                  value={groupAvatarUrl}
                  onChangeText={setGroupAvatarUrl}
                  autoCapitalize="none"
                  autoCorrect={false}
                />
              </View>

              <TouchableOpacity
                style={[
                  styles.submitBtn,
                  (!groupName.trim() || !groupIdsInput.trim() || submitting) &&
                    styles.submitBtnDisabled,
                ]}
                disabled={!groupName.trim() || !groupIdsInput.trim() || submitting}
                onPress={handleCreateGroup}
              >
                {submitting ? (
                  <ActivityIndicator color={colors.onPrimary} size="small" />
                ) : (
                  <Text style={styles.submitBtnText}>{t('userList.btnCreateGroup')}</Text>
                )}
              </TouchableOpacity>
            </View>
          </ScrollView>
        )}

        {activeTab === 'channel' && (
          <ScrollView contentContainerStyle={[styles.formScroll, { paddingBottom: insets.bottom + spacing.xl }]}>
            <View style={styles.formContainer}>
              <Text style={styles.formLabel}>{t('userList.channelIdLabel')}</Text>
              <View style={styles.inputWrapper}>
                <TextInput
                  style={styles.input}
                  placeholder={t('userList.channelIdPlaceholder')}
                  placeholderTextColor={colors.textPlaceholder}
                  value={channelId}
                  onChangeText={setChannelId}
                  autoCapitalize="none"
                  autoCorrect={false}
                />
              </View>

              <Text style={styles.formLabel}>{t('userList.channelNameLabel')}</Text>
              <View style={styles.inputWrapper}>
                <TextInput
                  style={styles.input}
                  placeholder={t('userList.channelNamePlaceholder')}
                  placeholderTextColor={colors.textPlaceholder}
                  value={channelName}
                  onChangeText={setChannelName}
                />
              </View>

              <Text style={styles.formLabel}>{t('userList.avatarUrlLabel')}</Text>
              <View style={styles.inputWrapper}>
                <TextInput
                  style={styles.input}
                  placeholder={t('userList.avatarUrlPlaceholder')}
                  placeholderTextColor={colors.textPlaceholder}
                  value={channelAvatarUrl}
                  onChangeText={setChannelAvatarUrl}
                  autoCapitalize="none"
                  autoCorrect={false}
                />
              </View>

              <TouchableOpacity
                style={[
                  styles.submitBtn,
                  (!channelId.trim() || submitting) && styles.submitBtnDisabled,
                ]}
                disabled={!channelId.trim() || submitting}
                onPress={handleCreateJoinChannel}
              >
                {submitting ? (
                  <ActivityIndicator color={colors.onPrimary} size="small" />
                ) : (
                  <Text style={styles.submitBtnText}>{t('userList.btnCreateJoinChannel')}</Text>
                )}
              </TouchableOpacity>
            </View>
          </ScrollView>
        )}
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg },
  backBtn: { fontSize: 28, color: colors.primary, lineHeight: 32 },
  tabContainer: {
    flexDirection: 'row',
    backgroundColor: colors.surface,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.border,
  },
  tabButton: {
    flex: 1,
    paddingVertical: spacing.md,
    alignItems: 'center',
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
  },
  tabButtonActive: {
    borderBottomColor: colors.primary,
  },
  tabText: {
    fontSize: fontSize.md,
    color: colors.textMuted,
    fontWeight: '500',
  },
  tabTextActive: {
    color: colors.primary,
    fontWeight: '700',
  },
  formScroll: {
    padding: spacing.lg,
  },
  formContainer: {
    backgroundColor: colors.surface,
    padding: spacing.lg,
    borderRadius: radius.md,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.border,
  },
  formLabel: {
    fontSize: fontSize.sm,
    fontWeight: '600',
    color: colors.textMuted,
    marginBottom: spacing.xs,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginTop: spacing.sm,
  },
  inputWrapper: {
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    marginBottom: spacing.sm,
  },
  input: {
    height: 40,
    fontSize: fontSize.base,
    color: colors.text,
    paddingVertical: spacing.xs,
  },
  helperText: {
    fontSize: fontSize.xs,
    color: colors.textSubtle,
    marginBottom: spacing.lg,
  },
  submitBtn: {
    backgroundColor: colors.primary,
    borderRadius: radius.sm,
    paddingVertical: spacing.md,
    alignItems: 'center',
    marginTop: spacing.md,
  },
  submitBtnDisabled: {
    backgroundColor: colors.borderStrong,
  },
  submitBtnText: {
    color: colors.onPrimary,
    fontWeight: '600',
    fontSize: fontSize.base,
  },
});
