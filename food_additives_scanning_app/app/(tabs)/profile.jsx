import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, TextInput, Alert, ActivityIndicator } from 'react-native';
import { useLanguage } from '../../context/LanguageContext';
import { useAuth } from '../../context/AuthContext';
import { useRouter } from 'expo-router';
import Ionicons from '@expo/vector-icons/Ionicons';
import { API_URL } from '@env';

export default function ProfileScreen() {
  const { i18n } = useLanguage();
  const { user, logout, updateUser } = useAuth();
  const router = useRouter();

  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [editData, setEditData] = useState({});

  useEffect(() => {
    if (user) {
      setEditData({
        userId: user.userId,
        username: user.username || '',
        email: user.email || '',
        height: user.height || '',
        weight: user.weight || '',
        dob: user.dob || '', 
        allergies: user.allergies || [],
        dietPreferences: user.dietPreferences || [],
        healthStatus: user.healthStatus || [],
        age: user.age || ''
      });
    }
  }, [user]);

  const getLabel = (id) => {
    return i18n[id] || id;
  };

  const handleSaveProfile = async () => {
    setLoading(true);
    try {
     
      
      const response = await fetch(`${API_URL}/user/update`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editData),
      });

      if (response.ok) {
        const data = await response.json();
        updateUser(data.user);
        setIsEditing(false);
        Alert.alert(i18n.success || "Success", i18n.profileUpdated || "Profile Updated");
      } else {
        Alert.alert(i18n.error || "Error", i18n.failedToUpdateProfile || "Failed to update profile");
      }
    } catch (e) {
      console.error(e);
      Alert.alert(i18n.error || "Error", i18n.networkError || "Network error");
    } finally {
      setLoading(false);
    }
  };

  const toggleListSelection = (field, id) => {
    setEditData(prev => {
      const list = prev[field] || [];
      const newList = list.includes(id) 
        ? list.filter(item => item !== id)
        : [...list, id];
      return { ...prev, [field]: newList };
    });
  };

  const handleResetVip = async () => {
    if (!user) return;
    try {
      const response = await fetch(`${API_URL}/user/update`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: user.userId, isVip: false }),
      });
      if (response.ok) {
        updateUser({ isVip: false });
        alert(i18n.vipStatusReset);
      }
    } catch (e) {
      console.error(e);
    }
  };

  if (!user) {
    return (
      <View style={styles.container}>
        <Text>{i18n.pleaseLoginToViewProfile}</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={{paddingBottom: 80}}>
      <View style={styles.header}>
        <View style={styles.headerTopRow}>
           
        </View>
        <View style={styles.avatarContainer}>
          <Ionicons name="person-circle-outline" size={80} color="#ccc" />
        </View>
        <Text style={styles.username}>{user.username}</Text>
        {user.isVip && (
          <View style={styles.vipBadge}>
            <Ionicons name="star" size={16} color="white" style={{ marginRight: 4 }} />
            <Text style={styles.vipText}>{i18n.vipMember}</Text>
          </View>
        )}
      </View>

      
      {user.isVip && (
        <TouchableOpacity 
          style={styles.vipDashboardButton}
          onPress={() => router.push('/vip/recipes')}
        >
          <Ionicons name="diamond-outline" size={24} color="white" style={{ marginRight: 10 }} />
          <Text style={styles.vipDashboardText}>{i18n.vipDashboard || "VIP Dashboard"}</Text>
          <Ionicons name="chevron-forward" size={24} color="white" style={{ marginLeft: 'auto' }} />
        </TouchableOpacity>
      )}

      <View style={styles.infoSection}>
        {isEditing ? (
          <>
            <View style={styles.infoItem}>
              <Text style={styles.infoLabel}>{i18n.heightLabel || "Height (cm)"}</Text>
              <TextInput 
                style={styles.input} 
                value={String(editData.height || '')} 
                onChangeText={t => setEditData({...editData, height: t})} 
                keyboardType="numeric"
              />
            </View>
            <View style={styles.infoItem}>
               <Text style={styles.infoLabel}>{i18n.weightLabel || "Weight (kg)"}</Text>
               <TextInput 
                style={styles.input} 
                value={String(editData.weight || '')} 
                onChangeText={t => setEditData({...editData, weight: t})} 
                keyboardType="numeric"
              />
            </View>
            <View style={styles.infoItem}>
               <Text style={styles.infoLabel}>{i18n.age || "Age"}</Text>
               <TextInput 
                style={styles.input} 
                value={String(editData.age || '')} 
                onChangeText={t => setEditData({...editData, age: t})} 
                keyboardType="numeric"
                editable={false}
              />
            </View>
             <View style={styles.infoItem}>
              <Text style={styles.infoLabel}>{i18n.healthStatusLabel || "Health Status"}</Text>
              <View style={styles.tagsContainer}>
                {['pregnant', 'diabetes', 'highBloodPressure', 'kidneyDisease', 'cardiovascularDisease', 'stroke', 'arthritis'].map((status) => (
                  <TouchableOpacity 
                    key={status} 
                    style={[styles.tag, editData.healthStatus?.includes(status) && styles.selectedTag]}
                    onPress={() => toggleListSelection('healthStatus', status)}
                  >
                    <Text style={[styles.tagText, editData.healthStatus?.includes(status) && styles.selectedTagText]}>{getLabel(status) || status}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
             <View style={styles.infoItem}>
              <Text style={styles.infoLabel}>{i18n.allergies}</Text>
              <View style={styles.tagsContainer}>
                {['peanut','nut','gluten','dairy','egg','shellfish','sulfites'].map((a) => (
                  <TouchableOpacity 
                    key={a} 
                    style={[styles.tag, editData.allergies?.includes(a) && styles.selectedTag]}
                    onPress={() => toggleListSelection('allergies', a)}
                  >
                    <Text style={[styles.tagText, editData.allergies?.includes(a) && styles.selectedTagText]}>{getLabel(a)}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
             <View style={styles.infoItem}>
              <Text style={styles.infoLabel}>{i18n.dietPreferences}</Text>
               <View style={styles.tagsContainer}>
                {['none','vegetarian','vegan','halal'].map((d) => (
                  <TouchableOpacity 
                    key={d} 
                    style={[styles.tag, editData.dietPreferences?.includes(d) && styles.selectedTag]}
                    onPress={() => toggleListSelection('dietPreferences', d)}
                  >
                    <Text style={[styles.tagText, editData.dietPreferences?.includes(d) && styles.selectedTagText]}>{getLabel(d)}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          </>
        ) : (
          <>
            <View style={styles.infoItem}>
              <Text style={styles.infoLabel}>{i18n.email}</Text>
              <Text style={styles.infoValue}>{user.email}</Text>
            </View>
            
            <View style={styles.infoItem}>
              <Text style={styles.infoLabel}>{i18n.age || "Age"}</Text>
              <Text style={styles.infoValue}>{user.age || 'N/A'}</Text>
            </View>

            <View style={styles.infoItem}>
              <Text style={styles.infoLabel}>{i18n.heightLabel || "Height"}</Text>
              <Text style={styles.infoValue}>{user.height ? user.height + ' cm' : 'N/A'}</Text>
            </View>

            <View style={styles.infoItem}>
              <Text style={styles.infoLabel}>{i18n.weightLabel || "Weight"}</Text>
              <Text style={styles.infoValue}>{user.weight ? user.weight + ' kg' : 'N/A'}</Text>
            </View>

            <View style={styles.infoItem}>
              <Text style={styles.infoLabel}>{i18n.healthStatusLabel || "Health Status"}</Text>
              <View style={styles.tagsContainer}>
                 {user.healthStatus && user.healthStatus.length > 0 ? (
                  user.healthStatus.map((s, index) => (
                    <View key={index} style={styles.tag}>
                      <Text style={styles.tagText}>{getLabel(s) || s}</Text>
                    </View>
                  ))
                ) : (
                  <Text style={styles.infoValue}>{i18n.none}</Text>
                )}
              </View>
            </View>

            <View style={styles.infoItem}>
              <Text style={styles.infoLabel}>{i18n.allergies}</Text>
              <View style={styles.tagsContainer}>
                {user.allergies && user.allergies.length > 0 ? (
                  user.allergies.map((allergy, index) => (
                    <View key={index} style={styles.tag}>
                      <Text style={styles.tagText}>{getLabel(allergy)}</Text>
                    </View>
                  ))
                ) : (
                  <Text style={styles.infoValue}>{i18n.none}</Text>
                )}
              </View>
            </View>
            
            <View style={styles.infoItem}>
              <Text style={styles.infoLabel}>{i18n.dietPreferences}</Text>
              <View style={styles.tagsContainer}>
                {user.dietPreferences && user.dietPreferences.length > 0 ? (
                  user.dietPreferences.map((diet, index) => (
                    <View key={index} style={styles.tag}>
                      <Text style={styles.tagText}>{getLabel(diet)}</Text>
                    </View>
                  ))
                ) : (
                  <Text style={styles.infoValue}>{i18n.none}</Text>
                )}
              </View>
            </View>
          </>
        )}
      </View>

      
      {user.coupons && user.coupons.length > 0 && (
        <View style={styles.infoSection}>
          <Text style={styles.sectionTitle}>{i18n.myCoupons || "My Coupons"}</Text>
          {user.coupons.map((coupon, index) => (
            <View key={index} style={styles.couponCard}>
              <View style={styles.couponLeft}>
                <Ionicons name="ticket-outline" size={30} color="#4CAF50" />
              </View>
              <View style={styles.couponRight}>
                <Text style={styles.couponDiscount}>{coupon.discount}</Text>
                <Text style={styles.couponCode}>{coupon.code}</Text>
                <Text style={styles.couponPartner}>{coupon.partner}</Text>
              </View>
            </View>
          ))}
        </View>
      )}

      <View style={styles.menu}>
        {!user.isVip && (
          <TouchableOpacity 
            style={styles.menuItem} 
            onPress={() => router.push('/upgrade-to-vip')}
          >
            <Ionicons name="diamond-outline" size={24} color="#E68A00" />
            <Text style={styles.menuText}>{i18n.upgradeVIP}</Text>
            <Ionicons name="chevron-forward" size={24} color="#ccc" />
          </TouchableOpacity>
        )}

        <TouchableOpacity 
          style={styles.menuItem} 
          onPress={() => router.push('/settings')}
        >
          <Ionicons name="settings-outline" size={24} color="#666" />
          <Text style={styles.menuText}>{i18n.settings}</Text>
          <Ionicons name="chevron-forward" size={24} color="#ccc" />
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={styles.menuItem} 
          onPress={logout}
        >
          <Ionicons name="log-out-outline" size={24} color="#FF3B30" />
          <Text style={[styles.menuText, { color: '#FF3B30' }]}>{i18n.logout}</Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={styles.menuItem} 
          onPress={() => router.push('/blog/favorites')}
        >
          <Ionicons name="heart-outline" size={24} color="#FF4081" />
          <Text style={styles.menuText}>{i18n.myFavorites || "My Favorites"}</Text>
          <Ionicons name="chevron-forward" size={24} color="#ccc" />
        </TouchableOpacity>

        <TouchableOpacity 
          style={styles.menuItem} 
          onPress={handleResetVip}
        >
          <Ionicons name="refresh-outline" size={24} color="#666" />
          <Text style={styles.menuText}>{i18n.resetVipStatus}</Text>
        </TouchableOpacity>
      </View>
      
      <View style={{height: 30}} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fbf5e5',
  },
  header: {
    backgroundColor: '#fff',
    padding: 30,
    alignItems: 'center',
    paddingTop: 50,
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
    elevation: 4,
    shadowColor: '#5d574a',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    marginBottom: 20,
  },
  headerTopRow: {
    width: '100%',
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginBottom: 10,
  },
  editButtonText: {
    color: '#2d5a27',
    fontSize: 16,
    fontWeight: '600',
  },
  input: {
    borderWidth: 1,
    borderColor: '#d1cabb',
    borderRadius: 12,
    padding: 10,
    fontSize: 16,
    marginTop: 5,
    backgroundColor: '#fff',
    color: '#5d574a',
  },
  selectedTag: {
    backgroundColor: '#2d5a27',
  },
  selectedTagText: {
    color: '#fbf5e5',
  },
  avatarContainer: {
    marginBottom: 10,
  },
  username: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 5,
    color: '#2d5a27',
  },
  vipBadge: {
    flexDirection: 'row',
    backgroundColor: '#D97943', 
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 20,
    alignItems: 'center',
    marginTop: 5,
  },
  vipText: {
    color: '#fbf5e5',
    fontWeight: 'bold',
    fontSize: 12,
  },
  infoSection: {
    backgroundColor: '#fff',
    padding: 20,
    marginBottom: 20,
    borderRadius: 20,
    marginHorizontal: 15,
    elevation: 2,
    shadowColor: '#5d574a',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 5,
  },
  infoItem: {
    marginBottom: 15,
  },
  infoLabel: {
    fontSize: 14,
    color: '#8c867a', 
    marginBottom: 5,
    fontWeight: '600',
  },
  infoValue: {
    fontSize: 16,
    color: '#5d574a',
  },
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  tag: {
    backgroundColor: '#fbf5e5', 
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    marginRight: 8,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#e6dfcf',
  },
  tagText: {
    color: '#5d574a',
    fontSize: 14,
  },
  vipDashboardButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#D97943', 
    marginHorizontal: 15,
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
    color: '#fbf5e5',
    fontSize: 18,
    fontWeight: 'bold',
    marginLeft: 5,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 15,
    color: '#2d5a27',
  },
  couponCard: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 15,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#f0e6d2',
    alignItems: 'center',
    elevation: 1,
  },
  couponLeft: {
    marginRight: 15,
  },
  couponRight: {
    flex: 1,
  },
  couponDiscount: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2d5a27',
  },
  couponCode: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#5d574a',
    marginVertical: 2,
  },
  couponPartner: {
    fontSize: 12,
    color: '#8c867a',
  },
  menu: {
    paddingHorizontal: 15,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 15,
    paddingHorizontal: 20,
    backgroundColor: '#fff',
    marginBottom: 10,
    borderRadius: 16,
    elevation: 1,
    shadowColor: '#5d574a',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
  },
  menuText: {
    flex: 1,
    fontSize: 16,
    marginLeft: 15,
    color: '#5d574a',
    fontWeight: '500',
  },
});
