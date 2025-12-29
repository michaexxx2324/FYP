import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Button } from 'react-native';
import { useLanguage } from '../../context/LanguageContext';
import { useHistory } from '../../context/HistoryContext';
import { useRouter } from 'expo-router';
import Ionicons from '@expo/vector-icons/Ionicons';

export default function HomeScreen() {
  const { i18n } = useLanguage();
  const { history } = useHistory();
  const router = useRouter();
  const isVip = false; // Mock VIP status

  const recentScans = history.slice(0, 3);

  return (
    <ScrollView style={styles.container}>
      {!isVip && (
        <TouchableOpacity style={styles.vipButton}>
          <Ionicons name="star" size={20} color="white" style={{ marginRight: 8 }} />
          <View>
            <Text style={styles.vipButtonText}>{i18n.upgradeVIP}</Text>
            <Text style={styles.vipButtonSubText}>{i18n.unlockFeatures}</Text>
          </View>
        </TouchableOpacity>
      )}

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>{i18n.newsTitle}</Text>
        
        <View style={styles.card}>
          <Text style={styles.cardTitle}>{i18n.recallNotice}: XX Brand Cookies (Batch 2025-10)</Text>
          <Text style={styles.cardContent}>{i18n.warning}: Contains undeclared allergens</Text>
        </View>

        <View style={styles.card}>
           <Text style={styles.cardTitle}>{i18n.productRecall}: YY Brand Milk (Batch 2025-11)</Text>
           <Text style={styles.cardContent}>{i18n.foodAlert}: Bacterial contamination suspected</Text>
        </View>
      </View>

      {recentScans.length > 0 && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Recent Scans</Text>
          {recentScans.map((scan, index) => (
            <View key={index} style={styles.card}>
              <Text style={styles.cardTitle}>{scan.itemCode} - {scan.itemName}</Text>
              <Button 
                title="View" 
                onPress={() => router.push({
                  pathname: '/product-details',
                  params: { 
                    itemName: scan.itemName, 
                    itemCode: scan.itemCode, 
                    nutritionInformation: scan.nutritionInformation 
                  }
                })} 
              />
            </View>
          ))}
          {history.length > 3 && (
            <TouchableOpacity onPress={() => router.push('/history')}>
              <Text style={styles.viewMoreLink}>View more in History</Text>
            </TouchableOpacity>
          )}
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
    padding: 15,
  },
  vipButton: {
    backgroundColor: '#FFAC1C',
    padding: 15,
    borderRadius: 10,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
  },
  vipButtonText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 18,
  },
  vipButtonSubText: {
    color: 'white',
    fontSize: 12,
  },
  section: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 10,
    color: '#333',
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
  cardTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  cardContent: {
    fontSize: 14,
    color: '#666',
  },
  viewMoreLink: {
    textAlign: 'center',
    color: '#007AFF',
    marginTop: 10,
    fontSize: 16,
  },
});
