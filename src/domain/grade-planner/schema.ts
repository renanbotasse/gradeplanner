import type { IconTheme } from '@/domain/icon/IconTheme';
import type { AppLanguage } from '@/domain/localization/AppLanguage';

export type EntityId = string;
export type ISODateString = string; // YYYY-MM-DD
export type ISODateTimeString = string; // ISO 8601

export type GradeScale = '0-20' | '0-10' | '0-100';
export type SemesterStatus = 'atual' | 'passado' | 'futuro';
export type ActivityType = 'evaluation' | 'study_task' | 'event';
export type ActivityStatus = 'planned' | 'in_progress' | 'completed' | 'cancelled';
export type EvaluationCategory =
  | 'exam'
  | 'project'
  | 'quiz'
  | 'assignment'
  | 'lab'
  | 'participation'
  | 'other';

export interface DateRange {
  startDate: ISODateString;
  endDate: ISODateString;
}

export interface ScoreValueObject {
  value: number;
  scale: GradeScale;
}

export interface WeightValueObject {
  percentage: number; // 0..100
}

export interface GradeRecord {
  score: ScoreValueObject | null;
  weight: WeightValueObject;
  pointsPossible: number | null;
}

export interface NotificationSettings {
  enabled: boolean;
  timezone: string;
  reminderMinutes: number[];
  dailyDigestHour: number;
}

export interface AppIconPreferences {
  selectedVariant: IconTheme;
  availableVariants: IconTheme[];
  applyToLauncherIcon: boolean;
}

export interface UserProfile {
  id: EntityId;
  displayName: string;
  email: string;
  language: AppLanguage;
  timezone: string;
  defaultGradeScale: GradeScale;
  defaultMinimumPassingGrade: number;
  themeMode: 'light' | 'dark' | 'system';
}

export interface Course {
  id: EntityId;
  userId: EntityId;
  code: string;
  name: string;
  institution: string;
  gradeScale: GradeScale;
  minimumPassingGrade: number;
  startDate: ISODateString;
  expectedEndDate: ISODateString;
  active: boolean;
}

export interface Semester {
  id: EntityId;
  courseId: EntityId;
  title: string;
  yearLabel: string;
  dateRange: DateRange;
  status: SemesterStatus;
  notes: string | null;
}

export interface UCAssessmentSystem {
  gradeScale: GradeScale;
  minimumPassingGrade: number;
  inheritedFromCourse: boolean;
}

export interface UC {
  id: EntityId;
  courseId: EntityId;
  semesterId: EntityId;
  code: string;
  name: string;
  ects: number;
  teachers: string[];
  notes: string | null;
  assessmentSystem: UCAssessmentSystem;
}

export interface ActivityBase {
  id: EntityId;
  type: ActivityType;
  title: string;
  description: string | null;
  dueAt: ISODateTimeString;
  createdAt: ISODateTimeString;
  updatedAt: ISODateTimeString;
  status: ActivityStatus;
  semesterId: EntityId;
  ucId: EntityId | null;
  canAffectGrade: boolean;
  grade: GradeRecord | null;
  reminders: number[];
}

export interface EvaluationActivity extends ActivityBase {
  type: 'evaluation';
  ucId: EntityId;
  evaluationCategory: EvaluationCategory;
}

export interface StudyActivity extends ActivityBase {
  type: 'study_task';
  objective: string;
}

export interface EventActivity extends ActivityBase {
  type: 'event';
  location: string | null;
}

export type Activity = EvaluationActivity | StudyActivity | EventActivity;

export interface UcProgressStats {
  ucId: EntityId;
  partialAverage: number | null;
  gradedWeight: number;
  remainingWeight: number;
  completedEvaluations: number;
  totalEvaluations: number;
  completionPercent: number;
  nextDeadlineAt: ISODateTimeString | null;
}

export interface SemesterProgressStats {
  semesterId: EntityId;
  semesterAverage: number | null;
  totalEcts: number;
  completedEcts: number;
  completionPercent: number;
  completedEvaluations: number;
  totalEvaluations: number;
}

export interface CourseProgressStats {
  courseId: EntityId;
  courseAverage: number | null;
  totalEcts: number;
  completedEcts: number;
  completionPercent: number;
}

export interface UpcomingDeadline {
  activityId: EntityId;
  type: ActivityType;
  title: string;
  dueAt: ISODateTimeString;
  semesterId: EntityId;
  ucId: EntityId | null;
}

export interface GradePlannerDataModel {
  generatedAt: ISODateTimeString;
  userProfile: UserProfile;
  notificationSettings: NotificationSettings;
  appIconPreferences: AppIconPreferences;
  courses: Course[];
  semesters: Semester[];
  ucs: UC[];
  activities: Activity[];
}
