import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Button, Image } from 'react-native';
import { useLanguage } from '../../context/LanguageContext';
import { useHistory } from '../../context/HistoryContext';
import { useAuth } from '../../context/AuthContext';
import { useRouter } from 'expo-router';
import Ionicons from '@expo/vector-icons/Ionicons';
import { useState, useEffect } from 'react';
import { API_URL } from '@env';

export default function HomeScreen() {
  const { i18n, language } = useLanguage();
  const { history } = useHistory();
  const { user } = useAuth();
  const router = useRouter();
  const isVip = user?.isVip || false;

  const [alerts, setAlerts] = useState([]);

  useEffect(() => {
    const fetchAlerts = async () => {
      try {
        const langParam = language === 'zh' ? 'tc' : 'en';
        console.log(`Fetching alerts from ${API_URL}/alerts?lang=${langParam}`);
        const response = await fetch(`${API_URL}/alerts?lang=${langParam}`);
        const data = await response.json();
        if (data.success) {
          setAlerts(data.data);
        }
      } catch (error) {
        console.error('Failed to fetch alerts:', error);
      }
    };

    fetchAlerts();
  }, [language]);

  const recentScans = history.slice(0, 3);

  return (
    <ScrollView style={styles.container} contentContainerStyle={{paddingBottom: 50}}>
      {isVip ? (
        <TouchableOpacity 
          style={styles.vipDashboardButton}
          onPress={() => router.push('/vip/recipes')}
        >
          <Ionicons name="diamond-outline" size={24} color="white" style={{ marginRight: 10 }} />
          <Text style={styles.vipDashboardText}>{i18n.vipDashboard || "VIP Dashboard"}</Text>
          <Ionicons name="chevron-forward" size={24} color="white" style={{ marginLeft: 'auto' }} />
        </TouchableOpacity>
      ) : (
        <TouchableOpacity 
          style={styles.vipButton}
          onPress={() => router.push('/upgrade-to-vip')}
        >
          <Ionicons name="star" size={20} color="white" style={{ marginRight: 8 }} />
          <View>
            <Text style={styles.vipButtonText}>{i18n.upgradeVIP}</Text>
            <Text style={styles.vipButtonSubText}>{i18n.unlockFeatures}</Text>
          </View>
        </TouchableOpacity>
      )}

      
      <View style={styles.gameCard}>
        <View style={styles.gameHeader}>
          <Ionicons name="game-controller" size={24} color="#FF9800" />
          <Text style={styles.gameTitle}>{i18n.discountGame || "Discount Game"}</Text>
        </View>
        
        <Text style={styles.gameDescription}>
          {i18n.gameDescription || "Tired of just scanning labels?\nDo you want some free discount? try this now\nplaying the games to get the 10% off of our Partner Store!!"}
        </Text>

        <View style={styles.partnersContainer}>
          <View style={styles.partnerBox}>
            <Image source={require('../../assets/HKTVmall.png')} style={styles.partnerLogo} resizeMode="contain" />
            <Text style={styles.partnerName}>{i18n.hktvmall}</Text>
          </View>
          <View style={styles.partnerBox}>
            <Image source={require('../../assets/pandamart.jpg')} style={styles.partnerLogo} resizeMode="contain" />
            <Text style={styles.partnerName}>{i18n.pandamart}</Text>
          </View>
          <View style={styles.partnerBox}>
            <Image source={require('../../assets/PARKnSHOP.png')} style={styles.partnerLogo} resizeMode="contain" />
            <Text style={styles.partnerName}>{i18n.parknshop}</Text>
          </View>
          <View style={styles.partnerBox}>
            <Image source={require('../../assets/wellcome.png')} style={styles.partnerLogo} resizeMode="contain" />
            <Text style={styles.partnerName}>{i18n.wellcome}</Text>
          </View>
        </View>

        <TouchableOpacity 
          style={styles.playButton}
          onPress={() => router.push('/quiz-game')}
        >
          <Text style={styles.playButtonText}>{i18n.playNow || "Play Now"}</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>{i18n.alerts || "Food Alerts"}</Text>
        
        {alerts.length > 0 ? (
          alerts.map((alert, index) => (
            <TouchableOpacity 
              key={index}
              onPress={() => router.push({
                pathname: '/news-details',
                params: {
                  newsId: alert.link, 
                  title: alert.title,
                  content: alert.description,
                  date: alert.publishDate || alert.pubDate,
                  link: alert.link
                }
              })}
            >
              <View style={styles.card}>
                <Text style={styles.cardTitle} numberOfLines={2}>{alert.title}</Text>
                <Text style={styles.cardDate}>{alert.publishDate || alert.pubDate}</Text>
              </View>
            </TouchableOpacity>
          ))
        ) : (
          <Text style={{ textAlign: 'center', marginTop: 10, color: '#666' }}>No active alerts.</Text>
        )}
      </View>

      {recentScans.length > 0 && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{i18n.recentScans}</Text>
          {recentScans.map((scan, index) => (
            <View key={index} style={styles.card}>
              <Text style={styles.cardTitle}>{scan.itemCode} - {scan.itemName}</Text>
              <Button 
                title={i18n.view} 
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
              <Text style={styles.viewMoreLink}>{i18n.viewMoreHistory}</Text>
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
  gameCard: {
    backgroundColor: 'white',
    borderRadius: 15,
    padding: 15,
    marginBottom: 20,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  gameHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  gameTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginLeft: 10,
    color: '#333',
  },
  gameDescription: {
    fontSize: 14,
    color: '#666',
    marginBottom: 15,
    lineHeight: 20,
  },
  partnersContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 15,
  },
  partnerBox: {
    width: '23%',
    alignItems: 'center',
    backgroundColor: '#f9f9f9',
    padding: 5,
    borderRadius: 8,
  },
  partnerLogo: {
    width: 40,
    height: 40,
    marginBottom: 5,
  },
  partnerName: {
    fontSize: 10,
    textAlign: 'center',
    color: '#555',
  },
  playButton: {
    backgroundColor: '#4CAF50',
    padding: 12,
    borderRadius: 25,
    alignItems: 'center',
  },
  playButtonText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 16,
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
    marginBottom: 10, // Added margin for list items
  },
  cardTitle: {
    fontSize: 14, // Adjusted size
    fontWeight: 'bold',
    marginBottom: 5,
  },
  cardDate: { // New style for date
    fontSize: 12,
    color: '#666',
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
  vipDashboardButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFD700', 
    marginBottom: 20,
    padding: 15,
    borderRadius: 10,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
  },
  vipDashboardText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
    textShadowColor: 'rgba(0, 0, 0, 0.1)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 1,
  },
});
