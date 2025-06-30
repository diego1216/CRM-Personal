
import * as BackgroundFetch from 'expo-background-fetch';
import * as TaskManager from 'expo-task-manager';
import { checkAndNotifyOverdueContacts } from '../domain/usecases/checkAndNotifyOverdueContacts';

const TASK_NAME = 'background-check-overdue-contacts';

// Define la tarea
TaskManager.defineTask(TASK_NAME, async () => {
  try {
    console.log('🔄 Ejecutando tarea en segundo plano...');
    await checkAndNotifyOverdueContacts();
    console.log('✅ Verificación completada');
    return BackgroundFetch.BackgroundFetchResult.NewData;
  } catch (error) {
    console.error('❌ Error en la tarea en segundo plano:', error);
    return BackgroundFetch.BackgroundFetchResult.Failed;
  }
});

// Función para registrar la tarea
export async function registerBackgroundTask() {
  try {
    const status = await BackgroundFetch.getStatusAsync();

    if (
      status === BackgroundFetch.BackgroundFetchStatus.Restricted ||
      status === BackgroundFetch.BackgroundFetchStatus.Denied
    ) {
      console.warn('⛔️ Background Fetch no está permitido en este dispositivo');
      return;
    }

    const isRegistered = await TaskManager.isTaskRegisteredAsync(TASK_NAME);

    if (!isRegistered) {
      await BackgroundFetch.registerTaskAsync(TASK_NAME, {
        minimumInterval: 60 * 60 * 12, // Cada 12 horas
        stopOnTerminate: false,
        startOnBoot: true,
      });
      console.log('📅 Tarea de verificación registrada exitosamente');
    } else {
      console.log('🔁 La tarea de verificación ya está registrada');
    }
  } catch (err) {
    console.error('❌ Error registrando la tarea:', err);
  }
}
