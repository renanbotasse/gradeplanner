import { createNativeStackNavigator } from '@react-navigation/native-stack';

import { MainTabsNavigator } from '@/app/navigation/MainTabsNavigator';
import type { RootStackParamList } from '@/app/navigation/types';
import { CourseSettingsScreen } from '@/ui/screens/CourseSettingsScreen';
import { EditAvaliacaoScreen } from '@/ui/screens/EditAvaliacaoScreen';
import { OnboardingTestScreen } from '@/ui/screens/OnboardingTestScreen';
import { SemesterDetailsScreen } from '@/ui/screens/SemesterDetailsScreen';
import { UCDetailsScreen } from '@/ui/screens/UCDetailsScreen';
import { useAthenaTheme } from '@/ui/theme/tokens';

const Stack = createNativeStackNavigator<RootStackParamList>();

export const RootNavigator = () => (
  <RootNavigatorContent />
);

const RootNavigatorContent = () => {
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
      <Stack.Screen name="MainTabs" component={MainTabsNavigator} />
      <Stack.Screen name="OnboardingTest" component={OnboardingTestScreen} />
      <Stack.Screen
        name="SemesterDetails"
        component={SemesterDetailsScreen}
        options={{}}
      />
      <Stack.Screen name="UCDetails" component={UCDetailsScreen} options={{}} />
      <Stack.Screen name="CourseSettings" component={CourseSettingsScreen} options={{}} />
      <Stack.Screen name="AddCourse" component={CourseSettingsScreen} options={{}} />
      <Stack.Screen
        name="EditAvaliacao"
        component={EditAvaliacaoScreen}
        options={{ presentation: 'modal' }}
      />
    </Stack.Navigator>
  );
};
