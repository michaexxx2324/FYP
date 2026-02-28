import { Stack } from 'expo-router';
import { LanguageProvider } from '../context/LanguageContext';
import { HistoryProvider } from '../context/HistoryContext';
import { AuthProvider } from '../context/AuthContext';
import { AlertProvider } from '../context/AlertContext';

export default function RootLayout() {
  return (
    <AuthProvider>
      <LanguageProvider>
        <AlertProvider>
        <HistoryProvider>
            <Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: '#fbf5e5' } }}>
              <Stack.Screen name="index" />
              <Stack.Screen name="login" />
              <Stack.Screen name="register" />
              <Stack.Screen name="forgot-password" />
              <Stack.Screen name="(tabs)" />
              <Stack.Screen 
                name="product-details" 
                options={{ 
                  title: 'Product Details', 
                  headerShown: true,
                  headerStyle: { backgroundColor: '#fbf5e5' },
                  headerShadowVisible: false
                }} 
              />
            </Stack>
        </HistoryProvider>
        </AlertProvider>
      </LanguageProvider>
    </AuthProvider>
  );
}
