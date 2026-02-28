import AsyncStorage from '@react-native-async-storage/async-storage';

import type { IconPreferencesRepository } from '@/application/icon/ports/IconPreferencesRepository';
import { AVAILABLE_ICON_THEMES, type IconTheme } from '@/domain/icon/IconTheme';

const iconThemeStorageKey = '@gradeplanner/icon_theme';

export class AsyncStorageIconPreferencesRepository implements IconPreferencesRepository {
  async getSelectedIconTheme(): Promise<IconTheme | null> {
    const stored = await AsyncStorage.getItem(iconThemeStorageKey);
    if (!stored) return null;
    return AVAILABLE_ICON_THEMES.find((theme) => theme === stored) ?? null;
  }

  async saveSelectedIconTheme(theme: IconTheme): Promise<void> {
    await AsyncStorage.setItem(iconThemeStorageKey, theme);
  }
}
