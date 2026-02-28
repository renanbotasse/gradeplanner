import { useMemo, useState } from 'react';
import { Alert, Modal, Pressable, StyleSheet, Text, View } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Calendar, type DateData } from 'react-native-calendars';
import { MaterialIcons } from '@expo/vector-icons';

import type { OnboardingStackParamList } from '@/app/navigation/OnboardingNavigator';
import { athenaRepository } from '@/db/repositories/athenaRepository';
import type { EventTipo } from '@/db/types';
import { useUCsBySemester } from '@/features/academics/hooks';
import { useAppPreferences } from '@/presentation/providers/AppPreferencesProvider';
import { AppButton, AppCard, AppChip, AppInput } from '@/ui/components/primitives';
import { Screen } from '@/ui/components/Screen';
import { OnboardingTopHeader } from '@/ui/screens/onboarding/OnboardingTopHeader';
import { radius, spacing, typography } from '@/ui/theme/foundation';
import { useAthenaTheme, type AthenaColors } from '@/ui/theme/tokens';

type Props = NativeStackScreenProps<OnboardingStackParamList, 'OnboardingAssessments'> & {
  onComplete: () => void;
};

interface AvaliacaoEntry {
  id: number;
  nome: string;
  tipo: EventTipo;
  data: string;
  hora: string;
  peso: string;
  notas: string;
}

const tipoOptions: EventTipo[] = ['avaliacao', 'atividade', 'evento'];

const formatDateDisplay = (dateStr: string): string => {
  if (!dateStr) return '';
  const [year, month, day] = dateStr.split('-');
  return `${day}/${month}/${year}`;
};

const emptyAvaliacao = (id: number): AvaliacaoEntry => ({
  id,
  nome: '',
  tipo: 'avaliacao',
  data: '',
  hora: '09:00',
  peso: '',
  notas: '',
});

