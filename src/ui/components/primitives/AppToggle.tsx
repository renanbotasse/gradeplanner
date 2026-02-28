import { StyleSheet, Switch, Text, View } from 'react-native';

import { radius, spacing, typography } from '@/ui/theme/foundation';
import { useAthenaTheme } from '@/ui/theme/tokens';

interface AppToggleProps {
  value: boolean;
  onValueChange: (value: boolean) => void;
  label: string;
  description?: string;
  disabled?: boolean;
}

export const AppToggle = ({
  value,
  onValueChange,
  label,
  description,
  disabled = false,
}: AppToggleProps) => {
  const { colors } = useAthenaTheme();

  return (
    <View style={[styles.row, { borderColor: colors.border.default, backgroundColor: colors.background.surface }]}> 
      <View style={styles.texts}>
        <Text style={[styles.label, { color: colors.text.primary }]}>{label}</Text>
        {description ? <Text style={[styles.description, { color: colors.text.secondary }]}>{description}</Text> : null}
      </View>

      <Switch
        value={value}
        onValueChange={onValueChange}
        disabled={disabled}
        trackColor={{ false: colors.toggle.off, true: colors.toggle.on }}
        thumbColor={value ? colors.primary[500] : colors.text.onPrimary}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  row: {
    borderWidth: 1,
    borderRadius: radius.md,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.sm,
    gap: spacing.sm,
  },
  texts: {
    flex: 1,
    gap: spacing.xxs,
  },
  label: {
    ...typography.bodyStrong,
  },
  description: {
    ...typography.caption,
  },
});
