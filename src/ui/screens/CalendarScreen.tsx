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
import * as Calendar from 'expo-calendar';
import * as Notifications from 'expo-notifications';
import { Calendar as RNCalendar } from 'react-native-calendars';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import type { StackNavigationProp } from '@react-navigation/stack';
import { useScheduledEventStore } from '../../store/scheduleStore';
import { RootStackParamList } from '../../presentation/navigation/AppNavigator';

const CalendarScreen = () => {
  const navigation = useNavigation<StackNavigationProp<RootStackParamList>>();
  const [calendarId, setCalendarId] = useState<string | null>(null);
  const [events, setEvents] = useState<any[]>([]);
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [modalVisible, setModalVisible] = useState(false);

  const createAppCalendar = async () => {
    const defaultSource =
      Platform.OS === 'ios'
        ? (await Calendar.getDefaultCalendarAsync()).source
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

  const loadEvents = async () => {
    if (!calendarId) return;

    const start = new Date();
    start.setMonth(start.getMonth() - 1);
    const end = new Date();
    end.setMonth(end.getMonth() + 1);
    const items = await Calendar.getEventsAsync([calendarId], start, end);

    const now = new Date();

    const filteredEvents = await Promise.all(
      items.map(async (event) => {
        if (new Date(event.endDate) < now) {
          try {
            await Calendar.deleteEventAsync(event.id);
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

    setEvents(filteredEvents.filter(Boolean));
  };

  const requestPermissions = async () => {
    const { status } = await Calendar.requestCalendarPermissionsAsync();
    if (status === 'granted') {
      await loadOrCreateCalendar();
    } else {
      Alert.alert('Permisos necesarios', 'Habilita acceso al calendario.');
    }
  };

  useEffect(() => {
    requestPermissions();
  }, []);

  useEffect(() => {
  useScheduledEventStore.getState().loadEventsFromDB();
}, []);

  useEffect(() => {
    if (calendarId) loadEvents();
  }, [calendarId]);

  useFocusEffect(
    useCallback(() => {
      if (calendarId) loadEvents();
    }, [calendarId])
  );

  const getLocalDateString = (date: Date) => {
    return date.toLocaleDateString('sv-SE');
  };

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
                    loadEvents();
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

  const getPriorityColor = (note?: string) => {
    if (!note) return 'gray';
    if (note.includes('rojo')) return 'red';
    if (note.includes('naranja')) return 'orange';
    return 'green';
  };

  const markedDates = events.reduce((acc, event) => {
    const dateStr = getLocalDateString(new Date(event.startDate));
    acc[dateStr] = { marked: true, dotColor: 'red' };
    return acc;
  }, {} as Record<string, any>);

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
      <Button
        title="➕ Crear evento"
        onPress={() => navigation.navigate('CreateEvent')}
      />

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
