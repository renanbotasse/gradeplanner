import { useMemo, useState } from 'react';
import { Alert, Modal, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { Calendar, type DateData } from 'react-native-calendars';
import { MaterialIcons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';

import type { RootStackParamList } from '@/app/navigation/types';
import type { CursoRecord, GradeScale } from '@/db/types';
import { useActiveCurso, useCursos, useDeleteCurso, useSetActiveCurso, useUpdateCurso } from '@/features/courses/hooks';
import { useAppPreferences } from '@/presentation/providers/AppPreferencesProvider';
import { AppHeader } from '@/presentation/widgets/app_header';
import { Screen } from '@/ui/components/Screen';
import { athenaRadius, useAthenaTheme, type AthenaColors } from '@/ui/theme/tokens';
import { formatDate } from '@/utils/date';

const GRADE_SCALES: Array<{ value: GradeScale; label: string }> = [
  { value: '0-10', label: '0 a 10' },
  { value: '0-20', label: '0 a 20' },
  { value: '0-100', label: '0 a 100' },
];

interface EditFormState {
  nome: string;
  instituicao: string;
  escalaNatas: GradeScale;
  notaMinima: string;
  dataInicio: string;
  dataFim: string;
}

export const CourseSettingsScreen = () => {
  const { colors, mode } = useAthenaTheme();
  const { t, language, weekStartDay } = useAppPreferences();
  const styles = useMemo(() => createStyles(colors), [colors]);
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();

  const cursosQuery = useCursos();
  const activeCursoQuery = useActiveCurso();
  const setActiveCurso = useSetActiveCurso();
  const deleteCurso = useDeleteCurso();
  const updateCurso = useUpdateCurso();

  const cursos = cursosQuery.data ?? [];
  const activeCursoId = activeCursoQuery.data?.id;

  // Edit modal state
  const [editingCurso, setEditingCurso] = useState<CursoRecord | null>(null);
  const [form, setForm] = useState<EditFormState>({
    nome: '', instituicao: '', escalaNatas: '0-20', notaMinima: '10', dataInicio: '', dataFim: '',
  });
  const [showDatePicker, setShowDatePicker] = useState<'inicio' | 'fim' | null>(null);

  const setField = <K extends keyof EditFormState>(key: K, value: EditFormState[K]) =>
    setForm((prev) => ({ ...prev, [key]: value }));

  const openEdit = (curso: CursoRecord) => {
    setEditingCurso(curso);
    setForm({
      nome: curso.nome,
      instituicao: curso.instituicao ?? '',
      escalaNatas: curso.escalaNatas,
      notaMinima: String(curso.notaMinimaAprovacao),
      dataInicio: curso.dataInicio,
      dataFim: curso.dataFimPrevista ?? '',
    });
  };

  const closeEdit = () => {
    setEditingCurso(null);
    setShowDatePicker(null);
  };

  const saveEdit = async () => {
    if (!editingCurso) return;
    if (!form.nome.trim()) {
      Alert.alert(t('common.error'), t('courses.error.nameRequired'));
      return;
    }
    if (!form.dataInicio) {
      Alert.alert(t('common.error'), t('courses.error.dateRequired'));
      return;
    }
    const notaMinima = parseFloat(form.notaMinima.replace(',', '.'));
    if (Number.isNaN(notaMinima)) {
      Alert.alert(t('common.error'), t('courses.error.invalidMinGrade'));
      return;
    }
    try {
      await updateCurso.mutateAsync({
        cursoId: editingCurso.id,
        input: {
          nome: form.nome.trim(),
          instituicao: form.instituicao.trim() || null,
          escalaNatas: form.escalaNatas,
          notaMinimaAprovacao: notaMinima,
          dataInicio: form.dataInicio,
          dataFimPrevista: form.dataFim || null,
        },
      });
      closeEdit();
    } catch {
      Alert.alert(t('common.error'), t('courses.error.save'));
    }
  };

  const handleDelete = (cursoId: number, nome: string) => {
    Alert.alert(
      t('courses.delete.title'),
      t('courses.delete.message').replace('{name}', nome),
      [
        { text: t('common.cancel'), style: 'cancel' },
        { text: t('common.delete'), style: 'destructive', onPress: () => deleteCurso.mutate(cursoId) },
      ],
    );
  };

  const datePickerMarked = (date: string) =>
    date ? { [date]: { selected: true, selectedColor: colors.primary[600] } } : {};

  return (
    <Screen>
      <AppHeader title={t('header.courses')} leftActionIcon="arrow-back" onLeftActionPress={() => navigation.goBack()} />

      {cursos.map((curso) => {
        const isActive = curso.id === activeCursoId;
        return (
          <View key={curso.id} style={[styles.card, isActive && styles.activeCard]}>
            {/* Main row — tap to set active */}
            <Pressable style={styles.cardMain} onPress={() => setActiveCurso.mutate(curso.id)}>
              <View style={styles.cardInfo}>
                {isActive && (
                  <View style={styles.activeBadge}>
                    <Text style={styles.activeBadgeText}>{t('courses.active')}</Text>
                  </View>
                )}
                <Text style={styles.cardNome}>{curso.nome}</Text>
                {curso.instituicao ? <Text style={styles.cardInst}>{curso.instituicao}</Text> : null}
                <Text style={styles.cardMeta}>
                  {t('courses.field.gradeScale')}: {curso.escalaNatas} · {t('courses.field.minGrade')}: {curso.notaMinimaAprovacao}
                </Text>
                {curso.dataInicio ? (
                  <Text style={styles.cardMeta}>
                    {t('courses.date.start')}: {formatDate(curso.dataInicio)}
                    {curso.dataFimPrevista ? `  ·  ${t('courses.date.end')}: ${formatDate(curso.dataFimPrevista)}` : ''}
                  </Text>
                ) : null}
              </View>
              <MaterialIcons
                name={isActive ? 'radio-button-checked' : 'radio-button-unchecked'}
                size={22}
                color={isActive ? colors.primary[500] : colors.text.tertiary}
              />
            </Pressable>

            {/* Action row */}
            <View style={styles.cardActions}>
              <Pressable style={styles.actionBtn} onPress={() => openEdit(curso)}>
                <MaterialIcons name="edit" size={16} color={colors.primary[600]} />
                <Text style={styles.actionBtnText}>{t('common.edit')}</Text>
              </Pressable>
              <View style={styles.actionDivider} />
              <Pressable
                style={styles.actionBtn}
                onPress={() => handleDelete(curso.id, curso.nome)}
              >
                <MaterialIcons name="delete-outline" size={16} color={colors.danger.base} />
                <Text style={[styles.actionBtnText, { color: colors.danger.base }]}>{t('common.delete')}</Text>
              </Pressable>
            </View>
          </View>
        );
      })}

      {cursos.length === 0 && (
        <View style={styles.emptyCard}>
          <Text style={styles.emptyText}>{t('courses.empty')}</Text>
        </View>
      )}

      {/* ─── Edit Course Modal ──────────────────────────────────────────────── */}
      <Modal visible={!!editingCurso} animationType="slide" transparent onRequestClose={closeEdit}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalSheet}>
            {/* Header */}
            <View style={styles.modalHeader}>
              <Pressable onPress={closeEdit}>
                <MaterialIcons name="close" size={22} color={colors.text.secondary} />
              </Pressable>
              <Text style={styles.modalTitle}>{t('courses.editCourse')}</Text>
              <Pressable onPress={saveEdit} disabled={updateCurso.isPending}>
                <Text style={[styles.modalSave, updateCurso.isPending && { opacity: 0.5 }]}>
                  {updateCurso.isPending ? t('courses.saving') : t('common.save')}
                </Text>
              </Pressable>
            </View>

            <ScrollView
              showsVerticalScrollIndicator={false}
              keyboardShouldPersistTaps="handled"
              contentContainerStyle={styles.modalContent}
            >
              {/* Nome */}
              <FormField styles={styles} label={t('courses.field.courseName')}>
                <TextInput
                  style={styles.input}
                  value={form.nome}
                  onChangeText={(v) => setField('nome', v)}
                  placeholder={t('courses.placeholder.courseName')}
                  placeholderTextColor={colors.text.tertiary}
                />
              </FormField>

              {/* Instituição */}
              <FormField styles={styles} label={t('courses.field.institution')}>
                <TextInput
                  style={styles.input}
                  value={form.instituicao}
                  onChangeText={(v) => setField('instituicao', v)}
                  placeholder={t('courses.placeholder.institution')}
                  placeholderTextColor={colors.text.tertiary}
                />
              </FormField>

              {/* Escala de notas */}
              <FormField styles={styles} label={t('courses.field.gradeScale')}>
                <View style={styles.chipRow}>
                  {GRADE_SCALES.map((s) => (
                    <Pressable
                      key={s.value}
                      style={[styles.chip, form.escalaNatas === s.value && styles.chipActive]}
                      onPress={() => setField('escalaNatas', s.value)}
                    >
                      <Text style={[styles.chipText, form.escalaNatas === s.value && styles.chipTextActive]}>
                        {s.label}
                      </Text>
                    </Pressable>
                  ))}
                </View>
              </FormField>

              {/* Nota mínima */}
              <FormField styles={styles} label={t('courses.field.minGrade')}>
                <TextInput
                  style={styles.input}
                  value={form.notaMinima}
                  onChangeText={(v) => setField('notaMinima', v)}
                  keyboardType="decimal-pad"
                  placeholder={t('courses.placeholder.minGrade')}
                  placeholderTextColor={colors.text.tertiary}
                />
              </FormField>

              {/* Data de início */}
              <FormField styles={styles} label={t('courses.field.startDate')}>
                <Pressable style={styles.dateBtn} onPress={() => setShowDatePicker('inicio')}>
                  <MaterialIcons
                    name="calendar-today"
                    size={15}
                    color={form.dataInicio ? colors.text.primary : colors.text.tertiary}
                  />
                  <Text style={[styles.dateBtnText, !form.dataInicio && styles.dateBtnPlaceholder]}>
                    {form.dataInicio ? formatDate(form.dataInicio) : t('courses.placeholder.selectDate')}
                  </Text>
                </Pressable>
              </FormField>

              {/* Data de fim */}
              <FormField styles={styles} label={t('courses.field.endDate')}>
                <Pressable style={styles.dateBtn} onPress={() => setShowDatePicker('fim')}>
                  <MaterialIcons
                    name="calendar-today"
                    size={15}
                    color={form.dataFim ? colors.text.primary : colors.text.tertiary}
                  />
                  <Text style={[styles.dateBtnText, !form.dataFim && styles.dateBtnPlaceholder]}>
                    {form.dataFim ? formatDate(form.dataFim) : t('courses.placeholder.selectDateOptional')}
                  </Text>
                </Pressable>
                {form.dataFim ? (
                  <Pressable onPress={() => setField('dataFim', '')}>
                    <Text style={styles.clearDate}>{t('courses.clearDate')}</Text>
                  </Pressable>
                ) : null}
              </FormField>
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* ─── Date Picker Sub-modal ──────────────────────────────────────────── */}
      <Modal visible={!!showDatePicker} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.calendarModal}>
            <View style={styles.calendarHeader}>
              <Text style={styles.calendarTitle}>
                {showDatePicker === 'inicio' ? t('courses.date.start') : t('courses.date.end')}
              </Text>
              <Pressable
                style={styles.calendarDoneBtn}
                onPress={() => setShowDatePicker(null)}
              >
                <Text style={styles.calendarDoneText}>{t('common.confirm')}</Text>
              </Pressable>
            </View>
            <Calendar
              key={`course-picker-${mode}-${language}-${weekStartDay}`}
              showSixWeeks
              hideExtraDays={false}
              firstDay={weekStartDay}
              onDayPress={(day: DateData) => {
                if (showDatePicker === 'inicio') setField('dataInicio', day.dateString);
                else setField('dataFim', day.dateString);
                setShowDatePicker(null);
              }}
              markedDates={datePickerMarked(showDatePicker === 'inicio' ? form.dataInicio : form.dataFim)}
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

// ─── Helpers ──────────────────────────────────────────────────────────────────

const FormField = ({
  styles,
  label,
  children,
}: {
  styles: ReturnType<typeof createStyles>;
  label: string;
  children: React.ReactNode;
}) => {
  return (
    <View style={styles.formField}>
      <Text style={styles.formFieldLabel}>{label}</Text>
      {children}
    </View>
  );
};

// ─── Styles ───────────────────────────────────────────────────────────────────

const createStyles = (colors: AthenaColors) =>
  StyleSheet.create({
    // Course cards
    card: {
      backgroundColor: colors.background.surface, borderWidth: 1, borderColor: colors.border.default,
      borderRadius: athenaRadius.md, overflow: 'hidden',
    },
    activeCard: { borderColor: colors.primary[500] },
    cardMain: { flexDirection: 'row', alignItems: 'center', padding: 14, gap: 10 },
    cardInfo: { flex: 1, gap: 2 },
    activeBadge: {
      alignSelf: 'flex-start', backgroundColor: colors.primary[500] + '22',
      borderRadius: 999, paddingHorizontal: 8, paddingVertical: 2, marginBottom: 4,
    },
    activeBadgeText: { color: colors.primary[500], fontSize: 11, fontWeight: '700' },
    cardNome: { fontSize: 17, fontWeight: '800', color: colors.text.primary },
    cardInst: { fontSize: 13, color: colors.text.secondary },
    cardMeta: { fontSize: 12, color: colors.text.tertiary, marginTop: 2 },
    cardActions: {
      flexDirection: 'row', borderTopWidth: 1, borderTopColor: colors.border.default,
    },
    actionBtn: {
      flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
      gap: 6, paddingVertical: 10,
    },
    actionBtnText: { color: colors.primary[600], fontSize: 13, fontWeight: '700' },
    actionDivider: { width: 1, backgroundColor: colors.border.default },
    emptyCard: {
      backgroundColor: colors.background.surface, borderRadius: athenaRadius.md,
      borderWidth: 1, borderColor: colors.border.default, padding: 16,
    },
    emptyText: { color: colors.text.secondary, fontSize: 15 },
    // Modal
    modalOverlay: { flex: 1, backgroundColor: colors.overlay.scrim, justifyContent: 'flex-end' },
    modalSheet: {
      backgroundColor: colors.background.surface,
      borderTopLeftRadius: 24, borderTopRightRadius: 24,
      maxHeight: '92%',
    },
    modalHeader: {
      flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
      paddingHorizontal: 20, paddingVertical: 16,
      borderBottomWidth: 1, borderBottomColor: colors.border.default,
    },
    modalTitle: { color: colors.text.primary, fontSize: 18, fontWeight: '800' },
    modalSave: { color: colors.primary[600], fontSize: 16, fontWeight: '800' },
    modalContent: { padding: 20, paddingBottom: 48 },
    formField: { gap: 6, marginBottom: 14 },
    formFieldLabel: { color: colors.text.secondary, fontSize: 13, fontWeight: '700' },
    // Form
    input: {
      height: 46, borderRadius: 10, borderWidth: 1, borderColor: colors.border.default,
      backgroundColor: colors.background.base, paddingHorizontal: 12,
      color: colors.text.primary, fontSize: 16,
    },
    chipRow: { flexDirection: 'row', gap: 8 },
    chip: {
      flex: 1, borderRadius: 8, borderWidth: 1, borderColor: colors.border.default,
      backgroundColor: colors.background.base, paddingVertical: 10, alignItems: 'center',
    },
    chipActive: { backgroundColor: colors.primary[500], borderColor: colors.primary[500] },
    chipText: { color: colors.text.secondary, fontSize: 13, fontWeight: '700' },
    chipTextActive: { color: colors.text.onPrimary },
    dateBtn: {
      height: 46, borderRadius: 10, borderWidth: 1, borderColor: colors.border.default,
      backgroundColor: colors.background.base, paddingHorizontal: 12,
      flexDirection: 'row', alignItems: 'center', gap: 8,
    },
    dateBtnText: { color: colors.text.primary, fontSize: 16 },
    dateBtnPlaceholder: { color: colors.text.tertiary },
    clearDate: { color: colors.danger.base, fontSize: 12, fontWeight: '700', marginTop: 4 },
    // Calendar modal
    calendarModal: {
      backgroundColor: colors.background.surface, borderTopLeftRadius: 24, borderTopRightRadius: 24, paddingBottom: 32,
    },
    calendarHeader: {
      flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
      paddingHorizontal: 20, paddingVertical: 16,
      borderBottomWidth: 1, borderBottomColor: colors.border.default,
    },
    calendarTitle: { color: colors.text.primary, fontSize: 18, fontWeight: '800' },
    calendarDoneBtn: {
      paddingHorizontal: 14, paddingVertical: 6, borderRadius: 8, backgroundColor: colors.primary[500],
    },
    calendarDoneText: { color: colors.text.onPrimary, fontSize: 14, fontWeight: '700' },
  });
