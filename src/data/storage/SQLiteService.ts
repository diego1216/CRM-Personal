
import { openDatabaseSync } from 'expo-sqlite';

// Abrir conexión sincronizada
const db = openDatabaseSync('crm.db');


//Tipos 

export type PriorityLevel = 'Alta' | 'Media' | 'Baja';
export type PriorityColor = 'red' | 'orange' | 'green';

export interface ScheduledEvent {
  id: string;
  title: string;
  datetime: string;
  contactId: string;
  priority: PriorityLevel;
  color: PriorityColor;
}

export interface ContactPriority {
  contactId: string;
  priority: PriorityLevel;
  color: PriorityColor;
  daysLimit: number;
}

// Inicialización de Tablas 

export const initDatabase = async () => {
  try {
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

    await db.execAsync(`
      CREATE TABLE IF NOT EXISTS contact_settings (
        contactId TEXT PRIMARY KEY,
        priority TEXT,
        color TEXT,
        daysLimit INTEGER
      );
    `);

    console.log('✅ Tablas SQLite listas');
  } catch (error) {
    console.error('❌ Error al crear tablas:', error);
    throw error;
  }
};

//  Eventos 

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

export const getEvents = async (): Promise<ScheduledEvent[]> => {
  try {
    const result = await db.getAllAsync<ScheduledEvent>(`
      SELECT * FROM events ORDER BY datetime ASC;
    `);
    return result;
  } catch (error) {
    console.error('❌ Error al obtener eventos:', error);
    return [];
  }
};

export const deleteEvent = async (id: string) => {
  try {
    await db.runAsync(`DELETE FROM events WHERE id = ?;`, [id]);
  } catch (error) {
    console.error('❌ Error al eliminar evento:', error);
    throw error;
  }
};

//  Configuración de Contactos 

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

export const getAllContactSettings = async (): Promise<ContactPriority[]> => {
  try {
    const rows = await db.getAllAsync<any>(`SELECT * FROM contact_settings;`);
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

// -------------------- Helpers --------------------

const normalizePriority = (value: string): PriorityLevel => {
  if (value === 'Alta' || value === 'Media' || value === 'Baja') return value;
  return 'Media';
};

const normalizeColor = (value: string): PriorityColor => {
  if (value === 'red' || value === 'orange' || value === 'green') return value;
  return 'green';
};
