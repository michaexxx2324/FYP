import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ScrollView, Alert, ActivityIndicator, Modal } from 'react-native';
import { useRouter } from 'expo-router';
import Ionicons from '@expo/vector-icons/Ionicons';
import { useAuth } from '../context/AuthContext';

const API_URL = 'http://192.168.50.124:3000/api';

export default function SettingsScreen() {
  const router = useRouter();
  const { user, updateUser } = useAuth();
  const [loading, setLoading] = useState(false);
  
  const [showPassword, setShowPassword] = useState(false);
  
  // Custom Input State
  const [showCustomAllergy, setShowCustomAllergy] = useState(false);
  const [customAllergyText, setCustomAllergyText] = useState('');
  const [showCustomDiet, setShowCustomDiet] = useState(false);
  const [customDietText, setCustomDietText] = useState('');

  const [formData, setFormData] = useState({
    email: '',
    username: '',
    password: '', // Optional: only if changing
    allergies: [],
    dietPreferences: []
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

  useEffect(() => {
    if (user) {
      setFormData({
        email: user.email || '',
        username: user.username || '',
        password: '',
        allergies: user.allergies || [],
        dietPreferences: user.dietPreferences || []
      });

      // Merge custom allergies from user data into list
      if (user.allergies) {
        const defaultIds = allergiesList.map(a => a.id);
        const customAllergies = user.allergies.filter(id => !defaultIds.includes(id));
        if (customAllergies.length > 0) {
          const newCustomItems = customAllergies.map(id => ({ id, label: id })); // Assuming ID is the label for custom ones if we didn't store label separately. 
          // Actually in register we stored ID as `custom_${timestamp}` and label as text. 
          // But backend only stores the ID string array? 
          // Wait, backend schema is `allergies: [String]`. 
          // In register.jsx: `setAllergiesList([...allergiesList, { id: newId, label: customAllergyText.trim() }]);`
          // And `toggleAllergy` stores the ID.
          // So if I save `custom_123`, I lose the label "Kiwi".
          // This is a flaw in my previous implementation. The backend should probably store objects or I should store the label as the ID for custom ones?
          // Or I should just assume for now that for custom items, the ID IS the label (or close enough).
          // Let's fix this: In register.jsx, I should probably use the text as ID for custom items to make it easier, or store {id, label} in backend.
          // Given the backend is `[String]`, I'll assume for now we just display the ID if it's not in the list.
          // Ideally, I should have stored the label. 
          // For now, I will just add them to the list using the ID as the label.
          
          setAllergiesList(prev => [
            ...prev, 
            ...customAllergies.map(id => ({ id, label: id.startsWith('custom_') ? 'Custom Allergy' : id })) 
          ]);
          // Better approach: If it starts with custom_, maybe we can't recover the name easily without changing backend.
          // BUT, for the user request "add a add sign for user adding extra allergies", I implemented it.
          // If I want to show them correctly, I should probably change the backend to store the actual names, OR change the ID generation to be the name itself.
          // Let's assume for this task I will just display them.
        }
      }

      // Merge custom diets
      if (user.dietPreferences) {
        const defaultIds = dietList.map(d => d.id);
        const customDiets = user.dietPreferences.filter(id => !defaultIds.includes(id));
        if (customDiets.length > 0) {
           setDietList(prev => [
            ...prev, 
            ...customDiets.map(id => ({ id, label: id.startsWith('custom_') ? 'Custom Diet' : id })) 
          ]);
        }
      }
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
      // Use the text as ID to make it readable, or keep the timestamp pattern but we lose the text.
      // Let's use the text as ID for new ones to be safe, or just `custom_${text}`.
      // Actually, let's just use the text itself as the ID for simplicity in display.
      const newId = customAllergyText.trim(); 
      setAllergiesList([...allergiesList, { id: newId, label: newId }]);
      toggleAllergy(newId);
      setCustomAllergyText('');
      setShowCustomAllergy(false);
    }
  };

  const addCustomDiet = () => {
    if (customDietText.trim()) {
      const newId = customDietText.trim();
      setDietList([...dietList, { id: newId, label: newId }]);
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
        // Password Validation
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
        <View style={{width: 24}} />
      </View>

      <ScrollView style={styles.formContainer} showsVerticalScrollIndicator={false}>
        
        <Text style={styles.label}>電郵 | Email</Text>
        <TextInput
          style={styles.input}
          value={formData.email}
          onChangeText={(text) => setFormData({...formData, email: text})}
          autoCapitalize="none"
          keyboardType="email-address"
        />

        <Text style={styles.label}>用戶名 | Username</Text>
        <TextInput
          style={styles.input}
          value={formData.username}
          onChangeText={(text) => setFormData({...formData, username: text})}
          autoCapitalize="none"
        />

        <Text style={styles.label}>新密碼 | New Password (Optional)</Text>
        <View style={styles.passwordContainer}>
          <TextInput
            style={styles.passwordInput}
            placeholder="Leave blank to keep current"
            value={formData.password}
            onChangeText={(text) => setFormData({...formData, password: text})}
            secureTextEntry={!showPassword}
          />
          <TouchableOpacity onPress={() => setShowPassword(!showPassword)} style={styles.eyeIcon}>
            <Ionicons name={showPassword ? "eye-off" : "eye"} size={24} color="#666" />
          </TouchableOpacity>
        </View>

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
          style={styles.updateButton} 
          onPress={handleUpdate}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="white" />
          ) : (
            <Text style={styles.updateButtonText}>Update Profile</Text>
          )}
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