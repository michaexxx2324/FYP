import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { useLanguage } from '../context/LanguageContext';
import { useAuth } from '../context/AuthContext';
import Ionicons from '@expo/vector-icons/Ionicons';
import TranslateButton from '../components/TranslateButton';

import { API_URL } from '@env';

export default function UpgradeToVipScreen() {
  const { i18n, language, toggleLanguage } = useLanguage();
  const { user, updateUser } = useAuth();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState('recipe');

  const handleUpgrade = async () => {
    if (!user) {
      Alert.alert(i18n.error, i18n.pleaseLoginFirst);
      return;
    }

    try {
      
      const response = await fetch(`${API_URL}/user/update`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: user.userId,
          isVip: true
        }),
      });

      const data = await response.json();

      if (response.ok) {
        
        updateUser({ isVip: true });
        Alert.alert(i18n.success, i18n.youAreNowVip, [
          { text: 'OK', onPress: () => router.back() }
        ]);
      } else {
        Alert.alert(i18n.error, data.message || i18n.failedToUpgrade);
      }
    } catch (error) {
      console.error(error);
      Alert.alert(i18n.error, i18n.networkError);
    }
  };

  const renderContent = () => {
    if (activeTab === 'recipe') {
      return (
        <View style={styles.contentCard}>
          <View style={styles.cardHeader}>
            <Ionicons name="search" size={24} color="black" style={{ marginRight: 8 }} />
            <View>
              <Text style={styles.cardTitle}>{i18n.recipeTitle}</Text>
            </View>
          </View>
          <Text style={styles.cardSubtitle}>{i18n.recipeSubtitle}</Text>

          
          <View style={styles.recipeItem}>
            <View style={styles.recipeLeftBorder} />
            <View style={styles.recipeContent}>
              <Text style={styles.recipeName}>{i18n.vegetablePasta}</Text>
              <Text style={styles.recipeDesc}>{i18n.vegetablePastaDesc}</Text>
              <View style={styles.vipTag}>
                <Text style={styles.vipTagText}>{i18n.vipExclusive}</Text>
              </View>
            </View>
          </View>

          
          <View style={styles.recipeItem}>
            <View style={styles.recipeLeftBorder} />
            <View style={styles.recipeContent}>
              <Text style={styles.recipeName}>{i18n.chickenSalad}</Text>
              <Text style={styles.recipeDesc}>{i18n.chickenSaladDesc}</Text>
              <View style={styles.vipTag}>
                <Text style={styles.vipTagText}>{i18n.vipExclusive}</Text>
              </View>
            </View>
          </View>
        </View>
      );
    } else if (activeTab === 'calorie') {
      return (
        <View style={styles.contentCard}>
          <View style={styles.cardHeader}>
            <Ionicons name="stats-chart" size={24} color="black" style={{ marginRight: 8 }} />
            <Text style={styles.cardTitle}>{i18n.calorieTitle}</Text>
          </View>
          
          <View style={styles.progressBarContainer}>
            <Text style={styles.progressText}>1,450</Text>
            <Text style={styles.progressSubText}>{i18n.todayIntake}</Text>
          </View>

          <View style={styles.calorieRow}>
            <View style={styles.calorieBox}>
              <Text style={styles.calorieBoxTitle}>{i18n.breakfast}</Text>
              <Text style={styles.calorieBoxValue}>420 kcal</Text>
            </View>
            <View style={styles.calorieBox}>
              <Text style={styles.calorieBoxTitle}>{i18n.lunch}</Text>
              <Text style={styles.calorieBoxValue}>630 kcal</Text>
            </View>
          </View>
        </View>
      );
    } else if (activeTab === 'analysis') {
      return (
        <View style={styles.contentCard}>
          <View style={styles.cardHeader}>
            <Ionicons name="search" size={24} color="black" style={{ marginRight: 8 }} />
            <Text style={styles.cardTitle}>{i18n.analysisTitle}</Text>
          </View>

          <Text style={styles.analysisText}>{i18n.nutrientScore}: 85/100</Text>
          <Text style={styles.analysisText}>{i18n.additiveRisk}: {i18n.lowRisk}</Text>
          
          <Text style={[styles.analysisText, { marginTop: 10, marginBottom: 5 }]}>{i18n.personalRecommendations}:</Text>
          <View style={styles.bulletPoint}>
            <Text style={styles.bullet}>•</Text>
            <Text style={styles.bulletText}>{i18n.reduceSodium}</Text>
          </View>
          <View style={styles.bulletPoint}>
            <Text style={styles.bullet}>•</Text>
            <Text style={styles.bulletText}>{i18n.increaseFiber}</Text>
          </View>
          <View style={styles.bulletPoint}>
            <Text style={styles.bullet}>•</Text>
            <Text style={styles.bulletText}>{i18n.avoidSulfites}</Text>
          </View>
        </View>
      );
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#333" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{i18n.upgradeVIP}</Text>
        <TranslateButton />
      </View>
      
      <ScrollView style={styles.scrollView} contentContainerStyle={{paddingBottom: 50}}>
        
        <View style={styles.banner}>
          <View style={styles.bannerContent}>
            <Ionicons name="star" size={24} color="white" style={{ marginRight: 8 }} />
            <Text style={styles.bannerTitle}>{i18n.vipFeatures} | VIP Features</Text>
          </View>
          <Text style={styles.bannerSubtitle}>{i18n.vipSubtitle}</Text>
          <Text style={[styles.bannerSubtitle, { marginTop: 8, fontWeight: 'bold', color: '#ffefc2' }]}>
            {i18n.unlimitedScans}
          </Text>
        </View>

        
        <View style={styles.tabsContainer}>
          <TouchableOpacity 
            style={[styles.tab, activeTab === 'recipe' && styles.activeTab]}
            onPress={() => setActiveTab('recipe')}
          >
            <Text style={[styles.tabText, activeTab === 'recipe' && styles.activeTabText]}>
              {i18n.recipeRecommendations}
            </Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={[styles.tab, activeTab === 'calorie' && styles.activeTab]}
            onPress={() => setActiveTab('calorie')}
          >
            <Text style={[styles.tabText, activeTab === 'calorie' && styles.activeTabText]}>
              {i18n.calorieCounting}
            </Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={[styles.tab, activeTab === 'analysis' && styles.activeTab]}
            onPress={() => setActiveTab('analysis')}
          >
            <Text style={[styles.tabText, activeTab === 'analysis' && styles.activeTabText]}>
              {i18n.enhancedAnalysis}
            </Text>
          </TouchableOpacity>
        </View>

        
        {renderContent()}

        
        <View style={styles.contentCard}>
          <Text style={styles.cardTitle}>{i18n.membership}</Text>
          <Text style={styles.priceText}>{i18n.price}</Text>
          
          {!user?.isVip ? (
            <TouchableOpacity 
              style={[styles.upgradeButton, { marginTop: 15, width: '100%', marginRight: 0 }]}
              onPress={() => router.push('/payment')}
            >
              <Text style={styles.upgradeButtonText}>{i18n.upgradeVIP}</Text>
            </TouchableOpacity>
          ) : (
            <TouchableOpacity 
              style={[styles.upgradeButton, { marginTop: 15, width: '100%', marginRight: 0, backgroundColor: '#4CAF50' }]}
              onPress={() => {}}
            >
              <Text style={styles.upgradeButtonText}>{i18n.vipFunctionActive}</Text>
            </TouchableOpacity>
          )}
        </View>
        
        <View style={{ height: 50 }} /> 
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fbf5e5',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 50,
    paddingHorizontal: 15,
    paddingBottom: 15,
    backgroundColor: '#fbf5e5',
    elevation: 0,
    shadowColor: 'transparent',
  },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  backText: {
    color: '#2d5a27',
    fontSize: 16,
    marginLeft: 5,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#2d5a27',
  },
  langSwitch: {
    color: '#5d574a',
  },
  scrollView: {
    flex: 1,
    padding: 15,
  },
  banner: {
    backgroundColor: '#D97943', 
    borderRadius: 20,
    padding: 25,
    marginBottom: 25,
    alignItems: 'center',
    shadowColor: '#D97943',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
    elevation: 4,
  },
  bannerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  bannerTitle: {
    color: '#fbf5e5',
    fontSize: 22,
    fontWeight: 'bold',
  },
  bannerSubtitle: {
    color: '#fbf5e5',
    fontSize: 14,
    textAlign: 'center', 
    opacity: 0.9,
  },
  tabsContainer: {
    flexDirection: 'row',
    marginBottom: 20,
    justifyContent: 'center',
    flexWrap: 'wrap',
    gap: 10,
  },
  tab: {
    backgroundColor: '#fff',
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: '#e6dfcf',
  },
  activeTab: {
    backgroundColor: '#2d5a27', 
    borderColor: '#2d5a27',
  },
  tabText: {
    color: '#5d574a',
    fontSize: 13,
    fontWeight: '600',
  },
  activeTabText: {
    color: '#fbf5e5',
    fontWeight: 'bold',
  },
  contentCard: {
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 20,
    marginBottom: 20,
    elevation: 2,
    shadowColor: '#5d574a',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 5,
    borderWidth: 1,
    borderColor: '#f0e6d2',
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2d5a27',
  },
  cardSubtitle: {
    color: '#8c867a',
    fontSize: 12,
    marginBottom: 20,
  },
  recipeItem: {
    flexDirection: 'row',
    marginBottom: 15,
    backgroundColor: '#fff',
  },
  recipeLeftBorder: {
    width: 4,
    backgroundColor: '#D97943',
    borderRadius: 2,
    marginRight: 10,
  },
  recipeContent: {
    flex: 1,
  },
  recipeName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#2d5a27',
    marginBottom: 2,
  },
  recipeDesc: {
    fontSize: 12,
    color: '#5d574a',
    marginBottom: 5,
  },
  vipTag: {
    backgroundColor: '#FFF3E0',
    alignSelf: 'flex-start',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#D97943',
  },
  vipTagText: {
    color: '#D97943',
    fontSize: 10,
    fontWeight: 'bold',
  },
  viewMoreButton: {
    backgroundColor: '#D97943',
    padding: 12,
    borderRadius: 20,
    alignItems: 'center',
    marginTop: 10,
  },
  viewMoreText: {
    color: '#fbf5e5',
    fontWeight: 'bold',
  },
  priceText: {
    fontSize: 16,
    color: '#5d574a',
    marginTop: 10,
  },
  bottomContainer: {
    
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#fff',
    flexDirection: 'row',
    padding: 15,
    borderTopWidth: 1,
    borderTopColor: '#f0e6d2',
  },
  upgradeButton: {
    flex: 1,
    backgroundColor: '#D97943',
    padding: 15,
    borderRadius: 24,
    alignItems: 'center',
    marginRight: 10,
    elevation: 3,
    shadowColor: '#D97943',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  upgradeButtonText: {
    color: '#fbf5e5',
    fontWeight: 'bold',
    fontSize: 16,
  },
  learnMoreButton: {
    flex: 1,
    backgroundColor: '#8c867a',
    padding: 15,
    borderRadius: 24,
    alignItems: 'center',
  },
  learnMoreText: {
    color: '#fbf5e5',
    fontWeight: 'bold',
    fontSize: 16,
  },
  backButton: {
    padding: 5,
  },
  progressBarContainer: {
    backgroundColor: '#2d5a27', 
    padding: 25,
    borderRadius: 20,
    alignItems: 'center',
    marginBottom: 20,
    shadowColor: '#2d5a27',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 5,
    elevation: 3,
  },
  progressText: {
    color: '#fbf5e5',
    fontSize: 32,
    fontWeight: 'bold',
  },
  progressSubText: {
    color: '#fbf5e5',
    fontSize: 14,
    opacity: 0.9,
  },
  calorieRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  calorieBox: {
    backgroundColor: '#fff', 
    flex: 0.48,
    padding: 15,
    borderRadius: 20,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#e6dfcf',
  },
  calorieBoxTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    marginBottom: 5,
    color: '#2d5a27',
  },
  calorieBoxValue: {
    fontSize: 16,
    color: '#5d574a',
  },
  actionButton: {
    backgroundColor: '#D97943',
    padding: 15,
    borderRadius: 24,
    alignItems: 'center',
  },
  actionButtonText: {
    color: '#fbf5e5',
    fontWeight: 'bold',
    fontSize: 16,
  },
  analysisText: {
    fontSize: 16,
    marginBottom: 5,
    color: '#5d574a',
  },
  bulletPoint: {
    flexDirection: 'row',
    marginBottom: 5,
    paddingLeft: 10,
  },
  bullet: {
    fontSize: 16,
    marginRight: 8,
    color: '#D97943',
  },
  bulletText: {
    fontSize: 14,
    color: '#5d574a',
    flex: 1,
  },
});
