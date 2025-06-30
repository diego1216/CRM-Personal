// Importa todas las funcionalidades del módulo expo-calendar bajo el alias Calendar
import * as Calendar from 'expo-calendar';

// Define una interfaz TypeScript que representa la estructura de un evento del calendario
export interface RawEvent {
  id: string;             // ID único del evento
  title: string;          // Título del evento
  startDate: Date;        // Fecha y hora de inicio
  endDate: Date;          // Fecha y hora de fin
  calendarId: string;     // ID del calendario al que pertenece el evento
}

// Función asincrónica que obtiene eventos próximos dentro de un rango de días (por defecto, 7)
export async function getUpcomingEvents(daysAhead = 7): Promise<RawEvent[]> {
  // Solicita permiso para acceder al calendario del dispositivo
  const { status } = await Calendar.requestCalendarPermissionsAsync();

  // Si no se otorgan los permisos, lanza un error
  if (status !== 'granted') throw new Error('Permiso de calendario denegado');

  // Obtiene todos los calendarios disponibles que contienen eventos
  const calendars = await Calendar.getCalendarsAsync(Calendar.EntityTypes.EVENT);

  // Extrae únicamente los IDs de los calendarios
  const calendarIds = calendars.map(c => c.id);

  // Define el rango de fechas: desde hoy hasta dentro de `daysAhead` días
  const start = new Date();                 // Fecha actual
  const end = new Date();                   // Clona la fecha actual
  end.setDate(end.getDate() + daysAhead);   // Suma los días deseados

  // Obtiene los eventos de los calendarios en el rango especificado
  const events = await Calendar.getEventsAsync(calendarIds, start, end);

  // Transforma y retorna los eventos en el formato definido por la interfaz RawEvent
  return events.map(e => ({
    id: e.id,                                      // ID del evento
    title: e.title ?? '(Sin título)',             // Título o texto por defecto si no hay
    startDate: new Date(e.startDate),             // Fecha de inicio convertida a Date
    endDate: new Date(e.endDate),                 // Fecha de fin convertida a Date
    calendarId: e.calendarId,                     // ID del calendario de origen
  }));
}
