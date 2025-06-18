import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import HomeScreen from '../../ui/screens/HomeScreen';
import ContactsScreen from '../../ui/screens/contactsScreen';
import CalendarScreen from '../../ui/screens/CalendarScreen';
import DashboardScreen from '../../ui/screens/DashboardScreen';
import RelationshipDetailScreen from '../../ui/screens/RelationshipDetailScreen';

export type RootStackParamList = {
  Home: undefined;
  Contacts: undefined;
  Calendar: undefined;
  Dashboard:undefined;
  RelationshipDetail: { contactId: string };
};

const Stack = createNativeStackNavigator<RootStackParamList>();

const AppNavigator = () => {
  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName="Home" id={undefined}>
        <Stack.Screen name="Home" component={HomeScreen} />
        <Stack.Screen name="Contacts" component={ContactsScreen} />
        <Stack.Screen name="Calendar" component={CalendarScreen} />
        <Stack.Screen name="Dashboard" component={DashboardScreen} />
        <Stack.Screen name="RelationshipDetail" component={RelationshipDetailScreen} />

      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default AppNavigator;
