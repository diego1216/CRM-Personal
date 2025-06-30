import { create } from 'zustand';
import {
  initDatabase,
  getEvents,
  insertEvent,
  deleteEvent,
} from '../data/storage/SQLiteService'; 


export interface ScheduledEvent {
  id: string;
  title: string;
  datetime: string;
  contactId: string;
  priority: 'Alta' | 'Media' | 'Baja'; 
  color: 'red' | 'orange' | 'green';
}

interface State {
  events: ScheduledEvent[];
  loadEventsFromDB: () => Promise<void>;
  addEvent: (event: ScheduledEvent) => Promise<void>;
  deleteEvent: (id: string) => Promise<void>;
}

export const useScheduledEventStore = create<State>((set) => ({
  events: [],

  loadEventsFromDB: async () => {
    await initDatabase(); 
    const events = await getEvents();
    set({ events });
  },

  addEvent: async (event) => {
    await insertEvent(event);
    set((state) => ({
      events: [...state.events.filter((e) => e.id !== event.id), event],
    }));
  },

  deleteEvent: async (id) => {
    await deleteEvent(id);
    set((state) => ({
      events: state.events.filter((e) => e.id !== id),
    }));
  },
}));
