// Importa la función para abrir una base de datos SQLite de forma sincrónica desde Expo
import { openDatabaseSync } from 'expo-sqlite';

// Abre una conexión a la base de datos local llamada 'crm.db'
const db = openDatabaseSync('crm.db');

// Tipos para definir prioridad y color que se usarán en eventos y configuración de contactos
export type PriorityLevel = 'Alta' | 'Media' | 'Baja';         // Nivel de prioridad permitidos
export type PriorityColor = 'red' | 'orange' | 'green';        // Colores válidos para cada prioridad

// Interfaz que representa un evento programado
export interface ScheduledEvent {
  id: string;              // Identificador único del evento
  title: string;           // Título o descripción del evento
  datetime: string;        // Fecha y hora del evento en formato string
  contactId: string;       // ID del contacto asociado al evento
  priority: PriorityLevel; // Prioridad del evento ('Alta', 'Media', 'Baja')
  color: PriorityColor;    // Color asignado según prioridad ('red', 'orange', 'green')
}

// Interfaz para la configuración de prioridad asociada a un contacto específico
export interface ContactPriority {
  contactId: string;       // ID del contacto
  priority: PriorityLevel; // Nivel de prioridad asignado
  color: PriorityColor;    // Color asignado a esa prioridad
  daysLimit: number;       // Límite de días para volver a contactar
}

// Función que inicializa las tablas en la base de datos SQLite
export const initDatabase = async () => {
  try {
    // Crea la tabla 'events' si no existe (para guardar eventos programados)
    await db.execAsync(`
      CREATE TABLE IF NOT EXISTS events (
        id TEXT PRIMARY KEY NOT NULL,
        title TEXT,
        datetime TEXT,
        contactId TEXT,
        priority TEXT,
        color TEXT
      );
    `);

    // Crea la tabla 'contact_settings' si no existe (para configuración de contactos)
    await db.execAsync(`
      CREATE TABLE IF NOT EXISTS contact_settings (
        contactId TEXT PRIMARY KEY,
        priority TEXT,
        color TEXT,
        daysLimit INTEGER
      );
    `);

    // Muestra mensaje de éxito en consola
    console.log('✅ Tablas SQLite listas');
  } catch (error) {
    // Captura errores en la creación de tablas
    console.error('❌ Error al crear tablas:', error);
    throw error;
  }
};

// -------------------- Gestión de Eventos --------------------

// Inserta o reemplaza un evento en la tabla 'events'
export const insertEvent = async (event: ScheduledEvent) => {
  try {
    await db.runAsync(
      `INSERT OR REPLACE INTO events (id, title, datetime, contactId, priority, color)
       VALUES (?, ?, ?, ?, ?, ?);`,
      [event.id, event.title, event.datetime, event.contactId, event.priority, event.color]
    );
  } catch (error) {
    console.error('❌ Error al insertar evento:', error);
    throw error;
  }
};

// Obtiene todos los eventos ordenados por fecha y hora
export const getEvents = async (): Promise<ScheduledEvent[]> => {
  try {
    const result = await db.getAllAsync<ScheduledEvent>(`
      SELECT * FROM events ORDER BY datetime ASC;
    `);
    return result;
  } catch (error) {
    console.error('❌ Error al obtener eventos:', error);
    return []; // Devuelve lista vacía en caso de error
  }
};

// Elimina un evento de la base de datos por su ID
export const deleteEvent = async (id: string) => {
  try {
    await db.runAsync(`DELETE FROM events WHERE id = ?;`, [id]);
  } catch (error) {
    console.error('❌ Error al eliminar evento:', error);
    throw error;
  }
};

// -------------------- Configuración de Contactos --------------------

// Guarda o actualiza la configuración de un contacto (prioridad, color y límite de días)
export const saveContactSettings = async (
  contactId: string,
  priority: PriorityLevel,
  color: PriorityColor,
  daysLimit: number
): Promise<void> => {
  try {
    await db.runAsync(
      `INSERT OR REPLACE INTO contact_settings (contactId, priority, color, daysLimit)
       VALUES (?, ?, ?, ?);`,
      [contactId, priority, color, daysLimit]
    );
  } catch (error) {
    console.error('❌ Error al guardar configuración de contacto:', error);
    throw error;
  }
};

// Obtiene todas las configuraciones de contactos guardadas en la tabla 'contact_settings'
export const getAllContactSettings = async (): Promise<ContactPriority[]> => {
  try {
    const rows = await db.getAllAsync<any>(`SELECT * FROM contact_settings;`);
    
    // Normaliza los valores para asegurar que tengan el tipo correcto
    return rows.map((row) => ({
      contactId: row.contactId,
      priority: normalizePriority(row.priority),
      color: normalizeColor(row.color),
      daysLimit: Number(row.daysLimit),
    }));
  } catch (error) {
    console.error('❌ Error al obtener configuraciones de contacto:', error);
    return [];
  }
};

// -------------------- Funciones Auxiliares --------------------

// Asegura que el valor de prioridad sea uno de los permitidos, si no, retorna 'Media'
const normalizePriority = (value: string): PriorityLevel => {
  if (value === 'Alta' || value === 'Media' || value === 'Baja') return value;
  return 'Media';
};

// Asegura que el color sea uno de los permitidos, si no, retorna 'green'
const normalizeColor = (value: string): PriorityColor => {
  if (value === 'red' || value === 'orange' || value === 'green') return value;
  return 'green';
};
