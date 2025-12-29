import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useLanguage } from '../../context/LanguageContext';
import { useUser } from '../../context/UserContext';
import { useRouter } from 'expo-router';
import Ionicons from '@expo/vector-icons/Ionicons';

export default function ProfileScreen() {
  const { i18n } = useLanguage();
  const { isVip, setVipStatus } = useUser();
  const router = useRouter();

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.avatarContainer}>
          <Ionicons name="person-circle-outline" size={80} color="#ccc" />
        </View>
        <Text style={styles.username}>User 123</Text>
        {isVip && (
          <View style={styles.vipBadge}>
            <Ionicons name="star" size={16} color="white" style={{ marginRight: 4 }} />
            <Text style={styles.vipText}>VIP Member</Text>
          </View>
        )}
      </View>

      <View style={styles.menu}>
        {!isVip && (
          <TouchableOpacity 
            style={styles.menuItem} 
            onPress={() => router.push('/upgrade-to-vip')}
          >
            <Ionicons name="diamond-outline" size={24} color="#E68A00" />
            <Text style={styles.menuText}>{i18n.upgradeVIP}</Text>
            <Ionicons name="chevron-forward" size={24} color="#ccc" />
          </TouchableOpacity>
        )}
        
        {/* Reset VIP for testing */}
        <TouchableOpacity 
          style={styles.menuItem} 
          onPress={() => setVipStatus(false)}
        >
          <Ionicons name="refresh-outline" size={24} color="#666" />
          <Text style={styles.menuText}>Reset VIP Status (Debug)</Text>
        </TouchableOpacity>
      </View>
    </View>
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
    marginBottom: 20,
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
