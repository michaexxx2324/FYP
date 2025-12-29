import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Image, Alert, Linking } from 'react-native';
import { useRouter, Stack } from 'expo-router';
import { useLanguage } from '../context/LanguageContext';
import { useAuth } from '../context/AuthContext';
import { useUser } from '../context/UserContext';
import Ionicons from '@expo/vector-icons/Ionicons';

const API_URL = 'http://192.168.50.124:3000/api';

export default function PaymentScreen() {
  const { i18n } = useLanguage();
  const { user, updateUser } = useAuth();
  const { setVipStatus } = useUser();
  const router = useRouter();
  const [selectedPlan, setSelectedPlan] = useState('yearly');
  const [selectedMethod, setSelectedMethod] = useState('paypal');

  const plans = [
    { id: 'monthly', title: i18n.monthlyPlan, price: 'HK$38' },
    { id: 'yearly', title: i18n.yearlyPlan, price: 'HK$298', save: '30%' },
  ];

  const paymentMethods = [
    { id: 'payme', name: 'PayMe', icon: 'wallet-outline' },
    { id: 'alipay', name: 'Alipay HK', icon: 'qr-code-outline' },
    { id: 'wechat', name: 'WeChat Pay HK', icon: 'chatbubble-ellipses-outline' },
    { id: 'visa', name: 'VISA / MasterCard', icon: 'card-outline' },
    { id: 'paypal', name: 'PayPal', icon: 'logo-paypal' },
  ];

  const handlePay = () => {
    if (selectedMethod === 'paypal' || selectedMethod === 'payme') {
      const url = selectedMethod === 'paypal' 
        ? 'https://paypal.me/michaelxxx2324' 
        : 'https://payme.hsbc/faifaiwong';
      
      Linking.openURL(url).catch(err => console.error("Couldn't load page", err));
      
      // Ask for manual confirmation since we can't get a callback from personal links
      setTimeout(() => {
        Alert.alert(
          i18n.confirmPayment,
          i18n.confirmPaymentMsg,
          [
            {
              text: i18n.no,
              style: 'cancel',
            },
            {
              text: i18n.yes,
              onPress: () => activateVip(),
            },
          ]
        );
      }, 1000);
    } else {
      // Dummy payment for other methods (VISA, Alipay, WeChat)
      // For showcase purposes, we simulate a successful transaction
      const isShowcase = selectedMethod === 'visa' || selectedMethod === 'alipay' || selectedMethod === 'wechat';
      const message = isShowcase
        ? "Transaction ID: " + Math.floor(Math.random() * 1000000000) 
        : `${i18n.paymentDummy} (${selectedMethod})`;

      Alert.alert(
        i18n.paymentSuccess, 
        message,
        [
          { text: "OK", onPress: () => activateVip() }
        ]
      );
    }
  };

  const activateVip = async () => {
    if (!user) {
      Alert.alert('Error', 'Please login first');
      return;
    }

    try {
      const response = await fetch(`${API_URL}/user/update`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: user.userId,
          isVip: true
        }),
      });

      if (response.ok) {
        updateUser({ isVip: true });
        setVipStatus(true);
        Alert.alert(
          i18n.vipActivated,
          i18n.vipActivatedMsg,
          [
            { text: "OK", onPress: () => router.replace('/(tabs)/profile') }
          ]
        );
      } else {
        Alert.alert('Error', 'Failed to activate VIP on server');
      }
    } catch (error) {
      console.error(error);
      Alert.alert('Error', 'Network error');
    }
  };

  return (
    <View style={styles.container}>
      <Stack.Screen options={{ title: i18n.paymentTitle }} />
      <ScrollView style={styles.content}>
        {/* Plan Selection */}
        <Text style={styles.sectionTitle}>{i18n.selectPlan}</Text>
        {plans.map((plan) => (
          <TouchableOpacity
            key={plan.id}
            style={[
              styles.planCard,
              selectedPlan === plan.id && styles.selectedPlanCard,
            ]}
            onPress={() => setSelectedPlan(plan.id)}
          >
            <View style={styles.planInfo}>
              <Text style={styles.planTitle}>{plan.title}</Text>
              <Text style={styles.planPrice}>{plan.price}</Text>
            </View>
            {plan.save && (
              <View style={styles.saveBadge}>
                <Text style={styles.saveText}>Save {plan.save}</Text>
              </View>
            )}
            <View style={styles.radioButton}>
              {selectedPlan === plan.id && <View style={styles.radioButtonInner} />}
            </View>
          </TouchableOpacity>
        ))}

        {/* Payment Method Selection */}
        <Text style={styles.sectionTitle}>{i18n.selectPaymentMethod}</Text>
        {paymentMethods.map((method) => (
          <TouchableOpacity
            key={method.id}
            style={[
              styles.methodCard,
              selectedMethod === method.id && styles.selectedMethodCard,
            ]}
            onPress={() => setSelectedMethod(method.id)}
          >
            <View style={styles.methodInfo}>
              <Ionicons name={method.icon} size={24} color="#333" style={styles.methodIcon} />
              <Text style={styles.methodName}>{method.name}</Text>
            </View>
            <View style={styles.radioButton}>
              {selectedMethod === method.id && <View style={styles.radioButtonInner} />}
            </View>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Bottom Pay Button */}
      <View style={styles.bottomContainer}>
        <TouchableOpacity style={styles.payButton} onPress={handlePay}>
          <Text style={styles.payButtonText}>{i18n.payNow}</Text>
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
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 50,
    paddingHorizontal: 15,
    paddingBottom: 15,
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  backText: {
    color: '#007AFF',
    fontSize: 16,
    marginLeft: 5,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  content: {
    flex: 1,
    padding: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 15,
    marginTop: 10,
    color: '#333',
  },
  planCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 20,
    marginBottom: 15,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 2,
    borderColor: 'transparent',
  },
  selectedPlanCard: {
    borderColor: '#E68A00',
    backgroundColor: '#FFF8E1',
  },
  planInfo: {
    flex: 1,
  },
  planTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 5,
  },
  planPrice: {
    fontSize: 18,
    color: '#E68A00',
    fontWeight: 'bold',
  },
  saveBadge: {
    backgroundColor: '#FF5252',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
    marginRight: 15,
  },
  saveText: {
    color: 'white',
    fontSize: 12,
    fontWeight: 'bold',
  },
  methodCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 15,
    marginBottom: 10,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 1,
    borderColor: '#eee',
  },
  selectedMethodCard: {
    borderColor: '#E68A00',
    backgroundColor: '#FFF8E1',
  },
  methodInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  methodIcon: {
    marginRight: 15,
  },
  methodName: {
    fontSize: 16,
    color: '#333',
  },
  radioButton: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#ccc',
    alignItems: 'center',
    justifyContent: 'center',
  },
  radioButtonInner: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#E68A00',
  },
  bottomContainer: {
    padding: 20,
    backgroundColor: 'white',
    borderTopWidth: 1,
    borderTopColor: '#eee',
  },
  payButton: {
    backgroundColor: '#E68A00',
    padding: 18,
    borderRadius: 12,
    alignItems: 'center',
  },
  payButtonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
});
