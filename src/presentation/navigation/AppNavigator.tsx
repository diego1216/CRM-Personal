// Importa React para poder usar JSX
import React from 'react';

// Importa el contenedor de navegación principal de React Navigation
import { NavigationContainer } from '@react-navigation/native';

// Importa la función para crear una pila de navegación nativa (stack)
import { createNativeStackNavigator } from '@react-navigation/native-stack';

// Importa las diferentes pantallas que formarán parte de la navegación
import HomeScreen from '../../ui/screens/HomeScreen';
import ContactsScreen from '../../ui/screens/contactsScreen';
import CalendarScreen from '../../ui/screens/CalendarScreen';
import RelationshipDetailScreen from '../../ui/screens/RelationshipDetailScreen';
import ScheduleFromCalendarScreen from '../../ui/screens/ScheduleEventScreen';
import OverdueNotificationsScreen from '../../ui/screens/OverdueNotificationsScreen';
import EditEventScreen from '../../ui/screens/EditEventScreen';
import { CreateEventScreen } from '../../ui/screens/CreateEventScreen';

// Define los nombres de las rutas y los parámetros que cada una puede recibir
export type RootStackParamList = {
  Home: undefined;                                 // Ruta sin parámetros
  Contacts: undefined;                             // Ruta sin parámetros
  Calendar: undefined;                             // Ruta sin parámetros
  RelationshipDetail: { contactId: string };       // Ruta que recibe un contactId
  ScheduleEvent: undefined;                        // Ruta sin parámetros
  OverdueNotifications: undefined;                 // Ruta sin parámetros
  EditEvent: { eventId: string };                  // Ruta que recibe un eventId
  CreateEvent: { date?: string };                  // Ruta que recibe un parámetro opcional date
};

// Crea la pila de navegación con tipado fuerte usando RootStackParamList
const Stack = createNativeStackNavigator<RootStackParamList>();

// Componente principal de navegación de la app
const AppNavigator = () => (
  // Envuélvelo en NavigationContainer para habilitar navegación
  <NavigationContainer>
    {/* Define el stack de pantallas. Se inicia en "Home" */}
    <Stack.Navigator initialRouteName="Home" id={undefined}>
      {/* Pantalla principal de inicio */}
      <Stack.Screen name="Home" component={HomeScreen} />

      {/* Pantalla que muestra los contactos */}
      <Stack.Screen name="Contacts" component={ContactsScreen} />

      {/* Pantalla del calendario de eventos */}
      <Stack.Screen name="Calendar" component={CalendarScreen} />

      {/* Pantalla de detalles de relación para un contacto específico */}
      <Stack.Screen name="RelationshipDetail" component={RelationshipDetailScreen} />

      {/* Pantalla para agendar evento desde el calendario */}
      <Stack.Screen name="ScheduleEvent" component={ScheduleFromCalendarScreen} />

      {/* Pantalla de notificaciones por contactos vencidos */}
      <Stack.Screen
        name="OverdueNotifications"
        component={OverdueNotificationsScreen}
        options={{ title: 'Notificaciones' }} // Título personalizado en la cabecera
      />

      {/* Pantalla para editar un evento existente */}
      <Stack.Screen
        name="EditEvent"
        component={EditEventScreen}
        options={{ title: 'Editar Evento' }}
      />

      {/* Pantalla para crear un nuevo evento */}
      <Stack.Screen
        name="CreateEvent"
        component={CreateEventScreen}
        options={{ title: 'Nuevo Evento' }}
      />
    </Stack.Navigator>
  </NavigationContainer>
);

// Exporta el componente para ser usado en la raíz de la aplicación
export default AppNavigator;
