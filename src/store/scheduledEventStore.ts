import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { ScheduledEvent } from '../domain/entities/ScheduledEvent';
import { v4 as uuidv4 } from 'uuid';

interface ScheduledEventState {
  events: ScheduledEvent[];
  addEvent: (event: Omit<ScheduledEvent, 'id'>) => void;
}

export const useScheduledEventStore = create<ScheduledEventState>()(
  persist(
    (set) => ({
      events: [],
      addEvent: (event) =>
        set((state) => ({
          events: [...state.events, { ...event, id: uuidv4() }],
        })),
    }),
    {
      name: 'scheduled-events-storage',
    }
  )
);
