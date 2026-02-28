import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';

import type { OnboardingStackParamList } from '@/app/navigation/OnboardingNavigator';
import { useAppPreferences } from '@/presentation/providers/AppPreferencesProvider';
import { AppHeader } from '@/presentation/widgets/app_header';

interface OnboardingTopHeaderProps {
  canGoBack?: boolean;
}

export const OnboardingTopHeader = ({ canGoBack = true }: OnboardingTopHeaderProps) => {
  const navigation = useNavigation<NativeStackNavigationProp<OnboardingStackParamList>>();
  const { t } = useAppPreferences();

  return (
    <AppHeader
      title={t('onboarding.header.title')}
      leftActionIcon={canGoBack ? 'arrow-back' : undefined}
      onLeftActionPress={canGoBack ? () => navigation.goBack() : undefined}
    />
  );
};
