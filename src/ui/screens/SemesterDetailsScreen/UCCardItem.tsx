import { useMemo } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import type { UCRecord } from '@/db/types';
import type { UCStatus } from '@/core/models';
import { StatusPill } from '@/ui/components/StatusPill';
import { athenaRadius, useAthenaTheme, type AthenaColors } from '@/ui/theme/tokens';

interface UCCardItemProps {
  uc: UCRecord;
  status: UCStatus | undefined;
  onPress: () => void;
  onEdit: () => void;
  onDelete: () => void;
  editLabel: string;
  deleteLabel: string;
}

export const UCCardItem = ({
  uc,
  status,
  onPress,
  onEdit,
  onDelete,
  editLabel,
  deleteLabel,
}: UCCardItemProps) => {
  const { colors } = useAthenaTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);
  const iconName = (uc.icon ?? 'functions') as keyof typeof MaterialIcons.glyphMap;

  return (
    <Pressable style={styles.subjectCard} onPress={onPress}>
      <View style={styles.subjectLeft}>
        <View style={styles.subjectIconWrap}>
          <MaterialIcons name={iconName} size={20} color={colors.primary[600]} />
        </View>
        <View style={styles.subjectContent}>
          <Text style={styles.subjectName}>{uc.name}</Text>
          <Text style={styles.subjectMeta}>{uc.ects} ECTS</Text>
          {uc.professores?.length > 0 && (
            <Text style={styles.subjectProfessor}>{uc.professores.join(', ')}</Text>
          )}
        </View>
      </View>

      <View style={styles.subjectRight}>
        {status && <StatusPill status={status} />}
        <MaterialIcons name="chevron-right" size={20} color={colors.text.tertiary} />
      </View>

      <View style={styles.subjectActions}>
        <Pressable style={styles.actionButton} onPress={onEdit}>
          <MaterialIcons name="edit" size={16} color={colors.text.secondary} />
          <Text style={styles.actionButtonText}>{editLabel}</Text>
        </Pressable>
        <Pressable style={styles.actionButton} onPress={onDelete}>
          <MaterialIcons name="delete-outline" size={18} color={colors.danger.base} />
          <Text style={[styles.actionButtonText, { color: colors.danger.base }]}>{deleteLabel}</Text>
        </Pressable>
      </View>
    </Pressable>
  );
};

const createStyles = (colors: AthenaColors) =>
  StyleSheet.create({
    subjectCard: {
      borderRadius: athenaRadius.md, borderWidth: 1, borderColor: colors.border.default,
      backgroundColor: colors.background.surface, padding: 12, gap: 10,
    },
    subjectLeft: { flexDirection: 'row', alignItems: 'center', gap: 10 },
    subjectContent: { flex: 1 },
    subjectIconWrap: { width: 40, height: 40, borderRadius: 10, backgroundColor: colors.background.elevated, alignItems: 'center', justifyContent: 'center' },
    subjectName: { color: colors.text.primary, fontSize: 19, fontWeight: '800' },
    subjectMeta: { color: colors.text.secondary, fontSize: 13, marginTop: 1 },
    subjectProfessor: { color: colors.text.tertiary, fontSize: 12, marginTop: 1 },
    subjectRight: { position: 'absolute', right: 12, top: 10, flexDirection: 'row', alignItems: 'center', gap: 6 },
    subjectActions: { borderTopWidth: 1, borderTopColor: colors.border.default, paddingTop: 8, flexDirection: 'row', justifyContent: 'space-between' },
    actionButton: { flexDirection: 'row', alignItems: 'center', gap: 4 },
    actionButtonText: { color: colors.text.secondary, fontSize: 13, fontWeight: '700' },
  });
