import AsyncStorage from '@react-native-async-storage/async-storage';

import type { LanguagePreferencesRepository } from '@/application/localization/ports/LanguagePreferencesRepository';
import { AVAILABLE_LANGUAGES, type AppLanguage } from '@/domain/localization/AppLanguage';

const languageStorageKey = '@gradeplanner/language';

export class AsyncStorageLanguagePreferencesRepository implements LanguagePreferencesRepository {
  async getSelectedLanguage(): Promise<AppLanguage | null> {
    const stored = await AsyncStorage.getItem(languageStorageKey);
    if (!stored) return null;
    return AVAILABLE_LANGUAGES.find((language) => language === stored) ?? null;
  }

  async saveSelectedLanguage(language: AppLanguage): Promise<void> {
    await AsyncStorage.setItem(languageStorageKey, language);
  }
}
