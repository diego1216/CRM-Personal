import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  Button,
  StyleSheet,
  Alert,
  TouchableOpacity,
  Platform,
} from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { useContactsViewModel } from '../../features/contacts/viewmodel/ContactsViewModel';
import { Picker } from '@react-native-picker/picker';
import * as Calendar from 'expo-calendar';
import { useNavigation } from '@react-navigation/native';

const colors = [
  { label: 'Alta (Rojo)', value: 'red' },
  { label: 'Media (Naranja)', value: 'orange' },
  { label: 'Baja (Verde)', value: 'green' },
];

const ScheduleEventScreen = () => {
  const navigation = useNavigation();
  const { contacts } = useContactsViewModel();

  const [selectedContactId, setSelectedContactId] = useState('');
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [importanceColor, setImportanceColor] = useState('red');
  const [showPicker, setShowPicker] = useState(false);
  const [calendarId, setCalendarId] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      const { status } = await Calendar.requestCalendarPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permiso denegado para acceder al calendario');
        return;
      }

      const calendars = await Calendar.getCalendarsAsync();
      const local = calendars.find(cal => cal.source?.name === 'Default');
      if (local) {
        setCalendarId(local.id);
      } else {
        const defaultCalendarSource =
          Platform.OS === 'ios'
            ? (await Calendar.getDefaultCalendarAsync()).source
            : {
                isLocalAccount: true,
                name: 'Expo Calendar',
                type: 'local',
              };



        const newCalendarId = await Calendar.createCalendarAsync({
          title: 'CRM Personal',
          color: '#3f51b5',
          entityType: Calendar.EntityTypes.EVENT,
          source: defaultCalendarSource,
          name: 'CRM Personal',
          ownerAccount: 'personal',
          accessLevel: Calendar.CalendarAccessLevel.OWNER,
        });

        setCalendarId(newCalendarId);
      }
    })();
  }, []);

  const handleSave = async () => {
    if (!selectedContactId) {
      Alert.alert('⚠️ Selecciona un contacto');
      return;
    }

    const contactName =
      contacts.find((c) => c.id === selectedContactId)?.name || '';

    if (!calendarId) {
      Alert.alert('Error: No se pudo acceder al calendario.');
      return;
    }

    await Calendar.createEventAsync(calendarId, {
      title: `Reunión con ${contactName}`,
      startDate: selectedDate,
      endDate: new Date(selectedDate.getTime() + 60 * 60 * 1000), // +1h
      timeZone: 'America/Mexico_City',
      notes: `Importancia: ${importanceColor}`,
    });

    Alert.alert('✅ Evento creado en el calendario del sistema');
    navigation.goBack();
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Nuevo Evento</Text>

      <Text style={styles.label}>Contacto</Text>
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

      <Text style={styles.label}>Fecha y hora</Text>
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

      <Text style={styles.label}>Prioridad</Text>
      <View style={styles.colorRow}>
        {colors.map((c) => (
          <TouchableOpacity
            key={c.value}
            style={[
              styles.colorCircle,
              { backgroundColor: c.value },
              importanceColor === c.value && styles.colorSelected,
            ]}
            onPress={() => setImportanceColor(c.value)}
          />
        ))}
      </View>

      <Button title="Guardar Evento" onPress={handleSave} />
    </View>
  );
};

export default ScheduleEventScreen;

const styles = StyleSheet.create({
  container: { padding: 20, flex: 1 },
  title: { fontSize: 20, fontWeight: 'bold', marginBottom: 16 },
  label: { marginTop: 12, fontWeight: '600' },
  pickerWrapper: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 6,
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
    width: 30,
    height: 30,
    borderRadius: 15,
    marginRight: 10,
    borderWidth: 1,
    borderColor: '#aaa',
  },
  colorSelected: {
    borderWidth: 3,
    borderColor: '#000',
  },
});
