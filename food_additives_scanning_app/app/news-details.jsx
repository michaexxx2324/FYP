import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TextInput, TouchableOpacity, KeyboardAvoidingView, Platform, Alert, useWindowDimensions } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useLanguage } from '../context/LanguageContext';
import { useAuth } from '../context/AuthContext';
import Ionicons from '@expo/vector-icons/Ionicons';
import TranslateButton from '../components/TranslateButton';
import RenderHtml from 'react-native-render-html';
import { API_URL } from '@env';

export default function NewsDetailsScreen() {
  const { i18n } = useLanguage();
  const { user } = useAuth();
  const params = useLocalSearchParams();
  const router = useRouter();
  const { width } = useWindowDimensions();
  
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState('');

  useEffect(() => {
    if (params.newsId) {
      fetchComments();
    }
  }, [params.newsId]);

  const fetchComments = async () => {
    try {
      const response = await fetch(`${API_URL}/GetComments?newsId=${params.newsId}`);
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
      
      const saveResponse = await fetch(`${API_URL}/SaveComment`, {
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
          {params.content ? (
            <RenderHtml
              contentWidth={width}
              source={{ html: params.content }}
              tagsStyles={{
                p: { fontSize: 16, lineHeight: 24, color: '#444', marginBottom: 10 },
                li: { fontSize: 16, lineHeight: 24, color: '#444' },
              }}
            />
          ) : (
            <Text style={styles.content}>No content available.</Text>
          )}

          <View style={styles.footerContainer}>
            <Text style={styles.footerText}>
              Content is from the Hong Kong Centre for Food Safety (Food and Environmental Hygiene Department)
            </Text>
          </View>
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
    backgroundColor: '#fbf5e5',
  },
  scrollView: {
    flex: 1,
  },
  header: {
    padding: 15,
    paddingTop: 50,
    backgroundColor: '#fbf5e5',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    elevation: 0,
    shadowColor: 'transparent',
  },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 5,
  },
  backText: {
    fontSize: 16,
    marginLeft: 5,
    color: '#2d5a27',
  },
  contentContainer: {
    padding: 20,
    paddingBottom: 0,
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 10,
    color: '#2d5a27',
  },
  date: {
    fontSize: 14,
    color: '#8c867a',
    marginBottom: 15,
  },
  divider: {
    height: 1,
    backgroundColor: '#e6dfcf',
    marginVertical: 15,
  },
  content: {
    fontSize: 16,
    lineHeight: 26,
    color: '#5d574a',
  },
  commentsSection: {
    padding: 20,
    backgroundColor: '#fff',
    marginTop: 20,
    paddingBottom: 40,
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    shadowColor: '#5d574a',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 5,
  },
  commentsHeader: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 20,
    color: '#2d5a27',
  },
  noComments: {
    fontStyle: 'italic',
    color: '#8c867a',
    textAlign: 'center',
    marginTop: 20,
  },
  commentItem: {
    backgroundColor: '#fbf5e5',
    padding: 15,
    borderRadius: 16,
    marginBottom: 15,
    borderWidth: 1,
    borderColor: '#e6dfcf',
  },
  commentUser: {
    fontWeight: 'bold',
    marginBottom: 5,
    color: '#2d5a27',
    fontSize: 14,
  },
  commentText: {
    fontSize: 15,
    marginBottom: 8,
    color: '#5d574a',
    lineHeight: 22,
  },
  commentMeta: {
    fontSize: 12,
    color: '#8c867a',
    textAlign: 'right',
  },
  inputContainer: {
    flexDirection: 'row',
    padding: 5,
    backgroundColor: '#fff',
    alignItems: 'center',
    borderRadius: 24,
    marginBottom: 25,
    borderWidth: 1,
    borderColor: '#d1cabb',
  },
  input: {
    flex: 1,
    backgroundColor: 'transparent',
    paddingHorizontal: 15,
    paddingVertical: 10,
    marginRight: 10,
    maxHeight: 100,
    fontSize: 16,
    color: '#5d574a',
  },
  sendButton: {
    backgroundColor: '#2d5a27',
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 5,
  },
  footerContainer: {
    marginTop: 30,
    paddingTop: 15,
    borderTopWidth: 1,
    borderTopColor: '#e6dfcf',
    paddingBottom: 10,
  },
  footerText: {
    fontSize: 12,
    color: '#8c867a',
    fontStyle: 'italic',
    textAlign: 'center',
  },
});
