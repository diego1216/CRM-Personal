// src/ui/screens/CreateEventScreen.tsx
import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  Button,
  TouchableOpacity,
  Alert,
  Platform,
} from 'react-native';
import DateTimePicker, { DateTimePickerEvent } from '@react-native-community/datetimepicker';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import * as Contacts from 'expo-contacts';
import * as Calendar from 'expo-calendar';
import { Picker } from '@react-native-picker/picker';

type RootStackParamList = {
  CreateEvent: { date?: string };
};

export const CreateEventScreen = () => {
  const navigation = useNavigation();
  const route = useRoute<RouteProp<RootStackParamList, 'CreateEvent'>>();

  const preselectedDate = route.params?.date ? new Date(route.params.date) : new Date();

  const [contacts, setContacts] = useState<Contacts.Contact[]>([]);
  const [selectedContactId, setSelectedContactId] = useState<string | null>(null);
  const [calendarId, setCalendarId] = useState<string | null>(null);
  const [selectedDate, setSelectedDate] = useState<Date>(preselectedDate);
  const [selectedTime, setSelectedTime] = useState<Date>(preselectedDate);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showTimePicker, setShowTimePicker] = useState(false);
  const [priority, setPriority] = useState<'high' | 'medium' | 'low'>('low');

  const handleDateChange = (_: DateTimePickerEvent, date?: Date) => {
    if (date) setSelectedDate(date);
    setShowDatePicker(false);
  };

  const handleTimeChange = (_: DateTimePickerEvent, time?: Date) => {
    if (time) setSelectedTime(time);
    setShowTimePicker(false);
  };

  const createAppCalendar = async () => {
    const defaultSource =
      Platform.OS === 'ios'
        ? (await Calendar.getDefaultCalendarAsync()).source
        : { isLocalAccount: true, name: 'Expo Calendar', type: Calendar.SourceType.LOCAL };

    const id = await Calendar.createCalendarAsync({
      title: 'Eventos CRM',
      color: 'blue',
      entityType: Calendar.EntityTypes.EVENT,
      source: defaultSource,
      name: 'CRM Personal',
      accessLevel: Calendar.CalendarAccessLevel.OWNER,
      ownerAccount: 'personal',
    });

    return id;
  };

  const loadOrCreateCalendar = async () => {
    const calendars = await Calendar.getCalendarsAsync();
    const existing = calendars.find(c => c.title === 'Eventos CRM');
    if (existing) {
      setCalendarId(existing.id);
    } else {
      const newId = await createAppCalendar();
      setCalendarId(newId);
    }
  };

  const handleSave = async () => {
    if (!selectedContactId) return Alert.alert('Error', 'Selecciona un contacto');
    if (!calendarId) return Alert.alert('Error', 'No se pudo acceder al calendario');

    const selectedContact = contacts.find(c => c.id === selectedContactId);

    const priorityMap = {
      high: 'rojo',
      medium: 'naranja',
      low: 'verde',
    };

    
    const combinedStart = new Date(
      selectedDate.getFullYear(),
      selectedDate.getMonth(),
      selectedDate.getDate(),
      selectedTime.getHours(),
      selectedTime.getMinutes()
    );

    await Calendar.createEventAsync(calendarId, {
      title: selectedContact?.name ?? 'Evento sin nombre',
      startDate: combinedStart,
      endDate: new Date(combinedStart.getTime() + 60 * 60 * 1000), // duración 1h
      notes: `Prioridad: ${priorityMap[priority]}`,
     
    });

    navigation.goBack();
  };

  const loadContacts = async () => {
    const { status } = await Contacts.requestPermissionsAsync();
    if (status === 'granted') {
      const { data } = await Contacts.getContactsAsync({
        fields: [Contacts.Fields.Name],
      });
      setContacts(data);
    } else {
      Alert.alert('Permiso requerido', 'No se pudo acceder a tus contactos.');
    }
  };

  useEffect(() => {
    loadContacts();
    loadOrCreateCalendar();
  }, []);

  return (
    <View style={{ flex: 1, padding: 20 }}>
      <Text style={{ fontSize: 20, marginBottom: 10 }}>Seleccionar contacto:</Text>

      <View style={{
        borderWidth: 1,
        borderColor: '#ccc',
        borderRadius: 8,
        marginBottom: 20,
        overflow: 'hidden'
      }}>
         <Picker
          selectedValue={selectedContactId}
          onValueChange={(value) => setSelectedContactId(value)}
          style={{ color: 'black' }}
          dropdownIconColor="black"
        >
          <Picker.Item label="Selecciona el contacto" value={null} />
          {contacts.map((contact) => (
            <Picker.Item
              key={contact.id}
              label={contact.name}
              value={contact.id}
              color="white"
            />
          ))}
        </Picker>
      </View>

      <View style={{ marginBottom: 12 }}>
  <Button title="Seleccionar fecha" onPress={() => setShowDatePicker(true)} />
</View>

{showDatePicker && (
  <DateTimePicker
    value={selectedDate}
    mode="date"
    display="default"
    onChange={handleDateChange}
  />
)}
        
      <View style={{ marginBottom: 12 }}>
  <Button title="Seleccionar hora" onPress={() => setShowTimePicker(true)} />
</View>

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
        {[
          { label: 'Alta', value: 'high', color: 'red' },
          { label: 'Media', value: 'medium', color: 'orange' },
          { label: 'Baja', value: 'low', color: 'green' },
        ].map(({ label, value, color }) => (
          <TouchableOpacity
            key={value}
            style={{
              padding: 10,
              borderRadius: 10,
              backgroundColor: priority === value ? color : '#eee',
              flex: 1,
              alignItems: 'center',
            }}
            onPress={() => setPriority(value as 'high' | 'medium' | 'low')}
          >
            <Text style={{ color: priority === value ? '#fff' : '#000' }}>{label}</Text>
          </TouchableOpacity>
        ))}
      </View>

      <Button title="Guardar evento" onPress={handleSave} />
    </View>
  );
};
