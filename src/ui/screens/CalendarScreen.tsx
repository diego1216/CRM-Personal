import React from 'react';
import { View, Text, FlatList, ActivityIndicator, StyleSheet } from 'react-native';
import { useCalendarViewModel } from '../../features/calendar/viewmodel/useCalendarViewModel';
import EventCard from '../../ui/components/molecules/EventCard';

const CalendarScreen = () => {
  const { events, loading, error } = useCalendarViewModel();

  if (loading) return <ActivityIndicator size="large" style={styles.centered} />;
  if (error) return <Text style={styles.errorText}>Error: {error}</Text>;

  return (
    <FlatList
      data={events}
      keyExtractor={(item) => item.id}
      contentContainerStyle={styles.list}
      renderItem={({ item }) => <EventCard event={item} />}
    />
  );
};

const styles = StyleSheet.create({
  centered: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  errorText: { color: 'red', textAlign: 'center', marginTop: 20 },
  list: { padding: 16 },
});

export default CalendarScreen;
