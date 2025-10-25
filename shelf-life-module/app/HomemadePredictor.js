import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  Switch,
  TextInput,
  Alert,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  ScrollView,
  Image,
} from 'react-native';
import { useRouter } from 'expo-router';
import * as Notifications from 'expo-notifications';
import AsyncStorage from '@react-native-async-storage/async-storage';
import DhalImage from '../assets/images/dhall.jpg';
import MeatImage from '../assets/images/meat.jpg';
import defaultImage from '../assets/images/homemade.jpeg';

// Handle notifications globally
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

// Function to save notifications to AsyncStorage
const saveNotificationToHistory = async (notification) => {
  try {
    const existing = await AsyncStorage.getItem('notificationHistory');
    const history = existing ? JSON.parse(existing) : [];
    history.unshift(notification); // newest first
    await AsyncStorage.setItem('notificationHistory', JSON.stringify(history));
  } catch (error) {
    console.error('Error saving notification history:', error);
  }
};

export default function HomemadePredictor() {
  const [selectedFood, setSelectedFood] = useState(null);
  const [isExpired, setIsExpired] = useState(false);
  const [hours, setHours] = useState('');
  const [storage, setStorage] = useState('');
  const [ingredients, setIngredients] = useState({
    water: false,
    coconutMilk: false,
    oil: false,
  });
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const [image, setImage] = useState({ uri: defaultImage });

  useEffect(() => {
    (async () => {
      const { status } = await Notifications.requestPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission required', 'Please enable notifications for alerts.');
      }
    })();
  }, []);

  const handleFoodSelection = () => {
    Alert.alert("Select Homemade Food", "", [
      { text: "Dhal Curry", onPress: () => setSelectedFood("Dhal Curry") },
      { text: "Meat Curry", onPress: () => setSelectedFood("Meat Curry") },
      { text: "Cancel", style: "cancel" },
    ]);
  };

  const handleSubmit = async () => {
    if (!selectedFood) return Alert.alert("Error", "Please select a food type first.");
    if (isExpired) return Alert.alert('Prediction', `${selectedFood} is already expired.`);

    const cookedHours = parseFloat(hours);
    if (isNaN(cookedHours)) return Alert.alert('Error', 'Please enter valid hours.');
    if (!storage) return Alert.alert('Error', 'Please select storage method.');

    setLoading(true);
    try {
      const selectedIngredients = Object.entries(ingredients)
        .filter(([_, value]) => value)
        .map(([key]) =>
          key === 'coconutMilk' ? 'Coconut Milk' :
          key === 'oil' ? 'Oil' : 'Water'
        );

      const payload = {
        food: selectedFood,
        hoursSinceCooked: cookedHours,
        storage,
        ingredients: selectedIngredients,
      };

      const response = await fetch('http://98.88.90.67:5000/predict-homemade', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await response.json();
      setLoading(false);

      if (data.error) return Alert.alert('Server Error', data.error);

      console.log('Response data:', data);
      const now = new Date();

      // 3-hour notification
      if (data.notifyThreeHoursBefore) {
        const threeHoursTrigger = new Date(data.notifyThreeHoursBefore);
        if (threeHoursTrigger > now) {
          await Notifications.scheduleNotificationAsync({
            content: {
              title: `${data.food} - 3 Hours Left`,
              body: 'Your curry will expire in 3 hours!',
              sound: 'default',
            },
            trigger: threeHoursTrigger,
          });
          await saveNotificationToHistory({
            title: `${data.food} - 3 Hours Left`,
            body: 'Your curry will expire in 3 hours!',
            time: threeHoursTrigger.toISOString(),
          });
        }
      }

      // 1-hour notification
      if (data.notifyOneHourBefore) {
        const oneHourTrigger = new Date(data.notifyOneHourBefore);
        if (oneHourTrigger > now) {
          await Notifications.scheduleNotificationAsync({
            content: {
              title: `${data.food} - 1 Hour Left`,
              body: 'Your curry will expire in 1 hour!',
              sound: 'default',
            },
            trigger: oneHourTrigger,
          });
          await saveNotificationToHistory({
            title: `${data.food} - 1 Hour Left`,
            body: 'Your curry will expire in 1 hour!',
            time: oneHourTrigger.toISOString(),
          });
        }
      }

      Alert.alert(
        `${data.food} - ${data.status}`,
        `${data.recommendation}\nHours Remaining: ${data.hoursRemaining}`
      );
    } catch (error) {
      console.error('Fetch error:', error);
      setLoading(false);
      Alert.alert('Error', 'Unable to connect to server.');
    }
  };

  const getFoodImage = () => {
    if (selectedFood === 'Dhal Curry') return DhalImage;
    if (selectedFood === 'Meat Curry') return MeatImage;
    return defaultImage;
  };

  const getIngredientEmoji = (ingredient) => {
    switch (ingredient) {
      case 'water': return '💧';
      case 'coconutMilk': return '🥥';
      case 'oil': return '🫒';
      default: return '🌿';
    }
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => router.push('/Main')}>
          <Text style={styles.backIcon}>←</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Homemade Predictor</Text>
        <View style={styles.placeholder} />
      </View>

      {/* Green image card */}
      <View style={styles.greenCard}>
        <View style={styles.imageContainer}>
          <Image source={getFoodImage()} style={styles.displayImage} />
        </View>
      </View>

      {/* Content */}
      <ScrollView style={styles.contentCard} showsVerticalScrollIndicator={false}>
        {!selectedFood ? (
          <>
            <Text style={styles.foodTitle}>Select Your Curry</Text>
            <TouchableOpacity style={styles.selectButton} onPress={handleFoodSelection}>
              <Text style={styles.selectButtonText}>Select Food Type</Text>
            </TouchableOpacity>
          </>
        ) : (
          <>
            <Text style={styles.foodTitle}>{selectedFood}</Text>

            {/* Expired toggle */}
            <View style={styles.sectionContainer}>
              <Text style={styles.sectionTitle}>Quality Check</Text>
              <View style={styles.toggleContainer}>
                <Text style={styles.toggleLabel}>Is this curry already expired?</Text>
                <Switch
                  value={isExpired}
                  onValueChange={setIsExpired}
                  trackColor={{ false: '#ddd', true: '#7CB342' }}
                  thumbColor={isExpired ? '#fff' : '#f4f3f4'}
                />
              </View>
            </View>

            {!isExpired && (
              <>
                {/* Hours input */}
                <View style={styles.sectionContainer}>
                  <Text style={styles.sectionTitle}>Cooking Time</Text>
                  <TextInput
                    style={styles.input}
                    placeholder="Enter hours since cooked"
                    keyboardType="numeric"
                    value={hours}
                    onChangeText={setHours}
                  />
                </View>

                {/* Storage options */}
                <View style={styles.sectionContainer}>
                  <Text style={styles.sectionTitle}>Storage Method</Text>
                  <View style={styles.storageOptions}>
                    <TouchableOpacity
                      style={[styles.storageOption, storage === 'Fridge' && styles.selectedStorage]}
                      onPress={() => setStorage('Fridge')}
                    >
                      <Text style={styles.storageEmoji}>🥶</Text>
                      <Text style={styles.storageText}>Fridge</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={[styles.storageOption, storage === 'Room' && styles.selectedStorage]}
                      onPress={() => setStorage('Room')}
                    >
                      <Text style={styles.storageEmoji}>🌡️</Text>
                      <Text style={styles.storageText}>Room Temp</Text>
                    </TouchableOpacity>
                  </View>
                </View>

                {/* Ingredients */}
                <View style={styles.sectionContainer}>
                  <Text style={styles.sectionTitle}>Ingredients</Text>
                  <View style={styles.ingredientsGrid}>
                    {Object.entries(ingredients).map(([key, value]) => (
                      <TouchableOpacity
                        key={key}
                        style={[styles.ingredientCard, value && styles.selectedIngredient]}
                        onPress={() =>
                          setIngredients((prev) => ({ ...prev, [key]: !prev[key] }))
                        }
                      >
                        <Text style={styles.ingredientEmoji}>{getIngredientEmoji(key)}</Text>
                        <Text style={styles.ingredientText}>
                          {key === 'coconutMilk' ? 'Coconut Milk' : key.charAt(0).toUpperCase() + key.slice(1)}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                </View>

                {/* Submit */}
                <TouchableOpacity style={styles.submitButton} onPress={handleSubmit} disabled={loading}>
                  {loading ? (
                    <ActivityIndicator size="small" color="#fff" />
                  ) : (
                    <Text style={styles.submitButtonText}>Analyze Freshness</Text>
                  )}
                </TouchableOpacity>
              </>
            )}
          </>
        )}

        {/* Links */}
        <TouchableOpacity style={styles.linkButton} onPress={() => router.push('/HistoryScreen')}>
          <Text style={styles.linkText}>📋 View Prediction History</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.linkButton} onPress={() => router.push('/NotificationHistoryScreen')}>
          <Text style={styles.linkText}>🔔 View Notifications</Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
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
  backIcon: { fontSize: 20, color: 'white', fontWeight: 'bold' },
  headerTitle: { fontSize: 18, fontWeight: 'bold', color: 'white' },
  placeholder: { width: 40 },
  greenCard: { alignItems: 'center', paddingBottom: 20 },
  imageContainer: {
    width: 200, height: 200, borderRadius: 100, backgroundColor: 'white',
    alignItems: 'center', justifyContent: 'center',
  },
  displayImage: { width: 180, height: 180, borderRadius: 90 },
  contentCard: {
    flex: 1, backgroundColor: '#f8f9fa',
    borderTopLeftRadius: 25, borderTopRightRadius: 25,
    paddingHorizontal: 20, paddingTop: 25,
  },
  foodTitle: { fontSize: 26, fontWeight: 'bold', color: '#333', marginBottom: 15 },
  selectButton: {
    height: 50, backgroundColor: '#7CB342', borderRadius: 25,
    alignItems: 'center', justifyContent: 'center', marginBottom: 20,
  },
  selectButtonText: { color: 'white', fontSize: 16, fontWeight: '600' },
  sectionContainer: { marginBottom: 25 },
  sectionTitle: { fontSize: 18, fontWeight: '600', color: '#333', marginBottom: 10 },
  toggleContainer: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    backgroundColor: '#fff', padding: 15, borderRadius: 12,
  },
  toggleLabel: { fontSize: 16, color: '#333', flex: 1 },
  input: {
    height: 50, backgroundColor: '#fff', borderRadius: 12, paddingHorizontal: 15,
    fontSize: 16, borderWidth: 1, borderColor: '#ddd',
  },
  storageOptions: { flexDirection: 'row', gap: 15 },
  storageOption: {
    flex: 1, backgroundColor: '#fff', padding: 20, borderRadius: 12,
    alignItems: 'center', borderWidth: 2, borderColor: 'transparent',
  },
  selectedStorage: { borderColor: '#7CB342', backgroundColor: '#f8fff8' },
  storageEmoji: { fontSize: 22, marginBottom: 8 },
  storageText: { fontSize: 14, color: '#333' },
  ingredientsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12 },
  ingredientCard: {
    backgroundColor: '#fff', padding: 15, borderRadius: 12,
    alignItems: 'center', minWidth: 100, borderWidth: 2, borderColor: 'transparent',
  },
  selectedIngredient: { borderColor: '#7CB342', backgroundColor: '#f8fff8' },
  ingredientEmoji: { fontSize: 22, marginBottom: 5 },
  ingredientText: { fontSize: 12, color: '#333', textAlign: 'center' },
  submitButton: {
    height: 50, backgroundColor: '#7CB342', borderRadius: 25,
    alignItems: 'center', justifyContent: 'center', marginBottom: 20,
  },
  submitButtonText: { color: 'white', fontSize: 16, fontWeight: '600' },
  linkButton: { alignItems: 'center', paddingVertical: 12 },
  linkText: { color: '#7CB342', fontSize: 16, fontWeight: '500' },
});
