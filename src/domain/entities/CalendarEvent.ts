// Define una interfaz TypeScript llamada CalendarEvent que describe la estructura de un evento de calendario
export interface CalendarEvent {
  id: string;     // Identificador único del evento (por ejemplo, para distinguirlo en una lista o base de datos)
  title: string;  // Título o nombre descriptivo del evento (lo que verá el usuario)
  start: Date;    // Fecha y hora de inicio del evento
  end: Date;      // Fecha y hora de finalización del evento
}
