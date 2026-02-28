import type { LanguagePreferencesRepository } from '@/application/localization/ports/LanguagePreferencesRepository';
import type { AppLanguage } from '@/domain/localization/AppLanguage';

export class ChangeLanguageUseCase {
  constructor(private readonly repository: LanguagePreferencesRepository) {}

  async execute(language: AppLanguage): Promise<AppLanguage> {
    await this.repository.saveSelectedLanguage(language);
    return language;
  }
}
