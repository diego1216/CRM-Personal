// Importa React y hooks de estado y efecto
import React, { useEffect, useState } from 'react';
// Importa componentes de UI de React Native
import {
  View,
  Text,
  Button,
  StyleSheet,
  Alert,
  TouchableOpacity,
  Platform,
} from 'react-native';
// Importa el selector de fecha y hora
import DateTimePicker from '@react-native-community/datetimepicker';
// Importa hook para obtener los contactos desde el ViewModel
import { useContactsViewModel } from '../../features/contacts/viewmodel/ContactsViewModel';
// Importa el selector tipo Picker
import { Picker } from '@react-native-picker/picker';
// Importa funcionalidades del calendario del sistema operativo
import * as Calendar from 'expo-calendar';
// Hook de navegación para regresar a la pantalla anterior
import { useNavigation } from '@react-navigation/native';

// Opciones de colores según nivel de importancia
const colors = [
  { label: 'Alta (Rojo)', value: 'red' },
  { label: 'Media (Naranja)', value: 'orange' },
  { label: 'Baja (Verde)', value: 'green' },
];

// Componente principal para agendar un evento
const ScheduleEventScreen = () => {
  const navigation = useNavigation(); // Hook para navegación
  const { contacts } = useContactsViewModel(); // Carga contactos desde el ViewModel

  // Estados del componente
  const [selectedContactId, setSelectedContactId] = useState(''); // Contacto seleccionado
  const [selectedDate, setSelectedDate] = useState(new Date()); // Fecha y hora seleccionadas
  const [importanceColor, setImportanceColor] = useState('red'); // Nivel de prioridad (color)
  const [showPicker, setShowPicker] = useState(false); // Mostrar u ocultar el DateTimePicker
  const [calendarId, setCalendarId] = useState<string | null>(null); // ID del calendario

  // useEffect para solicitar permisos y obtener o crear el calendario
  useEffect(() => {
    (async () => {
      // Solicita permiso al usuario para acceder al calendario
      const { status } = await Calendar.requestCalendarPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permiso denegado para acceder al calendario');
        return;
      }

      // Obtiene calendarios existentes en el sistema
      const calendars = await Calendar.getCalendarsAsync();
      // Busca uno con nombre "Default"
      const local = calendars.find(cal => cal.source?.name === 'Default');
      if (local) {
        setCalendarId(local.id); // Usa el existente
      } else {
        // Si no existe, crea uno nuevo personalizado
        const defaultCalendarSource =
          Platform.OS === 'ios'
            ? (await Calendar.getDefaultCalendarAsync()).source
            : {
                isLocalAccount: true,
                name: 'Expo Calendar',
                type: 'local',
              };

        // Crea el calendario personalizado y guarda su ID
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

  // Función que se ejecuta al guardar el evento
  const handleSave = async () => {
    // Validación de contacto seleccionado
    if (!selectedContactId) {
      Alert.alert('⚠️ Selecciona un contacto');
      return;
    }

    // Obtiene el nombre del contacto seleccionado
    const contactName =
      contacts.find((c) => c.id === selectedContactId)?.name || '';

    // Validación de calendario disponible
    if (!calendarId) {
      Alert.alert('Error: No se pudo acceder al calendario.');
      return;
    }

    // Crea el evento en el calendario del sistema operativo
    await Calendar.createEventAsync(calendarId, {
      title: `Reunión con ${contactName}`,
      startDate: selectedDate,
      endDate: new Date(selectedDate.getTime() + 60 * 60 * 1000), // Duración 1 hora
      timeZone: 'America/Mexico_City',
      notes: `Importancia: ${importanceColor}`,
    });

    // Alerta de éxito y regreso a la pantalla anterior
    Alert.alert('✅ Evento creado en el calendario del sistema');
    navigation.goBack();
  };

  // Render del componente
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Nuevo Evento</Text>

      {/* Selector de contacto */}
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

      {/* Selector de fecha y hora */}
      <Text style={styles.label}>Fecha y hora</Text>
      <TouchableOpacity onPress={() => setShowPicker(true)} style={styles.dateButton}>
        <Text>{selectedDate.toLocaleString()}</Text>
      </TouchableOpacity>

      {/* Renderiza el selector de fecha si está activo */}
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

      {/* Selector visual de prioridad (color) */}
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

      {/* Botón para guardar */}
      <Button title="Guardar Evento" onPress={handleSave} />
    </View>
  );
};

// Exporta el componente como default
export default ScheduleEventScreen;

// Estilos para el componente
const styles = StyleSheet.create({
  container: { padding: 20, flex: 1 }, // Contenedor principal
  title: { fontSize: 20, fontWeight: 'bold', marginBottom: 16 }, // Título de pantalla
  label: { marginTop: 12, fontWeight: '600' }, // Etiquetas de campos
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
  colorRow: { flexDirection: 'row', marginTop: 10 }, // Contenedor de colores
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
    borderColor: '#000', // Borde más grueso para el color seleccionado
  },
});
