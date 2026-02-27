import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, Image, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import TranslateButton from '../components/TranslateButton';
import { API_URL } from '@env';

export default function LoginScreen() {
  const [login, setLogin] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const { login: authLogin } = useAuth();
  const { i18n } = useLanguage();

  const handleLogin = async () => {
    if (!login || !password) {
      Alert.alert(i18n.error, i18n.fillAllFields);
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(`${API_URL}/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ login, password }),
      });

      const data = await response.json();

      if (response.ok) {
        await authLogin(data.token, data.user);
        router.replace('/(tabs)');
      } else {
        Alert.alert(i18n.loginFailed, data.message || i18n.invalidCredentials);
      }
    } catch (error) {
      Alert.alert(i18n.error, i18n.connectError);
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <View style={{ position: 'absolute', top: 40, right: 20, zIndex: 1 }}>
        <TranslateButton />
      </View>
      <View style={styles.card}>
        <Text style={styles.headerTitle}>{i18n.loginTitle}</Text>
        
        <View style={styles.formContainer}>
          <Text style={styles.title}>{i18n.loginTitle}</Text>
          
          <Text style={styles.label}>{i18n.emailOrUsername}</Text>
          <TextInput
            style={styles.input}
            placeholder={i18n.enterEmailOrUsername}
            value={login}
            onChangeText={setLogin}
            autoCapitalize="none"
          />

          <Text style={styles.label}>{i18n.password}</Text>
          <TextInput
            style={styles.input}
            placeholder={i18n.enterPassword}
            value={password}
            onChangeText={setPassword}
            secureTextEntry
          />

          <TouchableOpacity 
            style={styles.loginButton} 
            onPress={handleLogin}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="white" />
            ) : (
              <Text style={styles.loginButtonText}>{i18n.loginButton}</Text>
            )}
          </TouchableOpacity>

          <TouchableOpacity 
            style={styles.registerButton}
            onPress={() => router.push('/register')}
          >
            <Text style={styles.registerButtonText}>{i18n.registerNewAccount}</Text>
          </TouchableOpacity>

          <TouchableOpacity onPress={() => router.push('/forgot-password')}>
            <Text style={styles.forgotPassword}>{i18n.forgotPassword}</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.socialContainer}>
          <Text style={styles.socialTitle}>{i18n.socialLogin}</Text>
          <View style={styles.socialButtons}>
            <TouchableOpacity style={styles.socialButton}>
              <Text style={styles.socialButtonText}>Google</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.socialButton}>
              <Text style={styles.socialButtonText}>Apple ID</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fbf5e5',
    justifyContent: 'center',
    padding: 20,
    paddingBottom: 50,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 25,
    shadowColor: '#5d574a',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 5,
    borderWidth: 1,
    borderColor: '#f0e6d2',
  },
  headerTitle: {
    textAlign: 'center',
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 20,
    color: '#2d5a27',
  },
  formContainer: {
    marginBottom: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    color: '#2d5a27',
    textAlign: 'center',
  },
  label: {
    fontSize: 14,
    color: '#5d574a',
    marginBottom: 8,
    fontWeight: '600',
  },
  input: {
    borderWidth: 1,
    borderColor: '#d1cabb',
    borderRadius: 12,
    padding: 15,
    marginBottom: 20,
    fontSize: 16,
    backgroundColor: '#fff',
    color: '#5d574a',
  },
  loginButton: {
    backgroundColor: '#2d5a27',
    padding: 15,
    borderRadius: 24,
    alignItems: 'center',
    marginBottom: 15,
    shadowColor: '#2d5a27',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
    elevation: 4,
  },
  loginButtonText: {
    color: '#fbf5e5',
    fontSize: 18,
    fontWeight: 'bold',
  },
  registerButton: {
    backgroundColor: '#D97943',
    padding: 15,
    borderRadius: 24,
    alignItems: 'center',
    marginBottom: 15,
    shadowColor: '#D97943',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 5,
    elevation: 3,
  },
  registerButtonText: {
    color: '#fbf5e5',
    fontSize: 16,
    fontWeight: 'bold',
  },
  forgotPassword: {
    color: '#2d5a27',
    textAlign: 'center',
    fontSize: 14,
    fontWeight: '600',
  },
  socialContainer: {
    marginTop: 20,
    borderTopWidth: 1,
    borderTopColor: '#e6dfcf',
    paddingTop: 20,
  },
  socialTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 15,
    color: '#5d574a',
    textAlign: 'center',
  },
  socialButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  socialButton: {
    flex: 0.48,
    backgroundColor: '#8c867a',
    padding: 12,
    borderRadius: 24,
    alignItems: 'center',
  },
  socialButtonText: {
    color: 'white',
    fontWeight: 'bold',
  },
});
