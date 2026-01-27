import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { useLanguage } from '../../context/LanguageContext';
import { useAuth } from '../../context/AuthContext';
import { useRouter } from 'expo-router';
import Ionicons from '@expo/vector-icons/Ionicons';
import { API_URL } from '@env';

export default function ProfileScreen() {
  const { i18n } = useLanguage();
  const { user, logout, updateUser } = useAuth();
  const router = useRouter();

  const getLabel = (id) => {
    return i18n[id] || id;
  };

  const handleResetVip = async () => {
    if (!user) return;
    try {
      const response = await fetch(`${API_URL}/user/update`, {
        method: 'PUT',
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
        <View style={styles.infoItem}>
          <Text style={styles.infoLabel}>{i18n.email}</Text>
          <Text style={styles.infoValue}>{user.email}</Text>
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
    backgroundColor: '#f5f5f5',
  },
  header: {
    backgroundColor: 'white',
    padding: 30,
    alignItems: 'center',
    marginBottom: 10,
  },
  avatarContainer: {
    marginBottom: 10,
  },
  username: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  vipBadge: {
    flexDirection: 'row',
    backgroundColor: '#E68A00',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 15,
    alignItems: 'center',
  },
  vipText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 12,
  },
  infoSection: {
    backgroundColor: 'white',
    padding: 20,
    marginBottom: 10,
  },
  infoItem: {
    marginBottom: 15,
  },
  infoLabel: {
    fontSize: 14,
    color: '#666',
    marginBottom: 5,
  },
  infoValue: {
    fontSize: 16,
    color: '#333',
  },
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  tag: {
    backgroundColor: '#E1F5FE',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 15,
    marginRight: 8,
    marginBottom: 8,
  },
  tagText: {
    color: '#0277BD',
    fontSize: 14,
  },
  vipDashboardButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFD700', 
    margin: 20,
    marginTop: 0,
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
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 15,
    color: '#333',
  },
  couponCard: {
    flexDirection: 'row',
    backgroundColor: '#f9f9f9',
    borderRadius: 10,
    padding: 15,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#eee',
    alignItems: 'center',
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
    color: '#4CAF50',
  },
  couponCode: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginVertical: 2,
  },
  couponPartner: {
    fontSize: 12,
    color: '#666',
  },
  menu: {
    backgroundColor: 'white',
    paddingHorizontal: 20,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  menuText: {
    flex: 1,
    fontSize: 16,
    marginLeft: 15,
    color: '#333',
  },
});
