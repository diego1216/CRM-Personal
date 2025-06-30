// Importa la función create de Zustand para crear un store global
import { create } from 'zustand';

// Importa el middleware persist para que el estado se guarde en almacenamiento local
import { persist } from 'zustand/middleware';

// Importa el tipo ScheduledEvent que representa un evento programado
import { ScheduledEvent } from '../domain/entities/ScheduledEvent';

// Importa la biblioteca uuid para generar identificadores únicos
import uuid from 'react-native-uuid';

// Define la estructura del estado para eventos programados
interface ScheduledEventState {
  events: ScheduledEvent[];                           // Lista de eventos almacenados
  addEvent: (event: Omit<ScheduledEvent, 'id'>) => void; // Función para agregar un evento (sin incluir el ID)
}

// Crea el store Zustand con persistencia automática
export const useScheduledEventStore = create<ScheduledEventState>()(
  // Aplica el middleware persist para guardar el estado entre sesiones
  persist(
    (set) => ({
      // Estado inicial: lista vacía de eventos
      events: [],

      // Función para agregar un nuevo evento a la lista
      addEvent: (event) =>
        set((state) => ({
          // Crea un nuevo evento agregándole un ID generado con uuid
          events: [...state.events, { ...event, id: uuid.v4().toString() }],
        })),
    }),
    {
      // Nombre bajo el cual se almacenará el estado en AsyncStorage/localStorage
      name: 'scheduled-events-storage',
    }
  )
);
