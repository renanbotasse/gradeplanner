import { MaterialIcons } from '@expo/vector-icons';
import type { EventTipo } from '@/db/types';
import type { AthenaColors } from '@/ui/theme/tokens';

export const TIPO_OPTIONS: Array<{ value: EventTipo; icon: keyof typeof MaterialIcons.glyphMap }> = [
  { value: 'avaliacao', icon: 'quiz' },
  { value: 'atividade', icon: 'assignment' },
  { value: 'evento', icon: 'event' },
];

export const tipoChipVariant: Record<EventTipo, 'info' | 'warning' | 'event'> = {
  avaliacao: 'info',
  atividade: 'warning',
  evento: 'event',
};

export const tipoIcons: Record<EventTipo, keyof typeof MaterialIcons.glyphMap> = {
  avaliacao: 'quiz',
  atividade: 'assignment',
  evento: 'event',
};

export const buildTipoColors = (colors: AthenaColors): Record<EventTipo, string> => ({
  avaliacao: colors.info.base,
  atividade: colors.warning.base,
  evento: colors.event.base,
});

export const toEventTipo = (tipo: string | null | undefined): EventTipo => {
  if (tipo === 'atividade' || tipo === 'evento' || tipo === 'avaliacao') return tipo;
  return 'avaliacao';
};
