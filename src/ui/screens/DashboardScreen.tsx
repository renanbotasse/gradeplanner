import { useMemo } from 'react';
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';

import type { RootStackParamList } from '@/app/navigation/types';
import type { DeadlineItem } from '@/db/types';
import { useUCsBySemester } from '@/features/academics/hooks';
import { useUpcomingDeadlines } from '@/features/activities/hooks';
import { useDashboardData } from '@/features/dashboard/hooks';
import { useUserProfile } from '@/features/settings/hooks';
import { useAppPreferences } from '@/presentation/providers/AppPreferencesProvider';
import { AppHeader } from '@/presentation/widgets/app_header';
import { Screen } from '@/ui/components/Screen';
import { athenaRadius, useAthenaTheme, type AthenaColors } from '@/ui/theme/tokens';
import { formatDate, formatDateTime, toDateOnly } from '@/utils/date';

const deadlineIcon = (
  item: DeadlineItem,
  colors: AthenaColors,
): { name: keyof typeof MaterialIcons.glyphMap; color: string } => {
  if (item.source === 'avaliacao') return { name: 'quiz', color: colors.info.base };
  if (item.eventTipo === 'atividade') return { name: 'assignment', color: colors.warning.base };
  return { name: 'event', color: colors.event.base };
};

const deadlineTitle = (item: DeadlineItem): string => {
  const ucName = item.ucName?.trim();
  return ucName ? `${item.title} (${ucName})` : item.title;
};


