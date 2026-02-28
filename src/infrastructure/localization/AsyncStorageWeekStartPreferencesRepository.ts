import AsyncStorage from '@react-native-async-storage/async-storage';

import type { WeekStartPreferencesRepository } from '@/application/localization/ports/WeekStartPreferencesRepository';
import { AVAILABLE_WEEK_START_DAYS, type WeekStartDay } from '@/domain/localization/WeekStartDay';

const weekStartStorageKey = '@gradeplanner/week-start-day';

export class AsyncStorageWeekStartPreferencesRepository implements WeekStartPreferencesRepository {
  async getSelectedWeekStartDay(): Promise<WeekStartDay | null> {
    const stored = await AsyncStorage.getItem(weekStartStorageKey);
    if (!stored) return null;
    const parsed = Number(stored);
    return AVAILABLE_WEEK_START_DAYS.find((day) => day === parsed) ?? null;
  }

  async saveSelectedWeekStartDay(weekStartDay: WeekStartDay): Promise<void> {
    await AsyncStorage.setItem(weekStartStorageKey, String(weekStartDay));
  }
}
