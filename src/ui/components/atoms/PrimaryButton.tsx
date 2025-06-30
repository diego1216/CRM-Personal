// Importa React y los componentes necesarios de React Native
import React from 'react';
import { TouchableOpacity, Text, StyleSheet, GestureResponderEvent } from 'react-native';

// Define los props que el botón acepta: una etiqueta de texto y una función al presionar
interface Props {
  label: string;                                      // Texto que se mostrará en el botón
  onPress: (event: GestureResponderEvent) => void;    // Función que se ejecuta cuando se presiona el botón
}

// Componente funcional de botón personalizado
const PrimaryButton: React.FC<Props> = ({ label, onPress }) => {
  return (
    // TouchableOpacity permite que el botón sea presionable con retroalimentación visual
    <TouchableOpacity
      style={styles.button}        // Aplica los estilos definidos
      onPress={onPress}            // Ejecuta la función proporcionada al presionar
      activeOpacity={0.8}          // Define opacidad al presionar para efecto visual
    >
      <Text style={styles.text}>{label}</Text>  // Muestra el texto del botón con estilo
    </TouchableOpacity>
  );
};

// Exporta el componente para ser utilizado en otras partes de la app
export default PrimaryButton;

// Define los estilos del botón y del texto
const styles = StyleSheet.create({
  button: {
    backgroundColor: '#007AFF',     // Color de fondo azul
    borderRadius: 10,               // Bordes redondeados
    paddingVertical: 15,            // Espaciado vertical interno
    paddingHorizontal: 10,          // Espaciado horizontal interno
    marginVertical: 8,              // Separación vertical entre botones
    alignItems: 'center',           // Centra el contenido horizontalmente
  },
  text: {
    color: '#fff',                  // Color del texto blanco
    fontSize: 16,                   // Tamaño de fuente
    fontWeight: '600',              // Grosor de fuente seminegrita
  },
});
