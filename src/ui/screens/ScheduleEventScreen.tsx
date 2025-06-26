import React, { useState } from 'react';
import { View, Text, Button, StyleSheet, Alert, TouchableOpacity, Platform } from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { useScheduledEventStore } from '../../store/scheduleStore';
import { useContactsViewModel } from '../../features/contacts/viewmodel/ContactsViewModel';
import { Picker } from '@react-native-picker/picker';
import { useNavigation } from '@react-navigation/native';

const colors = [
  { label: 'Alta (Rojo)', value: 'red' },
  { label: 'Media (Naranja)', value: 'orange' },
  { label: 'Baja (Verde)', value: 'green' },
];

const ScheduleFromCalendarScreen = () => {
   const navigation = useNavigation();
  const { contacts } = useContactsViewModel();
  const addEvent = useScheduledEventStore((state) => state.addEvent);

  const [selectedContactId, setSelectedContactId] = useState('');
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [mode, setMode] = useState<'date' | 'time' | 'datetime'>(Platform.OS === 'android' ? 'date' : 'datetime');
  const [showPicker, setShowPicker] = useState(false);
  const [importanceColor, setImportanceColor] = useState('red');

  const handleSave = () => {
    if (!selectedContactId) {
      Alert.alert('⚠️ Selecciona un contacto');
      return;
    }

    const contactName = contacts.find((c) => c.id === selectedContactId)?.name || '';

    addEvent({
      contactId: selectedContactId,
      contactName,
      datetime: selectedDate.toISOString(),
      priority: 1,
      color: importanceColor,
    });

    Alert.alert('✅ Evento creado');
    navigation.goBack(); // Redirigir al calendario
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Nuevo Evento</Text>

      <Text style={styles.label}>Contacto</Text>
      <View style={styles.pickerWrapper}>
        <Picker
    selectedValue={selectedContactId}
    onValueChange={(value) => setSelectedContactId(value)}
    dropdownIconColor="#000"
    style={{ color: '#000' }} // ítem seleccionado (fuera del menú)
    mode="dropdown"
  >
    <Picker.Item label="Seleccionar..." value="" color="#999" />
    {contacts.map((contact) => (
      <Picker.Item
        key={contact.id}
        label={contact.name}
        value={contact.id}
        color="#fff" // ítems dentro del menú desplegable
      />
  ))}
</Picker>
      </View>

      <Text style={styles.label}>Fecha y hora</Text>
      <TouchableOpacity 
        onPress={() => {
          if (Platform.OS === 'android') {
            setMode('date');
          } else {
            setMode('datetime');
          }
          setShowPicker(true);
        }} 
        style={styles.dateButton}
      >
        <Text>
          {selectedDate.toLocaleDateString()} – {selectedDate.toLocaleTimeString()}
        </Text>
      </TouchableOpacity>

      {showPicker && (
        <DateTimePicker
          value={selectedDate}
          mode={Platform.OS === 'android' ? mode : 'datetime'}
          display={Platform.OS === 'ios' ? 'spinner' : 'default'}
          onChange={(event: any, date?: Date) => {
            if (Platform.OS === 'android') {
              if (mode === 'date') {
                if (event?.type === 'set' && date) {
                  setSelectedDate(date);
                  setMode('time');
                } else {
                  // Si se canceló en la selección de fecha
                  setShowPicker(false);
                }
              } else if (mode === 'time') {
                if (event?.type === 'set' && date) {
                  setSelectedDate(date);
                }
                // Cerrar picker tras seleccionar hora o cancelar
                setShowPicker(false);
                setMode('date');
              }
            } else {
              if (event?.type === 'set' && date) {
                setSelectedDate(date);
              }
              setShowPicker(false);
            }
          }}
        />
      )}

      <Text style={styles.label}>Prioridad</Text>
      <View style={styles.colorRow}>
        {colors.map((colorOption) => (
          <TouchableOpacity
            key={colorOption.value}
            style={[
              styles.colorCircle,
              importanceColor === colorOption.value && styles.colorCircleSelected,
              { backgroundColor: colorOption.value },
            ]}
            onPress={() => setImportanceColor(colorOption.value)}
          />
        ))}
      </View>

      <Button title="Guardar Evento" onPress={handleSave} />
    </View>
  );
};

export default ScheduleFromCalendarScreen;

const styles = StyleSheet.create({
  container: { padding: 20, flex: 1 },
  title: { fontSize: 20, fontWeight: 'bold', marginBottom: 16 },
  label: { marginTop: 12, fontWeight: '600' },
  pickerWrapper: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 6,
    width: '100%',
    overflow: 'hidden',
    marginVertical: 8,
  },
  dateButton: {
    padding: 10,
    backgroundColor: '#eee',
    borderRadius: 6,
    marginTop: 6,
  },
  colorRow: { flexDirection: 'row', marginTop: 10 },
  colorCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    marginRight: 10,
  },
  colorCircleSelected: {
    borderWidth: 3,
    borderColor: '#000',
  },
});
