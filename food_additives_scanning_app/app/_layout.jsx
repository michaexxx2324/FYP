import { Stack } from 'expo-router';
import { LanguageProvider } from '../context/LanguageContext';
import { HistoryProvider } from '../context/HistoryContext';
import { UserProvider } from '../context/UserContext';
import { AuthProvider } from '../context/AuthContext';

export default function RootLayout() {
  return (
    <AuthProvider>
      <LanguageProvider>
        <HistoryProvider>
          <UserProvider>
            <Stack screenOptions={{ headerShown: false }}>
              <Stack.Screen name="index" />
              <Stack.Screen name="login" />
              <Stack.Screen name="register" />
              <Stack.Screen name="forgot-password" />
              <Stack.Screen name="(tabs)" />
              <Stack.Screen name="product-details" options={{ title: 'Product Details', headerShown: true }} />
            </Stack>
          </UserProvider>
        </HistoryProvider>
      </LanguageProvider>
    </AuthProvider>
  );
}
