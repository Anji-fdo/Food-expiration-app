import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, ActivityIndicator } from 'react-native';
import axios from 'axios';

export default function HistoryScreen() {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchHistory = async () => {
    try {
      const res = await axios.get('http://172.20.10.4:5000/history');
      setHistory(res.data);
    } catch (err) {
      console.error('Error fetching history:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHistory();
  }, []);

  const isEthyleneProducer = (food) => {
    const producers = ['banana', 'apple', 'avocado', 'mango', 'pear'];
    return producers.includes(food.toLowerCase());
  };

  const isSensitiveFood = (food) => {
    const sensitive = ['lettuce', 'spinach', 'broccoli', 'kale'];
    return sensitive.includes(food.toLowerCase());
  };

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>🕑 Spoilage Prediction History</Text>

      {loading ? (
        <ActivityIndicator size="large" color="#2563eb" />
      ) : (
        history.map((item, index) => (
          <View key={index} style={styles.card}>
            <Text style={styles.foodName}>
              {item.food} {isEthyleneProducer(item.food) && '🍌'} {isSensitiveFood(item.food) && '🥬'}
            </Text>
            <Text>Prediction: {item.prediction}</Text>
            <Text>Recommendation: {item.recommendation}</Text>
            <Text style={styles.timestamp}>{new Date(item.timestamp).toLocaleString()}</Text>
          </View>
        ))
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { padding: 20, backgroundColor: '#fff' },
  title: { fontSize: 22, fontWeight: 'bold', textAlign: 'center', marginBottom: 20, color: '#111827' },
  card: { backgroundColor: '#f9fafb', padding: 15, borderRadius: 10, marginBottom: 15, borderColor: '#e5e7eb', borderWidth: 1 },
  foodName: { fontSize: 18, fontWeight: 'bold', marginBottom: 5 },
  timestamp: { fontSize: 12, color: '#6b7280', marginTop: 5 },
});
