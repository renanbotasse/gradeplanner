import { useMemo, useState } from 'react';
import { Alert, Modal, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Calendar, type DateData } from 'react-native-calendars';
import { useQueries } from '@tanstack/react-query';

import type { RootStackParamList } from '@/app/navigation/types';
import { athenaRepository } from '@/db/repositories/athenaRepository';
import type { SemesterRecord, SemesterStatus } from '@/db/types';
import { useCreateSemester, useDeleteSemester, useSemesters, useUpdateSemester } from '@/features/academics/hooks';
import { useActiveCurso } from '@/features/courses/hooks';
import { queryKeys } from '@/features/queryKeys';
import { useAppPreferences } from '@/presentation/providers/AppPreferencesProvider';
import { AppHeader } from '@/presentation/widgets/app_header';
import { AppButton } from '@/ui/components/primitives';
import { Screen } from '@/ui/components/Screen';
import { athenaRadius, useAthenaTheme, type AthenaColors } from '@/ui/theme/tokens';
import { formatDate } from '@/utils/date';

interface SemesterFormState {
  year: number;       // 1–5
  semesterNum: 1 | 2;
  startDate: string;  // YYYY-MM-DD
  endDate: string;    // YYYY-MM-DD
}

const ORDINALS = ['', '1.º', '2.º', '3.º', '4.º', '5.º'];

const generateTitle = (year: number, sem: 1 | 2): string =>
  `${ORDINALS[sem]} Semestre - ${ORDINALS[year]} Ano`;

const defaultDatesForSem = (sem: 1 | 2): { start: string; end: string } => {
  const y = new Date().getFullYear();
  return sem === 1
    ? { start: `${y}-09-15`, end: `${y + 1}-01-20` }
    : { start: `${y}-02-15`, end: `${y}-07-10` };
};

const getInitialForm = (): SemesterFormState => {
  const d = defaultDatesForSem(1);
  return { year: 1, semesterNum: 1, startDate: d.start, endDate: d.end };
};

const parseTitleToYearSem = (title: string): { year: number; semesterNum: 1 | 2 } | null => {
  const m = title.match(/(\d+)\.\º Semestre - (\d+)\.\º Ano/);
  if (!m) return null;
  const sem = Number(m[1]);
  const yr = Number(m[2]);
  if (sem < 1 || sem > 2 || yr < 1 || yr > 5) return null;
  return { year: yr, semesterNum: sem as 1 | 2 };
};

const getSemesterStatus = (s: SemesterRecord): SemesterStatus => {
  const now = new Date();
  const start = new Date(s.startDate);
  const end = new Date(s.endDate);
  if (now < start) return 'futuro';
  if (now > end) return 'passado';
  return 'atual';
};

const toISO = (value: string): string => {
  if (!value.trim()) return new Date().toISOString();
  if (value.includes('T')) return value;
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return new Date().toISOString();
  return parsed.toISOString();
};

type TabKey = SemesterStatus;

