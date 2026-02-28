import { useEffect, useMemo, useState } from 'react';
import { Modal, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import type { GradeScale, UCRecord } from '@/db/types';
import { FormInput } from '@/ui/components/FormInput';
import { GradeScalePicker } from '@/ui/components/GradeScalePicker';
import { IconSelector } from '@/ui/components/IconSelector';
import { athenaRadius, useAthenaTheme, type AthenaColors } from '@/ui/theme/tokens';

interface EditUCInput {
  icon: string;
  name: string;
  ects: number;
  professores: string[];
  notaMinimaAprovacao: number | null;
  escalaNatas: GradeScale | null;
  notes: string | null;
}

interface EditUCModalProps {
  visible: boolean;
  uc: UCRecord | undefined;
  isSaving: boolean;
  onSave: (input: EditUCInput) => Promise<void>;
  onClose: () => void;
  parseNumber: (s: string) => number | null;
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
    nameError: string;
    ectsError: string;
    saveError: string;
    commonError: string;
  };
}

export const EditUCModal = ({
  visible,
  uc,
  isSaving,
  onSave,
  onClose,
  parseNumber,
  labels,
}: EditUCModalProps) => {
  const { colors } = useAthenaTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);

  const [editIcon, setEditIcon] = useState('functions');
  const [editName, setEditName] = useState('');
  const [editEcts, setEditEcts] = useState('6');
  const [editProfessor, setEditProfessor] = useState('');
  const [editNotaMin, setEditNotaMin] = useState('');
  const [editEscala, setEditEscala] = useState<GradeScale | ''>('');
  const [editNotes, setEditNotes] = useState('');

  useEffect(() => {
    if (!uc) return;
    setEditIcon(uc.icon);
    setEditName(uc.name);
    setEditEcts(String(uc.ects));
    setEditProfessor(uc.professores?.[0] ?? '');
    setEditNotaMin(uc.notaMinimaAprovacao !== null ? String(uc.notaMinimaAprovacao) : '');
    setEditEscala(uc.escalaNatas ?? '');
    setEditNotes(uc.notes ?? '');
  }, [uc]);

  const handleSave = async () => {
    if (!editName.trim()) return;
    const ectsValue = parseNumber(editEcts);
    if (ectsValue === null || ectsValue < 0) return;
    await onSave({
      icon: editIcon,
      name: editName.trim(),
      ects: ectsValue,
      professores: editProfessor.trim() ? [editProfessor.trim()] : [],
      notaMinimaAprovacao: parseNumber(editNotaMin),
      escalaNatas: (editEscala || null) as GradeScale | null,
      notes: editNotes.trim() || null,
    });
  };

  return (
    <Modal transparent visible={visible} animationType="slide" onRequestClose={onClose}>
      <View style={styles.modalOverlay}>
        <View style={styles.modalSheet}>
          <ScrollView showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>{labels.title}</Text>
              <Pressable onPress={onClose}>
                <MaterialIcons name="close" size={22} color={colors.text.secondary} />
              </Pressable>
            </View>

            <View style={styles.fieldSection}>
              <Text style={styles.fieldLabel}>{labels.iconField}</Text>
              <IconSelector selectedIcon={editIcon} onSelect={setEditIcon} />
            </View>

            <FormInput label={labels.nameField} value={editName} onChangeText={setEditName} />
            <FormInput label={labels.ectsField} value={editEcts} onChangeText={setEditEcts} keyboardType="decimal-pad" />
            <FormInput label={labels.professorField} value={editProfessor} onChangeText={setEditProfessor} />
            <FormInput
              label={labels.minGradeField}
              value={editNotaMin}
              onChangeText={setEditNotaMin}
              keyboardType="decimal-pad"
              placeholder={labels.minGradePlaceholder}
            />

            <View style={styles.fieldSection}>
              <Text style={styles.fieldLabel}>{labels.gradeSystemField}</Text>
              <GradeScalePicker
                selectedScale={editEscala}
                onChange={setEditEscala}
                fromCourseLabel={labels.fromCourse}
              />
            </View>

            <FormInput label={labels.notesField} value={editNotes} onChangeText={setEditNotes} multiline />

            <View style={styles.formActions}>
              <Pressable style={styles.cancelButton} onPress={onClose}>
                <Text style={styles.cancelButtonText}>{labels.cancel}</Text>
              </Pressable>
              <Pressable
                style={[styles.saveButton, isSaving && styles.disabledButton]}
                onPress={() => { void handleSave(); }}
                disabled={isSaving}
              >
                <Text style={styles.saveButtonText}>{labels.save}</Text>
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
    modalTitle: { color: colors.text.primary, fontSize: 20, fontWeight: '800' },
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
