import * as Contacts from 'expo-contacts';

export const getDeviceContacts = async () => {
  const { status } = await Contacts.requestPermissionsAsync();

  if (status !== 'granted') {
    throw new Error('Permiso para acceder a contactos denegado.');
  }

  const { data } = await Contacts.getContactsAsync({
    fields: [Contacts.Fields.Emails, Contacts.Fields.PhoneNumbers],
  });

  return data;
};
