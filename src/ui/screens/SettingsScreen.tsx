import { useEffect, useMemo, useState } from 'react';
import { Alert, Image, Linking, Modal, Pressable, StyleSheet, Text, View } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { FontAwesome5 } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import * as ImagePicker from 'expo-image-picker';

import type { RootStackParamList } from '@/app/navigation/types';
import { AVAILABLE_ICON_THEMES } from '@/domain/icon/IconTheme';
import { AVAILABLE_LANGUAGES } from '@/domain/localization/AppLanguage';
import { AVAILABLE_WEEK_START_DAYS, WeekStartDay } from '@/domain/localization/WeekStartDay';
import {
  useMockDataMode,
  useSaveProfile,
  useSaveSettings,
  useToggleMockDataMode,
  useUserProfile,
} from '@/features/settings/hooks';
import { iconThemeTranslationKey, languageTranslationKey } from '@/presentation/i18n/translations';
import { useAppPreferences } from '@/presentation/providers/AppPreferencesProvider';
import { AppHeader } from '@/presentation/widgets/app_header';
import { getHeaderIconAsset } from '@/presentation/widgets/app_header/headerAssets';
import { AppButton, AppCard, AppInput, AppToggle } from '@/ui/components/primitives';
import { Screen } from '@/ui/components/Screen';
import { componentSize, iconSize, radius, spacing, typography } from '@/ui/theme/foundation';
import { useAthenaTheme, type AthenaColors } from '@/ui/theme/tokens';

