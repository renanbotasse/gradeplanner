import { CreateCalendarEventUseCase } from '@/application/calendar/use-cases/CreateCalendarEventUseCase';
import { UpdateCalendarEventUseCase } from '@/application/calendar/use-cases/UpdateCalendarEventUseCase';
import { ChangeAppIconUseCase } from '@/application/icon/use-cases/ChangeAppIconUseCase';
import { GetSelectedIconUseCase } from '@/application/icon/use-cases/GetSelectedIconUseCase';
import { IconService } from '@/application/icon/services/IconService';
import { ChangeLanguageUseCase } from '@/application/localization/use-cases/ChangeLanguageUseCase';
import { ChangeWeekStartDayUseCase } from '@/application/localization/use-cases/ChangeWeekStartDayUseCase';
import { GetSelectedLanguageUseCase } from '@/application/localization/use-cases/GetSelectedLanguageUseCase';
import { GetSelectedWeekStartDayUseCase } from '@/application/localization/use-cases/GetSelectedWeekStartDayUseCase';
import { buildAppIconVariant } from '@/domain/icon/AppIconVariant';
import { DEFAULT_ICON_THEME } from '@/domain/icon/IconTheme';
import { SQLiteCalendarEventRepository } from '@/infrastructure/calendar/SQLiteCalendarEventRepository';
import { AsyncStorageIconPreferencesRepository } from '@/infrastructure/icon/AsyncStorageIconPreferencesRepository';
import { ReactNativeLauncherIconGateway } from '@/infrastructure/icon/ReactNativeLauncherIconGateway';
import { AsyncStorageLanguagePreferencesRepository } from '@/infrastructure/localization/AsyncStorageLanguagePreferencesRepository';
import { AsyncStorageWeekStartPreferencesRepository } from '@/infrastructure/localization/AsyncStorageWeekStartPreferencesRepository';

const calendarEventRepository = new SQLiteCalendarEventRepository();
const iconPreferencesRepository = new AsyncStorageIconPreferencesRepository();
const launcherIconGateway = new ReactNativeLauncherIconGateway();
const iconService = new IconService(launcherIconGateway);
const languagePreferencesRepository = new AsyncStorageLanguagePreferencesRepository();
const weekStartPreferencesRepository = new AsyncStorageWeekStartPreferencesRepository();

export const appContainer = {
  calendar: {
    eventRepository: calendarEventRepository,
    createEventUseCase: new CreateCalendarEventUseCase(calendarEventRepository),
    updateEventUseCase: new UpdateCalendarEventUseCase(calendarEventRepository),
  },
  preferences: {
    icon: {
      repository: iconPreferencesRepository,
      service: iconService,
      changeAppIconUseCase: new ChangeAppIconUseCase(iconPreferencesRepository, iconService),
      getSelectedIconUseCase: new GetSelectedIconUseCase(iconPreferencesRepository),
      getSelectedIconFallback: () => buildAppIconVariant(DEFAULT_ICON_THEME),
    },
    localization: {
      repository: languagePreferencesRepository,
      changeLanguageUseCase: new ChangeLanguageUseCase(languagePreferencesRepository),
      getSelectedLanguageUseCase: new GetSelectedLanguageUseCase(languagePreferencesRepository),
      weekStartRepository: weekStartPreferencesRepository,
      changeWeekStartDayUseCase: new ChangeWeekStartDayUseCase(weekStartPreferencesRepository),
      getSelectedWeekStartDayUseCase: new GetSelectedWeekStartDayUseCase(weekStartPreferencesRepository),
    },
  },
} as const;
