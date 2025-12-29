import { useState, useRef } from 'react';
import { View, Text, StyleSheet, Button, TouchableOpacity, Image, ScrollView, Alert, ActivityIndicator } from 'react-native';
import { CameraView, useCameraPermissions } from 'expo-camera';
import * as ImagePicker from 'expo-image-picker';
// import TextRecognition from '@react-native-ml-kit/text-recognition'; // Removed ML Kit
import { useLanguage } from '../../context/LanguageContext';
import Ionicons from '@expo/vector-icons/Ionicons';
import { getProductByBarcode } from '../../services/productService';

const POE_API_KEY = 'kyUmyep70nikyCi7RnLPIdPqanivHp6omXaV3-Y7MEk';
const POE_BOT_NAME = 'gpt-5-nano'; // User requested model

export default function ScanScreen() {
  const { i18n } = useLanguage();
  const [permission, requestPermission] = useCameraPermissions();
  const [scanned, setScanned] = useState(false);
  const [mode, setMode] = useState('barcode'); // 'barcode' or 'ocr'
  const [ocrText, setOcrText] = useState('');
  const [imageUri, setImageUri] = useState(null);
  const [productData, setProductData] = useState(null);
  const [loadingProduct, setLoadingProduct] = useState(false);
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
      // User said "the x in the Data will be a 13 digit number"
      // Assuming data IS the number.
      
      const product = await getProductByBarcode(data);
      
      if (product) {
        setProductData(product);
      } else {
        Alert.alert("Not Found", "Product not found in database.");
      }
    } catch (error) {
      Alert.alert("Error", "Failed to fetch product data. Check connection.");
    } finally {
      setLoadingProduct(false);
    }
  };

  const takePictureAndRecognize = async () => {
    if (cameraRef.current) {
      try {
        const photo = await cameraRef.current.takePictureAsync({ base64: true });
        setImageUri(photo.uri);
        processImage(photo.base64);
      } catch (error) {
        console.error(error);
      }
    }
  };

  const pickImageAndRecognize = async () => {
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      quality: 1,
      base64: true,
    });

    if (!result.canceled) {
      setImageUri(result.assets[0].uri);
      processImage(result.assets[0].base64);
    }
  };

  const processImage = async (base64Image) => {
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
                { type: 'text', text: 'Extract the text from this food label image exactly as it appears. Output ONLY the extracted text. Do not add any conversational filler, analysis, or additional feedback.' },
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
        setOcrText(data.choices[0].message.content);
      } else {
        setOcrText(i18n.noTextFound);
      }
    } catch (error) {
      console.error("AI Error:", error);
      setOcrText("Error: " + error.message);
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

      {imageUri ? (
        <View style={styles.resultContainer}>
          <Image source={{ uri: imageUri }} style={styles.previewImage} />
          <ScrollView style={styles.textScroll}>
            <Text style={styles.resultText}>{ocrText}</Text>
          </ScrollView>
          <Button title={i18n.scanAgain} onPress={() => setImageUri(null)} />
        </View>
      ) : (
        <CameraView
          style={styles.camera}
          ref={cameraRef}
          onBarcodeScanned={mode === 'barcode' && !scanned ? handleBarcodeScanned : undefined}
          barcodeScannerSettings={{
            barcodeTypes: ["qr", "ean13", "upc_e"],
          }}
        >
          <View style={styles.buttonContainer}>
            {mode === 'barcode' && scanned && !productData && !loadingProduct && (
              <Button title={i18n.tapToScanAgain} onPress={() => setScanned(false)} />
            )}
            
            {loadingProduct && (
               <View style={styles.loadingOverlay}>
                 <ActivityIndicator size="large" color="#0000ff" />
                 <Text style={{color: 'white'}}>Searching Database...</Text>
               </View>
            )}

            {productData && (
              <View style={styles.productCard}>
                <Text style={styles.productTitle}>Product Found</Text>
                <Text>Name: {productData.itemName}</Text>
                <Text>Code: {productData.itemCode}</Text>
                <Text>Nutrition: {productData.nutritionInformation}</Text>
                <Button title="Scan Another" onPress={() => { setScanned(false); setProductData(null); }} />
              </View>
            )}

            {mode === 'ocr' && (
              <View style={styles.ocrControls}>
                <TouchableOpacity style={styles.captureBtn} onPress={takePictureAndRecognize}>
                  <Text style={styles.btnText}>{i18n.captureText}</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.galleryBtn} onPress={pickImageAndRecognize}>
                  <Text style={styles.btnText}>{i18n.pickImage}</Text>
                </TouchableOpacity>
              </View>
            )}
          </View>
        </CameraView>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  camera: { flex: 1 },
  controls: { flexDirection: 'row', justifyContent: 'space-around', padding: 10, backgroundColor: '#fff' },
  buttonContainer: { flex: 1, flexDirection: 'row', backgroundColor: 'transparent', margin: 64, justifyContent: 'center', alignItems: 'flex-end' },
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
    bottom: 50,
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
