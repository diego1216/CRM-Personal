import * as Calendar from 'expo-calendar';

export interface RawEvent {
  id: string;
  title: string;
  startDate: Date;
  endDate: Date;
  calendarId: string;
}

// Solicita permiso y devuelve eventos de los próximos 7 días
export async function getUpcomingEvents(daysAhead = 7): Promise<RawEvent[]> {
  const { status } = await Calendar.requestCalendarPermissionsAsync();
  if (status !== 'granted') throw new Error('Permiso de calendario denegado');

  const calendars = await Calendar.getCalendarsAsync(Calendar.EntityTypes.EVENT);
  const calendarIds = calendars.map(c => c.id);

  const start = new Date();
  const end = new Date();
  end.setDate(end.getDate() + daysAhead);

  const events = await Calendar.getEventsAsync(calendarIds, start, end);

  return events.map(e => ({
    id: e.id,
    title: e.title ?? '(Sin título)',
    startDate: new Date(e.startDate), 
    endDate: new Date(e.endDate),     
    calendarId: e.calendarId,
  }));
}
