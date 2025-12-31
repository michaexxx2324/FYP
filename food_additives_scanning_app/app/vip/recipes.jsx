import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image, ScrollView, ActivityIndicator, Alert } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { useLanguage } from '../../context/LanguageContext';
import { useAuth } from '../../context/AuthContext';
import Ionicons from '@expo/vector-icons/Ionicons';

const POE_API_KEY = 'kyUmyep70nikyCi7RnLPIdPqanivHp6omXaV3-Y7MEk';
const POE_BOT_NAME = 'gpt-5-nano';

export default function RecipesScreen() {
  const { i18n, language } = useLanguage();
  const { user } = useAuth();
  const [imageUri, setImageUri] = useState(null);
  const [loading, setLoading] = useState(false);
  const [recipe, setRecipe] = useState(null);

  const displayRecipe = recipe && (recipe.english || recipe.traditional_chinese)
    ? (language === 'zh' ? recipe.traditional_chinese : recipe.english)
    : recipe;

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

  const pickImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert(i18n.permissionNeeded, i18n.permissionNeeded);
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
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
        1. List ALL identified ingredients from the image.
        2. CRITICAL SAFETY CHECK: Compare identified ingredients against User Allergies.
           - If ANY identified ingredient is an allergen for the user (e.g., image has eggs, user is allergic to eggs), you MUST provide a STRONG WARNING in the "warning" field.
           - This warning is required even if you generate a recipe that excludes the allergen.
        3. Generate a HEALTHY recipe.
           - If an allergen is present in the ingredients, suggest a recipe that uses ALTERNATIVES or excludes that ingredient.
           - Explicitly mention the substitution in the recipe.

        Output Format (JSON):
        {
          "english": {
            "ingredients": ["List of ingredients found"],
            "recipeName": "Name of the dish",
            "instructions": ["Step 1", "Step 2"...],
            "healthBenefits": "Why this is healthy",
            "warning": "Warning message if allergens found in image, else null"
          },
          "traditional_chinese": {
            "ingredients": ["List of ingredients found"],
            "recipeName": "Name of the dish",
            "instructions": ["Step 1", "Step 2"...],
            "healthBenefits": "Why this is healthy",
            "warning": "Warning message if allergens found in image, else null"
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
        
        let parsedRecipe = null;
        
        
        try {
            parsedRecipe = JSON.parse(content);
        } catch (e) {
            
            const codeBlockMatch = content.match(/```(?:json)?\s*([\s\S]*?)\s*```/);
            if (codeBlockMatch) {
                try {
                    parsedRecipe = JSON.parse(codeBlockMatch[1]);
                } catch (e2) {
                    console.warn("Failed to parse JSON from code block");
                }
            }
            
            
            if (!parsedRecipe) {
                const firstOpen = content.indexOf('{');
                const lastClose = content.lastIndexOf('}');
                if (firstOpen !== -1 && lastClose !== -1) {
                    try {
                        const jsonString = content.substring(firstOpen, lastClose + 1);
                        parsedRecipe = JSON.parse(jsonString);
                    } catch (e3) {
                        console.warn("Failed to parse JSON from substring");
                    }
                }
            }

             
            if (!parsedRecipe) {
                const jsonMatches = content.match(/\{[\s\S]*?\}/g);
                if (jsonMatches && jsonMatches.length >= 2) {
                    try {
                        
                        const part1 = JSON.parse(jsonMatches[0]);
                        const part2 = JSON.parse(jsonMatches[1]);
                        
                        
                        const isPart1Chinese = /[\u4e00-\u9fa5]/.test(JSON.stringify(part1));
                        
                        if (isPart1Chinese) {
                            parsedRecipe = { english: part2, traditional_chinese: part1 };
                        } else {
                            parsedRecipe = { english: part1, traditional_chinese: part2 };
                        }
                    } catch (e4) {
                        console.warn("Failed to parse multiple JSON blocks");
                    }
                } else if (jsonMatches && jsonMatches.length === 1) {
                     try {
                        const part = JSON.parse(jsonMatches[0]);
                        parsedRecipe = { english: part, traditional_chinese: part };
                    } catch (e5) {
                        console.warn("Failed to parse single JSON block from matches");
                    }
                }
            }
        }

        if (parsedRecipe) {
            setRecipe(parsedRecipe);
        } else {
            console.warn("Failed to parse inner JSON from AI content. Content:", content);
            setRecipe({ recipeName: "Analysis Result", instructions: [content] });
        }
      } else {
        throw new Error("No content received from AI Service");
      }

    } catch (error) {
      console.error("Recipe Generation Failed:", error);
      Alert.alert(i18n.error || "Error", error.message || "Failed to generate recipe");
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
        
        <View style={{ flexDirection: 'row', gap: 10 }}>
          <TouchableOpacity style={styles.cameraButton} onPress={takePicture}>
            <Ionicons name="camera" size={24} color="white" />
            <Text style={styles.cameraButtonText}>{i18n.takePhoto || "Take Photo"}</Text>
          </TouchableOpacity>

          <TouchableOpacity style={[styles.cameraButton, { backgroundColor: '#4CAF50' }]} onPress={pickImage}>
            <Ionicons name="images" size={24} color="white" />
            <Text style={styles.cameraButtonText}>{i18n.selectAlbum || "Select Album"}</Text>
          </TouchableOpacity>
        </View>
      </View>

      {loading && (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#FFD700" />
          <Text>{i18n.generatingRecipe || "Generating Recipe..."}</Text>
        </View>
      )}

      {displayRecipe && (
        <View style={styles.resultContainer}>
          {displayRecipe.warning ? (
            <View style={styles.warningBox}>
              <Ionicons name="warning" size={24} color="white" />
              <Text style={styles.warningText}>{displayRecipe.warning}</Text>
            </View>
          ) : (
            <View style={[styles.warningBox, { backgroundColor: '#4CAF50' }]}>
              <Ionicons name="checkmark-circle" size={24} color="white" />
              <Text style={styles.warningText}>{i18n.safeToConsume || "Safe to consume! No allergens detected."}</Text>
            </View>
          )}

          <Text style={styles.recipeTitle}>{displayRecipe.recipeName}</Text>
          
          <View style={styles.section}>
            <Text style={styles.sectionHeader}>{i18n.ingredientsList || "Ingredients"}</Text>
            {displayRecipe.ingredients && displayRecipe.ingredients.map((ing, i) => (
              <Text key={i} style={styles.listItem}>• {ing}</Text>
            ))}
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionHeader}>{i18n.instructions || "Instructions"}</Text>
            {displayRecipe.instructions && displayRecipe.instructions.map((step, i) => (
              <Text key={i} style={styles.listItem}>{i + 1}. {step}</Text>
            ))}
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionHeader}>{i18n.healthBenefits || "Health Benefits"}</Text>
            <Text style={styles.bodyText}>{displayRecipe.healthBenefits}</Text>
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
