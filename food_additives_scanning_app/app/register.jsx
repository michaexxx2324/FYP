import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ScrollView, Alert, ActivityIndicator, Modal, Platform } from 'react-native';
import { useRouter } from 'expo-router';
import Ionicons from '@expo/vector-icons/Ionicons';
import DateTimePicker from '@react-native-community/datetimepicker';
import { useLanguage } from '../context/LanguageContext';
import TranslateButton from '../components/TranslateButton';
import { API_URL } from '@env';

// const API_URL = 'http://192.168.50.124:3000/api';

export default function RegisterScreen() {
  const router = useRouter();
  const { i18n } = useLanguage();
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  
  
  const [dob, setDob] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [dobSelected, setDobSelected] = useState(false);

  
  const [showCustomAllergy, setShowCustomAllergy] = useState(false);
  const [customAllergyText, setCustomAllergyText] = useState('');
  const [showCustomDiet, setShowCustomDiet] = useState(false);
  const [customDietText, setCustomDietText] = useState('');

  const [formData, setFormData] = useState({
    email: '',
    username: '',
    password: '',
    confirmPassword: '',
    dob: '',
    age: '',
    height: '',
    weight: '',
    allergies: [],
    dietPreferences: [],
    healthStatus: []
  });

  const [allergiesList, setAllergiesList] = useState([]);
  const [dietList, setDietList] = useState([]);
  const [healthStatusList, setHealthStatusList] = useState([]);

  useEffect(() => {
    setAllergiesList([
      { id: 'peanut', label: i18n.peanut },
      { id: 'nut', label: i18n.nut },
      { id: 'gluten', label: i18n.gluten },
      { id: 'dairy', label: i18n.dairy },
      { id: 'egg', label: i18n.egg },
      { id: 'shellfish', label: i18n.shellfish },
      { id: 'sulfites', label: i18n.sulfites },
    ]);

    setDietList([
      { id: 'none', label: i18n.none },
      { id: 'vegetarian', label: i18n.vegetarian },
      { id: 'vegan', label: i18n.vegan },
      { id: 'halal', label: i18n.halal },
    ]);

    setHealthStatusList([
      { id: 'pregnant', label: i18n.pregnant || 'Pregnant' },
      { id: 'diabetes', label: i18n.diabetes || 'Diabetes' },
      { id: 'highBloodPressure', label: i18n.highBloodPressure || 'High Blood Pressure' },
      { id: 'kidneyDisease', label: i18n.kidneyDisease || 'Kidney Disease' },
      { id: 'cardiovascularDisease', label: i18n.cardiovascularDisease || 'Cardiovascular Disease' },
      { id: 'stroke', label: i18n.stroke || 'Stroke' },
      { id: 'arthritis', label: i18n.arthritis || 'Arthritis' },
    ]);
  }, [i18n]);

  const toggleAllergy = (id) => {
    setFormData(prev => {
      const newAllergies = prev.allergies.includes(id)
        ? prev.allergies.filter(a => a !== id)
        : [...prev.allergies, id];
      return { ...prev, allergies: newAllergies };
    });
  };

  const toggleHealthStatus = (id) => {
    setFormData(prev => {
      const newStatus = prev.healthStatus.includes(id)
        ? prev.healthStatus.filter(a => a !== id)
        : [...prev.healthStatus, id];
      return { ...prev, healthStatus: newStatus };
    });
  };

  const toggleDiet = (id) => {
    setFormData(prev => {
      const newDiet = prev.dietPreferences.includes(id)
        ? prev.dietPreferences.filter(a => a !== id)
        : [...prev.dietPreferences, id];
      return { ...prev, dietPreferences: newDiet };
    });
  };

  const calculateAge = (dateOfBirth) => {
    const today = new Date();
    const birthDate = new Date(dateOfBirth);
    let age = today.getFullYear() - birthDate.getFullYear();
    const m = today.getMonth() - birthDate.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    return age;
  };

  const onDateChange = (event, selectedDate) => {
    const currentDate = selectedDate || dob;
    setShowDatePicker(Platform.OS === 'ios');
    setDob(currentDate);
    setDobSelected(true);
    const dobString = currentDate.toISOString().split('T')[0];
    const age = calculateAge(currentDate);
    setFormData({ ...formData, dob: dobString, age: age });
  };

  const addCustomAllergy = () => {
    if (customAllergyText.trim()) {
      const newId = `custom_${Date.now()}`;
      setAllergiesList([...allergiesList, { id: newId, label: customAllergyText.trim() }]);
      toggleAllergy(newId);
      setCustomAllergyText('');
      setShowCustomAllergy(false);
    }
  };

  const addCustomDiet = () => {
    if (customDietText.trim()) {
      const newId = `custom_${Date.now()}`;
      setDietList([...dietList, { id: newId, label: customDietText.trim() }]);
      toggleDiet(newId);
      setCustomDietText('');
      setShowCustomDiet(false);
    }
  };

  const handleRegister = async () => {
    if (!formData.email || !formData.username || !formData.password || !formData.confirmPassword || !formData.dob) {
      Alert.alert(i18n.error, i18n.fillAllRequiredFields);
      return;
    }

    if (formData.dietPreferences.length === 0) {
      Alert.alert(i18n.error, i18n.selectDietPreference);
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      Alert.alert(i18n.error, i18n.passwordMismatch);
      return;
    }

    
    const passwordRegex = /^(?=.*[a-zA-Z]).{8,}$/;
    if (!passwordRegex.test(formData.password)) {
      Alert.alert(i18n.weakPassword, i18n.passwordRequirements);
      return;
    }

    setLoading(true);
    try {
      console.log('Sending registration data:', {
         email: formData.email,
         age: formData.age,
         height: formData.height,
         weight: formData.weight,
         healthStatus: formData.healthStatus
      });

      const response = await fetch(`${API_URL}/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: formData.email,
          username: formData.username,
          password: formData.password,
          dob: formData.dob,
          age: formData.age,
          height: formData.height,
          weight: formData.weight,
          allergies: formData.allergies,
          dietPreferences: formData.dietPreferences,
          healthStatus: formData.healthStatus
        }),
      });

      const data = await response.json();

      if (response.ok) {
        Alert.alert(i18n.success, i18n.accountCreated, [
          { text: i18n.loginButton, onPress: () => router.replace('/login') }
        ]);
      } else {
        Alert.alert('Registration Failed', data.message || 'Something went wrong');
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to connect to server');
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
        <Text style={styles.headerTitle}>{i18n.registerTitle}</Text>
        
        <ScrollView style={styles.formContainer} showsVerticalScrollIndicator={false}>
          <Text style={styles.title}>{i18n.registerTitle}</Text>
          
          <Text style={styles.label}>{i18n.emailLabel}</Text>
          <TextInput
            style={styles.input}
            placeholder="your@email.com"
            value={formData.email}
            onChangeText={(text) => setFormData({...formData, email: text})}
            autoCapitalize="none"
            keyboardType="email-address"
          />

          <Text style={styles.label}>{i18n.usernameLabel}</Text>
          <TextInput
            style={styles.input}
            placeholder={i18n.enterUsername}
            value={formData.username}
            onChangeText={(text) => setFormData({...formData, username: text})}
            autoCapitalize="none"
          />

          <Text style={styles.label}>{i18n.passwordLabel}</Text>
          <Text style={styles.helperText}>{i18n.passwordHelper}</Text>
          <View style={styles.passwordContainer}>
            <TextInput
              style={styles.passwordInput}
              placeholder={i18n.enterPassword}
              value={formData.password}
              onChangeText={(text) => setFormData({...formData, password: text})}
              secureTextEntry={!showPassword}
            />
            <TouchableOpacity onPress={() => setShowPassword(!showPassword)} style={styles.eyeIcon}>
              <Ionicons name={showPassword ? "eye-off" : "eye"} size={24} color="#666" />
            </TouchableOpacity>
          </View>

          <Text style={styles.label}>{i18n.confirmPasswordLabel}</Text>
          <View style={styles.passwordContainer}>
            <TextInput
              style={styles.passwordInput}
              placeholder={i18n.enterConfirmPassword}
              value={formData.confirmPassword}
              onChangeText={(text) => setFormData({...formData, confirmPassword: text})}
              secureTextEntry={!showConfirmPassword}
            />
            <TouchableOpacity onPress={() => setShowConfirmPassword(!showConfirmPassword)} style={styles.eyeIcon}>
              <Ionicons name={showConfirmPassword ? "eye-off" : "eye"} size={24} color="#666" />
            </TouchableOpacity>
          </View>

          <Text style={styles.label}>{i18n.dobLabel}</Text>
          <TouchableOpacity onPress={() => setShowDatePicker(true)} style={styles.input}>
            <Text style={{ color: dobSelected ? '#000' : '#999' }}>
              {dobSelected ? formData.dob : i18n.selectDob}
            </Text>
          </TouchableOpacity>
          {showDatePicker && (
            <DateTimePicker
              value={dob}
              mode="date"
              display="default"
              onChange={onDateChange}
              maximumDate={new Date()}
            />
          )}

          <Text style={styles.label}>{i18n.heightLabel || "Height (cm)"}</Text>
          <TextInput
            style={styles.input}
            placeholder="e.g. 170"
            value={formData.height}
            onChangeText={(text) => setFormData({...formData, height: text})}
            keyboardType="numeric"
          />

          <Text style={styles.label}>{i18n.weightLabel || "Weight (kg)"}</Text>
          <TextInput
            style={styles.input}
            placeholder="e.g. 60"
            value={formData.weight}
            onChangeText={(text) => setFormData({...formData, weight: text})}
            keyboardType="numeric"
          />

          <Text style={styles.label}>{i18n.healthStatusLabel || "Health Status"}</Text>
          <View style={styles.checkboxContainer}>
            {healthStatusList.map((item) => (
              <TouchableOpacity
                key={item.id}
                style={styles.checkboxItem}
                onPress={() => toggleHealthStatus(item.id)}
              >
                <View style={[styles.checkbox, formData.healthStatus.includes(item.id) && styles.checkboxChecked]}>
                  {formData.healthStatus.includes(item.id) && <Ionicons name="checkmark" size={16} color="white" />}
                </View>
                <Text style={styles.checkboxLabel}>{item.label}</Text>
              </TouchableOpacity>
            ))}
          </View>

          <Text style={styles.label}>{i18n.allergiesLabel}</Text>
          <View style={styles.checkboxContainer}>
            {allergiesList.map((item) => (
              <TouchableOpacity 
                key={item.id} 
                style={styles.checkboxItem}
                onPress={() => toggleAllergy(item.id)}
              >
                <View style={[styles.checkbox, formData.allergies.includes(item.id) && styles.checkboxChecked]}>
                  {formData.allergies.includes(item.id) && <Ionicons name="checkmark" size={16} color="white" />}
                </View>
                <Text style={styles.checkboxLabel}>{item.label}</Text>
              </TouchableOpacity>
            ))}
            <TouchableOpacity 
              style={styles.addItemButton}
              onPress={() => setShowCustomAllergy(true)}
            >
              <Ionicons name="add-circle-outline" size={20} color="#00A0E9" />
              <Text style={styles.addItemText}>{i18n.addOther}</Text>
            </TouchableOpacity>
          </View>

          <Text style={styles.label}>{i18n.dietLabel}</Text>
          <View style={styles.checkboxContainer}>
            {dietList.map((item) => (
              <TouchableOpacity 
                key={item.id} 
                style={styles.checkboxItem}
                onPress={() => toggleDiet(item.id)}
              >
                <View style={[styles.checkbox, formData.dietPreferences.includes(item.id) && styles.checkboxChecked]}>
                  {formData.dietPreferences.includes(item.id) && <Ionicons name="checkmark" size={16} color="white" />}
                </View>
                <Text style={styles.checkboxLabel}>{item.label}</Text>
              </TouchableOpacity>
            ))}
            <TouchableOpacity 
              style={styles.addItemButton}
              onPress={() => setShowCustomDiet(true)}
            >
              <Ionicons name="add-circle-outline" size={20} color="#00A0E9" />
              <Text style={styles.addItemText}>{i18n.addOther}</Text>
            </TouchableOpacity>
          </View>

          <TouchableOpacity 
            style={styles.registerButton} 
            onPress={handleRegister}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="white" />
            ) : (
              <Text style={styles.registerButtonText}>{i18n.createAccountButton}</Text>
            )}
          </TouchableOpacity>

          <TouchableOpacity 
            style={styles.loginButton}
            onPress={() => router.back()}
          >
            <Text style={styles.loginButtonText}>{i18n.alreadyHaveAccountButton}</Text>
          </TouchableOpacity>
          
          <View style={{ height: 50 }} />
        </ScrollView>

        
        <Modal visible={showCustomAllergy} transparent animationType="fade">
          <View style={styles.modalContainer}>
            <View style={styles.modalContent}>
              <Text style={styles.modalTitle}>Add Allergy</Text>
              <TextInput 
                style={styles.input} 
                placeholder="Enter allergy name"
                value={customAllergyText}
                onChangeText={setCustomAllergyText}
              />
              <View style={styles.modalButtons}>
                <TouchableOpacity onPress={() => setShowCustomAllergy(false)} style={styles.modalCancel}>
                  <Text>Cancel</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={addCustomAllergy} style={styles.modalAdd}>
                  <Text style={{color: 'white'}}>Add</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>

        
        <Modal visible={showCustomDiet} transparent animationType="fade">
          <View style={styles.modalContainer}>
            <View style={styles.modalContent}>
              <Text style={styles.modalTitle}>Add Diet Preference</Text>
              <TextInput 
                style={styles.input} 
                placeholder="Enter diet preference"
                value={customDietText}
                onChangeText={setCustomDietText}
              />
              <View style={styles.modalButtons}>
                <TouchableOpacity onPress={() => setShowCustomDiet(false)} style={styles.modalCancel}>
                  <Text>Cancel</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={addCustomDiet} style={styles.modalAdd}>
                  <Text style={{color: 'white'}}>Add</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>

      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
    padding: 20,
    paddingTop: 50,
    paddingBottom: 50,
  },
  card: {
    flex: 1,
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
    marginBottom: 10,
    color: '#333',
  },
  formContainer: {
    flex: 1,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    color: '#333',
  },
  label: {
    fontSize: 14,
    color: '#666',
    marginBottom: 5,
    marginTop: 10,
  },
  helperText: {
    fontSize: 12,
    color: '#999',
    marginBottom: 5,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 5,
    padding: 10,
    fontSize: 16,
  },
  passwordContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 5,
  },
  passwordInput: {
    flex: 1,
    padding: 10,
    fontSize: 16,
  },
  eyeIcon: {
    padding: 10,
  },
  checkboxContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 10,
  },
  checkboxItem: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '48%',
    marginBottom: 10,
  },
  checkbox: {
    width: 20,
    height: 20,
    borderWidth: 1,
    borderColor: '#999',
    borderRadius: 4,
    marginRight: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkboxChecked: {
    backgroundColor: '#00A0E9',
    borderColor: '#00A0E9',
  },
  checkboxLabel: {
    fontSize: 14,
    color: '#333',
  },
  addItemButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 5,
    marginTop: 5,
  },
  addItemText: {
    color: '#00A0E9',
    marginLeft: 5,
  },
  registerButton: {
    backgroundColor: '#00A0E9',
    padding: 15,
    borderRadius: 5,
    alignItems: 'center',
    marginTop: 20,
    marginBottom: 10,
  },
  registerButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  loginButton: {
    backgroundColor: '#666',
    padding: 15,
    borderRadius: 5,
    alignItems: 'center',
    marginBottom: 15,
  },
  loginButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  modalContainer: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: 'white',
    padding: 20,
    borderRadius: 10,
    width: '80%',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 15,
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginTop: 15,
  },
  modalCancel: {
    padding: 10,
    marginRight: 10,
  },
  modalAdd: {
    backgroundColor: '#00A0E9',
    padding: 10,
    borderRadius: 5,
  },
});
