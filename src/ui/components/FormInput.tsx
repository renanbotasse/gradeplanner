import { StyleSheet, Text, TextInput, View } from 'react-native';
import { useAthenaTheme } from '@/ui/theme/tokens';

interface FormInputProps {
  label: string;
  value: string;
  onChangeText: (v: string) => void;
  multiline?: boolean;
  keyboardType?: 'default' | 'decimal-pad' | 'numbers-and-punctuation';
  placeholder?: string;
}

export const FormInput = ({
  label,
  value,
  onChangeText,
  multiline = false,
  keyboardType = 'default',
  placeholder,
}: FormInputProps) => {
  const { colors } = useAthenaTheme();

  return (
    <View style={styles.formField}>
      <Text style={[styles.formFieldLabel, { color: colors.text.secondary }]}>{label}</Text>
      <TextInput
        style={[
          styles.formInput,
          { borderColor: colors.border.default, color: colors.text.primary, backgroundColor: colors.background.base },
          multiline ? styles.formInputMultiline : styles.formInputSingle,
        ]}
        value={value}
        onChangeText={onChangeText}
        placeholderTextColor={colors.text.tertiary}
        multiline={multiline}
        numberOfLines={multiline ? 3 : 1}
        keyboardType={keyboardType}
        placeholder={placeholder}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  formField: { gap: 4, marginBottom: 10 },
  formFieldLabel: { fontSize: 13, fontWeight: '700' },
  formInput: {
    borderRadius: 10,
    borderWidth: 1,
    paddingHorizontal: 10,
    fontSize: 14,
  },
  formInputSingle: { height: 42 },
  formInputMultiline: { minHeight: 66, textAlignVertical: 'top', paddingTop: 10 },
});
