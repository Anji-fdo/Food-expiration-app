import * as ImagePicker from 'expo-image-picker';
import { useState, useEffect } from 'react';
import {
  ActivityIndicator,
  Alert,
  Image,
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import { useRouter } from 'expo-router';
import * as Notifications from 'expo-notifications';
import AsyncStorage from '@react-native-async-storage/async-storage';
import defaultImage from '../assets/images/doods.jpg';

// Notification handler
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

// Function to store notifications locally
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

export default function PredictionScreen() {
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [selectedFruit, setSelectedFruit] = useState('');
  const router = useRouter();
  const [image, setImage] = useState({ uri: defaultImage });

  useEffect(() => {
    (async () => {
      const { status } = await Notifications.requestPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission required', 'Notification permissions are needed for alerts.');
      }
    })();
  }, []);

  const pickImage = async () => {
    Alert.alert("Upload Image", "Choose an option", [
      {
        text: "Camera",
        onPress: async () => {
          const permission = await ImagePicker.requestCameraPermissionsAsync();
          if (!permission.granted) return Alert.alert("Camera permission required");
          const result = await ImagePicker.launchCameraAsync({ base64: true, quality: 1 });
          if (!result.canceled) {
            const selectedImage = result.assets[0];
            setImage(selectedImage);
            selectedFruit ? sendToServer(selectedImage.base64, selectedImage.uri, selectedFruit)
                          : Alert.alert("Error", "Please select a fruit first.");
          }
        },
      },
      {
        text: "Gallery",
        onPress: async () => {
          const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
          if (!permission.granted) return Alert.alert("Gallery permission required");
          const result = await ImagePicker.launchImageLibraryAsync({ base64: true, quality: 1 });
          if (!result.canceled) {
            const selectedImage = result.assets[0];
            setImage(selectedImage);
            selectedFruit ? sendToServer(selectedImage.base64, selectedImage.uri, selectedFruit)
                          : Alert.alert("Error", "Please select a fruit first.");
          }
        },
      },
      { text: "Cancel", style: "cancel" },
    ]);
  };

  const sendToServer = async (base64, uri, fruit) => {
    try {
      setLoading(true);
      setResult(null);

      const response = await fetch('http://98.88.90.67:5000/predict', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ image: base64, fruit, image_uri: uri }),
      });

      if (!response.ok) throw new Error('Server error');
      const data = await response.json();
      if (data.error) return Alert.alert('Error', data.error);

      setResult(data);

      // Schedule notifications and save them locally
      if (data.notifyOneDayBefore) {
        const triggerDate = new Date(data.notifyOneDayBefore);
        await Notifications.scheduleNotificationAsync({
          content: {
            title: `${data.fruit} Expiration Alert`,
            body: `Your ${data.fruit} will expire tomorrow!`,
            sound: 'default',
          },
          trigger: triggerDate,
        });
        await saveNotificationToHistory({
          title: `${data.fruit} Expiration Alert`,
          body: `Your ${data.fruit} will expire tomorrow!`,
          time: triggerDate.toISOString(),
        });
      }

    } catch (error) {
      console.error(error);
      Alert.alert('Error', 'Error sending image to server.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => router.push('/Main')}>
          <Text style={styles.backIcon}>←</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Shelf Life Estimator</Text>
        <View style={styles.placeholder} />
      </View>

      {/* Green Card with Image */}
      <View style={styles.greenCard}>
        <View style={styles.imageContainer}>
          <Image
            source={image.uri === defaultImage ? defaultImage : { uri: image.uri }}
            style={styles.displayImage}
          />
        </View>
        {result && (
          <View style={styles.daysLeftContainer}>
            <Text style={styles.daysLeftNumber}>{result.daysLeft} days left</Text>
          </View>
        )}
      </View>

      {/* White Content Card */}
      <ScrollView style={styles.contentCard}>
        {result ? (
          <>
            <Text style={styles.expireDate}>Expires on: {result.expiresOn}</Text>
            <Text style={styles.foodDescription}>
              {result.fruit} - Stage: {result.stage}
            </Text>
          </>
        ) : (
          <Text style={styles.selectPrompt}>Select a fruit and upload an image</Text>
        )}

        <TouchableOpacity
          style={styles.dropdownButton}
          onPress={() =>
            Alert.alert("Select Fruit", "", [
              { text: "Apple", onPress: () => setSelectedFruit("Apple") },
              { text: "Banana", onPress: () => setSelectedFruit("Banana") },
              { text: "Tomatoes", onPress: () => setSelectedFruit("Tomatoes") },
              { text: "Cancel", style: "cancel" },
            ])
          }
        >
          <Text style={styles.dropdownButtonText}>{selectedFruit || 'Choose a fruit'}</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.uploadButton, !selectedFruit && styles.uploadButtonDisabled]}
          onPress={pickImage}
          disabled={!selectedFruit}
        >
          <Text style={styles.uploadButtonText}>
            {loading ? 'Processing...' : '📷 Upload Image'}
          </Text>
          {loading && <ActivityIndicator size="small" color="#fff" />}
        </TouchableOpacity>

        {/* Buttons */}
        <TouchableOpacity style={styles.historyButton} onPress={() => router.push('/HistoryScreen')}>
          <Text style={styles.historyButtonText}>View History</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.historyButton} onPress={() => router.push('/NotificationHistoryScreen')}>
          <Text style={styles.historyButtonText}>View Notifications</Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#7CB342' },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingTop: 60, paddingHorizontal: 20 },
  backButton: { backgroundColor: 'rgba(255,255,255,0.2)', borderRadius: 20, padding: 10 },
  backIcon: { color: 'white', fontSize: 18, fontWeight: 'bold' },
  headerTitle: { color: 'white', fontWeight: 'bold', fontSize: 18 },
  placeholder: { width: 30 },
  greenCard: { alignItems: 'center', padding: 20 },
  imageContainer: { width: 200, height: 200, borderRadius: 100, backgroundColor: 'white', alignItems: 'center', justifyContent: 'center' },
  displayImage: { width: 180, height: 180, borderRadius: 90 },
  daysLeftContainer: { backgroundColor: '#558B2F', paddingHorizontal: 20, paddingVertical: 8, borderRadius: 20, marginTop: 15 },
  daysLeftNumber: { color: 'white', fontWeight: 'bold' },
  contentCard: { backgroundColor: '#f8f9fa', borderTopLeftRadius: 25, borderTopRightRadius: 25, padding: 20 },
  expireDate: { fontSize: 16, color: '#555', marginBottom: 10 },
  foodDescription: { fontSize: 16, color: '#333', marginBottom: 20 },
  selectPrompt: { textAlign: 'center', color: '#777', marginVertical: 20 },
  dropdownButton: { backgroundColor: '#fff', padding: 15, borderRadius: 12, marginBottom: 15 },
  dropdownButtonText: { color: '#333', fontSize: 16 },
  uploadButton: { backgroundColor: '#7CB342', padding: 15, borderRadius: 12, alignItems: 'center', marginBottom: 20 },
  uploadButtonDisabled: { backgroundColor: '#ccc' },
  uploadButtonText: { color: 'white', fontWeight: 'bold' },
  historyButton: { backgroundColor: '#7CB342', padding: 15, borderRadius: 25, alignItems: 'center', marginTop: 10 },
  historyButtonText: { color: 'white', fontWeight: '600' },
});
