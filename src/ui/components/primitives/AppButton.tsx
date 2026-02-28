import { Pressable, StyleSheet, Text, View } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';

import {
  createElevation,
  componentSize,
  iconSize,
  radius,
  spacing,
  typography,
  withAlpha,
} from '@/ui/theme/foundation';
import { useAthenaTheme, type AthenaColors } from '@/ui/theme/tokens';

export type AppButtonVariant = 'primary' | 'secondary' | 'danger' | 'ghost';
export type AppButtonSize = 'md' | 'lg';

interface AppButtonProps {
  label: string;
  onPress?: () => void;
  disabled?: boolean;
  loading?: boolean;
  fullWidth?: boolean;
  size?: AppButtonSize;
  variant?: AppButtonVariant;
  icon?: keyof typeof MaterialIcons.glyphMap;
}

const getVariantStyles = (colors: AthenaColors, variant: AppButtonVariant) => {
  if (variant === 'secondary') {
    return {
      container: {
        backgroundColor: colors.background.elevated,
        borderColor: colors.border.default,
        borderWidth: 1,
      },
      containerPressed: {
        backgroundColor: colors.info.soft,
        borderColor: colors.info.base,
      },
      text: {
        color: colors.text.primary,
      },
      icon: colors.text.secondary,
    };
  }

  if (variant === 'danger') {
    return {
      container: {
        backgroundColor: colors.danger.base,
        borderColor: colors.danger.base,
        borderWidth: 1,
      },
      containerPressed: {
        backgroundColor: withAlpha(colors.danger.base, 0.85),
      },
      text: {
        color: colors.text.onPrimary,
      },
      icon: colors.text.onPrimary,
    };
  }

  if (variant === 'ghost') {
    return {
      container: {
        backgroundColor: 'transparent',
        borderColor: 'transparent',
        borderWidth: 1,
      },
      containerPressed: {
        backgroundColor: colors.background.elevated,
      },
      text: {
        color: colors.primary[500],
      },
      icon: colors.primary[500],
    };
  }

  return {
    container: {
      backgroundColor: colors.primary[500],
      borderColor: colors.primary[500],
      borderWidth: 1,
    },
    containerPressed: {
      backgroundColor: colors.primary[600],
      borderColor: colors.primary[600],
    },
    text: {
      color: colors.text.onPrimary,
    },
    icon: colors.text.onPrimary,
  };
};

export const AppButton = ({
  label,
  onPress,
  disabled = false,
  loading = false,
  fullWidth = true,
  size = 'md',
  variant = 'primary',
  icon,
}: AppButtonProps) => {
  const { colors } = useAthenaTheme();
  const elevation = createElevation(colors);
  const variantStyles = getVariantStyles(colors, variant);

  const height = size === 'lg' ? componentSize.buttonHeightLg : componentSize.buttonHeight;

  return (
    <Pressable
      onPress={onPress}
      disabled={disabled || loading}
      style={({ pressed }) => [
        styles.button,
        {
          minHeight: height,
          opacity: disabled ? 0.55 : 1,
          width: fullWidth ? '100%' : undefined,
        },
        elevation.sm,
        variantStyles.container,
        pressed && !disabled && !loading && variantStyles.containerPressed,
      ]}
    >
      <View style={styles.contentRow}>
        {icon ? <MaterialIcons name={icon} size={iconSize.md} color={variantStyles.icon} /> : null}
        <Text style={[styles.label, variantStyles.text]}>{loading ? `${label}...` : label}</Text>
      </View>
    </Pressable>
  );
};

const styles = StyleSheet.create({
  button: {
    borderRadius: radius.md,
    paddingHorizontal: spacing.md,
    justifyContent: 'center',
    alignItems: 'center',
  },
  contentRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.xs,
  },
  label: {
    ...typography.bodyStrong,
  },
});
