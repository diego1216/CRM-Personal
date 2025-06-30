
import { PhoneNumber } from 'expo-contacts';

export interface Contact {
  id: string;
  name: string;
  phoneNumbers: PhoneNumber[];
  nextEvent?: {
    date: string;
    priority: 'Alta' | 'Media' | 'Baja';
    color: 'red' | 'orange' | 'green';
  };
}
