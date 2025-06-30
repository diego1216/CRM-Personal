// Importa React para usar JSX y hooks
import React from 'react';
// Importa componentes básicos de React Native
import { View, Text, StyleSheet } from 'react-native';
// Hook para la navegación entre pantallas
import { useNavigation } from '@react-navigation/native';
// Tipado específico para navegación con Native Stack
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
// Importa la definición de tipos de navegación
import type { RootStackParamList } from '../../presentation/navigation/AppNavigator';
// Importa un botón personalizado reutilizable
import PrimaryButton from '../components/atoms/PrimaryButton'; 

// Define el tipo de navegación para esta pantalla
type NavigationProp = NativeStackNavigationProp<RootStackParamList, 'Home'>;

// Componente funcional principal de la pantalla de inicio
const HomeScreen = () => {
  // Obtiene el objeto de navegación tipado
  const navigation = useNavigation<NavigationProp>();

  // Devuelve la UI de la pantalla
  return (
    <View style={styles.container}>
      {/* Título principal */}
      <Text style={styles.title}>CRM Personal</Text>

      {/* Contenedor de botones de navegación */}
      <View style={styles.buttonGroup}>
        {/* Botón que navega a la pantalla de contactos */}
        <PrimaryButton
          label="Ver Contactos  📞"
          onPress={() => navigation.navigate('Contacts')}
        />
        {/* Botón que navega al calendario */}
        <PrimaryButton
          label="Ver eventos del calendario 📆"
          onPress={() => navigation.navigate('Calendar')}
        />
        {/* Botón que navega a las notificaciones */}
        <PrimaryButton
          label="Ver notificaciones 🔔"
          onPress={() => navigation.navigate('OverdueNotifications')}
        />
      </View>
    </View>
  );
};

// Exporta el componente como default para su uso en navegación
export default HomeScreen;

// Definición de estilos para la pantalla
const styles = StyleSheet.create({
  container: {
    flex: 1, // Ocupa toda la pantalla
    justifyContent: 'center', // Centra verticalmente
    alignItems: 'center', // Centra horizontalmente
    padding: 20, // Relleno interno
  },
  title: {
    fontSize: 22, // Tamaño del texto del título
    fontWeight: 'bold', // Negrita
    marginBottom: 24, // Espacio inferior
  },
  buttonGroup: {
    width: '100%', // Los botones ocuparán todo el ancho disponible
  },
});
