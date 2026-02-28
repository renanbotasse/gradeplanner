import { useEffect, useMemo, useState } from 'react';
import { Alert, Modal, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { Calendar, type DateData } from 'react-native-calendars';
import { MaterialIcons } from '@expo/vector-icons';

import type { CalendarEventType as EventTipo } from '@/domain/calendar/types';
import type { EventRecord } from '@/db/types';
import {
  useCreateManualEvent,
  useDeleteEvent,
  useUpdateEvent,
} from '@/features/calendar/hooks';
import { useAppPreferences } from '@/presentation/providers/AppPreferencesProvider';
import { AppButton, AppChip, AppInput } from '@/ui/components/primitives';
import { componentSize, iconSize, radius, spacing, typography } from '@/ui/theme/foundation';
import { useAthenaTheme, type AthenaColors } from '@/ui/theme/tokens';
import { formatDateDisplay } from '@/utils/formUtils';
import { TIPO_OPTIONS, tipoChipVariant } from '@/utils/tipoUtils';
import { HOURS, MINUTES, TimeColumn } from './TimePicker';

const toErrorMessage = (error: unknown, fallback: string): string => {
  if (error instanceof Error && error.message.trim()) return error.message;
  return fallback;
};

interface EventFormModalProps {
  visible: boolean;
  editingEvent: EventRecord | null;
  initialDate: string;
  allUCs: Array<{ id: number; name: string; icon?: string | null }>;
  onClose: () => void;
}

export const EventFormModal = ({
  visible,
  editingEvent,
  initialDate,
  allUCs,
  onClose,
}: EventFormModalProps) => {
  const { colors, mode } = useAthenaTheme();
  const { t, language, weekStartDay } = useAppPreferences();
  const styles = useMemo(() => createStyles(colors), [colors]);

  const [eventUcId, setEventUcId] = useState<number | null>(null);
  const [eventTipo, setEventTipo] = useState<EventTipo>('evento');
  const [eventTitle, setEventTitle] = useState('');
  const [eventNotes, setEventNotes] = useState('');
  const [eventDate, setEventDate] = useState('');
  const [eventHour, setEventHour] = useState('09');
  const [eventMinute, setEventMinute] = useState('00');
  const [showDatePickerModal, setShowDatePickerModal] = useState(false);

  const createEventMutation = useCreateManualEvent();
  const updateEventMutation = useUpdateEvent();
  const deleteEventMutation = useDeleteEvent();

  const isSaving = createEventMutation.isPending || updateEventMutation.isPending;
  const isDeleting = deleteEventMutation.isPending;
  const isBusy = isSaving || isDeleting;

  useEffect(() => {
    if (!visible) return;
    if (editingEvent) {
      setEventUcId(editingEvent.ucId);
      setEventTipo(editingEvent.tipo);
      setEventTitle(editingEvent.title);
      setEventNotes(editingEvent.notes ?? '');
      const parts = editingEvent.dateTime.slice(0, 16).split('T');
      setEventDate(parts[0] ?? initialDate);
      const timeParts = (parts[1] ?? '09:00').split(':');
      setEventHour(timeParts[0] ?? '09');
      setEventMinute(timeParts[1] ?? '00');
    } else {
      setEventUcId(null);
      setEventTipo('evento');
      setEventTitle('');
      setEventNotes('');
      setEventDate(initialDate);
      setEventHour('09');
      setEventMinute('00');
    }
  }, [visible, editingEvent, initialDate]);

  const tipoOptions = useMemo(
    () =>
      TIPO_OPTIONS.map((option) => ({
        ...option,
        label:
          option.value === 'avaliacao'
            ? t('eventType.assessment')
            : option.value === 'atividade'
            ? t('eventType.activity')
            : t('eventType.event'),
      })),
    [t],
  );

  const saveEvent = async () => {
    if (!eventTitle.trim()) {
      Alert.alert(t('calendar.error.titleRequired'), t('calendar.error.titleRequiredMsg'));
      return;
    }
    if (!eventDate) {
      Alert.alert(t('calendar.error.dateRequired'), t('calendar.error.dateRequiredMsg'));
      return;
    }
    const dateTimeISO = `${eventDate}T${eventHour}:${eventMinute}:00`;
    const payload = {
      title: eventTitle.trim(),
      dateTime: dateTimeISO,
      ucId: eventUcId,
      tipo: eventTipo,
      notes: eventNotes.trim() ? eventNotes.trim() : null,
    };
    try {
      if (editingEvent) {
        await updateEventMutation.mutateAsync({ eventId: editingEvent.id, input: payload });
      } else {
        await createEventMutation.mutateAsync(payload);
      }
      onClose();
    } catch (error) {
      Alert.alert(t('common.error'), toErrorMessage(error, t('calendar.error.save')));
    }
  };

  const deleteEditingEvent = () => {
    if (!editingEvent) return;
    Alert.alert(t('calendar.delete.title'), t('calendar.delete.message'), [
      { text: t('common.cancel'), style: 'cancel' },
      {
        text: t('common.delete'),
        style: 'destructive',
        onPress: async () => {
          try {
            await deleteEventMutation.mutateAsync(editingEvent.id);
            onClose();
          } catch (error) {
            Alert.alert(t('common.error'), toErrorMessage(error, t('calendar.error.delete')));
          }
        },
      },
    ]);
  };

  const datePickerMarked = eventDate
    ? { [eventDate]: { selected: true, selectedColor: colors.primary[500] } }
    : {};

  return (
    <>
      <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalSheet}>
            <View style={styles.modalHeader}>
              <Pressable onPress={onClose}>
                <MaterialIcons name="close" size={iconSize.lg} color={colors.text.secondary} />
              </Pressable>
              <Text style={styles.modalTitle}>
                {editingEvent ? t('calendar.modal.editTitle') : t('calendar.modal.newTitle')}
              </Text>
              <View style={styles.modalHeaderSpacer} />
            </View>

            <ScrollView
              showsVerticalScrollIndicator={false}
              keyboardShouldPersistTaps="handled"
              contentContainerStyle={styles.modalContent}
            >
              {/* UC selector */}
              <Text style={styles.fieldLabel}>{t('calendar.field.associateUc')}</Text>
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.ucSelectorRow}
              >
                <AppChip
                  label={t('calendar.field.independent')}
                  icon="public"
                  selected={eventUcId === null}
                  variant="primary"
                  onPress={() => setEventUcId(null)}
                />
                {allUCs.map((uc) => (
                  <AppChip
                    key={uc.id}
                    label={uc.name}
                    icon={uc.icon as keyof typeof MaterialIcons.glyphMap}
                    selected={eventUcId === uc.id}
                    variant="primary"
                    onPress={() => setEventUcId(uc.id)}
                  />
                ))}
              </ScrollView>

              {/* Tipo chips */}
              <Text style={[styles.fieldLabel, styles.fieldBlockSpacing]}>{t('calendar.field.type')}</Text>
              <View style={styles.tipoRow}>
                {tipoOptions.map((opt) => (
                  <AppChip
                    key={opt.value}
                    label={opt.label}
                    icon={opt.icon}
                    variant={tipoChipVariant[opt.value]}
                    selected={eventTipo === opt.value}
                    onPress={() => setEventTipo(opt.value)}
                  />
                ))}
              </View>

              {/* Title */}
              <View style={styles.fieldBlockSpacing}>
                <AppInput
                  label={t('calendar.field.name')}
                  placeholder={t('calendar.placeholder.eventName')}
                  value={eventTitle}
                  onChangeText={setEventTitle}
                />
              </View>

              {/* Notes */}
              <View style={styles.fieldBlockSpacing}>
                <AppInput
                  label={t('calendar.field.note')}
                  placeholder={t('calendar.placeholder.note')}
                  multiline
                  numberOfLines={4}
                  value={eventNotes}
                  onChangeText={setEventNotes}
                />
              </View>

              {/* Date */}
              <Text style={[styles.fieldLabel, styles.fieldBlockSpacing]}>{t('calendar.field.date')}</Text>
              <Pressable style={styles.dateButton} onPress={() => setShowDatePickerModal(true)}>
                <MaterialIcons
                  name="calendar-today"
                  size={iconSize.sm}
                  color={eventDate ? colors.text.primary : colors.text.tertiary}
                />
                <Text style={[styles.dateButtonText, !eventDate && styles.dateButtonPlaceholder]}>
                  {eventDate ? formatDateDisplay(eventDate) : t('calendar.placeholder.selectDate')}
                </Text>
              </Pressable>

              {/* Time picker */}
              <Text style={[styles.fieldLabel, styles.fieldBlockSpacing]}>{t('calendar.field.time')}</Text>
              <View style={styles.timePicker}>
                <TimeColumn items={HOURS} value={eventHour} onChange={setEventHour} colors={colors} />
                <Text style={styles.timeSeparator}>:</Text>
                <TimeColumn items={MINUTES} value={eventMinute} onChange={setEventMinute} colors={colors} />
              </View>
            </ScrollView>

            <View style={styles.modalFooter}>
              {editingEvent ? (
                <View style={styles.modalFooterRow}>
                  <View style={styles.footerCell}>
                    <AppButton
                      label={t('calendar.button.delete')}
                      variant="danger"
                      onPress={deleteEditingEvent}
                      disabled={isBusy}
                    />
                  </View>
                  <View style={styles.footerCell}>
                    <AppButton
                      label={t('calendar.button.save')}
                      onPress={() => { void saveEvent(); }}
                      loading={isSaving}
                      disabled={isBusy}
                    />
                  </View>
                </View>
              ) : (
                <AppButton
                  label={t('calendar.button.save')}
                  onPress={() => { void saveEvent(); }}
                  loading={isSaving}
                  disabled={isBusy}
                />
              )}
            </View>
          </View>
        </View>
      </Modal>

      {/* Date Picker Modal */}
      <Modal visible={showDatePickerModal} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.calendarModal}>
            <View style={styles.calendarModalHeader}>
              <Text style={styles.modalTitle}>{t('calendar.field.selectDateTitle')}</Text>
              <AppButton
                label={t('calendar.button.confirm')}
                size="md"
                fullWidth={false}
                onPress={() => setShowDatePickerModal(false)}
              />
            </View>
            <Calendar
              key={`calendar-modal-${mode}-${language}-${weekStartDay}`}
              showSixWeeks
              hideExtraDays={false}
              firstDay={weekStartDay}
              onDayPress={(day: DateData) => {
                setEventDate(day.dateString);
                setShowDatePickerModal(false);
              }}
              markedDates={datePickerMarked}
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
    </>
  );
};

