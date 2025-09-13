import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  Switch,
  TextInput,
  Button,
  Alert,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  ScrollView,
  Image,
} from 'react-native';
import { useRouter } from 'expo-router';
import * as Notifications from 'expo-notifications';
import DhalImage from '../assets/images/dhall.jpg';
import MeatImage from '../assets/images/meat.jpg';
import defaultImage from '../assets/images/homemade.jpeg';


// Request notification permissions
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

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
        Alert.alert('Permission required', 'Notification permissions are needed for alerts.');
      } else {
        console.log('Notification permissions granted');
      }
    })();
  }, []);

  const handleFoodSelection = () => {
    Alert.alert(
      "Select Homemade Food",
      "",
      [
        { text: "Dhal Curry", onPress: () => setSelectedFood("Dhal Curry") },
        { text: "Meat Curry", onPress: () => setSelectedFood("Meat Curry") },
        { text: "Cancel", style: "cancel" },
      ]
    );
  };

  const handleSubmit = async () => {
    if (!selectedFood) {
      Alert.alert("Error", "Please select a food type first.");
      return;
    }

    if (isExpired) {
      Alert.alert('Prediction', `${selectedFood} is already expired.`);
      return;
    }

    const cookedHours = parseFloat(hours);
    if (isNaN(cookedHours)) {
      Alert.alert('Error', 'Please enter a valid number of hours.');
      return;
    }

    if (!storage) {
      Alert.alert('Error', 'Please select storage method.');
      return;
    }

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

      const response = await fetch('http://172.20.10.2:5000/predict-homemade', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await response.json();
      setLoading(false);

      if (!data || typeof data !== 'object') {
        Alert.alert('Error', 'Invalid response from server.');
        return;
      }

      if (data.error) {
        Alert.alert('Server Error', data.error);
        return;
      }

      // Debug notification triggers
      console.log('Response data:', data);
      const now = new Date();
      if (data.notifyThreeHoursBefore) {
        const threeHoursTrigger = new Date(data.notifyThreeHoursBefore);
        console.log('Three hours trigger:', threeHoursTrigger);
        if (threeHoursTrigger > now) {
          await Notifications.scheduleNotificationAsync({
            content: {
              title: `${data.food} - 3 Hours Left`,
              body: 'Your curry will expire in 3 hours!',
              sound: 'default',
            },
            trigger: threeHoursTrigger,
          }).catch((error) => {
            console.error('Failed to schedule 3-hour notification:', error);
            Alert.alert('Notification Error', 'Failed to schedule 3-hour alert.');
          });
        } else {
          console.warn('Three hours trigger is in the past:', threeHoursTrigger);
        }
      }
      if (data.notifyOneHourBefore) {
        const oneHourTrigger = new Date(data.notifyOneHourBefore);
        console.log('One hour trigger:', oneHourTrigger);
        if (oneHourTrigger > now) {
          await Notifications.scheduleNotificationAsync({
            content: {
              title: `${data.food} - 1 Hour Left`,
              body: 'Your curry will expire in 1 hour!',
              sound: 'default',
            },
            trigger: oneHourTrigger,
          }).catch((error) => {
            console.error('Failed to schedule 1-hour notification:', error);
            Alert.alert('Notification Error', 'Failed to schedule 1-hour alert.');
          });
        } else {
          console.warn('One hour trigger is in the past:', oneHourTrigger);
        }
      }

      Alert.alert(
        `${data.food} - ${data.status}`,
        `${data.recommendation}\nHours Remaining: ${data.hoursRemaining}`
      );
    } catch (error) {
      console.error('Fetch error:', error);
      setLoading(false);
      Alert.alert('Error', 'Unable to connect or parse server response.');
    }
  };

  const getFoodImage = () => {
    if (selectedFood === 'Dhal Curry') return DhalImage;
    if (selectedFood === 'Meat Curry') return MeatImage;
    return null;
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
        <TouchableOpacity 
          style={styles.backButton} 
          onPress={() => router.push('/Main')}
        >
          <Text style={styles.backIcon}>←</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Homemade Predictor</Text>
        <View style={styles.placeholder} />
      </View>

      

<View style={styles.greenCard}>
  <View style={styles.imageContainer}>
    {selectedFood && getFoodImage() ? (
      <Image source={getFoodImage()} style={styles.displayImage} />
    ) : (
      <Image source={require('../assets/images/homemade.jpeg')} style={styles.displayImage} /> // Default image
    )}
  </View>
  
  <View style={styles.stepIndicator}>
    <View style={styles.stepDot} />
    <View style={styles.stepDot} />
    <View style={styles.stepDot} />
  </View>
</View>

      {/* White Content Card */}
      <ScrollView style={styles.contentCard} showsVerticalScrollIndicator={false}>
        {!selectedFood ? (
          <>
            <Text style={styles.foodTitle}>Select Your Curry</Text>
            <Text style={styles.foodDescription}>
              Choose the homemade curry you want to analyze for freshness and safety
            </Text>
            
            <View style={styles.ratingContainer}>
              <Text style={styles.ratingText}>⭐ Homemade • 🔥 Fresh • ⏱️ Quick Check</Text>
            </View>

            <TouchableOpacity style={styles.selectButton} onPress={handleFoodSelection}>
              <Text style={styles.selectButtonText}>Select Food Type</Text>
            </TouchableOpacity>
          </>
        ) : (
          <>
            <Text style={styles.foodTitle}>{selectedFood}</Text>
            <Text style={styles.foodDescription}>
              Fresh homemade curry with traditional spices and ingredients. Please provide details below for accurate analysis.
            </Text>
            
            <View style={styles.ratingContainer}>
              <Text style={styles.ratingText}>⭐ 4.8 • 🔥 Homemade • ⏱️ Analysis Ready</Text>
            </View>

            {/* Expired Toggle */}
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
                {/* Hours Input */}
                <View style={styles.sectionContainer}>
                  <Text style={styles.sectionTitle}>Cooking Time</Text>
                  <Text style={styles.inputLabel}>When was this cooked? (hours ago)</Text>
                  <TextInput
                    style={styles.input}
                    placeholder="e.g. 6"
                    keyboardType="numeric"
                    value={hours}
                    onChangeText={setHours}
                  />
                </View>

                {/* Storage Options */}
                <View style={styles.sectionContainer}>
                  <Text style={styles.sectionTitle}>Storage Method</Text>
                  <View style={styles.storageOptions}>
                    <TouchableOpacity
                      style={[styles.storageOption, storage === 'Fridge' && styles.selectedStorage]}
                      onPress={() => setStorage('Fridge')}
                    >
                      <Text style={styles.storageEmoji}>🥶</Text>
                      <Text style={[styles.storageText, storage === 'Fridge' && styles.selectedStorageText]}>
                        Fridge
                      </Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={[styles.storageOption, storage === 'Room' && styles.selectedStorage]}
                      onPress={() => setStorage('Room')}
                    >
                      <Text style={styles.storageEmoji}>🌡️</Text>
                      <Text style={[styles.storageText, storage === 'Room' && styles.selectedStorageText]}>
                        Room Temp
                      </Text>
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
                        <Text style={[styles.ingredientText, value && styles.selectedIngredientText]}>
                          {key === 'coconutMilk' ? 'Coconut Milk' : key.charAt(0).toUpperCase() + key.slice(1)}
                        </Text>
                        {value && <Text style={styles.checkmark}>✓</Text>}
                      </TouchableOpacity>
                    ))}
                  </View>
                </View>

                {/* Submit Button */}
                <TouchableOpacity 
                  style={styles.submitButton} 
                  onPress={handleSubmit}
                  disabled={loading}
                >
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

        {/* Navigation Links */}
        <TouchableOpacity 
          style={styles.linkButton}
          onPress={() => router.push('/HistoryScreen')}
        >
          <Text style={styles.linkText}>📋 View Prediction History</Text>
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
    marginBottom: 20,
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
  foodIcon: {
    fontSize: 60,
  },
  stepIndicator: {
    flexDirection: 'row',
    gap: 8,
  },
  stepDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: 'rgba(255,255,255,0.5)',
  },
  contentCard: {
    flex: 1,
    backgroundColor: '#f8f9fa',
    borderTopLeftRadius: 25,
    borderTopRightRadius: 25,
    paddingHorizontal: 20,
    paddingTop: 25,
  },
  foodTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 10,
  },
  foodDescription: {
    fontSize: 16,
    color: '#666',
    marginBottom: 15,
    lineHeight: 22,
  },
  ratingContainer: {
    marginBottom: 25,
  },
  ratingText: {
    fontSize: 16,
    color: '#666',
  },
  selectButton: {
    height: 50,
    backgroundColor: '#7CB342',
    borderRadius: 25,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 30,
    elevation: 3,
  },
  selectButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  sectionContainer: {
    marginBottom: 25,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#333',
    marginBottom: 15,
  },
  toggleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#fff',
    padding: 15,
    borderRadius: 12,
    elevation: 2,
  },
  toggleLabel: {
    fontSize: 16,
    color: '#333',
    flex: 1,
    marginRight: 15,
  },
  inputLabel: {
    fontSize: 14,
    color: '#666',
    marginBottom: 8,
  },
  input: {
    height: 50,
    backgroundColor: '#fff',
    borderRadius: 12,
    paddingHorizontal: 15,
    fontSize: 16,
    borderWidth: 1,
    borderColor: '#ddd',
    elevation: 2,
  },
  storageOptions: {
    flexDirection: 'row',
    gap: 15,
  },
  storageOption: {
    flex: 1,
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 12,
    alignItems: 'center',
    elevation: 2,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  selectedStorage: {
    borderColor: '#7CB342',
    backgroundColor: '#f8fff8',
  },
  storageEmoji: {
    fontSize: 24,
    marginBottom: 8,
  },
  storageText: {
    fontSize: 14,
    color: '#666',
    fontWeight: '500',
  },
  selectedStorageText: {
    color: '#7CB342',
    fontWeight: '600',
  },
  ingredientsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  ingredientCard: {
    backgroundColor: '#fff',
    padding: 15,
    borderRadius: 12,
    alignItems: 'center',
    minWidth: 100,
    elevation: 2,
    borderWidth: 2,
    borderColor: 'transparent',
    position: 'relative',
  },
  selectedIngredient: {
    borderColor: '#7CB342',
    backgroundColor: '#f8fff8',
  },
  ingredientEmoji: {
    fontSize: 24,
    marginBottom: 8,
  },
  ingredientText: {
    fontSize: 12,
    color: '#666',
    textAlign: 'center',
    fontWeight: '500',
  },
  selectedIngredientText: {
    color: '#7CB342',
    fontWeight: '600',
  },
  checkmark: {
    position: 'absolute',
    top: 5,
    right: 5,
    color: '#7CB342',
    fontSize: 16,
    fontWeight: 'bold',
  },
  submitButton: {
    height: 50,
    backgroundColor: '#7CB342',
    borderRadius: 25,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
    elevation: 3,
  },
  submitButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  linkButton: {
    alignItems: 'center',
    paddingVertical: 15,
    marginBottom: 30,
  },
  linkText: {
    color: '#7CB342',
    fontSize: 16,
    fontWeight: '500',
  },
});