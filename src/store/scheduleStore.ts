// src/store/scheduleStore.ts

import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export type ScheduledEvent = {
  id: string;
  contactId: string;
  contactName: string;
  datetime: string;
  priority: number;
  color: string;
};

type ScheduleState = {
  events: ScheduledEvent[];

  // Funciones
  addEvent: (event: Omit<ScheduledEvent, 'id'>) => void;
  removeEvent: (id: string) => void;
  updateEvent: (event: ScheduledEvent) => void;
  cleanPastEvents: () => void;
};

export const useScheduledEventStore = create<ScheduleState>()(
  persist(
    (set) => ({
      events: [],

      // Agregar un nuevo evento
      addEvent: (event) => {
        const newEvent: ScheduledEvent = {
          ...event,
          id: Math.random().toString(36).substring(2, 9),
        };
        set((state) => ({
          events: [...state.events, newEvent],
        }));
      },

      // Eliminar evento por ID
      removeEvent: (id) => {
        set((state) => ({
          events: state.events.filter((event) => event.id !== id),
        }));
      },

      // Editar un evento existente
      updateEvent: (updatedEvent) => {
        set((state) => ({
          events: state.events.map((event) =>
            event.id === updatedEvent.id ? updatedEvent : event
          ),
        }));
      },

      // Eliminar eventos pasados (fecha < ahora)
      cleanPastEvents: () => {
        const now = new Date().getTime();
        set((state) => ({
          events: state.events.filter(
            (event) => new Date(event.datetime).getTime() > now
          ),
        }));
      },
    }),
    {
      name: 'scheduled-events-store',
    }
  )
);
