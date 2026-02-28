import { useState } from 'react';
import { StyleSheet, Text, TextInput, type TextInputProps, View } from 'react-native';

import { componentSize, radius, spacing, typography } from '@/ui/theme/foundation';
import { useAthenaTheme } from '@/ui/theme/tokens';

interface AppInputProps extends Omit<TextInputProps, 'style'> {
  label?: string;
  helperText?: string;
  errorText?: string;
}

export const AppInput = ({
  label,
  helperText,
  errorText,
  multiline,
  numberOfLines,
  ...props
}: AppInputProps) => {
  const { colors } = useAthenaTheme();
  const [focused, setFocused] = useState(false);

  const hasError = !!errorText;

  return (
    <View style={styles.wrapper}>
      {label ? <Text style={[styles.label, { color: colors.text.secondary }]}>{label}</Text> : null}

      <TextInput
        {...props}
        multiline={multiline}
        numberOfLines={numberOfLines}
        onFocus={(event) => {
          setFocused(true);
          props.onFocus?.(event);
        }}
        onBlur={(event) => {
          setFocused(false);
          props.onBlur?.(event);
        }}
        placeholderTextColor={colors.text.tertiary}
        style={[
          styles.input,
          {
            color: colors.text.primary,
            backgroundColor: colors.background.base,
            borderColor: hasError
              ? colors.danger.base
              : focused
              ? colors.primary[500]
              : colors.border.default,
            minHeight: multiline ? componentSize.inputHeight * 2 : componentSize.inputHeight,
            textAlignVertical: multiline ? 'top' : 'center',
          },
        ]}
      />

      {hasError ? (
        <Text style={[styles.feedback, { color: colors.danger.base }]}>{errorText}</Text>
      ) : helperText ? (
        <Text style={[styles.feedback, { color: colors.text.tertiary }]}>{helperText}</Text>
      ) : null}
    </View>
  );
};

const styles = StyleSheet.create({
  wrapper: {
    gap: spacing.xxs,
  },
  label: {
    ...typography.caption,
  },
  input: {
    borderWidth: 1,
    borderRadius: radius.md,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    ...typography.body,
  },
  feedback: {
    ...typography.caption,
  },
});
