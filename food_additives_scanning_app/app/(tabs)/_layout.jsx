import { Tabs } from 'expo-router';
import Ionicons from '@expo/vector-icons/Ionicons';
import { TouchableOpacity, Text, StyleSheet } from 'react-native';
import { useLanguage } from '../../context/LanguageContext';

export default function TabLayout() {
  const { toggleLanguage, i18n } = useLanguage();

  return (
    <Tabs screenOptions={{
      tabBarActiveTintColor: 'blue',
      headerRight: () => (
        <TouchableOpacity onPress={toggleLanguage} style={styles.langButton}>
          <Text style={styles.langText}>中/ENG</Text>
        </TouchableOpacity>
      ),
    }}>
      <Tabs.Screen
        name="index"
        options={{
          title: i18n.home,
          tabBarIcon: ({ color }) => <Ionicons name="home" size={24} color={color} />,
        }}
      />
      <Tabs.Screen
        name="scan"
        options={{
          title: i18n.scan,
          tabBarIcon: ({ color }) => <Ionicons name="camera" size={24} color={color} />,
        }}
      />
      <Tabs.Screen
        name="history"
        options={{
          title: i18n.history,
          tabBarIcon: ({ color }) => <Ionicons name="time" size={24} color={color} />,
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: i18n.profile,
          tabBarIcon: ({ color }) => <Ionicons name="person" size={24} color={color} />,
        }}
      />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  langButton: {
    marginRight: 15,
    padding: 5,
    backgroundColor: '#f0f0f0',
    borderRadius: 5,
    borderWidth: 1,
    borderColor: '#ccc',
  },
  langText: {
    fontSize: 12,
    fontWeight: 'bold',
  },
});
