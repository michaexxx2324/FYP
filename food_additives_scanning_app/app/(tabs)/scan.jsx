import { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Alert, ActivityIndicator } from 'react-native';
import { useLanguage } from '../../context/LanguageContext';
import Ionicons from '@expo/vector-icons/Ionicons';
import * as ImagePicker from 'expo-image-picker';
import { scanImage } from '../../services/ocrService';

export default function ScanScreen() {
  const { i18n } = useLanguage();
  const isVip = false; // Mock VIP status
  const [loading, setLoading] = useState(false);
  const [ocrResult, setOcrResult] = useState(null);

  const handleCamera = async () => {
    const permissionResult = await ImagePicker.requestCameraPermissionsAsync();
    if (permissionResult.granted === false) {
      Alert.alert("Permission to access camera is required!");
      return;
    }

    const result = await ImagePicker.launchCameraAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      quality: 1,
    });

    if (!result.canceled) {
      processImage(result.assets[0].uri);
    }
  };

  const handleAlbum = async () => {
    const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (permissionResult.granted === false) {
      Alert.alert("Permission to access camera roll is required!");
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      quality: 1,
    });

    if (!result.canceled) {
      processImage(result.assets[0].uri);
    }
  };

  const processImage = async (uri) => {
    setLoading(true);
    setOcrResult(null);
    try {
      const data = await scanImage(uri);
      console.log(data);
      if (data.IsErroredOnProcessing) {
        Alert.alert("OCR Error", data.ErrorMessage ? data.ErrorMessage[0] : "Unknown error");
      } else {
        const parsedText = data.ParsedResults && data.ParsedResults[0] ? data.ParsedResults[0].ParsedText : "No text found";
        setOcrResult(parsedText);
        Alert.alert("OCR Result", parsedText);
      }
    } catch (error) {
      Alert.alert("Error", "Failed to scan image");
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView style={styles.container}>
      {!isVip && (
        <TouchableOpacity style={styles.vipButton}>
          <Ionicons name="star" size={20} color="white" style={{ marginRight: 8 }} />
          <View>
            <Text style={styles.vipButtonText}>{i18n.upgradeVIP}</Text>
            <Text style={styles.vipButtonSubText}>{i18n.unlockFeatures}</Text>
          </View>
        </TouchableOpacity>
      )}

      <View style={styles.card}>
        <Text style={styles.cardTitle}>{i18n.ocrScan}</Text>
        <TouchableOpacity style={styles.actionButton} onPress={handleCamera}>
          <Ionicons name="camera" size={24} color="white" style={{ marginRight: 10 }} />
          <Text style={styles.actionButtonText}>{i18n.openCamera}</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.actionButton, styles.secondaryButton]} onPress={handleAlbum}>
          <Ionicons name="images" size={24} color="#333" style={{ marginRight: 10 }} />
          <Text style={styles.secondaryButtonText}>{i18n.selectAlbum}</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>{i18n.barcodeQrScan}</Text>
        <View style={styles.row}>
          <TouchableOpacity style={[styles.smallButton, { marginRight: 10 }]}>
            <Ionicons name="barcode" size={24} color="white" />
            <Text style={styles.smallButtonText}>{i18n.barcodeScan}</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.smallButton}>
            <Ionicons name="qr-code" size={24} color="white" />
            <Text style={styles.smallButtonText}>{i18n.qrCodeScan}</Text>
          </TouchableOpacity>
        </View>
      </View>

      {loading && <ActivityIndicator size="large" color="#0000ff" style={{ marginTop: 20 }} />}
      
      {ocrResult && (
        <View style={styles.resultContainer}>
          <Text style={styles.resultTitle}>Result:</Text>
          <Text style={styles.resultText}>{ocrResult}</Text>
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
    padding: 15,
  },
  vipButton: {
    backgroundColor: '#FFAC1C',
    padding: 15,
    borderRadius: 10,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
  },
  vipButtonText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 18,
  },
  vipButtonSubText: {
    color: 'white',
    fontSize: 12,
  },
  card: {
    backgroundColor: 'white',
    padding: 20,
    borderRadius: 10,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 15,
    color: '#333',
  },
  actionButton: {
    backgroundColor: '#4a90e2',
    padding: 15,
    borderRadius: 8,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 10,
  },
  actionButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  secondaryButton: {
    backgroundColor: '#e0e0e0',
  },
  secondaryButtonText: {
    color: '#333',
    fontSize: 16,
    fontWeight: 'bold',
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  smallButton: {
    flex: 1,
    backgroundColor: '#4a90e2',
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  smallButtonText: {
    color: 'white',
    marginTop: 5,
    fontSize: 12,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  resultContainer: {
    marginTop: 20,
    padding: 15,
    backgroundColor: 'white',
    borderRadius: 10,
  },
  resultTitle: {
    fontWeight: 'bold',
    marginBottom: 5,
  },
  resultText: {
    fontSize: 14,
  },
});
