import { MaterialIcons } from '@expo/vector-icons';
import type { GradeScale } from '@/db/types';

export type IconCategoryDef = {
  labelKey: string;
  icons: Array<keyof typeof MaterialIcons.glyphMap>;
};

export const ICON_CATEGORIES: IconCategoryDef[] = [
  {
    labelKey: 'iconPicker.category.tech',
    icons: [
      'functions', 'calculate', 'terminal', 'code', 'computer', 'memory',
      'science', 'biotech', 'hub', 'analytics', 'storage', 'rocket-launch',
      'electrical-services', 'wifi', 'precision-manufacturing', 'query-stats',
    ],
  },
  {
    labelKey: 'iconPicker.category.health',
    icons: [
      'medical-services', 'local-hospital', 'health-and-safety', 'medication',
      'healing', 'vaccines', 'monitor-heart', 'psychology', 'accessibility-new',
      'local-pharmacy', 'thermostat', 'biotech',
    ],
  },
  {
    labelKey: 'iconPicker.category.humanities',
    icons: [
      'menu-book', 'language', 'public', 'people', 'groups', 'forum',
      'account-balance', 'gavel', 'history-edu', 'translate', 'diversity-3',
      'how-to-vote',
    ],
  },
  {
    labelKey: 'iconPicker.category.arts',
    icons: [
      'brush', 'palette', 'music-note', 'architecture', 'photo-camera',
      'color-lens', 'movie', 'gesture', 'auto-awesome', 'theater-comedy',
      'piano', 'draw',
    ],
  },
  {
    labelKey: 'iconPicker.category.economics',
    icons: [
      'bar-chart', 'trending-up', 'account-balance-wallet', 'attach-money',
      'business', 'store', 'manage-accounts', 'receipt-long', 'pie-chart',
      'show-chart', 'currency-exchange', 'handshake',
    ],
  },
  {
    labelKey: 'iconPicker.category.general',
    icons: [
      'school', 'class', 'library-books', 'edit-note', 'assignment',
      'lightbulb', 'star', 'emoji-events', 'grade', 'workspace-premium',
      'fitness-center', 'sports-soccer',
    ],
  },
];

export const UC_ICONS: Array<keyof typeof MaterialIcons.glyphMap> =
  ICON_CATEGORIES.flatMap((c) => c.icons);

export const GRADE_SCALES: Array<GradeScale | ''> = ['0-10', '0-20', '0-100', ''];

export const scaleToLabel = (scale: GradeScale | null | undefined): string => {
  if (scale === '0-20') return '0-20';
  if (scale === '0-10') return '0-10';
  if (scale === '0-100') return '0-100';
  return '—';
};
