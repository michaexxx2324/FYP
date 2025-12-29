import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ScrollView, Alert, ActivityIndicator, Modal, Platform } from 'react-native';
import { useRouter } from 'expo-router';
import Ionicons from '@expo/vector-icons/Ionicons';
import DateTimePicker from '@react-native-community/datetimepicker';

const API_URL = 'http://192.168.50.124:3000/api';

export default function RegisterScreen() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  
  // Date Picker State
  const [dob, setDob] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [dobSelected, setDobSelected] = useState(false);

  // Custom Input State
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
    allergies: [],
    dietPreferences: [] // Changed to array to support multiple/custom
  });

  const [allergiesList, setAllergiesList] = useState([
    { id: 'peanut', label: '花生' },
    { id: 'nut', label: '堅果' },
    { id: 'gluten', label: '麩質' },
    { id: 'dairy', label: '乳製品' },
    { id: 'egg', label: '雞蛋' },
    { id: 'shellfish', label: '甲殼類' },
    { id: 'sulfites', label: '亞硫酸鹽' },
  ]);

  const [dietList, setDietList] = useState([
    { id: 'none', label: '無特殊要求' },
    { id: 'vegetarian', label: '素食' },
    { id: 'vegan', label: '純素' },
    { id: 'halal', label: '清真' },
  ]);

  const toggleAllergy = (id) => {
    setFormData(prev => {
      const newAllergies = prev.allergies.includes(id)
        ? prev.allergies.filter(a => a !== id)
        : [...prev.allergies, id];
      return { ...prev, allergies: newAllergies };
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

  const onDateChange = (event, selectedDate) => {
    const currentDate = selectedDate || dob;
    setShowDatePicker(Platform.OS === 'ios');
    setDob(currentDate);
    setDobSelected(true);
    setFormData({ ...formData, dob: currentDate.toISOString().split('T')[0] });
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
      Alert.alert('Error', 'Please fill in all required fields (including Date of Birth)');
      return;
    }

    if (formData.dietPreferences.length === 0) {
      Alert.alert('Error', 'Please select at least one Diet Preference (select "無特殊要求" if none)');
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      Alert.alert('Error', 'Passwords do not match');
      return;
    }

    // Password Validation: At least 8 chars, at least 1 letter
    const passwordRegex = /^(?=.*[a-zA-Z]).{8,}$/;
    if (!passwordRegex.test(formData.password)) {
      Alert.alert('Weak Password', 'Password must be at least 8 characters long and contain at least one English letter.');
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(`${API_URL}/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: formData.email,
          username: formData.username,
          password: formData.password,
          dob: formData.dob,
          allergies: formData.allergies,
          dietPreferences: formData.dietPreferences
        }),
      });

      const data = await response.json();

      if (response.ok) {
        Alert.alert('Success', 'Account created successfully', [
          { text: 'Login', onPress: () => router.replace('/login') }
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
      <View style={styles.card}>
        <Text style={styles.headerTitle}>註冊 | Register</Text>
        
        <ScrollView style={styles.formContainer} showsVerticalScrollIndicator={false}>
          <Text style={styles.title}>註冊 | Register</Text>
          
          <Text style={styles.label}>電郵 | Email *</Text>
          <TextInput
            style={styles.input}
            placeholder="your@email.com"
            value={formData.email}
            onChangeText={(text) => setFormData({...formData, email: text})}
            autoCapitalize="none"
            keyboardType="email-address"
          />

          <Text style={styles.label}>用戶名 | Username *</Text>
          <TextInput
            style={styles.input}
            placeholder="選擇用戶名"
            value={formData.username}
            onChangeText={(text) => setFormData({...formData, username: text})}
            autoCapitalize="none"
          />

          <Text style={styles.label}>密碼 | Password *</Text>
          <Text style={styles.helperText}>至少8位字符，包含至少一個英文字母</Text>
          <View style={styles.passwordContainer}>
            <TextInput
              style={styles.passwordInput}
              placeholder="輸入密碼"
              value={formData.password}
              onChangeText={(text) => setFormData({...formData, password: text})}
              secureTextEntry={!showPassword}
            />
            <TouchableOpacity onPress={() => setShowPassword(!showPassword)} style={styles.eyeIcon}>
              <Ionicons name={showPassword ? "eye-off" : "eye"} size={24} color="#666" />
            </TouchableOpacity>
          </View>

          <Text style={styles.label}>確認密碼 | Confirm Password *</Text>
          <View style={styles.passwordContainer}>
            <TextInput
              style={styles.passwordInput}
              placeholder="再次輸入密碼"
              value={formData.confirmPassword}
              onChangeText={(text) => setFormData({...formData, confirmPassword: text})}
              secureTextEntry={!showConfirmPassword}
            />
            <TouchableOpacity onPress={() => setShowConfirmPassword(!showConfirmPassword)} style={styles.eyeIcon}>
              <Ionicons name={showConfirmPassword ? "eye-off" : "eye"} size={24} color="#666" />
            </TouchableOpacity>
          </View>

          <Text style={styles.label}>出生日期 | Date of Birth</Text>
          <TouchableOpacity onPress={() => setShowDatePicker(true)} style={styles.input}>
            <Text style={{ color: dobSelected ? '#000' : '#999' }}>
              {dobSelected ? formData.dob : '選擇出生日期'}
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

          <Text style={styles.label}>過敏原 | Allergies</Text>
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
              <Text style={styles.addItemText}>Add Other</Text>
            </TouchableOpacity>
          </View>

          <Text style={styles.label}>飲食偏好 | Diet Preferences</Text>
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
              <Text style={styles.addItemText}>Add Other</Text>
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
              <Text style={styles.registerButtonText}>建立帳戶</Text>
            )}
          </TouchableOpacity>

          <TouchableOpacity 
            style={styles.loginButton}
            onPress={() => router.back()}
          >
            <Text style={styles.loginButtonText}>已有帳戶？登入</Text>
          </TouchableOpacity>
          
          <View style={{ height: 50 }} />
        </ScrollView>

        {/* Custom Allergy Modal */}
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

        {/* Custom Diet Modal */}
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
