import React, { useState } from 'react';
import { View, Text, FlatList, StyleSheet, TouchableOpacity, Modal } from 'react-native';
import { useScheduledEventStore } from '../../store/scheduleStore';
import { Calendar } from 'react-native-calendars';

const CalendarScreen = () => {
  const { events } = useScheduledEventStore();
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [showList, setShowList] = useState(false);

  // Eventos agrupados por fecha
  const grouped = events.reduce<Record<string, typeof events>>((acc, event) => {
    const date = event.datetime.split('T')[0];
    if (!acc[date]) acc[date] = [];
    acc[date].push(event);
    return acc;
  }, {});

  // Marcar fechas con eventos
  const markedDates = Object.keys(grouped).reduce((acc, date) => {
    acc[date] = { marked: true, dotColor: 'yellow' };
    return acc;
  }, {} as Record<string, any>);

  const renderItem = ({ item }: { item: typeof events[0] }) => (
    <View style={[styles.eventCard, { borderLeftColor: item.color }]}>
      <Text style={styles.contact}>{item.contactName}</Text>
      <Text style={styles.datetime}>🕒 {new Date(item.datetime).toLocaleString()}</Text>
      <Text style={styles.priority}>Prioridad: {item.priority}</Text>
    </View>
  );

  return (
    <View style={styles.container}>
      <TouchableOpacity
        onPress={() => setShowList(!showList)}
        style={styles.button}
      >
        <Text style={styles.buttonText}>
          {showList ? 'Ocultar eventos' : 'Ver eventos agendados 📋'}
        </Text>
      </TouchableOpacity>

      {showList ? (
        <FlatList
          data={[...events].sort((a, b) => new Date(a.datetime).getTime() - new Date(b.datetime).getTime())}
          keyExtractor={(item) => item.id}
          renderItem={renderItem}
        />
      ) : (
        <>
          <Calendar
            markedDates={{
              ...markedDates,
              ...(selectedDate && { [selectedDate]: { selected: true, selectedColor: '#3f51b5' } }),
            }}
            onDayPress={(day) => {
              setSelectedDate(day.dateString);
              setModalVisible(true);
            }}
          />

          <Modal visible={modalVisible} transparent animationType="slide">
            <View style={styles.modal}>
              <View style={styles.modalContent}>
                <Text style={styles.modalTitle}>Eventos para {selectedDate}</Text>
                <FlatList
                  data={grouped[selectedDate!] || []}
                  keyExtractor={(item) => item.id}
                  renderItem={renderItem}
                  ListEmptyComponent={<Text style={styles.noEvents}>Sin eventos para esta fecha.</Text>}
                />
                <TouchableOpacity onPress={() => setModalVisible(false)} style={styles.closeButton}>
                  <Text style={styles.buttonText}>Cerrar</Text>
                </TouchableOpacity>
              </View>
            </View>
          </Modal>
        </>
      )}
    </View>
  );
};

export default CalendarScreen;

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16 },
  button: {
    backgroundColor: '#3f51b5',
    padding: 12,
    borderRadius: 8,
    marginBottom: 10,
    alignItems: 'center',
  },
  buttonText: { color: '#fff', fontWeight: 'bold' },
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
  priority: { color: '#888' },
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
    maxHeight: '80%',
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
  noEvents: { textAlign: 'center', color: '#888', marginTop: 10 },
});
