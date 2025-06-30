// Importa React y algunos hooks necesarios
import React, { useEffect, useRef, useState } from 'react';
// Importa componentes de React Native
import { View, Text, Platform, Alert } from 'react-native';
// Importa las funciones de notificaciones de Expo
import * as Notifications from 'expo-notifications';
// Importa utilidades de dispositivo para validar si es un dispositivo físico
import * as Device from 'expo-device';
// Importa el contenedor raíz necesario para gestos (Reanimated/GestureHandler)
import { GestureHandlerRootView } from 'react-native-gesture-handler';
// Importa el componente principal de navegación
import AppNavigator from './src/presentation/navigation/AppNavigator';
// Importa función para obtener el token FCM de notificaciones push
import { getFCMToken } from './src/data/notification/notifications';
// Importa la función que revisa contactos vencidos y lanza notificaciones
import { checkAndNotifyOverdueContacts } from './src/domain/usecases/checkAndNotifyOverdueContacts';
// Importa función que registra la tarea en segundo plano
import { registerBackgroundTask } from './src/services/backgroundTask';
// Importa inicializador de la base de datos SQLite
import { initDatabase } from './src/data/storage/SQLiteService';
// Importa el store de relaciones
import { useRelationshipStore } from './src/features/relationships/viewmodel/useRelationshipStore';

// Configura el manejador global de notificaciones
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,     // Mostrar alerta emergente
    shouldPlaySound: false,    // No reproducir sonido
    shouldSetBadge: false,     // No cambiar el ícono de la app
    shouldShowBanner: true,    // Mostrar banner en iOS
    shouldShowList: true,      // Mostrar en la lista de notificaciones
  }),
});

// Componente principal de la aplicación
export default function App() {
  const [expoPushToken, setExpoPushToken] = useState<string | null>(null); // Guarda el token FCM
  const [notification, setNotification] = useState<Notifications.Notification | null>(null); // Última notificación recibida
  const notificationListener = useRef<Notifications.Subscription | null>(null); // Referencia al listener de notificaciones
  const responseListener = useRef<Notifications.Subscription | null>(null); // Referencia al listener de respuestas

  // Hook de efecto que se ejecuta al montar la app
  useEffect(() => {
    // Función asincrónica de inicialización
    const initialize = async () => {
      try {
        // Inicializa SQLite
        await initDatabase();
        console.log('📁 SQLite lista');

        // Carga prioridades almacenadas localmente
        await useRelationshipStore.getState().loadPrioritiesFromDB();
        console.log('📊 Prioridades cargadas desde SQLite');

        // Solicita permisos de notificaciones en dispositivos físicos
        if (Device.isDevice) {
          const { status } = await Notifications.requestPermissionsAsync();
          if (status !== 'granted') {
            Alert.alert('❌ Permiso de notificaciones denegado');
            return;
          }
        }

        // Crea canal de notificaciones para Android
        if (Platform.OS === 'android') {
          await Notifications.setNotificationChannelAsync('default', {
            name: 'default',
            importance: Notifications.AndroidImportance.DEFAULT,
          });
        }

        // Obtiene el token FCM (Firebase Cloud Messaging) para enviar push notifications
        const fcmToken = await getFCMToken();
        if (fcmToken) {
          if (__DEV__) console.log('Expo Push Token:', fcmToken); // Muestra token en modo desarrollo
          setExpoPushToken(fcmToken); // Guarda el token en el estado
        }

        // Verifica y notifica si hay contactos pendientes
        checkAndNotifyOverdueContacts();
        // Registra la tarea en segundo plano para notificar de manera periódica
        await registerBackgroundTask();

      } catch (error) {
        // Muestra errores de inicialización
        console.error('Error al inicializar la app:', error);
      }
    };

    // Ejecuta la función de inicialización
    initialize();

    // Agrega listeners para recibir notificaciones en tiempo real
    notificationListener.current = Notifications.addNotificationReceivedListener(setNotification);
    responseListener.current = Notifications.addNotificationResponseReceivedListener(response => {
      console.log('👆 Usuario tocó una notificación:', response);
    });

    // Limpia los listeners al desmontar el componente
    return () => {
      notificationListener.current?.remove();
      responseListener.current?.remove();
    };
  }, []);

  // Renderiza la app dentro del GestureHandlerRootView
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <AppNavigator /> {/* Componente que maneja toda la navegación */}
    </GestureHandlerRootView>
  );
}
