import React, { useEffect, useRef, useState } from 'react';
import { View, Text, Platform, Alert } from 'react-native';
import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import AppNavigator from './src/presentation/navigation/AppNavigator';
import { getFCMToken } from './src/data/notification/notifications';
import { checkAndNotifyOverdueContacts } from './src/domain/usecases/checkAndNotifyOverdueContacts';
import { registerBackgroundTask } from './src/services/backgroundTask';
import { initDatabase } from './src/data/storage/SQLiteService';
import { useRelationshipStore } from './src/features/relationships/viewmodel/useRelationshipStore';

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: false,
    shouldSetBadge: false,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

export default function App() {
  const [expoPushToken, setExpoPushToken] = useState<string | null>(null);
  const [notification, setNotification] = useState<Notifications.Notification | null>(null);
  const notificationListener = useRef<Notifications.Subscription | null>(null);
  const responseListener = useRef<Notifications.Subscription | null>(null);

  useEffect(() => {
    const initialize = async () => {
      try {
        
        await initDatabase();
        console.log('📁 SQLite lista');
        await useRelationshipStore.getState().loadPrioritiesFromDB();
        console.log('📊 Prioridades cargadas desde SQLite');

        // Permisos de notificaciones
        if (Device.isDevice) {
          const { status } = await Notifications.requestPermissionsAsync();
          if (status !== 'granted') {
            Alert.alert('❌ Permiso de notificaciones denegado');
            return;
          }
        }

        // Canal para Android
        if (Platform.OS === 'android') {
          await Notifications.setNotificationChannelAsync('default', {
            name: 'default',
            importance: Notifications.AndroidImportance.DEFAULT,
          });
        }

        // Obtener token FCM
        const fcmToken = await getFCMToken();
        if (fcmToken) {
          if (__DEV__) console.log('Expo Push Token:', fcmToken);
          setExpoPushToken(fcmToken);
        }

        // Notificar contactos vencidos y registrar tarea en background
        checkAndNotifyOverdueContacts();
        await registerBackgroundTask();

      } catch (error) {
        console.error('Error al inicializar la app:', error);
      }
    };

    initialize();

    // Escuchar notificaciones
    notificationListener.current = Notifications.addNotificationReceivedListener(setNotification);
    responseListener.current = Notifications.addNotificationResponseReceivedListener(response => {
      console.log('👆 Usuario tocó una notificación:', response);
    });

    return () => {
      notificationListener.current?.remove();
      responseListener.current?.remove();
    };
  }, []);

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <AppNavigator />
    </GestureHandlerRootView>
  );
}
