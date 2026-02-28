import { LocaleConfig } from 'react-native-calendars';

import { AppLanguage } from '@/domain/localization/AppLanguage';

const MONTH_NAMES_PT = [
  'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
  'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro',
];

const MONTH_NAMES_EN = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
];

const DAY_NAMES_PT = [
  'Domingo', 'Segunda-feira', 'Terça-feira', 'Quarta-feira', 'Quinta-feira', 'Sexta-feira', 'Sábado',
];

const DAY_NAMES_EN = [
  'Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday',
];

LocaleConfig.locales[AppLanguage.PT_PT] = {
  monthNames: MONTH_NAMES_PT,
  monthNamesShort: MONTH_NAMES_PT.map((month) => month.slice(0, 3)),
  dayNames: DAY_NAMES_PT,
  dayNamesShort: ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'],
  today: 'Hoje',
};

LocaleConfig.locales[AppLanguage.PT_BR] = {
  monthNames: MONTH_NAMES_PT,
  monthNamesShort: MONTH_NAMES_PT.map((month) => month.slice(0, 3)),
  dayNames: DAY_NAMES_PT,
  dayNamesShort: ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'],
  today: 'Hoje',
};

LocaleConfig.locales[AppLanguage.EN] = {
  monthNames: MONTH_NAMES_EN,
  monthNamesShort: MONTH_NAMES_EN.map((month) => month.slice(0, 3)),
  dayNames: DAY_NAMES_EN,
  dayNamesShort: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'],
  today: 'Today',
};

export const setCalendarLocale = (language: AppLanguage): void => {
  LocaleConfig.defaultLocale = language;
};
