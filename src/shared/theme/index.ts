import { createTheme } from '@rneui/themed';
import { DarkTheme as NavigationDarkTheme, DefaultTheme as NavigationDefaultTheme } from '@react-navigation/native';

import { radius, typography } from '@/ui/theme/foundation';
import type { AthenaThemeMode } from '@/ui/theme/tokens';
import { athenaPalettes } from '@/ui/theme/tokens';

export const buildAppTheme = (mode: AthenaThemeMode) => {
  const colors = athenaPalettes[mode];

  return createTheme({
    mode,
    lightColors: {
      primary: athenaPalettes.light.primary[500],
      secondary: athenaPalettes.light.primary[600],
      background: athenaPalettes.light.background.base,
      white: athenaPalettes.light.background.surface,
      black: athenaPalettes.light.text.primary,
      grey0: athenaPalettes.light.text.primary,
      grey1: athenaPalettes.light.text.secondary,
      grey2: athenaPalettes.light.text.tertiary,
    },
    darkColors: {
      primary: athenaPalettes.dark.primary[500],
      secondary: athenaPalettes.dark.primary[600],
      background: athenaPalettes.dark.background.base,
      white: athenaPalettes.dark.background.surface,
      black: athenaPalettes.dark.text.primary,
      grey0: athenaPalettes.dark.text.primary,
      grey1: athenaPalettes.dark.text.secondary,
      grey2: athenaPalettes.dark.text.tertiary,
    },
    components: {
      Button: {
        buttonStyle: {
          borderRadius: radius.md,
        },
        titleStyle: {
          fontWeight: typography.bodyStrong.fontWeight,
        },
      },
      Input: {
        inputContainerStyle: {
          borderBottomWidth: 0,
        },
        containerStyle: {
          paddingHorizontal: 0,
        },
        inputStyle: {
          color: colors.text.primary,
        },
      },
    },
  });
};

export const buildNavigationTheme = (mode: AthenaThemeMode) => {
  const colors = athenaPalettes[mode];
  const baseTheme = mode === 'dark' ? NavigationDarkTheme : NavigationDefaultTheme;

  return {
    ...baseTheme,
    colors: {
      ...baseTheme.colors,
      primary: colors.primary[600],
      background: colors.background.base,
      card: colors.background.surface,
      text: colors.text.primary,
      border: colors.border.default,
      notification: colors.danger.base,
    },
  };
};
