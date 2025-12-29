import { Stack } from 'expo-router';
import { LanguageProvider } from '../context/LanguageContext';
import { HistoryProvider } from '../context/HistoryContext';

export default function RootLayout() {
  return (
    <LanguageProvider>
      <HistoryProvider>
        <Stack>
          <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
          <Stack.Screen name="product-details" options={{ title: 'Product Details' }} />
        </Stack>
      </HistoryProvider>
    </LanguageProvider>
  );
}
