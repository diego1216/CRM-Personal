// Importa el tipo RelationshipPriority desde el store de relaciones
import { RelationshipPriority } from '../../features/relationships/viewmodel/useRelationshipStore';

// Define una interfaz que extiende RelationshipPriority y agrega una propiedad booleana 'overdue'
export interface SimplifiedSuggestedRelationship extends RelationshipPriority {
  overdue: boolean; // Indica si la relación está vencida o no
}

// Caso de uso para obtener relaciones sugeridas, priorizadas y marcadas como vencidas
export class GetSuggestedRelationshipsUseCase {
  // Constructor que recibe un arreglo de prioridades como dependencia (inyección de datos)
  constructor(private priorities: RelationshipPriority[]) {}

  // Método que ejecuta la lógica del caso de uso y devuelve relaciones sugeridas
  execute(): SimplifiedSuggestedRelationship[] {
    
    return this.priorities
      // Filtra las prioridades que tienen un límite de días válido (> 0)
      .filter(p => p.daysLimit > 0) 
      
      // Mapea cada prioridad a una estructura que incluye la bandera 'overdue: true'
      .map(p => ({
        ...p,              // Copia todas las propiedades originales de la prioridad
        overdue: true,     // Marca la relación como vencida (en esta versión se asume siempre vencida)
      }))
      
      // Ordena las relaciones por color de prioridad, de mayor a menor urgencia
      .sort((a, b) => {
        const priorityOrder = { red: 3, orange: 2, green: 1 }; // Asigna peso a cada color
        return (priorityOrder[b.color] || 0) - (priorityOrder[a.color] || 0); // Orden descendente
      });
  }
}
