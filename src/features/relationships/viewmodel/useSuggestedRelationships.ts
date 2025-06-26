import { useMemo } from 'react';
import { useRelationshipStore } from './useRelationshipStore';
import { GetSuggestedRelationshipsUseCase, SimplifiedSuggestedRelationship } from '../../../domain/usecases/GetSuggestedRelationshipsUseCase';

export const useSuggestedRelationships = (): SimplifiedSuggestedRelationship[] => {
  const { priorities } = useRelationshipStore();

  return useMemo(() => {
    const useCase = new GetSuggestedRelationshipsUseCase(priorities);
    return useCase.execute();
  }, [priorities]);
};
