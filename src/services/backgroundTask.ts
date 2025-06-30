// Importa el módulo para ejecutar tareas en segundo plano con Expo
import * as BackgroundFetch from 'expo-background-fetch';

// Importa el gestor de tareas de Expo para definir y registrar tareas
import * as TaskManager from 'expo-task-manager';

// Importa la función que revisa contactos vencidos y programa notificaciones
import { checkAndNotifyOverdueContacts } from '../domain/usecases/checkAndNotifyOverdueContacts';

// Nombre único que identifica la tarea en segundo plano
const TASK_NAME = 'background-check-overdue-contacts';


//  DEFINICIÓN DE LA TAREA
// 

// Define la tarea que se ejecutará en segundo plano
TaskManager.defineTask(TASK_NAME, async () => {
  try {
    // Muestra mensaje de inicio en consola
    console.log('🔄 Ejecutando tarea en segundo plano...');

    // Ejecuta la lógica para revisar contactos vencidos y notificar
    await checkAndNotifyOverdueContacts();

    // Muestra mensaje de éxito en consola
    console.log('✅ Verificación completada');

    // Retorna un resultado indicando que hay datos nuevos procesados
    return BackgroundFetch.BackgroundFetchResult.NewData;
  } catch (error) {
    // Si ocurre un error, lo muestra en consola
    console.error('❌ Error en la tarea en segundo plano:', error);

    // Indica que la tarea falló
    return BackgroundFetch.BackgroundFetchResult.Failed;
  }
});


// REGISTRO DE LA TAREA


// Función que registra la tarea en el sistema
export async function registerBackgroundTask() {
  try {
    // Obtiene el estado actual del permiso para Background Fetch
    const status = await BackgroundFetch.getStatusAsync();

    // Si el dispositivo no permite tareas en segundo plano, muestra advertencia y termina
    if (
      status === BackgroundFetch.BackgroundFetchStatus.Restricted ||
      status === BackgroundFetch.BackgroundFetchStatus.Denied
    ) {
      console.warn('⛔️ Background Fetch no está permitido en este dispositivo');
      return;
    }

    // Verifica si la tarea ya fue registrada anteriormente
    const isRegistered = await TaskManager.isTaskRegisteredAsync(TASK_NAME);

    // Si no está registrada aún, la registra con sus opciones
    if (!isRegistered) {
      await BackgroundFetch.registerTaskAsync(TASK_NAME, {
        minimumInterval: 60 * 60 * 12, // La tarea se ejecutará cada 12 horas como mínimo
        stopOnTerminate: false,       // La tarea sigue activa aunque se cierre la app
        startOnBoot: true,            // Se inicia automáticamente al reiniciar el dispositivo
      });

      // Muestra mensaje de confirmación
      console.log('📅 Tarea de verificación registrada exitosamente');
    } else {
      // Si ya estaba registrada, lo indica en consola
      console.log('🔁 La tarea de verificación ya está registrada');
    }
  } catch (err) {
    // Captura y muestra errores ocurridos al intentar registrar la tarea
    console.error('❌ Error registrando la tarea:', err);
  }
}
