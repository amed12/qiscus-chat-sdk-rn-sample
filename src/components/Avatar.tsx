import React from 'react';
import { Image, View, Text, StyleSheet } from 'react-native';
import { colors, palette, radius } from '@/theme';

interface AvatarProps {
  uri?: string | null;
  name?: string;
  size?: number;
}

function getInitials(name: string): string {
  return name
    .split(' ')
    .slice(0, 2)
    .map((w) => w[0])
    .join('')
    .toUpperCase();
}

export function Avatar({ uri, name = '?', size = 40 }: AvatarProps) {
  const style = { width: size, height: size, borderRadius: size / 2 };

  if (uri) {
    return <Image source={{ uri }} style={[styles.image, style]} />;
  }

  return (
    <View style={[styles.placeholder, style]}>
      <Text style={[styles.initials, { fontSize: size * 0.35 }]}>{getInitials(name)}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  image: { resizeMode: 'cover' },
  placeholder: {
    backgroundColor: palette.samudra800,
    alignItems: 'center',
    justifyContent: 'center',
  },
  initials: { color: colors.onPrimary, fontWeight: '600' },
});
