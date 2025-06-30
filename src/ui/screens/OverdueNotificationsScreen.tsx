// Importa React para poder usar JSX
import React from 'react';
// Importa componentes básicos de React Native
import { View, Text, FlatList, StyleSheet } from 'react-native';
// Importa el store donde se configuran las prioridades por contacto
import { useRelationshipStore } from '../../features/relationships/viewmodel/useRelationshipStore';
// Importa el ViewModel que proporciona los contactos del sistema
import { useContactsViewModel } from '../../features/contacts/viewmodel/ContactsViewModel';
// Importa el store donde están almacenados los eventos agendados
import { useScheduledEventStore } from '../../store/scheduleStore';
// Función para calcular la diferencia en días entre dos fechas
import { differenceInDays } from 'date-fns';

// Componente principal que muestra los contactos atrasados
const OverdueNotificationsScreen = () => {
  // Obtiene la lista de contactos desde el ViewModel
  const { contacts } = useContactsViewModel();
  // Obtiene la función para consultar prioridad por contacto
  const { getPriorityByContactId } = useRelationshipStore();
  // Obtiene los eventos agendados desde el store
  const { events } = useScheduledEventStore();

  // Calcula los contactos con eventos vencidos según la configuración personalizada
  const overdueContacts = contacts.filter(contact => {
    // Obtiene la configuración (días de espera y color) del contacto
    const config = getPriorityByContactId(contact.id);
    // Si no hay configuración o días definidos, descarta este contacto
    if (!config?.daysLimit) return false;

    // Filtra los eventos que correspondan al contacto y toma el más reciente
    const lastEvent = [...events]
      .filter(e => e.contactId === contact.id)
      .sort((a, b) => new Date(b.datetime).getTime() - new Date(a.datetime).getTime())[0];

    // Si existe un último evento, se convierte a Date
    const lastDate = lastEvent ? new Date(lastEvent.datetime) : null;
    // Calcula cuántos días han pasado desde ese último evento
    const daysSince = lastDate ? differenceInDays(new Date(), lastDate) : Infinity;

    // Retorna true si el número de días supera el límite configurado
    return daysSince >= config.daysLimit;
  });

  // Renderiza la interfaz
  return (
    <View style={styles.container}>
      {/* Título de la pantalla */}
      <Text style={styles.title}>🔔 Contactos pendientes por contactar</Text>
      {/* Lista de contactos atrasados */}
      <FlatList
        data={overdueContacts} // Fuente de datos
        keyExtractor={item => item.id} // Clave única para cada ítem
        renderItem={({ item }) => {
          // Calcula días desde el último evento (usado para mostrar texto)
          const days =
            differenceInDays(new Date(), new Date(item.nextEvent?.date ?? 0));
          return (
            <View style={styles.card}>
              {/* Nombre del contacto */}
              <Text style={styles.name}>{item.name}</Text>
              {/* Texto que indica hace cuántos días no se contacta */}
              <Text style={styles.details}>Han pasado {days} días sin contactar</Text>
            </View>
          );
        }}
        // Texto por defecto si no hay contactos atrasados
        ListEmptyComponent={<Text style={styles.empty}>Todo al día 🎉</Text>}
      />
    </View>
  );
};

// Exporta el componente como default
export default OverdueNotificationsScreen;

// Estilos de la pantalla
const styles = StyleSheet.create({
  container: { flex: 1, padding: 16 }, // Contenedor principal
  title: { fontSize: 18, fontWeight: 'bold', marginBottom: 12 }, // Estilo del título
  card: {
    backgroundColor: '#fff', // Fondo blanco
    padding: 16, // Espaciado interno
    borderRadius: 8, // Bordes redondeados
    marginBottom: 10, // Espaciado inferior
    borderLeftWidth: 4, // Borde izquierdo más grueso
    borderLeftColor: 'red', // Color rojo (alerta)
    elevation: 2, // Sombra (Android)
  },
  name: { fontSize: 16, fontWeight: 'bold' }, // Estilo del nombre
  details: { fontSize: 14, color: '#666' }, // Estilo del detalle de días
  empty: { textAlign: 'center', color: '#888', marginTop: 40 }, // Texto si no hay datos
});
