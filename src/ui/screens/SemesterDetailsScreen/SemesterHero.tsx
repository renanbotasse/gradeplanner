import { useMemo } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { useAthenaTheme, type AthenaColors } from '@/ui/theme/tokens';
import { athenaRadius } from '@/ui/theme/tokens';

interface SemesterHeroProps {
  semesterAverage: number | null | undefined;
  approvedPercent: number;
  ucCount: number;
  averageLabel: string;
  completedLabel: string;
  subjectsLabel: string;
}

export const SemesterHero = ({
  semesterAverage,
  approvedPercent,
  ucCount,
  averageLabel,
  completedLabel,
  subjectsLabel,
}: SemesterHeroProps) => {
  const { colors } = useAthenaTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);

  return (
    <View style={styles.heroCard}>
      <View style={styles.heroIconWrap}>
        <MaterialIcons name="school" size={30} color={colors.primary[600]} />
        <View style={styles.heroCircle} />
      </View>
      <Text style={styles.heroAverage}>
        {semesterAverage !== null && semesterAverage !== undefined
          ? `${semesterAverage.toFixed(1)}/20`
          : '--/20'}
      </Text>
      <Text style={styles.heroCaption}>{averageLabel}</Text>
      <View style={styles.heroPills}>
        <View style={styles.completedPill}>
          <Text style={styles.completedPillText}>{completedLabel}</Text>
        </View>
        <View style={styles.subjectsPill}>
          <Text style={styles.subjectsPillText}>{subjectsLabel}</Text>
        </View>
      </View>
    </View>
  );
};

const createStyles = (colors: AthenaColors) =>
  StyleSheet.create({
    heroCard: {
      backgroundColor: colors.background.surface, borderRadius: athenaRadius.lg,
      borderWidth: 1, borderColor: colors.border.default, alignItems: 'center', padding: 18,
    },
    heroIconWrap: {
      width: 88, height: 88, borderRadius: 44, alignItems: 'center',
      justifyContent: 'center', backgroundColor: colors.background.elevated, position: 'relative',
    },
    heroCircle: {
      ...StyleSheet.absoluteFillObject, borderRadius: 44, borderWidth: 6,
      borderColor: colors.primary[500], borderTopColor: colors.border.default, borderLeftColor: colors.border.default,
    },
    heroAverage: { marginTop: 12, fontSize: 38, fontWeight: '800', color: colors.text.primary },
    heroCaption: { color: colors.text.secondary, fontSize: 17, marginTop: 2 },
    heroPills: { marginTop: 10, flexDirection: 'row', gap: 8 },
    completedPill: { backgroundColor: colors.success.soft, borderRadius: 999, paddingHorizontal: 10, paddingVertical: 4 },
    completedPillText: { color: colors.success.base, fontWeight: '700', fontSize: 12 },
    subjectsPill: { backgroundColor: colors.info.soft, borderRadius: 999, paddingHorizontal: 10, paddingVertical: 4 },
    subjectsPillText: { color: colors.primary[500], fontWeight: '700', fontSize: 12 },
  });
