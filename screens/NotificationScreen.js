import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';

const alerts = [
  { message: 'High ammonia detected - Food spoilage alert!', priority: 'high', time: '2 min ago' },
  { message: 'Lettuce expires in 1 day', priority: 'high', time: '2 hours ago' },
  { message: 'Recipe suggestion: Use expiring lettuce', priority: 'low', time: '5 hours ago' },
];

export default function NotificationScreen() {
  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>Alerts & Notifications</Text>
      {alerts.map((alert, index) => (
        <View key={index} style={[styles.card, styles[alert.priority]]}>
          <Text style={styles.message}>{alert.message}</Text>
          <Text style={styles.time}>{alert.time}</Text>
        </View>
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { padding: 20, backgroundColor: '#fff' },
  title: { fontSize: 22, fontWeight: 'bold', marginBottom: 20, textAlign: 'center' },
  card: { borderLeftWidth: 4, padding: 15, borderRadius: 10, marginBottom: 15, backgroundColor: '#f9fafb' },
  high: { borderLeftColor: '#dc2626', backgroundColor: '#fee2e2' },
  low: { borderLeftColor: '#3b82f6', backgroundColor: '#dbeafe' },
  message: { fontSize: 16, marginBottom: 5 },
  time: { fontSize: 12, color: '#6b7280' },
});