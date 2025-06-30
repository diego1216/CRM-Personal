// Importa la función que obtiene eventos del calendario desde la fuente de datos (datasource)
import { getUpcomingEvents } from '../../data/datasources/CalendarDatasource';

// Importa el tipo CalendarEvent que define la estructura esperada de los eventos
import { CalendarEvent } from '../entities/CalendarEvent';

// Caso de uso que obtiene y transforma los eventos próximos del calendario
export class GetUpcomingEventsUseCase {
  
  // Método asincrónico que ejecuta el caso de uso
  async execute(): Promise<CalendarEvent[]> {
    
    // Llama al datasource para obtener los eventos sin procesar (RawEvent[])
    const raw = await getUpcomingEvents();
    
    // Transforma cada evento a la estructura CalendarEvent esperada por la capa de dominio o presentación
    return raw.map(r => ({
      id: r.id,          // ID del evento
      title: r.title,    // Título del evento
      start: r.startDate, // Fecha/hora de inicio
      end: r.endDate,     // Fecha/hora de finalización
    }));
  }
}
