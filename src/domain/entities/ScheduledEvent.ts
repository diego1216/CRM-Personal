// Define una interfaz TypeScript llamada ScheduledEvent que representa un evento programado relacionado con un contacto
export interface ScheduledEvent {
  id: string;                          // Identificador único del evento (puede usarse para edición o eliminación)
  contactId: string;                   // ID del contacto asociado al evento
  date: string;                        // Fecha del evento en formato string (puede ser ISO u otro formato compatible)
  priority: 'high' | 'medium' | 'low'; // Nivel de prioridad del evento: alto, medio o bajo
  color: string;                       // Color visual asociado a la prioridad o categoría (ej. rojo, verde, etc.)
  contactName?: string;                // (Opcional) Nombre del contacto vinculado, útil para mostrar en la UI
  importance: string;                  // Descripción adicional del nivel de importancia (ej. "urgente", "recordatorio", etc.)
}
