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
  addEvent: (event: Omit<ScheduledEvent, 'id'>) => void;
};

export const useScheduledEventStore = create<ScheduleState>()(
  persist(
    (set) => ({
      events: [],
      addEvent: (event) => {
        const newEvent: ScheduledEvent = {
          ...event,
          id: Math.random().toString(36).substring(2, 9), // puedes cambiar por uuid
        };
        set((state) => ({
          events: [...state.events, newEvent],
        }));
      },
    }),
    { name: 'scheduled-events-store' }
  )
);
