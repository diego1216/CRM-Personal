// src/presentation/screens/ScheduleFromCalendarScreen.tsx

import React, { useState } from 'react';
import { View, Text, Button, TextInput, StyleSheet, Alert, TouchableOpacity, Platform } from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { useScheduledEventStore } from '../../store/scheduleStore';
import { useContactsViewModel } from '../../features/contacts/viewmodel/ContactsViewModel';
import { Picker } from '@react-native-picker/picker';

const colors = [
  { label: 'Alta (Rojo)', value: 'red' },
  { label: 'Media (Naranja)', value: 'orange' },
  { label: 'Baja (Verde)', value: 'green' },
];

const ScheduleFromCalendarScreen = () => {
  const { contacts } = useContactsViewModel();
  const addEvent = useScheduledEventStore((state) => state.addEvent);

  const [selectedContactId, setSelectedContactId] = useState('');
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [showPicker, setShowPicker] = useState(false);
  const [importanceColor, setImportanceColor] = useState('red');

  const handleSave = () => {
    if (!selectedContactId) return Alert.alert('Selecciona un contacto');

    const contactName = contacts.find((c) => c.id === selectedContactId)?.name || '';

    addEvent({
      contactId: selectedContactId,
      contactName,
      datetime: selectedDate.toISOString(),
      priority: 1, // opcional
      color: importanceColor,
    });

    Alert.alert('✅ Evento creado');
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Crear Evento</Text>

      <Text style={styles.label}>Seleccionar contacto:</Text>
      <View style={styles.pickerWrapper}>
        <Picker
          selectedValue={selectedContactId}
          onValueChange={(value) => setSelectedContactId(value)}
        >
          <Picker.Item label="Seleccionar..." value="" />
          {contacts.map((contact) => (
            <Picker.Item key={contact.id} label={contact.name} value={contact.id} />
          ))}
        </Picker>
      </View>

      <Text style={styles.label}>Seleccionar fecha y hora:</Text>
      <TouchableOpacity onPress={() => setShowPicker(true)} style={styles.dateButton}>
        <Text>{selectedDate.toLocaleString()}</Text>
      </TouchableOpacity>
      {showPicker && (
        <DateTimePicker
          value={selectedDate}
          mode="datetime"
          display={Platform.OS === 'ios' ? 'spinner' : 'default'}
          onChange={(event, date) => {
            setShowPicker(false);
            if (date) setSelectedDate(date);
          }}
        />
      )}

      <Text style={styles.label}>Importancia (color):</Text>
      <View style={styles.colorRow}>
        {colors.map((c) => (
          <TouchableOpacity
            key={c.value}
            style={[
              styles.colorCircle,
              { backgroundColor: c.value },
              importanceColor === c.value && styles.selectedColor,
            ]}
            onPress={() => setImportanceColor(c.value)}
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
    borderWidth: 1, borderColor: '#ccc', borderRadius: 6, overflow: 'hidden', marginVertical: 8,
  },
  dateButton: {
    padding: 10, backgroundColor: '#eee', borderRadius: 6, marginTop: 6,
  },
  colorRow: { flexDirection: 'row', marginTop: 10 },
  colorCircle: {
    width: 30, height: 30, borderRadius: 15, marginRight: 10, borderWidth: 1, borderColor: '#aaa',
  },
  selectedColor: {
    borderWidth: 3,
    borderColor: '#000',
  },
});
