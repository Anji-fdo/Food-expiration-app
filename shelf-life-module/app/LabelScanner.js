import React, { useState } from 'react';
import { View, Text, Button, Image, StyleSheet, Alert, TouchableOpacity, TextInput, ActivityIndicator, ScrollView, SafeAreaView, Dimensions } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { useRouter } from 'expo-router';
import moment from 'moment';
import * as Notifications from 'expo-notifications';
import AsyncStorage from '@react-native-async-storage/async-storage';


Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});


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


const { width } = Dimensions.get('window');

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



  React.useEffect(() => {
  (async () => {
    const { status } = await Notifications.requestPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission Required', 'Please allow notifications to get expiry alerts.');
    }
  })();
}, []);

  // PUT YOUR IMAGE PATHS HERE - Replace these with your actual image paths
  const sliderImages = [
    require('../assets/images/sl.jpg'), // Replace with your first image path
    require('../assets/images/sl3.jpg'), // Replace with your second image path  
    require('../assets/images/sl4.jpg'), // Replace with your third image path
  ];

  // Default camera icon image - you can replace this with your preferred default image
  const defaultCameraImage = require('../assets/images/exp.jpg'); // Replace with your default image path

  // Open camera to capture label
  const captureImage = async () => {
    const permission = await ImagePicker.requestCameraPermissionsAsync();
    if (!permission.granted) {
      Alert.alert('Permission Required', 'Camera permission is needed to scan labels.');
      return;
    }

    const result = await ImagePicker.launchCameraAsync({ 
      base64: true, 
      quality: 0.8,
      allowsEditing: true,
      aspect: [4, 3]
    });
    if (!result.canceled) {
      const uri = result.assets[0].uri;
      const base64 = result.assets[0].base64;
      setImage(uri);
      setImageBase64(base64);
      console.log('Captured image base64 (first 100 chars):', base64.substring(0, 100));
      scanText(base64, uri);
    }
  };

  // Open gallery to select image
  const pickFromGallery = async () => {
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted) {
      Alert.alert('Permission Required', 'Media library permission is needed to select images.');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({ 
      base64: true, 
      quality: 0.8,
      allowsEditing: true,
      aspect: [4, 3]
    });
    if (!result.canceled) {
      const uri = result.assets[0].uri;
      const base64 = result.assets[0].base64;
      setImage(uri);
      setImageBase64(base64);
      console.log('Gallery image base64 (first 100 chars):', base64.substring(0, 100));
      scanText(base64, uri);
    }
  };

  // Scan text using server-side processing - UPDATED to not save to database yet
  const scanText = async (base64, imageUri) => {
    setIsScanning(true);
    setDetectedDate('');
    setExpiryData(null);
    setShowProductInput(false);
    setProductName('');
    
    try {
      console.log('Sending scan request to /scan-label with base64 length:', base64.length);
      const response = await fetch('http://98.88.90.67:5000/scan-label', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          image: base64,
          productName: 'Temporary Scan', // Temporary name, will be replaced when user saves
          image_uri: imageUri
        }),
      });

      console.log('Server response status:', response.status);
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => null);
        const errorMessage = errorData?.error || `Server error: ${response.status}`;
        throw new Error(errorMessage);
      }

      const data = await response.json();
      console.log('Server response data:', data);
      
      if (data.error) {
        throw new Error(data.error);
      }

      const { expiresOn, daysLeft, likelyExpiresOn, notifyOneDayBefore, scannedText } = data;
      
      if (expiresOn) {
        const dateStr = expiresOn.split(' ')[0]; // Extract YYYY-MM-DD
        setDetectedDate(dateStr);
        setDaysLeft(daysLeft);
        setExpiryData({
          expiresOn,
          daysLeft,
          likelyExpiresOn,
          notifyOneDayBefore,
          imageUri,
          scannedText,
          base64: base64 // Store base64 for saving later
        });
        setShowProductInput(true);
        
        Alert.alert(
          'Date Detected Successfully!', 
          `Expiration Date: ${dateStr}\nDays Left: ${daysLeft} days`,
          [{ text: 'OK', style: 'default' }]
        );
      } else {
        Alert.alert(
          'No Date Found', 
          'No valid expiration date detected. Please ensure:\n• The label is clearly visible\n• The date is in DD/MM/YYYY format\n• There is good lighting\n• The image is in focus',
          [
            { text: 'Try Again', onPress: resetScan },
            { text: 'OK', style: 'default' }
          ]
        );
      }
    } catch (err) {
      console.error('Scan error:', err);
      
      let errorMessage = err.message;
      if (errorMessage.includes('Network request failed')) {
        errorMessage = 'Cannot connect to server. Please check your connection and ensure the server is running.';
      } else if (errorMessage.includes('No valid expiry date found')) {
        errorMessage = 'No date found in the image. Try capturing a clearer image with better lighting.';
      }
      
      Alert.alert('Scan Failed', errorMessage, [
        { text: 'Try Again', onPress: resetScan },
        { text: 'OK', style: 'default' }
      ]);
    } finally {
      setIsScanning(false);
    }
  };

  // Reset scan state
  const resetScan = () => {
    setImage(null);
    setImageBase64(null);
    setDetectedDate('');
    setDaysLeft(0);
    setExpiryData(null);
    setProductName('');
    setShowProductInput(false);
  };

  // UPDATED: Save label food data to database with proper product name and image
  const saveWithProductName = async () => {
    if (!productName.trim()) {
      Alert.alert('Product Name Required', 'Please enter a product name before saving.');
      return;
    }

    if (!expiryData || !imageBase64) {
      Alert.alert('Error', 'No expiry data or image to save.');
      return;
    }

    setIsSaving(true);
    
    try {
      // Call /scan-label again with the proper product name to save to database
      const response = await fetch('http://98.88.90.67:5000/scan-label', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          image: imageBase64,
          productName: productName.trim(), // Use the user-entered product name
          image_uri: expiryData.imageUri
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => null);
        const errorMessage = errorData?.error || 'Failed to save to database';
        throw new Error(errorMessage);
      }

      const result = await response.json();
      console.log('Saved to database:', result);

     // 🕒 Schedule Notifications (fixed)
try {
  const expiryDate = moment(detectedDate, 'YYYY-MM-DD').toDate();
  const daysLeftNow = moment(expiryDate).diff(moment(), 'days');

  // Immediate notification now
  await Notifications.scheduleNotificationAsync({
    content: {
      title: `${productName} - Freshness Update`,
      body: `${productName} will expire in ${daysLeftNow} days.`,
      sound: 'default',
    },
    trigger: null, // show immediately
  });

  await saveNotificationToHistory({
    title: `${productName} - Freshness Update`,
    body: `${productName} will expire in ${daysLeftNow} days.`,
    time: new Date().toISOString(),
  });

  // --- Schedule 3 days before expiry ---
  const threeDaysBefore = new Date(expiryDate.getTime() - 3 * 24 * 60 * 60 * 1000);
  if (threeDaysBefore > new Date()) {
    await Notifications.scheduleNotificationAsync({
      content: {
        title: `${productName} - Reminder`,
        body: `${productName} will expire in 3 days!`,
        sound: 'default',
      },
      trigger: threeDaysBefore,
    });
  }

  // --- Schedule 1 day before expiry ---
  const oneDayBefore = new Date(expiryDate.getTime() - 1 * 24 * 60 * 60 * 1000);
  if (oneDayBefore > new Date()) {
    await Notifications.scheduleNotificationAsync({
      content: {
        title: `${productName} - Reminder`,
        body: `${productName} will expire tomorrow!`,
        sound: 'default',
      },
      trigger: oneDayBefore,
    });
  }

  console.log('Notifications scheduled successfully!');
} catch (error) {
  console.error('Error scheduling notifications:', error);
}


      Alert.alert(
        'Saved Successfully!', 
        `${productName} expires on ${detectedDate} (${expiryData.daysLeft} days left)\n\nItem has been saved to your history.`,
        [
          { text: 'View History', onPress: () => router.push('/HistoryScreen') },
          { text: 'Scan Another', onPress: resetScan },
          { text: 'OK', style: 'default' }
        ]
      );
    } catch (err) {
      console.error('Error saving to database:', err);
      Alert.alert(
        'Save Error', 
        `Failed to save to database: ${err.message}\n\nThe item may not appear in your history.`,
        [
          { text: 'Try Again', onPress: saveWithProductName },
          { text: 'OK', style: 'default' }
        ]
      );
    } finally {
      setIsSaving(false);
    }
  };

  const handleSlideChange = (event) => {
    const slide = Math.ceil(event.nativeEvent.contentOffset.x / width);
    if (slide !== currentSlide) {
      setCurrentSlide(slide);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => router.push('/Main')}>
          <Text style={styles.backIcon}>≡</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Label Scanner</Text>
        <TouchableOpacity style={styles.inventoryButton} onPress={() => router.push('/HistoryScreen')}>
          <Text style={styles.inventoryText}>Inventory</Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {!showProductInput && !image ? (
          /* Welcome Card */
          <View style={styles.scanCard}>
            <View style={styles.scanIconContainer}>
              <Image 
                source={defaultCameraImage} // Use your default image here
                style={styles.defaultImage}
                resizeMode="contain"
              />
            </View>
            <Text style={styles.scanTitle}>Scan Food Labels</Text>
            <Text style={styles.scanSubtitle}>Capture or select an image to detect expiration dates</Text>
            
            <View style={styles.buttonContainer}>
              <TouchableOpacity 
                style={styles.primaryButton}
                onPress={captureImage}
                disabled={isScanning}
              >
                <Text style={styles.primaryButtonText}>📸 Take Photo</Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={styles.secondaryButton}
                onPress={pickFromGallery}
                disabled={isScanning}
              >
                <Text style={styles.secondaryButtonText}>📁 Choose from Gallery</Text>
              </TouchableOpacity>
            </View>
          </View>
        ) : null}

        {image && (
          <View style={styles.imageCard}>
            <Image source={{ uri: image }} style={styles.previewImage} />
            {isScanning && (
              <View style={styles.loadingOverlay}>
                <ActivityIndicator size="large" color="#FF8C00" />
                <Text style={styles.loadingText}>Scanning label...</Text>
              </View>
            )}
          </View>
        )}

        {detectedDate && !showProductInput && (
          <View style={styles.resultCard}>
            <Text style={styles.resultTitle}>Date Detected!</Text>
            <Text style={styles.resultDate}>{detectedDate}</Text>
            <Text style={styles.resultDays}>{daysLeft} days remaining</Text>
          </View>
        )}

        {showProductInput && (
          <View style={styles.productCard}>
            <View style={styles.dateHeader}>
              <Text style={styles.dateLabel}>Expires on</Text>
              <Text style={styles.dateValue}>{detectedDate}</Text>
              <Text style={styles.daysValue}>{daysLeft} days left</Text>
            </View>
            
            <View style={styles.inputSection}>
              <Text style={styles.inputLabel}>Product Name</Text>
              <TextInput
                style={styles.textInput}
                value={productName}
                onChangeText={setProductName}
                placeholder="Enter product name..."
                placeholderTextColor="#B0B0B0"
                editable={!isSaving}
              />
            </View>
            
            <TouchableOpacity 
              style={[styles.saveButton, isSaving && styles.disabledButton]}
              onPress={saveWithProductName}
              disabled={isSaving}
            >
              {isSaving ? (
                <View style={styles.savingContainer}>
                  <ActivityIndicator size="small" color="#ffffff" />
                  <Text style={styles.saveButtonText}>Saving...</Text>
                </View>
              ) : (
                <Text style={styles.saveButtonText}>Save Item</Text>
              )}
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={styles.resetButton}
              onPress={resetScan}
              disabled={isSaving}
            >
              <Text style={styles.resetButtonText}>Scan Another Item</Text>
            </TouchableOpacity>
          </View>
        )}
      </ScrollView>

      {/* Image Slider */}
      {!showProductInput && (
        <View style={styles.sliderContainer}>
          <ScrollView
            horizontal
            pagingEnabled
            showsHorizontalScrollIndicator={false}
            onMomentumScrollEnd={handleSlideChange}
            style={styles.slider}
          >
            {sliderImages.map((imageSource, index) => (
              <View key={index} style={styles.slideContainer}>
                <Image 
                  source={imageSource} 
                  style={styles.sliderImage}
                  resizeMode="cover"
                />
              </View>
            ))}
          </ScrollView>
          
          {/* Slider Dots */}
          <View style={styles.dotsContainer}>
            {sliderImages.map((_, index) => (
              <View 
                key={index}
                style={[
                  styles.dot, 
                  currentSlide === index && styles.activeDot
                ]} 
              />
            ))}
          </View>
        </View>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#7CB342',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 10,
    paddingBottom: 20,
  },
  backButton: {
    width: 30,
    height: 30,
    justifyContent: 'center',
    alignItems: 'center',
  },
  backIcon: {
    color: '#fff',
    fontSize: 20,
    fontWeight: 'bold',
  },
  headerTitle: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
  },
  inventoryButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 15,
  },
  inventoryText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '500',
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
  },
  scanCard: {
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 30,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 5,
    marginBottom: 20,
  },
  scanIconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#FFF3E0',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
    overflow: 'hidden',
  },
  defaultImage: {
    width: 150,
    height: 150,
  },
  scanTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#333',
    marginBottom: 8,
    textAlign: 'center',
  },
  scanSubtitle: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginBottom: 30,
    lineHeight: 22,
  },
  buttonContainer: {
    width: '100%',
    gap: 12,
  },
  primaryButton: {
    backgroundColor: '#7CB342',
    paddingVertical: 16,
    borderRadius: 25,
    alignItems: 'center',
  },
  primaryButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  secondaryButton: {
    backgroundColor: 'transparent',
    paddingVertical: 16,
    borderRadius: 25,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#7CB342',
  },
  secondaryButtonText: {
    color: '#7CB342',
    fontSize: 16,
    fontWeight: '600',
  },
  imageCard: {
    backgroundColor: '#fff',
    borderRadius: 20,
    overflow: 'hidden',
    marginBottom: 20,
    position: 'relative',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 5,
  },
  previewImage: {
    width: '100%',
    height: 250,
    backgroundColor: '#f5f5f5',
  },
  loadingOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.7)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    color: '#fff',
    fontSize: 16,
    marginTop: 12,
    fontWeight: '500',
  },
  resultCard: {
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 30,
    alignItems: 'center',
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 5,
  },
  resultTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#333',
    marginBottom: 16,
  },
  resultDate: {
    fontSize: 28,
    fontWeight: '700',
    color: '#7CB342',
    marginBottom: 8,
  },
  resultDays: {
    fontSize: 16,
    color: '#666',
    fontWeight: '500',
  },
  productCard: {
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 25,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 5,
  },
  dateHeader: {
    alignItems: 'center',
    marginBottom: 25,
    paddingBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  dateLabel: {
    fontSize: 14,
    color: '#666',
    marginBottom: 5,
  },
  dateValue: {
    fontSize: 24,
    fontWeight: '700',
    color: '#333',
    marginBottom: 5,
  },
  daysValue: {
    fontSize: 16,
    color: '#7CB342',
    fontWeight: '600',
  },
  inputSection: {
    marginBottom: 25,
  },
  inputLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  textInput: {
    borderWidth: 1,
    borderColor: '#e0e0e0',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 16,
    backgroundColor: '#f9f9f9',
  },
  saveButton: {
    backgroundColor: '#7CB342',
    paddingVertical: 16,
    borderRadius: 25,
    alignItems: 'center',
    marginBottom: 12,
  },
  saveButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  resetButton: {
    backgroundColor: 'transparent',
    paddingVertical: 16,
    borderRadius: 25,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#7CB342',
  },
  resetButtonText: {
    color: '#7CB342',
    fontSize: 16,
    fontWeight: '600',
  },
  disabledButton: {
    opacity: 0.6,
  },
  savingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  sliderContainer: {
    height: 250,
    marginBottom: 20,
  },
  slider: {
    height: 100,
  },
  slideContainer: {
    width: width,
    paddingHorizontal: 20,
  },
  sliderImage: {
    width: width - 40,
    height: 200,
    borderRadius: 15,
    backgroundColor: '#f0f0f0',
  },
  dotsContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    paddingVertical: 20,
    gap: 8,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
  },
  activeDot: {
    backgroundColor: '#fff',
  },
});