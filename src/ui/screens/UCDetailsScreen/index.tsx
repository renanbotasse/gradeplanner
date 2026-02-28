import { useMemo, useState } from 'react';
import { Alert, Pressable, StyleSheet, Text, View } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { MaterialIcons } from '@expo/vector-icons';

import type { RootStackParamList } from '@/app/navigation/types';
import type { EventTipo, GradeScale } from '@/db/types';
import { useAvaliacoes, useUCEvents, useUCStatus, useUC, useUpdateUC } from '@/features/academics/hooks';
import { useActiveCurso } from '@/features/courses/hooks';
import { useAppPreferences } from '@/presentation/providers/AppPreferencesProvider';
import { AppHeader } from '@/presentation/widgets/app_header';
import { Screen } from '@/ui/components/Screen';
import { StatusPill } from '@/ui/components/StatusPill';
import { athenaRadius, useAthenaTheme, type AthenaColors } from '@/ui/theme/tokens';
import { formatDateTime, toDateOnly } from '@/utils/date';
import { parseNullableNumber } from '@/utils/formUtils';
import { buildTipoColors, toEventTipo } from '@/utils/tipoUtils';
import { scaleToLabel } from '@/constants/ucConstants';
import { ActivitiesSection } from './ActivitiesSection';
import { EditUCModal } from './EditUCModal';

type Props = NativeStackScreenProps<RootStackParamList, 'UCDetails'>;

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

const InfoRow = ({
  styles,
  label,
  value,
}: {
  styles: ReturnType<typeof createStyles>;
  label: string;
  value: string;
}) => (
  <View style={styles.infoRow}>
    <Text style={styles.infoRowLabel}>{label}</Text>
    <Text style={styles.infoRowValue}>{value}</Text>
  </View>
);

