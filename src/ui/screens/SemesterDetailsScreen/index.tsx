import { useMemo, useState } from 'react';
import { Alert, Pressable, StyleSheet, Text, View } from 'react-native';
import type { NativeStackNavigationProp, NativeStackScreenProps } from '@react-navigation/native-stack';
import { useNavigation } from '@react-navigation/native';
import { useQueries } from '@tanstack/react-query';

import type { RootStackParamList } from '@/app/navigation/types';
import { evaluatePassFail } from '@/core/grading/evaluatePassFail';
import { athenaRepository } from '@/db/repositories/athenaRepository';
import type { GradeScale } from '@/db/types';
import { useCreateUC, useDeleteUC, useSemesterInsights, useUCsBySemester, useUpdateUC } from '@/features/academics/hooks';
import { queryKeys } from '@/features/queryKeys';
import { MaterialIcons } from '@expo/vector-icons';
import { useAppPreferences } from '@/presentation/providers/AppPreferencesProvider';
import { AppHeader } from '@/presentation/widgets/app_header';
import { Screen } from '@/ui/components/Screen';
import { athenaRadius, useAthenaTheme, type AthenaColors } from '@/ui/theme/tokens';
import { parseNullableNumber } from '@/utils/formUtils';
import { SemesterHero } from './SemesterHero';
import { UCCardItem } from './UCCardItem';
import { CreateEditUCModal } from './CreateEditUCModal';

type Props = NativeStackScreenProps<RootStackParamList, 'SemesterDetails'>;

interface UCFormState {
  icon: string;
  name: string;
  ects: string;
  professor: string;
  notaMinimaAprovacao: string;
  escalaNatas: GradeScale | '';
  notes: string;
}

const initialForm: UCFormState = {
  icon: 'functions',
  name: '',
  ects: '6',
  professor: '',
  notaMinimaAprovacao: '',
  escalaNatas: '',
  notes: '',
};

