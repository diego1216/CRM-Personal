// Define una interfaz TypeScript llamada Relationship que representa la relación y seguimiento con un contacto
export interface Relationship {
  contactId: string;               // ID único del contacto con quien se tiene la relación (referencia cruzada)
  lastInteraction: string;         // Fecha de la última interacción en formato ISO (por ejemplo: '2025-07-01T12:00:00Z')
  notes: string;                   // Notas relevantes sobre la relación o la última conversación
  priority: number;                // Nivel de prioridad numérico (1 = baja prioridad, 5 = máxima urgencia)
  frequencyInDays: number;        // Frecuencia esperada de contacto (cada cuántos días se debe interactuar)
}
