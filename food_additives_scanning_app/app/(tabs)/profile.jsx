import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { useLanguage } from '../../context/LanguageContext';
import { useAuth } from '../../context/AuthContext';
import { useRouter } from 'expo-router';
import Ionicons from '@expo/vector-icons/Ionicons';

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
      const response = await fetch('http://192.168.50.124:3000/api/user/update', {
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
    <ScrollView style={styles.container}>
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

      <View style={styles.menu}>
        {user.isVip ? (
          <TouchableOpacity 
            style={styles.menuItem} 
            onPress={() => alert(i18n.vipFunctionalityComingSoon)}
          >
            <Ionicons name="star" size={24} color="#E68A00" />
            <Text style={styles.menuText}>{i18n.vipFunction}</Text>
            <Ionicons name="chevron-forward" size={24} color="#ccc" />
          </TouchableOpacity>
        ) : (
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