export const SettingsScreen = () => {
  const { colors, mode, setMode } = useAthenaTheme();
  const { language, setLanguage, weekStartDay, setWeekStartDay, iconTheme, setIconTheme, t } = useAppPreferences();
  const styles = useMemo(() => createStyles(colors), [colors]);
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();

  const profileQuery = useUserProfile();
  const mockDataModeQuery = useMockDataMode();
  const saveProfileMutation = useSaveProfile();
  const saveSettingsMutation = useSaveSettings();
  const toggleMockDataMutation = useToggleMockDataMode();

  const [name, setName] = useState('');
  const [showNameEditor, setShowNameEditor] = useState(false);
  const [showCompanionModal, setShowCompanionModal] = useState(false);
  const [notificacoesAtivas, setNotificacoesAtivas] = useState(true);

  useEffect(() => {
    if (!profileQuery.data) return;
    setName(profileQuery.data.name);
    setNotificacoesAtivas(profileQuery.data.notificacoesAtivas);
  }, [profileQuery.data]);

  const saveName = async () => {
    if (!name.trim()) {
      Alert.alert(t('settings.nameRequired.title'), t('settings.nameRequired.message'));
      return;
    }
    try {
      await saveProfileMutation.mutateAsync({ name: name.trim(), photoUri: profileQuery.data?.photoUri ?? null });
      setShowNameEditor(false);
    } catch {
      Alert.alert(t('common.error'), t('settings.saveProfile.error'));
    }
  };

  const pickPhoto = async () => {
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted) {
      Alert.alert(t('settings.permission.title'), t('settings.permission.message'));
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.85,
    });
    if (!result.canceled && result.assets[0]) {
      try {
        await saveProfileMutation.mutateAsync({
          name: profileQuery.data?.name ?? name,
          photoUri: result.assets[0].uri,
        });
      } catch {
        Alert.alert(t('common.error'), t('settings.savePhoto.error'));
      }
    }
  };

  const removePhoto = () => {
    Alert.alert(t('settings.removePhoto.title'), t('settings.removePhoto.message'), [
      { text: t('common.cancel'), style: 'cancel' },
      {
        text: t('settings.profile.removePhoto'),
        style: 'destructive',
        onPress: async () => {
          // pass empty string to signal removal — repo COALESCE ignores null, so we use a workaround
          // Update: we directly call the DB with empty string that gets stored
          try {
            await saveProfileMutation.mutateAsync({
              name: profileQuery.data?.name ?? name,
              photoUri: '',
            });
          } catch {
            Alert.alert(t('common.error'), t('settings.removePhoto.error'));
          }
        },
      },
    ]);
  };

  const openExternalLink = async (url: string) => {
    try {
      const supported = await Linking.canOpenURL(url);
      if (!supported) {
        Alert.alert(t('common.error'), t('settings.openLink.error'));
        return;
      }
      await Linking.openURL(url);
    } catch {
      Alert.alert(t('common.error'), t('settings.openLink.error'));
    }
  };

  const toggleNotificacoes = async (value: boolean) => {
    setNotificacoesAtivas(value);
    try {
      await saveSettingsMutation.mutateAsync({ notificacoesAtivas: value });
    } catch {
      setNotificacoesAtivas(!value);
    }
  };

  const toggleMockData = async (value: boolean) => {
    try {
      await toggleMockDataMutation.mutateAsync(value);
    } catch {
      Alert.alert(t('common.error'), t('settings.mockData.error'));
    }
  };

  const photoUri = profileQuery.data?.photoUri;
  const hasPhoto = !!photoUri && photoUri.length > 0;
  const initial = (profileQuery.data?.name ?? name).trim().slice(0, 1).toUpperCase() || 'V';
  const selectedCompanionLabel = t(iconThemeTranslationKey[iconTheme]);

  return (
    <Screen>
      <AppHeader title={t('header.profile')} />

      {/* ─── Photo + Name card ─────────────────────────────────────────────── */}
      <View style={styles.profileCard}>
        {/* Avatar */}
        <Pressable style={styles.avatarWrap} onPress={pickPhoto}>
          {hasPhoto ? (
            <Image source={{ uri: photoUri }} style={styles.avatarImage} />
          ) : (
            <View style={styles.avatarFallback}>
              <Text style={styles.avatarText}>{initial}</Text>
            </View>
          )}
          <View style={styles.avatarEditBadge}>
            <MaterialIcons name="camera-alt" size={iconSize.sm} color={colors.text.onPrimary} />
          </View>
        </Pressable>

        <View style={styles.profileTexts}>
          <Text style={styles.profileName}>{profileQuery.data?.name || t('settings.profile.userFallback')}</Text>
          <Text style={styles.profileMeta}>GradePlanner</Text>
          <View style={styles.photoActions}>
            <Pressable onPress={pickPhoto}>
              <Text style={styles.photoActionText}>
                {hasPhoto ? t('settings.profile.changePhoto') : t('settings.profile.addPhoto')}
              </Text>
            </Pressable>
            {hasPhoto && (
              <>
                <Text style={styles.photoActionSep}>·</Text>
                <Pressable onPress={removePhoto}>
                  <Text style={[styles.photoActionText, styles.photoActionDanger]}>{t('settings.profile.removePhoto')}</Text>
                </Pressable>
              </>
            )}
          </View>
        </View>

        <Pressable onPress={() => setShowNameEditor((prev) => !prev)}>
          <MaterialIcons name="edit" size={iconSize.md} color={colors.text.tertiary} />
        </Pressable>
      </View>

      {/* Inline name editor */}
      {showNameEditor && (
        <View style={styles.editorCard}>
          <AppInput
            label={t('settings.profile.nameLabel')}
            value={name}
            onChangeText={setName}
            placeholder={t('settings.profile.namePlaceholder')}
          />
          <View style={styles.editorActions}>
            <View style={styles.editorActionCell}>
              <AppButton
                label={t('common.cancel')}
                variant="secondary"
                size="md"
                onPress={() => {
                  setName(profileQuery.data?.name ?? '');
                  setShowNameEditor(false);
                }}
              />
            </View>
            <View style={styles.editorActionCell}>
              <AppButton label={t('common.save')} onPress={saveName} loading={saveProfileMutation.isPending} />
            </View>
          </View>
        </View>
      )}

      {/* ─── Académico ─────────────────────────────────────────────────────── */}
      <Text style={styles.sectionLabel}>{t('settings.section.academic')}</Text>
      <SettingRow
        styles={styles}
        colors={colors}
        icon="school"
        title={t('settings.academic.coursesTitle')}
        subtitle={t('settings.academic.coursesSubtitle')}
        onPress={() => navigation.navigate('CourseSettings')}
      />
      <SettingRow
        styles={styles}
        colors={colors}
        icon="science"
        title={t('settings.onboardingTest.title')}
        subtitle={t('settings.onboardingTest.subtitle')}
        onPress={() => navigation.navigate('OnboardingTest')}
      />
      <AppToggle
        label={t('settings.mockData.label')}
        description={t('settings.mockData.desc')}
        value={mockDataModeQuery.data ?? false}
        onValueChange={(value) => {
          void toggleMockData(value);
        }}
        disabled={toggleMockDataMutation.isPending}
      />

      {/* ─── Notificações ──────────────────────────────────────────────────── */}
      <Text style={styles.sectionLabel}>{t('settings.section.notifications')}</Text>
      <AppToggle
        label={t('settings.notifications.remindersLabel')}
        description={t('settings.notifications.remindersDesc')}
        value={notificacoesAtivas}
        onValueChange={toggleNotificacoes}
      />

      {/* ─── Aparência ─────────────────────────────────────────────────────── */}
      <Text style={styles.sectionLabel}>{t('settings.section.appearance')}</Text>
      <AppToggle
        label={t('settings.appearance.darkModeLabel')}
        description={t('settings.appearance.darkModeDesc')}
        value={mode === 'dark'}
        onValueChange={(enabled) => { void setMode(enabled ? 'dark' : 'light'); }}
      />

      <SettingRow
        styles={styles}
        colors={colors}
        icon="auto-awesome"
        title={t('settings.iconTheme')}
        subtitle={selectedCompanionLabel}
        onPress={() => setShowCompanionModal(true)}
      />

      <Text style={styles.sectionLabel}>{t('settings.language').toUpperCase()}</Text>
      <View style={styles.chipWrap}>
        {AVAILABLE_LANGUAGES.map((value) => (
          <Pressable
            key={value}
            onPress={() => {
              void setLanguage(value);
            }}
            style={[
              styles.choiceChip,
              {
                borderColor: language === value ? colors.primary[500] : colors.border.default,
                backgroundColor: language === value ? colors.info.soft : colors.background.surface,
              },
            ]}
          >
            <Text
              style={[
                styles.choiceChipText,
                { color: language === value ? colors.primary[600] : colors.text.secondary },
              ]}
            >
              {t(languageTranslationKey[value])}
            </Text>
          </Pressable>
        ))}
      </View>

      <Text style={styles.sectionLabel}>{t('settings.weekStart').toUpperCase()}</Text>
      <View style={styles.chipWrap}>
        {AVAILABLE_WEEK_START_DAYS.map((value) => (
          <Pressable
            key={value}
            onPress={() => {
              void setWeekStartDay(value);
            }}
            style={[
              styles.choiceChip,
              {
                borderColor: weekStartDay === value ? colors.primary[500] : colors.border.default,
                backgroundColor: weekStartDay === value ? colors.info.soft : colors.background.surface,
              },
            ]}
          >
            <Text
              style={[
                styles.choiceChipText,
                { color: weekStartDay === value ? colors.primary[600] : colors.text.secondary },
              ]}
            >
              {value === WeekStartDay.SUNDAY ? t('settings.weekStart.sunday') : t('settings.weekStart.monday')}
            </Text>
          </Pressable>
        ))}
      </View>

      {/* ─── Sobre ─────────────────────────────────────────────────────────── */}
      <Text style={styles.sectionLabel}>{t('settings.section.about')}</Text>
      <SettingRow
        styles={styles}
        colors={colors}
        icon="privacy-tip"
        title={t('settings.about.privacyPolicy')}
        subtitle={t('settings.about.privacyPolicySubtitle')}
        onPress={() => openExternalLink('https://blazeraven.github.io/gradeplanner-privacy/')}
      />

      <Text style={styles.versionText}>GradePlanner v0.6</Text>

      <AppCard style={styles.creatorCard}>
        <Text style={styles.creatorText}>{t('settings.about.createdBy')}</Text>
        <View style={styles.socialRow}>
          <Pressable
            style={styles.socialIconButton}
            onPress={() => openExternalLink('https://github.com/renanbotasse')}
          >
            <FontAwesome5 name="github" size={iconSize.md} color={colors.primary[600]} />
          </Pressable>
          <Pressable
            style={styles.socialIconButton}
            onPress={() => openExternalLink('https://www.linkedin.com/in/renanbotasse/')}
          >
            <FontAwesome5 name="linkedin" size={iconSize.md} color={colors.primary[600]} />
          </Pressable>
          <Pressable
            style={styles.socialIconButton}
            onPress={() => openExternalLink('https://hackernoon.com/u/renanb')}
          >
            <MaterialIcons name="newspaper" size={iconSize.md} color={colors.primary[600]} />
          </Pressable>
        </View>
      </AppCard>

      <Modal visible={showCompanionModal} transparent animationType="slide" onRequestClose={() => setShowCompanionModal(false)}>
        <View style={styles.modalOverlay}>
          <View style={[styles.modalSheet, { backgroundColor: colors.background.surface, borderColor: colors.border.default }]}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>{t('settings.companion.modalTitle')}</Text>
              <Pressable onPress={() => setShowCompanionModal(false)}>
                <MaterialIcons name="close" size={iconSize.lg} color={colors.text.secondary} />
              </Pressable>
            </View>

            <View style={styles.modalOptions}>
              {AVAILABLE_ICON_THEMES.map((theme) => {
                const selected = iconTheme === theme;
                return (
                  <Pressable
                    key={theme}
                    onPress={() => {
                      void setIconTheme(theme);
                      setShowCompanionModal(false);
                    }}
                    style={[
                      styles.optionRow,
                      {
                        borderColor: selected ? colors.primary[500] : colors.border.default,
                        backgroundColor: selected ? colors.info.soft : colors.background.elevated,
                      },
                    ]}
                  >
                    <View style={styles.optionIconWrap}>
                      <Image source={getHeaderIconAsset(theme)} style={styles.optionIcon} resizeMode="contain" />
                    </View>
                    <Text style={[styles.optionLabel, { color: selected ? colors.primary[600] : colors.text.primary }]}>
                      {t(iconThemeTranslationKey[theme])}
                    </Text>
                    {selected ? <MaterialIcons name="check-circle" size={iconSize.md} color={colors.primary[600]} /> : null}
                  </Pressable>
                );
              })}
            </View>
          </View>
        </View>
      </Modal>
    </Screen>
  );
};