export const OnboardingAssessmentsScreen = ({ route, onComplete }: Props) => {
  const { colors, mode } = useAthenaTheme();
  const { t, language, weekStartDay } = useAppPreferences();
  const styles = useMemo(() => createStyles(colors), [colors]);
  const { semesterId } = route.params;
  const ucsQuery = useUCsBySemester(semesterId);
  const ucs = ucsQuery.data ?? [];

  const [selectedUCIndex, setSelectedUCIndex] = useState(0);
  const [avaliacoesByUC, setAvaliacoesByUC] = useState<Record<number, AvaliacaoEntry[]>>({});
  const [nextEntryId, setNextEntryId] = useState(1);
  const [isSaving, setIsSaving] = useState(false);
  const [datePickerTarget, setDatePickerTarget] = useState<{ ucId: number; entryId: number } | null>(null);

  const currentUC = ucs[selectedUCIndex];

  const getAvaliacoes = (ucId: number): AvaliacaoEntry[] => avaliacoesByUC[ucId] ?? [];

  const updateAvaliacao = (ucId: number, entryId: number, patch: Partial<AvaliacaoEntry>) => {
    setAvaliacoesByUC((prev) => ({
      ...prev,
      [ucId]: (prev[ucId] ?? []).map((item) => (item.id === entryId ? { ...item, ...patch } : item)),
    }));
  };

  const addAvaliacao = (ucId: number) => {
    const next = emptyAvaliacao(nextEntryId);
    setNextEntryId((prev) => prev + 1);
    setAvaliacoesByUC((prev) => ({
      ...prev,
      [ucId]: [...(prev[ucId] ?? []), next],
    }));
  };

  const removeAvaliacao = (ucId: number, entryId: number) => {
    setAvaliacoesByUC((prev) => ({
      ...prev,
      [ucId]: (prev[ucId] ?? []).filter((item) => item.id !== entryId),
    }));
  };

  const onFinish = async () => {
    if (!ucs.length) {
      onComplete();
      return;
    }

    setIsSaving(true);
    try {
      for (const uc of ucs) {
        const avaliacoes = avaliacoesByUC[uc.id] ?? [];
        for (const a of avaliacoes) {
          if (!a.nome.trim() || !a.data.trim() || !a.peso.trim()) continue;
          const peso = Number(a.peso.replace(',', '.'));
          if (!peso) continue;
          const hora = /^\d{2}:\d{2}$/.test(a.hora) ? a.hora : '09:00';

          await athenaRepository.createAvaliacao({
            ucId: uc.id,
            nome: a.nome.trim(),
            tipo: a.tipo,
            dataHora: `${a.data}T${hora}:00`,
            peso,
            notas: a.notas.trim() || null,
          });
        }
      }
      onComplete();
    } catch {
      Alert.alert(t('common.error'), t('onboarding.assessments.error.save'));
      onComplete();
    } finally {
      setIsSaving(false);
    }
  };

  if (!ucs.length) {
    return (
      <Screen>
        <OnboardingTopHeader />
        <Text style={styles.step}>{t('onboarding.assessments.step')}</Text>
        <Text style={styles.title}>{t('onboarding.assessments.title')}</Text>
        <Text style={styles.subtitle}>{t('onboarding.assessments.emptySubjects')}</Text>
        <AppButton
          label={t('onboarding.common.finish')}
          icon="check"
          size="lg"
          onPress={onComplete}
        />
      </Screen>
    );
  }

  const currentUcId = currentUC?.id ?? 0;
  const avaliacoes = getAvaliacoes(currentUcId);
  const selectedEntryForDate =
    datePickerTarget
      ? (avaliacoesByUC[datePickerTarget.ucId] ?? []).find((item) => item.id === datePickerTarget.entryId) ?? null
      : null;
  const selectedDate = selectedEntryForDate?.data ?? '';
  const markedDates = selectedDate
    ? { [selectedDate]: { selected: true, selectedColor: colors.primary[500] } }
    : {};

  return (
    <Screen>
      <OnboardingTopHeader />

      <Text style={styles.step}>{t('onboarding.assessments.step')}</Text>
      <Text style={styles.title}>{t('onboarding.assessments.title')}</Text>

      <View style={styles.ucTabs}>
        {ucs.map((uc, index) => (
          <AppChip
            key={uc.id}
            label={uc.name}
            selected={selectedUCIndex === index}
            variant="primary"
            onPress={() => setSelectedUCIndex(index)}
          />
        ))}
      </View>

      {avaliacoes.length === 0 ? (
        <AppCard style={styles.emptyCard}>
          <Text style={styles.emptyCardText}>{t('onboarding.assessments.emptyList')}</Text>
        </AppCard>
      ) : (
        avaliacoes.map((a) => (
          <AppCard key={a.id} style={styles.card}>
            <View style={styles.cardHeader}>
              <Text style={styles.cardTitle}>{t('onboarding.assessments.itemTitle')}</Text>
              <Pressable onPress={() => removeAvaliacao(currentUcId, a.id)}>
                <MaterialIcons name="delete-outline" size={20} color={colors.danger.base} />
              </Pressable>
            </View>

            <AppInput
              label={t('activity.field.name')}
              value={a.nome}
              onChangeText={(value) => updateAvaliacao(currentUcId, a.id, { nome: value })}
              placeholder={t('onboarding.assessments.placeholder.name')}
            />

            <View style={styles.fieldGroup}>
              <Text style={styles.fieldLabel}>{t('activity.field.type')}</Text>
              <View style={styles.typeRow}>
                {tipoOptions.map((tipo) => (
                  <AppChip
                    key={tipo}
                    label={
                      tipo === 'avaliacao'
                        ? t('eventType.assessment')
                        : tipo === 'atividade'
                        ? t('eventType.activity')
                        : t('eventType.event')
                    }
                    selected={a.tipo === tipo}
                    variant={tipo === 'avaliacao' ? 'info' : tipo === 'atividade' ? 'warning' : 'event'}
                    onPress={() => updateAvaliacao(currentUcId, a.id, { tipo })}
                  />
                ))}
              </View>
            </View>

            <View style={styles.row}>
              <View style={[styles.fieldGroup, styles.rowCell]}>
                <Text style={styles.fieldLabel}>{t('activity.field.dateTime')}</Text>
                <Pressable
                  style={styles.dateField}
                  onPress={() => setDatePickerTarget({ ucId: currentUcId, entryId: a.id })}
                >
                  <Text style={[styles.dateValue, !a.data && styles.datePlaceholder]}>
                    {a.data ? formatDateDisplay(a.data) : t('activity.placeholder.selectDate')}
                  </Text>
                </Pressable>
              </View>

              <View style={[styles.fieldGroup, styles.timeCell]}>
                <Text style={styles.fieldLabel}>{t('calendar.field.time')}</Text>
                <AppInput
                  value={a.hora}
                  onChangeText={(value) => updateAvaliacao(currentUcId, a.id, { hora: value })}
                  placeholder="09:00"
                  keyboardType="numbers-and-punctuation"
                  maxLength={5}
                />
              </View>
            </View>

            <View style={styles.row}>
              <View style={styles.rowCell}>
                <AppInput
                  label={t('activity.field.weight')}
                  value={a.peso}
                  onChangeText={(value) => updateAvaliacao(currentUcId, a.id, { peso: value })}
                  placeholder={t('onboarding.assessments.placeholder.weight')}
                  keyboardType="decimal-pad"
                />
              </View>
            </View>

            <AppInput
              label={t('activity.field.notes')}
              value={a.notas}
              onChangeText={(value) => updateAvaliacao(currentUcId, a.id, { notas: value })}
              placeholder={t('activity.placeholder.notes')}
              multiline
              numberOfLines={3}
            />
          </AppCard>
        ))
      )}

      <AppButton
        label={t('onboarding.assessments.add')}
        variant="secondary"
        icon="add"
        size="lg"
        onPress={() => addAvaliacao(currentUcId)}
      />

      <AppButton
        label={isSaving ? t('activity.saving') : t('onboarding.common.finish')}
        icon="check"
        size="lg"
        onPress={() => {
          void onFinish();
        }}
        loading={isSaving}
        disabled={isSaving}
      />

      <Pressable style={styles.skipBtn} onPress={onComplete}>
        <Text style={styles.skipBtnText}>{t('onboarding.common.addLater')}</Text>
      </Pressable>

      <Modal visible={datePickerTarget !== null} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.calendarModal}>
            <View style={styles.calendarHeader}>
              <Text style={styles.calendarTitle}>{t('calendar.field.selectDateTitle')}</Text>
              <AppButton
                label={t('calendar.button.confirm')}
                size="md"
                fullWidth={false}
                variant="secondary"
                onPress={() => setDatePickerTarget(null)}
              />
            </View>
            <Calendar
              key={`onboarding-assessments-picker-${mode}-${language}-${weekStartDay}`}
              showSixWeeks
              hideExtraDays={false}
              firstDay={weekStartDay}
              markedDates={markedDates}
              onDayPress={(day: DateData) => {
                if (!datePickerTarget) return;
                updateAvaliacao(datePickerTarget.ucId, datePickerTarget.entryId, { data: day.dateString });
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
    },
    ucTabs: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: spacing.xs,
    },
    emptyCard: {
      minHeight: 72,
      justifyContent: 'center',
      alignItems: 'center',
    },
    emptyCardText: {
      ...typography.body,
      color: colors.text.secondary,
    },
    card: {
      gap: spacing.sm,
    },
    cardHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
    },
    cardTitle: {
      ...typography.bodyStrong,
      color: colors.text.primary,
    },
    fieldGroup: {
      gap: spacing.xxs,
    },
    fieldLabel: {
      ...typography.caption,
      color: colors.text.secondary,
    },
    typeRow: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: spacing.xs,
    },
    row: {
      flexDirection: 'row',
      gap: spacing.xs,
    },
    rowCell: {
      flex: 1,
    },
    timeCell: {
      width: 120,
    },
    dateField: {
      minHeight: 46,
      borderRadius: radius.md,
      borderWidth: 1,
      borderColor: colors.border.default,
      backgroundColor: colors.background.base,
      justifyContent: 'center',
      paddingHorizontal: spacing.sm,
    },
    dateValue: {
      ...typography.body,
      color: colors.text.primary,
    },
    datePlaceholder: {
      color: colors.text.tertiary,
    },
    skipBtn: {
      alignItems: 'center',
      paddingVertical: spacing.xs,
    },
    skipBtnText: {
      ...typography.body,
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
