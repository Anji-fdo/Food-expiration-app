import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  ScrollView,
} from 'react-native';

export default function RecipeDetailScreen() {
  return (
    <ScrollView contentContainerStyle={styles.container}>
      {/* Back Button */}
      <Image source={require('../assets/back.png')} style={styles.backIcon} />

      {/* Logo */}
      <Image source={require('../assets/logo.png')} style={styles.logo} />

      {/* Title */}
      <Text style={styles.title}>Recipe Title 1</Text>

      {/* Image Placeholder */}
      <View style={styles.imagePlaceholder} />

      {/* Ingredients */}
      <Text style={styles.sectionHeading}>Ingredients</Text>
      <View style={styles.sectionBox}>
        <Text style={styles.placeholder}>- 1 cup rice{'\n'}- 1 onion{'\n'}- 1 tsp salt</Text>
      </View>

      {/* Time */}
      <Text style={styles.sectionHeading}>Time</Text>
      <View style={styles.sectionBox}>
        <Text style={styles.placeholder}>25 minutes</Text>
      </View>

      {/* Steps */}
      <Text style={styles.sectionHeading}>Steps</Text>
      <View style={[styles.sectionBox, { height: 120 }]}>
        <Text style={styles.placeholder}>
          1. Wash the rice{'\n'}
          2. Boil for 15 mins{'\n'}
          3. Add spices and mix
        </Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 20,
    paddingBottom: 60,
    backgroundColor: '#fff',
  },
  backIcon: {
    width: 24,
    height: 24,
    marginBottom: 10,
  },
  logo: {
    width: 60,
    height: 60,
    position: 'absolute',
    right: 20,
    top: 20,
  },
  title: {
    fontSize: 22,
    fontWeight: '600',
    marginBottom: 12,
  },
  imagePlaceholder: {
    width: '100%',
    height: 120,
    backgroundColor: '#c8f7c5',
    borderRadius: 10,
    marginBottom: 20,
  },
  sectionHeading: {
    fontSize: 16,
    fontWeight: '600',
    marginTop: 16,
    marginBottom: 6,
  },
  sectionBox: {
    backgroundColor: '#eee',
    padding: 12,
    borderRadius: 10,
  },
  placeholder: {
    color: '#444',
  },
});
