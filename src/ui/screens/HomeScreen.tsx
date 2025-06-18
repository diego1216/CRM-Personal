import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../../presentation/navigation/AppNavigator';
import PrimaryButton from '../components/atoms/PrimaryButton'; 

type NavigationProp = NativeStackNavigationProp<RootStackParamList, 'Home'>;

const HomeScreen = () => {
  const navigation = useNavigation<NavigationProp>();

  return (
    <View style={styles.container}>
      <Text style={styles.title}>CRM Personal</Text>

      <View style={styles.buttonGroup}>
        <PrimaryButton
          label="Ver Contactos"
          onPress={() => navigation.navigate('Contacts')}
        />
        <PrimaryButton
          label="Ver eventos del calendario 📆"
          onPress={() => navigation.navigate('Calendar')}
        />
        <PrimaryButton
           label="Ir al Dashboard 📊"
           onPress={() => navigation.navigate('Dashboard')}
        />
      </View>
    </View>
  );
};

export default HomeScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 24,
  },
  buttonGroup: {
    width: '20%',
  },
});
