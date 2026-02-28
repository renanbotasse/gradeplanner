import { useMemo, useState } from 'react';
import { Modal, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { ICON_CATEGORIES } from '@/constants/ucConstants';
import { useAppPreferences } from '@/presentation/providers/AppPreferencesProvider';
import { radius, spacing, typography } from '@/ui/theme/foundation';
import { useAthenaTheme, type AthenaColors } from '@/ui/theme/tokens';

interface IconSelectorProps {
  selectedIcon: string;
  onSelect: (icon: string) => void;
}

export const IconSelector = ({ selectedIcon, onSelect }: IconSelectorProps) => {
  const { colors } = useAthenaTheme();
  const { t } = useAppPreferences();
  const styles = useMemo(() => createStyles(colors), [colors]);
  const [open, setOpen] = useState(false);

  const handleSelect = (icon: string) => {
    onSelect(icon);
    setOpen(false);
  };

  return (
    <>
      {/* Trigger row */}
      <Pressable style={styles.trigger} onPress={() => setOpen(true)}>
        <View style={styles.triggerIconWrap}>
          <MaterialIcons
            name={selectedIcon as keyof typeof MaterialIcons.glyphMap}
            size={22}
            color={colors.primary[500]}
          />
        </View>
        <Text style={styles.triggerLabel}>{selectedIcon}</Text>
        <MaterialIcons name="expand-more" size={20} color={colors.text.tertiary} />
      </Pressable>

      {/* Picker modal */}
      <Modal visible={open} animationType="slide" transparent onRequestClose={() => setOpen(false)}>
        <View style={styles.overlay}>
          <View style={styles.sheet}>
            {/* Header */}
            <View style={styles.header}>
              <Text style={styles.headerTitle}>{t('iconPicker.title')}</Text>
              <Pressable onPress={() => setOpen(false)} hitSlop={8}>
                <MaterialIcons name="close" size={22} color={colors.text.secondary} />
              </Pressable>
            </View>

            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
              {ICON_CATEGORIES.map((category) => (
                <View key={category.labelKey} style={styles.categorySection}>
                  <Text style={styles.categoryLabel}>
                    {t(category.labelKey as Parameters<typeof t>[0])}
                  </Text>
                  <View style={styles.iconGrid}>
                    {category.icons.map((name) => {
                      const selected = selectedIcon === name;
                      return (
                        <Pressable
                          key={name}
                          style={[
                            styles.iconChip,
                            {
                              borderColor: selected ? colors.primary[500] : colors.border.default,
                              backgroundColor: selected ? colors.primary[500] : colors.background.elevated,
                            },
                          ]}
                          onPress={() => handleSelect(name)}
                        >
                          <MaterialIcons
                            name={name}
                            size={22}
                            color={selected ? colors.text.onPrimary : colors.text.secondary}
                          />
                        </Pressable>
                      );
                    })}
                  </View>
                </View>
              ))}
            </ScrollView>
          </View>
        </View>
      </Modal>
    </>
  );
};

const createStyles = (colors: AthenaColors) =>
  StyleSheet.create({
    trigger: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: spacing.xs,
      borderWidth: 1,
      borderColor: colors.border.default,
      borderRadius: radius.md,
      backgroundColor: colors.background.base,
      paddingHorizontal: spacing.sm,
      paddingVertical: spacing.xs,
      minHeight: 46,
    },
    triggerIconWrap: {
      width: 32,
      height: 32,
      borderRadius: radius.md,
      backgroundColor: colors.info.soft,
      alignItems: 'center',
      justifyContent: 'center',
    },
    triggerLabel: {
      ...typography.body,
      color: colors.text.primary,
      flex: 1,
    },
    overlay: {
      flex: 1,
      backgroundColor: colors.overlay.scrim,
      justifyContent: 'flex-end',
    },
    sheet: {
      backgroundColor: colors.background.surface,
      borderTopLeftRadius: radius.xl,
      borderTopRightRadius: radius.xl,
      maxHeight: '85%',
      paddingBottom: spacing.xl,
    },
    header: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingHorizontal: spacing.md,
      paddingVertical: spacing.md,
      borderBottomWidth: 1,
      borderBottomColor: colors.border.default,
    },
    headerTitle: {
      ...typography.bodyStrong,
      color: colors.text.primary,
    },
    scrollContent: {
      padding: spacing.md,
      gap: spacing.md,
    },
    categorySection: {
      gap: spacing.xs,
    },
    categoryLabel: {
      ...typography.overline,
      color: colors.text.tertiary,
    },
    iconGrid: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: spacing.xs,
    },
    iconChip: {
      width: 46,
      height: 46,
      borderRadius: radius.md,
      borderWidth: 1,
      alignItems: 'center',
      justifyContent: 'center',
    },
  });
