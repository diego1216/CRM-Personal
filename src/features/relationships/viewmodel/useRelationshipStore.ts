import { create } from 'zustand';
import {
  saveContactSettings,
  getAllContactSettings,
  initDatabase,
  ContactPriority,
  PriorityLevel,
  PriorityColor,
} from '../../../data/storage/SQLiteService';

interface RelationshipState {
  priorities: ContactPriority[];
  loadPrioritiesFromDB: () => Promise<void>;
  setPriority: (config: ContactPriority) => Promise<void>;
  getPriorityByContactId: (id: string) => ContactPriority | undefined;
}

export const useRelationshipStore = create<RelationshipState>((set, get) => ({
  priorities: [],

  loadPrioritiesFromDB: async () => {
    await initDatabase(); 
    const data = await getAllContactSettings();
    const normalized = data.map(p => ({
      contactId: p.contactId,
      priority: p.priority as PriorityLevel,
      color: p.color as PriorityColor,
      daysLimit: p.daysLimit,
    }));
    set({ priorities: normalized });
  },

  setPriority: async (config) => {
    await saveContactSettings(
      config.contactId,
      config.priority,
      config.color,
      config.daysLimit
    );
    set((state) => {
      const updated = state.priorities.filter(p => p.contactId !== config.contactId);
      return { priorities: [...updated, config] };
    });
  },

  getPriorityByContactId: (id) => {
    return get().priorities.find(p => p.contactId === id);
  },
}));


export type { ContactPriority as RelationshipPriority };
