import { useMemo } from 'react';
import { Alert, Pressable, StyleSheet, Text, View } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';

import type { RootStackParamList } from '@/app/navigation/types';
import type { AvaliacaoRecord, EventRecord, EventTipo } from '@/db/types';
import { componentSize, iconSize, radius, spacing, typography, withAlpha } from '@/ui/theme/foundation';
import { useAthenaTheme, type AthenaColors } from '@/ui/theme/tokens';
import { useAppPreferences } from '@/presentation/providers/AppPreferencesProvider';
import { formatDateTime } from '@/utils/date';
import { tipoIcons } from '@/utils/tipoUtils';
import { useDeleteEvent, useToggleEventCompleted } from '@/features/calendar/hooks';

interface DayEventsListProps {
  dayAvaliacoes: AvaliacaoRecord[];
  dayEvents: EventRecord[];
  tipoColors: Record<EventTipo, string>;
  onOpenEditEvent: (event: EventRecord) => void;
}

const toErrorMessage = (error: unknown, fallback: string): string => {
  if (error instanceof Error && error.message.trim()) return error.message;
  return fallback;
};

export const DayEventsList = ({
  dayAvaliacoes,
  dayEvents,
  tipoColors,
  onOpenEditEvent,
}: DayEventsListProps) => {
  const { colors } = useAthenaTheme();
  const { t } = useAppPreferences();
  const styles = useMemo(() => createStyles(colors), [colors]);
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();

  const toggleEventMutation = useToggleEventCompleted();
  const deleteEventMutation = useDeleteEvent();

  const handleDeleteEvent = (eventId: number) => {
    Alert.alert(t('calendar.delete.title'), t('calendar.delete.message'), [
      { text: t('common.cancel'), style: 'cancel' },
      {
        text: t('common.delete'),
        style: 'destructive',
        onPress: async () => {
          try {
            await deleteEventMutation.mutateAsync(eventId);
          } catch (error) {
            Alert.alert(t('common.error'), toErrorMessage(error, t('calendar.error.delete')));
          }
        },
      },
    ]);
  };

  return (
    <>
      {dayAvaliacoes.map((a) => (
        <Pressable
          key={`av-${a.id}`}
          style={styles.eventCard}
          onPress={() => navigation.navigate('EditAvaliacao', { ucId: a.ucId, semesterId: 0, avaliacaoId: a.id })}
        >
          <View style={[styles.eventIconWrap, { backgroundColor: withAlpha(tipoColors.avaliacao, 0.1) }]}>
            <MaterialIcons name="quiz" size={iconSize.md} color={tipoColors.avaliacao} />
          </View>
          <View style={styles.eventText}>
            <Text style={styles.eventTitle}>{a.nome}</Text>
            <Text style={styles.eventSubtitle}>{formatDateTime(a.dataHora)} · {a.peso}%</Text>
            {a.notaObtida !== null ? (
              <Text style={styles.gradeText}>{t('calendar.grade')}: {a.notaObtida.toFixed(1)}</Text>
            ) : (
              <Text style={styles.pendingText}>{t('calendar.noGrade')}</Text>
            )}
          </View>
          <MaterialIcons name="chevron-right" size={iconSize.md} color={colors.text.tertiary} />
        </Pressable>
      ))}

      {dayEvents.map((event) => {
        const color = tipoColors[event.tipo] ?? colors.success.base;
        const icon = tipoIcons[event.tipo] ?? 'event';
        return (
          <Pressable
            key={`ev-${event.id}`}
            style={[styles.eventCard, event.completed && styles.eventCompleted]}
            onPress={() => onOpenEditEvent(event)}
          >
            <View style={[styles.eventIconWrap, { backgroundColor: withAlpha(color, 0.1) }]}>
              <MaterialIcons name={icon} size={iconSize.md} color={color} />
            </View>
            <View style={styles.eventText}>
              <Text style={styles.eventTitle}>{event.title}</Text>
              <Text style={styles.eventSubtitle}>{formatDateTime(event.dateTime)}</Text>
            </View>
            <View style={styles.eventActions}>
              <Pressable
                style={styles.eventActionButton}
                onPress={(e) => {
                  e.stopPropagation();
                  toggleEventMutation.mutate({ eventId: event.id, completed: !event.completed });
                }}
              >
                <MaterialIcons
                  name={event.completed ? 'radio-button-unchecked' : 'check-circle'}
                  size={iconSize.md}
                  color={event.completed ? colors.text.tertiary : colors.success.base}
                />
              </Pressable>
              <Pressable
                style={styles.eventActionButton}
                onPress={(e) => {
                  e.stopPropagation();
                  onOpenEditEvent(event);
                }}
              >
                <MaterialIcons name="edit" size={iconSize.md} color={colors.text.secondary} />
              </Pressable>
              <Pressable
                style={styles.eventActionButton}
                onPress={(e) => {
                  e.stopPropagation();
                  handleDeleteEvent(event.id);
                }}
              >
                <MaterialIcons name="delete-outline" size={iconSize.md} color={colors.danger.base} />
              </Pressable>
            </View>
          </Pressable>
        );
      })}

      {dayAvaliacoes.length === 0 && dayEvents.length === 0 && (
        <View style={styles.emptyCard}>
          <Text style={styles.emptyText}>{t('calendar.emptyDay')}</Text>
        </View>
      )}
    </>
  );
};

const createStyles = (colors: AthenaColors) =>
  StyleSheet.create({
    eventCard: {
      borderRadius: radius.lg,
      borderWidth: 1,
      borderColor: colors.border.default,
      backgroundColor: colors.background.surface,
      padding: spacing.sm,
      flexDirection: 'row',
      alignItems: 'center',
      gap: spacing.xs,
    },
    eventCompleted: { opacity: 0.5 },
    eventIconWrap: {
      width: componentSize.touchMin,
      height: componentSize.touchMin,
      borderRadius: radius.md,
      justifyContent: 'center',
      alignItems: 'center',
    },
    eventText: { flex: 1, gap: spacing.xxs },
    eventTitle: { ...typography.bodyStrong, color: colors.text.primary },
    eventSubtitle: { ...typography.caption, color: colors.text.secondary },
    gradeText: { ...typography.caption, color: colors.success.base },
    pendingText: { ...typography.caption, color: colors.warning.base },
    eventActions: { flexDirection: 'row', alignItems: 'center', gap: spacing.xxs },
    eventActionButton: {
      width: componentSize.touchMin,
      height: componentSize.touchMin,
      borderRadius: radius.pill,
      justifyContent: 'center',
      alignItems: 'center',
    },
    emptyCard: {
      borderRadius: radius.lg,
      borderWidth: 1,
      borderColor: colors.border.default,
      backgroundColor: colors.background.surface,
      padding: spacing.sm,
    },
    emptyText: { ...typography.body, color: colors.text.secondary },
  });
