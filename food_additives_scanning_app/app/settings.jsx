import React, { useState, useEffect, useMemo } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ScrollView, Alert, ActivityIndicator, Modal } from 'react-native';
import { useRouter, Stack } from 'expo-router';
import Ionicons from '@expo/vector-icons/Ionicons';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import TranslateButton from '../components/TranslateButton';

import { API_URL } from '@env';

// const API_URL = 'http://192.168.50.124:3000/api';

export default function SettingsScreen() {
  const router = useRouter();
  const { user, updateUser } = useAuth();
  const { i18n } = useLanguage();
  const [loading, setLoading] = useState(false);
  
  const [showPassword, setShowPassword] = useState(false);
  
  
  const [showCustomAllergy, setShowCustomAllergy] = useState(false);
  const [customAllergyText, setCustomAllergyText] = useState('');
  const [showCustomDiet, setShowCustomDiet] = useState(false);
  const [customDietText, setCustomDietText] = useState('');

  const [formData, setFormData] = useState({
    email: '',
    username: '',
    password: '', 
    allergies: [],
    dietPreferences: []
  });

  const [localCustomAllergies, setLocalCustomAllergies] = useState([]);
  const [localCustomDiets, setLocalCustomDiets] = useState([]);

  const defaultAllergies = useMemo(() => [
    { id: 'peanut', label: i18n.peanut },
    { id: 'nut', label: i18n.nut },
    { id: 'gluten', label: i18n.gluten },
    { id: 'dairy', label: i18n.dairy },
    { id: 'egg', label: i18n.egg },
    { id: 'shellfish', label: i18n.shellfish },
    { id: 'sulfites', label: i18n.sulfites },
  ], [i18n]);

  const defaultDiets = useMemo(() => [
    { id: 'none', label: i18n.none },
    { id: 'vegetarian', label: i18n.vegetarian },
    { id: 'vegan', label: i18n.vegan },
    { id: 'halal', label: i18n.halal },
  ], [i18n]);

  const allergiesList = useMemo(() => {
    const userCustom = user?.allergies
      ? user.allergies
          .filter(id => !defaultAllergies.some(a => a.id === id))
          .map(id => ({ id, label: id }))
      : [];
    
    const all = [...defaultAllergies, ...userCustom, ...localCustomAllergies];
    
    const unique = [];
    const seen = new Set();
    for (const item of all) {
      if (!seen.has(item.id)) {
        seen.add(item.id);
        unique.push(item);
      }
    }
    return unique;
  }, [defaultAllergies, user, localCustomAllergies]);

  const dietList = useMemo(() => {
    const userCustom = user?.dietPreferences
      ? user.dietPreferences
          .filter(id => !defaultDiets.some(d => d.id === id))
          .map(id => ({ id, label: id }))
      : [];

    const all = [...defaultDiets, ...userCustom, ...localCustomDiets];
    
    const unique = [];
    const seen = new Set();
    for (const item of all) {
      if (!seen.has(item.id)) {
        seen.add(item.id);
        unique.push(item);
      }
    }
    return unique;
  }, [defaultDiets, user, localCustomDiets]);

  useEffect(() => {
    if (user) {
      setFormData({
        email: user.email || '',
        username: user.username || '',
        password: '',
        allergies: user.allergies || [],
        dietPreferences: user.dietPreferences || []
      });
    }
  }, [user]);

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

  const addCustomAllergy = () => {
    if (customAllergyText.trim()) {
      const newId = customAllergyText.trim(); 
      setLocalCustomAllergies(prev => [...prev, { id: newId, label: newId }]);
      toggleAllergy(newId);
      setCustomAllergyText('');
      setShowCustomAllergy(false);
    }
  };

  const addCustomDiet = () => {
    if (customDietText.trim()) {
      const newId = customDietText.trim();
      setLocalCustomDiets(prev => [...prev, { id: newId, label: newId }]);
      toggleDiet(newId);
      setCustomDietText('');
      setShowCustomDiet(false);
    }
  };

  const handleUpdate = async () => {
    setLoading(true);
    try {
      const body = {
        userId: user.userId,
        email: formData.email,
        username: formData.username,
        allergies: formData.allergies,
        dietPreferences: formData.dietPreferences
      };

      if (formData.password) {
        
        const passwordRegex = /^(?=.*[a-zA-Z]).{8,}$/;
        if (!passwordRegex.test(formData.password)) {
          Alert.alert('Weak Password', 'Password must be at least 8 characters long and contain at least one English letter.');
          setLoading(false);
          return;
        }
        body.password = formData.password;
      }

      const response = await fetch(`${API_URL}/user/update`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });

      const data = await response.json();

      if (response.ok) {
        updateUser(data.user);
        Alert.alert('Success', 'Profile updated successfully', [
          { text: 'OK', onPress: () => router.back() }
        ]);
      } else {
        Alert.alert('Update Failed', data.message || 'Something went wrong');
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
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#333" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Settings</Text>
        <TranslateButton />
      </View>

      <ScrollView style={styles.formContainer} contentContainerStyle={{paddingBottom: 100}} showsVerticalScrollIndicator={false}>
        
        <Text style={styles.label}>{i18n.email}</Text>
        <TextInput
          style={styles.input}
          value={formData.email}
          onChangeText={(text) => setFormData({...formData, email: text})}
          autoCapitalize="none"
          keyboardType="email-address"
        />

        <Text style={styles.label}>{i18n.username}</Text>
        <TextInput
          style={styles.input}
          value={formData.username}
          onChangeText={(text) => setFormData({...formData, username: text})}
          autoCapitalize="none"
        />

        <Text style={styles.label}>{i18n.newPasswordOptional}</Text>
        <View style={styles.passwordContainer}>
          <TextInput
            style={styles.passwordInput}
            placeholder={i18n.leaveBlankToKeep}
            value={formData.password}
            onChangeText={(text) => setFormData({...formData, password: text})}
            secureTextEntry={!showPassword}
          />
          <TouchableOpacity onPress={() => setShowPassword(!showPassword)} style={styles.eyeIcon}>
            <Ionicons name={showPassword ? "eye-off" : "eye"} size={24} color="#666" />
          </TouchableOpacity>
        </View>

        <Text style={styles.label}>{i18n.allergies}</Text>
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

        <Text style={styles.label}>{i18n.diets}</Text>
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
          style={styles.updateButton} 
          onPress={handleUpdate}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="white" />
          ) : (
            <Text style={styles.updateButtonText}>{i18n.updateProfile}</Text>
          )}
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
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: 'white',
    paddingTop: 50,
    paddingBottom: 15,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  formContainer: {
    flex: 1,
    padding: 20,
  },
  label: {
    fontSize: 14,
    color: '#666',
    marginBottom: 5,
    marginTop: 10,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 5,
    padding: 10,
    fontSize: 16,
    backgroundColor: 'white',
  },
  passwordContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 5,
    backgroundColor: 'white',
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
    backgroundColor: 'white',
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
  updateButton: {
    backgroundColor: '#00A0E9',
    padding: 15,
    borderRadius: 5,
    alignItems: 'center',
    marginTop: 30,
    marginBottom: 20,
  },
  updateButtonText: {
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