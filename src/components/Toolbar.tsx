import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { colors, spacing, fontSize } from '@/theme';

interface ToolbarProps {
  title: string | React.ReactNode;
  left?: React.ReactNode;
  right?: React.ReactNode;
  meta?: React.ReactNode;
}

export function Toolbar({ title, left, right, meta }: ToolbarProps) {
  return (
    <View style={styles.container}>
      <View style={styles.row}>
        {left != null && <View style={styles.side}>{left}</View>}
        <View style={styles.center}>
          {typeof title === 'string' ? (
            <Text style={styles.title} numberOfLines={1}>
              {title}
            </Text>
          ) : (
            title
          )}
          {meta}
        </View>
        {right != null && <View style={styles.side}>{right}</View>}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.surface,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.border,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    minHeight: spacing.toolbar,
    justifyContent: 'center',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  side: {
    width: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  center: {
    flex: 1,
    marginHorizontal: spacing.sm,
  },
  title: {
    fontSize: fontSize.lg,
    fontWeight: '600',
    color: colors.text,
  },
});