export const SemesterDetailsScreen = ({ route }: Props) => {
  const { colors } = useAthenaTheme();
  const { t } = useAppPreferences();
  const styles = useMemo(() => createStyles(colors), [colors]);
  const { semesterId } = route.params;
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();

  const insightsQuery = useSemesterInsights(semesterId);
  const ucsQuery = useUCsBySemester(semesterId);
  const createMutation = useCreateUC(semesterId);
  const updateMutation = useUpdateUC(semesterId);
  const deleteMutation = useDeleteUC(semesterId);

  const [showModal, setShowModal] = useState(false);
  const [editingUCId, setEditingUCId] = useState<number | null>(null);
  const [form, setForm] = useState<UCFormState>(initialForm);

  const ucList = ucsQuery.data ?? [];

  const statusQueries = useQueries({
    queries: ucList.map((uc) => ({
      queryKey: queryKeys.ucStatus(uc.id),
      queryFn: async () => {
        const info = await athenaRepository.getUCGradeInfo(uc.id);
        const coreAvaliacoes = info.avaliacoes.map((a) => ({
          id: a.id, ucId: a.ucId, nome: a.nome, tipo: a.tipo,
          dataHora: a.dataHora, peso: a.peso, notaObtida: a.notaObtida, notaMaxima: a.notaMaxima,
        }));
        return evaluatePassFail(coreAvaliacoes, info.notaMinima, info.notaMaximaEscala, info.temExameRecurso);
      },
    })),
  });

  const approvedPercent = useMemo(() => {
    const total = insightsQuery.data?.totalEcts ?? 0;
    if (!total) return 0;
    const approved = insightsQuery.data?.approvedEcts ?? 0;
    return Math.round((approved / total) * 100);
  }, [insightsQuery.data]);

  const openCreate = () => {
    setEditingUCId(null);
    setForm(initialForm);
    setShowModal(true);
  };

  const openEdit = (uc: typeof ucList[0]) => {
    setEditingUCId(uc.id);
    setForm({
      icon: uc.icon,
      name: uc.name,
      ects: String(uc.ects),
      professor: uc.professores?.[0] ?? '',
      notaMinimaAprovacao: uc.notaMinimaAprovacao !== null ? String(uc.notaMinimaAprovacao) : '',
      escalaNatas: uc.escalaNatas ?? '',
      notes: uc.notes ?? '',
    });
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setEditingUCId(null);
    setForm(initialForm);
  };

  const saveUC = async () => {
    if (!form.name.trim()) {
      Alert.alert(t('common.error'), t('semesterDetails.error.nameRequired'));
      return;
    }
    const ects = parseNullableNumber(form.ects);
    if (ects === null || ects < 0) {
      Alert.alert(t('common.error'), t('semesterDetails.error.invalidEcts'));
      return;
    }
    const professores = form.professor.trim() ? [form.professor.trim()] : [];
    const notaMinimaAprovacao = parseNullableNumber(form.notaMinimaAprovacao);
    const escalaNatas = (form.escalaNatas || null) as GradeScale | null;
    const payload = {
      icon: form.icon,
      name: form.name.trim(),
      ects,
      professores,
      notaMinimaAprovacao,
      escalaNatas,
      notes: form.notes.trim() || null,
    };
    try {
      if (editingUCId) {
        await updateMutation.mutateAsync({ ucId: editingUCId, input: payload });
      } else {
        await createMutation.mutateAsync(payload);
      }
      closeModal();
    } catch (error) {
      console.error('saveUC error:', error);
      Alert.alert(t('common.error'), t('semesterDetails.error.saveUc'));
    }
  };

  const removeUC = (ucId: number) => {
    Alert.alert(t('semesterDetails.deleteUc.title'), t('semesterDetails.deleteUc.message'), [
      { text: t('common.cancel'), style: 'cancel' },
      {
        text: t('common.delete'),
        style: 'destructive',
        onPress: async () => {
          try {
            await deleteMutation.mutateAsync(ucId);
          } catch (error) {
            console.error('deleteUC error:', error);
            Alert.alert(t('common.error'), t('semesterDetails.error.deleteUc'));
          }
        },
      },
    ]);
  };

  return (
    <Screen>
      <AppHeader
        title={t('header.semesterDetails')}
        leftActionIcon="arrow-back"
        onLeftActionPress={() => navigation.goBack()}
      />

      <SemesterHero
        semesterAverage={insightsQuery.data?.semesterAverage}
        approvedPercent={approvedPercent}
        ucCount={ucList.length}
        averageLabel={t('semesterDetails.average')}
        completedLabel={t('semesterDetails.completed').replace('{value}', String(approvedPercent))}
        subjectsLabel={t('semesterDetails.subjects').replace('{count}', String(ucList.length))}
      />

      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>{t('semesterDetails.section.subjects')}</Text>
      </View>

      {ucList.length ? (
        ucList.map((uc, index) => (
          <UCCardItem
            key={uc.id}
            uc={uc}
            status={statusQueries[index]?.data?.status}
            onPress={() => navigation.navigate('UCDetails', { ucId: uc.id, semesterId })}
            onEdit={() => openEdit(uc)}
            onDelete={() => removeUC(uc.id)}
            editLabel={t('common.edit')}
            deleteLabel={t('common.delete')}
          />
        ))
      ) : (
        <View style={styles.emptyState}>
          <Text style={styles.emptyStateText}>{t('semesterDetails.emptySubjects')}</Text>
        </View>
      )}

      <Pressable style={styles.addUcCard} onPress={openCreate}>
        <View style={styles.addUcIconWrap}>
          <MaterialIcons name="add" size={22} color={colors.primary[600]} />
        </View>
        <View>
          <Text style={styles.addUcTitle}>{t('semesterDetails.addSubject')}</Text>
          <Text style={styles.addUcSubtitle}>{t('semesterDetails.addSubjectSubtitle')}</Text>
        </View>
      </Pressable>

      <CreateEditUCModal
        visible={showModal}
        form={form}
        isEditing={editingUCId !== null}
        isSaving={createMutation.isPending || updateMutation.isPending}
        onChangeForm={setForm}
        onSave={() => { void saveUC(); }}
        onClose={closeModal}
        labels={{
          title: editingUCId ? t('semesterDetails.modal.editUc') : t('semesterDetails.modal.newUc'),
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
          save: t('common.create'),
          update: t('common.update'),
        }}
      />
    </Screen>
  );
};

const createStyles = (colors: AthenaColors) =>
  StyleSheet.create({
    sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 2 },
    sectionTitle: { color: colors.text.primary, fontSize: 28, fontWeight: '800' },
    emptyState: {
      borderRadius: athenaRadius.md, borderWidth: 1, borderColor: colors.border.default,
      backgroundColor: colors.background.surface, padding: 16, alignItems: 'center',
    },
    emptyStateText: { color: colors.text.secondary },
    addUcCard: {
      borderRadius: athenaRadius.md,
      borderWidth: 1,
      borderColor: colors.primary[500],
      backgroundColor: colors.background.elevated,
      padding: 14,
      flexDirection: 'row',
      alignItems: 'center',
      gap: 10,
    },
    addUcIconWrap: {
      width: 38,
      height: 38,
      borderRadius: 10,
      backgroundColor: colors.info.soft,
      alignItems: 'center',
      justifyContent: 'center',
    },
    addUcTitle: { color: colors.primary[600], fontSize: 16, fontWeight: '800' },
    addUcSubtitle: { color: colors.text.secondary, fontSize: 12, marginTop: 1 },
  });
