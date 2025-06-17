import { getUpcomingEvents } from '../../data/datasources/CalendarDatasource';
import { CalendarEvent } from '../entities/CalendarEvent';

export class GetUpcomingEventsUseCase {
  async execute(): Promise<CalendarEvent[]> {
    const raw = await getUpcomingEvents();
    return raw.map(r => ({
      id: r.id,
      title: r.title,
      start: r.startDate, 
      end: r.endDate,
    }));
  }
}
