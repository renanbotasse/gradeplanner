import { createNativeStackNavigator } from '@react-navigation/native-stack';

import { OnboardingWelcomeScreen } from '@/ui/screens/onboarding/OnboardingWelcomeScreen';
import { OnboardingPrivacyScreen } from '@/ui/screens/onboarding/OnboardingPrivacyScreen';
import { OnboardingProfileScreen } from '@/ui/screens/onboarding/OnboardingProfileScreen';
import { OnboardingCourseScreen } from '@/ui/screens/onboarding/OnboardingCourseScreen';
import { OnboardingSemesterScreen } from '@/ui/screens/onboarding/OnboardingSemesterScreen';
import { OnboardingUCsScreen } from '@/ui/screens/onboarding/OnboardingUCsScreen';
import { OnboardingAssessmentsScreen } from '@/ui/screens/onboarding/OnboardingAssessmentsScreen';
import { useAthenaTheme } from '@/ui/theme/tokens';

export type OnboardingStackParamList = {
  OnboardingWelcome: undefined;
  OnboardingPrivacy: undefined;
  OnboardingProfile: undefined;
  OnboardingCourse: undefined;
  OnboardingSemester: { cursoId: number };
  OnboardingUCs: { semesterId: number; cursoId: number };
  OnboardingAssessments: { semesterId: number; ucIds: number[] };
};

interface OnboardingNavigatorProps {
  onComplete: () => void;
}

const Stack = createNativeStackNavigator<OnboardingStackParamList>();

export const OnboardingNavigator = ({ onComplete }: OnboardingNavigatorProps) => (
  <OnboardingNavigatorContent onComplete={onComplete} />
);

const OnboardingNavigatorContent = ({ onComplete }: OnboardingNavigatorProps) => {
  const { colors } = useAthenaTheme();

  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
        contentStyle: {
          backgroundColor: colors.background.base,
        },
      }}
    >
      <Stack.Screen name="OnboardingWelcome" component={OnboardingWelcomeScreen} />
      <Stack.Screen name="OnboardingPrivacy" component={OnboardingPrivacyScreen} />
      <Stack.Screen name="OnboardingProfile" component={OnboardingProfileScreen} />
      <Stack.Screen name="OnboardingCourse" component={OnboardingCourseScreen} />
      <Stack.Screen name="OnboardingSemester" component={OnboardingSemesterScreen} />
      <Stack.Screen name="OnboardingUCs" component={OnboardingUCsScreen} />
      <Stack.Screen name="OnboardingAssessments">
        {(props) => <OnboardingAssessmentsScreen {...props} onComplete={onComplete} />}
      </Stack.Screen>
    </Stack.Navigator>
  );
};
