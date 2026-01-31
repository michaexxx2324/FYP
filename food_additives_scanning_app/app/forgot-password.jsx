import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { useLanguage } from '../context/LanguageContext';
import TranslateButton from '../components/TranslateButton';

import { API_URL } from '@env';

const STAGE_EMAIL = 'EMAIL';
const STAGE_OTP = 'OTP';
const STAGE_NEW_PASSWORD = 'NEW_PASSWORD';

export default function ForgotPasswordScreen() {
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [stage, setStage] = useState(STAGE_EMAIL);
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const { i18n } = useLanguage();


  const handleRequestOTP = async () => {
    if (!email) {
      Alert.alert(i18n.error || "Error", i18n.enterEmailAlert || "Please enter your email");
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(`${API_URL}/forgot-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();

      if (response.ok) {
        Alert.alert("Success", "OTP sent to your email.");
        setStage(STAGE_OTP);
      } else {
        Alert.alert("Error", data.message || "Failed to send OTP");
      }
    } catch (error) {
      Alert.alert("Error", "Network error");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };


  const handleVerifyOTP = async () => {
    if (!otp || otp.length !== 6) {
      Alert.alert("Error", "Please enter a valid 6-digit OTP");
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(`${API_URL}/verify-otp`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, otp }),
      });

      const data = await response.json();

      if (response.ok) {
        setStage(STAGE_NEW_PASSWORD);
      } else {
        Alert.alert("Error", data.message || "Invalid OTP");
      }
    } catch (error) {
      Alert.alert("Error", "Network error");
    } finally {
      setLoading(false);
    }
  };

 
  const handleResetPassword = async () => {
    if (!newPassword || newPassword.length < 6) {
      Alert.alert("Error", "Password must be at least 6 characters");
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(`${API_URL}/reset-password-final`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, otp, newPassword }),
      });

      const data = await response.json();

      if (response.ok) {
        Alert.alert("Success", "Password reset successfully. Please login.", [
            { text: "OK", onPress: () => router.replace('/login') }
        ]);
      } else {
        Alert.alert("Error", data.message || "Failed to reset password");
      }
    } catch (error) {
      Alert.alert("Error", "Network error");
    } finally {
      setLoading(false);
    }
  };

  const renderStage = () => {
      switch(stage) {
          case STAGE_EMAIL:
              return (
                <>
                  <Text style={styles.title}>{i18n.resetPasswordTitle || "Reset Password"}</Text>
                  <Text style={styles.subtitle}>{i18n.resetPasswordSubtitle || "Enter your email to receive an OTP code."}</Text>
                  
                  <Text style={styles.label}>{i18n.email || "Email"}</Text>
                  <TextInput
                    style={styles.input}
                    placeholder="your@email.com"
                    value={email}
                    onChangeText={setEmail}
                    autoCapitalize="none"
                    keyboardType="email-address"
                    editable={!loading}
                  />
                  <TouchableOpacity style={styles.resetButton} onPress={handleRequestOTP} disabled={loading}>
                    {loading ? <ActivityIndicator color="white" /> : <Text style={styles.resetButtonText}>Get OTP</Text>}
                  </TouchableOpacity>
                </>
              );
          case STAGE_OTP:
              return (
                <>
                  <Text style={styles.title}>Enter Code</Text>
                  <Text style={styles.subtitle}>Enter the 6-digit code sent to {email}</Text>
                  
                  <Text style={styles.label}>OTP Code</Text>
                  <TextInput
                    style={styles.input}
                    placeholder="6-digit OTP code"
                    value={otp}
                    onChangeText={setOtp}
                    keyboardType="numeric"
                    maxLength={6}
                    editable={!loading}
                  />
                  <TouchableOpacity style={styles.resetButton} onPress={handleVerifyOTP} disabled={loading}>
                    {loading ? <ActivityIndicator color="white" /> : <Text style={styles.resetButtonText}>Verify Code</Text>}
                  </TouchableOpacity>
                  <TouchableOpacity style={styles.textButton} onPress={() => setStage(STAGE_EMAIL)}>
                      <Text style={styles.textButtonText}>Change Email</Text>
                  </TouchableOpacity>
                </>
              );
          case STAGE_NEW_PASSWORD:
              return (
                <>
                  <Text style={styles.title}>New Password</Text>
                  <Text style={styles.subtitle}>Create a new strong password.</Text>
                  
                  <Text style={styles.label}>New Password</Text>
                  <TextInput
                    style={styles.input}
                    placeholder="******"
                    value={newPassword}
                    onChangeText={setNewPassword}
                    secureTextEntry
                    editable={!loading}
                  />
                  <TouchableOpacity style={styles.resetButton} onPress={handleResetPassword} disabled={loading}>
                     {loading ? <ActivityIndicator color="white" /> : <Text style={styles.resetButtonText}>Set Password</Text>}
                  </TouchableOpacity>
                </>
              );
      }
  };

  return (
    <View style={styles.container}>
      <View style={{ position: 'absolute', top: 40, right: 20, zIndex: 1 }}>
        <TranslateButton />
      </View>
      <View style={styles.card}>
        <View style={styles.formContainer}>
            {renderStage()}
            
            {stage === STAGE_EMAIL && (
                <TouchableOpacity 
                    style={styles.backButton}
                    onPress={() => router.back()}
                >
                    <Text style={styles.backButtonText}>{i18n.backToLogin || "Back to Login"}</Text>
                </TouchableOpacity>
            )}
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
    justifyContent: 'center',
    padding: 20,
  },
  textButton: {
      marginTop: 15,
      alignItems: 'center'
  },
  textButtonText: {
      color: '#00A0E9',
      fontSize: 14
  },
  card: {
    backgroundColor: 'white',
    borderRadius: 10,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  headerTitle: {
    textAlign: 'center',
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 20,
    color: '#333',
  },
  formContainer: {
    marginBottom: 20,
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 10,
    color: '#333',
  },
  subtitle: {
    fontSize: 14,
    color: '#666',
    marginBottom: 20,
  },
  label: {
    fontSize: 14,
    color: '#666',
    marginBottom: 5,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 5,
    padding: 10,
    marginBottom: 20,
    fontSize: 16,
  },
  resetButton: {
    backgroundColor: '#00A0E9',
    padding: 15,
    borderRadius: 5,
    alignItems: 'center',
    marginBottom: 10,
  },
  resetButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  backButton: {
    backgroundColor: '#666',
    padding: 15,
    borderRadius: 5,
    alignItems: 'center',
  },
  backButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
});
