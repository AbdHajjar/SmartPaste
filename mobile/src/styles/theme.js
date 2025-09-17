/**
 * SmartPaste Mobile Theme
 * Material Design 3 Theme Configuration
 */

import { MD3LightTheme, MD3DarkTheme } from 'react-native-paper';

export const lightTheme = {
  ...MD3LightTheme,
  colors: {
    ...MD3LightTheme.colors,
    primary: 'rgb(59, 130, 246)',
    onPrimary: 'rgb(255, 255, 255)',
    primaryContainer: 'rgb(219, 230, 255)',
    onPrimaryContainer: 'rgb(0, 25, 70)',
    
    secondary: 'rgb(16, 185, 129)',
    onSecondary: 'rgb(255, 255, 255)',
    secondaryContainer: 'rgb(198, 245, 228)',
    onSecondaryContainer: 'rgb(0, 50, 34)',
    
    tertiary: 'rgb(156, 39, 176)',
    onTertiary: 'rgb(255, 255, 255)',
    tertiaryContainer: 'rgb(244, 207, 255)',
    onTertiaryContainer: 'rgb(55, 0, 66)',
    
    error: 'rgb(239, 68, 68)',
    onError: 'rgb(255, 255, 255)',
    errorContainer: 'rgb(254, 226, 226)',
    onErrorContainer: 'rgb(127, 29, 29)',
    
    background: 'rgb(248, 250, 252)',
    onBackground: 'rgb(30, 41, 59)',
    surface: 'rgb(255, 255, 255)',
    onSurface: 'rgb(30, 41, 59)',
    surfaceVariant: 'rgb(241, 245, 249)',
    onSurfaceVariant: 'rgb(100, 116, 139)',
    
    outline: 'rgb(148, 163, 184)',
    outlineVariant: 'rgb(203, 213, 225)',
    
    elevation: {
      level0: 'transparent',
      level1: 'rgb(255, 255, 255)',
      level2: 'rgb(249, 250, 251)',
      level3: 'rgb(243, 244, 246)',
      level4: 'rgb(241, 245, 249)',
      level5: 'rgb(248, 250, 252)',
    },
  },
  roundness: 12,
};

export const darkTheme = {
  ...MD3DarkTheme,
  colors: {
    ...MD3DarkTheme.colors,
    primary: 'rgb(147, 197, 253)',
    onPrimary: 'rgb(0, 25, 70)',
    primaryContainer: 'rgb(0, 52, 145)',
    onPrimaryContainer: 'rgb(219, 230, 255)',
    
    secondary: 'rgb(110, 231, 183)',
    onSecondary: 'rgb(0, 50, 34)',
    secondaryContainer: 'rgb(0, 100, 68)',
    onSecondaryContainer: 'rgb(198, 245, 228)',
    
    tertiary: 'rgb(206, 147, 216)',
    onTertiary: 'rgb(55, 0, 66)',
    tertiaryContainer: 'rgb(105, 19, 125)',
    onTertiaryContainer: 'rgb(244, 207, 255)',
    
    error: 'rgb(248, 113, 113)',
    onError: 'rgb(127, 29, 29)',
    errorContainer: 'rgb(185, 28, 28)',
    onErrorContainer: 'rgb(254, 226, 226)',
    
    background: 'rgb(15, 23, 42)',
    onBackground: 'rgb(241, 245, 249)',
    surface: 'rgb(30, 41, 59)',
    onSurface: 'rgb(241, 245, 249)',
    surfaceVariant: 'rgb(51, 65, 85)',
    onSurfaceVariant: 'rgb(148, 163, 184)',
    
    outline: 'rgb(100, 116, 139)',
    outlineVariant: 'rgb(71, 85, 105)',
    
    elevation: {
      level0: 'transparent',
      level1: 'rgb(30, 41, 59)',
      level2: 'rgb(51, 65, 85)',
      level3: 'rgb(71, 85, 105)',
      level4: 'rgb(100, 116, 139)',
      level5: 'rgb(148, 163, 184)',
    },
  },
  roundness: 12,
};

export const theme = lightTheme;

export default theme;