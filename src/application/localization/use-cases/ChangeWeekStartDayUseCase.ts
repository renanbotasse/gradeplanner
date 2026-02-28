import type { WeekStartPreferencesRepository } from '@/application/localization/ports/WeekStartPreferencesRepository';
import type { WeekStartDay } from '@/domain/localization/WeekStartDay';

export class ChangeWeekStartDayUseCase {
  constructor(private readonly repository: WeekStartPreferencesRepository) {}

  async execute(weekStartDay: WeekStartDay): Promise<WeekStartDay> {
    await this.repository.saveSelectedWeekStartDay(weekStartDay);
    return weekStartDay;
  }
}
