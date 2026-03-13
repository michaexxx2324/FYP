import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator, Alert, ScrollView, Image } from 'react-native';
import { useRouter, Stack } from 'expo-router';
import { useLanguage } from '../context/LanguageContext';
import { useAuth } from '../context/AuthContext';
import Ionicons from '@expo/vector-icons/Ionicons';
import TranslateButton from '../components/TranslateButton';

import { API_URL, POE_API_KEY, POE_BOT_NAME } from '@env';

export default function QuizGameScreen() {
  const { i18n, language } = useLanguage();
  const { user, updateUser } = useAuth();
  const router = useRouter();
  
  const [questions, setQuestions] = useState([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [loading, setLoading] = useState(true);
  const [gameOver, setGameOver] = useState(false);
  const [selectedOption, setSelectedOption] = useState(null);
  const [isCorrect, setIsCorrect] = useState(null);

  useEffect(() => {
    if (user) {
        fetchQuestions();
    }
  }, [user]);

  const fetchQuestions = async () => {
    try {
      if (!user) {
         
         return; 
      }

      const allergies = user.allergies?.join(', ') || 'none';
      const diet = user.dietPreferences?.join(', ') || 'none';
      const healthStatus = user.healthStatus?.join(', ') || 'none';
      const age = user.age || 'unknown';

      const prompt = `
        Generate 5 fun, engaging, and educational multiple-choice quiz questions about food additives, food safety, and nutrition.
        
        Tailor the questions to a user with:
        - Allergies: ${allergies}
        - Diet: ${diet}
        - Health Status: ${healthStatus}
        - Age: ${age}

        Make sure the correct answers are scientifically accurate but explained simply.
        Focus on "hidden dangers", "healthy alternatives", or "facts about [User's Allergies/Diet]".

        Strictly conform to this JSON structure:
        [
          {
            "id": 1,
            "en": {
              "question": "English Question text here?",
              "options": ["Option A", "Option B", "Option C", "Option D"],
              "answer": "Option A"
            },
            "zh": {
              "question": "中文問題在這裏?",
              "options": ["選項 A", "選項 B", "選項 C", "選項 D"],
              "answer": "選項 A"
            }
          }
        ]
        
        Return ONLY valid JSON. No markdown formatting.
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

      if (!response.ok) {
        const errorText = await response.text();
        console.error("Poe API Error response:", response.status, errorText);
        throw new Error(`AI Service Failed: ${response.status} - ${errorText}`);
      }

      const text = await response.text();
      const data = JSON.parse(text);
      
      if (data.choices && data.choices.length > 0) {
        const content = data.choices[0].message.content;
        
       
        let parsedQuestions = [];
        try {
      
            parsedQuestions = JSON.parse(content);
        } catch (e) {

            const match = content.match(/\[[\s\S]*\]/);
            if (match) {
                parsedQuestions = JSON.parse(match[0]);
            }
        }

        if (Array.isArray(parsedQuestions) && parsedQuestions.length > 0) {
             setQuestions(parsedQuestions);
        } else {
             console.warn("AI didn't return valid questions, falling back to server.");
             fallbackFetch();
        }
      }

      setLoading(false);
    } catch (error) {
      console.error("Failed to generate questions, falling back:", error);
      fallbackFetch();
    }
  };

  const fallbackFetch = async () => {
      try {
        const response = await fetch(`${API_URL}/quiz/questions`);
        const data = await response.json();
        setQuestions(data);
      } catch (err) {
          Alert.alert(i18n.error, i18n.networkError || "Could not load quiz.");
      } finally {
          setLoading(false);
      }
  };

  const handleAnswer = (option) => {
    const currentQuestion = questions[currentQuestionIndex];
    
    let correctAnswer;
    if (currentQuestion.en && currentQuestion.zh) {
         correctAnswer = (language === 'zh' ? currentQuestion.zh.answer : currentQuestion.en.answer);
    } else {
         correctAnswer = currentQuestion.answer;
    }

    const correct = option === correctAnswer;
    
    setSelectedOption(option);
    setIsCorrect(correct);
    
    if (correct) {
      setScore(score + 1);
    }

    
    setTimeout(() => {
      if (currentQuestionIndex < questions.length - 1) {
        setCurrentQuestionIndex(currentQuestionIndex + 1);
        setSelectedOption(null);
        setIsCorrect(null);
      } else {
        handleGameOver();
      }
    }, 1000);
  };

  const handleGameOver = async () => {
    setGameOver(true);
    if (user) {
      await saveCoupon();
    }
  };

  const saveCoupon = async () => {
    try {
      const coupon = {
        code: "FOODSAFE10",
        discount: "10% OFF",
        partner: "HKTVmall, panda mart, PARKnSHOP, Wellcome",
        dateWon: new Date()
      };

      const response = await fetch(`${API_URL}/user/coupon`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: user.userId,
          coupon: coupon
        }),
      });

      if (response.ok) {
        const data = await response.json();
        
        updateUser({ coupons: data.coupons });
      }
    } catch (error) {
      console.error("Error saving coupon:", error);
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <Stack.Screen options={{ title: i18n.discountGame, headerRight: () => <TranslateButton /> }} />
        <ActivityIndicator size="large" color="#4CAF50" />
        <Text style={{ marginTop: 10 }}>{i18n.loading}...</Text>
      </View>
    );
  }

  if (gameOver) {
    return (
      <View style={styles.container}>
        <Stack.Screen options={{ title: i18n.discountGame, headerRight: () => <TranslateButton /> }} />
        <View style={styles.resultCard}>
          <Ionicons name="trophy" size={80} color="#FFD700" />
          <Text style={styles.resultTitle}>{i18n.congratulations || "Congratulations!"}</Text>
          <Text style={styles.resultScore}>{i18n.score || "Score"}: {score} / {questions.length}</Text>
          
          <Text style={styles.discountText}>
            {i18n.couponWon || "You won a 10% OFF Coupon!"}
          </Text>
          
          <View style={styles.codeContainer}>
            <Ionicons name="person-circle-outline" size={40} color="#4CAF50" style={{ marginBottom: 10 }} />
            <Text style={[styles.codeText, { fontSize: 16, textAlign: 'center', letterSpacing: 0 }]}>
              {i18n.checkProfileMsg || "Go to your Profile page to view and use your coupon."}
            </Text>
          </View>

          <Text style={styles.partnerText}>
            {i18n.redeemAt || "Redeem at our partner stores:"}
          </Text>
          <View style={styles.partnerLogos}>
             <Text style={styles.partnerName}>{i18n.partnerList}</Text>
          </View>

          <TouchableOpacity 
            style={[styles.homeButton, { backgroundColor: '#E68A00', marginBottom: 15, marginTop: 10 }]}
            onPress={() => router.replace('/(tabs)/profile')}
          >
            <Text style={styles.homeButtonText}>{i18n.goToProfile || "Go to Profile"}</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={styles.homeButton}
            onPress={() => router.replace('/(tabs)')}
          >
            <Text style={styles.homeButtonText}>{i18n.backToHome || "Back to Home"}</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  const currentQuestion = questions[currentQuestionIndex];
  
  const questionDisplay = (currentQuestion.en && currentQuestion.zh) 
      ? (language === 'zh' ? currentQuestion.zh : currentQuestion.en)
      : currentQuestion;

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Stack.Screen options={{ 
        title: i18n.discountGame, 
        headerRight: () => <TranslateButton />,
        headerStyle: { backgroundColor: '#fbf5e5' },
        headerShadowVisible: false,
      }} />
      <View style={styles.header}>
        <View style={styles.badgeContainer}>
          <Text style={styles.questionCountText}>
            {i18n.question || "Question"} {currentQuestionIndex + 1} / {questions.length}
          </Text>
        </View>
        <View style={[styles.badgeContainer, { backgroundColor: '#e8f5e9' }]}>
          <Text style={[styles.scoreText, { color: '#2d5a27' }]}>
            {i18n.score || "Score"}: {score}
          </Text>
        </View>
      </View>

      <View style={styles.questionCard}>
        <Text style={styles.questionText}>{questionDisplay.question}</Text>
      </View>

      <View style={styles.optionsContainer}>
        {questionDisplay.options.map((option, index) => {
          const isSelected = selectedOption === option;
          const isCorrectOption = isSelected && isCorrect;
          const isWrongOption = isSelected && !isCorrect;

          let buttonStyle = styles.optionButton;
          let textStyle = styles.optionText;
          let iconName = "ellipse-outline";
          let iconColor = "#2d5a27";

          if (isSelected) {
            if (isCorrectOption) {
              buttonStyle = [styles.optionButton, styles.correctOption];
              textStyle = [styles.optionText, styles.selectedOptionText];
              iconName = "checkmark-circle";
              iconColor = "white";
            } else {
              buttonStyle = [styles.optionButton, styles.wrongOption];
              textStyle = [styles.optionText, styles.selectedOptionText];
              iconName = "close-circle";
              iconColor = "white";
            }
          }

          return (
            <TouchableOpacity
              key={index}
              style={buttonStyle}
              onPress={() => !selectedOption && handleAnswer(option)}
              disabled={selectedOption !== null}
              activeOpacity={0.8}
            >
              <Text style={textStyle}>{option}</Text>
              <Ionicons 
                name={iconName} 
                size={24} 
                color={iconColor} 
              />
            </TouchableOpacity>
          );
        })}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    padding: 20,
    backgroundColor: '#fbf5e5',
    justifyContent: 'center',
    paddingBottom: 50,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fbf5e5',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 30,
    marginTop: 10,
  },
  badgeContainer: {
    backgroundColor: '#fff',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#e6dfcf',
    shadowColor: '#2d5a27',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
  },
  questionCountText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#8c867a',
  },
  scoreText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#2d5a27',
  },
  questionCard: {
    backgroundColor: 'white',
    padding: 25,
    borderRadius: 25,
    marginBottom: 30,
    elevation: 5,
    shadowColor: '#2d5a27',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    borderWidth: 1,
    borderColor: '#e6dfcf',
    minHeight: 150,
    justifyContent: 'center',
  },
  questionText: {
    fontSize: 22,
    fontWeight: 'bold',
    textAlign: 'center',
    color: '#2d5a27',
    lineHeight: 32,
  },
  optionsContainer: {
    gap: 15,
  },
  optionButton: {
    backgroundColor: 'white',
    padding: 18,
    borderRadius: 30,
    borderWidth: 2,
    borderColor: '#e6dfcf',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  correctOption: {
    backgroundColor: '#4CAF50',
    borderColor: '#4CAF50',
  },
  wrongOption: {
    backgroundColor: '#F44336',
    borderColor: '#F44336',
  },
  optionText: {
    fontSize: 17,
    color: '#5d574a',
    fontWeight: '600',
    flex: 1,
  },
  selectedOptionText: {
    color: 'white',
  },
  resultCard: {
    backgroundColor: 'white',
    padding: 30,
    borderRadius: 30,
    alignItems: 'center',
    elevation: 10,
    shadowColor: '#2d5a27',
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.2,
    shadowRadius: 10,
    width: '100%',
  },
  resultTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    marginTop: 20,
    marginBottom: 10,
    color: '#2d5a27',
  },
  resultScore: {
    fontSize: 20,
    color: '#8c867a',
    marginBottom: 30,
    fontWeight: '600',
  },
  discountText: {
    fontSize: 18,
    textAlign: 'center',
    marginBottom: 20,
    color: '#4CAF50',
    fontWeight: 'bold',
  },
  codeContainer: {
    backgroundColor: '#f1f8e9',
    padding: 20,
    borderRadius: 20,
    borderWidth: 2,
    borderColor: '#4CAF50', // Keeps green for success/coupon feel
    width: '100%',
    alignItems: 'center',
    borderStyle: 'dashed',
    marginBottom: 25,
  },
  codeText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#2d5a27',
  },
  partnerText: {
    fontSize: 14,
    color: '#8c867a',
    marginBottom: 10,
  },
  partnerLogos: {
    backgroundColor: '#fafafa',
    padding: 15,
    borderRadius: 15,
    marginBottom: 25,
    width: '100%',
    alignItems: 'center',
  },
  partnerName: {
    fontWeight: '600',
    color: '#5d574a',
    textAlign: 'center',
    fontSize: 15,
  },
  homeButton: {
    backgroundColor: '#2d5a27',
    paddingVertical: 15,
    paddingHorizontal: 40,
    borderRadius: 30,
    minWidth: 200,
    alignItems: 'center',
    shadowColor: '#2d5a27',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
    elevation: 4,
  },
  homeButtonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
});
