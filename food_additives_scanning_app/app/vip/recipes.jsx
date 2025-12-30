import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image, ScrollView, ActivityIndicator, Alert } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { useLanguage } from '../../context/LanguageContext';
import { useAuth } from '../../context/AuthContext';
import Ionicons from '@expo/vector-icons/Ionicons';

const POE_API_KEY = 'kyUmyep70nikyCi7RnLPIdPqanivHp6omXaV3-Y7MEk';
const POE_BOT_NAME = 'gpt-5-nano';

export default function RecipesScreen() {
  const { i18n } = useLanguage();
  const { user } = useAuth();
  const [imageUri, setImageUri] = useState(null);
  const [loading, setLoading] = useState(false);
  const [recipe, setRecipe] = useState(null);

  const takePicture = async () => {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert(i18n.permissionNeeded, i18n.permissionNeeded);
      return;
    }

    const result = await ImagePicker.launchCameraAsync({
      allowsEditing: true,
      quality: 0.5,
      base64: true,
    });

    if (!result.canceled) {
      setImageUri(result.assets[0].uri);
      generateRecipe(result.assets[0].base64);
    }
  };

  const generateRecipe = async (base64Image) => {
    setLoading(true);
    setRecipe(null);

    try {
      const allergies = user?.allergies?.join(', ') || 'None';
      const diet = user?.dietPreferences?.join(', ') || 'None';

      const prompt = `
        Identify the cooking ingredients in this image.
        User Profile:
        - Allergies: ${allergies}
        - Diet: ${diet}

        Task:
        1. List the identified ingredients.
        2. Generate a HEALTHY recipe using these ingredients.
        3. Ensure the recipe does NOT violate the user's diet or allergies if possible.
        4. If the ingredients themselves contain allergens (e.g., user allergic to nuts, and image has nuts), provide a WARNING but still generate a recipe (maybe suggest alternatives).

        Output Format (JSON):
        {
          "ingredients": ["List of ingredients found"],
          "recipeName": "Name of the dish",
          "instructions": ["Step 1", "Step 2"...],
          "healthBenefits": "Why this is healthy",
          "warning": "Warning message if allergens found, else null"
        }
        
        Provide output in BOTH English and Traditional Chinese (繁體中文) for all text fields.
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
            {
              role: 'user',
              content: [
                { type: 'text', text: prompt },
                { type: 'image_url', image_url: { url: `data:image/jpeg;base64,${base64Image}` } }
              ]
            }
          ]
        })
      });

      const data = await response.json();
      if (data.choices && data.choices.length > 0) {
        const content = data.choices[0].message.content;
        // Extract JSON
        const jsonMatch = content.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          setRecipe(JSON.parse(jsonMatch[0]));
        } else {
          // Fallback
          setRecipe({ recipeName: "Error parsing", instructions: [content] });
        }
      }
    } catch (error) {
      console.error(error);
      Alert.alert(i18n.error, i18n.networkError);
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.cameraSection}>
        {imageUri ? (
          <Image source={{ uri: imageUri }} style={styles.previewImage} />
        ) : (
          <View style={styles.placeholder}>
            <Ionicons name="restaurant-outline" size={60} color="#ccc" />
            <Text style={styles.placeholderText}>{i18n.takePhotoIngredients || "Take Photo of Ingredients"}</Text>
          </View>
        )}
        
        <TouchableOpacity style={styles.cameraButton} onPress={takePicture}>
          <Ionicons name="camera" size={24} color="white" />
          <Text style={styles.cameraButtonText}>{i18n.takePhoto || "Take Photo"}</Text>
        </TouchableOpacity>
      </View>

      {loading && (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#FFD700" />
          <Text>{i18n.generatingRecipe || "Generating Recipe..."}</Text>
        </View>
      )}

      {recipe && (
        <View style={styles.resultContainer}>
          {recipe.warning && (
            <View style={styles.warningBox}>
              <Ionicons name="warning" size={24} color="white" />
              <Text style={styles.warningText}>{recipe.warning}</Text>
            </View>
          )}

          <Text style={styles.recipeTitle}>{recipe.recipeName}</Text>
          
          <View style={styles.section}>
            <Text style={styles.sectionHeader}>{i18n.ingredientsList || "Ingredients"}</Text>
            {recipe.ingredients && recipe.ingredients.map((ing, i) => (
              <Text key={i} style={styles.listItem}>• {ing}</Text>
            ))}
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionHeader}>{i18n.instructions || "Instructions"}</Text>
            {recipe.instructions && recipe.instructions.map((step, i) => (
              <Text key={i} style={styles.listItem}>{i + 1}. {step}</Text>
            ))}
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionHeader}>{i18n.healthBenefits || "Health Benefits"}</Text>
            <Text style={styles.bodyText}>{recipe.healthBenefits}</Text>
          </View>
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f5f5f5' },
  cameraSection: { alignItems: 'center', padding: 20, backgroundColor: 'white' },
  previewImage: { width: 200, height: 200, borderRadius: 10, marginBottom: 20 },
  placeholder: { width: 200, height: 200, backgroundColor: '#eee', borderRadius: 10, justifyContent: 'center', alignItems: 'center', marginBottom: 20 },
  placeholderText: { marginTop: 10, color: '#888' },
  cameraButton: { flexDirection: 'row', backgroundColor: '#FFD700', padding: 15, borderRadius: 25, alignItems: 'center' },
  cameraButtonText: { color: 'white', fontWeight: 'bold', marginLeft: 10 },
  loadingContainer: { padding: 20, alignItems: 'center' },
  resultContainer: { padding: 20 },
  warningBox: { backgroundColor: '#FF5252', padding: 15, borderRadius: 10, flexDirection: 'row', alignItems: 'center', marginBottom: 20 },
  warningText: { color: 'white', marginLeft: 10, flex: 1 },
  recipeTitle: { fontSize: 24, fontWeight: 'bold', marginBottom: 20, color: '#333' },
  section: { marginBottom: 20, backgroundColor: 'white', padding: 15, borderRadius: 10 },
  sectionHeader: { fontSize: 18, fontWeight: 'bold', marginBottom: 10, color: '#FFD700' },
  listItem: { fontSize: 16, marginBottom: 5, lineHeight: 24 },
  bodyText: { fontSize: 16, lineHeight: 24 },
});
