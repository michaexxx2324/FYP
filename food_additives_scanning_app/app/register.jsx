import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ScrollView, Alert, ActivityIndicator, Modal, Platform } from 'react-native';
import { useRouter } from 'expo-router';
import Ionicons from '@expo/vector-icons/Ionicons';
import DateTimePicker from '@react-native-community/datetimepicker';
import { useLanguage } from '../context/LanguageContext';
import TranslateButton from '../components/TranslateButton';
import { API_URL } from '@env';

export default function RegisterScreen() {
  const router = useRouter();
  const { i18n, language } = useLanguage();
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  
  
  const [showPrivacyModal, setShowPrivacyModal] = useState(true);
  const [privacyAgreed, setPrivacyAgreed] = useState(false);

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
        Alert.alert(i18n.registrationFailed || 'Registration Failed', data.message || i18n.updateFailed || 'Something went wrong');
      }
    } catch (error) {
      Alert.alert(i18n.error || 'Error', i18n.serverConnectionFailed || 'Failed to connect to server');
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
              <Text style={styles.modalTitle}>{i18n.addAllergy || "Add Allergy"}</Text>
              <TextInput 
                style={styles.input} 
                placeholder={i18n.enterAllergy || "Enter allergy name"}
                value={customAllergyText}
                onChangeText={setCustomAllergyText}
              />
              <View style={styles.modalButtons}>
                <TouchableOpacity onPress={() => setShowCustomAllergy(false)} style={styles.modalCancel}>
                  <Text>{i18n.cancel || "Cancel"}</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={addCustomAllergy} style={styles.modalAdd}>
                  <Text style={{color: 'white'}}>{i18n.add || "Add"}</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>

        
        <Modal visible={showCustomDiet} transparent animationType="fade">
          <View style={styles.modalContainer}>
            <View style={styles.modalContent}>
              <Text style={styles.modalTitle}>{i18n.addDietPreference || "Add Diet Preference"}</Text>
              <TextInput 
                style={styles.input} 
                placeholder={i18n.enterDiet || "Enter diet preference"}
                value={customDietText}
                onChangeText={setCustomDietText}
              />
              <View style={styles.modalButtons}>
                <TouchableOpacity onPress={() => setShowCustomDiet(false)} style={styles.modalCancel}>
                  <Text>{i18n.cancel || "Cancel"}</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={addCustomDiet} style={styles.modalAdd}>
                  <Text style={{color: 'white'}}>{i18n.add || "Add"}</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>

        <Modal
          visible={showPrivacyModal}
          animationType="slide"
          transparent={true}
          onRequestClose={() => {
          }}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.privacyModalContainer}>
              <Text style={styles.privacyTitle}>
                {language === 'zh' ? '健康資料的隱私/同意' : 'Health Data Privacy/Consent'}
              </Text>
              
              <ScrollView style={styles.privacyScroll} persistentScrollbar={true}>
                {language === 'zh' ? (
                  <Text style={styles.privacyContent}>
                    <Text style={{fontWeight: 'bold', fontSize: 18}}># 私隱政策</Text>{'\n\n'}

                    歡迎使用「食物安全掃描」應用程式（以下簡稱「本應用」）。本應用由 Wong Ho Fai 提供。我們非常重視您的私隱，並致力於保護您的個人資料。本私隱政策說明我們如何收集、使用、儲存及披露您的資料。{'\n\n'}

                    <Text style={{fontWeight: 'bold'}}>## 1. 收集的資料</Text>{'\n'}
                    本應用可能收集以下類型的資料：{'\n'}
                    - <Text style={{fontWeight: 'bold'}}>您主動提供的資料</Text>：當您註冊帳戶、設定過敏提示、提交意見或聯絡我們時，我們可能會收集您的姓名、電子郵件地址、電話號碼等聯絡資料。{'\n'}
                    - <Text style={{fontWeight: 'bold'}}>使用資料</Text>：包括您掃描的產品記錄、搜尋記錄、您設定的過敏偏好、警報通知設定等。{'\n\n'}

                    <Text style={{fontWeight: 'bold'}}>## 2. 資料的使用</Text>{'\n'}
                    我們將收集的資料用於：{'\n'}
                    - 提供、維護及改善本應用的功能（如即時食物警報、產品掃描分析）。{'\n'}
                    - 根據您的設定發送個人化通知（如致敏物警報）。{'\n'}
                    - 分析用戶行為以優化服務。{'\n'}
                    - 回應您的查詢及支援請求。{'\n'}
                    - 遵守法律要求。{'\n\n'}

                    <Text style={{fontWeight: 'bold'}}>## 3. 資料的儲存與安全</Text>{'\n'}
                    您的個人資料將儲存於 Wong Ho Fai 的伺服器。我們採取合理的技術及組織措施保護您的資料，防止未經授權的存取、洩露或損毀。然而，請注意互聯網傳輸並非絕對安全。{'\n\n'}

                    <Text style={{fontWeight: 'bold'}}>## 4. 資料的共享</Text>{'\n'}
                    我們<Text style={{fontWeight: 'bold'}}>不會</Text>出售或租借您的個人資料予第三方。但在以下情況可能共享：{'\n'}
                    - 獲得您的明確同意。{'\n'}
                    - 為提供服務而與可信賴的合作夥伴（如雲端服務商）共享，且該等夥伴須遵守保密義務。{'\n'}
                    - 依法律、法院命令或政府機關要求披露。{'\n'}
                    - 為保護本應用、用戶或公眾的權利、財產或安全。{'\n\n'}

                    <Text style={{fontWeight: 'bold'}}>## 5. 您的權利</Text>{'\n'}
                    根據香港《個人資料（私隱）條例》，您有權：{'\n'}
                    - 查閱我們持有的您的個人資料。{'\n'}
                    - 要求更正不準確的資料。{'\n'}
                    - 要求刪除您的資料（在特定情況下）。{'\n'}
                    - 撤回同意（如接收通知）。{'\n\n'}
                    如欲行使上述權利，請聯絡我們：test@email.com。{'\n\n'}

                    <Text style={{fontWeight: 'bold'}}>## 6. 資料保留</Text>{'\n'}
                    我們僅在必要時保留您的資料，以實現本政策所述目的，或遵守法律義務。一般情況下，帳戶資料將於帳戶刪除後 30 天內刪除；掃描記錄可能以匿名形式保留作分析用途。{'\n\n'}

                    <Text style={{fontWeight: 'bold'}}>## 7. 兒童私隱</Text>{'\n'}
                    本應用不預期向 13 歲（或香港法例規定的其他年齡）以下兒童提供服務。若您發現兒童未經家長同意向我們提供資料，請聯絡我們處理。{'\n\n'}

                    <Text style={{fontWeight: 'bold'}}>## 8. 本政策的變更</Text>{'\n'}
                    我們可能不時更新本私隱政策。任何變更將於本應用內公布，並標明生效日期。建議您定期查閱。{'\n\n'}

                    <Text style={{fontWeight: 'bold'}}>## 9. 聯絡我們</Text>{'\n'}
                    如對本私隱政策有任何疑問，請透過以下方式聯絡：{'\n'}
                    電郵：test@email.com{'\n'}
                    地址：HK{'\n\n'}

                    <Text style={{fontWeight: 'bold'}}>**生效日期**：2026年3月1日</Text>
                  </Text>
                ) : (
                  <Text style={styles.privacyContent}>
                    <Text style={{fontWeight: 'bold', fontSize: 18}}># Privacy Policy</Text>{'\n\n'}

                    Welcome to use the "Food Safety Scanning" application (hereinafter referred to as "this App"). This App is provided by Wong Ho Fai. We take your privacy very seriously and are committed to protecting your personal data. This Privacy Policy explains how we collect, use, store, and disclose your data.{'\n\n'}

                    <Text style={{fontWeight: 'bold'}}>## 1. Information We Collect</Text>{'\n'}
                    This App may collect the following types of information:{'\n'}
                    - <Text style={{fontWeight: 'bold'}}>Information you actively provide</Text>: When you register an account, set allergy alerts, submit feedback, or contact us, we may collect contact details such as your name, email address, and phone number.{'\n'}
                    - <Text style={{fontWeight: 'bold'}}>Usage Data</Text>: Including your scan records, search history, allergy preferences you set, alert notification settings, etc.{'\n\n'}

                    <Text style={{fontWeight: 'bold'}}>## 2. Use of Information</Text>{'\n'}
                    We use the collected information to:{'\n'}
                    - Provide, maintain, and improve the functions of this App (e.g., real-time food alerts, product scan analysis).{'\n'}
                    - Send personalized notifications based on your settings (e.g., allergen alerts).{'\n'}
                    - Analyze user behavior to optimize services.{'\n'}
                    - Respond to your inquiries and support requests.{'\n'}
                    - Comply with legal requirements.{'\n\n'}

                    <Text style={{fontWeight: 'bold'}}>## 3. Storage and Security of Data</Text>{'\n'}
                    Your personal data will be stored on servers managed by Wong Ho Fai. We take reasonable technical and organizational measures to protect your data against unauthorized access, disclosure, or destruction. However, please note that internet transmission is not absolutely secure.{'\n\n'}

                    <Text style={{fontWeight: 'bold'}}>## 4. Sharing of Data</Text>{'\n'}
                    We will <Text style={{fontWeight: 'bold'}}>not</Text> sell or rent your personal data to third parties. However, we may share it in the following circumstances:{'\n'}
                    - With your explicit consent.{'\n'}
                    - To provide services, sharing with trusted partners (e.g., cloud service providers), provided such partners are bound by confidentiality obligations.{'\n'}
                    - As required by law, court order, or government authority.{'\n'}
                    - To protect the rights, property, or safety of this App, its users, or the public.{'\n\n'}

                    <Text style={{fontWeight: 'bold'}}>## 5. Your Rights</Text>{'\n'}
                    Under the Personal Data (Privacy) Ordinance of Hong Kong, you have the right to:{'\n'}
                    - Access the personal data we hold about you.{'\n'}
                    - Request correction of inaccurate data.{'\n'}
                    - Request deletion of your data (under certain circumstances).{'\n'}
                    - Withdraw consent (e.g., for receiving notifications).{'\n\n'}
                    To exercise these rights, please contact us at: test@email.com.{'\n\n'}

                    <Text style={{fontWeight: 'bold'}}>## 6. Data Retention</Text>{'\n'}
                    We only retain your data as necessary to fulfill the purposes stated in this policy or to comply with legal obligations. Generally, account data will be deleted within 30 days after account deletion; scan records may be retained in anonymous form for analysis purposes.{'\n\n'}

                    <Text style={{fontWeight: 'bold'}}>## 7. Children's Privacy</Text>{'\n'}
                    This App is not intended for children under 13 (or other age as required by Hong Kong law). If you discover that a child has provided us with data without parental consent, please contact us.{'\n\n'}

                    <Text style={{fontWeight: 'bold'}}>## 8. Changes to this Policy</Text>{'\n'}
                    We may update this Privacy Policy from time to time. Any changes will be announced within this App with an effective date. You are advised to review it regularly.{'\n\n'}

                    <Text style={{fontWeight: 'bold'}}>## 9. Contact Us</Text>{'\n'}
                    If you have any questions about this Privacy Policy, please contact us via:{'\n'}
                    Email: test@email.com{'\n'}
                    Address: HK{'\n\n'}

                    <Text style={{fontWeight: 'bold'}}>**Effective Date**: March 1, 2026</Text>
                  </Text>
                )}
              </ScrollView>

              <TouchableOpacity 
                style={styles.agreementBox} 
                onPress={() => setPrivacyAgreed(!privacyAgreed)}
              >
                <Ionicons 
                  name={privacyAgreed ? "checkbox" : "square-outline"} 
                  size={24} 
                  color="#2d5a27" 
                />
                <Text style={styles.agreementText}>
                  {language === 'zh' 
                    ? '我已清晰閱讀以上條款並同意條款所有內容' 
                    : 'I have clearly read the above terms and agree to all contents'}
                </Text>
              </TouchableOpacity>

              <TouchableOpacity 
                style={[
                  styles.submitPrivacyButton, 
                  !privacyAgreed && styles.submitPrivacyButtonDisabled
                ]}
                onPress={() => {
                  if (privacyAgreed) {
                    setShowPrivacyModal(false);
                  } else {
                    Alert.alert(i18n.error, language === 'zh' ? "請先同意私隱條款" : "Please agree to the privacy policy first");
                  }
                }}
                disabled={!privacyAgreed}
              >
                <Text style={styles.submitPrivacyButtonText}>
                  {language === 'zh' ? '提交' : 'Submit'}
                </Text>
              </TouchableOpacity>
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
    backgroundColor: '#fbf5e5',
    padding: 20,
    paddingTop: 50,
    paddingBottom: 50,
  },
  card: {
    flex: 1,
    backgroundColor: '#fff',
    borderRadius: 20, 
    padding: 25,
    shadowColor: '#5d574a',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 3,
    borderWidth: 1,
    borderColor: '#f0e6d2',
  },
  headerTitle: {
    textAlign: 'center',
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 10,
    color: '#2d5a27', 
  },
  formContainer: {
    flex: 1,
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
    marginTop: 15,
    fontWeight: '600',
  },
  helperText: {
    fontSize: 12,
    color: '#8c867a',
    marginBottom: 5,
  },
  input: {
    borderWidth: 1,
    borderColor: '#d1cabb',
    borderRadius: 12,
    padding: 12,
    fontSize: 16,
    backgroundColor: '#fff',
    color: '#5d574a',
  },
  passwordContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#d1cabb',
    borderRadius: 12,
    backgroundColor: '#fff',
  },
  passwordInput: {
    flex: 1,
    padding: 12,
    fontSize: 16,
    color: '#5d574a',
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
    width: 22,
    height: 22,
    borderWidth: 1.5,
    borderColor: '#8c867a',
    borderRadius: 6,
    marginRight: 8,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#fff',
  },
  checkboxChecked: {
    backgroundColor: '#2d5a27',
    borderColor: '#2d5a27',
  },
  checkboxLabel: {
    fontSize: 14,
    color: '#5d574a',
  },
  addItemButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 5,
    marginTop: 5,
  },
  addItemText: {
    color: '#D97943', 
    marginLeft: 5,
    fontWeight: '600',
  },
  registerButton: {
    backgroundColor: '#2d5a27',
    padding: 15,
    borderRadius: 24,
    alignItems: 'center',
    marginTop: 30,
    marginBottom: 15,
    shadowColor: '#2d5a27',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
    elevation: 4,
  },
  registerButtonText: {
    color: '#fbf5e5',
    fontSize: 18,
    fontWeight: 'bold',
  },
  loginButton: {
    backgroundColor: 'transparent',
    padding: 15,
    alignItems: 'center',
    marginBottom: 15,
  },
  loginButtonText: {
    color: '#5d574a',
    fontSize: 16,
    fontWeight: '600',
  },
  modalContainer: {
    flex: 1,
    backgroundColor: 'rgba(93, 87, 74, 0.6)', 
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: '#fbf5e5',
    padding: 25,
    borderRadius: 20,
    width: '85%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 15,
    color: '#2d5a27',
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginTop: 20,
  },
  modalCancel: {
    padding: 10,
    marginRight: 10,
  },
  modalAdd: {
    backgroundColor: '#2d5a27',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 12,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(93, 87, 74, 0.6)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  privacyModalContainer: {
    width: '90%',
    height: '80%',
    backgroundColor: '#fff',
    borderRadius: 24,
    padding: 25,
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
  },
  privacyTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 15,
    textAlign: 'center',
    color: '#2d5a27',
  },
  privacyScroll: {
    flex: 1,
    marginBottom: 15,
    borderWidth: 1,
    borderColor: '#e6dfcf',
    borderRadius: 12,
    padding: 15,
    backgroundColor: '#fbf5e5',
  },
  privacyContent: {
    fontSize: 14,
    lineHeight: 22,
    color: '#5d574a',
  },
  agreementBox: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
    paddingHorizontal: 5,
  },
  agreementText: {
    marginLeft: 10,
    fontSize: 14,
    color: '#5d574a',
    flex: 1,
  },
  submitPrivacyButton: {
    backgroundColor: '#2d5a27',
    padding: 15,
    borderRadius: 24,
    alignItems: 'center',
    shadowColor: '#2d5a27',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
  },
  submitPrivacyButtonDisabled: {
    backgroundColor: '#ccc',
  },
  submitPrivacyButtonText: {
    color: '#fbf5e5',
    fontSize: 16,
    fontWeight: 'bold',
  },
});
