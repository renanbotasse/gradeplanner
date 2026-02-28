import { Pressable, StyleSheet, Text } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';

import { componentSize, iconSize, radius, spacing, typography } from '@/ui/theme/foundation';
import { useAthenaTheme } from '@/ui/theme/tokens';

export type AppChipVariant = 'neutral' | 'primary' | 'info' | 'warning' | 'success' | 'danger' | 'event';

interface AppChipProps {
  label: string;
  selected?: boolean;
  variant?: AppChipVariant;
  icon?: keyof typeof MaterialIcons.glyphMap;
  onPress?: () => void;
}

export const AppChip = ({
  label,
  selected = false,
  variant = 'neutral',
  icon,
  onPress,
}: AppChipProps) => {
  const { colors } = useAthenaTheme();

  const palette = {
    neutral: { bg: colors.background.elevated, text: colors.text.secondary, border: colors.border.default, activeBg: colors.primary[500], activeText: colors.text.onPrimary, activeBorder: colors.primary[500] },
    primary: { bg: colors.info.soft, text: colors.primary[500], border: colors.info.base, activeBg: colors.primary[500], activeText: colors.text.onPrimary, activeBorder: colors.primary[500] },
    info: { bg: colors.info.soft, text: colors.info.base, border: colors.info.base, activeBg: colors.info.base, activeText: colors.text.onPrimary, activeBorder: colors.info.base },
    warning: { bg: colors.warning.soft, text: colors.warning.base, border: colors.warning.base, activeBg: colors.warning.base, activeText: colors.text.onPrimary, activeBorder: colors.warning.base },
    success: { bg: colors.success.soft, text: colors.success.base, border: colors.success.base, activeBg: colors.success.base, activeText: colors.text.onPrimary, activeBorder: colors.success.base },
    danger: { bg: colors.danger.soft, text: colors.danger.base, border: colors.danger.base, activeBg: colors.danger.base, activeText: colors.text.onPrimary, activeBorder: colors.danger.base },
    event: { bg: colors.event.soft, text: colors.event.base, border: colors.event.base, activeBg: colors.event.base, activeText: colors.text.onPrimary, activeBorder: colors.event.base },
  }[variant];

  const backgroundColor = selected ? palette.activeBg : palette.bg;
  const borderColor = selected ? palette.activeBorder : palette.border;
  const textColor = selected ? palette.activeText : palette.text;

  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.container,
        {
          backgroundColor,
          borderColor,
          opacity: pressed ? 0.88 : 1,
        },
      ]}
    >
      {icon ? <MaterialIcons name={icon} size={iconSize.sm} color={textColor} /> : null}
      <Text style={[styles.label, { color: textColor }]}>{label}</Text>
    </Pressable>
  );
};

const styles = StyleSheet.create({
  container: {
    minHeight: componentSize.chipHeight,
    borderRadius: radius.pill,
    borderWidth: 1,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.xxs,
  },
  label: {
    ...typography.caption,
  },
});
