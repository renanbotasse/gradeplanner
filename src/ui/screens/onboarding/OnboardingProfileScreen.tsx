import { useEffect, useMemo, useState } from 'react';
import { Alert, StyleSheet, Text } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';

import type { OnboardingStackParamList } from '@/app/navigation/OnboardingNavigator';
import { useSaveProfile, useUserProfile } from '@/features/settings/hooks';
import { useAppPreferences } from '@/presentation/providers/AppPreferencesProvider';
import { AppButton, AppInput } from '@/ui/components/primitives';
import { Screen } from '@/ui/components/Screen';
import { OnboardingTopHeader } from '@/ui/screens/onboarding/OnboardingTopHeader';
import { spacing, typography } from '@/ui/theme/foundation';
import { useAthenaTheme, type AthenaColors } from '@/ui/theme/tokens';

type Props = NativeStackScreenProps<OnboardingStackParamList, 'OnboardingProfile'>;

export const OnboardingProfileScreen = ({ navigation }: Props) => {
  const { colors } = useAthenaTheme();
  const { t } = useAppPreferences();
  const styles = useMemo(() => createStyles(colors), [colors]);
  const profileQuery = useUserProfile();
  const saveProfile = useSaveProfile();

  const [name, setName] = useState('');

  useEffect(() => {
    if (!profileQuery.data) return;
    if (profileQuery.data.name && profileQuery.data.name !== 'Student') {
      setName(profileQuery.data.name);
    }
  }, [profileQuery.data]);

  const onNext = async () => {
    if (!name.trim()) {
      Alert.alert(t('common.error'), t('onboarding.profile.error.nameRequired'));
      return;
    }

    try {
      await saveProfile.mutateAsync({
        name: name.trim(),
        photoUri: profileQuery.data?.photoUri ?? null,
      });
      navigation.navigate('OnboardingCourse');
    } catch {
      Alert.alert(t('common.error'), t('settings.saveProfile.error'));
    }
  };

  return (
    <Screen>
      <OnboardingTopHeader />

      <Text style={styles.step}>{t('onboarding.profile.step')}</Text>
      <Text style={styles.title}>{t('onboarding.profile.title')}</Text>
      <Text style={styles.subtitle}>{t('onboarding.profile.subtitle')}</Text>

      <AppInput
        label={t('settings.profile.nameLabel')}
        value={name}
        onChangeText={setName}
        placeholder={t('settings.profile.namePlaceholder')}
        autoCapitalize="words"
        returnKeyType="next"
      />

      <AppButton
        label={saveProfile.isPending ? t('onboarding.common.creating') : t('onboarding.common.next')}
        icon="arrow-forward"
        size="lg"
        onPress={() => {
          void onNext();
        }}
        loading={saveProfile.isPending}
        disabled={saveProfile.isPending}
      />
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
      marginBottom: spacing.md,
    },
  });
