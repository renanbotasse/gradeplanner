import type { AppLanguage } from '@/domain/localization/AppLanguage';

export interface LanguagePreferencesRepository {
  getSelectedLanguage(): Promise<AppLanguage | null>;
  saveSelectedLanguage(language: AppLanguage): Promise<void>;
}
