import React, { useEffect, useRef, useState } from 'react';
import { View, Text, Platform } from 'react-native';
import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import AppNavigator from './src/presentation/navigation/AppNavigator';
import { getFCMToken } from './src/data/notification/notifications';
import { checkAndNotifyOverdueContacts } from './src/domain/usecases/checkAndNotifyOverdueContacts'; // Nueva lógica

export default function App() {
  const [expoPushToken, setExpoPushToken] = useState<string | null>(null);
  const [notification, setNotification] = useState<Notifications.Notification | null>(null);
  const notificationListener = useRef<Notifications.Subscription | null>(null);
  const responseListener = useRef<Notifications.Subscription | null>(null);

  useEffect(() => {
    const initNotifications = async () => {
      if (Device.isDevice) {
        const { status } = await Notifications.requestPermissionsAsync();
        if (status !== 'granted') {
          alert('Permiso de notificaciones denegado');
          return;
        }
      }

      if (Platform.OS === 'android') {
        await Notifications.setNotificationChannelAsync('default', {
          name: 'default',
          importance: Notifications.AndroidImportance.DEFAULT,
        });
      }

      getFCMToken().then(token => {
        if (token) {
          console.log('Expo Push Token:', token);
          setExpoPushToken(token);
        }
      });

      // Verificar contactos vencidos al iniciar
      checkAndNotifyOverdueContacts();
    };

    initNotifications();

    // Escuchar notificaciones en primer plano
    notificationListener.current = Notifications.addNotificationReceivedListener(notification => {
      setNotification(notification);
    });

    // Escuchar cuando el usuario toca una notificación
    responseListener.current = Notifications.addNotificationResponseReceivedListener(response => {
      console.log('Usuario tocó la notificación:', response);
    });

    return () => {
      notificationListener.current?.remove();
      responseListener.current?.remove();
    };
  }, []);

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <AppNavigator />

      {/* Debug UI */}
      <View style={{ position: 'absolute', bottom: 20, left: 10, right: 10 }}>
        <Text style={{ fontWeight: 'bold' }}>Expo Push Token:</Text>
        <Text selectable>{expoPushToken ?? 'Obteniendo token...'}</Text>

        {notification && (
          <View style={{ marginTop: 10 }}>
            <Text style={{ fontWeight: 'bold' }}>🔔 Notificación recibida:</Text>
            <Text>Título: {notification.request.content.title}</Text>
            <Text>Cuerpo: {notification.request.content.body}</Text>
            <Text>Data: {JSON.stringify(notification.request.content.data)}</Text>
          </View>
        )}
      </View>
    </GestureHandlerRootView>
  );
}
