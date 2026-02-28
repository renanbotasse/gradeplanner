import { useMemo, useState } from 'react';
import { Alert, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { MaterialIcons } from '@expo/vector-icons';

import type { OnboardingStackParamList } from '@/app/navigation/OnboardingNavigator';
import type { GradeScale } from '@/db/types';
import { useCreateUC } from '@/features/academics/hooks';
import { useAppPreferences } from '@/presentation/providers/AppPreferencesProvider';
import { AppButton, AppCard, AppChip, AppInput } from '@/ui/components/primitives';
import { Screen } from '@/ui/components/Screen';
import { OnboardingTopHeader } from '@/ui/screens/onboarding/OnboardingTopHeader';
import { radius, spacing, typography } from '@/ui/theme/foundation';
import { useAthenaTheme, type AthenaColors } from '@/ui/theme/tokens';

type Props = NativeStackScreenProps<OnboardingStackParamList, 'OnboardingUCs'>;

interface UCEntry {
  id: number;
  icon: keyof typeof MaterialIcons.glyphMap;
  name: string;
  ects: string;
  professor: string;
  notaMinima: string;
  escalaNatas: GradeScale | '';
  notes: string;
}

const UC_ICONS: Array<keyof typeof MaterialIcons.glyphMap> = [
  'functions',
  'terminal',
  'science',
  'calculate',
  'hub',
  'code',
  'memory',
  'computer',
];

const GRADE_SCALES: Array<GradeScale | ''> = ['0-10', '0-20', '0-100', ''];

const emptyUC = (id: number): UCEntry => ({
  id,
  icon: 'functions',
  name: '',
  ects: '6',
  professor: '',
  notaMinima: '',
  escalaNatas: '',
  notes: '',
});

const toNullableNumber = (value: string): number | null => {
  if (!value.trim()) return null;
  const parsed = Number(value.replace(',', '.'));
  return Number.isFinite(parsed) ? parsed : null;
};

export const OnboardingUCsScreen = ({ route, navigation }: Props) => {
  const { colors } = useAthenaTheme();
  const { t } = useAppPreferences();
  const styles = useMemo(() => createStyles(colors), [colors]);
  const { semesterId } = route.params;
  const createUC = useCreateUC(semesterId);

  const [ucs, setUCs] = useState<UCEntry[]>([emptyUC(1)]);
  const [nextUcId, setNextUcId] = useState(2);
  const [isSaving, setIsSaving] = useState(false);

  const updateUC = (entryId: number, patch: Partial<UCEntry>) => {
    setUCs((prev) => prev.map((item) => (item.id === entryId ? { ...item, ...patch } : item)));
  };

  const addUC = () => {
    setUCs((prev) => [...prev, emptyUC(nextUcId)]);
    setNextUcId((prev) => prev + 1);
  };

  const removeUC = (entryId: number) => {
    if (ucs.length <= 1) return;
    setUCs((prev) => prev.filter((item) => item.id !== entryId));
  };

  const onNext = async () => {
    const validUCs = ucs.filter((uc) => uc.name.trim());
    if (!validUCs.length) {
      navigation.navigate('OnboardingAssessments', { semesterId, ucIds: [] });
      return;
    }

    setIsSaving(true);
    try {
      const ucIds: number[] = [];
      for (const uc of validUCs) {
        const createdId = await createUC.mutateAsync({
          icon: uc.icon,
          name: uc.name.trim(),
          ects: toNullableNumber(uc.ects) ?? 0,
          professores: uc.professor.trim() ? [uc.professor.trim()] : [],
          notaMinimaAprovacao: toNullableNumber(uc.notaMinima),
          escalaNatas: uc.escalaNatas || null,
          notes: uc.notes.trim() || null,
        });
        ucIds.push(createdId);
      }
      navigation.navigate('OnboardingAssessments', { semesterId, ucIds });
    } catch {
      Alert.alert(t('common.error'), t('semesterDetails.error.saveUc'));
    } finally {
      setIsSaving(false);
    }
  };

  const onSkip = () => {
    navigation.navigate('OnboardingAssessments', { semesterId, ucIds: [] });
  };

  return (
    <Screen>
      <OnboardingTopHeader />

      <Text style={styles.step}>{t('onboarding.ucs.step')}</Text>
      <Text style={styles.title}>{t('onboarding.ucs.title')}</Text>
      <Text style={styles.subtitle}>{t('onboarding.ucs.subtitle')}</Text>

      {ucs.map((uc, index) => (
        <AppCard key={uc.id} style={styles.ucCard}>
          <View style={styles.ucHeader}>
            <Text style={styles.ucLabel}>{t('onboarding.ucs.subject').replace('{index}', String(index + 1))}</Text>
            {ucs.length > 1 ? (
              <Pressable onPress={() => removeUC(uc.id)}>
                <MaterialIcons name="close" size={20} color={colors.text.tertiary} />
              </Pressable>
            ) : null}
          </View>

          <View style={styles.fieldGroup}>
            <Text style={styles.fieldLabel}>{t('semesterDetails.field.icon')}</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.iconRow}>
              {UC_ICONS.map((iconName) => {
                const selected = uc.icon === iconName;
                return (
                  <Pressable
                    key={iconName}
                    style={[styles.iconChip, selected && styles.iconChipActive]}
                    onPress={() => updateUC(uc.id, { icon: iconName })}
                  >
                    <MaterialIcons
                      name={iconName}
                      size={20}
                      color={selected ? colors.text.onPrimary : colors.text.secondary}
                    />
                  </Pressable>
                );
              })}
            </ScrollView>
          </View>

          <AppInput
            label={t('semesterDetails.field.name')}
            value={uc.name}
            onChangeText={(value) => updateUC(uc.id, { name: value })}
            placeholder={t('onboarding.ucs.placeholder.name')}
          />

          <View style={styles.row}>
            <View style={styles.rowCell}>
              <AppInput
                label={t('semesterDetails.field.ects')}
                value={uc.ects}
                onChangeText={(value) => updateUC(uc.id, { ects: value })}
                keyboardType="decimal-pad"
              />
            </View>
            <View style={styles.rowCell}>
              <AppInput
                label={t('semesterDetails.field.minGrade')}
                value={uc.notaMinima}
                onChangeText={(value) => updateUC(uc.id, { notaMinima: value })}
                keyboardType="decimal-pad"
                placeholder={t('semesterDetails.placeholder.inheritCourse')}
              />
            </View>
          </View>

          <AppInput
            label={t('semesterDetails.field.professor')}
            value={uc.professor}
            onChangeText={(value) => updateUC(uc.id, { professor: value })}
          />

          <View style={styles.fieldGroup}>
            <Text style={styles.fieldLabel}>{t('semesterDetails.field.gradeSystem')}</Text>
            <View style={styles.scaleRow}>
              {GRADE_SCALES.map((scale) => (
                <AppChip
                  key={scale || 'course'}
                  label={scale || t('semesterDetails.scale.fromCourse')}
                  selected={uc.escalaNatas === scale}
                  variant="primary"
                  onPress={() => updateUC(uc.id, { escalaNatas: scale })}
                />
              ))}
            </View>
          </View>

          <AppInput
            label={t('semesterDetails.field.notes')}
            value={uc.notes}
            onChangeText={(value) => updateUC(uc.id, { notes: value })}
            multiline
            numberOfLines={3}
          />
        </AppCard>
      ))}

      <AppButton
        label={t('semesterDetails.addSubject')}
        variant="secondary"
        icon="add"
        size="lg"
        onPress={addUC}
      />

      <AppButton
        label={isSaving ? t('onboarding.common.creating') : t('onboarding.common.next')}
        icon="arrow-forward"
        size="lg"
        onPress={() => {
          void onNext();
        }}
        loading={isSaving}
        disabled={isSaving}
      />

      <Pressable style={styles.skipBtn} onPress={onSkip}>
        <Text style={styles.skipBtnText}>{t('onboarding.common.addLater')}</Text>
      </Pressable>
    </Screen>
  );
};

