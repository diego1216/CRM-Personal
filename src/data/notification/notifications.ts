// Importa el módulo 'expo-device' para verificar si el dispositivo es físico
import * as Device from 'expo-device';

// Importa todas las funcionalidades relacionadas con notificaciones push
import * as Notifications from 'expo-notifications';

// Configura el manejador global de notificaciones en la app
Notifications.setNotificationHandler({
  // Define cómo se deben comportar las notificaciones cuando se reciben
  handleNotification: async () => ({
    shouldShowAlert: true,     // Muestra una alerta visual al recibir la notificación
    shouldPlaySound: false,    // No reproduce sonido
    shouldSetBadge: false,     // No actualiza el contador de ícono de la app
    shouldShowBanner: true,    // Muestra un banner (en dispositivos que lo soporten)
    shouldShowList: true,      // Muestra en el centro de notificaciones
  }),
});

// Función asincrónica que obtiene el token de notificación push (FCM)
export async function getFCMToken(): Promise<string | null> {
  // Verifica si se está ejecutando en un dispositivo físico
  if (!Device.isDevice) {
    alert('Debes usar un dispositivo físico para recibir notificaciones push.');
    return null; // Si no es un dispositivo físico, devuelve null
  }

  // Obtiene el estado actual de los permisos de notificación
  const { status: existingStatus } = await Notifications.getPermissionsAsync();
  let finalStatus = existingStatus;

  // Si los permisos no fueron concedidos, solicita permiso al usuario
  if (existingStatus !== 'granted') {
    const { status } = await Notifications.requestPermissionsAsync();
    finalStatus = status; // Actualiza el estado final con el nuevo permiso
  }

  // Si después de solicitar el permiso no fue concedido, muestra alerta y retorna null
  if (finalStatus !== 'granted') {
    alert('Permiso denegado para notificaciones push.');
    return null;
  }

  // Obtiene el token de push del dispositivo
  const token = (await Notifications.getDevicePushTokenAsync()).data;

  // Muestra el token en consola (útil para pruebas o enviar a un backend)
  console.log('FCM Token:', token);

  // Retorna el token obtenido
  return token;
}
