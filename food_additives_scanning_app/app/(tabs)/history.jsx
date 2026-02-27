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
      i18n.deleteHistory,
      i18n.deleteConfirm,
      [
        { text: i18n.cancel, style: "cancel" },
        { text: i18n.delete, style: "destructive", onPress: () => removeFromHistory(item.itemCode) }
      ]
    );
  };

  const renderItem = ({ item }) => (
    <View style={styles.card}>
      <View style={styles.cardHeader}>
        <Text style={styles.cardInfo}>{item.itemCode}</Text>
        <Text style={styles.cardTitle} numberOfLines={1}>{item.itemName}</Text>
      </View>
      
      <View style={styles.cardActions}>
        <TouchableOpacity 
          style={styles.viewButton}
          onPress={() => router.push({
            pathname: '/product-details',
            params: { 
              itemName: item.itemName, 
              itemCode: item.itemCode, 
              nutritionInformation: item.nutritionInformation,
              warning: item.warning,
              healthAnalysis: item.healthAnalysis
            }
          })}
        >
          <Text style={styles.viewButtonText}>{i18n.view}</Text>
        </TouchableOpacity>

        <TouchableOpacity onPress={() => handleDelete(item)} style={styles.deleteButton}>
          <Ionicons name="trash-outline" size={20} color="#D97943" />
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.headerTitle}>{i18n.historyScreen}</Text>
      
      <TextInput
        style={styles.searchInput}
        placeholder={i18n.searchPlaceholder}
        placeholderTextColor="#8c867a"
        value={searchText}
        onChangeText={setSearchText}
      />

      {filteredHistory.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>{i18n.noHistoryFound}</Text>
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
    backgroundColor: '#fbf5e5',
    padding: 20,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    color: '#2d5a27', // Primary
  },
  searchInput: {
    backgroundColor: '#fff',
    padding: 15,
    borderRadius: 12,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#d1cabb',
    fontSize: 16,
    color: '#5d574a',
  },
  listContent: {
    paddingBottom: 80,
  },
  card: {
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 20,
    marginBottom: 15,
    shadowColor: '#5d574a',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 3,
    borderWidth: 1,
    borderColor: '#f0e6d2',
  },
  cardHeader: {
    marginBottom: 15,
  },
  cardInfo: {
    fontSize: 12,
    color: '#8c867a',
    marginBottom: 4,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2d5a27',
  },
  cardActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 5,
  },
  viewButton: {
    backgroundColor: '#2d5a27',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 24,
    shadowColor: '#2d5a27',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
    elevation: 2,
  },
  viewButtonText: {
    color: '#fbf5e5',
    fontWeight: 'bold',
    fontSize: 14,
  },
  deleteButton: {
    padding: 10,
    backgroundColor: '#fbf5e5',
    borderRadius: 20,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 50,
  },
  emptyText: {
    fontSize: 16,
    color: '#8c867a',
  },
});
