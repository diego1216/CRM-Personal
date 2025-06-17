import { useEffect, useState } from 'react';
import { CalendarEvent } from '../../../domain/entities/CalendarEvent';
import { GetUpcomingEventsUseCase } from '../../../domain/usecases/GetUpcomingEventsUseCase';

export const useCalendarViewModel = () => {
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const useCase = new GetUpcomingEventsUseCase(); // 👈 crear instancia
        const data = await useCase.execute();           // 👈 usar método .execute()
        setEvents(data);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchEvents();
  }, []);

  return { events, loading, error };
};
