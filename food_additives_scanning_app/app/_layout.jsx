import { Stack } from 'expo-router';
import { LanguageProvider } from '../context/LanguageContext';
import { HistoryProvider } from '../context/HistoryContext';
import { UserProvider } from '../context/UserContext';

export default function RootLayout() {
  return (
    <LanguageProvider>
      <HistoryProvider>
        <UserProvider>
          <Stack>
            <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
            <Stack.Screen name="product-details" options={{ title: 'Product Details' }} />
          </Stack>
        </UserProvider>
      </HistoryProvider>
    </LanguageProvider>
  );
}
