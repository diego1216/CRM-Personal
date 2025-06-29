import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { ScheduledEvent } from '../domain/entities/ScheduledEvent';
import uuid from 'react-native-uuid';

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
          events: [...state.events, { ...event, id: uuid.v4().toString() }],
        })),
    }),
    {
      name: 'scheduled-events-storage',
    }
  )
);