interface SettingRowProps {
  styles: ReturnType<typeof createStyles>;
  colors: AthenaColors;
  icon: keyof typeof MaterialIcons.glyphMap;
  title: string;
  subtitle?: string;
  onPress?: () => void;
}

const SettingRow = ({ styles, colors, icon, title, subtitle, onPress }: SettingRowProps) => (
  <Pressable style={styles.settingRow} onPress={onPress}>
    <View style={styles.settingIconWrap}>
      <MaterialIcons name={icon} size={iconSize.md} color={colors.primary[600]} />
    </View>
    <View style={styles.settingContent}>
      <Text style={styles.settingTitle}>{title}</Text>
      {subtitle ? <Text style={styles.settingSubtitle}>{subtitle}</Text> : null}
    </View>
    <MaterialIcons name="chevron-right" size={iconSize.md} color={colors.text.tertiary} />
  </Pressable>
);

const createStyles = (colors: AthenaColors) =>
  StyleSheet.create({
    // Profile card
    profileCard: {
      borderRadius: radius.lg,
      borderWidth: 1,
      borderColor: colors.border.default,
      backgroundColor: colors.background.surface,
      flexDirection: 'row',
      alignItems: 'center',
      padding: spacing.sm,
      gap: spacing.sm,
    },
    avatarWrap: { position: 'relative' },
    avatarImage: { width: 60, height: 60, borderRadius: radius.pill },
    avatarFallback: {
      width: 60,
      height: 60,
      borderRadius: radius.pill,
      backgroundColor: colors.background.elevated,
      alignItems: 'center',
      justifyContent: 'center',
      borderWidth: 1,
      borderColor: colors.border.default,
    },
    avatarText: { ...typography.h2, color: colors.primary[600] },
    avatarEditBadge: {
      position: 'absolute',
      bottom: 0,
      right: 0,
      width: componentSize.touchMin / 2,
      height: componentSize.touchMin / 2,
      borderRadius: radius.pill,
      backgroundColor: colors.primary[600],
      alignItems: 'center',
      justifyContent: 'center',
      borderWidth: 1.5,
      borderColor: colors.background.surface,
    },
    profileTexts: { flex: 1, gap: spacing.xxs },
    profileName: { ...typography.bodyStrong, color: colors.text.primary },
    profileMeta: { ...typography.caption, color: colors.text.secondary },
    photoActions: { flexDirection: 'row', alignItems: 'center', gap: spacing.xxs, marginTop: spacing.xxs },
    photoActionText: { ...typography.caption, color: colors.primary[600] },
    photoActionDanger: { color: colors.danger.base },
    photoActionSep: { ...typography.caption, color: colors.text.tertiary },
    // Editor
    editorCard: {
      borderRadius: radius.lg,
      borderWidth: 1,
      borderColor: colors.border.default,
      backgroundColor: colors.background.surface,
      padding: spacing.sm,
      gap: spacing.sm,
    },
    editorActions: { flexDirection: 'row', justifyContent: 'flex-end', gap: spacing.xs },
    editorActionCell: { flex: 1 },
    // Sections
    sectionLabel: { ...typography.overline, color: colors.text.tertiary, marginTop: spacing.xxs },
    chipWrap: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.xs },
    choiceChip: {
      minHeight: componentSize.chipHeight,
      borderRadius: radius.pill,
      borderWidth: 1,
      paddingHorizontal: spacing.sm,
      paddingVertical: spacing.xxs,
      justifyContent: 'center',
      alignItems: 'center',
    },
    choiceChipText: { ...typography.caption },
    settingRow: {
      borderRadius: radius.md,
      borderWidth: 1,
      borderColor: colors.border.default,
      backgroundColor: colors.background.surface,
      paddingHorizontal: spacing.sm,
      paddingVertical: spacing.xs,
      flexDirection: 'row',
      alignItems: 'center',
      gap: spacing.xs,
    },
    settingIconWrap: {
      width: componentSize.chipHeight,
      height: componentSize.chipHeight,
      borderRadius: radius.md,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: colors.background.elevated,
    },
    settingContent: { flex: 1 },
    settingTitle: { ...typography.bodyStrong, color: colors.text.primary },
    settingSubtitle: { ...typography.caption, color: colors.text.secondary, marginTop: spacing.xxs },
    creatorCard: {
      minHeight: componentSize.touchMin,
      paddingVertical: spacing.xs,
      paddingHorizontal: spacing.sm,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      gap: spacing.sm,
    },
    creatorText: { ...typography.caption, color: colors.text.secondary, flex: 1 },
    socialRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.xs },
    socialIconButton: {
      width: componentSize.touchMin,
      height: componentSize.touchMin,
      borderRadius: radius.md,
      borderWidth: 1,
      borderColor: colors.border.default,
      backgroundColor: colors.background.elevated,
      alignItems: 'center',
      justifyContent: 'center',
    },
    versionText: { textAlign: 'center', color: colors.text.tertiary, ...typography.caption, marginTop: spacing.xxs },
    modalOverlay: { flex: 1, backgroundColor: colors.overlay.scrim, justifyContent: 'flex-end' },
    modalSheet: {
      borderTopLeftRadius: radius.xl,
      borderTopRightRadius: radius.xl,
      borderWidth: 1,
      borderBottomWidth: 0,
      paddingHorizontal: spacing.md,
      paddingTop: spacing.md,
      paddingBottom: spacing.xl,
      gap: spacing.sm,
    },
    modalHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
    modalTitle: { ...typography.bodyStrong, color: colors.text.primary },
    modalOptions: { gap: spacing.xs },
    optionRow: {
      minHeight: 56,
      borderRadius: radius.md,
      borderWidth: 1,
      flexDirection: 'row',
      alignItems: 'center',
      gap: spacing.sm,
      paddingHorizontal: spacing.sm,
    },
    optionIconWrap: {
      width: 40,
      height: 40,
      borderRadius: radius.md,
      borderWidth: 1,
      borderColor: colors.border.default,
      backgroundColor: colors.background.surface,
      alignItems: 'center',
      justifyContent: 'center',
      overflow: 'hidden',
    },
    optionIcon: { width: 30, height: 30 },
    optionLabel: { ...typography.bodyStrong, flex: 1 },
  });
