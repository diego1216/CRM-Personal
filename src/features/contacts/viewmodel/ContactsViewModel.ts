import { useEffect, useState } from 'react';
import { getDeviceContacts } from '../../../data/datasources/ContactsDatasource';
import * as Contacts from 'expo-contacts';

export const useContactsViewModel = () => {
  const [contacts, setContacts] = useState<Contacts.Contact[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadContacts = async () => {
    try {
      const data = await getDeviceContacts();
      setContacts(data);
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadContacts();
  }, []);

  return { contacts, loading, error };
};
