import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, FlatList, Alert, Modal, TextInput, ActivityIndicator } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useLanguage } from '../../context/LanguageContext';
import { useHistory } from '../../context/HistoryContext';
import Ionicons from '@expo/vector-icons/Ionicons';
import { POE_API_KEY, POE_BOT_NAME } from '@env';

export default function CaloriesScreen() {
  const { i18n } = useLanguage();
  const { history } = useHistory();
  const [todayCalories, setTodayCalories] = useState(0);
  const [dailyGoal, setDailyGoal] = useState(2000);
  const [intakeLog, setIntakeLog] = useState([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedFood, setSelectedFood] = useState(null);
  const [grams, setGrams] = useState('100');
  const [loading, setLoading] = useState(false);
  const [goalModalVisible, setGoalModalVisible] = useState(false);
  const [tempGoal, setTempGoal] = useState('2000');
  const [cooldown, setCooldown] = useState(0);

  useEffect(() => {
    loadDailyLog();
  }, []);

  useEffect(() => {
    if (cooldown > 0) {
      const interval = setInterval(() => {
        setCooldown(prev => prev - 1);
      }, 1000);
      return () => clearInterval(interval);
    }
  }, [cooldown]);

  const loadDailyLog = async () => {
    try {
      const today = new Date().toDateString();
      const storedLog = await AsyncStorage.getItem(`calories_${today}`);
      const storedGoal = await AsyncStorage.getItem('user_calorie_goal');
      
      if (storedGoal) {
        setDailyGoal(parseInt(storedGoal));
        setTempGoal(storedGoal);
      }

      if (storedLog) {
        const log = JSON.parse(storedLog);
        setIntakeLog(log);
        const total = log.reduce((sum, item) => sum + item.calories, 0);
        setTodayCalories(total);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleUpdateGoal = async () => {
    const newGoal = parseInt(tempGoal);
    if (newGoal > 0) {
      setDailyGoal(newGoal);
      await AsyncStorage.setItem('user_calorie_goal', newGoal.toString());
      setGoalModalVisible(false);
    } else {
      Alert.alert("Invalid Input", "Please enter a valid calorie goal.");
    }
  };

  const saveDailyLog = async (newLog) => {
    try {
      const today = new Date().toDateString();
      await AsyncStorage.setItem(`calories_${today}`, JSON.stringify(newLog));
      setIntakeLog(newLog);
      const total = newLog.reduce((sum, item) => sum + item.calories, 0);
      setTodayCalories(total);
    } catch (e) {
      console.error(e);
    }
  };

  const handleAddFood = (item) => {
    setSelectedFood(item);
    setModalVisible(true);
  };

  const confirmAddFood = async () => {
    if (!selectedFood || cooldown > 0) return;
    setLoading(true);

    try {
      
      const prompt = `
        Calculate the TOTAL calories (kcal) for ${grams} grams of this food based on the nutrition info.
        Nutrition Info: ${selectedFood.nutritionInformation}
        
        Strictly output valid JSON only:
        { "calories": number }
        
        Do not output any other text or explanation.
      `;

      const response = await fetch('https://api.poe.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${POE_API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: POE_BOT_NAME,
          messages: [
            { role: 'user', content: prompt }
          ]
        })
      });

      let totalCalories = 0;
      try {
        const text = await response.text();
        if (response.ok) {
            const data = JSON.parse(text);
            if (data.choices && data.choices.length > 0) {
                const content = data.choices[0].message.content;
                
                // Try to find JSON in the content
                const jsonMatch = content.match(/\{[\s\S]*\}/);
                if (jsonMatch) {
                   const jsonResult = JSON.parse(jsonMatch[0]);
                   totalCalories = parseInt(jsonResult.calories);
                } else {
                   // Fallback to simple number match if JSON fails, but look for the last number
                   // usually the result comes at the end if it's chatting
                   const matches = content.match(/\d+/g);
                   if (matches && matches.length > 0) {
                       // Try to pick the most reasonable number (not 100 from 'per 100g')
                       // This is a last resort fallback
                       totalCalories = parseInt(matches[matches.length - 1]);
                   }
                }
            }
        } else {
            console.warn("API Error:", text);
            throw new Error("API Error");
        }
      } catch (e) {
          console.warn("Falling back to demo mode:", e);
          totalCalories = Math.floor((parseInt(grams) || 100) * 1.5); // Rough estimate fallback
          Alert.alert("Demo Mode", "AI Service unavailable. Estimated calories added.");
      }

      const newEntry = {
        id: Date.now(),
        name: selectedFood.itemName,
        calories: totalCalories,
        grams: grams,
        time: new Date().toLocaleTimeString()
      };

      const newLog = [...intakeLog, newEntry];
      saveDailyLog(newLog);
      setModalVisible(false);
      setGrams('100');
      setSelectedFood(null);

    } catch (error) {
      console.error(error);
      Alert.alert(i18n.error, i18n.networkError || "Network Error");
    } finally {
      setLoading(false);
      setCooldown(10);
    }
  };

  return (
    <View style={styles.container}>
      
      <View style={styles.headerCard}>
        <Text style={styles.headerTitle}>{i18n.calorieCounter || "Calorie Counting"}</Text>
        <View style={styles.progressContainer}>
          <Text style={styles.caloriesValue}>{Math.round(todayCalories)}</Text>
          <TouchableOpacity onPress={() => setGoalModalVisible(true)} style={styles.goalContainer}>
            <Text style={styles.caloriesLabel}>{i18n.todayIntake || "Today's Intake"} / {i18n.dailyGoal || "Goal"} {dailyGoal}</Text>
            <Ionicons name="pencil" size={16} color="#666" style={{ marginLeft: 5 }} />
          </TouchableOpacity>
          <View style={styles.progressBarBg}>
            <View style={[styles.progressBarFill, { width: `${Math.min((todayCalories / dailyGoal) * 100, 100)}%` }]} />
          </View>
        </View>
      </View>

      
      <View style={styles.listContainer}>
        <Text style={styles.sectionTitle}>{i18n.todayIntake || "Today's Intake"}</Text>
        <FlatList
          data={intakeLog}
          keyExtractor={item => item.id.toString()}
          renderItem={({ item }) => (
            <View style={styles.logItem}>
              <View>
                <Text style={styles.logName}>{item.name}</Text>
                <Text style={styles.logTime}>{item.time} • {item.grams ? `${item.grams}g` : `${item.servings} srv`}</Text>
              </View>
              <Text style={styles.logCalories}>{Math.round(item.calories)} kcal</Text>
            </View>
          )}
          ListEmptyComponent={<Text style={styles.emptyText}>No food recorded today</Text>}
        />
      </View>

      
      <TouchableOpacity style={styles.scanButton} onPress={() => setModalVisible(true)}>
        <Text style={styles.scanButtonText}>{i18n.scanToRecord || "Scan Food to Record"}</Text>
      </TouchableOpacity>

      
      <Modal visible={modalVisible} animationType="slide" transparent={true}>
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            {!selectedFood ? (
              <>
                <Text style={styles.modalTitle}>{i18n.addFood || "Add Food"}</Text>
                <Text style={styles.modalSubtitle}>Select from recent scans:</Text>
                <FlatList
                  data={history}
                  keyExtractor={(item, index) => index.toString()}
                  renderItem={({ item }) => (
                    <TouchableOpacity style={styles.historyItem} onPress={() => setSelectedFood(item)}>
                      <Text style={styles.historyName}>{item.itemName}</Text>
                      <Ionicons name="add-circle" size={24} color="#4CAF50" />
                    </TouchableOpacity>
                  )}
                  style={{ maxHeight: 300 }}
                />
                <TouchableOpacity style={styles.closeButton} onPress={() => setModalVisible(false)}>
                  <Text style={styles.closeButtonText}>{i18n.cancel || "Cancel"}</Text>
                </TouchableOpacity>
              </>
            ) : (
              <>
                <Text style={styles.modalTitle}>{selectedFood.itemName}</Text>
                <Text style={styles.label}>{i18n.howManyGrams || "Amount eaten (grams)"}</Text>
                <TextInput
                  style={[styles.input, loading && styles.disabledInput]}
                  value={grams}
                  onChangeText={setGrams}
                  keyboardType="numeric"
                  placeholder="e.g. 100"
                  editable={!loading}
                />
                <TouchableOpacity 
                   style={[styles.confirmButton, (loading || cooldown > 0) && styles.disabledButton]} 
                   onPress={confirmAddFood} 
                   disabled={loading || cooldown > 0}
                >
                  {loading ? (
                    <ActivityIndicator size="small" color="white" />
                  ) : (
                    <Text style={styles.confirmButtonText}>
                      {cooldown > 0 ? `Wait ${cooldown}s` : "Add to Log"}
                    </Text>
                  )}
                </TouchableOpacity>
                <TouchableOpacity style={styles.closeButton} onPress={() => setSelectedFood(null)} disabled={loading}>
                  <Text style={styles.closeButtonText}>{i18n.back || "Back"}</Text>
                </TouchableOpacity>
              </>
            )}
          </View>
        </View>
      </Modal>

      <Modal visible={goalModalVisible} animationType="fade" transparent={true}>
        <View style={styles.modalContainer}>
            <View style={styles.modalContent}>
                <Text style={styles.modalTitle}>Set Daily Calorie Goal</Text>
                <TextInput
                    style={styles.input}
                    value={tempGoal}
                    onChangeText={setTempGoal}
                    keyboardType="numeric"
                />
                 <TouchableOpacity style={styles.confirmButton} onPress={handleUpdateGoal}>
                  <Text style={styles.confirmButtonText}>Save Goal</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.closeButton} onPress={() => setGoalModalVisible(false)}>
                  <Text style={styles.closeButtonText}>Cancel</Text>
                </TouchableOpacity>
            </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fbf5e5', padding: 20 },
  headerCard: { backgroundColor: 'white', padding: 20, borderRadius: 24, alignItems: 'center', marginBottom: 20, elevation: 2, shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 10 },
  headerTitle: { fontSize: 18, fontWeight: 'bold', marginBottom: 15, color: '#2d5a27' },
  progressContainer: { width: '100%', alignItems: 'center' },
  goalContainer: { flexDirection: 'row', alignItems: 'center', marginBottom: 10 },
  caloriesValue: { fontSize: 48, fontWeight: 'bold', color: '#2d5a27' },
  caloriesLabel: { color: '#5d574a' },
  progressBarBg: { width: '100%', height: 10, backgroundColor: '#f0f0f0', borderRadius: 5 },
  progressBarFill: { height: '100%', backgroundColor: '#2d5a27', borderRadius: 5 },
  listContainer: { flex: 1 },
  sectionTitle: { fontSize: 18, fontWeight: 'bold', marginBottom: 10, color: '#5d574a' },
  logItem: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', backgroundColor: 'white', padding: 15, borderRadius: 20, marginBottom: 10 },
  logName: { fontSize: 16, fontWeight: 'bold', color: '#5d574a' },
  logTime: { color: '#888', fontSize: 12 },
  logCalories: { fontSize: 16, fontWeight: 'bold', color: '#2d5a27' },
  emptyText: { textAlign: 'center', color: '#888', marginTop: 20 },
  scanButton: { backgroundColor: '#2d5a27', padding: 15, borderRadius: 25, alignItems: 'center', marginTop: 10 },
  scanButtonText: { color: 'white', fontWeight: 'bold', fontSize: 16 },
  modalContainer: { flex: 1, justifyContent: 'center', backgroundColor: 'rgba(0,0,0,0.5)', padding: 20 },
  modalContent: { backgroundColor: 'white', borderRadius: 24, padding: 20 },
  modalTitle: { fontSize: 20, fontWeight: 'bold', marginBottom: 10, textAlign: 'center', color: '#2d5a27' },
  modalSubtitle: { marginBottom: 10, color: '#666' },
  historyItem: { flexDirection: 'row', justifyContent: 'space-between', padding: 15, borderBottomWidth: 1, borderBottomColor: '#f0f0f0' },
  historyName: { fontSize: 16, color: '#5d574a' },
  closeButton: { marginTop: 10, padding: 10, alignItems: 'center' },
  closeButtonText: { color: '#666' },
  input: { borderWidth: 1, borderColor: '#e0e0e0', borderRadius: 12, padding: 10, fontSize: 18, textAlign: 'center', marginBottom: 20, backgroundColor: '#f9f9f9' },
  disabledInput: { backgroundColor: '#f0f0f0', color: '#aaa' },
  confirmButton: { backgroundColor: '#2d5a27', padding: 15, borderRadius: 12, alignItems: 'center' },
  disabledButton: { backgroundColor: '#a5d6a7' },
  confirmButtonText: { color: 'white', fontWeight: 'bold' },
  label: { marginBottom: 10, textAlign: 'center', color: '#5d574a' },
});
