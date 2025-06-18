import { Relationship } from '../../domain/entities/Relationship';
import dayjs from 'dayjs';

export interface SuggestedRelationship extends Relationship {
  daysSinceLast: number;
  overdue: boolean;
}

export class GetSuggestedRelationshipsUseCase {
  constructor(private relationships: Relationship[]) {}

  execute(): SuggestedRelationship[] {
    return this.relationships.map(rel => {
      const last = dayjs(rel.lastInteraction);
      const now = dayjs();
      const daysSince = now.diff(last, 'day');
      const overdue = daysSince > rel.frequencyInDays;

      return {
        ...rel,
        daysSinceLast: daysSince,
        overdue,
      };
    }).filter(r => r.overdue) // Solo los que necesitan atención
      .sort((a, b) => b.priority - a.priority); // Más urgentes primero
  }
}
