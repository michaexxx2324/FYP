import { Tabs, useRouter } from 'expo-router';
import Ionicons from '@expo/vector-icons/Ionicons';
import { useLanguage } from '../../context/LanguageContext';
import { TouchableOpacity } from 'react-native';

export default function VipLayout() {
  const { i18n } = useLanguage();
  const router = useRouter();

  return (
    <Tabs screenOptions={{
      tabBarActiveTintColor: '#FFD700',
      tabBarInactiveTintColor: 'gray',
      headerShown: true,
      headerStyle: { backgroundColor: '#FFD700' },
      headerTintColor: '#fff',
      headerTitleStyle: { fontWeight: 'bold' },
      headerLeft: () => (
        <TouchableOpacity onPress={() => router.back()} style={{ marginLeft: 15 }}>
          <Ionicons name="arrow-back" size={24} color="white" />
        </TouchableOpacity>
      ),
    }}>
      <Tabs.Screen
        name="recipes"
        options={{
          title: i18n.recipes || 'Recipes',
          tabBarIcon: ({ color }) => <Ionicons name="restaurant" size={24} color={color} />,
        }}
      />
      <Tabs.Screen
        name="analysis"
        options={{
          title: i18n.advancedAnalysis || 'Analysis',
          tabBarIcon: ({ color }) => <Ionicons name="analytics" size={24} color={color} />,
        }}
      />
      <Tabs.Screen
        name="calories"
        options={{
          title: i18n.calorieCounter || 'Calories',
          tabBarIcon: ({ color }) => <Ionicons name="flame" size={24} color={color} />,
        }}
      />
    </Tabs>
  );
}
