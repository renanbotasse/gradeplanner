import { useMemo, useState } from 'react';
import { Alert, Modal, Pressable, StyleSheet, Text, View } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Calendar, type DateData } from 'react-native-calendars';

import type { OnboardingStackParamList } from '@/app/navigation/OnboardingNavigator';
import type { GradeScale } from '@/db/types';
import { useCreateCurso } from '@/features/courses/hooks';
import { useAppPreferences } from '@/presentation/providers/AppPreferencesProvider';
import { AppButton, AppChip, AppInput } from '@/ui/components/primitives';
import { Screen } from '@/ui/components/Screen';
import { OnboardingTopHeader } from '@/ui/screens/onboarding/OnboardingTopHeader';
import { radius, spacing, typography } from '@/ui/theme/foundation';
import { useAthenaTheme, type AthenaColors } from '@/ui/theme/tokens';

type Props = NativeStackScreenProps<OnboardingStackParamList, 'OnboardingCourse'>;

const ESCALAS: Array<{ label: string; value: GradeScale }> = [
  { label: '0 - 10', value: '0-10' },
  { label: '0 - 20', value: '0-20' },
  { label: '0 - 100', value: '0-100' },
];

const currentYear = new Date().getFullYear();

const formatDateDisplay = (dateStr: string): string => {
  if (!dateStr) return '';
  const [year, month, day] = dateStr.split('-');
  return `${day}/${month}/${year}`;
};

export const OnboardingCourseScreen = ({ navigation }: Props) => {
  const { colors, mode } = useAthenaTheme();
  const { t, language, weekStartDay } = useAppPreferences();
  const styles = useMemo(() => createStyles(colors), [colors]);
  const createCurso = useCreateCurso();

  const [nome, setNome] = useState('');
  const [instituicao, setInstituicao] = useState('');
  const [dataInicio, setDataInicio] = useState(`${currentYear}-09-01`);
  const [dataFimPrevista, setDataFimPrevista] = useState(`${currentYear + 3}-07-31`);
  const [escala, setEscala] = useState<GradeScale>('0-20');
  const [notaMinima, setNotaMinima] = useState('10');
  const [datePickerTarget, setDatePickerTarget] = useState<'start' | 'end' | null>(null);

  const onNext = async () => {
    if (!nome.trim()) {
      Alert.alert(t('common.error'), t('courses.error.nameRequired'));
      return;
    }
    if (!dataInicio.trim()) {
      Alert.alert(t('common.error'), t('courses.error.dateRequired'));
      return;
    }

    const parsedNota = Number(notaMinima.replace(',', '.'));
    if (!Number.isFinite(parsedNota) || parsedNota <= 0) {
      Alert.alert(t('common.error'), t('courses.error.invalidMinGrade'));
      return;
    }

    try {
      const cursoId = await createCurso.mutateAsync({
        nome: nome.trim(),
        instituicao: instituicao.trim() || null,
        dataInicio,
        dataFimPrevista: dataFimPrevista.trim() || null,
        escalaNatas: escala,
        notaMinimaAprovacao: parsedNota,
      });
      navigation.navigate('OnboardingSemester', { cursoId });
    } catch {
      Alert.alert(t('common.error'), t('courses.error.save'));
    }
  };

  const selectedDate = datePickerTarget === 'start' ? dataInicio : dataFimPrevista;
  const markedDates = selectedDate
    ? { [selectedDate]: { selected: true, selectedColor: colors.primary[500] } }
    : {};

  return (
    <Screen>
      <OnboardingTopHeader />

      <Text style={styles.step}>{t('onboarding.course.step')}</Text>
      <Text style={styles.title}>{t('onboarding.course.title')}</Text>
      <Text style={styles.subtitle}>{t('onboarding.course.subtitle')}</Text>

      <AppInput
        label={t('courses.field.courseName')}
        value={nome}
        onChangeText={setNome}
        placeholder={t('courses.placeholder.courseName')}
      />

      <AppInput
        label={t('courses.field.institution')}
        value={instituicao}
        onChangeText={setInstituicao}
        placeholder={t('courses.placeholder.institution')}
      />

      <View style={styles.dateRow}>
        <DateField
          styles={styles}
          label={t('courses.field.startDate')}
          value={dataInicio}
          placeholder={t('courses.placeholder.selectDate')}
          onPress={() => setDatePickerTarget('start')}
        />
        <DateField
          styles={styles}
          label={t('onboarding.course.field.expectedEndDate')}
          value={dataFimPrevista}
          placeholder={t('courses.placeholder.selectDateOptional')}
          onPress={() => setDatePickerTarget('end')}
        />
      </View>

      <View style={styles.group}>
        <Text style={styles.label}>{t('courses.field.gradeScale')}</Text>
        <View style={styles.chipRow}>
          {ESCALAS.map((item) => (
            <AppChip
              key={item.value}
              label={item.label}
              selected={escala === item.value}
              variant="primary"
              onPress={() => setEscala(item.value)}
            />
          ))}
        </View>
      </View>

      <AppInput
        label={t('courses.field.minGrade')}
        value={notaMinima}
        onChangeText={setNotaMinima}
        placeholder={t('courses.placeholder.minGrade')}
        keyboardType="decimal-pad"
      />

      <AppButton
        label={createCurso.isPending ? t('onboarding.common.creating') : t('onboarding.common.next')}
        icon="arrow-forward"
        size="lg"
        onPress={() => {
          void onNext();
        }}
        loading={createCurso.isPending}
        disabled={createCurso.isPending}
      />

      <Modal visible={datePickerTarget !== null} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.calendarModal}>
            <View style={styles.calendarHeader}>
              <Text style={styles.calendarTitle}>
                {datePickerTarget === 'start'
                  ? t('courses.field.startDate')
                  : t('onboarding.course.field.expectedEndDate')}
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
              key={`onboarding-course-picker-${mode}-${language}-${weekStartDay}`}
              showSixWeeks
              hideExtraDays={false}
              firstDay={weekStartDay}
              markedDates={markedDates}
              onDayPress={(day: DateData) => {
                if (datePickerTarget === 'start') setDataInicio(day.dateString);
                else setDataFimPrevista(day.dateString);
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
  placeholder: string;
  onPress: () => void;
}

const DateField = ({ styles, label, value, placeholder, onPress }: DateFieldProps) => (
  <View style={[styles.group, styles.dateFieldWrap]}>
    <Text style={styles.label}>{label}</Text>
    <Pressable style={styles.dateField} onPress={onPress}>
      <Text style={[styles.dateValue, !value && styles.datePlaceholder]}>
        {value ? formatDateDisplay(value) : placeholder}
      </Text>
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
    datePlaceholder: {
      color: colors.text.tertiary,
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