const createStyles = (colors: AthenaColors) =>
  StyleSheet.create({
    modalOverlay: { flex: 1, backgroundColor: colors.overlay.scrim, justifyContent: 'flex-end' },
    modalSheet: {
      backgroundColor: colors.background.surface,
      borderTopLeftRadius: radius.xl,
      borderTopRightRadius: radius.xl,
      maxHeight: '90%',
    },
    modalHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingHorizontal: spacing.md,
      paddingVertical: spacing.md,
      borderBottomWidth: 1,
      borderBottomColor: colors.border.default,
    },
    modalTitle: { ...typography.bodyStrong, color: colors.text.primary },
    modalHeaderSpacer: { width: iconSize.lg, height: iconSize.lg },
    modalContent: { padding: spacing.md, paddingBottom: spacing.lg, gap: spacing.xxs },
    fieldLabel: { ...typography.caption, color: colors.text.secondary, marginBottom: spacing.xs },
    fieldBlockSpacing: { marginTop: spacing.sm },
    ucSelectorRow: { flexDirection: 'row', gap: spacing.xs, paddingBottom: spacing.xxs },
    tipoRow: { flexDirection: 'row', gap: spacing.xs },
    dateButton: {
      height: componentSize.inputHeight,
      borderRadius: radius.md,
      borderWidth: 1,
      borderColor: colors.border.default,
      backgroundColor: colors.background.base,
      paddingHorizontal: spacing.sm,
      flexDirection: 'row',
      alignItems: 'center',
      gap: spacing.xs,
    },
    dateButtonText: { ...typography.body, color: colors.text.primary },
    dateButtonPlaceholder: { color: colors.text.tertiary },
    timePicker: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: colors.background.base,
      borderRadius: radius.md,
      borderWidth: 1,
      borderColor: colors.border.default,
      padding: spacing.xs,
      gap: spacing.xxs,
    },
    timeSeparator: { ...typography.h2, color: colors.text.primary, paddingHorizontal: spacing.xxs },
    modalFooter: {
      borderTopWidth: 1,
      borderTopColor: colors.border.default,
      paddingHorizontal: spacing.md,
      paddingTop: spacing.sm,
      paddingBottom: spacing.md,
      backgroundColor: colors.background.surface,
    },
    modalFooterRow: { flexDirection: 'row', gap: spacing.xs },
    footerCell: { flex: 1 },
    calendarModal: {
      backgroundColor: colors.background.surface,
      borderTopLeftRadius: radius.xl,
      borderTopRightRadius: radius.xl,
      paddingBottom: spacing.xl,
    },
    calendarModalHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingHorizontal: spacing.md,
      paddingVertical: spacing.md,
      borderBottomWidth: 1,
      borderBottomColor: colors.border.default,
    },
  });
