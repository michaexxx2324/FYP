import React, { useState } from 'react';
import { View, Text, TextInput, StyleSheet, TouchableOpacity, Alert, ScrollView } from 'react-native';
import { useRouter, Stack } from 'expo-router';
import { useLanguage } from '../../context/LanguageContext';
import { useAuth } from '../../context/AuthContext';
import TranslateButton from '../../components/TranslateButton';
import { API_URL } from '@env';

export default function CreatePostScreen() {
  const { i18n } = useLanguage();
  const { user } = useAuth();
  const router = useRouter();
  
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (!title.trim() || !content.trim()) {
      Alert.alert(i18n.error, i18n.fillAllFields || "Please fill all fields");
      return;
    }

    setSubmitting(true);
    try {
      const response = await fetch(`${API_URL}/blogs`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title,
          content,
          authorId: user.userId
        }),
      });

      if (response.ok) {
        Alert.alert(i18n.success, i18n.postCreated || "Post created successfully", [
          { text: 'OK', onPress: () => router.back() }
        ]);
      } else {
        Alert.alert(i18n.error, i18n.errorOccurred || "An error occurred");
      }
    } catch (error) {
      console.error(error);
      Alert.alert(i18n.error, i18n.networkError);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <ScrollView style={styles.container}>
      <Stack.Screen options={{
        headerRight: () => <TranslateButton />,
        title: i18n.createPost || "Create Post",
        headerStyle: { backgroundColor: '#fbf5e5' },
        headerShadowVisible: false,
      }} />
      <Text style={styles.label}>{i18n.title || "Title"}</Text>
      <TextInput
        style={styles.input}
        value={title}
        onChangeText={setTitle}
        placeholder={i18n.enterTitle || "Enter title..."}
      />

      <Text style={styles.label}>{i18n.content || "Content"}</Text>
      <TextInput
        style={[styles.input, styles.textArea]}
        value={content}
        onChangeText={setContent}
        placeholder={i18n.enterContent || "Enter content..."}
        multiline
        textAlignVertical="top"
      />

      <TouchableOpacity 
        style={[styles.button, submitting && styles.disabledButton]}
        onPress={handleSubmit}
        disabled={submitting}
      >
        <Text style={styles.buttonText}>
          {submitting ? (i18n.posting || "Posting...") : (i18n.submit || "Submit")}
        </Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: 'white',
  },
  label: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 5,
    color: '#333',
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    marginBottom: 20,
    backgroundColor: '#f9f9f9',
  },
  textArea: {
    height: 200,
  },
  button: {
    backgroundColor: '#4CAF50',
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
  },
  disabledButton: {
    backgroundColor: '#a5d6a7',
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
});
