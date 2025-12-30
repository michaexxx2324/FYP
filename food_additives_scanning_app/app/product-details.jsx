import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, ActivityIndicator, Alert, TouchableOpacity } from 'react-native';
import { useLocalSearchParams, useRouter, Stack } from 'expo-router';
import { useLanguage } from '../context/LanguageContext';
import { useAuth } from '../context/AuthContext';
import { useHistory } from '../context/HistoryContext';
import Ionicons from '@expo/vector-icons/Ionicons';
import TranslateButton from '../components/TranslateButton';

const POE_API_KEY = 'kyUmyep70nikyCi7RnLPIdPqanivHp6omXaV3-Y7MEk';
const POE_BOT_NAME = 'gpt-5-nano';

export default function ProductDetailsScreen() {
  const { i18n } = useLanguage();
  const { user } = useAuth();
  const { addToHistory } = useHistory();
  const router = useRouter();
  const params = useLocalSearchParams();
  const { itemName, itemCode, nutritionInformation, warning: savedWarning, healthAnalysis: savedAnalysis } = params;

  const [analysis, setAnalysis] = useState(null);
  const [warning, setWarning] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (savedAnalysis) {
      // If we have saved analysis from history/scan, use it
      try {
        const parsedAnalysis = typeof savedAnalysis === 'string' ? JSON.parse(savedAnalysis) : savedAnalysis;
        setAnalysis(parsedAnalysis);
        setWarning(savedWarning);
        setLoading(false);
      } catch (e) {
        console.error("Error parsing saved analysis", e);
        analyzeProduct(); // Fallback to re-analyze
      }
    } else {
      analyzeProduct();
    }
  }, []);

  const saveAnalysisToBackend = async (analysisResult, warningMsg) => {
    try {
      await fetch('http://192.168.50.124:3000/api/SaveScanHistory', {
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
      
      // Also update local history context so it's available immediately
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
      const allergies = user?.allergies?.join(', ') || 'None';
      const diet = user?.dietPreferences?.join(', ') || 'None';

      const prompt = `
        Analyze the following food item based on the provided text/label information.
        Item Name: ${itemName}
        Ingredients/Nutrition/Label Text: ${nutritionInformation}

        User Profile:
        Allergies: ${allergies}
        Dietary Preferences: ${diet}

        Tasks:
        1. Extract and summarize the key Food Label Information (e.g., ingredients list, nutritional values) if the input text is raw or unstructured.
        2. Analyze for high salt, high sugar, or high fat content.
        3. Identify any dangerous food additives (E-numbers, preservatives, etc.).
        4. CRITICAL: Check if the item contains any ingredients that match the user's allergies or violate their dietary preferences.
        5. CRITICAL: Specifically look for "Cross-Contamination Warnings" or "Factory Warnings" (e.g., "Produced in a factory that handles...", "May contain traces of...", "生產此食品的廠房亦處理..."). Treat these as potential allergy risks ONLY IF the user has that specific allergy.

        IMPORTANT RULES FOR "warning" FIELD:
        - The "warning" field must be used ONLY for severe alerts related to the User Profile (Allergies or Diet).
        - If the User Profile has no allergies and no dietary preferences, "warning" MUST be null.
        - Do NOT put general health warnings (like "High Sugar", "Unhealthy additives") in the "warning" field. Put them in "summary" or "details".
        - If the item contains an allergen that the user is NOT allergic to, do NOT put it in "warning".
        - If there is a cross-contamination warning for an ingredient the user is NOT allergic to, do NOT put it in "warning".

        IMPORTANT: Provide the output in BOTH English and Traditional Chinese (繁體中文) for EVERY field.
        Format each field as: "English text...\n\n(中文翻譯...)"

        Return ONLY a JSON object with this format:
        {
          "labelInfo": "Extracted summary of the food label information (English + Chinese)",
          "summary": "Brief analysis of healthiness (salt/sugar/additives) (English + Chinese)",
          "warning": "URGENT WARNING MESSAGE if and ONLY IF allergy/diet violation found, otherwise null. (English + Chinese)",
          "details": "Detailed analysis including additives found and specific cross-contamination warnings if any (English + Chinese)"
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
          // 1. Try to find the first JSON object in the string
          const firstOpen = content.indexOf('{');
          const lastClose = content.lastIndexOf('}');
          
          if (firstOpen !== -1 && lastClose !== -1 && lastClose > firstOpen) {
            const jsonString = content.substring(firstOpen, lastClose + 1);
            result = JSON.parse(jsonString);
          } else {
            // 2. If no braces found, try parsing the whole string (unlikely but possible)
            result = JSON.parse(content);
          }
        } catch (e) {
          console.log("JSON Parse failed, falling back to raw text", e);
        }

        if (result) {
          setAnalysis(result);
          setWarning(result.warning);
          // Save the result to backend for future use
          saveAnalysisToBackend(result, result.warning);
        } else {
          // Fallback if not JSON
          const fallbackResult = { summary: content, details: '' };
          setAnalysis(fallbackResult);
          saveAnalysisToBackend(fallbackResult, null);
        }
      }
    } catch (error) {
      console.error("Analysis Error:", error);
      // Don't alert, just show basic info
    } finally {
      setLoading(false);
    }
  };

  const shouldShowWarning = (warningMsg) => {
    if (!warningMsg) return false;
    const lower = String(warningMsg).toLowerCase().trim();
    return lower !== 'null' && lower !== 'none' && lower !== 'no warning' && lower !== '';
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={{paddingBottom: 50}}>
      <Stack.Screen options={{
        headerRight: () => <TranslateButton />
      }} />
      {shouldShowWarning(warning) && (
        <View style={styles.warningCard}>
          <Ionicons name="warning" size={32} color="white" />
          <Text style={styles.warningText}>{i18n.warning || "WARNING"}</Text>
          <Text style={styles.warningDetail}>{warning}</Text>
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
            {analysis.labelInfo && (
              <View style={styles.infoSection}>
                <Text style={styles.subHeader}>{i18n.labelInfo || "Label Information"}:</Text>
                <Text style={styles.value}>{analysis.labelInfo}</Text>
              </View>
            )}
            <Text style={styles.subHeader}>{i18n.healthAnalysis || "Health Analysis"}:</Text>
            <Text style={styles.analysisSummary}>{analysis.summary}</Text>
            {analysis.details && (
              <Text style={styles.analysisDetails}>{analysis.details}</Text>
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
