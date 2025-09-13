import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ImageBackground, StatusBar, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';

// Import your images - Add these 3 images to your assets/images/ folder
const fruitsImage = require('../assets/images/veg.jpg');
const homemadeImage = require('../assets/images/home2.jpg'); 
const labelImage = require('../assets/images/label.jpg');

export default function Main() {
  const router = useRouter();

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#FF6B6B" />
      
      {/* Header Section */}
      <LinearGradient
        colors={['#7CB342', '#7CB342']}
        style={styles.header}
      >
        <Text style={styles.headerTitle}>Freshify</Text>
        <Text style={styles.headerSubtitle}>Smart Food Expiry Detection</Text>
      </LinearGradient>

      {/* Main Content */}
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <Text style={styles.sectionTitle}>Choose Your Category</Text>
        
        {/* Fruits & Vegetables Card with Image */}
        <TouchableOpacity 
          style={styles.categoryCard} 
          onPress={() => router.push('/PredictionScreen')}
          activeOpacity={0.8}
        >
          <ImageBackground
            source={fruitsImage}
            style={styles.cardImage}
            imageStyle={styles.cardImageStyle}
          >
            <LinearGradient
              colors={['rgba(255, 224, 102, 0.85)', 'rgba(255, 237, 74, 0.85)']}
              style={styles.cardOverlay}
            >
              <View style={styles.cardContent}>
                <View style={styles.cardLeft}>
                  <Text style={styles.cardTitle}>Fresh Collections</Text>
                  <Text style={styles.cardSubtitle}>Analyze fruits & vegetables freshness with AI</Text>
                  <View style={styles.cardBadge}>
                    <Text style={styles.badgeText}>fruits & vegies </Text>
                  </View>
                </View>
                <View style={styles.cardRight}>
                  <Text style={styles.cardIcon}>🥕🍎</Text>
                </View>
              </View>
            </LinearGradient>
          </ImageBackground>
        </TouchableOpacity>

        {/* Homemade Card with Image */}
        <TouchableOpacity 
          style={styles.categoryCard} 
          onPress={() => router.push('/HomemadePredictor')}
          activeOpacity={0.8}
        >
          <ImageBackground
            source={homemadeImage}
            style={styles.cardImage}
            imageStyle={styles.cardImageStyle}
          >
            <LinearGradient
              colors={['rgba(168, 230, 207, 0.85)', 'rgba(127, 205, 205, 0.85)']}
              style={styles.cardOverlay}
            >
              <View style={styles.cardContent}>
                <View style={styles.cardLeft}>
                  <Text style={styles.cardTitle}>Made Collections</Text>
                  <Text style={styles.cardSubtitle}>Track homemade food safety & freshness</Text>
                  <View style={[styles.cardBadge, styles.badgeGreen]}>
                    <Text style={styles.badgeText}>HomeMades</Text>
                  </View>
                </View>
                <View style={styles.cardRight}>
                  <Text style={styles.cardIcon}>🍲🏠</Text>
                </View>
              </View>
            </LinearGradient>
          </ImageBackground>
        </TouchableOpacity>

        {/* Label Foods Card with Image */}
        <TouchableOpacity 
          style={styles.categoryCard} 
          onPress={() => router.push('/LabelScanner')}
          activeOpacity={0.8}
        >
          <ImageBackground
            source={labelImage}
            style={styles.cardImage}
            imageStyle={styles.cardImageStyle}
          >
            <LinearGradient
              colors={['rgba(255, 179, 186, 0.85)', 'rgba(255, 154, 162, 0.85)']}
              style={styles.cardOverlay}
            >
              <View style={styles.cardContent}>
                <View style={styles.cardLeft}>
                  <Text style={styles.cardTitle}>Smart Scanner</Text>
                  <Text style={styles.cardSubtitle}>Scan product labels & expiry dates</Text>
                  <View style={[styles.cardBadge, styles.badgeCoral]}>
                    <Text style={styles.badgeText}>OCR Tech</Text>
                  </View>
                </View>
                <View style={styles.cardRight}>
                  <Text style={styles.cardIcon}>📱🏷️</Text>
                </View>
              </View>
            </LinearGradient>
          </ImageBackground>
        </TouchableOpacity>

        {/* Feature Highlight */}
        <View style={styles.featureBox}>
          <Text style={styles.featureTitle}>✨ Why Choose FreshCheck?</Text>
          <Text style={styles.featureText}>
            • AI-powered freshness detection{'\n'}
            • Real-time environmental monitoring{'\n'}
            • Smart expiry date predictions{'\n'}
            • Reduce food waste effectively
          </Text>
        </View>
      </ScrollView>

      {/* Bottom Navigation */}
      <View style={styles.bottomNav}>
        <TouchableOpacity 
          style={[styles.navButton, styles.navButtonActive]} 
          onPress={() => router.push('/Main')}
        >
          <Text style={[styles.navIcon, styles.navIconActive]}>🏠</Text>
          <Text style={[styles.navLabel, styles.navLabelActive]}>Home</Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={styles.navButton} 
          onPress={() => router.push('/Add')}
        >
          <View style={styles.addButton}>
            <Text style={styles.addIcon}>+</Text>
          </View>
          <Text style={styles.navLabel}>Add</Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={styles.navButton} 
          onPress={() => router.push('/HistoryScreen')}
        >
          <Text style={styles.navIcon}>📋</Text>
          <Text style={styles.navLabel}>History</Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={styles.navButton} 
          onPress={() => router.push('/Profile')}
        >
          <Text style={styles.navIcon}>👤</Text>
          <Text style={styles.navLabel}>Profile</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f4f5f4ff',
  },
  header: {
    paddingTop: 60,
    paddingBottom: 30,
    paddingHorizontal: 25,
    borderBottomLeftRadius: 25,
    borderBottomRightRadius: 25,
  },
  headerTitle: {
    fontSize: 32,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 5,
  },
  headerSubtitle: {
    fontSize: 16,
    color: 'rgba(255,255,255,0.9)',
    fontWeight: '500',
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 25,
  },
  sectionTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#2C3E50',
    marginBottom: 25,
    textAlign: 'center',
  },
  categoryCard: {
    marginBottom: 20,
    borderRadius: 20,
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    overflow: 'hidden', // Important for ImageBackground
  },
  cardImage: {
    minHeight: 120,
    justifyContent: 'center',
  },
  cardImageStyle: {
    borderRadius: 20,
  },
  cardOverlay: {
    flex: 1,
    padding: 20,
    justifyContent: 'center',
  },
  cardContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  cardLeft: {
    flex: 1,
    marginRight: 15,
  },
  cardTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#2C3E50',
    marginBottom: 8,
  },
  cardSubtitle: {
    fontSize: 14,
    color: '#34495E',
    lineHeight: 20,
    marginBottom: 12,
  },
  cardBadge: {
    backgroundColor: 'rgba(255,255,255,0.3)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 15,
    alignSelf: 'flex-start',
  },
  badgeGreen: {
    backgroundColor: 'rgba(255,255,255,0.25)',
  },
  badgeCoral: {
    backgroundColor: 'rgba(255,255,255,0.25)',
  },
  badgeText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#2C3E50',
    letterSpacing: 0.5,
  },
  cardRight: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardIcon: {
    fontSize: 45,
  },
  featureBox: {
    backgroundColor: 'white',
    padding: 20,
    borderRadius: 15,
    marginVertical: 20,
    marginBottom: 100,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  featureTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2C3E50',
    marginBottom: 12,
  },
  featureText: {
    fontSize: 14,
    color: '#5D6D7E',
    lineHeight: 22,
  },
  bottomNav: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    backgroundColor: '#7CB342',
    paddingVertical: 15,
    paddingHorizontal: 20,
    borderTopWidth: 1,
    borderTopColor: '#7CB342',
    elevation: 10,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: -2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 8,
  },
  navButton: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 5,
  },
  navButtonActive: {
    backgroundColor: 'rgba(255,107,107,0.1)',
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 20,
  },
  navIcon: {
    fontSize: 24,
    marginBottom: 4,
    opacity: 0.6,
  },
  navIconActive: {
    opacity: 1,
    color: '#c4eb9bff',
  },
  navLabel: {
    fontSize: 12,
    color: '#6B7280',
    fontWeight: '500',
  },
  navLabelActive: {
    color: '#e7eae5ff',
    fontWeight: '600',
  },
  addButton: {
    backgroundColor: '#c4eb9bff',
    width: 50,
    height: 50,
    borderRadius: 25,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 4,
    elevation: 5,
    shadowColor: '#c4eb9bff',
    shadowOffset: {
      width: 0,
      height: 3,
    },
    shadowOpacity: 0.3,
    shadowRadius: 5,
  },
  addIcon: {
    fontSize: 24,
    color: 'white',
    fontWeight: 'bold',
  },
});