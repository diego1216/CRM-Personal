// Importa useMemo de React para memorizar valores derivados de dependencias
import { useMemo } from 'react';

// Importa el store zustand donde se gestionan las prioridades de los contactos
import { useRelationshipStore } from './useRelationshipStore';

// Importa el caso de uso y el tipo que define la forma de las relaciones sugeridas
import { GetSuggestedRelationshipsUseCase, SimplifiedSuggestedRelationship } from '../../../domain/usecases/GetSuggestedRelationshipsUseCase';

// Hook personalizado que devuelve las relaciones sugeridas basadas en las prioridades actuales
export const useSuggestedRelationships = (): SimplifiedSuggestedRelationship[] => {
  // Obtiene la lista de prioridades actual desde el store global
  const { priorities } = useRelationshipStore();

  // Memoriza el resultado del caso de uso mientras no cambien las prioridades
  return useMemo(() => {
    // Crea una instancia del caso de uso con las prioridades actuales
    const useCase = new GetSuggestedRelationshipsUseCase(priorities);

    // Ejecuta el caso de uso y devuelve la lista de relaciones sugeridas
    return useCase.execute();
  }, [priorities]); // Solo se recalcula si cambian las prioridades
};
