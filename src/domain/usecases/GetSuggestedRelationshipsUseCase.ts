import { RelationshipPriority } from '../../features/relationships/viewmodel/useRelationshipStore';

export interface SimplifiedSuggestedRelationship extends RelationshipPriority {
  overdue: boolean;
}

export class GetSuggestedRelationshipsUseCase {
  constructor(private priorities: RelationshipPriority[]) {}

  execute(): SimplifiedSuggestedRelationship[] {
    
    return this.priorities
      .filter(p => p.daysLimit > 0) 
      .map(p => ({
        ...p,
        overdue: true, 
      }))
      .sort((a, b) => {
        const priorityOrder = { red: 3, orange: 2, green: 1 };
        return (priorityOrder[b.color] || 0) - (priorityOrder[a.color] || 0);
      });
  }
}
