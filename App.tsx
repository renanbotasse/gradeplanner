import { useEffect, useState } from 'react';
import { ActivityIndicator, StyleSheet, View } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ThemeProvider } from '@rneui/themed';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import AsyncStorage from '@react-native-async-storage/async-storage';

import { OnboardingNavigator } from '@/app/navigation/OnboardingNavigator';
import { RootNavigator } from '@/app/navigation/RootNavigator';
import { athenaRepository } from '@/db/repositories/athenaRepository';
import { AppPreferencesProvider } from '@/presentation/providers/AppPreferencesProvider';
import { buildAppTheme, buildNavigationTheme } from '@/shared/theme';
import { AthenaThemeProvider, useAthenaTheme } from '@/ui/theme/tokens';

const onboardingStorageKey = '@grade_planner_onboarding_complete';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

const Bootstrap = () => {
  const { colors } = useAthenaTheme();
  const [ready, setReady] = useState(false);
  const [onboardingComplete, setOnboardingComplete] = useState<boolean>(false);

  useEffect(() => {
    const initialize = async () => {
      await athenaRepository.initializeDefaults();
      const stored = await AsyncStorage.getItem(onboardingStorageKey);
      setOnboardingComplete(stored === '1');
      setReady(true);
    };

    initialize().catch((error) => {
      console.error('GradePlanner bootstrap error:', error);
      setReady(true);
    });
  }, []);

  if (!ready) {
    return (
      <View style={[styles.loading, { backgroundColor: colors.background.base }]}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  const markOnboardingComplete = async () => {
    await AsyncStorage.setItem(onboardingStorageKey, '1');
    setOnboardingComplete(true);
  };

  if (!onboardingComplete) {
    return (
      <OnboardingNavigator
        onComplete={() => {
          markOnboardingComplete().catch((error) => {
            console.error('Failed to persist onboarding flag:', error);
          });
        }}
      />
    );
  }

  return <RootNavigator />;
};

const AppContent = () => {
  const { mode } = useAthenaTheme();
  const appTheme = buildAppTheme(mode);
  const navigationTheme = buildNavigationTheme(mode);

  return (
    <ThemeProvider theme={appTheme}>
      <QueryClientProvider client={queryClient}>
        <NavigationContainer theme={navigationTheme}>
          <StatusBar style={mode === 'dark' ? 'light' : 'dark'} />
          <Bootstrap />
        </NavigationContainer>
      </QueryClientProvider>
    </ThemeProvider>
  );
};

export default function App() {
  return (
    <GestureHandlerRootView style={styles.root}>
      <SafeAreaProvider>
        <AthenaThemeProvider>
          <AppPreferencesProvider>
            <AppContent />
          </AppPreferencesProvider>
        </AthenaThemeProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
  loading: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