export const SemestersScreen = () => {
  const { colors, mode } = useAthenaTheme();
  const { t, language, weekStartDay } = useAppPreferences();
  const styles = useMemo(() => createStyles(colors), [colors]);
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();

  const semestersQuery = useSemesters();
  const activeCursoQuery = useActiveCurso();
  const createMutation = useCreateSemester();
  const updateMutation = useUpdateSemester();
  const deleteMutation = useDeleteSemester();

  const [activeTab, setActiveTab] = useState<TabKey>('atual');
  const [showModal, setShowModal] = useState(false);
  const [editingSemesterId, setEditingSemesterId] = useState<number | null>(null);
  const [form, setForm] = useState<SemesterFormState>(getInitialForm());
  const [datePickerTarget, setDatePickerTarget] = useState<'start' | 'end' | null>(null);

  const semesterList = semestersQuery.data ?? [];

  const insights = useQueries({
    queries: semesterList.map((semester) => ({
      queryKey: queryKeys.semesterInsights(semester.id),
      queryFn: () => athenaRepository.getSemesterInsights(semester.id),
    })),
  });

  const insightById = useMemo(() => {
    const map = new Map<number, { semesterAverage: number | null; totalEcts: number; approvedEcts: number }>();
    semesterList.forEach((semester, index) => {
      const data = insights[index]?.data;
      if (data) map.set(semester.id, data);
    });
    return map;
  }, [insights, semesterList]);

  const filteredSemesters = useMemo(
    () => semesterList.filter((s) => getSemesterStatus(s) === activeTab),
    [semesterList, activeTab],
  );

  const tabCounts = useMemo(() => ({
    atual: semesterList.filter((s) => getSemesterStatus(s) === 'atual').length,
    passado: semesterList.filter((s) => getSemesterStatus(s) === 'passado').length,
    futuro: semesterList.filter((s) => getSemesterStatus(s) === 'futuro').length,
  }), [semesterList]);

  const openCreate = () => {
    setEditingSemesterId(null);
    setForm(getInitialForm());
    setDatePickerTarget(null);
    setShowModal(true);
  };

  const openEdit = (semester: SemesterRecord) => {
    const parsed = parseTitleToYearSem(semester.title);
    setEditingSemesterId(semester.id);
    setForm({
      year: parsed?.year ?? 1,
      semesterNum: parsed?.semesterNum ?? 1,
      startDate: semester.startDate.slice(0, 10),
      endDate: semester.endDate.slice(0, 10),
    });
    setDatePickerTarget(null);
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setDatePickerTarget(null);
    setEditingSemesterId(null);
    setForm(getInitialForm());
  };

  const saveSemester = async () => {
    const title = generateTitle(form.year, form.semesterNum);
    const cursoId = activeCursoQuery.data?.id ?? null;
    try {
      if (editingSemesterId) {
        await updateMutation.mutateAsync({
          semesterId: editingSemesterId,
          input: { title, startDate: toISO(form.startDate), endDate: toISO(form.endDate) },
        });
      } else {
        await createMutation.mutateAsync({
          cursoId,
          title,
          startDate: toISO(form.startDate),
          endDate: toISO(form.endDate),
        });
      }
      closeModal();
    } catch (error) {
      console.error('saveSemester error:', error);
      Alert.alert(t('common.error'), t('semesters.error.save'));
    }
  };

  const removeSemester = (semesterId: number) => {
    Alert.alert(t('semesters.delete.title'), t('semesters.delete.message'), [
      { text: t('common.cancel'), style: 'cancel' },
      {
        text: t('common.delete'),
        style: 'destructive',
        onPress: async () => {
          try {
            await deleteMutation.mutateAsync(semesterId);
          } catch (error) {
            console.error('deleteSemester error:', error);
            Alert.alert(t('common.error'), t('semesters.error.delete'));
          }
        },
      },
    ]);
  };

  const selectedDateStr = datePickerTarget === 'start' ? form.startDate : form.endDate;

  return (
    <Screen>
      <AppHeader title={t('header.semesters')} />

      {/* Tabs */}
      <View style={styles.topTabs}>
        {(['atual', 'passado', 'futuro'] as TabKey[]).map((tab) => (
          <Pressable key={tab} onPress={() => setActiveTab(tab)}>
            <Text style={[styles.tabLabel, activeTab === tab && styles.tabLabelActive]}>
              {tab === 'atual' ? t('semesters.tab.current') : tab === 'passado' ? t('semesters.tab.past') : t('semesters.tab.future')}
              {tabCounts[tab] > 0 ? ` (${tabCounts[tab]})` : ''}
            </Text>
          </Pressable>
        ))}
      </View>

      <Pressable style={styles.createSemesterButton} onPress={openCreate}>
        <MaterialIcons name="add-circle-outline" size={18} color={colors.primary[600]} />
        <Text style={styles.createSemesterButtonText}>{t('semesters.button.create')}</Text>
      </Pressable>

      {/* Semester cards */}
      {filteredSemesters.length ? (
        filteredSemesters.map((semester) => {
          const insight = insightById.get(semester.id);
          const status = getSemesterStatus(semester);
          const statusLabel = status === 'atual' ? t('semesters.status.current') : status === 'passado' ? t('semesters.status.past') : t('semesters.status.future');

          return (
            <Pressable
              key={semester.id}
              style={styles.semesterCard}
              onPress={() => navigation.navigate('SemesterDetails', { semesterId: semester.id, semesterTitle: semester.title })}
            >
              <View style={styles.semesterBody}>
                <View style={styles.semesterHeadRow}>
                  <View style={styles.semesterInfo}>
                    <Text style={styles.semesterTitle}>{semester.title}</Text>
                    <Text style={styles.semesterTerm}>
                      {formatDate(semester.startDate)} — {formatDate(semester.endDate)}
                    </Text>
                  </View>
                  <View style={styles.gpaBlock}>
                    <Text style={styles.gpaValue}>
                      {insight?.semesterAverage !== null && insight?.semesterAverage !== undefined
                        ? insight.semesterAverage.toFixed(1) : '--'}
                    </Text>
                    <Text style={styles.gpaLabel}>{t('semesters.stat.average')}</Text>
                    <View style={[styles.semesterBadge, status === 'atual' ? styles.activeBadge : styles.mutedBadge]}>
                      <Text style={[styles.semesterBadgeText, status === 'atual' ? styles.activeBadgeText : styles.mutedBadgeText]}>
                        {statusLabel}
                      </Text>
                    </View>
                  </View>
                </View>

                <View style={styles.semesterStats}>
                  <View>
                    <Text style={styles.statLabel}>{t('semesters.stat.ects')}</Text>
                    <Text style={styles.statValue}>{insight ? `${insight.totalEcts}` : '--'}</Text>
                  </View>
                  <View>
                    <Text style={styles.statLabel}>{t('semesters.stat.approved')}</Text>
                    <Text style={styles.statValue}>{insight ? `${insight.approvedEcts}` : '--'}</Text>
                  </View>
                </View>

                <View style={styles.rowActions}>
                  <Pressable
                    style={styles.rowActionButton}
                    onPress={(event) => {
                      event.stopPropagation();
                      openEdit(semester);
                    }}
                  >
                    <MaterialIcons name="edit" size={20} color={colors.text.secondary} />
                    <Text style={styles.rowActionText}>{t('common.edit')}</Text>
                  </Pressable>
                  <Pressable
                    style={[styles.rowActionButton, styles.rowActionDelete]}
                    onPress={(event) => {
                      event.stopPropagation();
                      removeSemester(semester.id);
                    }}
                  >
                    <MaterialIcons name="delete-outline" size={21} color={colors.danger.base} />
                    <Text style={[styles.rowActionText, { color: colors.danger.base }]}>{t('common.delete')}</Text>
                  </Pressable>
                </View>
              </View>
            </Pressable>
          );
        })
      ) : (
        <View style={styles.emptyState}>
          <MaterialIcons name="calendar-month" size={32} color={colors.text.tertiary} />
          <Text style={styles.emptyStateText}>
            {activeTab === 'atual'
              ? t('semesters.empty.current')
              : activeTab === 'passado'
              ? t('semesters.empty.past')
              : t('semesters.empty.future')}
          </Text>
          <Pressable style={styles.emptyAction} onPress={openCreate}>
            <Text style={styles.emptyActionText}>{t('semesters.empty.create')}</Text>
          </Pressable>
        </View>
      )}

      {/* Create / Edit modal */}
      <Modal transparent visible={showModal} animationType="slide" onRequestClose={closeModal}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalSheet}>
            <ScrollView showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
              {datePickerTarget !== null ? (
                /* Calendar picker view */
                <>
                  <View style={styles.modalHeader}>
                    <Text style={styles.formTitle}>
                      {datePickerTarget === 'start' ? t('semesters.field.startDate') : t('semesters.field.endDate')}
                    </Text>
                    <AppButton
                      label={t('common.back')}
                      variant="secondary"
                      size="md"
                      fullWidth={false}
                      onPress={() => setDatePickerTarget(null)}
                    />
                  </View>
                  <Calendar
                    key={`semester-picker-${mode}-${language}-${weekStartDay}`}
                    showSixWeeks
                    hideExtraDays={false}
                    firstDay={weekStartDay}
                    current={selectedDateStr || undefined}
                    markedDates={
                      selectedDateStr
                        ? { [selectedDateStr]: { selected: true, selectedColor: colors.primary[500] } }
                        : {}
                    }
                    onDayPress={(day: DateData) => {
                      if (datePickerTarget === 'start') {
                        setForm((prev) => ({ ...prev, startDate: day.dateString }));
                      } else {
                        setForm((prev) => ({ ...prev, endDate: day.dateString }));
                      }
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
                      monthTextColor: colors.text.primary,
                      textMonthFontWeight: '800',
                      arrowColor: colors.primary[500],
                    }}
                  />
                </>
              ) : (
                /* Form fields */
                <>
                  <View style={styles.modalHeader}>
                    <Text style={styles.formTitle}>
                      {editingSemesterId ? t('semesters.modal.editTitle') : t('semesters.modal.newTitle')}
                    </Text>
                    <Pressable onPress={closeModal}>
                      <MaterialIcons name="close" size={22} color={colors.text.secondary} />
                    </Pressable>
                  </View>

                  {/* Year picker */}
                  <View style={styles.pickerSection}>
                    <Text style={styles.pickerLabel}>{t('semesters.field.year')}</Text>
                    <View style={styles.pickerRow}>
                      {[1, 2, 3, 4, 5].map((y) => (
                        <Pressable
                          key={y}
                          style={[styles.pickerChip, form.year === y && styles.pickerChipActive]}
                          onPress={() => setForm((prev) => ({ ...prev, year: y }))}
                        >
                          <Text style={[styles.pickerChipText, form.year === y && styles.pickerChipTextActive]}>
                            {y}º
                          </Text>
                        </Pressable>
                      ))}
                    </View>
                  </View>

                  {/* Semester picker */}
                  <View style={styles.pickerSection}>
                    <Text style={styles.pickerLabel}>{t('semesters.field.semester')}</Text>
                    <View style={styles.pickerRow}>
                      {([1, 2] as const).map((s) => (
                        <Pressable
                          key={s}
                          style={[styles.pickerChipWide, form.semesterNum === s && styles.pickerChipActive]}
                          onPress={() => setForm((prev) => ({ ...prev, semesterNum: s }))}
                        >
                          <Text style={[styles.pickerChipText, form.semesterNum === s && styles.pickerChipTextActive]}>
                            {s === 1 ? t('semesters.semester.first') : t('semesters.semester.second')}
                          </Text>
                        </Pressable>
                      ))}
                    </View>
                  </View>

                  {/* Title preview */}
                  <View style={styles.titlePreviewWrap}>
                    <Text style={styles.pickerLabel}>{t('semesters.field.generatedTitle')}</Text>
                    <Text style={styles.titlePreviewValue}>{generateTitle(form.year, form.semesterNum)}</Text>
                  </View>

                  {/* Date fields */}
                  <View style={styles.datesRow}>
                    <Pressable style={styles.dateField} onPress={() => setDatePickerTarget('start')}>
                      <MaterialIcons name="event" size={16} color={colors.primary[600]} />
                      <View>
                        <Text style={styles.dateFieldLabel}>{t('semesters.field.startDate')}</Text>
                        <Text style={styles.dateFieldValue}>{form.startDate || '—'}</Text>
                      </View>
                    </Pressable>
                    <Pressable style={styles.dateField} onPress={() => setDatePickerTarget('end')}>
                      <MaterialIcons name="event" size={16} color={colors.primary[600]} />
                      <View>
                        <Text style={styles.dateFieldLabel}>{t('semesters.field.endDate')}</Text>
                        <Text style={styles.dateFieldValue}>{form.endDate || '—'}</Text>
                      </View>
                    </Pressable>
                  </View>

                  <View style={styles.formActions}>
                    <Pressable style={styles.cancelButton} onPress={closeModal}>
                      <Text style={styles.cancelButtonText}>{t('common.cancel')}</Text>
                    </Pressable>
                    <Pressable
                      style={[
                        styles.saveButton,
                        (createMutation.isPending || updateMutation.isPending) && styles.disabledButton,
                      ]}
                      onPress={saveSemester}
                      disabled={createMutation.isPending || updateMutation.isPending}
                    >
                      <Text style={styles.saveButtonText}>
                        {editingSemesterId ? t('common.update') : t('common.create')}
                      </Text>
                    </Pressable>
                  </View>
                </>
              )}
            </ScrollView>
          </View>
        </View>
      </Modal>
    </Screen>
  );
};