export const UCDetailsScreen = ({ route, navigation }: Props) => {
  const { colors } = useAthenaTheme();
  const { t } = useAppPreferences();
  const styles = useMemo(() => createStyles(colors), [colors]);
  const tipoColor = useMemo(() => buildTipoColors(colors), [colors]);
  const tipoLabel = useMemo<Record<EventTipo, string>>(
    () => ({
      avaliacao: t('eventType.assessment'),
      atividade: t('eventType.activity'),
      evento: t('eventType.event'),
    }),
    [t],
  );
  const { ucId, semesterId } = route.params;

  const ucQuery = useUC(ucId);
  const avaliacoesQuery = useAvaliacoes(ucId);
  const statusQuery = useUCStatus(ucId);
  const ucEventsQuery = useUCEvents(ucId);
  const activeCursoQuery = useActiveCurso();
  const updateUCMutation = useUpdateUC(semesterId);

  const [showEditModal, setShowEditModal] = useState(false);

  const uc = ucQuery.data;
  const overview = statusQuery.data?.overview;
  const status = statusQuery.data?.status;

  const allGraded = (overview?.pesoRestante ?? 0) <= 0;
  const mediaParcial = overview?.mediaParcial ?? null;
  const pesoRestante = overview?.pesoRestante ?? 0;
  const pesosAvaliados = overview?.pesosAvaliados ?? 0;
  const notaNecessaria = overview?.notaNecessaria ?? null;

  const projecaoText = useMemo(() => {
    if (!overview) return null;
    if (allGraded) {
      return mediaParcial !== null ? t('ucDetails.projection.final').replace('{value}', mediaParcial.toFixed(1)) : null;
    }
    if (notaNecessaria !== null && notaNecessaria <= 0) return t('ucDetails.projection.guaranteed');
    if (status === 'impossivel') return t('ucDetails.projection.impossible');
    if (status === 'precisa_exame') return t('ucDetails.projection.exam');
    if (notaNecessaria !== null) {
      return t('ucDetails.projection.needRemaining')
        .replace('{grade}', notaNecessaria.toFixed(1))
        .replace('{weight}', pesoRestante.toFixed(0));
    }
    return null;
  }, [overview, allGraded, mediaParcial, notaNecessaria, status, pesoRestante, t]);

  const avaliacoes = avaliacoesQuery.data ?? [];
  const ucEvents = ucEventsQuery.data ?? [];
  const nowTs = Date.now();

  const allActivities = useMemo<UCActivityItem[]>(() => {
    const avaliacaoItems: UCActivityItem[] = avaliacoes.map((a) => ({
      id: `avaliacao-${a.id}`,
      source: 'avaliacao',
      tipo: toEventTipo(a.tipo),
      title: a.nome,
      dateTime: a.dataHora,
      peso: a.peso,
      notaObtida: a.notaObtida,
      completed: a.notaObtida !== null,
      avaliacaoId: a.id,
    }));

    const eventItems: UCActivityItem[] = ucEvents.map((ev) => ({
      id: `event-${ev.id}`,
      source: 'event',
      tipo: ev.tipo,
      title: ev.title,
      dateTime: ev.dateTime,
      completed: ev.completed,
      eventId: ev.id,
    }));

    return [...avaliacaoItems, ...eventItems];
  }, [avaliacoes, ucEvents]);

  const upcomingActivities = useMemo(
    () => allActivities
      .filter((item) => new Date(item.dateTime).getTime() >= nowTs)
      .sort((a, b) => new Date(a.dateTime).getTime() - new Date(b.dateTime).getTime()),
    [allActivities, nowTs],
  );

  const pastActivities = useMemo(
    () => allActivities
      .filter((item) => new Date(item.dateTime).getTime() < nowTs)
      .sort((a, b) => new Date(b.dateTime).getTime() - new Date(a.dateTime).getTime()),
    [allActivities, nowTs],
  );

  const effectiveScale = uc?.escalaNatas ?? activeCursoQuery.data?.escalaNatas ?? null;
  const iconName = (uc?.icon ?? 'functions') as keyof typeof MaterialIcons.glyphMap;

  const saveUC = async (input: {
    icon: string; name: string; ects: number; professores: string[];
    notaMinimaAprovacao: number | null; escalaNatas: GradeScale | null; notes: string | null;
  }) => {
    try {
      await updateUCMutation.mutateAsync({ ucId, input });
      setShowEditModal(false);
    } catch (error) {
      console.error('saveUC error:', error);
      Alert.alert(t('common.error'), t('semesterDetails.error.saveUc'));
    }
  };

  return (
    <Screen>
      <AppHeader title={t('header.ucDetails')} leftActionIcon="arrow-back" onLeftActionPress={() => navigation.goBack()} />

      {/* Hero */}
      <View style={styles.hero}>
        <View style={styles.heroIcon}>
          <MaterialIcons name={iconName} size={40} color={colors.primary[600]} />
        </View>
        <Text style={styles.heroTitle}>{uc?.name ?? t('ucDetails.heroFallback')}</Text>
        <Text style={styles.heroSubtitle}>{uc?.ects ?? '--'} ECTS</Text>
        {status && <View style={styles.heroStatusWrap}><StatusPill status={status} /></View>}
      </View>

      {/* Stats row */}
      <View style={styles.statsGrid}>
        <View style={styles.statCard}>
          <Text style={styles.statLabel}>{allGraded ? t('ucDetails.label.finalAverage') : t('ucDetails.label.partialAverage')}</Text>
          <Text style={styles.statValue}>{mediaParcial !== null ? mediaParcial.toFixed(1) : '--'}</Text>
          <Text style={styles.statHint}>{pesosAvaliados.toFixed(0)}% {t('ucDetails.activity.graded').toLowerCase()}</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={styles.statLabel}>{t('ucDetails.label.remainingGrade')}</Text>
          <Text style={styles.statValue}>{pesoRestante.toFixed(0)}%</Text>
          <Text style={styles.statHint}>{t('ucDetails.remainingWeight')}</Text>
        </View>
      </View>

      {/* Projeção */}
      <View style={styles.projecaoCard}>
        <Text style={styles.projecaoTitle}>{t('ucDetails.section.projection')}</Text>
        {mediaParcial !== null && !allGraded && (
          <Text style={styles.projecaoSub}>
            {t('ucDetails.projection.partial')
              .replace('{value}', mediaParcial.toFixed(1))
              .replace('{weight}', pesosAvaliados.toFixed(0))}
          </Text>
        )}
        {projecaoText ? (
          <Text style={[
            styles.projecaoMain,
            (status === 'aprovado' || notaNecessaria !== null && notaNecessaria <= 0) && { color: colors.success.base },
            (status === 'impossivel' || status === 'reprovado') && { color: colors.danger.base },
          ]}>
            {projecaoText}
          </Text>
        ) : (
          <Text style={styles.projecaoSub}>{t('ucDetails.projection.addActivities')}</Text>
        )}
      </View>

      {/* Atividades */}
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>{t('ucDetails.section.activities')}</Text>
        <Pressable onPress={() => navigation.navigate('EditAvaliacao', { ucId, semesterId })}>
          <Text style={styles.sectionActionText}>{t('ucDetails.addActivity')}</Text>
        </Pressable>
      </View>

      <ActivitiesSection
        upcomingActivities={upcomingActivities}
        pastActivities={pastActivities}
        allActivities={allActivities}
        tipoColor={tipoColor}
        tipoLabel={tipoLabel}
        ucId={ucId}
        semesterId={semesterId}
        labels={{
          future: t('ucDetails.section.future'),
          past: t('ucDetails.section.past'),
          empty: t('ucDetails.emptyActivities'),
          graded: t('ucDetails.activity.graded'),
          pending: t('ucDetails.activity.pending'),
          future_status: t('ucDetails.activity.future'),
          done: t('ucDetails.activity.done'),
          planned: t('ucDetails.activity.planned'),
          grade: (v) => v,
        }}
      />

      {/* Informações Gerais */}
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>{t('ucDetails.section.generalInfo')}</Text>
        <Pressable onPress={() => setShowEditModal(true)}>
          <Text style={styles.sectionActionText}>{t('common.edit')}</Text>
        </Pressable>
      </View>

      <View style={styles.infoCard}>
        <InfoRow styles={styles} label={t('ucDetails.info.teacher')} value={uc?.professores?.join(', ') || '—'} />
        <InfoRow
          styles={styles}
          label={t('ucDetails.info.minGrade')}
          value={uc?.notaMinimaAprovacao !== null && uc?.notaMinimaAprovacao !== undefined
            ? String(uc.notaMinimaAprovacao) : t('ucDetails.info.inheritCourse')}
        />
        <InfoRow
          styles={styles}
          label={t('ucDetails.info.gradeSystem')}
          value={effectiveScale
            ? `${scaleToLabel(effectiveScale)}${uc?.escalaNatas ? '' : ` (${t('ucDetails.info.inheritCourse').toLowerCase()})`}`
            : '—'}
        />
        {uc?.linkUc ? <InfoRow styles={styles} label={t('ucDetails.info.link')} value={uc.linkUc} /> : null}
        {uc?.notes ? <InfoRow styles={styles} label={t('ucDetails.info.notes')} value={uc.notes} /> : null}
      </View>

      <EditUCModal
        visible={showEditModal}
        uc={uc ?? undefined}
        isSaving={updateUCMutation.isPending}
        onSave={saveUC}
        onClose={() => setShowEditModal(false)}
        parseNumber={parseNullableNumber}
        labels={{
          title: t('ucDetails.modal.editUc'),
          iconField: t('semesterDetails.field.icon'),
          nameField: t('semesterDetails.field.name'),
          ectsField: t('semesterDetails.field.ects'),
          professorField: t('semesterDetails.field.professor'),
          minGradeField: t('semesterDetails.field.minGrade'),
          minGradePlaceholder: t('semesterDetails.placeholder.inheritCourse'),
          gradeSystemField: t('semesterDetails.field.gradeSystem'),
          notesField: t('semesterDetails.field.notes'),
          fromCourse: t('semesterDetails.scale.fromCourse'),
          cancel: t('common.cancel'),
          save: t('common.save'),
          nameError: t('semesterDetails.error.nameRequired'),
          ectsError: t('semesterDetails.error.invalidEcts'),
          saveError: t('semesterDetails.error.saveUc'),
          commonError: t('common.error'),
        }}
      />
    </Screen>
  );
};

