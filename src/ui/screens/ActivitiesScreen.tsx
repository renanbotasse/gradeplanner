import { useEffect, useMemo, useState } from 'react';
import { ActivityIndicator, Pressable, StyleSheet, Text, View } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';

import type { DeadlineItem } from '@/db/types';
import type { RootStackParamList } from '@/app/navigation/types';
import { usePendingAvaliacoes, useTodayDeadlines, useUpcomingDeadlines } from '@/features/activities/hooks';
import { useAppPreferences } from '@/presentation/providers/AppPreferencesProvider';
import { AppHeader } from '@/presentation/widgets/app_header';
import { Screen } from '@/ui/components/Screen';
import { athenaRadius, useAthenaTheme, type AthenaColors } from '@/ui/theme/tokens';
import { toDateOnly } from '@/utils/date';

// ─── Helpers ──────────────────────────────────────────────────────────────────

const formatCardTitle = (item: DeadlineItem): string => {
  const ucName = item.ucName?.trim();
  return ucName ? `${item.title} (${ucName})` : item.title;
};

const deadlineIcon = (
  item: DeadlineItem,
  colors: AthenaColors,
): { name: keyof typeof MaterialIcons.glyphMap; color: string } => {
  if (item.source === 'avaliacao') return { name: 'quiz', color: colors.info.base };
  if (item.eventTipo === 'avaliacao') return { name: 'quiz', color: colors.info.base };
  if (item.eventTipo === 'atividade') return { name: 'assignment', color: colors.warning.base };
  return { name: 'event', color: colors.event.base };
};

// ─── Main screen ──────────────────────────────────────────────────────────────

export const ActivitiesScreen = () => {
  const { colors } = useAthenaTheme();
  const { t, language } = useAppPreferences();
  const styles = useMemo(() => createStyles(colors), [colors]);
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();

  const formatCardSubtitle = (item: DeadlineItem): string => {
    if (item.source === 'event') return item.subtitle;
    return t('activities.card.assessment');
  };

  const formatDaysAgo = (dateStr: string): string => {
    const days = Math.floor((Date.now() - new Date(dateStr).getTime()) / 86_400_000);
    if (days === 0) return t('activities.day.today');
    if (days === 1) return t('activities.day.yesterday');
    return t('activities.day.ago').replace('{days}', String(days));
  };

  const formatCountdown = (dateStr: string): string => {
    const diff = new Date(dateStr).getTime() - Date.now();
    if (diff <= 0) return t('activities.countdown.now');
    if (diff > 86_400_000) {
      const days = Math.floor(diff / 86_400_000);
      const dateLabel = new Date(dateStr).toLocaleDateString(language, {
        day: '2-digit',
        month: '2-digit',
      });
      const dayLabel = days === 1 ? t('activities.countdown.day') : t('activities.countdown.days');
      return `${t('activities.countdown.remaining')} ${days} ${dayLabel} (${dateLabel})`;
    }
    const days = Math.floor(diff / 86_400_000);
    const hours = Math.floor((diff % 86_400_000) / 3_600_000);
    const mins = Math.floor((diff % 3_600_000) / 60_000);
    if (days > 0) return `${days}d ${hours}h ${mins}m`;
    if (hours > 0) return `${hours}h ${mins}m`;
    return `${mins}m`;
  };

  // live countdown ticker
  const [, setTick] = useState(0);
  useEffect(() => {
    const interval = setInterval(() => setTick((t) => t + 1), 30_000);
    return () => clearInterval(interval);
  }, []);

  const todayQuery = useTodayDeadlines();
  const upcomingQuery = useUpcomingDeadlines();
  const pendingQuery = usePendingAvaliacoes();

  const isLoading = todayQuery.isLoading || upcomingQuery.isLoading || pendingQuery.isLoading;

  if (isLoading) {
    return (
      <View style={styles.loader}>
        <ActivityIndicator size="large" color={colors.primary[500]} />
      </View>
    );
  }

  const todayItems = todayQuery.data ?? [];
  const todayIds = new Set(todayItems.map((i) => i.id));

  // Upcoming = future items not already in "today"
  const upcomingItems = (upcomingQuery.data ?? []).filter((i) => !todayIds.has(i.id));
  const pendingItems = pendingQuery.data ?? [];

  const navigateToDeadline = (item: DeadlineItem) => {
    if (item.source === 'avaliacao' && item.avaliacaoId && item.ucId && item.semesterId !== null) {
      navigation.navigate('EditAvaliacao', {
        ucId: item.ucId,
        semesterId: item.semesterId,
        avaliacaoId: item.avaliacaoId,
      });
      return;
    }

    if (item.source === 'event' && item.eventId) {
      navigation.navigate('MainTabs', {
        screen: 'Calendario',
        params: {
          date: toDateOnly(item.dateTime),
          editEventId: item.eventId,
          requestAt: Date.now(),
        },
      });
    }
  };

  const hasContent = todayItems.length > 0 || upcomingItems.length > 0 || pendingItems.length > 0;

  return (
    <Screen>
      <AppHeader title={t('header.deadlines')} />

      {/* ─── Hoje ──────────────────────────────────────────────────────────── */}
      {todayItems.length > 0 && (
        <>
          <SectionHeader icon="today" label={t('activities.section.today')} color={colors.warning.base} styles={styles} />
          {todayItems.map((item) => {
            const { name: iconName, color: iconColor } = deadlineIcon(item, colors);
            return (
              <Pressable
                key={item.id}
                style={styles.card}
                onPress={() => navigateToDeadline(item)}
              >
                <View style={[styles.iconWrap, { backgroundColor: `${iconColor}18` }]}>
                  <MaterialIcons name={iconName} size={20} color={iconColor} />
                </View>
                <View style={styles.cardLeft}>
                  <Text style={styles.cardTitle}>{formatCardTitle(item)}</Text>
                  <Text style={styles.cardSub}>{formatCardSubtitle(item)}</Text>
                </View>
                <Text style={[styles.countdown, { color: colors.warning.base }]}>
                  {formatCountdown(item.dateTime)}
                </Text>
              </Pressable>
            );
          })}
        </>
      )}

      {/* ─── Próximas ──────────────────────────────────────────────────────── */}
      <SectionHeader icon="alarm" label={t('activities.section.upcoming')} color={colors.primary[500]} styles={styles} />
      {upcomingItems.length > 0 ? (
        upcomingItems.map((item) => {
          const { name: iconName, color: iconColor } = deadlineIcon(item, colors);
          return (
            <Pressable
              key={item.id}
              style={styles.card}
              onPress={() => navigateToDeadline(item)}
            >
              <View style={[styles.iconWrap, { backgroundColor: `${iconColor}18` }]}>
                <MaterialIcons name={iconName} size={20} color={iconColor} />
              </View>
              <View style={styles.cardLeft}>
                <Text style={styles.cardTitle}>{formatCardTitle(item)}</Text>
                <Text style={styles.cardSub}>{formatCardSubtitle(item)}</Text>
              </View>
              <Text style={styles.countdown}>
                {formatCountdown(item.dateTime)}
              </Text>
            </Pressable>
          );
        })
      ) : (
        <View style={styles.emptyCard}>
          <Text style={styles.emptyText}>{t('dashboard.emptyDeadlines')}</Text>
        </View>
      )}

      {/* ─── Pendentes sem nota ────────────────────────────────────────────── */}
      {pendingItems.length > 0 && (
        <>
          <SectionHeader icon="pending-actions" label={t('activities.section.pending')} color={colors.danger.base} styles={styles} />
          {pendingItems.map((a) => (
            <Pressable
              key={a.id}
              style={[styles.card, styles.pendingCard]}
              onPress={() =>
                navigation.navigate('EditAvaliacao', {
                  ucId: a.ucId,
                  semesterId: a.semesterId,
                  avaliacaoId: a.id,
                })
              }
            >
              <View style={[styles.iconWrap, { backgroundColor: `${colors.danger.base}18` }]}>
                <MaterialIcons name="quiz" size={20} color={colors.danger.base} />
              </View>
              <View style={styles.cardLeft}>
                <Text style={styles.cardTitle}>{`${a.nome} (${a.ucNome})`}</Text>
                <Text style={styles.daysAgo}>{formatDaysAgo(a.dataHora)}</Text>
              </View>
              <Pressable
                style={styles.lancarBtn}
                onPress={(event) => {
                  event.stopPropagation();
                  navigation.navigate('EditAvaliacao', {
                    ucId: a.ucId,
                    semesterId: a.semesterId,
                    avaliacaoId: a.id,
                  });
                }}
              >
                <Text style={styles.lancarBtnText}>{t('activities.launchGrade')}</Text>
              </Pressable>
            </Pressable>
          ))}
        </>
      )}

      {!hasContent && (
        <View style={styles.emptyCard}>
          <MaterialIcons name="check-circle" size={40} color={colors.success.base} style={styles.emptyIcon} />
          <Text style={styles.emptyText}>{t('activities.empty')}</Text>
        </View>
      )}
    </Screen>
  );
};

