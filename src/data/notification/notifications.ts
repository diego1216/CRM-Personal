import * as Device from 'expo-device';
import * as Notifications from 'expo-notifications';


Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: false,
    shouldSetBadge: false,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});


export async function getFCMToken(): Promise<string | null> {
  if (!Device.isDevice) {
    alert('Debes usar un dispositivo físico para recibir notificaciones push.');
    return null;
  }

  const { status: existingStatus } = await Notifications.getPermissionsAsync();
  let finalStatus = existingStatus;

  if (existingStatus !== 'granted') {
    const { status } = await Notifications.requestPermissionsAsync();
    finalStatus = status;
  }

  if (finalStatus !== 'granted') {
    alert('Permiso denegado para notificaciones push.');
    return null;
  }

  const token = (await Notifications.getDevicePushTokenAsync()).data;
  console.log('FCM Token:', token);
  return token;
}