const createStyles = (colors: AthenaColors) =>
  StyleSheet.create({
    topTabs: { flexDirection: 'row', gap: 20, alignItems: 'center', paddingHorizontal: 4 },
    tabLabel: { color: colors.text.tertiary, fontWeight: '700', fontSize: 17 },
    tabLabelActive: { color: colors.primary[600] },
    createSemesterButton: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      gap: 8,
      minHeight: 42,
      borderRadius: 10,
      borderWidth: 1,
      borderColor: colors.primary[500],
      backgroundColor: colors.background.elevated,
    },
    createSemesterButtonText: { color: colors.primary[500], fontSize: 14, fontWeight: '800' },
    semesterCard: {
      borderRadius: athenaRadius.md,
      borderWidth: 1, borderColor: colors.border.default, backgroundColor: colors.background.surface,
    },
    semesterBadge: {
      borderRadius: 999, paddingHorizontal: 10, paddingVertical: 4,
      marginTop: 6,
    },
    activeBadge: { backgroundColor: colors.success.soft },
    mutedBadge: { backgroundColor: colors.background.elevated },
    semesterBadgeText: { fontSize: 10, fontWeight: '800', letterSpacing: 0.4 },
    activeBadgeText: { color: colors.success.base },
    mutedBadgeText: { color: colors.text.tertiary },
    semesterBody: { padding: 12, gap: 10 },
    semesterHeadRow: { flexDirection: 'row', gap: 10 },
    semesterInfo: { flex: 1 },
    semesterTitle: { color: colors.text.primary, fontSize: 22, fontWeight: '800' },
    semesterTerm: { color: colors.text.secondary, fontSize: 13, marginTop: 2 },
    gpaBlock: { alignItems: 'flex-end' },
    gpaValue: { color: colors.primary[600], fontSize: 30, fontWeight: '800' },
    gpaLabel: { color: colors.text.tertiary, fontSize: 10, fontWeight: '800' },
    semesterStats: {
      flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-end',
      borderTopWidth: 1, borderTopColor: colors.border.default, paddingTop: 10,
    },
    statLabel: { color: colors.text.tertiary, fontSize: 11, fontWeight: '800' },
    statValue: { color: colors.text.secondary, fontSize: 14, fontWeight: '700', marginTop: 2 },
    rowActions: {
      borderTopWidth: 1, borderTopColor: colors.border.default,
      paddingTop: 12, flexDirection: 'row', justifyContent: 'flex-end', gap: 12,
    },
    rowActionButton: {
      minHeight: 40,
      borderRadius: 10,
      borderWidth: 1,
      borderColor: colors.border.default,
      backgroundColor: colors.background.elevated,
      paddingHorizontal: 12,
      flexDirection: 'row',
      alignItems: 'center',
      gap: 6,
    },
    rowActionDelete: { borderColor: `${colors.danger.base}40`, backgroundColor: `${colors.danger.base}12` },
    rowActionText: { color: colors.text.secondary, fontSize: 13, fontWeight: '700' },
    emptyState: {
      borderRadius: athenaRadius.md, borderWidth: 1, borderColor: colors.border.default,
      backgroundColor: colors.background.surface, padding: 18, alignItems: 'center', gap: 10,
    },
    emptyStateText: { color: colors.text.secondary, fontSize: 15 },
    emptyAction: { paddingHorizontal: 12, paddingVertical: 8, borderRadius: 8, backgroundColor: colors.background.elevated },
    emptyActionText: { color: colors.primary[500], fontWeight: '700' },
    // Modal
    modalOverlay: { flex: 1, backgroundColor: colors.overlay.scrim, justifyContent: 'flex-end' },
    modalSheet: {
      backgroundColor: colors.background.surface, borderTopLeftRadius: 20, borderTopRightRadius: 20,
      padding: 20, maxHeight: '85%', gap: 16,
    },
    modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
    formTitle: { color: colors.text.primary, fontSize: 20, fontWeight: '800' },
    // Pickers
    pickerSection: { gap: 8 },
    pickerLabel: { color: colors.text.secondary, fontSize: 13, fontWeight: '700' },
    pickerRow: { flexDirection: 'row', gap: 8, flexWrap: 'wrap' },
    pickerChip: {
      borderRadius: 999, paddingHorizontal: 16, paddingVertical: 8,
      borderWidth: 1, borderColor: colors.border.default, backgroundColor: colors.background.base,
    },
    pickerChipWide: {
      flex: 1, borderRadius: 10, paddingHorizontal: 12, paddingVertical: 10,
      borderWidth: 1, borderColor: colors.border.default, backgroundColor: colors.background.base,
      alignItems: 'center',
    },
    pickerChipActive: { backgroundColor: colors.primary[500], borderColor: colors.primary[500] },
    pickerChipText: { color: colors.text.secondary, fontWeight: '700', fontSize: 14 },
    pickerChipTextActive: { color: colors.text.onPrimary },
    titlePreviewWrap: { gap: 4 },
    titlePreviewValue: { color: colors.text.primary, fontWeight: '800', fontSize: 16 },
    // Date fields
    datesRow: { flexDirection: 'row', gap: 12 },
    dateField: {
      flex: 1, borderRadius: 10, borderWidth: 1, borderColor: colors.border.default,
      backgroundColor: colors.background.base, padding: 12,
      flexDirection: 'row', alignItems: 'center', gap: 8,
    },
    dateFieldLabel: { color: colors.text.tertiary, fontSize: 10, fontWeight: '800', letterSpacing: 0.4 },
    dateFieldValue: { color: colors.text.primary, fontSize: 14, fontWeight: '700', marginTop: 2 },
    // Form actions
    formActions: { flexDirection: 'row', justifyContent: 'flex-end', gap: 12, marginTop: 14 },
    cancelButton: {
      height: 40, borderRadius: 10, paddingHorizontal: 14, justifyContent: 'center',
      borderWidth: 1, borderColor: colors.border.default, backgroundColor: colors.background.elevated,
    },
    cancelButtonText: { color: colors.text.secondary, fontWeight: '700' },
    saveButton: {
      height: 40, borderRadius: 10, paddingHorizontal: 18,
      justifyContent: 'center', backgroundColor: colors.primary[500],
    },
    saveButtonText: { color: colors.text.onPrimary, fontWeight: '800' },
    disabledButton: { opacity: 0.65 },
  });
