import { StyleSheet, Text, View } from 'react-native';

import type { UCStatus } from '@/core/models';
import { useAppPreferences } from '@/presentation/providers/AppPreferencesProvider';
import { useAthenaTheme } from '@/ui/theme/tokens';

const LABEL_KEYS: Record<UCStatus, string> = {
  aprovado: 'status.approved',
  reprovado: 'status.failed',
  ok: 'status.ok',
  em_risco: 'status.risk',
  impossivel: 'status.impossible',
  precisa_exame: 'status.retake',
};

interface StatusPillProps {
  status: UCStatus;
}

export const StatusPill = ({ status }: StatusPillProps) => {
  const { colors } = useAthenaTheme();
  const { t } = useAppPreferences();
  const backgroundByStatus: Record<UCStatus, string> = {
    aprovado: colors.success.base,
    reprovado: colors.danger.base,
    ok: colors.success.soft,
    em_risco: colors.warning.base,
    impossivel: colors.danger.base,
    precisa_exame: colors.info.base,
  };

  const textByStatus: Record<UCStatus, string> = {
    aprovado: colors.text.onPrimary,
    reprovado: colors.text.onPrimary,
    ok: colors.success.base,
    em_risco: colors.text.onPrimary,
    impossivel: colors.text.onPrimary,
    precisa_exame: colors.text.onPrimary,
  };

  return (
    <View style={[styles.badge, { backgroundColor: backgroundByStatus[status] }]}>
      <Text style={[styles.text, { color: textByStatus[status] }]}>{t(LABEL_KEYS[status])}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  badge: {
    alignSelf: 'flex-start',
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  text: {
    fontSize: 12,
    fontWeight: '700',
  },
});
