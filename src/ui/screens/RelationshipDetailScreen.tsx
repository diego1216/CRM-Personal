import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  Alert,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';
import { useRoute } from '@react-navigation/native';
import { useRelationshipStore } from '../../features/relationships/viewmodel/useRelationshipStore';

const RelationshipDetailScreen = () => {
  const route = useRoute<any>();
  const contactId = route.params?.contactId;
  const { setPriorityConfig, getPriorityByContactId } = useRelationshipStore();

  const existing = getPriorityByContactId(contactId);

  const [daysLimit, setDaysLimit] = useState(
    existing?.daysLimit?.toString() || ''
  );
  const [color, setColor] = useState(existing?.color || 'green');
  const [priority, setPriority] = useState<'high' | 'medium' | 'low'>(
    existing?.priority || 'medium'
  );

  const handleSave = () => {
    if (!daysLimit || isNaN(Number(daysLimit))) {
      Alert.alert('Error', 'Por favor ingresa un número válido de días');
      return;
    }

    setPriorityConfig({
      id: Date.now().toString(),
      contactId,
      date: new Date().toISOString(),
      priority,
      color,
      daysLimit: parseInt(daysLimit),
    });

    Alert.alert('✅ Relación actualizada correctamente');
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Configurar Relación</Text>

      <Text style={styles.label}>Días límite para reconectar:</Text>
      <TextInput
        style={styles.input}
        keyboardType="numeric"
        value={daysLimit}
        onChangeText={setDaysLimit}
        placeholder="Ej: 30"
      />

      <Text style={styles.label}>Seleccionar prioridad:</Text>
      <View style={styles.row}>
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
              setPriority(item.value as 'high' | 'medium' | 'low');
              setColor(item.color);
            }}
          >
            <Text style={{ color: priority === item.value ? '#fff' : '#000' }}>
              {item.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
        <Text style={{ color: '#fff', fontWeight: 'bold' }}>Guardar</Text>
      </TouchableOpacity>
    </View>
  );
};

export default RelationshipDetailScreen;

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20 },
  title: { fontSize: 22, fontWeight: 'bold', marginBottom: 20 },
  label: { marginTop: 10 },
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
