import React from 'react';
import { View, Text, StyleSheet, Image } from 'react-native';

export default function HomeScreen() {
  return (
    <View style={styles.container}>
      {/* App Logo */}
      <Image source={require('../assets/logo.png')} style={styles.logo} />

      {/* Title */}
      <Text style={styles.title}>HOME</Text>

      {/* Welcome */}
      <View style={styles.section}>
        <Text style={styles.sectionText}>Welcome to Freshify</Text>
      </View>

      {/* Upcoming Expirations */}
      <Text style={styles.subHeading}>Upcoming Expirations</Text>
      <View style={styles.section}>
        <Text style={styles.placeholder}>[Show next expiring items here]</Text>
      </View>

      {/* Inventory Summary */}
      <Text style={styles.subHeading}>Inventory Summary</Text>
      <View style={styles.summaryRow}>
        <View style={styles.summaryBox}><Text>Fresh</Text></View>
        <View style={styles.summaryBox}><Text>Near Spoiled</Text></View>
        <View style={styles.summaryBox}><Text>Spoiled</Text></View>
      </View>

      {/* Storage Conditions */}
      <Text style={styles.subHeading}>Storage Conditions</Text>
      <View style={styles.row}>
        <View style={styles.sectionHalf}><Text style={styles.placeholder}>[Item A]</Text></View>
        <View style={styles.sectionHalf}><Text style={styles.placeholder}>[Item B]</Text></View>
      </View>

      {/* Recipe Suggestion */}
      <Text style={styles.subHeading}>Recipe Suggestion</Text>
      <View style={styles.section}>
        <Text style={styles.placeholder}>[Suggested recipe based on items]</Text>
      </View>

      {/* TODO: Bottom navigation will be added later */}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#fff',
  },
  logo: {
    width: 60,
    height: 60,
    position: 'absolute',
    right: 20,
    top: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 80,
  },
  subHeading: {
    fontSize: 16,
    fontWeight: '600',
    marginTop: 20,
    marginBottom: 6,
  },
  section: {
    backgroundColor: '#d8fdd8',
    padding: 15,
    borderRadius: 10,
  },
  sectionText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#004d00',
  },
  placeholder: {
    color: '#555',
    fontStyle: 'italic',
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 8,
  },
  summaryBox: {
    flex: 1,
    backgroundColor: '#d8fdd8',
    padding: 12,
    marginHorizontal: 2,
    alignItems: 'center',
    borderRadius: 8,
  },
  row: {
    flexDirection: 'row',
    gap: 10,
  },
  sectionHalf: {
    flex: 1,
    backgroundColor: '#d8fdd8',
    padding: 15,
    borderRadius: 10,
  },
});
