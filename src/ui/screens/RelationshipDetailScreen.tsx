// Importa React y useState para manejo de estado
import React, { useState } from 'react';
// Importa componentes nativos de React Native
import {
  View,
  Text,
  TextInput,
  Alert,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';
// Importa hook para acceder a parámetros de navegación
import { useRoute } from '@react-navigation/native';
// Importa el store para obtener y guardar la configuración de relación
import { useRelationshipStore } from '../../features/relationships/viewmodel/useRelationshipStore';

// Componente para configurar la relación de un contacto
const RelationshipDetailScreen = () => {
  // Obtiene los parámetros de la ruta (en este caso, el ID del contacto)
  const route = useRoute<any>();
  const contactId = route.params?.contactId;

  // Extrae funciones del store: obtener y establecer prioridad
  const { setPriority, getPriorityByContactId } = useRelationshipStore();

  // Obtiene la configuración actual del contacto (si existe)
  const existing = getPriorityByContactId(contactId);

  // Estado para los días límite, se inicializa con el valor actual si existe
  const [daysLimit, setDaysLimit] = useState(
    existing?.daysLimit?.toString() || ''
  );

  // Estado para el color de prioridad (rojo, naranja, verde)
  const [color, setColor] = useState<'red' | 'orange' | 'green'>(existing?.color || 'green');

  // Estado para el valor de prioridad en formato interno ('high', 'medium', 'low')
  const [priority, setPriorityValue] = useState<'high' | 'medium' | 'low'>(
    (() => {
      // Convierte el texto de prioridad a valor interno
      switch (existing?.priority) {
        case 'Alta': return 'high';
        case 'Media': return 'medium';
        case 'Baja': return 'low';
        default: return 'medium'; // Valor por defecto
      }
    })()
  );

  // Función para guardar los cambios
  const handleSave = () => {
    // Valida que se haya ingresado un número válido de días
    if (!daysLimit || isNaN(Number(daysLimit))) {
      Alert.alert('Error', 'Por favor ingresa un número válido de días');
      return;
    }

    // Mapea la prioridad interna al texto mostrado
    const mappedPriority = priority === 'high'
      ? 'Alta'
      : priority === 'medium'
        ? 'Media'
        : 'Baja';

    // Llama a la función del store para guardar la configuración
    setPriority({
      contactId,
      priority: mappedPriority,
      color,
      daysLimit: parseInt(daysLimit, 10),
    });

    // Muestra mensaje de confirmación
    Alert.alert('✅ Relación actualizada correctamente');
  };

  // Interfaz del componente
  return (
    <View style={styles.container}>
      {/* Título */}
      <Text style={styles.title}>Configurar Relación</Text>

      {/* Campo para ingresar los días límite */}
      <Text style={styles.label}>Días límite para reconectar:</Text>
      <TextInput
        style={styles.input}
        keyboardType="numeric"
        value={daysLimit}
        onChangeText={setDaysLimit}
        placeholder="Ej: 30"
      />

      {/* Selector de prioridad */}
      <Text style={styles.label}>Seleccionar prioridad:</Text>
      <View style={styles.row}>
        {/* Renderiza opciones de prioridad */}
        {[
          { label: 'Alta', value: 'high', color: 'red' },
          { label: 'Media', value: 'medium', color: 'orange' },
          { label: 'Baja', value: 'low', color: 'green' },
        ].map((item) => (
          <TouchableOpacity
            key={item.value}
            style={[
              styles.option,
              {
                backgroundColor: priority === item.value ? item.color : '#ccc',
              },
            ]}
            onPress={() => {
              setPriorityValue(item.value as 'high' | 'medium' | 'low'); // Cambia la prioridad seleccionada
              setColor(item.color as 'red' | 'orange' | 'green');         // Cambia el color correspondiente
            }}
          >
            <Text style={{ color: priority === item.value ? '#fff' : '#000' }}>
              {item.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Botón para guardar */}
      <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
        <Text style={{ color: '#fff', fontWeight: 'bold' }}>Guardar</Text>
      </TouchableOpacity>
    </View>
  );
};

// Exporta el componente como default
export default RelationshipDetailScreen;

// Estilos del componente
const styles = StyleSheet.create({
  container: { flex: 1, padding: 20 }, // Contenedor general
  title: { fontSize: 22, fontWeight: 'bold', marginBottom: 20 }, // Título principal
  label: { marginTop: 10 }, // Etiquetas de campos
  input: {
    borderWidth: 1,
    borderColor: '#999',
    borderRadius: 8,
    padding: 10,
    marginTop: 5,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginVertical: 15,
  },
  option: {
    flex: 1,
    marginHorizontal: 5,
    padding: 10,
    borderRadius: 8,
    alignItems: 'center',
  },
  saveButton: {
    backgroundColor: '#3f51b5',
    padding: 15,
    borderRadius: 10,
    marginTop: 20,
    alignItems: 'center',
  },
});
