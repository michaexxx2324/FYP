import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator, Alert, ScrollView, Image } from 'react-native';
import { useRouter, Stack } from 'expo-router';
import { useLanguage } from '../context/LanguageContext';
import { useAuth } from '../context/AuthContext';
import Ionicons from '@expo/vector-icons/Ionicons';
import TranslateButton from '../components/TranslateButton';

import { API_URL } from '@env';

// const API_URL = 'http://192.168.50.124:3000/api';

export default function QuizGameScreen() {
  const { i18n } = useLanguage();
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
    fetchQuestions();
  }, []);

  const fetchQuestions = async () => {
    try {
      const response = await fetch(`${API_URL}/quiz/questions`);
      const data = await response.json();
      setQuestions(data);
      setLoading(false);
    } catch (error) {
      console.error("Failed to fetch questions", error);
      Alert.alert(i18n.error, i18n.networkError);
      setLoading(false);
    }
  };

  const handleAnswer = (option) => {
    const currentQuestion = questions[currentQuestionIndex];
    const correct = option === currentQuestion.answer;
    
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

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Stack.Screen options={{ title: i18n.discountGame, headerRight: () => <TranslateButton /> }} />
      <View style={styles.header}>
        <Text style={styles.questionCount}>
          {i18n.question || "Question"} {currentQuestionIndex + 1} / {questions.length}
        </Text>
        <Text style={styles.score}>
          {i18n.score || "Score"}: {score}
        </Text>
      </View>

      <View style={styles.questionCard}>
        <Text style={styles.questionText}>{currentQuestion.question}</Text>
      </View>

      <View style={styles.optionsContainer}>
        {currentQuestion.options.map((option, index) => {
          let buttonStyle = styles.optionButton;
          if (selectedOption === option) {
            buttonStyle = isCorrect ? styles.correctOption : styles.wrongOption;
          }

          return (
            <TouchableOpacity
              key={index}
              style={buttonStyle}
              onPress={() => !selectedOption && handleAnswer(option)}
              disabled={selectedOption !== null}
            >
              <Text style={styles.optionText}>{option}</Text>
              {selectedOption === option && (
                <Ionicons 
                  name={isCorrect ? "checkmark-circle" : "close-circle"} 
                  size={24} 
                  color="white" 
                />
              )}
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
    backgroundColor: '#f5f5f5',
    justifyContent: 'center',
    paddingBottom: 50,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  questionCount: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#666',
  },
  score: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#4CAF50',
  },
  questionCard: {
    backgroundColor: 'white',
    padding: 20,
    borderRadius: 15,
    marginBottom: 30,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  questionText: {
    fontSize: 20,
    fontWeight: 'bold',
    textAlign: 'center',
    color: '#333',
  },
  optionsContainer: {
    gap: 15,
  },
  optionButton: {
    backgroundColor: 'white',
    padding: 15,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#ddd',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
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
    fontSize: 16,
    color: '#333',
  },
  resultCard: {
    backgroundColor: 'white',
    padding: 30,
    borderRadius: 20,
    alignItems: 'center',
    elevation: 5,
  },
  resultTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    marginTop: 20,
    marginBottom: 10,
    color: '#333',
  },
  resultScore: {
    fontSize: 18,
    color: '#666',
    marginBottom: 30,
  },
  discountText: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 10,
  },
  codeContainer: {
    backgroundColor: '#f0f0f0',
    padding: 15,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: '#4CAF50',
    marginBottom: 20,
    width: '100%',
    alignItems: 'center',
  },
  codeText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#4CAF50',
    letterSpacing: 2,
  },
  partnerText: {
    fontSize: 14,
    color: '#888',
    marginBottom: 10,
  },
  partnerName: {
    fontWeight: 'bold',
    color: '#555',
    textAlign: 'center',
  },
  homeButton: {
    backgroundColor: '#2196F3',
    paddingVertical: 12,
    paddingHorizontal: 30,
    borderRadius: 25,
    marginTop: 20,
  },
  homeButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
});
