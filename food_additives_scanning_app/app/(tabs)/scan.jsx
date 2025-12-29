import { useState, useRef } from 'react';
import { View, Text, StyleSheet, Button, TouchableOpacity, Image, ScrollView, Alert } from 'react-native';
import { CameraView, useCameraPermissions } from 'expo-camera';
import * as ImagePicker from 'expo-image-picker';
import TextRecognition from '@react-native-ml-kit/text-recognition';
import { useLanguage } from '../../context/LanguageContext';

export default function ScanScreen() {
  const { i18n } = useLanguage();
  const [permission, requestPermission] = useCameraPermissions();
  const [scanned, setScanned] = useState(false);
  const [mode, setMode] = useState('barcode'); // 'barcode' or 'ocr'
  const [ocrText, setOcrText] = useState('');
  const [imageUri, setImageUri] = useState(null);
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

  const handleBarcodeScanned = ({ type, data }) => {
    setScanned(true);
    Alert.alert(i18n.scannedData, `Type: ${type}\nData: ${data}`);
  };

  const takePictureAndRecognize = async () => {
    if (cameraRef.current) {
      try {
        const photo = await cameraRef.current.takePictureAsync();
        setImageUri(photo.uri);
        processImage(photo.uri);
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
    });

    if (!result.canceled) {
      setImageUri(result.assets[0].uri);
      processImage(result.assets[0].uri);
    }
  };

  const processImage = async (uri) => {
    setOcrText(i18n.processing);
    
    try {
      const result = await TextRecognition.recognize(uri);
      if (result.text) {
        setOcrText(result.text);
      } else {
        setOcrText(i18n.noTextFound);
      }
    } catch (error) {
      console.error("OCR Error:", error);
      setOcrText(i18n.noTextFound + ": " + error.message);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.controls}>
        <Button 
          title={i18n.scanMode} 
          onPress={() => { setMode('barcode'); setScanned(false); setOcrText(''); setImageUri(null); }} 
          color={mode === 'barcode' ? 'blue' : 'gray'}
        />
        <Button 
          title={i18n.ocrMode} 
          onPress={() => { setMode('ocr'); setOcrText(''); setImageUri(null); }} 
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
            {mode === 'barcode' && scanned && (
              <Button title={i18n.tapToScanAgain} onPress={() => setScanned(false)} />
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
});
