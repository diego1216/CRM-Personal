// Importación de React y hooks necesarios
import React, { useEffect, useState } from 'react';
// Importación de componentes nativos
import {
  View,
  Text,
  Button,
  StyleSheet,
  Alert,
  TouchableOpacity,
  Platform,
} from 'react-native';
// Importación del selector de fecha/hora
import DateTimePicker from '@react-native-community/datetimepicker';
// Importación del selector tipo dropdown
import { Picker } from '@react-native-picker/picker';
// Hook para obtener los contactos (desde el ViewModel)
import { useContactsViewModel } from '../../features/contacts/viewmodel/ContactsViewModel';
// Importación del API de calendario de Expo
import * as Calendar from 'expo-calendar';
// Hooks de navegación
import { RouteProp, useRoute, useNavigation } from '@react-navigation/native';
// Tipado de navegación
import { RootStackParamList } from '../../presentation/navigation/AppNavigator';

// Lista de colores disponibles para la prioridad
const colors = [
  { label: 'Alta (Rojo)', value: 'red' },
  { label: 'Media (Naranja)', value: 'orange' },
  { label: 'Baja (Verde)', value: 'green' },
];

// Tipado para acceder a los parámetros de la ruta actual
type EditEventRouteProp = RouteProp<RootStackParamList, 'EditEvent'>;

// Componente principal
const EditEventScreen = () => {
  const route = useRoute<EditEventRouteProp>(); // Obtener parámetros de la ruta
  const navigation = useNavigation(); // Navegación
  const { contacts } = useContactsViewModel(); // Obtener lista de contactos

  // Estados locales
  const [event, setEvent] = useState<Calendar.Event | null>(null); // Evento cargado
  const [calendarId, setCalendarId] = useState<string | null>(null); // ID del calendario
  const [selectedContactId, setSelectedContactId] = useState<string>(''); // ID del contacto seleccionado
  const [selectedDate, setSelectedDate] = useState(new Date()); // Fecha seleccionada
  const [selectedTime, setSelectedTime] = useState(new Date()); // Hora seleccionada
  const [importanceColor, setImportanceColor] = useState('red'); // Prioridad (color)
  const [showDatePicker, setShowDatePicker] = useState(false); // Mostrar selector de fecha
  const [showTimePicker, setShowTimePicker] = useState(false); // Mostrar selector de hora

  // useEffect para cargar el evento y configurar el calendario
  useEffect(() => {
    (async () => {
      const { status } = await Calendar.requestCalendarPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permiso denegado para acceder al calendario');
        return;
      }

      const calendars = await Calendar.getCalendarsAsync(); // Obtener calendarios del sistema
      const local = calendars.find(cal => cal.source?.name === 'Default' || cal.title === 'Eventos CRM');
      if (local) setCalendarId(local.id); // Guardar ID si existe

      const fetchedEvent = await Calendar.getEventAsync(route.params.eventId); // Obtener el evento por ID
      if (fetchedEvent) {
        setEvent(fetchedEvent); // Guardar evento
        setSelectedDate(new Date(fetchedEvent.startDate)); // Establecer fecha de inicio
        setSelectedTime(new Date(fetchedEvent.startDate)); // Establecer hora de inicio

        // Determinar color según contenido de las notas
        const color = (fetchedEvent.notes || '').includes('rojo')
          ? 'red'
          : (fetchedEvent.notes || '').includes('naranja')
          ? 'orange'
          : 'green';
        setImportanceColor(color); // Establecer prioridad
      }
    })();
  }, []);

  // Manejar cambio en selector de fecha
  const handleDateChange = (_: any, date?: Date) => {
    if (date) setSelectedDate(date);
    setShowDatePicker(false);
  };

  // Manejar cambio en selector de hora
  const handleTimeChange = (_: any, time?: Date) => {
    if (time) setSelectedTime(time);
    setShowTimePicker(false);
  };

  // Guardar los cambios en el evento del calendario
  const handleSave = async () => {
    if (!event || !calendarId) return;

    // Obtener nombre del contacto o usar el del evento existente
    const contactName =
      contacts.find((c) => c.id === selectedContactId)?.name || event.title.replace('Reunión con ', '');

    // Combinar fecha y hora
    const combinedStart = new Date(
      selectedDate.getFullYear(),
      selectedDate.getMonth(),
      selectedDate.getDate(),
      selectedTime.getHours(),
      selectedTime.getMinutes()
    );

    // Actualizar el evento
    await Calendar.updateEventAsync(event.id, {
      title: `Reunión con ${contactName}`,
      startDate: combinedStart,
      endDate: new Date(combinedStart.getTime() + 60 * 60 * 1000), // Duración: 1h
      notes: `Importancia: ${importanceColor}`,
    });

    Alert.alert('✅ Evento actualizado en el calendario del sistema');
    navigation.goBack(); // Volver atrás
  };

  // Si el evento aún no se carga, mostrar mensaje
  if (!event) {
    return (
      <View style={styles.container}>
        <Text>Evento no encontrado.</Text>
      </View>
    );
  }

  // Render principal
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
              color="white"
            />
          ))}
        </Picker>
      </View>

      {/* Botón para seleccionar fecha */}
      <View style={{ marginBottom: 12 }}>
        <Button title="Seleccionar fecha" onPress={() => setShowDatePicker(true)} />
      </View>

      {/* Mostrar selector de fecha si está activado */}
      {showDatePicker && (
        <DateTimePicker
          value={selectedDate}
          mode="date"
          display="default"
          onChange={handleDateChange}
        />
      )}

      {/* Botón para seleccionar hora */}
      <View style={{ marginBottom: 12 }}>
        <Button title="Seleccionar hora" onPress={() => setShowTimePicker(true)} />
      </View>

      {/* Mostrar selector de hora si está activado */}
      {showTimePicker && (
        <DateTimePicker
          value={selectedTime}
          mode="time"
          display="default"
          onChange={handleTimeChange}
        />
      )}

      {/* Selector visual de prioridad */}
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

      {/* Botón para guardar cambios */}
      <Button title="Guardar Cambios" onPress={handleSave} />
    </View>
  );
};

export default EditEventScreen;

// Estilos del componente
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
