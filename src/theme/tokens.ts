export const colors = {
  primary: '#9aca62',
  primaryDark: '#7aaa42',
  onPrimary: '#ffffff',
  surface: '#ffffff',
  background: '#fafafa',
  messageIn: '#e8e8e8',
  messageOut: '#ffffff',
  textPrimary: '#2c2c36',
  textSecondary: '#666666',
  textMuted: '#979797',
  border: '#ececec',
  online: '#94ca62',
  danger: '#FF3B5E',
  overlay: 'rgba(0,0,0,0.2)',
} as const;

export const spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  xxl: 32,
  toolbar: 48,
} as const;

export const radius = {
  sm: 4,
  md: 8,
  full: 9999,
} as const;

export const fontSize = {
  xs: 10,
  sm: 11,
  md: 13,
  base: 14,
  lg: 16,
  xl: 20,
} as const;

export const shadow = {
  light: {
    shadowColor: '#c7c7c7',
    shadowOpacity: 0.8,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
    elevation: 2,
  },
} as const;
