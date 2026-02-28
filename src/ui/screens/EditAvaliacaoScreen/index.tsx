import { useEffect, useMemo, useState } from 'react';
import { Alert, Modal, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { MaterialIcons } from '@expo/vector-icons';
import { Calendar, type DateData } from 'react-native-calendars';

import type { EventTipo } from '@/db/types';
import type { RootStackParamList } from '@/app/navigation/types';
import { useAvaliacoes, useCreateAvaliacao, useDeleteAvaliacao, useUpdateAvaliacao } from '@/features/academics/hooks';
import { useAppPreferences } from '@/presentation/providers/AppPreferencesProvider';
import { AppHeader } from '@/presentation/widgets/app_header';
import { AppButton } from '@/ui/components/primitives';
import { FormInput } from '@/ui/components/FormInput';
import { Screen } from '@/ui/components/Screen';
import { athenaRadius, useAthenaTheme, type AthenaColors } from '@/ui/theme/tokens';
import { formatDateDisplay, parseNullableNumber } from '@/utils/formUtils';
import { toEventTipo } from '@/utils/tipoUtils';
import { RemindersCard } from './RemindersCard';

type Props = NativeStackScreenProps<RootStackParamList, 'EditAvaliacao'>;

const tipoOptions: EventTipo[] = ['avaliacao', 'atividade', 'evento'];

export const EditAvaliacaoScreen = ({ route, navigation }: Props) => {
  const { colors, mode } = useAthenaTheme();
  const { t, language, weekStartDay } = useAppPreferences();
  const styles = useMemo(() => createStyles(colors), [colors]);
  const tipoLabels = useMemo<Record<EventTipo, string>>(
    () => ({
      avaliacao: t('eventType.assessment'),
      atividade: t('eventType.activity'),
      evento: t('eventType.event'),
    }),
    [t],
  );
  const { ucId, avaliacaoId } = route.params;

  const avaliacoesQuery = useAvaliacoes(ucId);
  const createMutation = useCreateAvaliacao(ucId);
  const updateMutation = useUpdateAvaliacao(ucId);
  const deleteMutation = useDeleteAvaliacao(ucId);

  const avaliacao = useMemo(
    () => avaliacoesQuery.data?.find((item) => item.id === avaliacaoId) ?? null,
    [avaliacaoId, avaliacoesQuery.data],
  );

  const [nome, setNome] = useState('');
  const [peso, setPeso] = useState('');
  const [notaObtida, setNotaObtida] = useState('');
  const [notaMaxima, setNotaMaxima] = useState('');
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedTime, setSelectedTime] = useState('09:00');
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [tipo, setTipo] = useState<EventTipo>('avaliacao');
  const [lembreteAtivo, setLembreteAtivo] = useState(false);
  const [selectedReminders, setSelectedReminders] = useState<number[]>([]);
  const [notas, setNotas] = useState('');

  useEffect(() => {
    if (!avaliacao) {
      setNome('');
      setPeso('');
      setNotaObtida('');
      setNotaMaxima('');
      setSelectedDate('');
      setSelectedTime('09:00');
      setTipo('avaliacao');
      setLembreteAtivo(false);
      setSelectedReminders([]);
      setNotas('');
      return;
    }

    setNome(avaliacao.nome);
    setPeso(String(avaliacao.peso));
    setNotaObtida(avaliacao.notaObtida !== null ? String(avaliacao.notaObtida) : '');
    setNotaMaxima(avaliacao.notaMaxima !== null ? String(avaliacao.notaMaxima) : '');
    if (avaliacao.dataHora) {
      const parts = avaliacao.dataHora.slice(0, 16).split('T');
      setSelectedDate(parts[0] ?? '');
      setSelectedTime(parts[1] ?? '09:00');
    }
    setTipo(toEventTipo(avaliacao.tipo));
    setLembreteAtivo(avaliacao.lembreteAtivo);
    setSelectedReminders(avaliacao.lembreteAntecedencia ?? []);
    setNotas(avaliacao.notas ?? '');
  }, [avaliacao]);

  const toggleReminder = (minutes: number) => {
    setSelectedReminders((prev) =>
      prev.includes(minutes) ? prev.filter((m) => m !== minutes) : [...prev, minutes],
    );
  };

  const onSave = async () => {
    if (!nome.trim()) {
      Alert.alert(t('common.error'), t('activity.error.nameRequired'));
      return;
    }

    const parsedPeso = parseNullableNumber(peso);
    if (parsedPeso === null || parsedPeso <= 0) {
      Alert.alert(t('common.error'), t('activity.error.invalidWeight'));
      return;
    }

    if (!selectedDate) {
      Alert.alert(t('common.error'), t('activity.error.dateRequired'));
      return;
    }

    const timeRegex = /^\d{2}:\d{2}$/;
    const timeToUse = timeRegex.test(selectedTime) ? selectedTime : '09:00';
    const dataHoraISO = `${selectedDate}T${timeToUse}:00`;

    const payload = {
      nome: nome.trim(),
      tipo,
      dataHora: dataHoraISO,
      peso: parsedPeso,
      notaObtida: parseNullableNumber(notaObtida),
      notaMaxima: parseNullableNumber(notaMaxima),
      lembreteAtivo,
      lembreteAntecedencia: lembreteAtivo ? selectedReminders : null,
      notas: notas.trim() || null,
    };

    try {
      if (avaliacaoId) {
        await updateMutation.mutateAsync({ avaliacaoId, input: payload });
      } else {
        await createMutation.mutateAsync(payload);
      }
      navigation.goBack();
    } catch {
      Alert.alert(t('common.error'), t('activity.error.save'));
    }
  };

  const onDelete = () => {
    if (!avaliacaoId) return;
    Alert.alert(t('activity.delete.title'), t('activity.delete.message'), [
      { text: t('common.cancel'), style: 'cancel' },
      {
        text: t('common.delete'),
        style: 'destructive',
        onPress: async () => {
          try {
            await deleteMutation.mutateAsync(avaliacaoId);
            navigation.goBack();
          } catch {
            Alert.alert(t('common.error'), t('activity.error.delete'));
          }
        },
      },
    ]);
  };

  const isSaving = createMutation.isPending || updateMutation.isPending;
  const isBusy = isSaving || deleteMutation.isPending;

  const markedDates = selectedDate
    ? { [selectedDate]: { selected: true, selectedColor: colors.primary[600] } }
    : {};

  return (
    <Screen scroll={false} contentContainerStyle={styles.screenContainer}>
      <AppHeader title={avaliacaoId ? t('header.editActivity') : t('header.newActivity')} />

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.content}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <FormInput label={t('activity.field.name')} value={nome} onChangeText={setNome} />

        <View style={styles.row}>
          <View style={styles.rowCell}>
            <FormInput label={t('activity.field.weight')} value={peso} onChangeText={setPeso} keyboardType="decimal-pad" />
          </View>
          <View style={styles.rowCell}>
            <FormInput
              label={t('activity.field.obtainedGrade')}
              value={notaObtida}
              onChangeText={setNotaObtida}
              keyboardType="decimal-pad"
              placeholder={t('activity.placeholder.obtainedGrade')}
            />
          </View>
        </View>

        <View style={styles.row}>
          <View style={styles.rowCell}>
            <FormInput
              label={t('activity.field.maxGrade')}
              value={notaMaxima}
              onChangeText={setNotaMaxima}
              keyboardType="decimal-pad"
              placeholder={t('activity.placeholder.maxGrade')}
            />
          </View>
        </View>

        {/* Date + Time picker */}
        <View style={styles.inputGroup}>
          <Text style={styles.inputLabel}>{t('activity.field.dateTime')}</Text>
          <View style={styles.dateTimeRow}>
            <Pressable style={styles.dateButton} onPress={() => setShowDatePicker(true)}>
              <MaterialIcons
                name="calendar-today"
                size={16}
                color={selectedDate ? colors.text.primary : colors.text.tertiary}
              />
              <Text style={[styles.dateButtonText, !selectedDate && styles.dateButtonPlaceholder]}>
                {selectedDate ? formatDateDisplay(selectedDate) : t('activity.placeholder.selectDate')}
              </Text>
            </Pressable>
            <TextInput
              style={styles.timeInput}
              value={selectedTime}
              onChangeText={setSelectedTime}
              placeholder="HH:MM"
              placeholderTextColor={colors.text.tertiary}
              keyboardType="numbers-and-punctuation"
              maxLength={5}
            />
          </View>
        </View>

        {/* Type chips */}
        <View style={styles.typeSection}>
          <Text style={styles.typeSectionLabel}>{t('activity.field.type')}</Text>
          <View style={styles.typeRow}>
            {tipoOptions.map((option) => (
              <Pressable
                key={option}
                style={[styles.typeChip, tipo === option && styles.typeChipActive]}
                onPress={() => setTipo(option)}
              >
                <Text style={[styles.typeChipText, tipo === option && styles.typeChipTextActive]}>
                  {tipoLabels[option]}
                </Text>
              </Pressable>
            ))}
          </View>
        </View>

        <RemindersCard
          enabled={lembreteAtivo}
          selectedReminders={selectedReminders}
          onToggleEnabled={setLembreteAtivo}
          onToggleReminder={toggleReminder}
          t={t}
        />

        <FormInput
          label={t('activity.field.notes')}
          value={notas}
          onChangeText={setNotas}
          placeholder={t('activity.placeholder.notes')}
        />
      </ScrollView>

      <View style={styles.actionsFooter}>
        <View style={styles.actionsRow}>
          <View style={styles.actionCell}>
            <AppButton
              label={t('common.close')}
              variant="secondary"
              onPress={() => navigation.goBack()}
              disabled={isBusy}
            />
          </View>
          <View style={styles.actionCell}>
            <AppButton
              label={t('common.save')}
              onPress={() => { void onSave(); }}
              loading={isSaving}
              disabled={isBusy}
            />
          </View>
        </View>

        {avaliacaoId ? (
          <AppButton
            label={t('activity.delete.action')}
            variant="danger"
            onPress={onDelete}
            disabled={isBusy}
            loading={deleteMutation.isPending}
          />
        ) : null}
      </View>

      {/* Calendar date picker modal */}
      <Modal visible={showDatePicker} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.calendarModal}>
            <View style={styles.calendarHeader}>
              <Text style={styles.calendarTitle}>{t('calendar.field.selectDateTitle')}</Text>
              <Pressable style={styles.calendarDoneButton} onPress={() => setShowDatePicker(false)}>
                <Text style={styles.calendarDoneText}>{t('calendar.button.confirm')}</Text>
              </Pressable>
            </View>
            <Calendar
              key={`activity-picker-${mode}-${language}-${weekStartDay}`}
              showSixWeeks
              hideExtraDays={false}
              firstDay={weekStartDay}
              onDayPress={(day: DateData) => {
                setSelectedDate(day.dateString);
                setShowDatePicker(false);
              }}
              markedDates={markedDates}
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
    screenContainer: { flex: 1, padding: 0, gap: 0 },
    scrollView: { flex: 1 },
    content: { padding: 14, gap: 12, paddingBottom: 120 },
    row: { flexDirection: 'row', gap: 10 },
    rowCell: { flex: 1 },
    inputGroup: { gap: 6 },
    inputLabel: { color: colors.text.secondary, fontSize: 13, fontWeight: '700' },
    dateTimeRow: { flexDirection: 'row', gap: 10 },
    dateButton: {
      flex: 1,
      height: 46,
      borderRadius: 10,
      borderWidth: 1,
      borderColor: colors.border.default,
      backgroundColor: colors.background.surface,
      paddingHorizontal: 12,
      flexDirection: 'row',
      alignItems: 'center',
      gap: 8,
    },
    dateButtonText: { color: colors.text.primary, fontSize: 16 },
    dateButtonPlaceholder: { color: colors.text.tertiary },
    timeInput: {
      width: 90,
      height: 46,
      borderRadius: 10,
      borderWidth: 1,
      borderColor: colors.border.default,
      backgroundColor: colors.background.surface,
      paddingHorizontal: 12,
      color: colors.text.primary,
      fontSize: 16,
      textAlign: 'center',
    },
    typeSection: { gap: 8 },
    typeSectionLabel: { color: colors.text.secondary, fontSize: 13, fontWeight: '700' },
    typeRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
    typeChip: {
      borderRadius: 999,
      borderWidth: 1,
      borderColor: colors.border.default,
      backgroundColor: colors.background.elevated,
      paddingHorizontal: 10,
      paddingVertical: 6,
    },
    typeChipActive: { backgroundColor: colors.info.soft, borderColor: colors.info.base },
    typeChipText: { color: colors.text.secondary, fontSize: 12, fontWeight: '700' },
    typeChipTextActive: { color: colors.primary[600] },
    actionsFooter: {
      borderTopWidth: 1,
      borderTopColor: colors.border.default,
      backgroundColor: colors.background.surface,
      paddingHorizontal: 14,
      paddingTop: 10,
      paddingBottom: 14,
      gap: 8,
    },
    actionsRow: { flexDirection: 'row', gap: 10 },
    actionCell: { flex: 1 },
    modalOverlay: {
      flex: 1,
      backgroundColor: colors.overlay.scrim,
      justifyContent: 'flex-end',
    },
    calendarModal: {
      backgroundColor: colors.background.surface,
      borderTopLeftRadius: 20,
      borderTopRightRadius: 20,
      paddingBottom: 32,
    },
    calendarHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingHorizontal: 20,
      paddingVertical: 16,
      borderBottomWidth: 1,
      borderBottomColor: colors.border.default,
    },
    calendarTitle: { color: colors.text.primary, fontSize: 18, fontWeight: '800' },
    calendarDoneButton: {
      paddingHorizontal: 12,
      paddingVertical: 6,
      borderRadius: 8,
      backgroundColor: colors.primary[500],
    },
    calendarDoneText: { color: colors.text.onPrimary, fontSize: 14, fontWeight: '700' },
  });
