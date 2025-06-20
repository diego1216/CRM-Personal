export interface Contact {
  id: string;
  name: string;
  phoneNumbers: { number?: string }[]; 
  nextEvent?: {
    date: string;
    priority: number;
    color: string;
  };
}
