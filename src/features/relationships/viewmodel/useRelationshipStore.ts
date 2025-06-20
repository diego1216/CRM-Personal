import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface RelationshipPriority {
  contactId: string;
  color: string;
  daysLimit: number;
}

export interface RelationshipState {
  priorities: RelationshipPriority[];
  setPriorityConfig: (config: RelationshipPriority) => void;
  getPriorityByContactId: (id: string) => RelationshipPriority | undefined;
}

export const useRelationshipStore = create<RelationshipState>()(
  persist(
    (set, get) => ({
      priorities: [],

      setPriorityConfig: (config) => {
        const existing = get().priorities.filter(p => p.contactId !== config.contactId);
        set({ priorities: [...existing, config] });
      },

      getPriorityByContactId: (id) => {
        return get().priorities.find(p => p.contactId === id);
      }
    }),
    {
      name: 'relationship-storage',
    }
  )
);
