import React from 'react';
import { View, Text, FlatList, StyleSheet } from 'react-native';
import { useRelationshipStore } from '../../features/relationships/viewmodel/useRelationshipStore';
import { useContactsViewModel } from '../../features/contacts/viewmodel/ContactsViewModel';
import { useScheduledEventStore } from '../../store/scheduleStore';
import { differenceInDays } from 'date-fns';

const OverdueNotificationsScreen = () => {
  const { contacts } = useContactsViewModel();
  const { getPriorityByContactId } = useRelationshipStore();
  const { events } = useScheduledEventStore();

  const overdueContacts = contacts.filter(contact => {
    const config = getPriorityByContactId(contact.id);
    if (!config?.daysLimit) return false;

    const lastEvent = [...events]
      .filter(e => e.contactId === contact.id)
      .sort((a, b) => new Date(b.datetime).getTime() - new Date(a.datetime).getTime())[0];

    const lastDate = lastEvent ? new Date(lastEvent.datetime) : null;
    const daysSince = lastDate ? differenceInDays(new Date(), lastDate) : Infinity;

    return daysSince >= config.daysLimit;
  });

  return (
    <View style={styles.container}>
      <Text style={styles.title}>🔔 Contactos pendientes por contactar</Text>
      <FlatList
        data={overdueContacts}
        keyExtractor={item => item.id}
        renderItem={({ item }) => {
          const days =
            differenceInDays(new Date(), new Date(item.nextEvent?.date ?? 0));
          return (
            <View style={styles.card}>
              <Text style={styles.name}>{item.name}</Text>
              <Text style={styles.details}>Han pasado {days} días sin contactar</Text>
            </View>
          );
        }}
        ListEmptyComponent={<Text style={styles.empty}>Todo al día 🎉</Text>}
      />
    </View>
  );
};

export default OverdueNotificationsScreen;

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16 },
  title: { fontSize: 18, fontWeight: 'bold', marginBottom: 12 },
  card: {
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 8,
    marginBottom: 10,
    borderLeftWidth: 4,
    borderLeftColor: 'red',
    elevation: 2,
  },
  name: { fontSize: 16, fontWeight: 'bold' },
  details: { fontSize: 14, color: '#666' },
  empty: { textAlign: 'center', color: '#888', marginTop: 40 },
});
