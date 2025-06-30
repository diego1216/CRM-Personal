// Importación de React y hooks necesarios
import React, { useState } from 'react';

// Importación de componentes de React Native
import {
  View, Text, FlatList, StyleSheet,
  TouchableOpacity, TextInput, Modal, Button, ActivityIndicator,
} from 'react-native';

// Importa el ViewModel para obtener y gestionar los contactos
import { useContactsViewModel } from '../../features/contacts/viewmodel/ContactsViewModel';

// Importa el store para leer/guardar prioridades de contacto
import { useRelationshipStore } from '../../features/relationships/viewmodel/useRelationshipStore';

// Tipos para colores y niveles de prioridad
import { PriorityColor, PriorityLevel } from '../../data/storage/SQLiteService';

// Definición de las opciones de prioridad visualizadas en el modal
const priorityOptions = [
  { label: 'Alta', value: 'high', color: 'red' },
  { label: 'Media', value: 'medium', color: 'orange' },
  { label: 'Baja', value: 'low', color: 'green' },
] as const;

// Tipo que representa los valores posibles de prioridad
type PriorityValue = typeof priorityOptions[number]['value'];

// Componente principal de la pantalla de contactos
const ContactsScreen = () => {
  // Obtiene contactos, estado de carga y errores desde el ViewModel
  const { contacts, loading, error } = useContactsViewModel();

  // Obtiene funciones del store de relaciones
  const { setPriority, getPriorityByContactId } = useRelationshipStore();

  // Estados para modal, contacto seleccionado, límite de días, prioridad, etc.
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedContact, setSelectedContact] = useState<any>(null);
  const [daysLimit, setDaysLimit] = useState('');
  const [color, setColor] = useState<PriorityColor>('red');
  const [selectedPriorityValue, setSelectedPriorityValue] = useState<PriorityValue>('low');
  const [search, setSearch] = useState('');

  // Filtro de contactos por texto ingresado
  const filteredContacts = contacts.filter((c) =>
    c.name.toLowerCase().includes(search.toLowerCase())
  );

  // Abre el modal para editar la prioridad de un contacto
  const openModal = (contact: any) => {
    const existing = getPriorityByContactId(contact.id); // Busca si ya tiene una prioridad

    setSelectedContact(contact);
    setColor((existing?.color || 'red') as PriorityColor);

    // Mapa para convertir nivel textual a valor
    const priorityMap: Record<PriorityLevel, PriorityValue> = {
      Alta: 'high',
      Media: 'medium',
      Baja: 'low',
    };

    setSelectedPriorityValue(priorityMap[existing?.priority || 'Baja']);
    setDaysLimit(existing?.daysLimit?.toString() || '');
    setModalVisible(true);
  };

  // Guarda los datos configurados en el modal
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
    setModalVisible(false); // Cierra modal
  };

  // Renderiza un contacto en la lista
  const renderItem = ({ item }: any) => {
    const priority = getPriorityByContactId(item.id); // Revisa si tiene configuración guardada

    return (
      <TouchableOpacity style={styles.item} onPress={() => openModal(item)}>
        <View style={styles.row}>
          {/* Indicador de color de prioridad */}
          {priority?.color && (
            <View style={[styles.colorIndicator, { backgroundColor: priority.color }]} />
          )}
          <View style={{ flex: 1 }}>
            <Text style={styles.name}>{item.name}</Text>
            {/* Muestra el primer número de teléfono disponible */}
            {item.phoneNumbers?.[0]?.number && (
              <Text style={styles.info}>{item.phoneNumbers[0].number}</Text>
            )}
            {/* Muestra cada cuántos días contactar si tiene prioridad */}
            {priority && (
              <Text style={styles.days}>
              🔔 Cada {priority.daysLimit} días
              </Text>
            )}
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  // Muestra spinner mientras carga
  if (loading) return <ActivityIndicator size="large" style={styles.centered} />;
  if (error) return <Text style={styles.errorText}>Error: {error}</Text>;

  // Renderizado principal
  return (
    <View style={styles.container}>
      {/* Input de búsqueda */}
      <TextInput
        placeholder="Buscar contacto..."
        placeholderTextColor="black"
        value={search}
        onChangeText={setSearch}
        style={[styles.searchInput, { color: 'black' }]}
      />

      {/* Lista de contactos filtrados */}
      <FlatList
        data={filteredContacts}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
      />

      {/* Modal para editar prioridad */}
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

          {/* Botón para guardar configuración */}
          <View style={styles.cancelButtonWrapper}>
            <Button title="Guardar" onPress={savePriority} />
          </View>

          {/* Botón para cerrar sin guardar */}
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

// Estilos visuales del componente
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
