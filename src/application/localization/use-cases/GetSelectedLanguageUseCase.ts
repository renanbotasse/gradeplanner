import type { LanguagePreferencesRepository } from '@/application/localization/ports/LanguagePreferencesRepository';
import type { AppLanguage } from '@/domain/localization/AppLanguage';
import { detectSystemLanguage } from '@/utils/locale';

export class GetSelectedLanguageUseCase {
  constructor(private readonly repository: LanguagePreferencesRepository) {}

  async execute(): Promise<AppLanguage> {
    const selectedLanguage = await this.repository.getSelectedLanguage();
    return selectedLanguage ?? detectSystemLanguage();
  }
}
