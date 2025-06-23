// src/store/contactStore.ts
import { create } from 'zustand';
import type { Contact } from '../domain/entities/Contact';

interface ContactStore {
  contacts: Contact[];
  setContacts: (contacts: Contact[]) => void;
}

export const useContactStore = create<ContactStore>((set) => ({
  contacts: [],
  setContacts: (contacts) => set({ contacts }),
}));
