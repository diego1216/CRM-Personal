// Importa el tipo PhoneNumber desde el módulo expo-contacts, que representa un número telefónico con metadatos
import { PhoneNumber } from 'expo-contacts';

// Define una interfaz TypeScript llamada Contact que describe la estructura de un contacto enriquecido
export interface Contact {
  id: string;                       // Identificador único del contacto (proporcionado por el sistema o expo-contacts)
  name: string;                     // Nombre completo del contacto
  phoneNumbers: PhoneNumber[];     // Lista de números telefónicos asociados al contacto

  nextEvent?: {                     // (Opcional) Información sobre el próximo evento relacionado con el contacto
    date: string;                  // Fecha del evento próximo en formato string
    priority: 'Alta' | 'Media' | 'Baja';  // Nivel de prioridad asignado al evento
    color: 'red' | 'orange' | 'green';    // Color visual asociado a la prioridad
  };
}
