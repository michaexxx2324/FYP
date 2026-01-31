import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, ActivityIndicator, Alert, TouchableOpacity } from 'react-native';
import { useLocalSearchParams, useRouter, Stack } from 'expo-router';
import { useLanguage } from '../context/LanguageContext';
import { useAuth } from '../context/AuthContext';
import { useHistory } from '../context/HistoryContext';
import Ionicons from '@expo/vector-icons/Ionicons';
import TranslateButton from '../components/TranslateButton';
import { API_URL, POE_API_KEY } from '@env';

const POE_BOT_NAME = 'gemini-3-pro';

export default function ProductDetailsScreen() {
  const { i18n, language } = useLanguage();
  const { user } = useAuth();
  const { addToHistory } = useHistory();
  const router = useRouter();
  const params = useLocalSearchParams();
  const { itemName, itemCode, nutritionInformation, warning: savedWarning, healthAnalysis: savedAnalysis } = params;

  const [analysis, setAnalysis] = useState(null);
  const [warning, setWarning] = useState(null);
  const [safetyLevel, setSafetyLevel] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (savedAnalysis) {
      try {
        const parsedAnalysis = typeof savedAnalysis === 'string' ? JSON.parse(savedAnalysis) : savedAnalysis;
        setAnalysis(parsedAnalysis);
        setSafetyLevel(parsedAnalysis.safetyLevel || 'Safe'); 
        setWarning(savedWarning);
        setLoading(false);
      } catch (e) {
        console.error("Error parsing saved analysis", e);
        analyzeProduct(); 
      }
    } else {
      analyzeProduct();
    }
  }, []);

  const saveAnalysisToBackend = async (analysisResult, warningMsg) => {
    try {
      await fetch(`${API_URL}/SaveScanHistory`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          itemName,
          itemCode,
          nutritionInformation,
          userId: user ? user.userId : 'anonymous',
          warning: warningMsg,
          healthAnalysis: JSON.stringify(analysisResult)
        }),
      });
      console.log("Analysis saved to backend");
      
      addToHistory({
        itemName,
        itemCode,
        nutritionInformation,
        warning: warningMsg,
        healthAnalysis: JSON.stringify(analysisResult)
      });
    } catch (error) {
      console.error("Failed to save analysis", error);
    }
  };

  const analyzeProduct = async () => {
    try {
      const allergies = user?.allergies?.length > 0 ? user.allergies.join(', ') : 'None';
      const diet = user?.dietPreferences?.length > 0 ? user.dietPreferences.join(', ') : 'None';
      const healthStatus = user?.healthStatus?.length > 0 ? user.healthStatus.join(', ') : 'None';
      const age = user?.age || 'Unknown';
      const height = user?.height || 'Unknown';
      const weight = user?.weight || 'Unknown';

      const prompt = `
        Analyze the following food item based on the provided text/label information.
        Item Name: ${itemName}
        Ingredients/Nutrition/Label Text: ${nutritionInformation}

        User Profile:
        Allergies: ${allergies}
        Dietary Preferences: ${diet}
        Health Status: ${healthStatus}
        Age: ${age}
        Height: ${height}
        Weight: ${weight}

        Tasks:
        1. Extract and summarize the key Food Label Information.
        2. Analyze for high salt, high sugar, or high fat content considering the user's health status (e.g., Diabetes, Hypertension).
        3. Identify any dangerous food additives.
        4. CRITICAL: Check if the item contains any ingredients matching the user's allergies, dietary preferences, or contraindicated by their health status.

        Determine "safetyLevel":
        - "Danger": Immediate harm risk (e.g. Contains Allergen).
        - "Warning": Long-term health risk or specific concern (e.g. High Sugar for Diabetic user, High Salt for Hypertension).
        - "Safe": No specific issues found.

        Provide output separated for English and Traditional Chinese (繁體中文).

        Return ONLY a JSON object with this EXACT structure:
        {
          "safetyLevel": "Danger" | "Warning" | "Safe",
          "english": {
            "labelInfo": "Extracted summary...",
            "summary": "Brief analysis...",
            "warning": "Specific warning text if any, or explanation of safety level",
            "details": "Detailed analysis..."
          },
          "chinese": {
            "labelInfo": "...",
            "summary": "...",
            "warning": "...",
            "details": "..."
          }
        }
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
      
      if (data.choices && data.choices.length > 0) {
        const content = data.choices[0].message.content;
        
        let result = null;
        try {
          
          const firstOpen = content.indexOf('{');
          const lastClose = content.lastIndexOf('}');
          
          if (firstOpen !== -1 && lastClose !== -1 && lastClose > firstOpen) {
            const jsonString = content.substring(firstOpen, lastClose + 1);
            result = JSON.parse(jsonString);
          } else {
            
            result = JSON.parse(content);
          }
        } catch (e) {
          console.log("JSON Parse failed, falling back to raw text", e);
        }

        if (result) {
          setAnalysis(result);
          setSafetyLevel(result.safetyLevel);
  
          const warnMsg = result.english?.warning || result.safetyLevel;
          setWarning(warnMsg);
          saveAnalysisToBackend(result, warnMsg);
        } else {
          const fallbackResult = { safetyLevel: 'Safe', english: { summary: content, details: '' }, chinese: { summary: content, details: '' } };
          setAnalysis(fallbackResult);
          saveAnalysisToBackend(fallbackResult, null);
        }
      }
    } catch (error) {
      console.error("Analysis Error:", error);
    } finally {
      setLoading(false);
    }
  };

  const getDisplayContent = () => {
    if (!analysis) return null;
  
    const langKey = language === 'zh' || language === 'zh-HK' || language === 'zh-TW' ? 'chinese' : 'english';
    return analysis[langKey] || analysis.english || {}; 
  };

  const displayContent = getDisplayContent();
  const currentSafetyLevel = analysis?.safetyLevel || safetyLevel;

  const getSafetyColor = () => {
    if (currentSafetyLevel === 'Danger') return '#D32F2F'; 
    if (currentSafetyLevel === 'Warning') return '#FFA000'; 
    if (currentSafetyLevel === 'Safe') return '#4CAF50'; 
    return '#4CAF50';
  };

  const getSafetyText = () => {
    if (currentSafetyLevel === 'Danger') return i18n.danger || "DANGER";
    if (currentSafetyLevel === 'Warning') return i18n.warning || "WARNING";
    return i18n.safe || "SAFE";
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={{paddingBottom: 50}}>
      <Stack.Screen options={{
        headerRight: () => <TranslateButton />
      }} />
      
      {!loading && analysis && (
        <View style={[styles.warningCard, { backgroundColor: getSafetyColor() }]}>
          <Ionicons name={currentSafetyLevel === 'Safe' ? "checkmark-circle" : "warning"} size={32} color="white" />
          <Text style={styles.warningText}>{getSafetyText()}</Text>
          <Text style={styles.warningDetail}>{displayContent.warning || displayContent.summary}</Text>
        </View>
      )}

      <View style={styles.card}>
        <Text style={styles.label}>{i18n.itemName}:</Text>
        <Text style={styles.value}>{itemName}</Text>
        
        <Text style={styles.label}>{i18n.itemCode}:</Text>
        <Text style={styles.value}>{itemCode}</Text>
        
        <Text style={styles.label}>{i18n.nutritionInfo}:</Text>
        <Text style={styles.value}>{nutritionInformation}</Text>
      </View>

      <View style={styles.card}>
        <Text style={styles.sectionTitle}>{i18n.aiAnalysis || "AI Analysis"}</Text>
        {loading ? (
          <ActivityIndicator size="large" color="#4CAF50" />
        ) : analysis ? (
          <>
            {displayContent.labelInfo && (
              <View style={styles.infoSection}>
                <Text style={styles.subHeader}>{i18n.labelInfo || "Label Information"}:</Text>
                <Text style={styles.value}>{displayContent.labelInfo}</Text>
              </View>
            )}
            <Text style={styles.subHeader}>{i18n.healthAnalysis || "Health Analysis"}:</Text>
            <Text style={styles.analysisSummary}>{displayContent.summary}</Text>
            {displayContent.details && (
              <Text style={styles.analysisDetails}>{displayContent.details}</Text>
            )}
          </>
        ) : (
          <Text>{i18n.analysisFailed || "Analysis unavailable"}</Text>
        )}
      </View>

      <TouchableOpacity 
        style={styles.historyButton}
        onPress={() => router.push('/history')}
      >
        <Ionicons name="time-outline" size={24} color="white" style={{marginRight: 10}} />
        <Text style={styles.historyButtonText}>{i18n.backToHistory || "Back to History"}</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#f5f5f5',
  },
  card: {
    backgroundColor: 'white',
    padding: 20,
    borderRadius: 10,
    elevation: 3,
    marginBottom: 20,
  },
  warningCard: {
    backgroundColor: '#D32F2F',
    padding: 20,
    borderRadius: 10,
    elevation: 5,
    marginBottom: 20,
    alignItems: 'center',
  },
  warningText: {
    color: 'white',
    fontSize: 20,
    fontWeight: 'bold',
    marginTop: 5,
  },
  warningDetail: {
    color: 'white',
    fontSize: 16,
    textAlign: 'center',
    marginTop: 5,
  },
  label: {
    fontSize: 16,
    fontWeight: 'bold',
    marginTop: 10,
    color: '#333',
  },
  value: {
    fontSize: 16,
    marginBottom: 10,
    color: '#555',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 15,
    color: '#2196F3',
  },
  subHeader: {
    fontSize: 16,
    fontWeight: 'bold',
    marginTop: 10,
    marginBottom: 5,
    color: '#4CAF50',
  },
  infoSection: {
    marginBottom: 15,
    paddingBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  analysisSummary: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 10,
    color: '#333',
  },
  analysisDetails: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
  },
  historyButton: {
    backgroundColor: '#607D8B',
    padding: 15,
    borderRadius: 10,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 10,
    marginBottom: 30,
  },
  historyButtonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
});
