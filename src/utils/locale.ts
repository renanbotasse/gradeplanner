import { getLocales } from 'expo-localization';
import { AppLanguage } from '@/domain/localization/AppLanguage';

/**
 * Detects the device's system locale and maps it to a supported AppLanguage.
 *
 * Priority:
 *   pt-BR  → AppLanguage.PT_BR
 *   pt-*   → AppLanguage.PT_PT  (pt-PT, pt, etc.)
 *   other  → AppLanguage.EN
 *
 * This is only called when no language preference has been stored by the user.
 */
export const detectSystemLanguage = (): AppLanguage => {
  const [primaryLocale] = getLocales();
  const tag = primaryLocale?.languageTag ?? '';

  if (tag.startsWith('pt-BR') || tag.startsWith('pt_BR')) {
    return AppLanguage.PT_BR;
  }

  if (tag.startsWith('pt')) {
    return AppLanguage.PT_PT;
  }

  return AppLanguage.EN;
};
