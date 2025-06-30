import { useEffect, useState } from 'react';
import * as Contacts from 'expo-contacts';
import { Contact } from '../../../domain/entities/Contact';
import { useScheduledEventStore } from '../../../store/scheduleStore';

export const useContactsViewModel = () => {
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const events = useScheduledEventStore(state => state.events);

  useEffect(() => {
    (async () => {
      try {
        const { status } = await Contacts.requestPermissionsAsync();
        if (status !== 'granted') throw new Error('Permiso denegado');

        const { data } = await Contacts.getContactsAsync({
          fields: [Contacts.Fields.PhoneNumbers],
        });

        const enrichedContacts: Contact[] = data.map(contact => {
          const upcoming = events
            .filter(e => e.contactId === contact.id)
            .sort((a, b) => new Date(a.datetime).getTime() - new Date(b.datetime).getTime())[0];

          const color = upcoming?.color || 'gray';
          const priority = color === 'red'
            ? 'Alta'
            : color === 'orange'
            ? 'Media'
            : 'Baja';

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
              : undefined,
          };
        });

        setContacts(enrichedContacts);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    })();
  }, [events]);

  return { contacts, loading, error };
};
