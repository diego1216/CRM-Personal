import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { Relationship } from '../../../domain/entities/Relationship';

interface RelationshipState {
  relationships: Relationship[];
  addOrUpdate: (r: Relationship) => void;
}

export const useRelationshipStore = create<RelationshipState>()(
  persist(
    (set, get) => ({
      relationships: [],
      addOrUpdate: (newRel) => {
        const others = get().relationships.filter(r => r.contactId !== newRel.contactId);
        set({ relationships: [...others, newRel] });
      },
    }),
    {
      name: 'relationship-storage',
    }
  )
);
