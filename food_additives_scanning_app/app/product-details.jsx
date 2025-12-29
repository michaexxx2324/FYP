import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { useLocalSearchParams } from 'expo-router';

export default function ProductDetailsScreen() {
  const params = useLocalSearchParams();
  const { itemName, itemCode, nutritionInformation } = params;

  return (
    <ScrollView style={styles.container}>
      <View style={styles.card}>
        <Text style={styles.label}>Item Name:</Text>
        <Text style={styles.value}>{itemName}</Text>
        
        <Text style={styles.label}>Item Code:</Text>
        <Text style={styles.value}>{itemCode}</Text>
        
        <Text style={styles.label}>Nutrition Information:</Text>
        <Text style={styles.value}>{nutritionInformation}</Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#f5f5f5',
  },
  card: {
    backgroundColor: 'white',
    padding: 20,
    borderRadius: 10,
    elevation: 3,
  },
  label: {
    fontSize: 16,
    fontWeight: 'bold',
    marginTop: 10,
    color: '#333',
  },
  value: {
    fontSize: 16,
    marginBottom: 10,
    color: '#555',
  },
});
