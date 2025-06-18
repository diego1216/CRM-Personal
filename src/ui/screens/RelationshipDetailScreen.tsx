import React from 'react';
import { View, Text, StyleSheet, TextInput, Button } from 'react-native';
import { useForm, Controller } from 'react-hook-form';
import { useRelationshipStore } from '../../features/relationships/viewmodel/useRelationshipStore';
import { useNavigation, useRoute } from '@react-navigation/native';

type FormData = {
  notes: string;
  frequencyInDays: string;
  priority: string;
};

const RelationshipDetailScreen = () => {
  const navigation = useNavigation();
  const route = useRoute<any>();
  const { contactId } = route.params;

  const { relationships, addOrUpdate } = useRelationshipStore();
  const rel = relationships.find(r => r.contactId === contactId);

  const { control, handleSubmit } = useForm<FormData>({
    defaultValues: {
      notes: rel?.notes || '',
      frequencyInDays: rel?.frequencyInDays?.toString() || '15',
      priority: rel?.priority?.toString() || '3',
    },
  });

  const onSubmit = (data: FormData) => {
    addOrUpdate({
      contactId,
      notes: data.notes,
      frequencyInDays: parseInt(data.frequencyInDays),
      priority: parseInt(data.priority),
      lastInteraction: rel?.lastInteraction ?? new Date().toISOString(),
    });
    navigation.goBack();
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Editar relación con {contactId}</Text>

      <Text>📝 Notas:</Text>
      <Controller
        control={control}
        name="notes"
        render={({ field: { value, onChange } }) => (
          <TextInput
            value={value}
            onChangeText={onChange}
            placeholder="Escribe tus notas"
            style={styles.input}
          />
        )}
      />

      <Text>📆 Frecuencia deseada (días):</Text>
      <Controller
        control={control}
        name="frequencyInDays"
        render={({ field: { value, onChange } }) => (
          <TextInput
            value={value}
            onChangeText={onChange}
            keyboardType="numeric"
            style={styles.input}
          />
        )}
      />

      <Text>⚠️ Prioridad (1–5):</Text>
      <Controller
        control={control}
        name="priority"
        render={({ field: { value, onChange } }) => (
          <TextInput
            value={value}
            onChangeText={onChange}
            keyboardType="numeric"
            style={styles.input}
          />
        )}
      />

      <Button title="Guardar cambios" onPress={handleSubmit(onSubmit)} />
    </View>
  );
};

export default RelationshipDetailScreen;

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16 },
  title: { fontSize: 18, fontWeight: 'bold', marginBottom: 12 },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    padding: 8,
    marginBottom: 16,
  },
});
