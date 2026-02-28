import type { WeekStartPreferencesRepository } from '@/application/localization/ports/WeekStartPreferencesRepository';
import { DEFAULT_WEEK_START_DAY, type WeekStartDay } from '@/domain/localization/WeekStartDay';

export class GetSelectedWeekStartDayUseCase {
  constructor(private readonly repository: WeekStartPreferencesRepository) {}

  async execute(): Promise<WeekStartDay> {
    const selectedWeekStartDay = await this.repository.getSelectedWeekStartDay();
    return selectedWeekStartDay ?? DEFAULT_WEEK_START_DAY;
  }
}
