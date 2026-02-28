import type { PropsWithChildren, ReactNode } from 'react';
import { Image, Pressable, StyleSheet, Text, View } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';

import { useAppPreferences } from '@/presentation/providers/AppPreferencesProvider';
import { getHeaderIconAsset } from '@/presentation/widgets/app_header/headerAssets';
import { componentSize, iconSize, radius, spacing, typography } from '@/ui/theme/foundation';
import { useAthenaTheme } from '@/ui/theme/tokens';

interface AppHeaderProps extends PropsWithChildren {
  title: string;
  rightSlot?: ReactNode;
  leftActionIcon?: keyof typeof MaterialIcons.glyphMap;
  onLeftActionPress?: () => void;
}

export const AppHeader = ({
  title,
  rightSlot,
  leftActionIcon,
  onLeftActionPress,
}: AppHeaderProps) => {
  const { colors } = useAthenaTheme();
  const { iconTheme } = useAppPreferences();
  const iconAsset = getHeaderIconAsset(iconTheme);

  return (
    <View
      style={[
        styles.container,
        {
          backgroundColor: colors.background.surface,
          borderColor: colors.border.default,
        },
      ]}
    >
      <View style={styles.leading}>
        {leftActionIcon ? (
          <Pressable
            onPress={onLeftActionPress}
            style={[styles.leftAction, { borderColor: colors.border.default, backgroundColor: colors.background.elevated }]}
          >
            <MaterialIcons name={leftActionIcon} size={iconSize.md} color={colors.text.secondary} />
          </Pressable>
        ) : null}

        <Image source={iconAsset} style={styles.icon} resizeMode="contain" />
        <Text style={[styles.title, { color: colors.text.primary }]} numberOfLines={1}>
          {title}
        </Text>
      </View>

      {rightSlot ? <View style={styles.trailing}>{rightSlot}</View> : null}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    minHeight: componentSize.buttonHeightLg,
    borderWidth: 1,
    borderRadius: radius.lg,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.sm,
    gap: spacing.sm,
  },
  leading: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    flex: 1,
  },
  trailing: {
    alignItems: 'flex-end',
    justifyContent: 'center',
  },
  icon: {
    width: 28,
    height: 28,
  },
  title: {
    ...typography.h3,
    flexShrink: 1,
  },
  leftAction: {
    width: componentSize.touchMin,
    height: componentSize.touchMin,
    borderRadius: radius.md,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
