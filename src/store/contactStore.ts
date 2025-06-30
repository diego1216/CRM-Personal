// Importa la función create desde Zustand para crear un store de estado global
import { create } from 'zustand';

// Importa el tipo Contact desde la capa de entidades del dominio
import type { Contact } from '../domain/entities/Contact';

// Define la forma (interface) que tendrá el estado del store de contactos
interface ContactStore {
  contacts: Contact[];                             // Lista de contactos almacenados en el estado global
  setContacts: (contacts: Contact[]) => void;      // Función para actualizar esa lista de contactos
}

// Crea el store Zustand con el estado y las funciones especificadas
export const useContactStore = create<ContactStore>((set) => ({
  contacts: [],                                    // Estado inicial: lista vacía de contactos
  setContacts: (contacts) => set({ contacts }),    // Actualiza el estado con una nueva lista de contactos
}));
