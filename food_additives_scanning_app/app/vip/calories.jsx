import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, FlatList, Alert, Modal, TextInput } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useLanguage } from '../../context/LanguageContext';
import { useHistory } from '../../context/HistoryContext';
import Ionicons from '@expo/vector-icons/Ionicons';

const POE_API_KEY = 'kyUmyep70nikyCi7RnLPIdPqanivHp6omXaV3-Y7MEk';
const POE_BOT_NAME = 'gpt-5-nano';

export default function CaloriesScreen() {
  const { i18n } = useLanguage();
  const { history } = useHistory();
  const [todayCalories, setTodayCalories] = useState(0);
  const [dailyGoal, setDailyGoal] = useState(2000);
  const [intakeLog, setIntakeLog] = useState([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedFood, setSelectedFood] = useState(null);
  const [servings, setServings] = useState('1');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadDailyLog();
  }, []);

  const loadDailyLog = async () => {
    try {
      const today = new Date().toDateString();
      const storedLog = await AsyncStorage.getItem(`calories_${today}`);
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
    if (!selectedFood) return;
    setLoading(true);

    try {
      // Ask AI to extract calories from the nutrition info
      const prompt = `
        Extract the calories (kcal) per serving or per 100g from this text.
        Text: ${selectedFood.nutritionInformation}
        
        Return ONLY the number (integer). If not found, return 0.
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

      const data = await response.json();
      let caloriesPerUnit = 0;
      
      if (data.choices && data.choices.length > 0) {
        const content = data.choices[0].message.content;
        const match = content.match(/\d+/);
        if (match) {
          caloriesPerUnit = parseInt(match[0]);
        }
      }

      // If AI returns 0 or fails, maybe ask user? For now, assume 0 if failed.
      if (caloriesPerUnit === 0) {
         Alert.alert("Info", "Could not auto-detect calories. Added as 0.");
      }

      const totalCalories = caloriesPerUnit * parseFloat(servings);
      
      const newEntry = {
        id: Date.now(),
        name: selectedFood.itemName,
        calories: totalCalories,
        servings: servings,
        time: new Date().toLocaleTimeString()
      };

      const newLog = [...intakeLog, newEntry];
      saveDailyLog(newLog);
      setModalVisible(false);
      setServings('1');
      setSelectedFood(null);

    } catch (error) {
      console.error(error);
      Alert.alert(i18n.error, i18n.networkError);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      {/* Header Card */}
      <View style={styles.headerCard}>
        <Text style={styles.headerTitle}>{i18n.calorieCounter || "Calorie Counting"}</Text>
        <View style={styles.progressContainer}>
          <Text style={styles.caloriesValue}>{Math.round(todayCalories)}</Text>
          <Text style={styles.caloriesLabel}>{i18n.todayIntake || "Today's Intake"} / {i18n.dailyGoal || "Goal"} {dailyGoal}</Text>
          <View style={styles.progressBarBg}>
            <View style={[styles.progressBarFill, { width: `${Math.min((todayCalories / dailyGoal) * 100, 100)}%` }]} />
          </View>
        </View>
      </View>

      {/* Intake List */}
      <View style={styles.listContainer}>
        <Text style={styles.sectionTitle}>{i18n.todayIntake || "Today's Intake"}</Text>
        <FlatList
          data={intakeLog}
          keyExtractor={item => item.id.toString()}
          renderItem={({ item }) => (
            <View style={styles.logItem}>
              <View>
                <Text style={styles.logName}>{item.name}</Text>
                <Text style={styles.logTime}>{item.time} • {item.servings} servings</Text>
              </View>
              <Text style={styles.logCalories}>{Math.round(item.calories)} kcal</Text>
            </View>
          )}
          ListEmptyComponent={<Text style={styles.emptyText}>No food recorded today</Text>}
        />
      </View>

      {/* Scan/Add Button */}
      <TouchableOpacity style={styles.scanButton} onPress={() => setModalVisible(true)}>
        <Text style={styles.scanButtonText}>{i18n.scanToRecord || "Scan Food to Record"}</Text>
      </TouchableOpacity>

      {/* Modal for Selection */}
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
                <Text style={styles.label}>{i18n.howManyServings || "How many servings?"}</Text>
                <TextInput
                  style={styles.input}
                  value={servings}
                  onChangeText={setServings}
                  keyboardType="numeric"
                />
                <TouchableOpacity style={styles.confirmButton} onPress={confirmAddFood} disabled={loading}>
                  <Text style={styles.confirmButtonText}>{loading ? "Calculating..." : "Add to Log"}</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.closeButton} onPress={() => setSelectedFood(null)}>
                  <Text style={styles.closeButtonText}>{i18n.back || "Back"}</Text>
                </TouchableOpacity>
              </>
            )}
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f5f5f5', padding: 20 },
  headerCard: { backgroundColor: 'white', padding: 20, borderRadius: 15, alignItems: 'center', marginBottom: 20, elevation: 3 },
  headerTitle: { fontSize: 18, fontWeight: 'bold', marginBottom: 15 },
  progressContainer: { width: '100%', alignItems: 'center' },
  caloriesValue: { fontSize: 48, fontWeight: 'bold', color: '#4CAF50' },
  caloriesLabel: { color: '#666', marginBottom: 10 },
  progressBarBg: { width: '100%', height: 10, backgroundColor: '#eee', borderRadius: 5 },
  progressBarFill: { height: '100%', backgroundColor: '#4CAF50', borderRadius: 5 },
  listContainer: { flex: 1 },
  sectionTitle: { fontSize: 18, fontWeight: 'bold', marginBottom: 10 },
  logItem: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', backgroundColor: 'white', padding: 15, borderRadius: 10, marginBottom: 10 },
  logName: { fontSize: 16, fontWeight: 'bold' },
  logTime: { color: '#888', fontSize: 12 },
  logCalories: { fontSize: 16, fontWeight: 'bold', color: '#4CAF50' },
  emptyText: { textAlign: 'center', color: '#888', marginTop: 20 },
  scanButton: { backgroundColor: '#FF9800', padding: 15, borderRadius: 10, alignItems: 'center', marginTop: 10 },
  scanButtonText: { color: 'white', fontWeight: 'bold', fontSize: 16 },
  modalContainer: { flex: 1, justifyContent: 'center', backgroundColor: 'rgba(0,0,0,0.5)', padding: 20 },
  modalContent: { backgroundColor: 'white', borderRadius: 15, padding: 20 },
  modalTitle: { fontSize: 20, fontWeight: 'bold', marginBottom: 10, textAlign: 'center' },
  modalSubtitle: { marginBottom: 10, color: '#666' },
  historyItem: { flexDirection: 'row', justifyContent: 'space-between', padding: 15, borderBottomWidth: 1, borderBottomColor: '#eee' },
  historyName: { fontSize: 16 },
  closeButton: { marginTop: 10, padding: 10, alignItems: 'center' },
  closeButtonText: { color: '#666' },
  input: { borderWidth: 1, borderColor: '#ddd', borderRadius: 8, padding: 10, fontSize: 18, textAlign: 'center', marginBottom: 20 },
  confirmButton: { backgroundColor: '#4CAF50', padding: 15, borderRadius: 10, alignItems: 'center' },
  confirmButtonText: { color: 'white', fontWeight: 'bold' },
  label: { marginBottom: 10, textAlign: 'center' },
});
