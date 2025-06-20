// Archivo: ContactsScreen.tsx

import React, { useState } from 'react';
import { View, Text, FlatList, StyleSheet, TouchableOpacity, TextInput, Modal, Button, ActivityIndicator } from 'react-native';
import { useContactsViewModel } from '../../features/contacts/viewmodel/ContactsViewModel';
import { useRelationshipStore } from '../../features/relationships/viewmodel/useRelationshipStore';

const priorityColors = [
  { label: 'Alta', value: 'red' },
  { label: 'Media', value: 'orange' },
  { label: 'Baja', value: 'green' },
];

const ContactsScreen = () => {
  const { contacts, loading, error } = useContactsViewModel();
  const { setPriorityConfig, getPriorityByContactId } = useRelationshipStore();
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedContact, setSelectedContact] = useState<any>(null);
  const [daysLimit, setDaysLimit] = useState('');
  const [color, setColor] = useState('red');
  const [search, setSearch] = useState('');

  const filteredContacts = contacts.filter((c) =>
    c.name.toLowerCase().includes(search.toLowerCase())
  );

  const openModal = (contact: any) => {
    const existing = getPriorityByContactId(contact.id);
    setSelectedContact(contact);
    setColor(existing?.color || 'red');
    setDaysLimit(existing?.daysLimit?.toString() || '');
    setModalVisible(true);
  };

  const savePriority = () => {
    if (selectedContact) {
      setPriorityConfig({
        contactId: selectedContact.id,
        color,
        daysLimit: parseInt(daysLimit, 10) || 0,
      });
    }
    setModalVisible(false);
  };

  const renderItem = ({ item }: any) => {
    const priority = getPriorityByContactId(item.id);

    return (
      <TouchableOpacity style={styles.item} onPress={() => openModal(item)}>
        <View style={styles.row}>
          {priority?.color && (
            <View style={[styles.colorIndicator, { backgroundColor: priority.color }]} />
          )}
          <View style={{ flex: 1 }}>
            <Text style={styles.name}>{item.name}</Text>
            {item.phoneNumbers?.[0]?.number && (
              <Text style={styles.info}>{item.phoneNumbers[0].number}</Text>
            )}
            {priority && (
              <Text style={styles.days}>🔔 Cada {priority.daysLimit} días</Text>
            )}
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  if (loading) return <ActivityIndicator size="large" style={styles.centered} />;
  if (error) return <Text style={styles.errorText}>Error: {error}</Text>;

  return (
    <View style={styles.container}>
      <TextInput
        placeholder="Buscar contacto..."
        value={search}
        onChangeText={setSearch}
        style={styles.searchInput}
      />

      <FlatList
        data={filteredContacts}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
      />

      <Modal visible={modalVisible} animationType="slide">
        <View style={styles.modalContent}>
          <Text style={styles.modalTitle}>Configurar Prioridad</Text>

          <Text style={styles.label}>Días para contactar:</Text>
          <TextInput
            style={styles.input}
            keyboardType="numeric"
            value={daysLimit}
            onChangeText={setDaysLimit}
          />

          <Text style={styles.label}>Color de prioridad:</Text>
          <View style={styles.colorRow}>
            {priorityColors.map((p) => (
              <TouchableOpacity
                key={p.value}
                style={[
                  styles.colorCircle,
                  { backgroundColor: p.value },
                  color === p.value && styles.selectedCircle,
                ]}
                onPress={() => setColor(p.value)}
              />
            ))}
          </View>

          <Button title="Guardar" onPress={savePriority} />
          <Button title="Cancelar" onPress={() => setModalVisible(false)} color="gray" />
        </View>
      </Modal>
    </View>
  );
};

export default ContactsScreen;

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16 },
  centered: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  errorText: { color: 'red', textAlign: 'center', marginTop: 20 },
  searchInput: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 8,
    marginBottom: 12,
  },
  item: {
    padding: 16,
    borderBottomWidth: 1,
    borderColor: '#ccc',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  colorIndicator: {
    width: 16,
    height: 16,
    borderRadius: 8,
    marginRight: 10,
    borderColor: '#aaa',
    borderWidth: 1,
  },
  name: {
    fontWeight: 'bold',
    fontSize: 16,
  },
  info: {
    fontSize: 14,
    color: 'gray',
  },
  days: {
    marginTop: 4,
    fontSize: 13,
    color: '#333',
  },
  modalContent: {
    flex: 1,
    padding: 20,
    justifyContent: 'center',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  label: {
    marginTop: 10,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 6,
    padding: 10,
    marginTop: 4,
    marginBottom: 10,
  },
  colorRow: {
    flexDirection: 'row',
    marginVertical: 10,
  },
  colorCircle: {
    width: 30,
    height: 30,
    borderRadius: 15,
    marginRight: 10,
    borderWidth: 1,
    borderColor: '#aaa',
  },
  selectedCircle: {
    borderWidth: 3,
    borderColor: '#000',
  },
});