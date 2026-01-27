import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput, Alert, ActivityIndicator } from 'react-native';
import { useLocalSearchParams, useRouter, Stack } from 'expo-router';
import Ionicons from '@expo/vector-icons/Ionicons';
import { useLanguage } from '../../context/LanguageContext';
import { useAuth } from '../../context/AuthContext';
import TranslateButton from '../../components/TranslateButton';

import { API_URL } from '@env';

// const API_URL = 'http://192.168.50.124:3000/api';

export default function PostDetailScreen() {
  const { id } = useLocalSearchParams();
  const { i18n } = useLanguage();
  const { user } = useAuth();
  const router = useRouter();

  const [post, setPost] = useState(null);
  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [comment, setComment] = useState('');
  const [isFavorite, setIsFavorite] = useState(false);

  useEffect(() => {
    fetchPost();
    fetchComments();
    if (user) {
      checkFavorite();
    }
  }, [id, user]);

  const fetchPost = async () => {
    try {
      const response = await fetch(`${API_URL}/blogs/${id}`);
      if (response.ok) {
        const data = await response.json();
        setPost(data);
      } else {
        Alert.alert(i18n.error, i18n.postNotFound || "Post not found");
        router.back();
      }
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const fetchComments = async () => {
    try {
      const response = await fetch(`${API_URL}/blog-comments/${id}`);
      if (response.ok) {
        const data = await response.json();
        setComments(data);
      }
    } catch (error) {
      console.error(error);
    }
  };

  const checkFavorite = async () => {
    try {
      const response = await fetch(`${API_URL}/favorites/check/${user.userId}/${id}`);
      if (response.ok) {
        const data = await response.json();
        setIsFavorite(data.isFavorite);
      }
    } catch (error) {
      console.error(error);
    }
  };

  const handleComment = async () => {
    if (!user) {
      Alert.alert(i18n.error, i18n.pleaseLoginFirst);
      return;
    }
    if (!comment.trim()) return;

    try {
      const response = await fetch(`${API_URL}/blog-comments`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          postId: id,
          userId: user.userId,
          userName: user.username,
          text: comment,
          district: "Unknown" 
        }),
      });

      if (response.ok) {
        setComment('');
        fetchComments(); 
      }
    } catch (error) {
      console.error(error);
    }
  };

  const toggleFavorite = async () => {
    if (!user) {
      Alert.alert(i18n.error, i18n.pleaseLoginFirst);
      return;
    }

    try {
      const method = isFavorite ? 'DELETE' : 'POST';
      const response = await fetch(`${API_URL}/favorites`, {
        method: method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: user.userId,
          postId: id
        }),
      });

      if (response.ok) {
        setIsFavorite(!isFavorite);
      }
    } catch (error) {
      console.error(error);
    }
  };

  const handleReport = () => {
    Alert.alert("Info", "Reporting feature is currently unavailable.");
  };

  if (loading) {
    return <ActivityIndicator size="large" color="#4CAF50" style={{ marginTop: 50 }} />;
  }

  if (!post) return null;

  return (
    <ScrollView style={styles.container}>
      <Stack.Screen options={{
        headerRight: () => <TranslateButton />,
        title: i18n.blog || "Blog"
      }} />
      <View style={styles.postCard}>
        <Text style={styles.title}>{post.title}</Text>
        <View style={styles.metaRow}>
          <Text style={styles.meta}>User: {post.authorId}</Text>
          <Text style={styles.meta}>{new Date(post.createdAt).toLocaleDateString()}</Text>
        </View>
        <Text style={styles.content}>{post.content}</Text>
        
        <View style={styles.actionRow}>
          <TouchableOpacity 
            style={[styles.actionButton, isFavorite && styles.favActive]} 
            onPress={toggleFavorite}
          >
            <Ionicons name={isFavorite ? "heart" : "heart-outline"} size={20} color={isFavorite ? "white" : "#FF4081"} />
            <Text style={[styles.actionText, isFavorite && { color: 'white' }]}>
              {isFavorite ? (i18n.favorited || "Favorited") : (i18n.addToFavorite || "Add to Favorite")}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.reportButton} onPress={handleReport}>
            <Ionicons name="flag-outline" size={20} color="#666" />
            <Text style={styles.reportText}>{i18n.report || "Report"}</Text>
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.commentsSection}>
        <Text style={styles.sectionTitle}>{i18n.comments || "Comments"}</Text>
        
        {comments.map((c, index) => (
          <View key={index} style={styles.commentItem}>
            <Text style={styles.commentUser}>{c.userName}</Text>
            <Text style={styles.commentText}>{c.text}</Text>
            <Text style={styles.commentDate}>{new Date(c.createdAt).toLocaleDateString()}</Text>
          </View>
        ))}

        <View style={styles.inputContainer}>
          <TextInput
            style={styles.input}
            placeholder={i18n.writeComment || "Write a comment..."}
            value={comment}
            onChangeText={setComment}
          />
          <TouchableOpacity onPress={handleComment}>
            <Ionicons name="send" size={24} color="#4CAF50" />
          </TouchableOpacity>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  postCard: {
    backgroundColor: 'white',
    padding: 20,
    marginBottom: 10,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 10,
    color: '#333',
  },
  metaRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 15,
  },
  meta: {
    color: '#888',
    fontSize: 14,
  },
  content: {
    fontSize: 16,
    lineHeight: 24,
    color: '#444',
    marginBottom: 20,
  },
  actionRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    borderTopWidth: 1,
    borderTopColor: '#eee',
    paddingTop: 15,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#FF4081',
  },
  favActive: {
    backgroundColor: '#FF4081',
  },
  actionText: {
    color: '#FF4081',
    marginLeft: 5,
    fontWeight: 'bold',
  },
  reportButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 8,
  },
  reportText: {
    color: '#666',
    marginLeft: 5,
  },
  commentsSection: {
    backgroundColor: 'white',
    padding: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 15,
  },
  commentItem: {
    marginBottom: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
    paddingBottom: 10,
  },
  commentUser: {
    fontWeight: 'bold',
    marginBottom: 3,
  },
  commentText: {
    color: '#333',
    marginBottom: 3,
  },
  commentDate: {
    fontSize: 12,
    color: '#999',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 10,
    borderTopWidth: 1,
    borderTopColor: '#eee',
    paddingTop: 15,
  },
  input: {
    flex: 1,
    backgroundColor: '#f9f9f9',
    borderRadius: 20,
    paddingHorizontal: 15,
    paddingVertical: 8,
    marginRight: 10,
  },
});
