// Importa la función create de Zustand para crear un store de estado global
import { create } from 'zustand';

// Importa funciones y tipos relacionados con la persistencia en SQLite
import {
  saveContactSettings,       // Guarda o actualiza la configuración de un contacto en la base de datos
  getAllContactSettings,     // Recupera todas las configuraciones guardadas
  initDatabase,              // Inicializa las tablas necesarias en la base de datos
  ContactPriority,           // Tipo que describe la configuración de prioridad de un contacto
  PriorityLevel,             // Tipo restringido: 'Alta', 'Media', 'Baja'
  PriorityColor,             // Tipo restringido: 'red', 'orange', 'green'
} from '../../../data/storage/SQLiteService';

// Define la forma del estado del store que manejará la lógica de prioridades por contacto
interface RelationshipState {
  priorities: ContactPriority[];                             // Lista de configuraciones de prioridad por contacto
  loadPrioritiesFromDB: () => Promise<void>;                 // Función para cargar datos desde la base de datos
  setPriority: (config: ContactPriority) => Promise<void>;   // Función para guardar/actualizar la prioridad de un contacto
  getPriorityByContactId: (id: string) => ContactPriority | undefined; // Función para obtener la prioridad de un contacto por ID
}

// Crea el store Zustand con el estado y las funciones definidas arriba
export const useRelationshipStore = create<RelationshipState>((set, get) => ({
  priorities: [], // Estado inicial: lista vacía de prioridades

  // Carga las prioridades desde la base de datos y actualiza el estado
  loadPrioritiesFromDB: async () => {
    await initDatabase(); // Asegura que la base de datos esté inicializada
    const data = await getAllContactSettings(); // Obtiene todos los registros
    const normalized = data.map(p => ({        // Normaliza los datos para cumplir con los tipos estrictos
      contactId: p.contactId,
      priority: p.priority as PriorityLevel,   // Asegura que el valor es un PriorityLevel válido
      color: p.color as PriorityColor,         // Asegura que el valor es un PriorityColor válido
      daysLimit: p.daysLimit,
    }));
    set({ priorities: normalized });           // Actualiza el estado del store con los datos obtenidos
  },

  // Guarda una nueva prioridad o actualiza una existente para un contacto
  setPriority: async (config) => {
    await saveContactSettings(                // Guarda en la base de datos
      config.contactId,
      config.priority,
      config.color,
      config.daysLimit
    );
    set((state) => {
      const updated = state.priorities.filter(p => p.contactId !== config.contactId); // Elimina duplicados
      return { priorities: [...updated, config] }; // Agrega la nueva configuración
    });
  },

  // Busca y devuelve la configuración de prioridad de un contacto por su ID
  getPriorityByContactId: (id) => {
    return get().priorities.find(p => p.contactId === id);
  },
}));

// Exporta el tipo ContactPriority con un alias más semántico: RelationshipPriority
export type { ContactPriority as RelationshipPriority };
