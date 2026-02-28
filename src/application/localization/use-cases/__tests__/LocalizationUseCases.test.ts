import { describe, expect, it } from 'vitest';

import type { LanguagePreferencesRepository } from '@/application/localization/ports/LanguagePreferencesRepository';
import type { WeekStartPreferencesRepository } from '@/application/localization/ports/WeekStartPreferencesRepository';
import { ChangeLanguageUseCase } from '@/application/localization/use-cases/ChangeLanguageUseCase';
import { ChangeWeekStartDayUseCase } from '@/application/localization/use-cases/ChangeWeekStartDayUseCase';
import { GetSelectedLanguageUseCase } from '@/application/localization/use-cases/GetSelectedLanguageUseCase';
import { GetSelectedWeekStartDayUseCase } from '@/application/localization/use-cases/GetSelectedWeekStartDayUseCase';
import { AppLanguage, DEFAULT_APP_LANGUAGE } from '@/domain/localization/AppLanguage';
import { DEFAULT_WEEK_START_DAY, WeekStartDay } from '@/domain/localization/WeekStartDay';

class InMemoryLanguagePreferencesRepository implements LanguagePreferencesRepository {
  constructor(private language: AppLanguage | null = null) {}

  async getSelectedLanguage(): Promise<AppLanguage | null> {
    return this.language;
  }

  async saveSelectedLanguage(language: AppLanguage): Promise<void> {
    this.language = language;
  }
}

class InMemoryWeekStartPreferencesRepository implements WeekStartPreferencesRepository {
  constructor(private weekStartDay: WeekStartDay | null = null) {}

  async getSelectedWeekStartDay(): Promise<WeekStartDay | null> {
    return this.weekStartDay;
  }

  async saveSelectedWeekStartDay(weekStartDay: WeekStartDay): Promise<void> {
    this.weekStartDay = weekStartDay;
  }
}

describe('Localization use cases', () => {
  it('returns default language when nothing is saved', async () => {
    const repository = new InMemoryLanguagePreferencesRepository(null);
    const useCase = new GetSelectedLanguageUseCase(repository);

    expect(await useCase.execute()).toBe(DEFAULT_APP_LANGUAGE);
  });

  it('saves and returns selected language', async () => {
    const repository = new InMemoryLanguagePreferencesRepository();
    const changeUseCase = new ChangeLanguageUseCase(repository);
    const getUseCase = new GetSelectedLanguageUseCase(repository);

    await changeUseCase.execute(AppLanguage.EN);
    expect(await getUseCase.execute()).toBe(AppLanguage.EN);
  });

  it('returns default week start day when nothing is saved', async () => {
    const repository = new InMemoryWeekStartPreferencesRepository(null);
    const useCase = new GetSelectedWeekStartDayUseCase(repository);

    expect(await useCase.execute()).toBe(DEFAULT_WEEK_START_DAY);
  });

  it('saves and returns selected week start day', async () => {
    const repository = new InMemoryWeekStartPreferencesRepository();
    const changeUseCase = new ChangeWeekStartDayUseCase(repository);
    const getUseCase = new GetSelectedWeekStartDayUseCase(repository);

    await changeUseCase.execute(WeekStartDay.SUNDAY);
    expect(await getUseCase.execute()).toBe(WeekStartDay.SUNDAY);
  });
});
