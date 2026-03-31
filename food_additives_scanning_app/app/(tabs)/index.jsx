import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Button, Image, RefreshControl } from 'react-native';
import { useLanguage } from '../../context/LanguageContext';
import { useHistory } from '../../context/HistoryContext';
import { useAuth } from '../../context/AuthContext';
import { useAlerts } from '../../context/AlertContext';
import { useRouter } from 'expo-router';
import Ionicons from '@expo/vector-icons/Ionicons';
import { useState, useCallback } from 'react';

export default function HomeScreen() {
  const { i18n } = useLanguage();
  const { history } = useHistory();
  const { user } = useAuth();
  const { alerts, fetchAlerts } = useAlerts();
  const router = useRouter();
  const isVip = user?.isVip || false;
  const [refreshing, setRefreshing] = useState(false);

  const isWithin7Days = (dateString) => {
    if (!dateString) return false;
    const alertDate = new Date(dateString);
    if (isNaN(alertDate.getTime())) return false;
    const now = new Date();
    const diffTime = now.getTime() - alertDate.getTime();
    if (diffTime < -86400000) return false; 
    const diffDays = diffTime / (1000 * 60 * 60 * 24);
    return diffDays >= -1 && diffDays <= 7;
  };

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await fetchAlerts();
    setRefreshing(false);
  }, []);

  const recentScans = history.slice(0, 3);

  return (
    <ScrollView 
      style={styles.container} 
      contentContainerStyle={{paddingBottom: 50}}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      }
    >
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
          <View style={{ alignItems: 'center' }}>
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <Ionicons name="star" size={20} color="white" style={{ marginRight: 8 }} />
              <Text style={styles.vipButtonText}>{i18n.upgradeVIP}</Text>
            </View>
            <Text style={styles.vipButtonSubText}>{i18n.unlockFeatures}</Text>
            <Text style={[styles.vipButtonSubText, { color: '#ffefc2', fontWeight: 'bold' }]}>{i18n.unlimitedScans}</Text>
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
          alerts.slice(0, 3).map((alert, index) => {
            let richContent = alert.description;
            console.log(`Alert ${index} fields:`, Object.keys(alert));
            if (alert.actionTaken || alert.productDetails) {
                 console.log("Using rich content for alert", index);
                 richContent = `
                    ${alert.issueDate ? `<p><b>${i18n.issueDate}</b> ${alert.issueDate}</p>` : ''}
                    ${alert.source ? `<p><b>${i18n.source}</b> ${alert.source}</p>` : ''}
                    ${alert.foodItem ? `<p><b>${i18n.foodItem}</b> ${alert.foodItem}</p>` : ''}
                    ${alert.productDetails ? `<p><b>${i18n.productDetails}</b><br/>${alert.productDetails.replace(/\n/g, '<br/>')}</p>` : (alert.description || '')}
                    ${alert.reason ? `<p><b>${i18n.reason}</b><br/>${alert.reason.replace(/\n/g, '<br/>')}</p>` : ''}
                    ${alert.actionTaken ? `<p><b>${i18n.actionTaken}</b><br/>${alert.actionTaken.replace(/\n/g, '<br/>')}</p>` : ''}
                    ${alert.adviceToTrade ? `<p><b>${i18n.adviceToTrade}</b><br/>${alert.adviceToTrade.replace(/\n/g, '<br/>')}</p>` : ''}
                    ${alert.adviceToConsumers ? `<p><b>${i18n.adviceToConsumers}</b><br/>${alert.adviceToConsumers.replace(/\n/g, '<br/>')}</p>` : ''}
                    ${alert.moreInfo ? `<p><b>${i18n.moreInfo}</b><br/>${alert.moreInfo.replace(/\n/g, '<br/>')}</p>` : ''}
                 `;
            } else {
                 console.log("Using description for alert", index);
            }

            return (
            <TouchableOpacity 
              key={index}
              onPress={() => router.push({
                pathname: '/news-details',
                params: {
                  newsId: alert.link, 
                  title: alert.title,
                  content: richContent,
                  date: alert.publishDate || alert.pubDate,
                  link: alert.link
                }
              })}
            >
              <View style={styles.card}>
                <View style={{flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 4}}>
                  <Text style={[styles.cardTitle, { flex: 1, marginBottom: 0 }]} numberOfLines={2}>{alert.title}</Text>
                  {isWithin7Days(alert.publishDate || alert.pubDate) && (
                    <Text style={{color: '#ff4444', fontWeight: 'bold', marginLeft: 8, fontSize: 12}}>{i18n.newAlert || 'New!!'}</Text>
                  )}
                </View>
                <Text style={styles.cardDate}>{alert.publishDate || alert.pubDate}</Text>
              </View>
            </TouchableOpacity>
          );
         })
        ) : (
          <Text style={{ textAlign: 'center', marginTop: 10, color: '#666' }}>{i18n.noAlerts || 'No active alerts.'}</Text>
        )}
      </View>

      {recentScans.length > 0 && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{i18n.recentScans}</Text>
          {recentScans.map((scan, index) => (
            <View key={index} style={styles.card}>
              <View style={{flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center'}}>
                <View style={{flex: 1, paddingRight: 10}}>
                   <Text style={{fontSize: 12, color: '#8c867a', marginBottom: 4}}>{scan.itemCode}</Text>
                   <Text style={{fontSize: 16, fontWeight: 'bold', color: '#2d5a27'}} numberOfLines={1}>{scan.itemName}</Text>
                </View>
                <TouchableOpacity 
                   style={{
                      backgroundColor: '#2d5a27',
                      paddingVertical: 8,
                      paddingHorizontal: 16,
                      borderRadius: 20,
                      shadowColor: '#2d5a27',
                      shadowOffset: { width: 0, height: 2 },
                      shadowOpacity: 0.2,
                      shadowRadius: 3,
                      elevation: 2,
                   }}
                   onPress={() => router.push({
                    pathname: '/product-details',
                    params: { 
                      itemName: scan.itemName, 
                      itemCode: scan.itemCode, 
                      nutritionInformation: scan.nutritionInformation,
                      warning: scan.warning,
                      healthAnalysis: scan.healthAnalysis
                    }
                  })} 
                >
                  <Text style={{color: '#fbf5e5', fontWeight: 'bold', fontSize: 14}}>{i18n.view}</Text>
                </TouchableOpacity>
              </View>
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
    backgroundColor: '#fbf5e5',
    padding: 15,
  },
  vipButton: {
    backgroundColor: '#D97943',
    padding: 15,
    borderRadius: 20,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
    elevation: 4,
    shadowColor: '#2d5a27',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 5,
  },
  vipButtonText: {
    color: '#fbf5e5',
    fontWeight: 'bold',
    fontSize: 18,
    textAlign: 'center',
  },
  vipButtonSubText: {
    color: '#fbf5e5',
    fontSize: 12,
    opacity: 0.9,
    textAlign: 'center',
  },
  gameCard: {
    backgroundColor: '#fff',
    borderRadius: 24,
    padding: 20,
    marginBottom: 20,
    elevation: 3,
    shadowColor: '#5d574a',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    borderWidth: 1,
    borderColor: '#f0e6d2',
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
    color: '#2d5a27',
  },
  gameDescription: {
    fontSize: 14,
    color: '#5d574a',
    marginBottom: 15,
    lineHeight: 22,
  },
  partnersContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 15,
  },
  partnerBox: {
    width: '23%',
    alignItems: 'center',
    backgroundColor: '#fbf5e5',
    padding: 8,
    borderRadius: 16,
  },
  partnerLogo: {
    width: 40,
    height: 40,
    marginBottom: 5,
  },
  partnerName: {
    fontSize: 10,
    textAlign: 'center',
    color: '#5d574a',
  },
  playButton: {
    backgroundColor: '#2d5a27',
    padding: 15,
    borderRadius: 24,
    alignItems: 'center',
    shadowColor: '#2d5a27',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
    elevation: 4,
  },
  playButtonText: {
    color: '#fbf5e5',
    fontWeight: 'bold',
    fontSize: 16,
  },
  section: {
    marginBottom: 25,
  },
  sectionTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 15,
    color: '#2d5a27',
  },
  card: {
    backgroundColor: '#fff',
    padding: 15,
    borderRadius: 20,
    marginBottom: 10,
    shadowColor: '#5d574a',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
    borderWidth: 1,
    borderColor: '#f0e6d2',
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 5,
    color: '#5d574a',
  },
  cardDate: { 
    fontSize: 12,
    color: '#8c867a',
  },
  cardContent: {
    fontSize: 14,
    color: '#5d574a',
  },
  viewMoreLink: {
    textAlign: 'center',
    color: '#2d5a27',
    marginTop: 10,
    fontSize: 16,
    fontWeight: '600',
  },
  vipDashboardButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#D97943',
    marginBottom: 20,
    padding: 15,
    borderRadius: 20,
    elevation: 4,
    shadowColor: '#D97943',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
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
