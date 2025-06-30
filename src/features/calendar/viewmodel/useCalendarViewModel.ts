// Importa los hooks de React necesarios para estado y efectos secundarios
import { useEffect, useState } from 'react';

// Importa el tipo CalendarEvent que representa un evento de calendario
import { CalendarEvent } from '../../../domain/entities/CalendarEvent';

// Importa el caso de uso que obtiene los eventos próximos del calendario
import { GetUpcomingEventsUseCase } from '../../../domain/usecases/GetUpcomingEventsUseCase';

// Hook personalizado que actúa como ViewModel para la vista de calendario
export const useCalendarViewModel = () => {
  // Estado para almacenar la lista de eventos
  const [events, setEvents] = useState<CalendarEvent[]>([]);

  // Estado para controlar si los datos están cargando
  const [loading, setLoading] = useState(true);

  // Estado para manejar posibles errores
  const [error, setError] = useState<string | null>(null);

  // Efecto que se ejecuta una sola vez al montar el componente (comportamiento similar a componentDidMount)
  useEffect(() => {
    // Función asincrónica que ejecuta el caso de uso y maneja el resultado
    const fetchEvents = async () => {
      try {
        // Crea una instancia del caso de uso
        const useCase = new GetUpcomingEventsUseCase(); 

        // Ejecuta el caso de uso para obtener los eventos
        const data = await useCase.execute();           

        // Actualiza el estado con los eventos recibidos
        setEvents(data);
      } catch (err: any) {
        // En caso de error, guarda el mensaje en el estado de error
        setError(err.message);
      } finally {
        // Finaliza la carga sin importar si hubo éxito o error
        setLoading(false);
      }
    };

    // Llama a la función para iniciar la carga de eventos
    fetchEvents();
  }, []); // El array vacío asegura que el efecto solo se ejecute una vez

  // Devuelve los estados necesarios para ser usados en la UI
  return { events, loading, error };
};
