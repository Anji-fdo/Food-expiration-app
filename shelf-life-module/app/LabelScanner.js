import React, { useState } from 'react';
import {
  View, Text, Image, StyleSheet, Alert,
  TouchableOpacity, TextInput, ActivityIndicator,
  ScrollView, SafeAreaView, Dimensions
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { useRouter } from 'expo-router';
import * as Notifications from 'expo-notifications';
import AsyncStorage from '@react-native-async-storage/async-storage';

const { width } = Dimensions.get('window');

// Notification handler setup
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

// Function to save notification to local history
const saveNotificationToHistory = async (notification) => {
  try {
    const existing = await AsyncStorage.getItem('notificationHistory');
    const history = existing ? JSON.parse(existing) : [];
    history.unshift(notification);
    await AsyncStorage.setItem('notificationHistory', JSON.stringify(history));
  } catch (error) {
    console.error('Error saving notification history:', error);
  }
};

export default function LabelScanner() {
  const [image, setImage] = useState(null);
  const [detectedDate, setDetectedDate] = useState('');
  const [daysLeft, setDaysLeft] = useState(0);
  const [expiryData, setExpiryData] = useState(null);
  const [productName, setProductName] = useState('');
  const [isScanning, setIsScanning] = useState(false);
  const [showProductInput, setShowProductInput] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [imageBase64, setImageBase64] = useState(null);
  const [currentSlide, setCurrentSlide] = useState(0);
  const router = useRouter();

  const sliderImages = [
    require('../assets/images/sl.jpg'),
    require('../assets/images/sl3.jpg'),
    require('../assets/images/sl4.jpg'),
  ];

  const defaultCameraImage = require('../assets/images/exp.jpg');

  // Capture label from camera
  const captureImage = async () => {
    const permission = await ImagePicker.requestCameraPermissionsAsync();
    if (!permission.granted) return Alert.alert('Permission Required', 'Camera access needed.');

    const result = await ImagePicker.launchCameraAsync({
      base64: true, quality: 0.8, allowsEditing: true, aspect: [4, 3]
    });

    if (!result.canceled) {
      const uri = result.assets[0].uri;
      const base64 = result.assets[0].base64;
      setImage(uri);
      setImageBase64(base64);
      scanText(base64, uri);
    }
  };

  // Pick label from gallery
  const pickFromGallery = async () => {
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted) return Alert.alert('Permission Required', 'Gallery access needed.');

    const result = await ImagePicker.launchImageLibraryAsync({
      base64: true, quality: 0.8, allowsEditing: true, aspect: [4, 3]
    });

    if (!result.canceled) {
      const uri = result.assets[0].uri;
      const base64 = result.assets[0].base64;
      setImage(uri);
      setImageBase64(base64);
      scanText(base64, uri);
    }
  };

  // Scan label via backend
  const scanText = async (base64, imageUri) => {
    setIsScanning(true);
    setDetectedDate('');
    setExpiryData(null);
    setShowProductInput(false);
    setProductName('');

    try {
      const response = await fetch('http://98.88.90.67:5000/scan-label', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          image: base64,
          productName: 'Temporary Scan',
          image_uri: imageUri
        }),
      });

      if (!response.ok) throw new Error('Server error while scanning.');

      const data = await response.json();
      const { expiresOn, daysLeft, notifyOneDayBefore } = data;

      if (expiresOn) {
        const dateStr = expiresOn.split(' ')[0];
        setDetectedDate(dateStr);
        setDaysLeft(daysLeft);
        setExpiryData({ expiresOn, daysLeft, notifyOneDayBefore, imageUri, base64 });
        setShowProductInput(true);

        // Schedule local notification one day before expiry
        if (notifyOneDayBefore) {
          const trigger = new Date(notifyOneDayBefore);
          await Notifications.scheduleNotificationAsync({
            content: {
              title: '🕒 Expiry Reminder',
              body: `Your product will expire soon (${dateStr}). Check it now!`,
              sound: 'default',
            },
            trigger,
          });

          await saveNotificationToHistory({
            title: '🕒 Expiry Reminder',
            body: `Product will expire on ${dateStr}`,
            time: trigger.toISOString(),
          });
        }

        Alert.alert('Success', `Detected expiry: ${dateStr} (${daysLeft} days left)`);
      } else {
        Alert.alert('No Date Found', 'Could not detect expiry date.');
      }
    } catch (error) {
      console.error('Scan error:', error);
      Alert.alert('Error', error.message);
    } finally {
      setIsScanning(false);
    }
  };

  const resetScan = () => {
    setImage(null);
    setImageBase64(null);
    setDetectedDate('');
    setDaysLeft(0);
    setExpiryData(null);
    setProductName('');
    setShowProductInput(false);
  };

  const saveWithProductName = async () => {
    if (!productName.trim()) return Alert.alert('Error', 'Enter product name.');

    if (!expiryData || !imageBase64)
      return Alert.alert('Error', 'No expiry data to save.');

    setIsSaving(true);
    try {
      const response = await fetch('http://98.88.90.67:5000/scan-label', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          image: imageBase64,
          productName: productName.trim(),
          image_uri: expiryData.imageUri,
        }),
      });

      if (!response.ok) throw new Error('Save failed.');

      Alert.alert(
        'Saved!',
        `${productName} expires on ${detectedDate} (${daysLeft} days left)`,
        [
          { text: 'View History', onPress: () => router.push('/HistoryScreen') },
          { text: 'OK', onPress: resetScan },
        ]
      );
    } catch (err) {
      Alert.alert('Error', err.message);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => router.push('/Main')}>
          <Text style={styles.backIcon}>←</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Label Scanner</Text>
        <TouchableOpacity style={styles.historyButton} onPress={() => router.push('/NotificationHistoryScreen')}>
          <Text style={styles.historyText}>🔔 Notifications</Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {!showProductInput && !image && (
          <View style={styles.scanCard}>
            <Image source={defaultCameraImage} style={styles.defaultImage} resizeMode="contain" />
            <Text style={styles.scanTitle}>Scan Food Labels</Text>
            <Text style={styles.scanSubtitle}>Capture or upload to detect expiry dates</Text>

            <TouchableOpacity style={styles.primaryButton} onPress={captureImage}>
              <Text style={styles.primaryButtonText}>📸 Take Photo</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.secondaryButton} onPress={pickFromGallery}>
              <Text style={styles.secondaryButtonText}>📁 Choose from Gallery</Text>
            </TouchableOpacity>
          </View>
        )}

        {image && (
          <View style={styles.imageCard}>
            <Image source={{ uri: image }} style={styles.previewImage} />
            {isScanning && (
              <View style={styles.loadingOverlay}>
                <ActivityIndicator size="large" color="#7CB342" />
                <Text style={styles.loadingText}>Scanning...</Text>
              </View>
            )}
          </View>
        )}

        {showProductInput && (
          <View style={styles.productCard}>
            <Text style={styles.resultTitle}>Expires on {detectedDate}</Text>
            <Text style={styles.resultDays}>{daysLeft} days remaining</Text>

            <TextInput
              style={styles.textInput}
              value={productName}
              onChangeText={setProductName}
              placeholder="Enter product name..."
            />

            <TouchableOpacity
              style={[styles.saveButton, isSaving && styles.disabledButton]}
              onPress={saveWithProductName}
              disabled={isSaving}
            >
              {isSaving ? (
                <ActivityIndicator size="small" color="#fff" />
              ) : (
                <Text style={styles.saveButtonText}>Save Item</Text>
              )}
            </TouchableOpacity>

            <TouchableOpacity style={styles.resetButton} onPress={resetScan}>
              <Text style={styles.resetButtonText}>Scan Another</Text>
            </TouchableOpacity>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#7CB342' },
  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingTop: 60, paddingHorizontal: 20, paddingBottom: 20,
  },
  backButton: {
    backgroundColor: 'rgba(255,255,255,0.2)', borderRadius: 20, padding: 10,
  },
  backIcon: { color: '#fff', fontSize: 20, fontWeight: 'bold' },
  headerTitle: { color: '#fff', fontSize: 18, fontWeight: 'bold' },
  historyButton: {
    backgroundColor: 'rgba(255,255,255,0.2)', borderRadius: 20,
    paddingHorizontal: 12, paddingVertical: 6,
  },
  historyText: { color: '#fff', fontWeight: '600', fontSize: 14 },
  content: { paddingHorizontal: 20 },
  scanCard: {
    backgroundColor: '#fff', borderRadius: 20, padding: 30, alignItems: 'center', marginBottom: 20,
  },
  defaultImage: { width: 160, height: 160, marginBottom: 20 },
  scanTitle: { fontSize: 22, fontWeight: '700', color: '#333', marginBottom: 8 },
  scanSubtitle: { fontSize: 16, color: '#666', marginBottom: 20, textAlign: 'center' },
  primaryButton: {
    backgroundColor: '#7CB342', borderRadius: 25, paddingVertical: 14,
    alignItems: 'center', marginBottom: 10, width: '100%',
  },
  primaryButtonText: { color: '#fff', fontWeight: '600', fontSize: 16 },
  secondaryButton: {
    borderColor: '#7CB342', borderWidth: 2, borderRadius: 25,
    paddingVertical: 14, alignItems: 'center', width: '100%',
  },
  secondaryButtonText: { color: '#7CB342', fontWeight: '600', fontSize: 16 },
  imageCard: { borderRadius: 20, overflow: 'hidden', backgroundColor: '#fff', marginBottom: 20 },
  previewImage: { width: '100%', height: 250 },
  loadingOverlay: {
    position: 'absolute', top: 0, left: 0, right: 0, bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', alignItems: 'center',
  },
  loadingText: { color: '#fff', marginTop: 10, fontWeight: '600' },
  productCard: { backgroundColor: '#fff', borderRadius: 20, padding: 25, marginBottom: 20 },
  resultTitle: { fontSize: 20, fontWeight: '700', color: '#333', marginBottom: 8 },
  resultDays: { color: '#7CB342', fontWeight: '600', marginBottom: 15 },
  textInput: {
    borderWidth: 1, borderColor: '#ccc', borderRadius: 12,
    padding: 14, fontSize: 16, backgroundColor: '#f8f8f8', marginBottom: 15,
  },
  saveButton: {
    backgroundColor: '#7CB342', paddingVertical: 16, borderRadius: 25,
    alignItems: 'center', marginBottom: 12,
  },
  saveButtonText: { color: '#fff', fontWeight: '600', fontSize: 16 },
  resetButton: {
    borderColor: '#7CB342', borderWidth: 2, borderRadius: 25,
    paddingVertical: 14, alignItems: 'center',
  },
  resetButtonText: { color: '#7CB342', fontWeight: '600', fontSize: 16 },
  disabledButton: { opacity: 0.6 },
});
