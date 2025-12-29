import React, { useState } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Button, TextInput, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import Ionicons from '@expo/vector-icons/Ionicons';
import { useLanguage } from '../../context/LanguageContext';
import { useHistory } from '../../context/HistoryContext';

export default function HistoryScreen() {
  const { i18n } = useLanguage();
  const { history, removeFromHistory } = useHistory();
  const router = useRouter();
  const [searchText, setSearchText] = useState('');

  const filteredHistory = history.filter(item => {
    const searchLower = searchText.toLowerCase();
    const nameMatch = item.itemName && item.itemName.toLowerCase().includes(searchLower);
    const codeMatch = item.itemCode && item.itemCode.toLowerCase().includes(searchLower);
    return nameMatch || codeMatch;
  });

  const handleDelete = (item) => {
    Alert.alert(
      "Delete History",
      `Are you sure you want to remove ${item.itemName} from history?`,
      [
        { text: "Cancel", style: "cancel" },
        { text: "Delete", style: "destructive", onPress: () => removeFromHistory(item.itemCode) }
      ]
    );
  };

  const renderItem = ({ item }) => (
    <View style={styles.card}>
      <View style={styles.cardHeader}>
        <Text style={styles.cardTitle}>{item.itemCode} - {item.itemName}</Text>
        <TouchableOpacity onPress={() => handleDelete(item)} style={styles.deleteButton}>
          <Ionicons name="trash-outline" size={20} color="red" />
        </TouchableOpacity>
      </View>
      <Button 
        title="View" 
        onPress={() => router.push({
          pathname: '/product-details',
          params: { 
            itemName: item.itemName, 
            itemCode: item.itemCode, 
            nutritionInformation: item.nutritionInformation 
          }
        })} 
      />
    </View>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.headerTitle}>{i18n.historyScreen}</Text>
      
      <TextInput
        style={styles.searchInput}
        placeholder={i18n.searchPlaceholder}
        value={searchText}
        onChangeText={setSearchText}
      />

      {filteredHistory.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>No matching history found.</Text>
        </View>
      ) : (
        <FlatList
          data={filteredHistory}
          keyExtractor={(item, index) => index.toString()}
          renderItem={renderItem}
          contentContainerStyle={styles.listContent}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
    padding: 20,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 10,
    color: '#333',
  },
  searchInput: {
    backgroundColor: 'white',
    padding: 10,
    borderRadius: 8,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#ddd',
  },
  listContent: {
    paddingBottom: 20,
  },
  card: {
    backgroundColor: 'white',
    padding: 15,
    borderRadius: 10,
    marginBottom: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    flex: 1,
  },
  deleteButton: {
    padding: 5,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 16,
    color: '#666',
  },
});
