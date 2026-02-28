import type { WeekStartDay } from '@/domain/localization/WeekStartDay';

export interface WeekStartPreferencesRepository {
  getSelectedWeekStartDay(): Promise<WeekStartDay | null>;
  saveSelectedWeekStartDay(weekStartDay: WeekStartDay): Promise<void>;
}