export const DashboardScreen = () => {
  const { colors } = useAthenaTheme();
  const { t } = useAppPreferences();
  const styles = useMemo(() => createStyles(colors), [colors]);
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();

  const profileQuery = useUserProfile();
  const dashboardQuery = useDashboardData();
  const upcomingDeadlinesQuery = useUpcomingDeadlines();

  const data = dashboardQuery.data;
  const curso = data?.curso;
  const semesterAtual = data?.semesterAtual;
  const mediaAtual = data?.mediaAtual;
  const mediaCurso = data?.mediaCurso;
  const name = profileQuery.data?.name ?? '';

  const ucsQuery = useUCsBySemester(semesterAtual?.id ?? 0);
  const ucsAtuais = ucsQuery.data ?? [];

  const semesterProgress = useMemo(() => {
    if (!semesterAtual) return 0;
    const start = new Date(semesterAtual.startDate).getTime();
    const end = new Date(semesterAtual.endDate).getTime();
    const now = Date.now();
    if (now <= start) return 0;
    if (now >= end) return 100;
    return Math.round(((now - start) / (end - start)) * 100);
  }, [semesterAtual]);

  const nextWeekDeadlines = useMemo(() => {
    const now = Date.now();
    const nextWeek = now + (7 * 86_400_000);
    return (upcomingDeadlinesQuery.data ?? [])
      .filter((item) => {
        const ts = new Date(item.dateTime).getTime();
        return ts >= now && ts <= nextWeek;
      })
      .sort((a, b) => new Date(a.dateTime).getTime() - new Date(b.dateTime).getTime());
  }, [upcomingDeadlinesQuery.data]);

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

  const deadlineTypeLabel = (item: DeadlineItem): string =>
    item.source === 'avaliacao' ? t('activities.card.assessment') : item.subtitle;

  const deadlineCountdown = (dateStr: string): string => {
    const diff = new Date(dateStr).getTime() - Date.now();
    if (diff <= 0) return t('activities.countdown.now');
    const days = Math.floor(diff / 86_400_000);
    const hours = Math.floor((diff % 86_400_000) / 3_600_000);
    if (days > 0) return `${days}d`;
    if (hours > 0) return `${hours}h`;
    return '<1h';
  };

  if (dashboardQuery.isLoading || upcomingDeadlinesQuery.isLoading) {
    return (
      <View style={styles.loader}>
        <ActivityIndicator size="large" color={colors.primary[500]} />
      </View>
    );
  }

  return (
      <Screen>
        <AppHeader title={t('header.home')} />
      <Text style={styles.greeting}>{t('dashboard.greeting')}{name ? `, ${name.split(' ')[0]}` : ''}!</Text>

      {/* Curso Card */}
      {curso ? (
        <View style={styles.cursoCard}>
          <View style={styles.cursoHeader}>
            <MaterialIcons name="school" size={18} color={colors.primary[600]} />
            <Text style={styles.cursoNome} numberOfLines={1}>{curso.nome}</Text>
          </View>
          {curso.instituicao ? (
            <Text style={styles.cursoInstituicao}>{curso.instituicao}</Text>
          ) : null}
          {semesterAtual ? (
            <>
              <Text style={styles.semesterLabel}>{semesterAtual.title}</Text>
              <Text style={styles.semesterDates}>
                {formatDate(semesterAtual.startDate)} — {formatDate(semesterAtual.endDate)}
              </Text>
              <View style={styles.progressTrack}>
                <View style={[styles.progressFill, { width: `${semesterProgress}%` }]} />
              </View>
              <Text style={styles.progressHint}>{semesterProgress}% {t('dashboard.progressLabel')}</Text>
            </>
          ) : (
            <Text style={styles.mutedText}>{t('dashboard.noActiveSemester')}</Text>
          )}
        </View>
      ) : (
        <View style={styles.cursoCard}>
          <Text style={styles.mutedText}>{t('dashboard.noCourse')}</Text>
          <Pressable onPress={() => navigation.navigate('CourseSettings')}>
            <Text style={styles.linkText}>{t('dashboard.createCourse')}</Text>
          </Pressable>
        </View>
      )}

      {/* Stats Row */}
      <View style={styles.statsRow}>
        <View style={styles.statCard}>
          <Text style={styles.statLabel}>{t('dashboard.stat.currentAverage')}</Text>
          <Text style={styles.statValue}>
            {mediaAtual !== null && mediaAtual !== undefined ? mediaAtual.toFixed(1) : '--'}
          </Text>
          <Text style={styles.statHint}>{semesterAtual?.title ?? t('dashboard.currentSemester')}</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={styles.statLabel}>{t('dashboard.stat.courseAverage')}</Text>
          <Text style={styles.statValue}>
            {mediaCurso !== null && mediaCurso !== undefined ? mediaCurso.toFixed(1) : '--'}
          </Text>
          <Text style={styles.statHint}>{curso?.nome ?? t('dashboard.course')}</Text>
        </View>
      </View>

      {/* Próximas Deadlines */}
      <Text style={styles.sectionTitle}>{t('dashboard.section.nextDeadlines')}</Text>
      <Text style={styles.sectionSubTitle}>{t('dashboard.section.next7Days')}</Text>

      {nextWeekDeadlines.length > 0 ? (
        nextWeekDeadlines.map((item) => {
          const { name: iconName, color: iconColor } = deadlineIcon(item, colors);
          return (
            <Pressable
              key={item.id}
              style={styles.avaliacaoCard}
              onPress={() => navigateToDeadline(item)}
            >
              <View style={[styles.avaliacaoIconWrap, { backgroundColor: `${iconColor}18` }]}>
                <MaterialIcons name={iconName} size={22} color={iconColor} />
              </View>
              <View style={styles.avaliacaoContent}>
                <Text style={styles.avaliacaoNome}>{deadlineTitle(item)}</Text>
                <Text style={styles.avaliacaoUC}>{deadlineTypeLabel(item)}</Text>
                <Text style={styles.avaliacaoData}>{formatDateTime(item.dateTime)}</Text>
              </View>
              <View style={styles.countdownBadge}>
                <Text style={styles.countdownText}>{deadlineCountdown(item.dateTime)}</Text>
              </View>
            </Pressable>
          );
        })
      ) : (
        <View style={styles.emptyCard}>
          <Text style={styles.emptyText}>{t('dashboard.emptyDeadlines')}</Text>
        </View>
      )}

      {/* Ações Rápidas */}
      <Text style={styles.sectionTitle}>{t('dashboard.section.quickActions')}</Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.actionsScroll}>
        <Pressable style={styles.actionBtn} onPress={() => navigation.navigate('CourseSettings')}>
          <MaterialIcons name="school" size={22} color={colors.primary[600]} />
          <Text style={styles.actionBtnText}>{t('settings.academic.coursesTitle')}</Text>
        </Pressable>

        {ucsAtuais.map((uc) => (
          <Pressable
            key={uc.id}
            style={styles.actionBtn}
            onPress={() => navigation.navigate('UCDetails', { ucId: uc.id, semesterId: semesterAtual?.id ?? 0 })}
          >
            <MaterialIcons name="menu-book" size={22} color={colors.primary[600]} />
            <Text style={styles.actionBtnText} numberOfLines={2}>{uc.name}</Text>
          </Pressable>
        ))}

        {ucsAtuais.length === 0 && semesterAtual ? (
          <Pressable
            style={styles.actionBtn}
            onPress={() => navigation.navigate('SemesterDetails', { semesterId: semesterAtual.id, semesterTitle: semesterAtual.title })}
          >
            <MaterialIcons name="menu-book" size={22} color={colors.text.tertiary} />
            <Text style={[styles.actionBtnText, { color: colors.text.tertiary }]}>{t('dashboard.quick.ucs')}</Text>
          </Pressable>
        ) : null}
      </ScrollView>
    </Screen>
  );
};

