
import * as Notifications from 'expo-notifications';
import { useContactStore } from '../../store/contactStore';
import { useRelationshipStore } from '../../features/relationships/viewmodel/useRelationshipStore';
import { useScheduledEventStore } from '../../store/scheduleStore';
import { differenceInDays } from 'date-fns';

export const checkAndNotifyOverdueContacts = () => {
  const { contacts } = useContactStore.getState(); 
  const { getPriorityByContactId } = useRelationshipStore.getState();
  const { events } = useScheduledEventStore.getState();

  contacts.forEach(contact => {
    const priority = getPriorityByContactId(contact.id);
    if (!priority?.daysLimit) return;

    const contactEvents = events.filter(e => e.contactId === contact.id);
    const latest = contactEvents.sort((a, b) =>
      new Date(b.datetime).getTime() - new Date(a.datetime).getTime()
    )[0];

    const lastDate = latest ? new Date(latest.datetime) : null;
    const daysSince = lastDate ? differenceInDays(new Date(), lastDate) : Infinity;

    if (daysSince >= priority.daysLimit) {
     Notifications.scheduleNotificationAsync({
  content: {
    title: '📞 Recuérdalo',
    body: `Debes contactar a ${contact.name}, han pasado más de ${priority.daysLimit} días.`,
    sound: true,
  },
  trigger: {
    type: 'timeInterval',
    seconds: 15,
    repeats: false,
  } as Notifications.TimeIntervalTriggerInput,
});

    }
  });
};
