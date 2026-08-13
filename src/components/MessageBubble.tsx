import React, { useEffect, useRef } from 'react';
import { Animated, Image, Text, View, StyleSheet } from 'react-native';
import { format } from 'date-fns';
import { colors, spacing, fontSize, radius } from '@/theme';
import type { QiscusMessage } from '@/client';

interface MessageBubbleProps {
  message: QiscusMessage;
  isMe: boolean;
}

function StatusIcon({ status }: { status: QiscusMessage['status'] }) {
  const spin = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (status !== 'sending') return;
    const anim = Animated.loop(
      Animated.timing(spin, { toValue: 1, duration: 1500, useNativeDriver: true }),
    );
    anim.start();
    return () => anim.stop();
  }, [status, spin]);

  if (status === 'sending') {
    const rotate = spin.interpolate({ inputRange: [0, 1], outputRange: ['0deg', '360deg'] });
    return (
      <Animated.Image
        source={require('../../assets/ic_sending@2x.png')}
        style={[styles.statusIcon, { transform: [{ rotate }] }]}
      />
    );
  }
  if (status === 'read') {
    return <Image source={require('../../assets/ic_read@2x.png')} style={styles.statusIcon} />;
  }
  if (status === 'delivered' || status === 'sent') {
    return (
      <Image source={require('../../assets/ic_delivered@2x.png')} style={styles.statusIcon} />
    );
  }
  return null;
}

export function MessageBubble({ message, isMe }: MessageBubbleProps) {
  const isCustomImage =
    message.type === 'custom' && message.payload?.content && message.payload.type === 'image';

  return (
    <View style={[styles.row, isMe && styles.rowMe]}>
      <View style={[styles.bubble, isMe && styles.bubbleMe]}>
        {isCustomImage ? (
          <Image
            source={{ uri: message.payload!.content.url }}
            style={styles.image}
            resizeMode="cover"
          />
        ) : (
          <Text style={styles.text}>{message.message}</Text>
        )}
      </View>
      {isMe && (
        <View style={styles.meta}>
          <Text style={styles.time}>{format(new Date(message.timestamp), 'HH:mm')}</Text>
          <StatusIcon status={message.status} />
        </View>
      )}
      {!isMe && (
        <View style={styles.meta}>
          <Text style={styles.time}>{format(new Date(message.timestamp), 'HH:mm')}</Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    padding: spacing.xs,
    justifyContent: 'flex-start',
  },
  rowMe: { justifyContent: 'flex-end' },
  bubble: {
    maxWidth: '70%',
    padding: spacing.sm,
    borderRadius: radius.md,
    backgroundColor: colors.messageIn,
  },
  bubbleMe: { backgroundColor: colors.messageOut },
  text: { fontSize: fontSize.md, color: colors.textMuted, lineHeight: 20 },
  image: { width: 200, height: 200, borderRadius: radius.sm },
  meta: { marginHorizontal: spacing.xs, alignItems: 'flex-end' },
  time: { fontSize: fontSize.xs, color: colors.textMuted },
  statusIcon: { width: 14, height: 14, resizeMode: 'contain', marginTop: 2 },
});
