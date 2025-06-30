import React, { useState } from 'react';
import {
  View, Text, FlatList, StyleSheet,
  TouchableOpacity, TextInput, Modal, Button, ActivityIndicator,
} from 'react-native';
import { useContactsViewModel } from '../../features/contacts/viewmodel/ContactsViewModel';
import { useRelationshipStore } from '../../features/relationships/viewmodel/useRelationshipStore';
import { PriorityColor, PriorityLevel } from '../../data/storage/SQLiteService';

const priorityOptions = [
  { label: 'Alta', value: 'high', color: 'red' },
  { label: 'Media', value: 'medium', color: 'orange' },
  { label: 'Baja', value: 'low', color: 'green' },
] as const;

type PriorityValue = typeof priorityOptions[number]['value'];

const ContactsScreen = () => {
  const { contacts, loading, error } = useContactsViewModel();
  const { setPriority, getPriorityByContactId } = useRelationshipStore();

  const [modalVisible, setModalVisible] = useState(false);
  const [selectedContact, setSelectedContact] = useState<any>(null);
  const [daysLimit, setDaysLimit] = useState('');
  const [color, setColor] = useState<PriorityColor>('red');
  const [selectedPriorityValue, setSelectedPriorityValue] = useState<PriorityValue>('low');
  const [search, setSearch] = useState('');

  const filteredContacts = contacts.filter((c) =>
    c.name.toLowerCase().includes(search.toLowerCase())
  );

  const openModal = (contact: any) => {
    const existing = getPriorityByContactId(contact.id);
    setSelectedContact(contact);
    setColor((existing?.color || 'red') as PriorityColor);

    const priorityMap: Record<PriorityLevel, PriorityValue> = {
      Alta: 'high',
      Media: 'medium',
      Baja: 'low',
    };

    setSelectedPriorityValue(priorityMap[existing?.priority || 'Baja']);
    setDaysLimit(existing?.daysLimit?.toString() || '');
    setModalVisible(true);
  };

  const savePriority = () => {
    if (selectedContact) {
      const selected = priorityOptions.find(p => p.value === selectedPriorityValue);
      setPriority({
        contactId: selectedContact.id,
        priority: selected?.label as PriorityLevel,
        color: selected?.color as PriorityColor,
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
  placeholderTextColor="black"
  value={search}
  onChangeText={setSearch}
  style={[styles.searchInput, { color: 'black' }]}
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

          <Text style={styles.label}>Nivel de prioridad:</Text>
          <View style={styles.colorRow}>
            {priorityOptions.map((p) => (
              <TouchableOpacity
                key={p.value}
                style={[
                  styles.colorCircle,
                  { backgroundColor: p.color },
                  selectedPriorityValue === p.value && styles.selectedCircle,
                ]}
                onPress={() => {
                  setSelectedPriorityValue(p.value);
                  setColor(p.color as PriorityColor);
                }}
              />
            ))}
          </View>
          <View style={styles.cancelButtonWrapper}>
  <Button 
    title="Guardar" 
    onPress={savePriority} 
  />
</View>

          <View style={styles.cancelButtonWrapper}>
            <Button
              title="CANCELAR"
              onPress={() => setModalVisible(false)}
              color="gray"
            />
          </View>
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

  cancelButtonWrapper: {
  marginVertical: 8,
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
