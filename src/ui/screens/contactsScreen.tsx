import React from 'react';
import { View, Text, FlatList, ActivityIndicator, StyleSheet } from 'react-native';
import { useContactsViewModel } from '../../features/contacts/viewmodel/ContactsViewModel';

const ContactsScreen = () => {
  const { contacts, loading, error } = useContactsViewModel();

  if (loading) return <ActivityIndicator size="large" />;
  if (error) return <Text>Error: {error}</Text>;

  return (
    <FlatList
      data={contacts}
      keyExtractor={(item) => item.id}
      renderItem={({ item }) => (
        <View style={styles.item}>
          <Text style={styles.name}>{item.name}</Text>
          {item.phoneNumbers?.[0]?.number && (
            <Text style={styles.info}>{item.phoneNumbers[0].number}</Text>
          )}
        </View>
      )}
    />
  );
};

export default ContactsScreen;

const styles = StyleSheet.create({
  item: {
    padding: 16,
    borderBottomWidth: 1,
    borderColor: '#ccc',
  },
  name: {
    fontWeight: 'bold',
    fontSize: 16,
  },
  info: {
    fontSize: 14,
    color: 'gray',
  },
});
