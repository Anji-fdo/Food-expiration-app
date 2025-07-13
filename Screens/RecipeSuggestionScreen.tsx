import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  ScrollView,
  FlatList,
} from 'react-native';

const sampleRecipes = [
  {
    id: '1',
    title: 'Vegetable Curry',
    items: 1,
    shelfLife: 1,
  },
  {
    id: '2',
    title: 'Dhal & Rice',
    items: 1,
    shelfLife: 1,
  },
  {
    id: '3',
    title: 'Egg Fried Rice',
    items: 1,
    shelfLife: 1,
  },
];

export default function RecipeSuggestionScreen() {
  return (
    <View style={styles.container}>
      {/* Back Arrow */}
      <Image source={require('../assets/back.png')} style={styles.backIcon} />

      {/* Logo */}
      <Image source={require('../assets/logo.png')} style={styles.logo} />

      {/* Title */}
      <Text style={styles.title}>Recipe Suggestion</Text>

      {/* Greeting */}
      <Text style={styles.greeting}>Hi John!</Text>
      <Text style={styles.greeting}>How is your mood today?</Text>

      {/* Suggested Recipes */}
      <Text style={styles.subHeading}>Suggested Recipes</Text>

      <FlatList
        data={sampleRecipes}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <View style={styles.recipeCard}>
            <View style={styles.recipeImagePlaceholder} />
            <View style={styles.recipeText}>
              <Text style={styles.recipeTitle}>{item.title}</Text>
              <Text>{item.items} items: Estimated shelf-life</Text>
              <Text>{item.shelfLife} days</Text>
            </View>
          </View>
        )}
        contentContainerStyle={{ paddingBottom: 100 }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 20,
    paddingBottom: 60,
    backgroundColor: '#fff',
    flex: 1,
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
    marginBottom: 10,
  },
  greeting: {
    fontSize: 16,
    marginBottom: 4,
  },
  subHeading: {
    fontSize: 16,
    fontWeight: '600',
    marginVertical: 12,
  },
  recipeCard: {
    flexDirection: 'row',
    backgroundColor: '#eee',
    padding: 10,
    borderRadius: 10,
    marginBottom: 12,
  },
  recipeImagePlaceholder: {
    width: 70,
    height: 70,
    backgroundColor: '#c8f7c5',
    marginRight: 12,
    borderRadius: 6,
  },
  recipeText: {
    flex: 1,
    justifyContent: 'center',
  },
  recipeTitle: {
    fontWeight: 'bold',
    marginBottom: 4,
  },
});
