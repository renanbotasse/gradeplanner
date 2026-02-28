import * as Notifications from 'expo-notifications';

import type { AvaliacaoRecord } from '@/db/types';

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

export const requestNotificationPermissions = async (): Promise<boolean> => {
  const { status: existingStatus } = await Notifications.getPermissionsAsync();
  if (existingStatus === 'granted') return true;

  const { status } = await Notifications.requestPermissionsAsync();
  return status === 'granted';
};

const buildIdentifier = (avaliacaoId: number, minutos: number): string =>
  `avaliacao-${avaliacaoId}-${minutos}`;

export const scheduleAvaliacaoReminders = async (
  avaliacao: AvaliacaoRecord & { ucNome?: string },
): Promise<void> => {
  if (!avaliacao.lembreteAtivo || !avaliacao.lembreteAntecedencia?.length) return;

  const hasPermission = await requestNotificationPermissions();
  if (!hasPermission) return;

  const dataHora = new Date(avaliacao.dataHora);

  for (const minutos of avaliacao.lembreteAntecedencia) {
    const scheduledAt = new Date(dataHora.getTime() - minutos * 60 * 1000);
    if (scheduledAt <= new Date()) continue;

    const identifier = buildIdentifier(avaliacao.id, minutos);

    const days = Math.floor(minutos / 1440);
    const hours = Math.floor((minutos % 1440) / 60);
    const mins = minutos % 60;

    let timeText = '';
    if (days > 0) timeText += `${days}d `;
    if (hours > 0) timeText += `${hours}h `;
    if (mins > 0) timeText += `${mins}min`;
    timeText = timeText.trim() || 'agora';

    const ucNome = avaliacao.ucNome ?? 'UC';

    await Notifications.scheduleNotificationAsync({
      identifier,
      content: {
        title: `${avaliacao.nome}`,
        body: `${avaliacao.nome} de ${ucNome} em ${timeText}`,
        data: { avaliacaoId: avaliacao.id },
      },
      trigger: {
        type: Notifications.SchedulableTriggerInputTypes.DATE,
        date: scheduledAt,
      },
    });
  }
};

export const cancelAvaliacaoReminders = async (avaliacaoId: number): Promise<void> => {
  const scheduled = await Notifications.getAllScheduledNotificationsAsync();
  const prefix = `avaliacao-${avaliacaoId}-`;

  for (const notification of scheduled) {
    if (notification.identifier.startsWith(prefix)) {
      await Notifications.cancelScheduledNotificationAsync(notification.identifier);
    }
  }
};

export const cancelAllReminders = async (): Promise<void> => {
  await Notifications.cancelAllScheduledNotificationsAsync();
};
