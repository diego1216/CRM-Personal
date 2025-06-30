// Importa el módulo de notificaciones de Expo
import * as Notifications from 'expo-notifications';

// Importa el store de contactos personalizado desde Zustand
import { useContactStore } from '../../store/contactStore';

// Importa el store de relaciones (prioridades por contacto)
import { useRelationshipStore } from '../../features/relationships/viewmodel/useRelationshipStore';

// Importa el store de eventos programados
import { useScheduledEventStore } from '../../store/scheduleStore';

// Importa la función para calcular la diferencia en días entre fechas
import { differenceInDays } from 'date-fns';

// Función que verifica si hay contactos con interacción vencida y programa notificaciones
export const checkAndNotifyOverdueContacts = () => {
  // Obtiene la lista actual de contactos desde el estado global
  const { contacts } = useContactStore.getState();

  // Obtiene la función para recuperar la prioridad configurada por contacto
  const { getPriorityByContactId } = useRelationshipStore.getState();

  // Obtiene los eventos programados desde el estado global
  const { events } = useScheduledEventStore.getState();

  // Itera sobre cada contacto para verificar su estado
  contacts.forEach(contact => {
    // Obtiene la configuración de prioridad de ese contacto
    const priority = getPriorityByContactId(contact.id);

    // Si no tiene días límite configurados, omite el contacto
    if (!priority?.daysLimit) return;

    // Filtra los eventos que pertenecen al contacto actual
    const contactEvents = events.filter(e => e.contactId === contact.id);

    // Ordena los eventos por fecha descendente y toma el más reciente
    const latest = contactEvents.sort((a, b) =>
      new Date(b.datetime).getTime() - new Date(a.datetime).getTime()
    )[0];

    // Obtiene la fecha del último evento o null si no hay ninguno
    const lastDate = latest ? new Date(latest.datetime) : null;

    // Calcula cuántos días han pasado desde la última interacción
    const daysSince = lastDate ? differenceInDays(new Date(), lastDate) : Infinity;

    // Si han pasado más días de lo permitido según la prioridad, programa una notificación
    if (daysSince >= priority.daysLimit) {
      Notifications.scheduleNotificationAsync({
        content: {
          title: '📞 Recuérdalo', // Título de la notificación
          body: `Debes contactar a ${contact.name}, han pasado más de ${priority.daysLimit} días.`, // Mensaje personalizado
          sound: true, // Reproduce sonido si está habilitado
        },
        trigger: {
          type: 'timeInterval', // Tipo de disparador: espera un tiempo determinado
          seconds: 15,          // Espera 15 segundos antes de mostrar la notificación
          repeats: false,       // La notificación no se repite
        } as Notifications.TimeIntervalTriggerInput, // Forzamos el tipo explícitamente para evitar errores
      });
    }
  });
};
