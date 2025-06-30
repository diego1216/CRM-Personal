// Importa React y componentes necesarios de React Native
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

// Importa el tipo de evento desde la capa de entidades del dominio
import type { CalendarEvent } from '../../../domain/entities/CalendarEvent';

// Importa la librería dayjs para formatear fechas
import dayjs from 'dayjs';

// Define los props esperados por el componente
interface Props {
  event: CalendarEvent; // Evento que se mostrará en la tarjeta
}

// Componente funcional para representar visualmente un evento del calendario
const EventCard: React.FC<Props> = ({ event }) => {
  return (
    // Contenedor principal con estilo de tarjeta
    <View style={styles.card}>
      {/* Título del evento, precedido por un emoji */}
      <Text style={styles.title}>📅 {event.title}</Text>

      {/* Fecha de inicio del evento, formateada con dayjs */}
      <Text style={styles.date}>
        Inicio: {dayjs(event.start).format('DD MMM YYYY, HH:mm')}
      </Text>

      {/* Fecha de fin del evento, también formateada */}
      <Text style={styles.date}>
        Fin: {dayjs(event.end).format('DD MMM YYYY, HH:mm')}
      </Text>
    </View>
  );
};

// Exporta el componente para ser utilizado en otras partes de la aplicación
export default EventCard;

// Define los estilos visuales utilizados en la tarjeta
const styles = StyleSheet.create({
  card: {
    backgroundColor: '#fff',                   // Fondo blanco
    borderRadius: 12,                          // Bordes redondeados
    padding: 16,                               // Espaciado interno
    marginBottom: 12,                          // Espaciado inferior entre tarjetas
    elevation: 3,                              // Elevación en Android
    shadowColor: '#000',                       // Color de la sombra (iOS)
    shadowOpacity: 0.1,                        // Opacidad de la sombra
    shadowOffset: { width: 0, height: 2 },     // Dirección y desplazamiento de la sombra
    shadowRadius: 4,                           // Difuminado de la sombra
  },
  title: {
    fontWeight: 'bold',                        // Texto en negrita
    fontSize: 16,                              // Tamaño del texto
    marginBottom: 6,                           // Espacio debajo del título
  },
  date: {
    fontSize: 14,                              // Tamaño del texto de fecha
    color: '#444',                             // Color gris oscuro para fechas
  },
});
