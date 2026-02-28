import { MaterialIcons } from '@expo/vector-icons';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';

import type { MainTabsParamList } from '@/app/navigation/types';
import { useAppPreferences } from '@/presentation/providers/AppPreferencesProvider';
import { ActivitiesScreen } from '@/ui/screens/ActivitiesScreen';
import { CalendarScreen } from '@/ui/screens/CalendarScreen';
import { DashboardScreen } from '@/ui/screens/DashboardScreen';
import { SemestersScreen } from '@/ui/screens/SemestersScreen';
import { SettingsScreen } from '@/ui/screens/SettingsScreen';
import { useAthenaTheme } from '@/ui/theme/tokens';

const Tab = createBottomTabNavigator<MainTabsParamList>();

const tabIconMap: Record<keyof MainTabsParamList, keyof typeof MaterialIcons.glyphMap> = {
  Home: 'dashboard',
  Semestres: 'menu-book',
  Calendario: 'calendar-month',
  Atividades: 'alarm',
  Definicoes: 'person',
};

export const MainTabsNavigator = () => (
  <MainTabsContent />
);

const MainTabsContent = () => {
  const { colors } = useAthenaTheme();
  const { t } = useAppPreferences();

  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarActiveTintColor: colors.primary[500],
        tabBarInactiveTintColor: colors.text.tertiary,
        tabBarStyle: {
          height: 72,
          paddingTop: 8,
          paddingBottom: 10,
          backgroundColor: colors.background.surface,
          borderTopColor: colors.border.default,
        },
        tabBarLabelStyle: {
          fontSize: 11,
          fontWeight: '700',
        },
        tabBarIcon: ({ color, size }) => (
          <MaterialIcons name={tabIconMap[route.name]} size={size ?? 22} color={color} />
        ),
      })}
    >
      <Tab.Screen name="Home" component={DashboardScreen} options={{ title: t('tab.home') }} />
      <Tab.Screen name="Semestres" component={SemestersScreen} options={{ title: t('tab.semesters') }} />
      <Tab.Screen name="Calendario" component={CalendarScreen} options={{ title: t('tab.calendar') }} />
      <Tab.Screen name="Atividades" component={ActivitiesScreen} options={{ title: t('tab.deadlines') }} />
      <Tab.Screen name="Definicoes" component={SettingsScreen} options={{ title: t('tab.profile') }} />
    </Tab.Navigator>
  );
};
