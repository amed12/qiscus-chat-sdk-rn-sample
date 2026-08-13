import React, { useState } from 'react';
import { View, TextInput, TouchableOpacity, Image, StyleSheet } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';
import { colors, spacing } from '@/theme';

interface MessageInputProps {
  onSend: (text: string) => void;
  onAttach: () => void;
}

export function MessageInput({ onSend, onAttach }: MessageInputProps) {
  const { t } = useTranslation();
  const [text, setText] = useState('');
  const insets = useSafeAreaInsets();

  const handleSend = () => {
    const trimmed = text.trim();
    if (!trimmed) return;
    onSend(trimmed);
    setText('');
  };

  return (
    <View style={[styles.container, { paddingBottom: insets.bottom || 4 }]}>
      <TouchableOpacity style={styles.btn} onPress={onAttach}>
        <Image source={require('../../assets/ic_file_attachment.png')} style={styles.icon} />
      </TouchableOpacity>
      <TextInput
        style={styles.input}
        placeholder={t('chat.placeholder')}
        placeholderTextColor={colors.textMuted}
        value={text}
        onChangeText={setText}
        returnKeyType="send"
        onSubmitEditing={handleSend}
        multiline
      />
      <TouchableOpacity style={styles.btn} onPress={handleSend}>
        <Image source={require('../../assets/ic_check.png')} style={styles.icon} />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: colors.border,
    minHeight: 48,
    paddingVertical: 4,
  },
  btn: {
    width: 48,
    height: 48,
    alignItems: 'center',
    justifyContent: 'center',
  },
  icon: { width: 24, height: 24, resizeMode: 'contain' },
  input: {
    flex: 1,
    paddingHorizontal: spacing.sm,
    color: colors.text,
    fontSize: 14,
    maxHeight: 120,
  },
});
