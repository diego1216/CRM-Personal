// Importa todas las funcionalidades del módulo expo-contacts bajo el alias Contacts
import * as Contacts from 'expo-contacts';

// Función asincrónica que obtiene los contactos del dispositivo
export const getDeviceContacts = async () => {
  // Solicita permiso al usuario para acceder a sus contactos
  const { status } = await Contacts.requestPermissionsAsync();

  // Si el permiso no fue concedido, lanza un error
  if (status !== 'granted') {
    throw new Error('Permiso para acceder a contactos denegado.');
  }

  // Obtiene los contactos del dispositivo, solicitando también correos y teléfonos
  const { data } = await Contacts.getContactsAsync({
    fields: [Contacts.Fields.Emails, Contacts.Fields.PhoneNumbers], // Campos adicionales a recuperar
  });

  // Devuelve la lista de contactos obtenida
  return data;
};
