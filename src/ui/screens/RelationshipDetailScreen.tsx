import React, { useState } from 'react';
import { View, Text, TextInput, Button, StyleSheet, Alert, TouchableOpacity } from 'react-native';
import { useRoute } from '@react-navigation/native';
import { useRelationshipStore } from '../../features/relationships/viewmodel/useRelationshipStore';

const colors = [
  { label: 'Alta (Rojo)', value: 'red' },
  { label: 'Media (Naranja)', value: 'orange' },
  { label: 'Baja (Verde)', value: 'green' },
];

const RelationshipDetailScreen = () => {
  const route = useRoute();
  const { contactId } = route.params as { contactId: string };
  const { getPriorityByContactId, setPriorityConfig } = useRelationshipStore();

  const rel = getPriorityByContactId(contactId);
  const [color, setColor] = useState(rel?.color ?? 'red');
  const [daysLimit, setDaysLimit] = useState(rel?.daysLimit?.toString() ?? '7');

  const handleSave = () => {
    if (!daysLimit || isNaN(Number(daysLimit))) {
      Alert.alert('Por favor ingresa un número válido de días');
      return;
    }

    setPriorityConfig({
      contactId,
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
        value={daysLimit}
        onChangeText={setDaysLimit}
        keyboardType="numeric"
        style={styles.input}
      />

      <Text style={styles.label}>Importancia (color):</Text>
      <View style={styles.colorRow}>
        {colors.map((c) => (
          <TouchableOpacity
            key={c.value}
            style={[
              styles.colorCircle,
              { backgroundColor: c.value },
              color === c.value && styles.selectedColor,
            ]}
            onPress={() => setColor(c.value)}
          />
        ))}
      </View>

      <Button title="Guardar" onPress={handleSave} />
    </View>
  );
};

export default RelationshipDetailScreen;

const styles = StyleSheet.create({
  container: { padding: 20, flex: 1 },
  title: { fontSize: 20, fontWeight: 'bold', marginBottom: 16 },
  label: { marginTop: 12, fontWeight: '600' },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 6,
    padding: 8,
    marginTop: 6,
  },
  colorRow: { flexDirection: 'row', marginTop: 10 },
  colorCircle: {
    width: 30,
    height: 30,
    borderRadius: 15,
    marginRight: 10,
    borderWidth: 1,
    borderColor: '#aaa',
  },
  selectedColor: {
    borderWidth: 3,
    borderColor: '#000',
  },
});
