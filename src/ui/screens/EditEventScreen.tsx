// src/ui/screens/EditEventScreen.tsx

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
import { useScheduledEventStore } from '../../store/scheduleStore';
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
  const { events, updateEvent } = useScheduledEventStore();

  const [selectedContactId, setSelectedContactId] = useState('');
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [tempDate, setTempDate] = useState<Date>(new Date());
  const [importanceColor, setImportanceColor] = useState('red');
  const [showPicker, setShowPicker] = useState(false);
  const [mode, setMode] = useState<'date' | 'time'>('date');

  const event = events.find((e) => e.id === route.params?.eventId);

  useEffect(() => {
    if (event) {
      setSelectedContactId(event.contactId);
      const parsedDate = new Date(event.datetime);
      setSelectedDate(parsedDate);
      setTempDate(parsedDate);
      setImportanceColor(event.color);
    }
  }, [event]);

  const onChange = (eventPicker: any, date?: Date) => {
    if (Platform.OS === 'android') {
      if (eventPicker.type === 'dismissed') {
        setShowPicker(false);
        setMode('date');
        return;
      }

      if (mode === 'date' && date) {
        setTempDate(date);
        setMode('time');
        setShowPicker(true); // reabrir picker para hora
      } else if (mode === 'time' && date) {
        const finalDate = new Date(
          tempDate.getFullYear(),
          tempDate.getMonth(),
          tempDate.getDate(),
          date.getHours(),
          date.getMinutes()
        );
        setSelectedDate(finalDate);
        setShowPicker(false);
        setMode('date');
      }
    } else {
      setSelectedDate(date || selectedDate);
      setShowPicker(false);
    }
  };

  const openDateTimePicker = () => {
    if (Platform.OS === 'android') {
      setMode('date');
    }
    setShowPicker(true);
  };

  const handleSave = () => {
    if (!selectedContactId) {
      Alert.alert('⚠️ Selecciona un contacto');
      return;
    }

    const contactName = contacts.find((c) => c.id === selectedContactId)?.name || '';

    updateEvent({
      id: event!.id,
      contactId: selectedContactId,
      contactName,
      datetime: selectedDate.toISOString(),
      priority: 1,
      color: importanceColor,
    });

    Alert.alert('✅ Evento actualizado correctamente');
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
          dropdownIconColor="#000"
          style={{ color: '#000' }} // ítem seleccionado (fuera del menú)
          mode="dropdown"
        >
          <Picker.Item label="Seleccionar..." value="" />
          {contacts.map((contact) => (
            <Picker.Item key={contact.id} label={contact.name} value={contact.id} 
              color='#fff'
            />
          ))}
        </Picker>
      </View>

      <Text style={styles.label}>Fecha y hora:</Text>
      <TouchableOpacity onPress={openDateTimePicker} style={styles.dateButton}>
        <Text>{selectedDate.toLocaleString()}</Text>
      </TouchableOpacity>

      {showPicker && (
        <DateTimePicker
          value={selectedDate}
          mode={mode}
          display={Platform.OS === 'ios' ? 'spinner' : 'default'}
          onChange={onChange}
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
