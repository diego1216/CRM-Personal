import { useMemo } from 'react';
import { useRelationshipStore } from './useRelationshipStore';
import { GetSuggestedRelationshipsUseCase } from '../../../domain/usecases/GetSuggestedRelationshipsUseCase';

export const useSuggestedRelationships = () => {
  const { relationships } = useRelationshipStore();

  return useMemo(() => {
    const useCase = new GetSuggestedRelationshipsUseCase(relationships);
    return useCase.execute();
  }, [relationships]);
};
