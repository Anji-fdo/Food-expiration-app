import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator, Alert } from 'react-native';
import axios from 'axios';

export default function DetectionScreen() {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const foodName = 'apple';

  const handleCheckSpoilage = async () => {
    setLoading(true);
    try {
      const res = await axios.post('http://172.20.10.4:5000/check_spoilage', { food: foodName });
      setResult(res.data);
    } catch (err) {
      console.error(err);
      Alert.alert('Error', 'Failed to check spoilage.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Spoilage Detection</Text>
      <TouchableOpacity style={styles.button} onPress={handleCheckSpoilage}>
        <Text style={styles.buttonText}>Analyze Current Conditions</Text>
      </TouchableOpacity>
      {loading && <ActivityIndicator size="large" color="#f59e0b" style={{ marginTop: 20 }} />}
      {result && (
        <View style={styles.resultBox}>
          <Text style={styles.outcome}>Prediction: {result.prediction}</Text>
          <Text style={styles.recommend}>{result.recommendation}</Text>
          <Text style={styles.details}>Temp: {result.temperature} °C</Text>
          <Text style={styles.details}>Humidity: {result.humidity} %</Text>
          <Text style={styles.details}>Ethylene: {result.ethylene} ppm</Text>
          <Text style={styles.details}>Checked: {new Date(result.timestamp).toLocaleString()}</Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { padding: 20, backgroundColor: '#fff7ed', flex: 1 },
  title: { fontSize: 22, fontWeight: 'bold', color: '#7c2d12', textAlign: 'center', marginBottom: 20 },
  button: { backgroundColor: '#f59e0b', padding: 15, borderRadius: 10, alignItems: 'center' },
  buttonText: { color: '#fff', fontWeight: 'bold', fontSize: 16 },
  resultBox: { marginTop: 30, backgroundColor: '#fef3c7', padding: 20, borderRadius: 10, borderWidth: 1, borderColor: '#fcd34d' },
  outcome: { fontSize: 16, fontWeight: '600', color: '#92400e' },
  recommend: { fontSize: 14, color: '#78350f', marginBottom: 10 },
  details: { fontSize: 14, color: '#78350f' },
});