// Importa React y el hook useState para manejar estados locales
import React, { useState } from 'react';

// Importa componentes de React Native necesarios para la UI
import {
  View, Text, FlatList, StyleSheet,
  TouchableOpacity, TextInput, Modal, Button, ActivityIndicator,
} from 'react-native';

// Hook personalizado que obtiene contactos desde el ViewModel
import { useContactsViewModel } from '../../features/contacts/viewmodel/ContactsViewModel';

// Store centralizado para obtener y actualizar las prioridades de los contactos
import { useRelationshipStore } from '../../features/relationships/viewmodel/useRelationshipStore';

// Tipos definidos para manejar niveles de prioridad y colores asociados
import { PriorityColor, PriorityLevel } from '../../data/storage/SQLiteService';

// Lista de opciones de prioridad con su valor, etiqueta y color
const priorityOptions = [
  { label: 'Alta', value: 'high', color: 'red' },
  { label: 'Media', value: 'medium', color: 'orange' },
  { label: 'Baja', value: 'low', color: 'green' },
] as const;

// Define un tipo basado en los valores posibles de prioridad
type PriorityValue = typeof priorityOptions[number]['value'];

// Componente principal de la pantalla de contactos
const ContactsScreen = () => {
  // Obtiene los contactos, el estado de carga y posibles errores
  const { contacts, loading, error } = useContactsViewModel();

  // Acciones del store para setear o leer prioridades asignadas a contactos
  const { setPriority, getPriorityByContactId } = useRelationshipStore();

  // Estados internos del componente
  const [modalVisible, setModalVisible] = useState(false); // Controla visibilidad del modal
  const [selectedContact, setSelectedContact] = useState<any>(null); // Contacto seleccionado
  const [daysLimit, setDaysLimit] = useState(''); // Límite de días para volver a contactar
  const [selectedPriorityValue, setSelectedPriorityValue] = useState<PriorityValue>('low'); // Valor de prioridad seleccionado
  const [search, setSearch] = useState(''); // Texto del input de búsqueda

  // Filtra los contactos según el texto ingresado por el usuario
  const filteredContacts = contacts.filter((c) =>
    c.name?.toLowerCase().includes(search.toLowerCase())
  );

  // Abre el modal con la información del contacto seleccionado
  const openModal = (contact: any) => {
    const existing = getPriorityByContactId(contact.id); // Busca si ya tenía prioridad asignada
    setSelectedContact(contact); // Guarda el contacto actual

    // Mapea del texto a valor interno de prioridad
    const priorityMap: Record<PriorityLevel, PriorityValue> = {
      Alta: 'high',
      Media: 'medium',
      Baja: 'low',
    };

    // Pre-carga los valores existentes si están presentes
    setSelectedPriorityValue(priorityMap[existing?.priority || 'Baja']);
    setDaysLimit(existing?.daysLimit?.toString() ?? '');
    setModalVisible(true); // Muestra el modal
  };

  // Guarda los datos configurados en el modal en el store global
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
    setModalVisible(false); // Cierra el modal
  };

  // Renderiza cada contacto en la lista
  const renderItem = ({ item }: any) => {
    const priority = getPriorityByContactId(item.id); // Verifica si tiene prioridad asignada

    return (
      <TouchableOpacity style={styles.item} onPress={() => openModal(item)}>
        <View style={styles.row}>
          {/* Muestra un círculo del color de la prioridad si existe */}
          {priority?.color && (
            <View style={[styles.colorIndicator, { backgroundColor: priority.color }]} />
          )}

          {/* Información textual del contacto */}
          <View style={{ flex: 1 }}>
            <Text style={styles.name}>{item.name ?? 'Sin nombre'}</Text>

            {/* Muestra número de teléfono si está disponible */}
            {item.phoneNumbers?.[0]?.number && (
              <Text style={styles.info}>{item.phoneNumbers[0].number}</Text>
            )}

            {/* Muestra cada cuántos días contactar si hay prioridad */}
            {priority && (
              <Text style={styles.days}>🔔 Cada {priority.daysLimit ?? '?'} días</Text>
            )}
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  // Si los datos aún están cargando, muestra un spinner
  if (loading) return <ActivityIndicator size="large" style={styles.centered} />;
  // Si hubo error en la carga, muestra el error
  if (error) return <Text style={styles.errorText}>Error: {error}</Text>;

  // Render principal del componente
  return (
    <View style={styles.container}>
      {/* Input para buscar por nombre */}
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
        keyExtractor={(item) => item.id?.toString() ?? Math.random().toString()}
        renderItem={renderItem}
      />

      {/* Modal para asignar prioridad */}
      <Modal visible={modalVisible} animationType="slide">
        <View style={styles.modalContent}>
          <Text style={styles.modalTitle}>Configurar Prioridad</Text>

          {/* Campo para establecer días límite */}
          <Text style={styles.label}>Días para contactar:</Text>
          <TextInput
            style={styles.input}
            keyboardType="numeric"
            value={daysLimit}
            onChangeText={setDaysLimit}
          />

          {/* Opciones visuales para asignar prioridad */}
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
                onPress={() => setSelectedPriorityValue(p.value)}
              >
                {/* Check de selección si está activa */}
                {selectedPriorityValue === p.value && (
                  <Text style={styles.check}>✓</Text>
                )}
              </TouchableOpacity>
            ))}
          </View>

          {/* Botón para guardar */}
          <View style={styles.cancelButtonWrapper}>
            <Button title="Guardar" onPress={savePriority} />
          </View>

          {/* Botón para cancelar sin guardar */}
          <View style={styles.cancelButtonWrapper}>
            <Button title="CANCELAR" onPress={() => setModalVisible(false)} color="gray" />
          </View>
        </View>
      </Modal>
    </View>
  );
};

export default ContactsScreen;

// Estilos para los elementos del componente
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
    alignItems: 'center',
    justifyContent: 'center',
  },
  selectedCircle: {
    borderWidth: 3,
    borderColor: '#000',
  },
  check: {
    color: '#fff',
    fontWeight: 'bold',
  },
});
