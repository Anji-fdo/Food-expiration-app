import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';

const members = [
  { name: 'John', age: 35, allergies: ['nuts'], preferences: ['vegetarian'], health: 'healthy' },
  { name: 'Sarah', age: 32, allergies: [], preferences: ['low-carb'], health: 'diabetic' },
  { name: 'Emma', age: 8, allergies: ['dairy'], preferences: ['mild-spicy'], health: 'healthy' },
];

export default function FamilyScreen() {
  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>Family Profiles</Text>
      {members.map((member, index) => (
        <View key={index} style={styles.card}>
          <Text style={styles.name}>{member.name} ({member.age} yrs)</Text>
          <Text style={styles.label}>Health: <Text style={styles.value}>{member.health}</Text></Text>
          <Text style={styles.label}>Allergies: <Text style={styles.value}>{member.allergies.length ? member.allergies.join(', ') : 'None'}</Text></Text>
          <Text style={styles.label}>Preferences: <Text style={styles.value}>{member.preferences.join(', ')}</Text></Text>
        </View>
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { padding: 20, backgroundColor: '#f8fafc' },
  title: { fontSize: 22, fontWeight: 'bold', textAlign: 'center', marginBottom: 20 },
  card: { backgroundColor: '#fff', padding: 15, borderRadius: 10, marginBottom: 15, borderWidth: 1, borderColor: '#e5e7eb' },
  name: { fontSize: 18, fontWeight: 'bold', marginBottom: 5 },
  label: { fontSize: 14 },
  value: { fontWeight: '500', color: '#1e40af' },
});