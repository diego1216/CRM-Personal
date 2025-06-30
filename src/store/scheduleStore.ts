// Importa la función create de Zustand para crear el store de estado global
import { create } from 'zustand';

// Importa funciones relacionadas con la base de datos SQLite para inicializar, insertar, obtener y eliminar eventos
import {
  initDatabase,   // Inicializa las tablas necesarias en la base de datos
  getEvents,      // Recupera todos los eventos almacenados
  insertEvent,    // Inserta o actualiza un evento en la base de datos
  deleteEvent,    // Elimina un evento por su ID
} from '../data/storage/SQLiteService'; 

// Define la estructura de un evento programado
export interface ScheduledEvent {
  id: string;                                // Identificador único del evento
  title: string;                             // Título o descripción del evento
  datetime: string;                          // Fecha y hora del evento en formato string
  contactId: string;                         // ID del contacto asociado al evento
  priority: 'Alta' | 'Media' | 'Baja';       // Nivel de prioridad del evento
  color: 'red' | 'orange' | 'green';         // Color representativo de la prioridad
}

// Define la forma del estado global del store
interface State {
  events: ScheduledEvent[];                                     // Lista de eventos cargados en memoria
  loadEventsFromDB: () => Promise<void>;                        // Función para cargar eventos desde la base de datos
  addEvent: (event: ScheduledEvent) => Promise<void>;           // Función para agregar o actualizar un evento
  deleteEvent: (id: string) => Promise<void>;                   // Función para eliminar un evento por ID
}

// Crea el store Zustand con los estados y funciones definidas
export const useScheduledEventStore = create<State>((set) => ({
  events: [],  // Estado inicial: lista vacía de eventos

  // Función que carga los eventos desde SQLite y actualiza el estado
  loadEventsFromDB: async () => {
    await initDatabase();               // Asegura que las tablas estén creadas
    const events = await getEvents();   // Obtiene todos los eventos
    set({ events });                    // Actualiza el estado del store con los eventos cargados
  },

  // Función que agrega o actualiza un evento en SQLite y en el estado global
  addEvent: async (event) => {
    await insertEvent(event);           // Guarda o reemplaza el evento en la base de datos
    set((state) => ({
      // Reemplaza el evento si ya existe, o lo agrega al final
      events: [...state.events.filter((e) => e.id !== event.id), event],
    }));
  },

  // Función que elimina un evento de SQLite y actualiza el estado en memoria
  deleteEvent: async (id) => {
    await deleteEvent(id);             // Elimina el evento de la base de datos
    set((state) => ({
      // Filtra el evento eliminado fuera del estado global
      events: state.events.filter((e) => e.id !== id),
    }));
  },
}));
