import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import type { CalendarEvent } from '../../../domain/entities/CalendarEvent';
import dayjs from 'dayjs';

interface Props {
  event: CalendarEvent;
}

const EventCard: React.FC<Props> = ({ event }) => {
  return (
    <View style={styles.card}>
      <Text style={styles.title}>📅 {event.title}</Text>
      <Text style={styles.date}>
        Inicio: {dayjs(event.start).format('DD MMM YYYY, HH:mm')}
      </Text>
      <Text style={styles.date}>
        Fin: {dayjs(event.end).format('DD MMM YYYY, HH:mm')}
      </Text>
    </View>
  );
};

export default EventCard;

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    elevation: 3,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
  },
  title: {
    fontWeight: 'bold',
    fontSize: 16,
    marginBottom: 6,
  },
  date: {
    fontSize: 14,
    color: '#444',
  },
});
