import { useMemo, useState } from 'react';
import { Alert, Modal, Pressable, StyleSheet, Text, View } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Calendar, type DateData } from 'react-native-calendars';

import type { OnboardingStackParamList } from '@/app/navigation/OnboardingNavigator';
import { useCreateSemester } from '@/features/academics/hooks';
import { useAppPreferences } from '@/presentation/providers/AppPreferencesProvider';
import { AppButton, AppChip } from '@/ui/components/primitives';
import { Screen } from '@/ui/components/Screen';
import { OnboardingTopHeader } from '@/ui/screens/onboarding/OnboardingTopHeader';
import { radius, spacing, typography } from '@/ui/theme/foundation';
import { useAthenaTheme, type AthenaColors } from '@/ui/theme/tokens';

type Props = NativeStackScreenProps<OnboardingStackParamList, 'OnboardingSemester'>;

const ORDINALS = ['', '1.º', '2.º', '3.º', '4.º', '5.º'];
const currentYear = new Date().getFullYear();

const generateTitle = (year: number, semesterNum: 1 | 2): string =>
  `${ORDINALS[semesterNum]} Semestre - ${ORDINALS[year]} Ano`;

const defaultDatesForSem = (semesterNum: 1 | 2): { start: string; end: string } => {
  if (semesterNum === 1) {
    return { start: `${currentYear}-09-15`, end: `${currentYear + 1}-01-20` };
  }
  return { start: `${currentYear}-02-15`, end: `${currentYear}-07-10` };
};

const formatDateDisplay = (dateStr: string): string => {
  if (!dateStr) return '';
  const [year, month, day] = dateStr.split('-');
  return `${day}/${month}/${year}`;
};

export const OnboardingSemesterScreen = ({ route, navigation }: Props) => {
  const { colors, mode } = useAthenaTheme();
  const { t, language, weekStartDay } = useAppPreferences();
  const styles = useMemo(() => createStyles(colors), [colors]);
  const { cursoId } = route.params;
  const createSemester = useCreateSemester();

  const initialDates = defaultDatesForSem(1);
  const [year, setYear] = useState(1);
  const [semesterNum, setSemesterNum] = useState<1 | 2>(1);
  const [startDate, setStartDate] = useState(initialDates.start);
  const [endDate, setEndDate] = useState(initialDates.end);
  const [datePickerTarget, setDatePickerTarget] = useState<'start' | 'end' | null>(null);

  const onSelectSemester = (value: 1 | 2) => {
    setSemesterNum(value);
    const defaults = defaultDatesForSem(value);
    setStartDate(defaults.start);
    setEndDate(defaults.end);
  };

  const onNext = async () => {
    if (!startDate.trim() || !endDate.trim()) {
      Alert.alert(t('common.error'), t('onboarding.semester.error.datesRequired'));
      return;
    }

    try {
      const semesterId = await createSemester.mutateAsync({
        cursoId,
        title: generateTitle(year, semesterNum),
        startDate,
        endDate,
      });
      navigation.navigate('OnboardingUCs', { semesterId, cursoId });
    } catch {
      Alert.alert(t('common.error'), t('semesters.error.save'));
    }
  };

  const selectedDate = datePickerTarget === 'start' ? startDate : endDate;
  const markedDates = selectedDate
    ? { [selectedDate]: { selected: true, selectedColor: colors.primary[500] } }
    : {};

  return (
    <Screen>
      <OnboardingTopHeader />

      <Text style={styles.step}>{t('onboarding.semester.step')}</Text>
      <Text style={styles.title}>{t('onboarding.semester.title')}</Text>
      <Text style={styles.subtitle}>{t('onboarding.semester.subtitle')}</Text>

      <View style={styles.group}>
        <Text style={styles.label}>{t('semesters.field.year')}</Text>
        <View style={styles.chipRow}>
          {[1, 2, 3, 4, 5].map((value) => (
            <AppChip
              key={value}
              label={`${value}º`}
              selected={year === value}
              variant="primary"
              onPress={() => setYear(value)}
            />
          ))}
        </View>
      </View>

      <View style={styles.group}>
        <Text style={styles.label}>{t('semesters.field.semester')}</Text>
        <View style={styles.chipRow}>
          <AppChip
            label={t('semesters.semester.first')}
            selected={semesterNum === 1}
            variant="primary"
            onPress={() => onSelectSemester(1)}
          />
          <AppChip
            label={t('semesters.semester.second')}
            selected={semesterNum === 2}
            variant="primary"
            onPress={() => onSelectSemester(2)}
          />
        </View>
      </View>

      <View style={styles.generatedCard}>
        <Text style={styles.generatedLabel}>{t('semesters.field.generatedTitle')}</Text>
        <Text style={styles.generatedValue}>{generateTitle(year, semesterNum)}</Text>
      </View>

      <View style={styles.dateRow}>
        <DateField
          styles={styles}
          label={t('semesters.field.startDate')}
          value={startDate}
          onPress={() => setDatePickerTarget('start')}
        />
        <DateField
          styles={styles}
          label={t('semesters.field.endDate')}
          value={endDate}
          onPress={() => setDatePickerTarget('end')}
        />
      </View>

      <AppButton
        label={createSemester.isPending ? t('onboarding.common.creating') : t('onboarding.common.next')}
        icon="arrow-forward"
        size="lg"
        onPress={() => {
          void onNext();
        }}
        loading={createSemester.isPending}
        disabled={createSemester.isPending}
      />

      <Modal visible={datePickerTarget !== null} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.calendarModal}>
            <View style={styles.calendarHeader}>
              <Text style={styles.calendarTitle}>
                {datePickerTarget === 'start' ? t('semesters.field.startDate') : t('semesters.field.endDate')}
              </Text>
              <AppButton
                label={t('common.confirm')}
                size="md"
                fullWidth={false}
                variant="secondary"
                onPress={() => setDatePickerTarget(null)}
              />
            </View>
            <Calendar
              key={`onboarding-semester-picker-${mode}-${language}-${weekStartDay}`}
              showSixWeeks
              hideExtraDays={false}
              firstDay={weekStartDay}
              markedDates={markedDates}
              onDayPress={(day: DateData) => {
                if (datePickerTarget === 'start') setStartDate(day.dateString);
                else setEndDate(day.dateString);
                setDatePickerTarget(null);
              }}
              theme={{
                backgroundColor: colors.background.surface,
                calendarBackground: colors.background.surface,
                textSectionTitleColor: colors.text.secondary,
                selectedDayBackgroundColor: colors.primary[500],
                selectedDayTextColor: colors.text.onPrimary,
                todayTextColor: colors.primary[500],
                dayTextColor: colors.text.primary,
                textDisabledColor: colors.text.tertiary,
                arrowColor: colors.primary[500],
                monthTextColor: colors.text.primary,
                textMonthFontWeight: '700',
              }}
            />
          </View>
        </View>
      </Modal>
    </Screen>
  );
};

