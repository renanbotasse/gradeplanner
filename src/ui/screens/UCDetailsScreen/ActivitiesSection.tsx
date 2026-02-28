import { useMemo } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';

import type { RootStackParamList } from '@/app/navigation/types';
import type { EventTipo } from '@/db/types';
import { athenaRadius, useAthenaTheme, type AthenaColors } from '@/ui/theme/tokens';
import { formatDateTime, toDateOnly } from '@/utils/date';

type UCActivityItem =
  | {
      id: string;
      source: 'avaliacao';
      tipo: EventTipo;
      title: string;
      dateTime: string;
      peso: number;
      notaObtida: number | null;
      completed: boolean;
      avaliacaoId: number;
    }
  | {
      id: string;
      source: 'event';
      tipo: EventTipo;
      title: string;
      dateTime: string;
      completed: boolean;
      eventId: number;
    };

interface ActivitiesSectionProps {
  upcomingActivities: UCActivityItem[];
  pastActivities: UCActivityItem[];
  allActivities: UCActivityItem[];
  tipoColor: Record<EventTipo, string>;
  tipoLabel: Record<EventTipo, string>;
  ucId: number;
  semesterId: number;
  labels: {
    future: string;
    past: string;
    empty: string;
    graded: string;
    pending: string;
    future_status: string;
    done: string;
    planned: string;
    grade: (v: string) => string;
  };
}

export const ActivitiesSection = ({
  upcomingActivities,
  pastActivities,
  allActivities,
  tipoColor,
  tipoLabel,
  ucId,
  semesterId,
  labels,
}: ActivitiesSectionProps) => {
  const { colors } = useAthenaTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();

  const handlePress = (item: UCActivityItem) => {
    if (item.source === 'avaliacao') {
      navigation.navigate('EditAvaliacao', { ucId, semesterId, avaliacaoId: item.avaliacaoId });
      return;
    }
    navigation.navigate('MainTabs', {
      screen: 'Calendario',
      params: {
        date: toDateOnly(item.dateTime),
        editEventId: item.eventId,
        requestAt: Date.now(),
      },
    });
  };

  return (
    <>
      {upcomingActivities.length > 0 && (
        <>
          <Text style={styles.subSectionLabel}>{labels.future}</Text>
          {upcomingActivities.map((item) => {
            const color = tipoColor[item.tipo];
            return (
              <Pressable
                key={item.id}
                style={[styles.avaliacaoCard, item.source === 'event' && item.completed && styles.completedCard]}
                onPress={() => handlePress(item)}
              >
                <View style={styles.avaliacaoText}>
                  <Text style={styles.avaliacaoNome}>{item.title}</Text>
                  <Text style={styles.avaliacaoMeta}>
                    {formatDateTime(item.dateTime)}
                    {item.source === 'avaliacao' ? ` · ${item.peso}%` : ''}
                  </Text>
                </View>
                <View style={styles.avaliacaoScore}>
                  {item.source === 'avaliacao' ? (
                    <>
                      <Text style={styles.scoreText}>--</Text>
                      <Text style={styles.statusUpcoming}>{labels.future_status}</Text>
                    </>
                  ) : (
                    <>
                      <Text style={styles.scoreText}>{item.completed ? 'OK' : '--'}</Text>
                      <Text style={styles.statusUpcoming}>
                        {item.completed ? labels.done : labels.planned}
                      </Text>
                    </>
                  )}
                  <View style={[styles.activityTypePill, { backgroundColor: `${color}18` }]}>
                    <Text style={[styles.activityTypeText, { color }]}>{tipoLabel[item.tipo]}</Text>
                  </View>
                </View>
              </Pressable>
            );
          })}
        </>
      )}

      {pastActivities.length > 0 && (
        <>
          <Text style={styles.subSectionLabel}>{labels.past}</Text>
          {pastActivities.map((item) => {
            const color = tipoColor[item.tipo];
            const isPendingGrade = item.source === 'avaliacao' && item.notaObtida === null;
            return (
              <Pressable
                key={item.id}
                style={[
                  styles.avaliacaoCard,
                  isPendingGrade && styles.pendingCard,
                  item.source === 'event' && item.completed && styles.completedCard,
                ]}
                onPress={() => handlePress(item)}
              >
                <View style={styles.avaliacaoText}>
                  <Text style={styles.avaliacaoNome}>{item.title}</Text>
                  <Text style={styles.avaliacaoMeta}>
                    {formatDateTime(item.dateTime)}
                    {item.source === 'avaliacao' ? ` · ${item.peso}%` : ''}
                  </Text>
                </View>
                <View style={styles.avaliacaoScore}>
                  <Text style={styles.scoreText}>
                    {item.source === 'avaliacao'
                      ? item.notaObtida !== null ? item.notaObtida.toFixed(1) : '--'
                      : item.completed ? 'OK' : '--'}
                  </Text>
                  <Text style={item.source === 'avaliacao'
                    ? item.notaObtida !== null ? styles.statusGraded : styles.statusPending
                    : item.completed ? styles.statusGraded : styles.statusUpcoming}
                  >
                    {item.source === 'avaliacao'
                      ? item.notaObtida !== null ? labels.graded : labels.pending
                      : item.completed ? labels.done : labels.planned}
                  </Text>
                  <View style={[styles.activityTypePill, { backgroundColor: `${color}18` }]}>
                    <Text style={[styles.activityTypeText, { color }]}>{tipoLabel[item.tipo]}</Text>
                  </View>
                </View>
              </Pressable>
            );
          })}
        </>
      )}

      {allActivities.length === 0 && (
        <View style={styles.emptyCard}>
          <Text style={styles.emptyText}>{labels.empty}</Text>
        </View>
      )}
    </>
  );
};

const createStyles = (colors: AthenaColors) =>
  StyleSheet.create({
    subSectionLabel: { fontSize: 11, fontWeight: '700', color: colors.text.tertiary, textTransform: 'uppercase', letterSpacing: 1 },
    avaliacaoCard: {
      borderRadius: athenaRadius.md, borderWidth: 1, borderColor: colors.border.default,
      backgroundColor: colors.background.surface, padding: 12, flexDirection: 'row', alignItems: 'center', gap: 10,
    },
    pendingCard: { borderLeftWidth: 3, borderLeftColor: colors.warning.base },
    completedCard: { opacity: 0.7 },
    avaliacaoText: { flex: 1 },
    avaliacaoNome: { color: colors.text.primary, fontSize: 16, fontWeight: '700' },
    avaliacaoMeta: { color: colors.text.secondary, fontSize: 13, marginTop: 2 },
    avaliacaoScore: { alignItems: 'flex-end', gap: 4 },
    scoreText: { color: colors.text.primary, fontSize: 20, fontWeight: '800' },
    statusGraded: { fontSize: 10, fontWeight: '800', color: colors.success.base, marginTop: 2 },
    statusUpcoming: { fontSize: 10, fontWeight: '800', color: colors.text.tertiary, marginTop: 2 },
    statusPending: { fontSize: 10, fontWeight: '800', color: colors.warning.base, marginTop: 2 },
    activityTypePill: { borderRadius: 999, paddingHorizontal: 8, paddingVertical: 3, marginTop: 2 },
    activityTypeText: { fontSize: 10, fontWeight: '800' },
    emptyCard: {
      borderRadius: athenaRadius.md, borderWidth: 1, borderColor: colors.border.default,
      backgroundColor: colors.background.surface, padding: 14,
    },
    emptyText: { color: colors.text.secondary, fontSize: 15 },
  });
