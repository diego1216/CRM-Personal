import React, { useState } from 'react';
import { View, Text, TextInput, Button, StyleSheet, Alert } from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { useScheduledEventStore } from '../../store/scheduleStore'; // <-- ruta del store

const ScheduleEventScreen = () => {
  const addEvent = useScheduledEventStore((state) => state.addEvent);

  const [contactId, setContactId] = useState('');
  const [contactName, setContactName] = useState('');
  const [datetime, setDatetime] = useState(new Date());
  const [showPicker, setShowPicker] = useState(false);
  const [priority, setPriority] = useState('1');
  const [color, setColor] = useState('#FF0000');

  const handleSchedule = () => {
    if (!contactId || !contactName || !priority || !color) {
      Alert.alert('Completa todos los campos');
      return;
    }

    addEvent({
      contactId,
      contactName,
      datetime: datetime.toISOString(),
      priority: parseInt(priority),
      color,
    });

    Alert.alert('✅ Evento agendado');
    setContactId('');
    setContactName('');
    setPriority('1');
    setColor('#FF0000');
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Agendar Evento</Text>

      <TextInput
        placeholder="ID del contacto"
        value={contactId}
        onChangeText={setContactId}
        style={styles.input}
      />
      <TextInput
        placeholder="Nombre del contacto"
        value={contactName}
        onChangeText={setContactName}
        style={styles.input}
      />

      <Button title="Seleccionar fecha y hora" onPress={() => setShowPicker(true)} />
      {showPicker && (
        <DateTimePicker
          value={datetime}
          mode="datetime"
          display="default"
          onChange={(e, date) => {
            setShowPicker(false);
            if (date) setDatetime(date);
          }}
        />
      )}

      <TextInput
        placeholder="Prioridad (color HEX)"
        value={color}
        onChangeText={setColor}
        style={styles.input}
      />

      <Button title="Guardar Evento" onPress={handleSchedule} />
    </View>
  );
};

export default ScheduleEventScreen;

const styles = StyleSheet.create({
  container: { padding: 20, flex: 1 },
  title: { fontSize: 20, fontWeight: 'bold', marginBottom: 16 },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    marginBottom: 12,
    padding: 10,
  },
});
