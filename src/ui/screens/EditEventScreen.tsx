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
import { Picker } from '@react-native-picker/picker';
import { useContactsViewModel } from '../../features/contacts/viewmodel/ContactsViewModel';
import * as Calendar from 'expo-calendar';
import { RouteProp, useRoute, useNavigation } from '@react-navigation/native';
import { RootStackParamList } from '../../presentation/navigation/AppNavigator';

const colors = [
  { label: 'Alta (Rojo)', value: 'red' },
  { label: 'Media (Naranja)', value: 'orange' },
  { label: 'Baja (Verde)', value: 'green' },
];

type EditEventRouteProp = RouteProp<RootStackParamList, 'EditEvent'>;

const EditEventScreen = () => {
  const route = useRoute<EditEventRouteProp>();
  const navigation = useNavigation();
  const { contacts } = useContactsViewModel();

  const [event, setEvent] = useState<Calendar.Event | null>(null);
  const [calendarId, setCalendarId] = useState<string | null>(null);
  const [selectedContactId, setSelectedContactId] = useState<string>('');
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [selectedTime, setSelectedTime] = useState(new Date());
  const [importanceColor, setImportanceColor] = useState('red');
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showTimePicker, setShowTimePicker] = useState(false);

  useEffect(() => {
    (async () => {
      const { status } = await Calendar.requestCalendarPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permiso denegado para acceder al calendario');
        return;
      }

      const calendars = await Calendar.getCalendarsAsync();
      const local = calendars.find(cal => cal.source?.name === 'Default' || cal.title === 'Eventos CRM');
      if (local) setCalendarId(local.id);

      const fetchedEvent = await Calendar.getEventAsync(route.params.eventId);
      if (fetchedEvent) {
        setEvent(fetchedEvent);
        setSelectedDate(new Date(fetchedEvent.startDate));
        setSelectedTime(new Date(fetchedEvent.startDate));
        const color = (fetchedEvent.notes || '').includes('rojo')
          ? 'red'
          : (fetchedEvent.notes || '').includes('naranja')
          ? 'orange'
          : 'green';
        setImportanceColor(color);
      }
    })();
  }, []);

  const handleDateChange = (_: any, date?: Date) => {
    if (date) setSelectedDate(date);
    setShowDatePicker(false);
  };

  const handleTimeChange = (_: any, time?: Date) => {
    if (time) setSelectedTime(time);
    setShowTimePicker(false);
  };

  const handleSave = async () => {
    if (!event || !calendarId) return;

    const contactName =
      contacts.find((c) => c.id === selectedContactId)?.name || event.title.replace('Reunión con ', '');

    const combinedStart = new Date(
      selectedDate.getFullYear(),
      selectedDate.getMonth(),
      selectedDate.getDate(),
      selectedTime.getHours(),
      selectedTime.getMinutes()
    );

    await Calendar.updateEventAsync(event.id, {
      title: `Reunión con ${contactName}`,
      startDate: combinedStart,
      endDate: new Date(combinedStart.getTime() + 60 * 60 * 1000),
      notes: `Importancia: ${importanceColor}`,
    });

    Alert.alert('✅ Evento actualizado en el calendario del sistema');
    navigation.goBack();
  };

  if (!event) {
    return (
      <View style={styles.container}>
        <Text>Evento no encontrado.</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Editar Evento</Text>

      <Text style={styles.label}>Seleccionar contacto:</Text>
      <View style={styles.pickerWrapper}>
        <Picker
          selectedValue={selectedContactId}
          onValueChange={(value) => setSelectedContactId(value)}
          style={{ color: 'black' }}
          dropdownIconColor="black"
        >
          <Picker.Item label="Selecciona el contacto" value={''} />
          {contacts.map((contact) => (
            <Picker.Item
              key={contact.id}
              label={contact.name}
              value={contact.id}
              color="black"
            />
          ))}
        </Picker>
      </View>

      <Button title="Seleccionar fecha" onPress={() => setShowDatePicker(true)} />
      {showDatePicker && (
        <DateTimePicker
          value={selectedDate}
          mode="date"
          display="default"
          onChange={handleDateChange}
        />
      )}

      <Button title="Seleccionar hora" onPress={() => setShowTimePicker(true)} />
      {showTimePicker && (
        <DateTimePicker
          value={selectedTime}
          mode="time"
          display="default"
          onChange={handleTimeChange}
        />
      )}

      <Text style={{ marginTop: 20 }}>Seleccionar prioridad:</Text>
      <View style={{ flexDirection: 'row', gap: 10, marginVertical: 10 }}>
        {colors.map((c) => (
          <TouchableOpacity
            key={c.value}
            style={{
              padding: 10,
              borderRadius: 10,
              backgroundColor: importanceColor === c.value ? c.value : '#eee',
              flex: 1,
              alignItems: 'center',
            }}
            onPress={() => setImportanceColor(c.value)}
          >
            <Text style={{ color: importanceColor === c.value ? '#fff' : '#000' }}>{c.label}</Text>
          </TouchableOpacity>
        ))}
      </View>

      <Button title="Guardar Cambios" onPress={handleSave} />
    </View>
  );
};

export default EditEventScreen;

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
  selectedColor: {
    borderWidth: 3,
    borderColor: '#000',
  },
});
