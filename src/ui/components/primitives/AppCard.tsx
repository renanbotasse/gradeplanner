import type { PropsWithChildren } from 'react';
import { StyleSheet, View, type ViewStyle } from 'react-native';

import { createElevation, radius, spacing } from '@/ui/theme/foundation';
import { useAthenaTheme } from '@/ui/theme/tokens';

interface AppCardProps extends PropsWithChildren {
  style?: ViewStyle;
  padded?: boolean;
  elevation?: 'none' | 'sm' | 'md' | 'lg';
}

export const AppCard = ({
  children,
  style,
  padded = true,
  elevation = 'sm',
}: AppCardProps) => {
  const { colors } = useAthenaTheme();
  const shadows = createElevation(colors);

  return (
    <View
      style={[
        styles.base,
        {
          backgroundColor: colors.background.surface,
          borderColor: colors.border.default,
          padding: padded ? spacing.sm : 0,
        },
        shadows[elevation],
        style,
      ]}
    >
      {children}
    </View>
  );
};

const styles = StyleSheet.create({
  base: {
    borderWidth: 1,
    borderRadius: radius.lg,
  },
});
