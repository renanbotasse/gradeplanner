import { useMemo } from 'react';
import { Pressable, StyleSheet, Switch, Text, View } from 'react-native';
import { athenaRadius, useAthenaTheme, type AthenaColors } from '@/ui/theme/tokens';

const REMINDER_OPTIONS = [
  { key: 'activity.reminder.oneWeek', minutes: 10080 },
  { key: 'activity.reminder.threeDays', minutes: 4320 },
  { key: 'activity.reminder.oneDay', minutes: 1440 },
  { key: 'activity.reminder.threeHours', minutes: 180 },
  { key: 'activity.reminder.thirtyMinutes', minutes: 30 },
];

interface RemindersCardProps {
  enabled: boolean;
  selectedReminders: number[];
  onToggleEnabled: (value: boolean) => void;
  onToggleReminder: (minutes: number) => void;
  t: (key: string) => string;
}

export const RemindersCard = ({
  enabled,
  selectedReminders,
  onToggleEnabled,
  onToggleReminder,
  t,
}: RemindersCardProps) => {
  const { colors } = useAthenaTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);

  return (
    <View style={styles.reminderCard}>
      <View style={styles.reminderHeader}>
        <View>
          <Text style={styles.reminderTitle}>{t('activity.field.reminders')}</Text>
          <Text style={styles.reminderSubtitle}>{t('activity.reminders.subtitle')}</Text>
        </View>
        <Switch
          value={enabled}
          onValueChange={onToggleEnabled}
          trackColor={{ false: colors.toggle.off, true: colors.toggle.on }}
          thumbColor={enabled ? colors.primary[500] : colors.text.onPrimary}
        />
      </View>
      {enabled && (
        <View style={styles.reminderOptions}>
          {REMINDER_OPTIONS.map((opt) => (
            <Pressable
              key={opt.minutes}
              style={[styles.reminderChip, selectedReminders.includes(opt.minutes) && styles.reminderChipActive]}
              onPress={() => onToggleReminder(opt.minutes)}
            >
              <Text style={[styles.reminderChipText, selectedReminders.includes(opt.minutes) && styles.reminderChipTextActive]}>
                {t(opt.key)}
              </Text>
            </Pressable>
          ))}
        </View>
      )}
    </View>
  );
};

const createStyles = (colors: AthenaColors) =>
  StyleSheet.create({
    reminderCard: {
      borderRadius: athenaRadius.md,
      borderWidth: 1,
      borderColor: colors.border.default,
      backgroundColor: colors.background.surface,
      padding: 12,
      gap: 8,
    },
    reminderHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
    reminderTitle: { color: colors.text.primary, fontSize: 16, fontWeight: '700' },
    reminderSubtitle: { color: colors.text.secondary, fontSize: 13, marginTop: 2 },
    reminderOptions: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
    reminderChip: {
      borderRadius: 999,
      borderWidth: 1,
      borderColor: colors.border.default,
      backgroundColor: colors.background.elevated,
      paddingHorizontal: 10,
      paddingVertical: 6,
    },
    reminderChipActive: { backgroundColor: colors.info.soft, borderColor: colors.info.base },
    reminderChipText: { color: colors.text.secondary, fontSize: 12, fontWeight: '700' },
    reminderChipTextActive: { color: colors.primary[600] },
  });
