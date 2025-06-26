import React, { useState } from 'react';
import { View, Text, TextInput, Button, StyleSheet, Alert } from 'react-native';
import { useRoute, useNavigation } from '@react-navigation/native';
import type { RouteProp } from '@react-navigation/native';
import { RootStackParamList } from '../../presentation/navigation/AppNavigator';
import { useScheduledEventStore } from '../../store/scheduleStore';
import { Picker } from '@react-native-picker/picker';

const EditEventScreen = () => {
  const route = useRoute<RouteProp<RootStackParamList, 'EditEvent'>>();
  const navigation = useNavigation();
  const { eventId } = route.params;

  const { events, updateEvent, removeEvent } = useScheduledEventStore();
  const event = events.find((e) => e.id === eventId);

  const [contactName, setContactName] = useState(event?.contactName || '');
  const [datetime, setDatetime] = useState(event?.datetime || new Date().toISOString());
  const [priority, setPriority] = useState(event?.priority.toString() || '1');
  const [color, setColor] = useState(event?.color || 'red');

  const handleSave = () => {
    if (!event) return;

    updateEvent({
      id: eventId,
      contactId: event.contactId,
      contactName,
      datetime,
      priority: parseInt(priority),
      color,
    });

    Alert.alert('✅ Evento actualizado');
    navigation.goBack();
  };

  const handleDelete = () => {
    Alert.alert('Eliminar evento', '¿Estás seguro?', [
      { text: 'Cancelar', style: 'cancel' },
      {
        text: 'Eliminar', style: 'destructive', onPress: () => {
          removeEvent(eventId);
          navigation.goBack();
        },
      },
    ]);
  };

  if (!event) return <Text>Evento no encontrado</Text>;

  return (
    <View style={styles.container}>
      <Text style={styles.label}>Nombre del contacto:</Text>
      <TextInput
        style={styles.input}
        value={contactName}
        onChangeText={setContactName}
      />

      <Text style={styles.label}>Fecha y hora:</Text>
      <TextInput
        style={styles.input}
        value={datetime}
        onChangeText={setDatetime}
      />

      <Text style={styles.label}>Prioridad:</Text>
      <TextInput
        style={styles.input}
        value={priority}
        onChangeText={setPriority}
        keyboardType="numeric"
      />

      <Text style={styles.label}>Color:</Text>
      <Picker selectedValue={color} onValueChange={(val) => setColor(val)}>
        <Picker.Item label="Rojo" value="red" />
        <Picker.Item label="Naranja" value="orange" />
        <Picker.Item label="Verde" value="green" />
      </Picker>

      <Button title="Guardar cambios" onPress={handleSave} color="#4CAF50" />
      <View style={{ marginVertical: 10 }} />
      <Button title="Eliminar evento" onPress={handleDelete} color="#f44336" />
    </View>
  );
};

export default EditEventScreen;

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16 },
  label: { fontWeight: 'bold', marginTop: 12 },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    padding: 8,
    borderRadius: 6,
    marginTop: 4,
  },
});
