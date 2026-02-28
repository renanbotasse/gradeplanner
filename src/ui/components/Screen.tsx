import { PropsWithChildren, useMemo } from 'react';
import { KeyboardAvoidingView, Platform, ScrollView, StyleProp, StyleSheet, View, ViewStyle } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { useAthenaTheme, type AthenaColors } from '@/ui/theme/tokens';

interface ScreenProps extends PropsWithChildren {
  scroll?: boolean;
  contentContainerStyle?: StyleProp<ViewStyle>;
}

export const Screen = ({ children, scroll = true, contentContainerStyle }: ScreenProps) => {
  const { colors } = useAthenaTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);

  if (!scroll) {
    return (
      <SafeAreaView style={styles.safe} edges={['top']}>
        <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={styles.root}>
          <View style={[styles.inner, contentContainerStyle]}>{children}</View>
        </KeyboardAvoidingView>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={styles.root}>
        <ScrollView contentContainerStyle={[styles.content, contentContainerStyle]} keyboardShouldPersistTaps="handled">
          <View style={styles.inner}>{children}</View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const createStyles = (colors: AthenaColors) =>
  StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: colors.background.base,
  },
  root: {
    flex: 1,
    backgroundColor: colors.background.base,
  },
  content: {
    flexGrow: 1,
  },
  inner: {
    gap: 14,
    padding: 16,
  },
  });
