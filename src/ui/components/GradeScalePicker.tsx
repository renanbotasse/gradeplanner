import { Pressable, StyleSheet, Text, View } from 'react-native';
import type { GradeScale } from '@/db/types';
import { GRADE_SCALES } from '@/constants/ucConstants';
import { useAthenaTheme } from '@/ui/theme/tokens';

interface GradeScalePickerProps {
  selectedScale: GradeScale | '';
  onChange: (scale: GradeScale | '') => void;
  fromCourseLabel?: string;
}

export const GradeScalePicker = ({ selectedScale, onChange, fromCourseLabel = 'Curso' }: GradeScalePickerProps) => {
  const { colors } = useAthenaTheme();

  return (
    <View style={styles.scaleRow}>
      {GRADE_SCALES.map((scale) => {
        const isActive = selectedScale === scale;
        return (
          <Pressable
            key={scale || 'course'}
            style={[
              styles.scaleChip,
              { borderColor: colors.border.default, backgroundColor: colors.background.base },
              isActive && { backgroundColor: colors.primary[500], borderColor: colors.primary[500] },
            ]}
            onPress={() => onChange(scale)}
          >
            <Text
              style={[
                styles.scaleChipText,
                { color: colors.text.secondary },
                isActive && { color: colors.text.onPrimary },
              ]}
            >
              {scale || fromCourseLabel}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
};

const styles = StyleSheet.create({
  scaleRow: { flexDirection: 'row', gap: 6 },
  scaleChip: {
    flex: 1, borderRadius: 8, borderWidth: 1,
    paddingVertical: 8, alignItems: 'center',
  },
  scaleChipText: { fontSize: 11, fontWeight: '700' },
});
