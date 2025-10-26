import * as ImagePicker from 'expo-image-picker';
import { useState, useEffect } from 'react';
import {
  ActivityIndicator,
  Alert,
  Button,
  Image,
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import { useRouter } from 'expo-router';
import * as Notifications from 'expo-notifications';
import defaultImage from '../assets/images/doods.jpg';
import AsyncStorage from '@react-native-async-storage/async-storage';


// Request notification permissions
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

// Save notifications to local history
const saveNotificationToHistory = async (notification) => {
  try {
    const existing = await AsyncStorage.getItem('notificationHistory');
    const history = existing ? JSON.parse(existing) : [];
    history.unshift(notification); // Add newest at top
    await AsyncStorage.setItem('notificationHistory', JSON.stringify(history));
  } catch (error) {
    console.error('Error saving notification history:', error);
  }
};


export default function PredictionScreen() {
  //const [image, setImage] = useState(null);
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
    Alert.alert(
      "Upload Image",
      "Choose an option",
      [
        {
          text: "Camera",
          onPress: async () => {
            const cameraPermission = await ImagePicker.requestCameraPermissionsAsync();
            if (!cameraPermission.granted) {
              return Alert.alert("Camera permission required");
            }
            const result = await ImagePicker.launchCameraAsync({ base64: true, quality: 1 });
            if (!result.canceled) {
              const selectedImage = result.assets[0];
              setImage(selectedImage);
              if (selectedFruit) {
                sendToServer(selectedImage.base64, selectedImage.uri, selectedFruit);
              } else {
                Alert.alert("Error", "Please select a fruit first.");
              }
            }
          }
        },
        {
          text: "Gallery",
          onPress: async () => {
            const galleryPermission = await ImagePicker.requestMediaLibraryPermissionsAsync();
            if (!galleryPermission.granted) {
              return Alert.alert("Gallery permission required");
            }
            const result = await ImagePicker.launchImageLibraryAsync({ base64: true, quality: 1 });
            if (!result.canceled) {
              const selectedImage = result.assets[0];
              setImage(selectedImage);
              if (selectedFruit) {
                sendToServer(selectedImage.base64, selectedImage.uri, selectedFruit);
              } else {
                Alert.alert("Error", "Please select a fruit first.");
              }
            }
          }
        },
        { text: "Cancel", style: "cancel" }
      ]
    );
  };

  const sendToServer = async (base64, uri, fruit) => {
    try {
      setLoading(true);
      setResult(null);

      const response = await fetch('http://98.88.90.67:5000/predict', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ image: base64, fruit: fruit, image_uri: uri }),
      });

      if (!response.ok) throw new Error('Server error');

      const data = await response.json();
      if (data.error) {
        Alert.alert('Error', data.error);
        return;
      }
      setResult(data);

      if (data.notifyOneDayBefore) {
  const triggerDate = new Date(data.notifyOneDayBefore);

  // 🧠 Calculate message dynamically
  let message = '';
  if (data.daysLeft === 1) {
    message = `Your ${data.fruit} will expire tomorrow!`;
  } else if (data.daysLeft === 0) {
    message = `Your ${data.fruit} expires today!`;
  } else {
    message = `Your ${data.fruit} will expire in ${data.daysLeft} days!`;
  }

  await Notifications.scheduleNotificationAsync({
    content: {
      title: `${data.fruit} Expiration Alert`,
      body: message,
      sound: 'default',
    },
    trigger: triggerDate,
  });

  // ✅ Save same notification to history
  await saveNotificationToHistory({
    title: `${data.fruit} Expiration Alert`,
    body: message,
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
        <TouchableOpacity 
          style={styles.backButton} 
          onPress={() => router.push('/Main')}
        >
          <Text style={styles.backIcon}>←</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Shelf Life Estimator</Text>
        <View style={styles.placeholder} />
      </View>

      {/* Green Card with Image */}
      <View style={styles.greenCard}>
        <View style={styles.imageContainer}>
  {image ? (
    <Image 
      source={image.uri === defaultImage ? defaultImage : { uri: image.uri }} 
      style={styles.displayImage} 
    />
  ) : (
    <View style={styles.placeholderImage}>
      <Text style={styles.cameraIcon}>📷</Text>
    </View>
  )}
</View>
        
        {result && (
          <View style={styles.daysLeftContainer}>
            <Text style={styles.daysLeftNumber}>{result.daysLeft}</Text>
          </View>
        )}
      </View>

      {/* White Content Card */}
      <ScrollView style={styles.contentCard} showsVerticalScrollIndicator={false}>
        {result && (
          <>
            <Text style={styles.daysLeftTitle}>{result.daysLeft} days left</Text>
            <Text style={styles.expireDate}>Expire on: {result.expiresOn}</Text>
            <Text style={styles.foodDescription}>
              {result.fruit} - Stage: {result.stage}
            </Text>
            
            <View style={styles.ratingContainer}>
              <Text style={styles.ratingText}>⭐ Fresh</Text>
            </View>
          </>
        )}

        {!result && (
          <Text style={styles.selectPrompt}>Select a fruit and upload an image to get predictions</Text>
        )}

        {/* Fruit Selection */}
        <View style={styles.sectionContainer}>
          <Text style={styles.sectionTitle}>Select Fruit:</Text>
          <TouchableOpacity
            style={styles.dropdownButton}
            onPress={() =>
              Alert.alert(
                "Select Fruit",
                "",
                [
                  { text: "Apple", onPress: () => setSelectedFruit("Apple") },
                  { text: "Banana", onPress: () => setSelectedFruit("Banana") },
                  { text: "Bell", onPress: () => setSelectedFruit("Bell") },
                  { text: "Bitter", onPress: () => setSelectedFruit("Bitter") },
                  { text: "Carrots", onPress: () => setSelectedFruit("Carrots") },
                  { text: "Tomatoes", onPress: () => setSelectedFruit("Tomatoes") },
                  { text: "Cancel", style: "cancel" }
                ]
              )
            }
          >
            <Text style={styles.dropdownButtonText}>
              {selectedFruit || 'Choose a fruit'}
            </Text>
          </TouchableOpacity>
        </View>

        {/* Upload Button */}
        <TouchableOpacity 
          style={[styles.uploadButton, !selectedFruit && styles.uploadButtonDisabled]} 
          onPress={pickImage} 
          disabled={!selectedFruit}
        >
          <Text style={styles.uploadButtonText}>
            {loading ? 'Processing...' : '📷 Upload Image'}
          </Text>
          {loading && <ActivityIndicator size="small" color="#fff" style={styles.loader} />}
        </TouchableOpacity>

        {/* Enhanced Real-time estimation */}
        {result && result.warningNote && (
          <>
            <Text style={styles.estimationTitle}>Real-time estimation</Text>
            
            {/* Sensor Data Cards */}
<View style={styles.factorCards}>
  <View style={styles.factorCard}>
    <Text style={styles.factorIcon}>🌡️</Text>
    <Text style={styles.factorLabel}>Temp</Text>
    <Text style={styles.factorValue}>
      {result.currentSensorData ? `${result.currentSensorData.temperature}°C` : 'N/A'}
    </Text>
  </View>
  <View style={styles.factorCard}>
    <Text style={styles.factorIcon}>💧</Text>
    <Text style={styles.factorLabel}>Humidity</Text>
    <Text style={styles.factorValue}>
      {result.currentSensorData ? `${result.currentSensorData.humidity}%` : 'N/A'}
    </Text>
  </View>
  <View style={styles.factorCard}>
    <Text style={styles.factorIcon}>🧪</Text>
    <Text style={styles.factorLabel}>Ethylene</Text>
    <Text style={styles.factorValue}>
      {result.currentSensorData ? `${result.currentSensorData.ethylene} ppm` : 'N/A'}
    </Text>
  </View>
</View>

            {/* Enhanced Warning Display */}
            {result.warningNote && (
              <View style={styles.enhancedWarningContainer}>
                {/* Urgency Level Badge */}
                {result.warningNote.includes('🚨 CRITICAL') && (
                  <View style={[styles.urgencyBadge, styles.criticalBadge]}>
                    <Text style={styles.urgencyText}>⚠️ NOTICE</Text>
                  </View>
                )}
                {result.warningNote.includes('⚠️ WARNING') && (
                  <View style={[styles.urgencyBadge, styles.warningBadge]}>
                    <Text style={styles.urgencyText}>⚠️ NOTICE</Text>
                  </View>
                )}
                {result.warningNote.includes('📍 NOTICE') && (
                  <View style={[styles.urgencyBadge, styles.noticeBadge]}>
                    <Text style={styles.urgencyText}>⚠️ NOTICE</Text>
                  </View>
                )}

                {/* Adjusted Expiry Date */}
                {result.likelyExpiresOn && (
                  <View style={styles.adjustedExpiryContainer}>
                    <Text style={styles.adjustedExpiryTitle}>This analysis is performed using real-time environmental factors: temperature, humidity, and ethylene gas:</Text>
                    <Text style={styles.adjustedExpiryDate}>
                      Likely expires on {result.likelyExpiresOn.split(' ')[0]}
                    </Text>
                    <Text style={styles.impactNote}>
                      (Environmental conditions reduced shelf life by {
                        Math.round((new Date(result.expiresOn) - new Date(result.likelyExpiresOn)) / (1000 * 60 * 60 * 24) * 10) / 10
                      } days)
                    </Text>
                  </View>
                )}

                {/* Scientific Explanation */}
                <View style={styles.scienceSection}>
                  <Text style={styles.scienceSectionTitle}>🧬 Scientific Analysis</Text>
                  {result.warningNote.includes('🧬 SCIENCE:') && (
                    <Text style={styles.scienceText}>
                      {result.warningNote.match(/🧬 SCIENCE: ([^🌡️💧🍃💡🎯]*)/)?.[1]?.trim() || ''}
                    </Text>
                  )}
                </View>

                {/* Environmental Impact Details */}
                <View style={styles.impactSection}>
                  <Text style={styles.impactSectionTitle}>Environmental Impact:</Text>
                  
                  {/* Temperature Impact */}
                  {result.warningNote.includes('🌡️') && (
                    <View style={styles.impactItem}>
                      <Text style={styles.impactIcon}>🌡️</Text>
                      <Text style={styles.impactText}>
                        {result.warningNote.match(/🌡️ [^:]*: ([^🌡️💧🍃💡🎯]*)/)?.[1]?.trim() || 'Temperature affecting spoilage rate'}
                      </Text>
                    </View>
                  )}

                  {/* Humidity Impact */}
                  {result.warningNote.includes('💧') && (
                    <View style={styles.impactItem}>
                      <Text style={styles.impactIcon}>💧</Text>
                      <Text style={styles.impactText}>
                        {result.warningNote.match(/💧 [^:]*: ([^🌡️💧🍃💡🎯]*)/)?.[1]?.trim() || 'Humidity affecting moisture retention'}
                      </Text>
                    </View>
                  )}

                  {/* Ethylene Impact */}
                  {result.warningNote.includes('🍃') && (
                    <View style={styles.impactItem}>
                      <Text style={styles.impactIcon}>🍃</Text>
                      <Text style={styles.impactText}>
                        {result.warningNote.match(/🍃 [^:]*: ([^🌡️💧🍃💡🎯]*)/)?.[1]?.trim() || 'Ethylene gas accelerating ripening'}
                      </Text>
                    </View>
                  )}
                </View>

                {/* Storage Solution */}
                {result.warningNote.includes('💡 SOLUTION:') && (
                  <View style={styles.solutionContainer}>
                    <Text style={styles.solutionTitle}>💡 Storage Solution</Text>
                    <Text style={styles.solutionText}>
                      {result.warningNote.match(/💡 SOLUTION: ([^🌡️💧🍃💡🎯]*)/)?.[1]?.trim() || ''}
                    </Text>
                  </View>
                )}

                {/* Immediate Actions */}
                {result.warningNote.includes('🎯 IMMEDIATE ACTION:') && (
                  <View style={styles.actionContainer}>
                    <Text style={styles.actionTitle}>🎯 Take Action Now</Text>
                    <Text style={styles.actionText}>
                      {result.warningNote.match(/🎯 IMMEDIATE ACTION: ([^🌡️💧🍃💡🎯]*)/)?.[1]?.trim() || ''}
                    </Text>
                  </View>
                )}
              </View>
            )}

            {/* Current Status */}
            <Text style={styles.currentSituation}>
              {result.warningNote ? 
                `Environmental monitoring active. Predictions updated based on current storage conditions.` :
                `Currently this food is in good condition, so it's good to use in these days if possible.`
              }
            </Text>
          </>
        )}

        {/* View History Button */}
        <TouchableOpacity 
          style={styles.historyButton} 
          onPress={() => router.push('/HistoryScreen')}
        >
          <Text style={styles.historyButtonText}>View History</Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
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
    paddingTop: 60,
    paddingBottom: 20,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  backIcon: {
    fontSize: 20,
    color: 'white',
    fontWeight: 'bold',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: 'white',
  },
  placeholder: {
    width: 40,
  },
  greenCard: {
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingBottom: 30,
  },
  imageContainer: {
    width: 200,
    height: 200,
    borderRadius: 100,
    backgroundColor: 'rgba(255,255,255,0.9)',
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  displayImage: {
    width: 180,
    height: 180,
    borderRadius: 90,
  },
  placeholderImage: {
    width: 180,
    height: 180,
    borderRadius: 90,
    backgroundColor: '#f0f0f0',
    alignItems: 'center',
    justifyContent: 'center',
  },
  cameraIcon: {
    fontSize: 40,
  },
  daysLeftContainer: {
    position: 'absolute',
    bottom: 10,
    backgroundColor: '#7CB342',
    paddingHorizontal: 20,
    paddingVertical: 8,
    borderRadius: 20,
    elevation: 3,
  },
  daysLeftNumber: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  contentCard: {
    flex: 1,
    backgroundColor: '#f8f9fa',
    borderTopLeftRadius: 25,
    borderTopRightRadius: 25,
    paddingHorizontal: 20,
    paddingTop: 25,
  },
  daysLeftTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 5,
  },
  expireDate: {
    fontSize: 16,
    color: '#666',
    marginBottom: 10,
  },
  foodDescription: {
    fontSize: 16,
    color: '#333',
    marginBottom: 15,
    lineHeight: 22,
  },
  ratingContainer: {
    marginBottom: 20,
  },
  ratingText: {
    fontSize: 16,
    color: '#666',
  },
  selectPrompt: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginVertical: 20,
  },
  sectionContainer: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginBottom: 10,
  },
  dropdownButton: {
    height: 50,
    backgroundColor: '#fff',
    borderRadius: 12,
    justifyContent: 'center',
    paddingHorizontal: 15,
    borderWidth: 1,
    borderColor: '#ddd',
    elevation: 2,
  },
  dropdownButtonText: {
    fontSize: 16,
    color: '#333',
  },
  uploadButton: {
    height: 50,
    backgroundColor: '#7CB342',
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
    elevation: 2,
  },
  uploadButtonDisabled: {
    backgroundColor: '#ccc',
  },
  uploadButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  loader: {
    marginLeft: 10,
  },
  estimationTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginBottom: 15,
  },
  factorCards: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  factorCard: {
    flex: 1,
    backgroundColor: '#fff',
    padding: 15,
    borderRadius: 12,
    alignItems: 'center',
    marginHorizontal: 5,
    elevation: 2,
  },
  factorIcon: {
    fontSize: 24,
    marginBottom: 5,
  },
  factorLabel: {
    fontSize: 12,
    color: '#666',
    marginBottom: 5,
  },
  factorValue: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
  },
  // Enhanced warning system styles
  enhancedWarningContainer: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 15,
    marginBottom: 15,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
  },
  urgencyBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 15,
    marginBottom: 12,
  },
  criticalBadge: {
    backgroundColor: '#ff4757',
  },
  warningBadge: {
    backgroundColor: '#ffc107',
  },
  noticeBadge: {
    backgroundColor: '#28a745',
  },
  urgencyText: {
    color: 'white',
    fontSize: 12,
    fontWeight: 'bold',
  },
  adjustedExpiryContainer: {
    backgroundColor: '#f8f9fa',
    padding: 12,
    borderRadius: 8,
    marginBottom: 12,
    borderLeftWidth: 4,
    borderLeftColor: '#007bff',
  },
  adjustedExpiryTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  adjustedExpiryDate: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#007bff',
    marginBottom: 4,
  },
  impactNote: {
    fontSize: 12,
    color: '#666',
    fontStyle: 'italic',
  },
  scienceSection: {
    backgroundColor: '#e8f4f8',
    padding: 12,
    borderRadius: 8,
    marginBottom: 12,
  },
  scienceSectionTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#2c3e50',
    marginBottom: 8,
  },
  scienceText: {
    fontSize: 13,
    color: '#34495e',
    lineHeight: 18,
  },
  impactSection: {
    marginBottom: 12,
  },
  impactSectionTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  impactItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 8,
    paddingLeft: 5,
  },
  impactIcon: {
    fontSize: 16,
    marginRight: 8,
    marginTop: 2,
  },
  impactText: {
    flex: 1,
    fontSize: 13,
    color: '#555',
    lineHeight: 18,
  },
  solutionContainer: {
    backgroundColor: '#e8f5e8',
    padding: 12,
    borderRadius: 8,
    marginBottom: 12,
    borderLeftWidth: 4,
    borderLeftColor: '#28a745',
  },
  solutionTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#155724',
    marginBottom: 6,
  },
  solutionText: {
    fontSize: 13,
    color: '#155724',
    lineHeight: 18,
  },
  actionContainer: {
    backgroundColor: '#fff3cd',
    padding: 12,
    borderRadius: 8,
    marginBottom: 12,
    borderLeftWidth: 4,
    borderLeftColor: '#ffc107',
  },
  actionTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#856404',
    marginBottom: 6,
  },
  actionText: {
    fontSize: 13,
    color: '#856404',
    lineHeight: 18,
    fontWeight: '500',
  },
  warningContainer: {
    backgroundColor: '#fff3cd',
    padding: 15,
    borderRadius: 12,
    marginBottom: 15,
    borderLeftWidth: 4,
    borderLeftColor: '#ffc107',
  },
  warningText: {
    fontSize: 14,
    color: '#856404',
    lineHeight: 20,
  },
  boldDate: {
    fontWeight: 'bold',
  },
  currentSituation: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    fontStyle: 'italic',
    marginBottom: 20,
  },
  historyButton: {
    height: 50,
    backgroundColor: '#7CB342',
    borderRadius: 25,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 30,
    elevation: 3,
  },
  historyButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
});