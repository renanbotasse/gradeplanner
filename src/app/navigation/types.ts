import type { NavigatorScreenParams } from '@react-navigation/native';

export type MainTabsParamList = {
  Home: undefined;
  Semestres: undefined;
  Calendario: {
    date?: string;
    editEventId?: number;
    requestAt?: number;
  } | undefined;
  Atividades: undefined;
  Definicoes: undefined;
};

export type RootStackParamList = {
  MainTabs: NavigatorScreenParams<MainTabsParamList> | undefined;
  OnboardingTest: undefined;
  SemesterDetails: {
    semesterId: number;
    semesterTitle: string;
  };
  UCDetails: {
    ucId: number;
    semesterId: number;
  };
  EditAvaliacao: {
    ucId: number;
    semesterId: number;
    avaliacaoId?: number;
  };
  CourseSettings: undefined;
  AddCourse: undefined;
};
