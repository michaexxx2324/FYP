import { Tabs, useRouter } from 'expo-router';
import Ionicons from '@expo/vector-icons/Ionicons';
import { useLanguage } from '../../context/LanguageContext';
import { TouchableOpacity } from 'react-native';
import TranslateButton from '../../components/TranslateButton';

export default function VipLayout() {
  const { i18n } = useLanguage();
  const router = useRouter();

  return (
    <Tabs screenOptions={{
      tabBarActiveTintColor: '#2d5a27',
      tabBarInactiveTintColor: 'gray',
      headerShown: true,
      headerStyle: { backgroundColor: '#fbf5e5' },
      headerTintColor: '#2d5a27',
      headerTitleStyle: { fontWeight: 'bold' },
      headerLeft: () => (
        <TouchableOpacity onPress={() => router.back()} style={{ marginLeft: 15 }}>
          <Ionicons name="arrow-back" size={24} color="#2d5a27" />
        </TouchableOpacity>
      ),
      headerRight: () => (
        <TranslateButton style={{ marginRight: 15 }} textStyle={{ color: '#2d5a27' }} />
      ),
    }}>
      <Tabs.Screen
        name="home"
        options={{
          title: i18n.home || 'Home',
          tabBarIcon: ({ color }) => <Ionicons name="home" size={24} color={color} />,
        }}
        listeners={() => ({
          tabPress: (e) => {
            e.preventDefault();
            router.dismissAll();
            router.replace('/(tabs)');
          },
        })}
      />
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
