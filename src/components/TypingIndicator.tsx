import React from 'react';
import { Text, StyleSheet } from 'react-native';
import { useTranslation } from 'react-i18next';
import { colors, fontSize } from '@/theme';

interface TypingIndicatorProps {
  username: string | null;
  visible: boolean;
}

export function TypingIndicator({ username, visible }: TypingIndicatorProps) {
  const { t } = useTranslation();
  if (!visible || !username) return null;
  return (
    <Text style={styles.text}>{t('chat.typing', { username })}</Text>
  );
}

const styles = StyleSheet.create({
  text: { fontSize: fontSize.sm, color: colors.textMuted },
});
