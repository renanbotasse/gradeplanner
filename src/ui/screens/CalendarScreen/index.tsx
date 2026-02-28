import { useEffect, useMemo, useRef, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Calendar, type DateData } from 'react-native-calendars';
import { useNavigation, useRoute } from '@react-navigation/native';
import type { RouteProp } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';

import type { MainTabsParamList, RootStackParamList } from '@/app/navigation/types';
import type { EventRecord } from '@/db/types';
import { athenaRepository } from '@/db/repositories/athenaRepository';
import { useAllUCsWithSemester, useCalendarData } from '@/features/calendar/hooks';
import { useAppPreferences } from '@/presentation/providers/AppPreferencesProvider';
import { AppHeader } from '@/presentation/widgets/app_header';
import { AppButton } from '@/ui/components/primitives';
import { Screen } from '@/ui/components/Screen';
import { radius, spacing, typography } from '@/ui/theme/foundation';
import { useAthenaTheme, type AthenaColors } from '@/ui/theme/tokens';
import { formatDate, toDateOnly } from '@/utils/date';
import { buildTipoColors } from '@/utils/tipoUtils';
import { DayEventsList } from './DayEventsList';
import { EventFormModal } from './EventFormModal';

interface LegendDotProps {
  styles: ReturnType<typeof createStyles>;
  color: string;
  label: string;
}

const LegendDot = ({ styles, color, label }: LegendDotProps) => (
  <View style={styles.legendItem}>
    <View style={[styles.legendDot, { backgroundColor: color }]} />
    <Text style={styles.legendLabel}>{label}</Text>
  </View>
);

