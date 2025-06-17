import React, { useEffect, useRef, useState } from 'react';
import { View, Text, } from 'react-native';
import * as Notifications from 'expo-notifications';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import AppNavigator from './src/presentation/navigation/AppNavigator';
import { getFCMToken } from './src/data/notification/notifications';

export default function App() {
  const [expoPushToken, setExpoPushToken] = useState<string | null>(null);
  const [notification, setNotification] = useState<Notifications.Notification | null>(null);
  const notificationListener = useRef<Notifications.Subscription | null>(null);
  const responseListener = useRef<Notifications.Subscription | null>(null);

  useEffect(() => {
    // Obtener token
    getFCMToken().then(token => {
      if (token) {
        console.log('Expo Push Token:', token);
        setExpoPushToken(token);
      }
    });

    // Escuchar notificaciones en primer plano
    notificationListener.current = Notifications.addNotificationReceivedListener(notification => {
      setNotification(notification);
    });

    // Escuchar cuando el usuario toca una notificación
    responseListener.current = Notifications.addNotificationResponseReceivedListener(response => {
      console.log('Usuario tocó la notificación:', response);
    });

    // Limpiar listeners al desmontar
    return () => {
      if (notificationListener.current) {
        notificationListener.current.remove();
      }
      if (responseListener.current) {
        responseListener.current.remove();
      }
    };
  }, []);

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <AppNavigator />

      {/* Sección de debug  */}
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
