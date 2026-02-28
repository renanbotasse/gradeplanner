import { Modal, StyleSheet, View } from 'react-native';
import { Calendar, type DateData } from 'react-native-calendars';
import { useAthenaTheme } from '@/ui/theme/tokens';
import { useAppPreferences } from '@/presentation/providers/AppPreferencesProvider';

interface DatePickerModalProps {
  visible: boolean;
  selectedDate: string;
  onSelectDate: (date: string) => void;
  onClose: () => void;
  calendarKey?: string;
}

export const DatePickerModal = ({ visible, selectedDate, onSelectDate, onClose, calendarKey }: DatePickerModalProps) => {
  const { colors, mode } = useAthenaTheme();
  const { language, weekStartDay } = useAppPreferences();

  const markedDates = selectedDate
    ? { [selectedDate]: { selected: true, selectedColor: colors.primary[500] } }
    : {};

  const calendarTheme = {
    backgroundColor: colors.background.surface,
    calendarBackground: colors.background.surface,
    textSectionTitleColor: colors.text.secondary,
    selectedDayBackgroundColor: colors.primary[500],
    selectedDayTextColor: colors.text.onPrimary,
    todayTextColor: colors.primary[500],
    dayTextColor: colors.text.primary,
    textDisabledColor: colors.text.tertiary,
    arrowColor: colors.primary[500],
    monthTextColor: colors.text.primary,
    textMonthFontWeight: '700' as const,
  };

  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
      <View style={styles.overlay}>
        <View style={[styles.container, { backgroundColor: colors.background.surface, borderColor: colors.border.default }]}>
          <Calendar
            key={calendarKey ?? `datepicker-${mode}-${language}-${weekStartDay}`}
            showSixWeeks
            hideExtraDays={false}
            firstDay={weekStartDay}
            onDayPress={(day: DateData) => {
              onSelectDate(day.dateString);
              onClose();
            }}
            markedDates={markedDates}
            theme={calendarTheme}
          />
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0,0,0,0.4)',
  },
  container: {
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    borderWidth: 1,
    paddingBottom: 16,
  },
});
