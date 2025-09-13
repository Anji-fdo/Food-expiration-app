import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';

export default function Main() {
  const router = useRouter();

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Add foods for check ex...</Text>
      <Text style={styles.subtitle}>Are You Look For Edibility!!</Text>
      <Text style={styles.tryText}>Try this now</Text>

      <TouchableOpacity style={styles.button} onPress={() => router.push('/PredictionScreen')}>
        <Text style={styles.buttonText}>Fruits</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.button} onPress={() => router.push('/PredictionScreen')}>
        <Text style={styles.buttonText}>Vegetables</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.button} onPress={() => router.push('/HomemadePredictor')}>
        <Text style={styles.buttonText}>Home Mades</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.button} onPress={() => router.push('/LabelScanner')}>
        <Text style={styles.buttonText}>Label Foods</Text>
      </TouchableOpacity>

<TouchableOpacity style={styles.button} onPress={() => router.push('/ShelfLifeEstimator')}>
        <Text style={styles.buttonText}>new</Text>
      </TouchableOpacity>



      <View style={styles.bottomNav}>
        <TouchableOpacity onPress={() => router.push('/Main')}>
          <Text style={styles.navIcon}>🏠</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => router.push('/Add')}>
          <Text style={styles.navIcon}>+</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => router.push('/HistoryScreen')}>
          <Text style={styles.navIcon}>📋</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => router.push('/Profile')}>
          <Text style={styles.navIcon}>👤</Text>
        </TouchableOpacity>

        
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f0f0f0',
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 10,
    color: '#333',
  },
  subtitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 5,
    color: '#4CAF50',
  },
  tryText: {
    fontSize: 18,
    marginBottom: 20,
    color: '#333',
    fontStyle: 'italic',
  },
  button: {
    backgroundColor: '#90EE90',
    paddingVertical: 15,
    paddingHorizontal: 50,
    borderRadius: 10,
    marginBottom: 15,
    width: '80%',
    alignItems: 'center',
  },
  buttonText: {
    fontSize: 18,
    color: '#333',
    fontWeight: 'bold',
  },
  bottomNav: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '100%',
    position: 'absolute',
    bottom: 20,
  },
  navIcon: {
    fontSize: 30,
  },
});