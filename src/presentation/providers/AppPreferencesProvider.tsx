import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type PropsWithChildren,
} from 'react';

import { appContainer } from '@/app/providers/container';
import type { AppIconVariant } from '@/domain/icon/AppIconVariant';
import { AVAILABLE_ICON_THEMES, DEFAULT_ICON_THEME, type IconTheme } from '@/domain/icon/IconTheme';
import { AppLanguage, AVAILABLE_LANGUAGES, DEFAULT_APP_LANGUAGE } from '@/domain/localization/AppLanguage';
import { AVAILABLE_WEEK_START_DAYS, DEFAULT_WEEK_START_DAY, type WeekStartDay } from '@/domain/localization/WeekStartDay';
import { setCalendarLocale } from '@/presentation/i18n/calendarLocale';
import { translate, type TranslationKey } from '@/presentation/i18n/translations';
import { setDateLocale } from '@/utils/date';

interface AppPreferencesContextValue {
  iconTheme: IconTheme;
  iconVariant: AppIconVariant;
  language: AppLanguage;
  weekStartDay: WeekStartDay;
  setIconTheme: (theme: IconTheme) => Promise<void>;
  setLanguage: (language: AppLanguage) => Promise<void>;
  setWeekStartDay: (weekStartDay: WeekStartDay) => Promise<void>;
  t: (key: TranslationKey) => string;
}

const AppPreferencesContext = createContext<AppPreferencesContextValue | null>(null);

const toLocaleCode = (language: AppLanguage): string => {
  if (language === AppLanguage.EN) return 'en-US';
  if (language === AppLanguage.PT_BR) return 'pt-BR';
  return 'pt-PT';
};

setCalendarLocale(DEFAULT_APP_LANGUAGE);

export const AppPreferencesProvider = ({ children }: PropsWithChildren) => {
  const [iconTheme, setIconThemeState] = useState<IconTheme>(DEFAULT_ICON_THEME);
  const [iconVariant, setIconVariant] = useState<AppIconVariant>(
    appContainer.preferences.icon.getSelectedIconFallback(),
  );
  const [language, setLanguageState] = useState<AppLanguage>(DEFAULT_APP_LANGUAGE);
  const [weekStartDay, setWeekStartDayState] = useState<WeekStartDay>(DEFAULT_WEEK_START_DAY);

  useEffect(() => {
    setDateLocale(toLocaleCode(language));
    setCalendarLocale(language);
  }, [language]);

  useEffect(() => {
    const loadPreferences = async () => {
      const [selectedVariant, selectedLanguage, selectedWeekStartDay] = await Promise.all([
        appContainer.preferences.icon.getSelectedIconUseCase.execute(),
        appContainer.preferences.localization.getSelectedLanguageUseCase.execute(),
        appContainer.preferences.localization.getSelectedWeekStartDayUseCase.execute(),
      ]);

      setIconThemeState(selectedVariant.theme);
      setIconVariant(selectedVariant);
      setLanguageState(selectedLanguage);
      setWeekStartDayState(selectedWeekStartDay);
    };

    loadPreferences().catch((error) => {
      console.error('Failed to load app preferences:', error);
    });
  }, []);

  const setIconTheme = useCallback(async (theme: IconTheme) => {
    if (!AVAILABLE_ICON_THEMES.includes(theme)) return;
    const selectedVariant = await appContainer.preferences.icon.changeAppIconUseCase.execute(theme);
    setIconThemeState(theme);
    setIconVariant(selectedVariant);
  }, []);

  const setLanguage = useCallback(async (nextLanguage: AppLanguage) => {
    if (!AVAILABLE_LANGUAGES.includes(nextLanguage)) return;
    const selectedLanguage = await appContainer.preferences.localization.changeLanguageUseCase.execute(nextLanguage);
    setLanguageState(selectedLanguage);
  }, []);

  const setWeekStartDay = useCallback(async (nextWeekStartDay: WeekStartDay) => {
    if (!AVAILABLE_WEEK_START_DAYS.includes(nextWeekStartDay)) return;
    const selectedWeekStartDay = await appContainer.preferences.localization.changeWeekStartDayUseCase.execute(nextWeekStartDay);
    setWeekStartDayState(selectedWeekStartDay);
  }, []);

  const t = useCallback((key: TranslationKey) => translate(language, key), [language]);

  const value = useMemo<AppPreferencesContextValue>(
    () => ({
      iconTheme,
      iconVariant,
      language,
      weekStartDay,
      setIconTheme,
      setLanguage,
      setWeekStartDay,
      t,
    }),
    [iconTheme, iconVariant, language, weekStartDay, setIconTheme, setLanguage, setWeekStartDay, t],
  );

  return <AppPreferencesContext.Provider value={value}>{children}</AppPreferencesContext.Provider>;
};

export const useAppPreferences = (): AppPreferencesContextValue => {
  const context = useContext(AppPreferencesContext);
  if (!context) {
    throw new Error('useAppPreferences must be used within AppPreferencesProvider.');
  }
  return context;
};
