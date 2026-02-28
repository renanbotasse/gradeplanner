import { useMemo } from 'react';
import { Modal, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import type { GradeScale } from '@/db/types';
import { FormInput } from '@/ui/components/FormInput';
import { GradeScalePicker } from '@/ui/components/GradeScalePicker';
import { IconSelector } from '@/ui/components/IconSelector';
import { athenaRadius, useAthenaTheme, type AthenaColors } from '@/ui/theme/tokens';

interface UCFormState {
  icon: string;
  name: string;
  ects: string;
  professor: string;
  notaMinimaAprovacao: string;
  escalaNatas: GradeScale | '';
  notes: string;
}

interface CreateEditUCModalProps {
  visible: boolean;
  form: UCFormState;
  isEditing: boolean;
  isSaving: boolean;
  onChangeForm: (updater: (prev: UCFormState) => UCFormState) => void;
  onSave: () => void;
  onClose: () => void;
  labels: {
    title: string;
    iconField: string;
    nameField: string;
    ectsField: string;
    professorField: string;
    minGradeField: string;
    minGradePlaceholder: string;
    gradeSystemField: string;
    notesField: string;
    fromCourse: string;
    cancel: string;
    save: string;
    update: string;
  };
}

export const CreateEditUCModal = ({
  visible,
  form,
  isEditing,
  isSaving,
  onChangeForm,
  onSave,
  onClose,
  labels,
}: CreateEditUCModalProps) => {
  const { colors } = useAthenaTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);

  return (
    <Modal transparent visible={visible} animationType="slide" onRequestClose={onClose}>
      <View style={styles.modalOverlay}>
        <View style={styles.modalSheet}>
          <ScrollView showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
            <View style={styles.modalHeader}>
              <Text style={styles.formTitle}>{labels.title}</Text>
              <Pressable onPress={onClose}>
                <MaterialIcons name="close" size={22} color={colors.text.secondary} />
              </Pressable>
            </View>

            <View style={styles.fieldSection}>
              <Text style={styles.fieldLabel}>{labels.iconField}</Text>
              <IconSelector
                selectedIcon={form.icon}
                onSelect={(icon) => onChangeForm((p) => ({ ...p, icon }))}
              />
            </View>

            <FormInput
              label={labels.nameField}
              value={form.name}
              onChangeText={(v) => onChangeForm((p) => ({ ...p, name: v }))}
            />
            <FormInput
              label={labels.ectsField}
              value={form.ects}
              onChangeText={(v) => onChangeForm((p) => ({ ...p, ects: v }))}
              keyboardType="decimal-pad"
            />
            <FormInput
              label={labels.professorField}
              value={form.professor}
              onChangeText={(v) => onChangeForm((p) => ({ ...p, professor: v }))}
            />
            <FormInput
              label={labels.minGradeField}
              value={form.notaMinimaAprovacao}
              onChangeText={(v) => onChangeForm((p) => ({ ...p, notaMinimaAprovacao: v }))}
              keyboardType="decimal-pad"
              placeholder={labels.minGradePlaceholder}
            />

            <View style={styles.fieldSection}>
              <Text style={styles.fieldLabel}>{labels.gradeSystemField}</Text>
              <GradeScalePicker
                selectedScale={form.escalaNatas}
                onChange={(scale) => onChangeForm((p) => ({ ...p, escalaNatas: scale }))}
                fromCourseLabel={labels.fromCourse}
              />
            </View>

            <FormInput
              label={labels.notesField}
              value={form.notes}
              onChangeText={(v) => onChangeForm((p) => ({ ...p, notes: v }))}
              multiline
            />

            <View style={styles.formActions}>
              <Pressable style={styles.cancelButton} onPress={onClose}>
                <Text style={styles.cancelButtonText}>{labels.cancel}</Text>
              </Pressable>
              <Pressable
                style={[styles.saveButton, isSaving && styles.disabledButton]}
                onPress={onSave}
                disabled={isSaving}
              >
                <Text style={styles.saveButtonText}>
                  {isEditing ? labels.update : labels.save}
                </Text>
              </Pressable>
            </View>
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
};

const createStyles = (colors: AthenaColors) =>
  StyleSheet.create({
    modalOverlay: { flex: 1, backgroundColor: colors.overlay.scrim, justifyContent: 'flex-end' },
    modalSheet: {
      backgroundColor: colors.background.surface, borderTopLeftRadius: 20, borderTopRightRadius: 20,
      padding: 20, maxHeight: '90%',
    },
    modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 },
    formTitle: { color: colors.text.primary, fontSize: 20, fontWeight: '800' },
    fieldSection: { gap: 8, marginBottom: 10 },
    fieldLabel: { color: colors.text.secondary, fontSize: 13, fontWeight: '700' },
    formActions: { flexDirection: 'row', justifyContent: 'flex-end', gap: 8, marginTop: 8 },
    cancelButton: {
      height: 40, borderRadius: 10, paddingHorizontal: 14, justifyContent: 'center',
      borderWidth: 1, borderColor: colors.border.default, backgroundColor: colors.background.elevated,
    },
    cancelButtonText: { color: colors.text.secondary, fontWeight: '700' },
    saveButton: {
      height: 40, borderRadius: 10, paddingHorizontal: 18,
      justifyContent: 'center', backgroundColor: colors.primary[500],
    },
    saveButtonText: { color: colors.text.onPrimary, fontWeight: '800' },
    disabledButton: { opacity: 0.65 },
  });
