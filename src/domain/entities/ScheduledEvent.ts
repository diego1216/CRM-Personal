export interface ScheduledEvent {
  id: string;
  contactId: string;
  date: string;
  priority: 'high' | 'medium' | 'low';
  color: string;
  contactName?: string;
}
