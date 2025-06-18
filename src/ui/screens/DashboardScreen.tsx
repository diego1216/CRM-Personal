import React from 'react';
import { View, Text, FlatList, StyleSheet } from 'react-native';
import { useSuggestedRelationships } from '../../features/relationships/viewmodel/useSuggestedRelationships';

const DashboardScreen = () => {
  const suggestions = useSuggestedRelationships();

  return (
    <View style={styles.container}>
      <Text style={styles.title}>🔁 Recomendaciones de Reconexión</Text>

      {suggestions.length === 0 ? (
        <Text style={styles.empty}>No necesitas reconectar por ahora 😊</Text>
      ) : (
        <FlatList
          data={suggestions}
          keyExtractor={(item) => item.contactId}
          renderItem={({ item }) => (
            <View style={styles.card}>
              <Text style={styles.name}>🧑‍🤝‍🧑 Contacto ID: {item.contactId}</Text>
              <Text>🕒 Días sin hablar: {item.daysSinceLast}</Text>
              <Text>⚠️ Prioridad: {item.priority}</Text>
              <Text>📝 Notas: {item.notes || 'Sin notas'}</Text>
            </View>
          )}
        />
      )}
    </View>
  );
};

export default DashboardScreen;

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16 },
  title: { fontSize: 20, fontWeight: 'bold', marginBottom: 10 },
  empty: { fontStyle: 'italic', color: '#666' },
  card: {
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 12,
    marginBottom: 12,
    elevation: 3,
  },
  name: { fontWeight: 'bold', marginBottom: 4 },
});