export const CalendarScreen = () => {
  const { colors, mode } = useAthenaTheme();
  const { t, language, weekStartDay } = useAppPreferences();
  const styles = useMemo(() => createStyles(colors), [colors]);
  const tipoColors = useMemo(() => buildTipoColors(colors), [colors]);
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const route = useRoute<RouteProp<MainTabsParamList, 'Calendario'>>();
  const handledEditRequestRef = useRef<number | null>(null);

  const [selectedDate, setSelectedDate] = useState(toDateOnly(new Date().toISOString()));
  const [visibleMonth, setVisibleMonth] = useState(new Date());
  const [showEventModal, setShowEventModal] = useState(false);
  const [editingEvent, setEditingEvent] = useState<EventRecord | null>(null);

  const monthKey = `${visibleMonth.getFullYear()}-${String(visibleMonth.getMonth() + 1).padStart(2, '0')}`;
  const calendarQuery = useCalendarData(monthKey);
  const ucsQuery = useAllUCsWithSemester();

  const { avaliacoes: monthAvaliacoes = [], events: monthEvents = [] } = calendarQuery.data ?? {};
  const allUCs = ucsQuery.data ?? [];

  const markedDates = useMemo(() => {
    const marks: Record<string, {
      marked?: boolean; dotColor?: string; selected?: boolean;
      selectedColor?: string; dots?: { color: string }[];
    }> = {};

    for (const a of monthAvaliacoes) {
      const date = toDateOnly(a.dataHora);
      marks[date] = { ...(marks[date] ?? {}), marked: true, dotColor: colors.primary[500] };
    }

    for (const e of monthEvents) {
      const date = toDateOnly(e.dateTime);
      const color = tipoColors[e.tipo] ?? colors.success.base;
      if (!marks[date]) {
        marks[date] = { marked: true, dotColor: color };
      }
    }

    marks[selectedDate] = {
      ...(marks[selectedDate] ?? {}),
      selected: true,
      selectedColor: colors.primary[500],
    };

    return marks;
  }, [monthAvaliacoes, monthEvents, selectedDate, colors, tipoColors]);

  const dayAvaliacoes = useMemo(
    () => monthAvaliacoes.filter((a) => toDateOnly(a.dataHora) === selectedDate),
    [monthAvaliacoes, selectedDate],
  );

  const dayEvents = useMemo(
    () => monthEvents.filter((e) => toDateOnly(e.dateTime) === selectedDate),
    [monthEvents, selectedDate],
  );

  const openEditEvent = (event: EventRecord) => {
    setEditingEvent(event);
    setShowEventModal(true);
  };

  const closeModal = () => {
    setShowEventModal(false);
    setEditingEvent(null);
  };

  useEffect(() => {
    if (!route.params?.date) return;
    const [year, month] = route.params.date.split('-').map(Number);
    if (!year || !month) return;
    setSelectedDate(route.params.date);
    setVisibleMonth(new Date(year, month - 1, 1));
  }, [route.params?.date, route.params?.requestAt]);

  useEffect(() => {
    const targetEventId = route.params?.editEventId;
    const requestAt = route.params?.requestAt;
    if (!targetEventId || !requestAt) return;
    if (handledEditRequestRef.current === requestAt) return;

    const openRequestedEvent = async () => {
      let event = monthEvents.find((item) => item.id === targetEventId) ?? null;
      if (!event) {
        event = await athenaRepository.getEventById(targetEventId);
        if (!event) return;

        const eventDate = toDateOnly(event.dateTime);
        setSelectedDate(eventDate);
        const [year, month] = eventDate.split('-').map(Number);
        if (year && month) {
          setVisibleMonth(new Date(year, month - 1, 1));
        }
      }

      openEditEvent(event);
      handledEditRequestRef.current = requestAt;
    };

    void openRequestedEvent();
  }, [monthEvents, route.params?.editEventId, route.params?.requestAt]);

  return (
    <Screen>
      <AppHeader title={t('header.calendar')} />

      <View style={styles.calendarCard}>
        <Calendar
          key={`calendar-main-${mode}-${language}-${weekStartDay}`}
          showSixWeeks
          hideExtraDays={false}
          markedDates={markedDates}
          onDayPress={(day: DateData) => setSelectedDate(day.dateString)}
          onMonthChange={(month: DateData) => setVisibleMonth(new Date(month.year, month.month - 1, 1))}
          firstDay={weekStartDay}
          enableSwipeMonths
          theme={{
            calendarBackground: colors.background.surface,
            textSectionTitleColor: colors.text.tertiary,
            dayTextColor: colors.text.primary,
            monthTextColor: colors.text.primary,
            selectedDayTextColor: colors.text.onPrimary,
            todayTextColor: colors.primary[500],
            arrowColor: colors.primary[500],
          }}
        />
      </View>

      <View style={styles.legendRow}>
        <LegendDot color={tipoColors.avaliacao} label={t('calendar.legend.assessments')} styles={styles} />
        <LegendDot color={tipoColors.atividade} label={t('calendar.legend.activities')} styles={styles} />
        <LegendDot color={tipoColors.evento} label={t('calendar.legend.events')} styles={styles} />
      </View>

      <View style={styles.eventsHeader}>
        <Text style={styles.eventsTitle}>{formatDate(selectedDate)}</Text>
      </View>

      <AppButton
        label={t('calendar.createEvent')}
        variant="secondary"
        icon="add-circle-outline"
        onPress={() => {
          setEditingEvent(null);
          setShowEventModal(true);
        }}
      />

      <DayEventsList
        dayAvaliacoes={dayAvaliacoes}
        dayEvents={dayEvents}
        tipoColors={tipoColors}
        onOpenEditEvent={openEditEvent}
      />

      <EventFormModal
        visible={showEventModal}
        editingEvent={editingEvent}
        initialDate={selectedDate}
        allUCs={allUCs}
        onClose={closeModal}
      />
    </Screen>
  );
};

const createStyles = (colors: AthenaColors) =>
  StyleSheet.create({
    calendarCard: {
      borderRadius: radius.lg,
      borderWidth: 1,
      borderColor: colors.border.default,
      backgroundColor: colors.background.surface,
      padding: spacing.xxs,
    },
    legendRow: { flexDirection: 'row', justifyContent: 'center', gap: spacing.sm },
    legendItem: { flexDirection: 'row', alignItems: 'center', gap: spacing.xxs },
    legendDot: { width: spacing.xs, height: spacing.xs, borderRadius: radius.pill },
    legendLabel: { ...typography.caption, color: colors.text.secondary },
    eventsHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
    eventsTitle: { ...typography.h3, color: colors.text.primary },
  });
