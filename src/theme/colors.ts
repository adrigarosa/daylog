export const palette = {
  primary: '#6C63FF',
  primaryDark: '#5348D4',
  secondary: '#F4B942',
  error: '#E74C3C',
  success: '#2ECC71',
  warning: '#F39C12',
  info: '#3498DB',

  // Neutrals
  white: '#FFFFFF',
  black: '#000000',
  grey50: '#FAFAFA',
  grey100: '#F5F5F5',
  grey200: '#EEEEEE',
  grey300: '#E0E0E0',
  grey400: '#BDBDBD',
  grey500: '#9E9E9E',
  grey600: '#757575',
  grey700: '#616161',
  grey800: '#424242',
  grey900: '#212121',
};

export const lightColors = {
  primary: palette.primary,
  onPrimary: palette.white,
  primaryContainer: '#EAE8FF',
  onPrimaryContainer: '#1B0070',
  secondary: palette.secondary,
  onSecondary: palette.white,
  secondaryContainer: '#FFF3CD',
  onSecondaryContainer: '#5C3A00',
  background: '#F8F9FA',
  onBackground: palette.grey900,
  surface: palette.white,
  onSurface: palette.grey900,
  surfaceVariant: palette.grey100,
  onSurfaceVariant: palette.grey700,
  error: palette.error,
  onError: palette.white,
  outline: palette.grey300,
  outlineVariant: palette.grey200,
};

export const darkColors = {
  primary: '#B8B0FF',
  onPrimary: '#2D0099',
  primaryContainer: '#4437C8',
  onPrimaryContainer: '#EAE8FF',
  secondary: '#FFD07A',
  onSecondary: '#3D2300',
  secondaryContainer: '#5C3A00',
  onSecondaryContainer: '#FFE9B3',
  background: '#121212',
  onBackground: palette.grey100,
  surface: '#1E1E1E',
  onSurface: palette.grey100,
  surfaceVariant: '#2C2C2C',
  onSurfaceVariant: palette.grey400,
  error: '#FF6B6B',
  onError: '#690000',
  outline: palette.grey700,
  outlineVariant: palette.grey800,
};

// Status colors — used across the app for task states
export const statusColors: Record<string, string> = {
  todo: '#9E9E9E',
  in_progress: '#2196F3',
  completed: '#4CAF50',
  cancelled: '#F44336',
};

// Entry type colors
export const typeColors: Record<string, string> = {
  task: '#6C63FF',
  fact: '#00BCD4',
  note: '#FF9800',
  habit: '#4CAF50',
};
