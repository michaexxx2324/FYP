import { useState, useRef } from 'react';
import { View, Text, StyleSheet, Button, TouchableOpacity, Image, ScrollView, Alert, ActivityIndicator } from 'react-native';
import { CameraView, useCameraPermissions } from 'expo-camera';
import * as ImagePicker from 'expo-image-picker';
// import TextRecognition from '@react-native-ml-kit/text-recognition'; // Removed ML Kit
import { useLanguage } from '../../context/LanguageContext';
import Ionicons from '@expo/vector-icons/Ionicons';
import { getProductByBarcode } from '../../services/productService';
import { useHistory } from '../../context/HistoryContext';

const POE_API_KEY = 'kyUmyep70nikyCi7RnLPIdPqanivHp6omXaV3-Y7MEk';
const POE_BOT_NAME = 'gpt-5-nano'; // User requested model

import { useRouter } from 'expo-router';

export default function ScanScreen() {
  const { i18n } = useLanguage();
  const { addToHistory } = useHistory();
  const router = useRouter();
  const [permission, requestPermission] = useCameraPermissions();
  const [scanned, setScanned] = useState(false);
  const [mode, setMode] = useState('barcode'); // 'barcode' or 'ocr'
  const [ocrText, setOcrText] = useState('');
  const [imageUri, setImageUri] = useState(null);
  const [productData, setProductData] = useState(null);
  const [loadingProduct, setLoadingProduct] = useState(false);
  const [processingOcr, setProcessingOcr] = useState(false);
  const cameraRef = useRef(null);

  if (!permission) return <View />;
  if (!permission.granted) {
    return (
      <View style={styles.container}>
        <Text>{i18n.permissionNeeded}</Text>
        <Button onPress={requestPermission} title={i18n.grantPermission} />
      </View>
    );
  }

  const handleBarcodeScanned = async ({ type, data }) => {
    setScanned(true);
    setLoadingProduct(true);
    setProductData(null);

    try {
      // Extract 13 digit number if possible, or just use data
      let barcode = data;
      
      // If data is a URL or contains non-numeric characters, try to extract the longest number
      if (isNaN(data) || data.startsWith('http')) {
        const matches = data.match(/\d{8,14}/g); // Look for 8 to 14 digit numbers
        if (matches && matches.length > 0) {
          // Pick the longest match, usually the EAN code
          barcode = matches.reduce((a, b) => a.length > b.length ? a : b);
          console.log(`Extracted barcode ${barcode} from URL/String: ${data}`);
        }
      }
      
      const product = await getProductByBarcode(barcode);
      
      if (product) {
        addToHistory(product);
        // Navigate directly to product details
        router.push({
          pathname: '/product-details',
          params: { 
            itemName: product.itemName, 
            itemCode: product.itemCode, 
            nutritionInformation: product.nutritionInformation,
            warning: product.warning,
            healthAnalysis: product.healthAnalysis
          }
        });
        // Reset scan state after a short delay so when they come back it's ready
        setTimeout(() => setScanned(false), 1000);
      } else {
        Alert.alert(i18n.notFound, i18n.productNotFound, [
          { text: "OK", onPress: () => setScanned(false) }
        ]);
      }
    } catch (error) {
      Alert.alert(i18n.error, i18n.fetchError, [
        { text: "OK", onPress: () => setScanned(false) }
      ]);
    } finally {
      setLoadingProduct(false);
    }
  };

  const takePictureAndRecognize = async () => {
    try {
      // Use ImagePicker.launchCameraAsync to enable the system's built-in crop UI (allowsEditing: true)
      const { status } = await ImagePicker.requestCameraPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert(i18n.permissionNeeded, i18n.permissionNeeded);
        return;
      }

      const result = await ImagePicker.launchCameraAsync({
        allowsEditing: true, // Enable cropping
        quality: 1,
        base64: true,
      });

      if (!result.canceled) {
        setImageUri(result.assets[0].uri);
        processImage(result.assets[0].base64);
      }
    } catch (error) {
      console.error("Camera Error:", error);
      Alert.alert(i18n.error, i18n.cameraError);
    }
  };

  const pickImageAndRecognize = async () => {
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: true, // Enable cropping
      quality: 1,
      base64: true,
    });

    if (!result.canceled) {
      setImageUri(result.assets[0].uri);
      processImage(result.assets[0].base64);
    }
  };

  const processImage = async (base64Image) => {
    setProcessingOcr(true);
    setOcrText(i18n.processing);
    
    try {
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
                { type: 'text', text: 'Extract text from this image, specifically focusing on food ingredients, nutrition information, and allergen warnings. IGNORE any QR codes, barcodes, or marketing URLs. If the text is in any language other than English (e.g., Japanese, Chinese), you MUST translate it to English. Return ONLY the final English text. Do not include the original text. Do not include any explanations.' },
                { type: 'image_url', image_url: { url: `data:image/jpeg;base64,${base64Image}` } }
              ]
            }
          ]
        })
      });

      const data = await response.json();
      
      if (data.error) {
         throw new Error(data.error.message);
      }

      if (data.choices && data.choices.length > 0) {
        const content = data.choices[0].message.content;
        setOcrText(content);
        
        // Navigate to Edit Screen with OCR result
        router.push({
          pathname: '/edit',
          params: { ocrText: content }
        });
      } else {
        setOcrText(i18n.noTextFound);
        Alert.alert(i18n.info, i18n.noTextFound);
      }
    } catch (error) {
      console.error("AI Error:", error);
      setOcrText("Error: " + error.message);
      Alert.alert(i18n.error, error.message);
    } finally {
      setProcessingOcr(false);
      setImageUri(null); // Reset image uri so we don't show preview
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.controls}>
        <Button 
          title={i18n.scanMode} 
          onPress={() => { setMode('barcode'); setScanned(false); setOcrText(''); setImageUri(null); setProductData(null); }} 
          color={mode === 'barcode' ? 'blue' : 'gray'}
        />
        <Button 
          title={i18n.ocrMode} 
          onPress={() => { setMode('ocr'); setOcrText(''); setImageUri(null); setProductData(null); }} 
          color={mode === 'ocr' ? 'blue' : 'gray'}
        />
      </View>

      {/* Removed Preview UI Block */}
      
      {mode === 'barcode' ? (
        <CameraView
          style={styles.camera}
          ref={cameraRef}
          onBarcodeScanned={!scanned ? handleBarcodeScanned : undefined}
          barcodeScannerSettings={{
            barcodeTypes: ["qr", "ean13", "ean8", "upc_a", "upc_e", "code128", "code39"],
          }}
        >
          <View style={styles.buttonContainer}>
            {scanned && !productData && !loadingProduct && (
              <Button title={i18n.tapToScanAgain} onPress={() => setScanned(false)} />
            )}
            
            {loadingProduct && (
               <View style={styles.loadingOverlay}>
                 <ActivityIndicator size="large" color="#0000ff" />
                 <Text style={{color: 'white'}}>{i18n.searchingDatabase}</Text>
               </View>
            )}
          </View>
        </CameraView>
      ) : (
        <View style={styles.ocrContainer}>
          {processingOcr ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color="#0000ff" />
              <Text style={styles.loadingText}>{i18n.processing}</Text>
            </View>
          ) : (
            <View style={styles.ocrControlsCentered}>
              <TouchableOpacity style={styles.captureBtnLarge} onPress={takePictureAndRecognize}>
                <Ionicons name="camera" size={40} color="white" />
                <Text style={styles.btnTextLarge}>{i18n.captureText}</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.galleryBtnLarge} onPress={pickImageAndRecognize}>
                <Ionicons name="images" size={40} color="white" />
                <Text style={styles.btnTextLarge}>{i18n.pickImage}</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  camera: { flex: 1 },
  controls: { flexDirection: 'row', justifyContent: 'space-around', padding: 10, backgroundColor: '#fff' },
  buttonContainer: { flex: 1, flexDirection: 'row', backgroundColor: 'transparent', margin: 64, justifyContent: 'center', alignItems: 'flex-end' },
  
  // OCR Styles
  ocrContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#f0f0f0', paddingBottom: 50 },
  ocrControlsCentered: { width: '100%', padding: 20, gap: 20 },
  captureBtnLarge: { backgroundColor: '#007AFF', padding: 30, borderRadius: 15, alignItems: 'center', flexDirection: 'row', justifyContent: 'center', gap: 10 },
  galleryBtnLarge: { backgroundColor: '#34C759', padding: 30, borderRadius: 15, alignItems: 'center', flexDirection: 'row', justifyContent: 'center', gap: 10 },
  btnTextLarge: { color: 'white', fontWeight: 'bold', fontSize: 20 },
  loadingContainer: { alignItems: 'center' },
  loadingText: { marginTop: 10, fontSize: 18, color: '#666' },

  // Existing Styles
  ocrControls: { flexDirection: 'row', gap: 20 },
  captureBtn: { backgroundColor: 'blue', padding: 15, borderRadius: 10 },
  galleryBtn: { backgroundColor: 'green', padding: 15, borderRadius: 10 },
  btnText: { color: 'white', fontWeight: 'bold' },
  resultContainer: { flex: 1, padding: 20, alignItems: 'center' },
  previewImage: { width: 200, height: 200, marginBottom: 20, borderRadius: 10 },
  textScroll: { flex: 1, width: '100%', marginBottom: 20 },
  resultText: { fontSize: 16 },
  productCard: {
    position: 'absolute',
    bottom: 80,
    left: 20,
    right: 20,
    backgroundColor: 'white',
    padding: 20,
    borderRadius: 10,
    elevation: 5,
  },
  productTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  loadingOverlay: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: [{translateX: -50}, {translateY: -50}],
    backgroundColor: 'rgba(0,0,0,0.7)',
    padding: 20,
    borderRadius: 10,
    alignItems: 'center',
  }
});
