import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ImageBackground,
  Image,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useAuth } from '@/hooks';
import { colors, spacing, fontSize, radius } from '@/theme';
import type { RootStackParamList } from '@/navigation/types';

type Props = NativeStackScreenProps<RootStackParamList, 'Login'>;

export function LoginScreen({ navigation }: Props) {
  const { t } = useTranslation();
  const { login } = useAuth();
  const [userId, setUserId] = useState('guest-101');
  const [userKey, setUserKey] = useState('passkey');
  const [loading, setLoading] = useState(false);
  const insets = useSafeAreaInsets();

  const handleSubmit = async () => {
    if (!userId.trim() || !userKey.trim()) return;
    setLoading(true);
    try {
      await login(userId.trim(), userKey.trim());
      navigation.replace('RoomList');
    } catch {
      Alert.alert('Error', t('auth.loginFailed'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView keyboardShouldPersistTaps="handled" contentContainerStyle={styles.scroll}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ImageBackground
          source={require('../../assets/bg-pattern.png')}
          style={styles.background}
        >
          <View style={[styles.container, { paddingTop: insets.top + 45, paddingBottom: insets.bottom + 45 }]}>
            <Image source={require('../../assets/logo.png')} style={styles.logo} />
            <View style={styles.form}>
              <View style={styles.fieldGroup}>
                <Text style={styles.label}>{t('auth.userId')}</Text>
                <TextInput
                  style={styles.input}
                  value={userId}
                  onChangeText={setUserId}
                  autoCapitalize="none"
                  autoCorrect={false}
                />
              </View>
              <View style={styles.fieldGroup}>
                <Text style={styles.label}>{t('auth.userKey')}</Text>
                <TextInput
                  style={styles.input}
                  value={userKey}
                  onChangeText={setUserKey}
                  secureTextEntry
                />
              </View>
              <View style={styles.fieldGroup}>
                <TouchableOpacity
                  style={styles.submitBtn}
                  onPress={handleSubmit}
                  disabled={loading}
                >
                  {loading ? (
                    <ActivityIndicator color={colors.onPrimary} />
                  ) : (
                    <Text style={styles.submitText}>{t('auth.start')}</Text>
                  )}
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </ImageBackground>
      </KeyboardAvoidingView>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scroll: { flexGrow: 1 },
  background: { flex: 1 },
  container: {
    flex: 1,
    alignItems: 'center',
    padding: 45,
    minHeight: 600,
  },
  logo: { marginTop: 60, resizeMode: 'contain', width: '80%' },
  form: { marginTop: 80, width: '100%' },
  fieldGroup: { marginTop: spacing.xl },
  label: {
    fontSize: fontSize.sm,
    fontWeight: '600',
    textTransform: 'uppercase',
    color: '#979797',
    letterSpacing: 0.5,
  },
  input: {
    height: 35,
    paddingVertical: 5,
    paddingHorizontal: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    color: colors.text,
  },
  submitBtn: {
    backgroundColor: colors.primary,
    borderRadius: radius.sm,
    paddingVertical: 15,
    alignItems: 'center',
  },
  submitText: {
    color: colors.onPrimary,
    fontWeight: '600',
    textTransform: 'capitalize',
  },
});
