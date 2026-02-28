import { useMemo } from 'react';
import { Image, Pressable, StyleSheet, Text, View } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { MaterialIcons } from '@expo/vector-icons';

import type { OnboardingStackParamList } from '@/app/navigation/OnboardingNavigator';
import { useAppPreferences } from '@/presentation/providers/AppPreferencesProvider';
import { getHeaderIconAsset } from '@/presentation/widgets/app_header/headerAssets';
import { Screen } from '@/ui/components/Screen';
import { OnboardingTopHeader } from '@/ui/screens/onboarding/OnboardingTopHeader';
import { athenaRadius, useAthenaTheme, type AthenaColors, type AthenaThemeMode } from '@/ui/theme/tokens';

type Props = NativeStackScreenProps<OnboardingStackParamList, 'OnboardingWelcome'>;

export const OnboardingWelcomeScreen = ({ navigation }: Props) => {
  const { colors, mode } = useAthenaTheme();
  const { iconTheme, t } = useAppPreferences();
  const styles = useMemo(() => createStyles(colors, mode), [colors, mode]);

  return (
    <Screen contentContainerStyle={styles.screenContent}>
      <OnboardingTopHeader canGoBack={false} />

      <View style={styles.heroCard}>
        <View style={styles.logoBox}>
          <Image source={getHeaderIconAsset(iconTheme)} style={styles.logoImage} resizeMode="contain" />
        </View>
        <Text style={styles.heroTitle}>GradePlanner</Text>
        <View style={styles.heroUnderline} />
      </View>

      <View style={styles.textBlock}>
        <Text style={styles.title}>{t('onboarding.welcome.title')}</Text>
        <Text style={styles.subtitle}>{t('onboarding.welcome.subtitle')}</Text>
      </View>

      <View style={styles.tagsRow}>
        <View style={styles.tag}>
          <MaterialIcons name="analytics" size={14} color={colors.text.secondary} />
          <Text style={styles.tagText}>{t('onboarding.welcome.tag.grades')}</Text>
        </View>
        <View style={styles.tag}>
          <MaterialIcons name="event-note" size={14} color={colors.text.secondary} />
          <Text style={styles.tagText}>{t('onboarding.welcome.tag.semesters')}</Text>
        </View>
        <View style={styles.tag}>
          <MaterialIcons name="trending-up" size={14} color={colors.text.secondary} />
          <Text style={styles.tagText}>{t('onboarding.welcome.tag.progress')}</Text>
        </View>
      </View>

      <Pressable style={styles.primaryButton} onPress={() => navigation.navigate('OnboardingPrivacy')}>
        <Text style={styles.primaryButtonText}>{t('onboarding.welcome.start')}</Text>
        <MaterialIcons name="arrow-forward" size={20} color={colors.text.onPrimary} />
      </Pressable>

      <Text style={styles.termsText}>GradePlanner · v0.6</Text>
    </Screen>
  );
};

const createStyles = (colors: AthenaColors, mode: AthenaThemeMode) =>
  StyleSheet.create({
  screenContent: {
    justifyContent: 'space-between',
    paddingBottom: 28,
    paddingTop: 20,
  },
  heroCard: {
    alignItems: 'center',
    backgroundColor: colors.background.surface,
    borderRadius: 34,
    borderWidth: 1,
    borderColor: colors.border.default,
    paddingVertical: 28,
    shadowColor: colors.text.primary,
    shadowOpacity: 0.1,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 8 },
    elevation: 3,
  },
  logoBox: {
    backgroundColor: colors.primary[500],
    borderRadius: 24,
    height: 88,
    width: 88,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: colors.primary[500],
    shadowOpacity: 0.35,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 6 },
    elevation: 3,
  },
  logoImage: {
    width: 58,
    height: 58,
  },
  heroTitle: {
    marginTop: 16,
    fontSize: 39,
    fontWeight: '800',
    color: colors.primary[500],
  },
  heroUnderline: {
    marginTop: 8,
    height: 4,
    width: 58,
    borderRadius: 999,
    backgroundColor: mode === 'dark' ? colors.primary[600] : colors.primary[300],
  },
  textBlock: {
    marginTop: 18,
    gap: 10,
  },
  title: {
    fontSize: 48,
    lineHeight: 56,
    textAlign: 'center',
    fontWeight: '800',
    color: colors.text.primary,
  },
  titleAccent: {
    color: colors.primary[500],
  },
  subtitle: {
    textAlign: 'center',
    color: colors.text.secondary,
    fontSize: 20,
    lineHeight: 30,
    paddingHorizontal: 8,
  },
  tagsRow: {
    flexDirection: 'row',
    gap: 8,
    justifyContent: 'center',
    marginTop: 6,
  },
  tag: {
    flexDirection: 'row',
    gap: 4,
    alignItems: 'center',
    backgroundColor: colors.background.elevated,
    borderRadius: athenaRadius.pill,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  tagText: {
    color: colors.text.secondary,
    fontWeight: '700',
    fontSize: 12,
  },
  primaryButton: {
    marginTop: 18,
    height: 62,
    borderRadius: 20,
    backgroundColor: colors.primary[500],
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
    shadowColor: colors.primary[500],
    shadowOpacity: 0.3,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 6 },
    elevation: 3,
  },
  primaryButtonText: {
    color: colors.text.onPrimary,
    fontSize: 24,
    fontWeight: '800',
  },
  termsText: {
    textAlign: 'center',
    color: colors.text.tertiary,
    fontSize: 13,
    marginTop: 12,
  },
  });
