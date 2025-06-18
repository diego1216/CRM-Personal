import React from 'react';
import { View, Text, FlatList, ActivityIndicator, StyleSheet } from 'react-native';
import { useContactsViewModel } from '../../features/contacts/viewmodel/ContactsViewModel';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../../presentation/navigation/AppNavigator';
import PrimaryButton from '../components/atoms/PrimaryButton';

type NavigationProp = NativeStackNavigationProp<RootStackParamList, 'Contacts'>;

const ContactsScreen = () => {
  const { contacts, loading, error } = useContactsViewModel();
  const navigation = useNavigation<NavigationProp>();

  if (loading) return <ActivityIndicator size="large" />;
  if (error) return <Text>Error: {error}</Text>;

  return (
    <FlatList
      data={contacts}
      keyExtractor={(item) => item.id}
      renderItem={({ item }) => (
        <View style={styles.item}>
          <Text style={styles.name}>{item.name}</Text>
          {item.phoneNumbers?.[0]?.number && (
            <Text style={styles.info}>{item.phoneNumbers[0].number}</Text>
          )}

          <PrimaryButton
            label="Editar"
            onPress={() =>
              navigation.navigate('RelationshipDetail', { contactId: item.id })
            }
          />
        </View>
      )}
    />
  );
};

export default ContactsScreen;

const styles = StyleSheet.create({
  item: {
    padding: 16,
    borderBottomWidth: 1,
    borderColor: '#ccc',
  },
  name: {
    fontWeight: 'bold',
    fontSize: 16,
  },
  info: {
    fontSize: 14,
    color: 'gray',
    marginBottom: 8,
  },
});
