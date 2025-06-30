// Importa los hooks de React para manejar estado y efectos
import { useEffect, useState } from 'react';

// Importa el módulo de contactos de Expo para acceder a los contactos del dispositivo
import * as Contacts from 'expo-contacts';

// Importa el tipo Contact definido en la capa de entidades del dominio
import { Contact } from '../../../domain/entities/Contact';

// Importa el store Zustand que contiene los eventos programados
import { useScheduledEventStore } from '../../../store/scheduleStore';

// Hook personalizado que actúa como ViewModel para cargar contactos enriquecidos con su próximo evento
export const useContactsViewModel = () => {
  // Estado para almacenar los contactos cargados
  const [contacts, setContacts] = useState<Contact[]>([]);

  // Estado para controlar si la carga está en progreso
  const [loading, setLoading] = useState(true);

  // Estado para manejar errores durante la carga
  const [error, setError] = useState<string | null>(null);

  // Obtiene los eventos programados desde el estado global
  const events = useScheduledEventStore(state => state.events);

  // Efecto que se ejecuta cada vez que los eventos cambian
  useEffect(() => {
    // Función asincrónica autoejecutable para cargar contactos y relacionarlos con eventos
    (async () => {
      try {
        // Solicita permiso para acceder a los contactos del dispositivo
        const { status } = await Contacts.requestPermissionsAsync();

        // Si el permiso no fue concedido, lanza un error
        if (status !== 'granted') throw new Error('Permiso denegado');

        // Obtiene los contactos junto con los números de teléfono
        const { data } = await Contacts.getContactsAsync({
          fields: [Contacts.Fields.PhoneNumbers],
        });

        // Enriquecer cada contacto con su próximo evento (si existe)
        const enrichedContacts: Contact[] = data.map(contact => {
          // Filtra los eventos del contacto actual y los ordena por fecha ascendente
          const upcoming = events
            .filter(e => e.contactId === contact.id)
            .sort((a, b) => new Date(a.datetime).getTime() - new Date(b.datetime).getTime())[0];

          // Determina el color asociado al evento o usa 'gray' si no hay evento
          const color = upcoming?.color || 'gray';

          // Asigna un nivel de prioridad basado en el color
          const priority = color === 'red'
            ? 'Alta'
            : color === 'orange'
            ? 'Media'
            : 'Baja';

          // Retorna el contacto enriquecido con su evento próximo (si tiene)
          return {
            id: contact.id,
            name: contact.name,
            phoneNumbers: contact.phoneNumbers,
            nextEvent: upcoming
              ? {
                  date: upcoming.datetime,
                  priority,
                  color: upcoming.color as 'red' | 'orange' | 'green',
                }
              : undefined, // Si no hay evento, no se agrega nextEvent
          };
        });

        // Actualiza el estado con la lista de contactos enriquecidos
        setContacts(enrichedContacts);
      } catch (err: any) {
        // Si ocurre un error, guarda el mensaje en el estado de error
        setError(err.message);
      } finally {
        // Finaliza la carga, sin importar si fue exitosa o con error
        setLoading(false);
      }
    })(); // Ejecuta inmediatamente la función definida
  }, [events]); // El efecto se vuelve a ejecutar si cambian los eventos

  // Devuelve los contactos, el estado de carga y el error para ser usados en la UI
  return { contacts, loading, error };
};
