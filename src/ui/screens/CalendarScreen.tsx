// Importación de hooks y componentes necesarios de React
import React, { useEffect, useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Modal,
  Alert,
  Button,
  Platform,
} from 'react-native';

// Importación de APIs de Expo Calendar y Notifications
import * as Calendar from 'expo-calendar';
import * as Notifications from 'expo-notifications';

// Importación del componente calendario visual
import { Calendar as RNCalendar } from 'react-native-calendars';

// Importación de navegación y tipos asociados
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import type { StackNavigationProp } from '@react-navigation/stack';
import { useScheduledEventStore } from '../../store/scheduleStore';
import { RootStackParamList } from '../../presentation/navigation/AppNavigator';

// Componente principal de la pantalla de calendario
const CalendarScreen = () => {
  // Hook de navegación
  const navigation = useNavigation<StackNavigationProp<RootStackParamList>>();

  // Estados locales
  const [calendarId, setCalendarId] = useState<string | null>(null); // ID del calendario creado o existente
  const [events, setEvents] = useState<any[]>([]); // Eventos del calendario
  const [selectedDate, setSelectedDate] = useState<string | null>(null); // Fecha seleccionada
  const [modalVisible, setModalVisible] = useState(false); // Estado del modal

  // Crea un nuevo calendario si no existe (usado sólo si es necesario)
  const createAppCalendar = async () => {
    const defaultSource =
      Platform.OS === 'ios'
        ? (await Calendar.getDefaultCalendarAsync()).source // En iOS usa el calendario por defecto
        : {
            isLocalAccount: true,
            name: 'Expo Calendar',
            type: Calendar.SourceType.LOCAL,
          };

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

  // Carga un calendario existente o crea uno nuevo si no existe
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

  // Carga los eventos del calendario y elimina los eventos pasados
  const loadEvents = async () => {
    if (!calendarId) return;

    const start = new Date();
    start.setMonth(start.getMonth() - 1); // Inicio un mes atrás
    const end = new Date();
    end.setMonth(end.getMonth() + 1); // Fin un mes adelante

    const items = await Calendar.getEventsAsync([calendarId], start, end);

    const now = new Date();

    const filteredEvents = await Promise.all(
      items.map(async (event) => {
        if (new Date(event.endDate) < now) {
          try {
            await Calendar.deleteEventAsync(event.id); // Borra eventos pasados
            await Notifications.scheduleNotificationAsync({
              content: {
                title: '🗑 Evento eliminado',
                body: `El evento "${event.title}" ya ha pasado y fue eliminado.`,
              },
              trigger: null,
            });
          } catch (error) {
            console.warn(`Error al eliminar evento ${event.id}:`, error);
          }
          return null;
        }
        return event;
      })
    );

    setEvents(filteredEvents.filter(Boolean)); // Guarda sólo eventos vigentes
  };

  // Solicita permisos para acceder al calendario
  const requestPermissions = async () => {
    const { status } = await Calendar.requestCalendarPermissionsAsync();
    if (status === 'granted') {
      await loadOrCreateCalendar();
    } else {
      Alert.alert('Permisos necesarios', 'Habilita acceso al calendario.');
    }
  };

  // Ejecuta al montar el componente: pide permisos
  useEffect(() => {
    requestPermissions();
  }, []);

  // Carga eventos desde la base de datos local al iniciar
  useEffect(() => {
    useScheduledEventStore.getState().loadEventsFromDB();
  }, []);

  // Carga eventos si ya existe el calendario
  useEffect(() => {
    if (calendarId) loadEvents();
  }, [calendarId]);

  // Refresca eventos al volver a la pantalla
  useFocusEffect(
    useCallback(() => {
      if (calendarId) loadEvents();
    }, [calendarId])
  );

  // Convierte fecha a string local en formato "YYYY-MM-DD"
  const getLocalDateString = (date: Date) => {
    return date.toLocaleDateString('sv-SE');
  };

  // Muestra un diálogo con opciones al tocar un evento
  const handleEventPress = (event: any) => {
    Alert.alert(
      event.title,
      new Date(event.startDate).toLocaleString(),
      [
        {
          text: 'Editar',
          onPress: () => navigation.navigate('EditEvent', { eventId: event.id }),
        },
        {
          text: 'Eliminar',
          style: 'destructive',
          onPress: () => {
            Alert.alert(
              '¿Eliminar evento?',
              'Esta acción no se puede deshacer. ¿Estás seguro?',
              [
                { text: 'Cancelar', style: 'cancel' },
                {
                  text: 'Sí, eliminar',
                  style: 'destructive',
                  onPress: async () => {
                    await Calendar.deleteEventAsync(event.id);
                    loadEvents(); // Recarga la lista tras eliminar
                  },
                },
              ]
            );
          },
        },
        { text: 'Cerrar', style: 'cancel' },
      ]
    );
  };

  // Determina el color del evento según nota
  const getPriorityColor = (note?: string) => {
    if (!note) return 'gray';
    if (note.includes('rojo')) return 'red';
    if (note.includes('naranja')) return 'orange';
    return 'green';
  };

  // Marca en el calendario las fechas con eventos
  const markedDates = events.reduce((acc, event) => {
    const dateStr = getLocalDateString(new Date(event.startDate));
    acc[dateStr] = { marked: true, dotColor: 'red' };
    return acc;
  }, {} as Record<string, any>);

  // Renderiza cada evento en la lista del modal
  const renderItem = ({ item }: { item: any }) => (
    <TouchableOpacity onPress={() => handleEventPress(item)}>
      <View
        style={[
          styles.eventCard,
          { borderLeftColor: getPriorityColor(item.notes) },
        ]}
      >
        <Text style={styles.contact}>{item.title}</Text>
        <Text style={styles.datetime}>
          🕒 {new Date(item.startDate).toLocaleString()}
        </Text>
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      {/* Botón para crear nuevo evento */}
      <Button
        title="➕ Crear evento"
        onPress={() => navigation.navigate('CreateEvent')}
      />

      {/* Calendario interactivo */}
      <RNCalendar
        markedDates={{
          ...markedDates,
          ...(selectedDate && {
            [selectedDate]: { selected: true, selectedColor: '#3f51b5' },
          }),
        }}
        onDayPress={(day) => {
          setSelectedDate(day.dateString);
          setModalVisible(true);
        }}
      />

      {/* Modal que muestra eventos de la fecha seleccionada */}
      <Modal visible={modalVisible} transparent animationType="slide">
        <View style={styles.modal}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>
              Eventos para {selectedDate}
            </Text>
            <FlatList
              data={events.filter(
                (e) =>
                  getLocalDateString(new Date(e.startDate)) === selectedDate
              )}
              keyExtractor={(item) => item.id}
              renderItem={renderItem}
              ListEmptyComponent={
                <Text style={styles.noEvents}>
                  Sin eventos para esta fecha.
                </Text>
              }
            />
            <TouchableOpacity
              onPress={() => setModalVisible(false)}
              style={styles.closeButton}
            >
              <Text style={styles.buttonText}>Cerrar</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
};

export default CalendarScreen;

// Estilos visuales de la pantalla
const styles = StyleSheet.create({
  container: { flex: 1, padding: 16 },
  eventCard: {
    padding: 12,
    marginBottom: 10,
    backgroundColor: '#fff',
    borderRadius: 8,
    borderLeftWidth: 5,
    elevation: 2,
  },
  contact: { fontWeight: 'bold', fontSize: 16 },
  datetime: { color: '#555' },
  modal: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'center',
    padding: 20,
  },
  modalContent: {
    backgroundColor: 'white',
    padding: 16,
    borderRadius: 12,
    maxHeight: '85%',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  closeButton: {
    marginTop: 10,
    backgroundColor: '#3f51b5',
    padding: 10,
    borderRadius: 8,
    alignItems: 'center',
  },
  buttonText: { color: '#fff', fontWeight: 'bold' },
  noEvents: { textAlign: 'center', color: '#888', marginTop: 10 },
});