const createStyles = (colors: AthenaColors) =>
  StyleSheet.create({
    hero: { alignItems: 'center', gap: 4 },
    heroIcon: {
      width: 72, height: 72, borderRadius: 18,
      backgroundColor: colors.background.elevated, alignItems: 'center', justifyContent: 'center',
    },
    heroTitle: { marginTop: 6, fontSize: 28, fontWeight: '800', color: colors.text.primary, textAlign: 'center' },
    heroSubtitle: { color: colors.text.secondary, fontSize: 15, textAlign: 'center' },
    heroStatusWrap: { marginTop: 6 },
    statsGrid: { flexDirection: 'row', gap: 10 },
    statCard: {
      flex: 1, borderRadius: athenaRadius.md, borderWidth: 1,
      borderColor: colors.border.default, backgroundColor: colors.background.surface, padding: 12, gap: 4,
    },
    statLabel: { color: colors.text.tertiary, fontSize: 10, fontWeight: '800', letterSpacing: 0.5 },
    statValue: { color: colors.text.primary, fontSize: 30, fontWeight: '800' },
    statHint: { color: colors.text.secondary, fontSize: 12, fontWeight: '600' },
    projecaoCard: {
      borderRadius: athenaRadius.md, borderWidth: 1,
      borderColor: colors.border.default, backgroundColor: colors.background.surface, padding: 14, gap: 6,
    },
    projecaoTitle: { color: colors.text.primary, fontSize: 18, fontWeight: '800' },
    projecaoSub: { color: colors.text.secondary, fontSize: 13 },
    projecaoMain: { color: colors.primary[600], fontSize: 15, fontWeight: '700' },
    sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
    sectionTitle: { color: colors.text.primary, fontSize: 22, fontWeight: '800' },
    sectionActionText: { color: colors.primary[600], fontWeight: '700', fontSize: 14 },
    infoCard: {
      borderRadius: athenaRadius.md, borderWidth: 1, borderColor: colors.border.default,
      backgroundColor: colors.background.surface, padding: 14, gap: 2,
    },
    infoRow: { flexDirection: 'row', gap: 8, paddingVertical: 4 },
    infoRowLabel: { color: colors.text.tertiary, fontSize: 13, fontWeight: '700', width: 130 },
    infoRowValue: { color: colors.text.primary, fontSize: 13, flex: 1 },
  });
