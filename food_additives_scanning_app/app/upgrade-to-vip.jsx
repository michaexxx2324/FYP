import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image } from 'react-native';
import { useRouter } from 'expo-router';
import { useLanguage } from '../context/LanguageContext';
import { useUser } from '../context/UserContext';
import Ionicons from '@expo/vector-icons/Ionicons';

export default function UpgradeToVipScreen() {
  const { i18n, language, toggleLanguage } = useLanguage();
  const { isVip } = useUser();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState('recipe');

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

          {/* Recipe Item 1 */}
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

          {/* Recipe Item 2 */}
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
      {/* Header Removed as requested */}
      
      <ScrollView style={styles.scrollView}>
        {/* Banner */}
        <View style={styles.banner}>
          <View style={styles.bannerContent}>
            <Ionicons name="star" size={24} color="white" style={{ marginRight: 8 }} />
            <Text style={styles.bannerTitle}>{i18n.vipFeatures} | VIP Features</Text>
          </View>
          <Text style={styles.bannerSubtitle}>{i18n.vipSubtitle}</Text>
        </View>

        {/* Tabs */}
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

        {/* Content Area */}
        {renderContent()}

        {/* Membership Section */}
        <View style={styles.contentCard}>
          <Text style={styles.cardTitle}>{i18n.membership}</Text>
          <Text style={styles.priceText}>{i18n.price}</Text>
          
          {!isVip ? (
            <TouchableOpacity 
              style={[styles.upgradeButton, { marginTop: 15, width: '100%', marginRight: 0 }]}
              onPress={() => router.push('/payment')}
            >
              <Text style={styles.upgradeButtonText}>{i18n.upgradeVIP}</Text>
            </TouchableOpacity>
          ) : (
            <View style={[styles.upgradeButton, { marginTop: 15, width: '100%', marginRight: 0, backgroundColor: '#4CAF50' }]}>
              <Text style={styles.upgradeButtonText}>{i18n.vipActivated}</Text>
            </View>
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
    backgroundColor: '#f5f5f5',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 50,
    paddingHorizontal: 15,
    paddingBottom: 15,
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  backText: {
    color: '#007AFF',
    fontSize: 16,
    marginLeft: 5,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  langSwitch: {
    color: '#666',
  },
  scrollView: {
    flex: 1,
    padding: 15,
  },
  banner: {
    backgroundColor: '#E68A00', // Orange color from image
    borderRadius: 15,
    padding: 20,
    marginBottom: 20,
    alignItems: 'center',
  },
  bannerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  bannerTitle: {
    color: 'white',
    fontSize: 20,
    fontWeight: 'bold',
  },
  bannerSubtitle: {
    color: 'white',
    fontSize: 14,
  },
  tabsContainer: {
    flexDirection: 'row',
    marginBottom: 20,
  },
  tab: {
    backgroundColor: 'white',
    paddingVertical: 8,
    paddingHorizontal: 15,
    borderRadius: 20,
    marginRight: 10,
  },
  activeTab: {
    backgroundColor: '#00BFFF', // Light blue from image
  },
  tabText: {
    color: '#666',
    fontSize: 12,
  },
  activeTabText: {
    color: 'white',
    fontWeight: 'bold',
  },
  contentCard: {
    backgroundColor: 'white',
    borderRadius: 15,
    padding: 20,
    marginBottom: 20,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 5,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  cardSubtitle: {
    color: '#666',
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
    backgroundColor: '#E68A00',
    borderRadius: 2,
    marginRight: 10,
  },
  recipeContent: {
    flex: 1,
  },
  recipeName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 2,
  },
  recipeDesc: {
    fontSize: 12,
    color: '#666',
    marginBottom: 5,
  },
  vipTag: {
    backgroundColor: '#FFF3E0',
    alignSelf: 'flex-start',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: '#E68A00',
  },
  vipTagText: {
    color: '#E68A00',
    fontSize: 10,
    fontWeight: 'bold',
  },
  viewMoreButton: {
    backgroundColor: '#E68A00',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 10,
  },
  viewMoreText: {
    color: 'white',
    fontWeight: 'bold',
  },
  priceText: {
    fontSize: 16,
    color: '#666',
    marginTop: 10,
  },
  bottomContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'white',
    flexDirection: 'row',
    padding: 15,
    borderTopWidth: 1,
    borderTopColor: '#eee',
  },
  upgradeButton: {
    flex: 1,
    backgroundColor: '#E68A00',
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
    marginRight: 10,
  },
  upgradeButtonText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 16,
  },
  learnMoreButton: {
    flex: 1,
    backgroundColor: '#666',
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
  },
  learnMoreText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 16,
  },
  // New Styles
  progressBarContainer: {
    backgroundColor: '#28a745', // Green
    padding: 20,
    borderRadius: 10,
    alignItems: 'center',
    marginBottom: 20,
  },
  progressText: {
    color: 'white',
    fontSize: 32,
    fontWeight: 'bold',
  },
  progressSubText: {
    color: 'white',
    fontSize: 14,
  },
  calorieRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  calorieBox: {
    backgroundColor: '#FFF9C4', // Light yellow
    flex: 0.48,
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
  },
  calorieBoxTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  calorieBoxValue: {
    fontSize: 16,
  },
  actionButton: {
    backgroundColor: '#E68A00',
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
  },
  actionButtonText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 16,
  },
  analysisText: {
    fontSize: 16,
    marginBottom: 5,
    color: '#333',
  },
  bulletPoint: {
    flexDirection: 'row',
    marginBottom: 5,
    paddingLeft: 10,
  },
  bullet: {
    fontSize: 16,
    marginRight: 5,
    color: '#333',
  },
  bulletText: {
    fontSize: 14,
    color: '#555',
    flex: 1,
  },
});
