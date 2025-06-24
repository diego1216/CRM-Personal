import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import HomeScreen from '../../ui/screens/HomeScreen';
import ContactsScreen from '../../ui/screens/contactsScreen';
import CalendarScreen from '../../ui/screens/CalendarScreen';
import RelationshipDetailScreen from '../../ui/screens/RelationshipDetailScreen';
import ScheduleFromCalendarScreen from '../../ui/screens/ScheduleEventScreen';
import OverdueNotificationsScreen from '../../ui/screens/OverdueNotificationsScreen';


export type RootStackParamList = {
  Home: undefined;
  Contacts: undefined;
  Calendar: undefined;
  RelationshipDetail: { contactId: string };
  ScheduleEvent:undefined;
  OverdueNotifications: undefined;
};

const Stack = createNativeStackNavigator<RootStackParamList>();

const AppNavigator = () => {
  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName="Home" id={undefined}>
        <Stack.Screen name="Home" component={HomeScreen} />
        <Stack.Screen name="Contacts" component={ContactsScreen} />
        <Stack.Screen name="Calendar" component={CalendarScreen} />
        <Stack.Screen name="RelationshipDetail" component={RelationshipDetailScreen} />
        <Stack.Screen name="ScheduleEvent" component={ScheduleFromCalendarScreen} />
        <Stack.Screen name="OverdueNotifications" component={OverdueNotificationsScreen} options={{ title: 'Notificaciones' }} />



      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default AppNavigator;
