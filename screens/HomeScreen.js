// HomeScreen.js
import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  SafeAreaView,
  ImageBackground,
  Platform,
} from 'react-native';

export default function HomeScreen({ navigation }) {
  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView contentContainerStyle={styles.scroll}>
        {/* Banner */}
        <View style={styles.bannerWrap}>
          <ImageBackground
            source={require('../assets/images/freshify-banner-1.png')} 
            style={styles.banner}
            imageStyle={styles.bannerImage}
            resizeMode="cover"
            accessible
            accessibilityLabel="FreshiFy banner"
          >
            <View style={styles.bannerOverlay}>
              <Text style={styles.brand}>FreshiFy</Text>
              <Text style={styles.heroSubtitle}>Eat fresh. Live better.</Text>
            </View>
          </ImageBackground>
        </View>

        {/* Body */}
        <View style={styles.container}>
          <Text style={styles.title}>Welcome to FreshiFy</Text>
          <Text style={styles.subtitle}>Monitor storage from the Storage tab</Text>

          {/* Simple info cards */}
          <View style={styles.cards}>
            <View style={styles.card}>
              <Text style={styles.cardTitle}>Get Healthy Recipes</Text>
              <Text style={styles.cardText}>Get your best recipe base on medical conditions</Text>
            </View>
            <View style={styles.card}>
              <Text style={styles.cardTitle}>Healthy Living</Text>
              <Text style={styles.cardText}>Tips and reminders tailored to habits</Text>
            </View>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: '#f8fafc',
    paddingTop: 50
  },
  scroll: {
    paddingBottom: 24,
  },
  bannerWrap: {
    paddingHorizontal: 16,
    paddingTop: Platform.select({ ios: 8, android: 8 }),
  },
  banner: {
    width: '100%',
    height: 200,
    justifyContent: 'flex-end',
  },
  bannerImage: {
    borderRadius: 12,
  },
  bannerOverlay: {
    backgroundColor: 'rgba(17,24,39,0.25)',
    padding: 16,
    borderBottomLeftRadius: 12,
    borderBottomRightRadius: 12,
  },
  brand: {
    fontSize: 28,
    fontWeight: '800',
    color: '#ffffff',
    letterSpacing: 0.5,
  },
  heroSubtitle: {
    marginTop: 4,
    color: '#e5e7eb',
    fontSize: 14,
  },
  container: {
    paddingHorizontal: 16,
    paddingTop: 16,
    alignItems: 'flex-start',
  },
  title: { fontSize: 22, fontWeight: 'bold', color: '#1f2937' },
  subtitle: { fontSize: 16, color: '#6b7280', marginTop: 6 },
  cards: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 16,
    width: '100%',
  },
  card: {
    flex: 1,
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 14,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },
  cardTitle: { fontSize: 16, fontWeight: '700', color: '#111827' },
  cardText: { marginTop: 4, fontSize: 13, color: '#6b7280' },
});
