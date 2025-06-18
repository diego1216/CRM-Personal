export interface Relationship {
  contactId: string;
  lastInteraction: string; // ISO date string
  notes: string;
  priority: number; // 1 = baja, 5 = urgente
  frequencyInDays: number; // Cada cuántos días se espera interacción
}