const createStyles = (colors: AthenaColors) =>
  StyleSheet.create({
    step: {
      ...typography.caption,
      color: colors.text.tertiary,
      marginTop: spacing.xs,
    },
    title: {
      ...typography.h1,
      color: colors.text.primary,
    },
    subtitle: {
      ...typography.body,
      color: colors.text.secondary,
    },
    ucCard: {
      gap: spacing.sm,
    },
    ucHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
    },
    ucLabel: {
      ...typography.overline,
      color: colors.text.tertiary,
    },
    fieldGroup: {
      gap: spacing.xxs,
    },
    fieldLabel: {
      ...typography.caption,
      color: colors.text.secondary,
    },
    iconRow: {
      gap: spacing.xs,
      paddingRight: spacing.md,
    },
    iconChip: {
      width: 40,
      height: 40,
      borderRadius: radius.md,
      borderWidth: 1,
      borderColor: colors.border.default,
      backgroundColor: colors.background.elevated,
      alignItems: 'center',
      justifyContent: 'center',
    },
    iconChipActive: {
      borderColor: colors.primary[500],
      backgroundColor: colors.primary[500],
    },
    row: {
      flexDirection: 'row',
      gap: spacing.xs,
    },
    rowCell: {
      flex: 1,
    },
    scaleRow: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: spacing.xs,
    },
    skipBtn: {
      alignItems: 'center',
      paddingVertical: spacing.xs,
    },
    skipBtnText: {
      ...typography.body,
      color: colors.text.tertiary,
    },
  });