interface DateFieldProps {
  styles: ReturnType<typeof createStyles>;
  label: string;
  value: string;
  onPress: () => void;
}

const DateField = ({ styles, label, value, onPress }: DateFieldProps) => (
  <View style={[styles.group, styles.dateFieldWrap]}>
    <Text style={styles.label}>{label}</Text>
    <Pressable style={styles.dateField} onPress={onPress}>
      <Text style={styles.dateValue}>{formatDateDisplay(value)}</Text>
    </Pressable>
  </View>
);

const createStyles = (colors: AthenaColors) =>
  StyleSheet.create({
    step: {
      ...typography.caption,
      color: colors.text.tertiary,
      marginTop: spacing.xs,
    },
    title: {
      ...typography.h1,
      color: colors.text.primary,
    },
    subtitle: {
      ...typography.body,
      color: colors.text.secondary,
      marginBottom: spacing.xs,
    },
    group: {
      gap: spacing.xxs,
    },
    label: {
      ...typography.caption,
      color: colors.text.secondary,
    },
    chipRow: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: spacing.xs,
    },
    generatedCard: {
      borderRadius: radius.md,
      borderWidth: 1,
      borderColor: colors.border.default,
      backgroundColor: colors.background.surface,
      padding: spacing.sm,
      gap: spacing.xxs,
    },
    generatedLabel: {
      ...typography.caption,
      color: colors.text.secondary,
    },
    generatedValue: {
      ...typography.bodyStrong,
      color: colors.text.primary,
    },
    dateRow: {
      flexDirection: 'row',
      gap: spacing.xs,
    },
    dateFieldWrap: {
      flex: 1,
    },
    dateField: {
      minHeight: 46,
      borderRadius: radius.md,
      borderWidth: 1,
      borderColor: colors.border.default,
      backgroundColor: colors.background.base,
      paddingHorizontal: spacing.sm,
      justifyContent: 'center',
    },
    dateValue: {
      ...typography.body,
      color: colors.text.primary,
    },
    modalOverlay: {
      flex: 1,
      justifyContent: 'flex-end',
      backgroundColor: colors.overlay.scrim,
    },
    calendarModal: {
      backgroundColor: colors.background.surface,
      borderTopLeftRadius: radius.xl,
      borderTopRightRadius: radius.xl,
      paddingBottom: spacing.xl,
    },
    calendarHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingHorizontal: spacing.md,
      paddingVertical: spacing.md,
      borderBottomWidth: 1,
      borderBottomColor: colors.border.default,
    },
    calendarTitle: {
      ...typography.bodyStrong,
      color: colors.text.primary,
    },
  });
