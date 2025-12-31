import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TextInput, TouchableOpacity, KeyboardAvoidingView, Platform, Alert } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useLanguage } from '../context/LanguageContext';
import { useAuth } from '../context/AuthContext';
import Ionicons from '@expo/vector-icons/Ionicons';
import TranslateButton from '../components/TranslateButton';

export default function NewsDetailsScreen() {
  const { i18n } = useLanguage();
  const { user } = useAuth();
  const params = useLocalSearchParams();
  const router = useRouter();
  
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState('');

  useEffect(() => {
    if (params.newsId) {
      fetchComments();
    }
  }, [params.newsId]);

  const fetchComments = async () => {
    try {
      const response = await fetch(`http://192.168.50.124:3000/api/GetComments?newsId=${params.newsId}`);
      if (response.ok) {
        const data = await response.json();
        setComments(data);
      }
    } catch (error) {
      console.error("Failed to fetch comments:", error);
    }
  };

  const handleSendComment = async () => {
    if (!newComment.trim()) return;

    if (!user) {
      Alert.alert(i18n.error, i18n.pleaseLoginFirst);
      return;
    }

    const commentData = {
      userId: user.userId,
      userName: user.username,
      comments: newComment,
      time: new Date().toLocaleString(),
      district: 'Hong Kong', 
      newsId: params.newsId
    };

    try {
      
      const saveResponse = await fetch('http://192.168.50.124:3000/api/SaveComment', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(commentData),
      });

      if (saveResponse.ok) {
        
        fetchComments();
        setNewComment('');
      } else {
        Alert.alert(i18n.error, i18n.saveError);
      }
    } catch (error) {
      console.error("Error saving comment:", error);
      Alert.alert(i18n.error, i18n.connectError);
    }
  };

  return (
    <KeyboardAvoidingView 
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
      keyboardVerticalOffset={100}
    >
      <ScrollView style={styles.scrollView}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <Ionicons name="arrow-back" size={24} color="black" />
            <Text style={styles.backText}>{i18n.return}</Text>
          </TouchableOpacity>
          <TranslateButton />
        </View>

        <View style={styles.contentContainer}>
          <Text style={styles.title}>{params.title}</Text>
          <Text style={styles.date}>{new Date().toLocaleDateString()}</Text>
          <View style={styles.divider} />
          <Text style={styles.content}>{params.content}</Text>
          
          <Text style={styles.content}>
            {'\n'}
            The Centre for Food Safety (CFS) of the Food and Environmental Hygiene Department announced today that a sample of the above-mentioned product was found to contain a pathogen, Salmonella. The CFS is following up on the case.
            {'\n\n'}
            "The CFS collected the sample from a supermarket in Causeway Bay for testing under its routine Food Surveillance Programme. The test result showed the presence of Salmonella in 25 grams of the sample," a CFS spokesman said.
            {'\n\n'}
            "Salmonella infection may cause fever and gastrointestinal upset such as vomiting, abdominal pain and diarrhoea. The effects on infants, young children, the elderly and persons with a weak immune system could be more severe and may even lead to death."
          </Text>
        </View>

        <View style={styles.commentsSection}>
          <Text style={styles.commentsHeader}>{i18n.comments}</Text>

          
          <View style={styles.inputContainer}>
            <TextInput
              style={styles.input}
              placeholder={i18n.writeComment}
              value={newComment}
              onChangeText={setNewComment}
              multiline
            />
            <TouchableOpacity onPress={handleSendComment} style={styles.sendButton}>
              <Ionicons name="send" size={24} color="white" />
            </TouchableOpacity>
          </View>
          
          {comments.length === 0 ? (
            <Text style={styles.noComments}>{i18n.noComments}</Text>
          ) : (
            comments.map((comment) => (
              <View key={comment.id} style={styles.commentItem}>
                <Text style={styles.commentUser}>{comment.userName}:</Text>
                <Text style={styles.commentText}>{comment.text}</Text>
                <Text style={styles.commentMeta}>
                  {comment.time} ({comment.district})
                </Text>
              </View>
            ))
          )}
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  scrollView: {
    flex: 1,
  },
  header: {
    padding: 15,
    paddingTop: 50,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  backText: {
    fontSize: 16,
    marginLeft: 5,
  },
  contentContainer: {
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 10,
    color: '#333',
  },
  date: {
    color: '#666',
    marginBottom: 10,
  },
  divider: {
    height: 1,
    backgroundColor: '#eee',
    marginVertical: 15,
  },
  content: {
    fontSize: 16,
    lineHeight: 24,
    color: '#444',
  },
  commentsSection: {
    padding: 20,
    backgroundColor: '#f9f9f9',
    marginTop: 20,
    paddingBottom: 40,
  },
  commentsHeader: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 15,
  },
  noComments: {
    fontStyle: 'italic',
    color: '#888',
    textAlign: 'center',
    marginTop: 10,
  },
  commentItem: {
    backgroundColor: 'white',
    padding: 15,
    borderRadius: 10,
    marginBottom: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  commentUser: {
    fontWeight: 'bold',
    marginBottom: 5,
    color: '#2c3e50',
  },
  commentText: {
    fontSize: 15,
    marginBottom: 8,
    color: '#333',
  },
  commentMeta: {
    fontSize: 12,
    color: '#999',
    textAlign: 'right',
  },
  inputContainer: {
    flexDirection: 'row',
    padding: 10,
    backgroundColor: 'white',
    alignItems: 'center',
    borderRadius: 10,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#ddd',
  },
  input: {
    flex: 1,
    backgroundColor: '#f0f0f0',
    borderRadius: 20,
    paddingHorizontal: 15,
    paddingVertical: 10,
    marginRight: 10,
    maxHeight: 100,
  },
  sendButton: {
    backgroundColor: '#007AFF',
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
