import { useMemo } from 'react';
import { Linking, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';

import type { OnboardingStackParamList } from '@/app/navigation/OnboardingNavigator';
import { useAppPreferences } from '@/presentation/providers/AppPreferencesProvider';
import { Screen } from '@/ui/components/Screen';
import { OnboardingTopHeader } from '@/ui/screens/onboarding/OnboardingTopHeader';
import { radius, spacing, typography } from '@/ui/theme/foundation';
import { useAthenaTheme, type AthenaColors } from '@/ui/theme/tokens';

type Props = NativeStackScreenProps<OnboardingStackParamList, 'OnboardingPrivacy'>;

const PRIVACY_POLICY_URL = 'https://blazeraven.github.io/gradeplanner-privacy/';

const BULLETS: Array<{ icon: keyof typeof MaterialIcons.glyphMap; key: keyof ReturnType<typeof useAppPreferences>['t'] extends never ? string : string }> = [
  { icon: 'smartphone', key: 'onboarding.privacy.bullet.local' },
  { icon: 'no-accounts', key: 'onboarding.privacy.bullet.noLogin' },
  { icon: 'cloud-off', key: 'onboarding.privacy.bullet.noServer' },
  { icon: 'visibility-off', key: 'onboarding.privacy.bullet.noTracking' },
  { icon: 'group-off', key: 'onboarding.privacy.bullet.noSharing' },
];

export const OnboardingPrivacyScreen = ({ navigation }: Props) => {
  const { colors } = useAthenaTheme();
  const { t } = useAppPreferences();
  const styles = useMemo(() => createStyles(colors), [colors]);

  const openPolicy = async () => {
    const supported = await Linking.canOpenURL(PRIVACY_POLICY_URL);
    if (supported) await Linking.openURL(PRIVACY_POLICY_URL);
  };

  return (
    <Screen>
      <OnboardingTopHeader canGoBack={false} />

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>
        {/* Hero */}
        <View style={styles.heroRow}>
          <View style={styles.shieldWrap}>
            <MaterialIcons name="shield" size={36} color={colors.primary[500]} />
          </View>
          <View style={styles.heroTexts}>
            <Text style={styles.title}>{t('onboarding.privacy.title')}</Text>
            <Text style={styles.subtitle}>{t('onboarding.privacy.subtitle')}</Text>
          </View>
        </View>

        {/* Bullets */}
        <View style={styles.bulletCard}>
          {BULLETS.map(({ icon, key }) => (
            <View key={key} style={styles.bulletRow}>
              <View style={styles.bulletIconWrap}>
                <MaterialIcons name={icon} size={18} color={colors.primary[500]} />
              </View>
              <Text style={styles.bulletText}>{t(key as Parameters<typeof t>[0])}</Text>
            </View>
          ))}
        </View>

        {/* Warning */}
        <View style={styles.warningCard}>
          <MaterialIcons name="warning-amber" size={18} color={colors.warning.base} />
          <Text style={styles.warningText}>{t('onboarding.privacy.warning')}</Text>
        </View>

        {/* Future note */}
        <View style={styles.futureCard}>
          <MaterialIcons name="schedule" size={18} color={colors.text.secondary} />
          <Text style={styles.futureText}>{t('onboarding.privacy.future')}</Text>
        </View>

        {/* Consent + Policy link */}
        <Text style={styles.consentText}>{t('onboarding.privacy.consent')}</Text>
        <Pressable onPress={() => void openPolicy()}>
          <Text style={styles.policyLink}>{t('onboarding.privacy.policy')} →</Text>
        </Pressable>
      </ScrollView>

      {/* CTA */}
      <Pressable style={styles.continueButton} onPress={() => navigation.navigate('OnboardingProfile')}>
        <Text style={styles.continueText}>{t('onboarding.privacy.continue')}</Text>
        <MaterialIcons name="arrow-forward" size={20} color={colors.text.onPrimary} />
      </Pressable>
    </Screen>
  );
};

const createStyles = (colors: AthenaColors) =>
  StyleSheet.create({
    scroll: {
      gap: spacing.sm,
      paddingBottom: spacing.md,
    },
    heroRow: {
      flexDirection: 'row',
      alignItems: 'flex-start',
      gap: spacing.sm,
      paddingTop: spacing.xs,
    },
    shieldWrap: {
      width: 56,
      height: 56,
      borderRadius: radius.lg,
      backgroundColor: colors.info.soft,
      alignItems: 'center',
      justifyContent: 'center',
      borderWidth: 1,
      borderColor: colors.border.default,
      flexShrink: 0,
    },
    heroTexts: {
      flex: 1,
      gap: spacing.xxs,
    },
    title: {
      ...typography.h2,
      color: colors.text.primary,
    },
    subtitle: {
      ...typography.body,
      color: colors.text.secondary,
    },
    bulletCard: {
      borderRadius: radius.lg,
      borderWidth: 1,
      borderColor: colors.border.default,
      backgroundColor: colors.background.surface,
      padding: spacing.sm,
      gap: spacing.xs,
    },
    bulletRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: spacing.xs,
    },
    bulletIconWrap: {
      width: 32,
      height: 32,
      borderRadius: radius.md,
      backgroundColor: colors.info.soft,
      alignItems: 'center',
      justifyContent: 'center',
      flexShrink: 0,
    },
    bulletText: {
      ...typography.body,
      color: colors.text.primary,
      flex: 1,
    },
    warningCard: {
      flexDirection: 'row',
      alignItems: 'flex-start',
      gap: spacing.xs,
      borderRadius: radius.lg,
      borderWidth: 1,
      borderColor: colors.warning.soft,
      backgroundColor: colors.warning.soft,
      padding: spacing.sm,
    },
    warningText: {
      ...typography.caption,
      color: colors.text.primary,
      flex: 1,
    },
    futureCard: {
      flexDirection: 'row',
      alignItems: 'flex-start',
      gap: spacing.xs,
      borderRadius: radius.lg,
      borderWidth: 1,
      borderColor: colors.border.default,
      backgroundColor: colors.background.surface,
      padding: spacing.sm,
    },
    futureText: {
      ...typography.caption,
      color: colors.text.secondary,
      flex: 1,
    },
    consentText: {
      ...typography.caption,
      color: colors.text.tertiary,
      textAlign: 'center',
    },
    policyLink: {
      ...typography.caption,
      color: colors.primary[500],
      textAlign: 'center',
      textDecorationLine: 'underline',
    },
    continueButton: {
      height: 54,
      borderRadius: radius.xl,
      backgroundColor: colors.primary[500],
      flexDirection: 'row',
      justifyContent: 'center',
      alignItems: 'center',
      gap: spacing.xs,
      marginTop: spacing.sm,
    },
    continueText: {
      ...typography.bodyStrong,
      color: colors.text.onPrimary,
      fontSize: 18,
    },
  });