// ─── Section header ───────────────────────────────────────────────────────────

const SectionHeader = ({
  icon, label, color, styles,
}: {
  icon: keyof typeof MaterialIcons.glyphMap;
  label: string;
  color: string;
  styles: ReturnType<typeof createStyles>;
}) => (
  <View style={styles.sectionHeader}>
    <MaterialIcons name={icon} size={16} color={color} />
    <Text style={[styles.sectionTitle, { color }]}>{label}</Text>
  </View>
);

// ─── Styles ───────────────────────────────────────────────────────────────────

const createStyles = (colors: AthenaColors) =>
  StyleSheet.create({
    loader: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: colors.background.base },
    sectionHeader: { flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 16, marginBottom: 6 },
    sectionTitle: { fontSize: 13, fontWeight: '800', textTransform: 'uppercase', letterSpacing: 1 },
    card: {
      backgroundColor: colors.background.surface,
      borderWidth: 1,
      borderColor: colors.border.default,
      borderRadius: athenaRadius.md,
      padding: 12,
      flexDirection: 'row',
      alignItems: 'center',
      gap: 10,
      marginBottom: 6,
    },
    pendingCard: { borderLeftWidth: 3, borderLeftColor: colors.danger.base },
    iconWrap: { width: 40, height: 40, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
    cardLeft: { flex: 1 },
    cardTitle: { fontSize: 15, fontWeight: '700', color: colors.text.primary },
    cardSub: { fontSize: 12, color: colors.text.secondary, marginTop: 2 },
    daysAgo: { fontSize: 12, color: colors.danger.base, marginTop: 2, fontWeight: '600' },
    countdown: { fontSize: 14, fontWeight: '800', color: colors.primary[500], textAlign: 'right' },
    lancarBtn: {
      backgroundColor: colors.primary[500],
      borderRadius: athenaRadius.sm,
      paddingHorizontal: 10,
      paddingVertical: 6,
    },
    lancarBtnText: { color: colors.text.onPrimary, fontWeight: '700', fontSize: 12 },
    emptyCard: {
      backgroundColor: colors.background.surface,
      borderRadius: athenaRadius.md,
      borderWidth: 1,
      borderColor: colors.border.default,
      padding: 16,
      marginBottom: 6,
    },
    emptyIcon: { alignSelf: 'center', marginBottom: 8 },
    emptyText: { color: colors.text.secondary, fontSize: 15, textAlign: 'center' },
  });
