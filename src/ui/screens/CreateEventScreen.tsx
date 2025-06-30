// Importación de hooks y componentes de React y React Native
import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  Button,
  TouchableOpacity,
  Alert,
  Platform,
} from 'react-native';

// Importación del selector de fecha y hora
import DateTimePicker, { DateTimePickerEvent } from '@react-native-community/datetimepicker';

// Importación de navegación y rutas
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';

// Importación de Expo Contacts y Calendar
import * as Contacts from 'expo-contacts';
import * as Calendar from 'expo-calendar';

// Importación del componente Picker (selector)
import { Picker } from '@react-native-picker/picker';

// Tipo para navegación: la pantalla acepta una fecha opcional como parámetro
type RootStackParamList = {
  CreateEvent: { date?: string };
};

// Componente principal de la pantalla
export const CreateEventScreen = () => {
  // Hook para navegación
  const navigation = useNavigation();

  // Hook para acceder a los parámetros de navegación
  const route = useRoute<RouteProp<RootStackParamList, 'CreateEvent'>>();

  // Si se pasa una fecha preseleccionada por parámetro, se usa; si no, se usa la fecha actual
  const preselectedDate = route.params?.date ? new Date(route.params.date) : new Date();

  // Estado para almacenar la lista de contactos disponibles
  const [contacts, setContacts] = useState<Contacts.Contact[]>([]);

  // Estado para el ID del contacto seleccionado
  const [selectedContactId, setSelectedContactId] = useState<string | null>(null);

  // Estado para el ID del calendario usado por la app
  const [calendarId, setCalendarId] = useState<string | null>(null);

  // Estados para la fecha y hora seleccionadas
  const [selectedDate, setSelectedDate] = useState<Date>(preselectedDate);
  const [selectedTime, setSelectedTime] = useState<Date>(preselectedDate);

  // Estados para mostrar u ocultar los selectores de fecha y hora
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showTimePicker, setShowTimePicker] = useState(false);

  // Estado para la prioridad seleccionada (alta, media, baja)
  const [priority, setPriority] = useState<'high' | 'medium' | 'low'>('low');

  // Función para manejar el cambio en el selector de fecha
  const handleDateChange = (_: DateTimePickerEvent, date?: Date) => {
    if (date) setSelectedDate(date);
    setShowDatePicker(false); // Oculta el picker
  };

  // Función para manejar el cambio en el selector de hora
  const handleTimeChange = (_: DateTimePickerEvent, time?: Date) => {
    if (time) setSelectedTime(time);
    setShowTimePicker(false); // Oculta el picker
  };

  // Crea un nuevo calendario local para la app
  const createAppCalendar = async () => {
    const defaultSource =
      Platform.OS === 'ios'
        ? (await Calendar.getDefaultCalendarAsync()).source
        : { isLocalAccount: true, name: 'Expo Calendar', type: Calendar.SourceType.LOCAL };

    // Crea el calendario con nombre, color, tipo y permisos adecuados
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

  // Busca un calendario existente o lo crea si no existe
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

  // Guarda el evento en el calendario
  const handleSave = async () => {
    if (!selectedContactId) return Alert.alert('Error', 'Selecciona un contacto');
    if (!calendarId) return Alert.alert('Error', 'No se pudo acceder al calendario');

    // Obtiene los datos del contacto seleccionado
    const selectedContact = contacts.find(c => c.id === selectedContactId);

    // Mapeo de prioridad a color
    const priorityMap = {
      high: 'rojo',
      medium: 'naranja',
      low: 'verde',
    };

    // Combina fecha y hora seleccionadas en un solo Date
    const combinedStart = new Date(
      selectedDate.getFullYear(),
      selectedDate.getMonth(),
      selectedDate.getDate(),
      selectedTime.getHours(),
      selectedTime.getMinutes()
    );

    // Crea el evento en el calendario
    await Calendar.createEventAsync(calendarId, {
      title: selectedContact?.name ?? 'Evento sin nombre',
      startDate: combinedStart,
      endDate: new Date(combinedStart.getTime() + 60 * 60 * 1000), // 1 hora de duración
      notes: `Prioridad: ${priorityMap[priority]}`,
    });

    // Regresa a la pantalla anterior
    navigation.goBack();
  };

  // Solicita permiso y carga contactos del dispositivo
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

  // Carga contactos y calendario cuando se monta el componente
  useEffect(() => {
    loadContacts();
    loadOrCreateCalendar();
  }, []);

  // Renderiza la interfaz
  return (
    <View style={{ flex: 1, padding: 20 }}>
      <Text style={{ fontSize: 20, marginBottom: 10 }}>Seleccionar contacto:</Text>

      {/* Selector de contacto */}
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

      {/* Botón para seleccionar fecha */}
      <View style={{ marginBottom: 12 }}>
        <Button title="Seleccionar fecha" onPress={() => setShowDatePicker(true)} />
      </View>

      {/* Selector de fecha si está visible */}
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

      {/* Selector de hora si está visible */}
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

      {/* Botón para guardar el evento */}
      <Button title="Guardar evento" onPress={handleSave} />
    </View>
  );
};
