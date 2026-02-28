import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';

import { OnboardingNavigator } from '@/app/navigation/OnboardingNavigator';
import type { RootStackParamList } from '@/app/navigation/types';

export const OnboardingTestScreen = () => {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();

  return (
    <OnboardingNavigator
      onComplete={() => {
        navigation.goBack();
      }}
    />
  );
};
