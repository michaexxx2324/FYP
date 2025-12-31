import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, ActivityIndicator, Alert, ScrollView } from 'react-native';
import { useLanguage } from '../../context/LanguageContext';
import { useAuth } from '../../context/AuthContext';
import { useHistory } from '../../context/HistoryContext';
import Ionicons from '@expo/vector-icons/Ionicons';

const POE_API_KEY = 'kyUmyep70nikyCi7RnLPIdPqanivHp6omXaV3-Y7MEk';
const POE_BOT_NAME = 'gpt-5-nano';

export default function AnalysisScreen() {
  const { i18n, language } = useLanguage();
  const { user } = useAuth();
  const { history } = useHistory();
  const [selectedItem, setSelectedItem] = useState(null);
  const [analysis, setAnalysis] = useState(null);
  const [loading, setLoading] = useState(false);

  const displayAnalysis = analysis && (analysis.english || analysis.traditional_chinese)
    ? (language === 'zh' ? analysis.traditional_chinese : analysis.english)
    : analysis;

  const handleAnalyze = async (item) => {
    setSelectedItem(item);
    setLoading(true);
    setAnalysis(null);

    try {
      const allergies = user?.allergies?.join(', ') || 'None';
      const diet = user?.dietPreferences?.join(', ') || 'None';

      const prompt = `
        Perform a DEEP ADVANCED ANALYSIS on this food item.
        Item: ${item.itemName}
        Nutrition/Ingredients: ${item.nutritionInformation}
        
        User Profile:
        - Allergies: ${allergies}
        - Diet: ${diet}

        Task:
        1. Calculate a "Nutrition Density Score" (0-100).
        2. Assess "Additive Risk" (Low/Medium/High).
        3. Provide 3 Personalized Recommendations (e.g., "Reduce salt intake", "Avoid sulfites").

        Output Format (JSON):
        {
          "english": {
            "score": 85,
            "risk": "Low",
            "recommendations": ["Rec 1", "Rec 2", "Rec 3"],
            "details": "Detailed explanation..."
          },
          "traditional_chinese": {
            "score": 85,
            "risk": "低",
            "recommendations": ["建議 1", "建議 2", "建議 3"],
            "details": "詳細解釋..."
          }
        }

        STRICTLY return ONLY the JSON object. Do not add any introductory or concluding text.
      `;

      console.log("Sending request to AI Service...");
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

      const text = await response.text();
      console.log("AI Response Status:", response.status);
      

      if (!response.ok) {
        throw new Error(`AI Service Error (${response.status}): ${text.slice(0, 100)}`);
      }

      let data;
      try {
        data = JSON.parse(text);
      } catch (e) {
        throw new Error(`Invalid JSON from AI Service. Response started with: ${text.slice(0, 20)}`);
      }

      if (data.choices && data.choices.length > 0) {
        const content = data.choices[0].message.content;
        
        let parsedAnalysis = null;
        
        
        try {
            parsedAnalysis = JSON.parse(content);
        } catch (e) {
            
            const codeBlockMatch = content.match(/```(?:json)?\s*([\s\S]*?)\s*```/);
            if (codeBlockMatch) {
                try {
                    parsedAnalysis = JSON.parse(codeBlockMatch[1]);
                } catch (e2) {
                    console.warn("Failed to parse JSON from code block");
                }
            }
            
            
            if (!parsedAnalysis) {
                const firstOpen = content.indexOf('{');
                const lastClose = content.lastIndexOf('}');
                if (firstOpen !== -1 && lastClose !== -1) {
                    try {
                        const jsonString = content.substring(firstOpen, lastClose + 1);
                        parsedAnalysis = JSON.parse(jsonString);
                    } catch (e3) {
                        console.warn("Failed to parse JSON from substring");
                    }
                }
            }

            
            if (!parsedAnalysis) {
                const jsonMatches = content.match(/\{[\s\S]*?\}/g);
                if (jsonMatches && jsonMatches.length >= 2) {
                    try {
                        
                        const part1 = JSON.parse(jsonMatches[0]);
                        const part2 = JSON.parse(jsonMatches[1]);
                        
                        
                        const isPart1Chinese = /[\u4e00-\u9fa5]/.test(JSON.stringify(part1));
                        
                        if (isPart1Chinese) {
                            parsedAnalysis = { english: part2, traditional_chinese: part1 };
                        } else {
                            parsedAnalysis = { english: part1, traditional_chinese: part2 };
                        }
                    } catch (e4) {
                        console.warn("Failed to parse multiple JSON blocks");
                    }
                } else if (jsonMatches && jsonMatches.length === 1) {
                     try {
                        const part = JSON.parse(jsonMatches[0]);
                        
                        parsedAnalysis = { english: part, traditional_chinese: part };
                    } catch (e5) {
                        console.warn("Failed to parse single JSON block from matches");
                    }
                }
            }
        }

        if (parsedAnalysis) {
            setAnalysis(parsedAnalysis);
        } else {
            console.warn("Failed to parse inner JSON from AI content. Content:", content);
            setAnalysis({ details: content });
        }
      } else {
        throw new Error("No content received from AI Service");
      }

    } catch (error) {
      console.error("Analysis Failed:", error);
      Alert.alert(i18n.error || "Error", error.message || "Failed to analyze product");
    } finally {
      setLoading(false);
    }
  };

  const renderHistoryItem = ({ item }) => (
    <TouchableOpacity style={styles.historyItem} onPress={() => handleAnalyze(item)}>
      <Ionicons name="scan-circle" size={40} color="#FFD700" />
      <View style={styles.historyText}>
        <Text style={styles.historyName}>{item.itemName}</Text>
        <Text style={styles.historyDate}>{new Date(item.scanDate).toLocaleDateString()}</Text>
      </View>
      <Ionicons name="chevron-forward" size={24} color="#ccc" />
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      {!selectedItem ? (
        <>
          <Text style={styles.header}>{i18n.selectProductForAnalysis || "Select Product for Analysis"}</Text>
          <FlatList
            data={history}
            renderItem={renderHistoryItem}
            keyExtractor={(item, index) => index.toString()}
            contentContainerStyle={styles.list}
          />
        </>
      ) : (
        <ScrollView contentContainerStyle={styles.analysisContainer}>
          <TouchableOpacity onPress={() => setSelectedItem(null)} style={styles.backButton}>
            <Ionicons name="arrow-back" size={24} color="#333" />
            <Text style={styles.backText}>{i18n.back || "Back"}</Text>
          </TouchableOpacity>

          <Text style={styles.itemTitle}>{selectedItem.itemName}</Text>

          {loading ? (
            <ActivityIndicator size="large" color="#FFD700" style={{ marginTop: 50 }} />
          ) : displayAnalysis ? (
            <View>
              <View style={styles.scoreCard}>
                <Text style={styles.scoreLabel}>{i18n.nutritionScore || "Nutrition Density Score"}</Text>
                <Text style={styles.scoreValue}>{displayAnalysis.score}/100</Text>
              </View>

              <View style={styles.riskCard}>
                <Text style={styles.riskLabel}>{i18n.additiveRisk || "Additive Risk"}</Text>
                <Text style={[
                  styles.riskValue, 
                  { color: displayAnalysis.risk?.includes('High') ? 'red' : displayAnalysis.risk?.includes('Medium') ? 'orange' : 'green' }
                ]}>
                  {displayAnalysis.risk}
                </Text>
              </View>

              <View style={styles.recCard}>
                <Text style={styles.recLabel}>{i18n.personalizedAdvice || "Personalized Advice"}</Text>
                {displayAnalysis.recommendations && displayAnalysis.recommendations.map((rec, i) => (
                  <View key={i} style={styles.recItem}>
                    <Ionicons name="checkmark-circle" size={20} color="#4CAF50" />
                    <Text style={styles.recText}>{rec}</Text>
                  </View>
                ))}
              </View>
              
              <TouchableOpacity style={styles.reportButton}>
                <Text style={styles.reportButtonText}>{i18n.generateReport || "Generate Detailed Report"}</Text>
              </TouchableOpacity>
            </View>
          ) : null}
        </ScrollView>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f5f5f5' },
  header: { fontSize: 18, fontWeight: 'bold', padding: 20, color: '#333' },
  list: { padding: 15 },
  historyItem: { flexDirection: 'row', alignItems: 'center', backgroundColor: 'white', padding: 15, borderRadius: 10, marginBottom: 10 },
  historyText: { flex: 1, marginLeft: 15 },
  historyName: { fontSize: 16, fontWeight: 'bold' },
  historyDate: { color: '#888', fontSize: 12 },
  analysisContainer: { padding: 20 },
  backButton: { flexDirection: 'row', alignItems: 'center', marginBottom: 20 },
  backText: { marginLeft: 5, fontSize: 16 },
  itemTitle: { fontSize: 24, fontWeight: 'bold', marginBottom: 20 },
  scoreCard: { backgroundColor: 'white', padding: 20, borderRadius: 10, marginBottom: 15, alignItems: 'center' },
  scoreLabel: { fontSize: 16, color: '#666', marginBottom: 5 },
  scoreValue: { fontSize: 36, fontWeight: 'bold', color: '#FFD700' },
  riskCard: { backgroundColor: 'white', padding: 20, borderRadius: 10, marginBottom: 15, alignItems: 'center' },
  riskLabel: { fontSize: 16, color: '#666', marginBottom: 5 },
  riskValue: { fontSize: 24, fontWeight: 'bold' },
  recCard: { backgroundColor: 'white', padding: 20, borderRadius: 10, marginBottom: 20 },
  recLabel: { fontSize: 18, fontWeight: 'bold', marginBottom: 15 },
  recItem: { flexDirection: 'row', marginBottom: 10, alignItems: 'flex-start' },
  recText: { marginLeft: 10, flex: 1, fontSize: 16 },
  reportButton: { backgroundColor: '#FF9800', padding: 15, borderRadius: 10, alignItems: 'center' },
  reportButtonText: { color: 'white', fontWeight: 'bold', fontSize: 16 },
});