const createStyles = (colors: AthenaColors) =>
  StyleSheet.create({
    loader: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: colors.background.base },
    greeting: { color: colors.text.secondary, fontSize: 18, fontWeight: '600', marginTop: 2 },
    cursoCard: {
      borderRadius: athenaRadius.lg, borderWidth: 1, borderColor: colors.border.default,
      backgroundColor: colors.background.surface, padding: 14, gap: 4,
    },
    cursoHeader: { flexDirection: 'row', alignItems: 'center', gap: 8 },
    cursoNome: { color: colors.text.primary, fontSize: 18, fontWeight: '800', flex: 1 },
    cursoInstituicao: { color: colors.text.secondary, fontSize: 13, marginLeft: 26 },
    semesterLabel: { color: colors.primary[600], fontSize: 15, fontWeight: '700', marginTop: 8 },
    semesterDates: { color: colors.text.secondary, fontSize: 12 },
    progressTrack: {
      marginTop: 6, backgroundColor: colors.progress.track, borderRadius: 999, height: 8, overflow: 'hidden',
    },
    progressFill: { height: '100%', borderRadius: 999, backgroundColor: colors.progress.fill },
    progressHint: { color: colors.text.tertiary, fontSize: 11, marginTop: 3 },
    mutedText: { color: colors.text.secondary, fontSize: 14 },
    linkText: { color: colors.primary[600], fontWeight: '700', fontSize: 14, marginTop: 4 },
    statsRow: { flexDirection: 'row', gap: 10 },
    statCard: {
      flex: 1, borderRadius: athenaRadius.md, borderWidth: 1,
      borderColor: colors.border.default, backgroundColor: colors.background.surface, padding: 12, gap: 4,
    },
    statLabel: { color: colors.text.tertiary, fontSize: 9, fontWeight: '800', letterSpacing: 0.4 },
    statValue: { color: colors.text.primary, fontSize: 32, fontWeight: '800' },
    statHint: { color: colors.text.secondary, fontSize: 10, fontWeight: '600' },
    sectionTitle: { color: colors.text.primary, fontSize: 22, fontWeight: '800' },
    sectionSubTitle: { color: colors.text.secondary, fontSize: 13, marginTop: -6 },
    avaliacaoCard: {
      borderRadius: athenaRadius.md, borderWidth: 1, borderColor: colors.border.default,
      backgroundColor: colors.background.surface, padding: 12, flexDirection: 'row', alignItems: 'center', gap: 10,
    },
    avaliacaoIconWrap: {
      width: 42, height: 42, borderRadius: 12, backgroundColor: colors.background.elevated,
      alignItems: 'center', justifyContent: 'center',
    },
    avaliacaoNome: { color: colors.text.primary, fontSize: 16, fontWeight: '700' },
    avaliacaoUC: { color: colors.text.secondary, fontSize: 13 },
    avaliacaoData: { color: colors.text.tertiary, fontSize: 12 },
    avaliacaoContent: { flex: 1 },
    countdownBadge: {
      backgroundColor: colors.background.elevated, borderRadius: 8, paddingHorizontal: 10, paddingVertical: 6,
    },
    countdownText: { color: colors.primary[600], fontWeight: '800', fontSize: 15 },
    emptyCard: {
      borderRadius: athenaRadius.md, borderWidth: 1, borderColor: colors.border.default,
      backgroundColor: colors.background.surface, padding: 14,
    },
    emptyText: { color: colors.text.secondary },
    actionsScroll: { flexDirection: 'row', gap: 10, paddingBottom: 4 },
    actionBtn: {
      width: 90, borderRadius: athenaRadius.md, borderWidth: 1, borderColor: colors.border.default,
      backgroundColor: colors.background.surface, padding: 12, alignItems: 'center', gap: 6,
    },
    actionBtnText: { color: colors.primary[600], fontWeight: '700', fontSize: 11, textAlign: 'center' },
  });
