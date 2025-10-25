import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ImageBackground,
  StatusBar,
  ScrollView,
} from 'react-native';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Import images
const fruitsImage = require('../assets/images/veg.jpg');
const homemadeImage = require('../assets/images/home2.jpg');
const labelImage = require('../assets/images/label.jpg');

export default function Main() {
  const router = useRouter();
  const [hasNewNotification, setHasNewNotification] = useState(false);

  // 🟢 Check for new notifications on load
  useEffect(() => {
    const checkNotifications = async () => {
      try {
        const saved = await AsyncStorage.getItem('notificationHistory');
        if (saved) {
          const notifications = JSON.parse(saved);
          // Show badge if any notification is recent (within 24 hours)
          const recent = notifications.some(
            (n) => new Date() - new Date(n.time) < 24 * 60 * 60 * 1000
          );
          setHasNewNotification(recent);
        } else {
          setHasNewNotification(false);
        }
      } catch (error) {
        console.error('Error checking notifications:', error);
      }
    };
    checkNotifications();
  }, []);

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#7CB342" />

      {/* Header Section */}
      <LinearGradient colors={['#7CB342', '#7CB342']} style={styles.header}>
        <View style={styles.headerRow}>
          <View>
            <Text style={styles.headerTitle}>Freshify</Text>
            <Text style={styles.headerSubtitle}>Smart Food Expiry Detection</Text>
          </View>

          {/* 🔔 Bell Icon with Red Badge */}
          <TouchableOpacity
            style={styles.bellButton}
            onPress={() => {
              setHasNewNotification(false);
              router.push('/NotificationHistoryScreen');
            }}
          >
            <Text style={styles.bellIcon}>🔔</Text>
            {hasNewNotification && <View style={styles.badgeDot} />}
          </TouchableOpacity>
        </View>
      </LinearGradient>

      {/* Scrollable Content */}
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <Text style={styles.sectionTitle}>Choose Your Category</Text>

        {/* Fruits & Vegetables */}
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
                  <Text style={styles.cardSubtitle}>
                    Analyze fruits & vegetables freshness with AI
                  </Text>
                  <View style={styles.cardBadge}>
                    <Text style={styles.badgeText}>fruits & vegies</Text>
                  </View>
                </View>
                <View style={styles.cardRight}>
                  <Text style={styles.cardIcon}>🥕🍎</Text>
                </View>
              </View>
            </LinearGradient>
          </ImageBackground>
        </TouchableOpacity>

        {/* Homemade */}
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
                  <Text style={styles.cardSubtitle}>
                    Track homemade food safety & freshness
                  </Text>
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

        {/* Label Scanner */}
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
                  <Text style={styles.cardSubtitle}>
                    Scan product labels & expiry dates
                  </Text>
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
      </ScrollView>

      {/* 🔽 Bottom Navigation (Unchanged) */}
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

// 🌿 Styles remain identical to your original with only badge added
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f4f5f4ff' },
  header: {
    paddingTop: 60,
    paddingBottom: 30,
    paddingHorizontal: 25,
    borderBottomLeftRadius: 25,
    borderBottomRightRadius: 25,
  },
  headerRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  headerTitle: { fontSize: 32, fontWeight: 'bold', color: 'white', marginBottom: 5 },
  headerSubtitle: { fontSize: 16, color: 'rgba(255,255,255,0.9)', fontWeight: '500' },
  bellButton: {
    position: 'relative',
    backgroundColor: 'rgba(255,255,255,0.2)',
    padding: 10,
    borderRadius: 25,
  },
  bellIcon: { fontSize: 22, color: '#fff' },
  badgeDot: {
    position: 'absolute',
    top: 4,
    right: 6,
    width: 10,
    height: 10,
    backgroundColor: 'red',
    borderRadius: 5,
  },
  content: { flex: 1, paddingHorizontal: 20, paddingTop: 25 },
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
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    overflow: 'hidden',
  },
  cardImage: { minHeight: 120, justifyContent: 'center' },
  cardImageStyle: { borderRadius: 20 },
  cardOverlay: { flex: 1, padding: 20, justifyContent: 'center' },
  cardContent: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  cardLeft: { flex: 1, marginRight: 15 },
  cardTitle: { fontSize: 22, fontWeight: 'bold', color: '#2C3E50', marginBottom: 8 },
  cardSubtitle: { fontSize: 14, color: '#34495E', lineHeight: 20, marginBottom: 12 },
  cardBadge: {
    backgroundColor: 'rgba(255,255,255,0.3)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 15,
    alignSelf: 'flex-start',
  },
  badgeText: { fontSize: 11, fontWeight: '600', color: '#2C3E50', letterSpacing: 0.5 },
  cardRight: { alignItems: 'center', justifyContent: 'center' },
  cardIcon: { fontSize: 45 },

  // ✅ Navigation bar styles preserved
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
  },
  navButton: { alignItems: 'center', justifyContent: 'center', paddingVertical: 5 },
  navButtonActive: {
    backgroundColor: 'rgba(255,255,255,0.15)',
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 20,
  },
  navIcon: { fontSize: 24, marginBottom: 4, opacity: 0.6 },
  navIconActive: { opacity: 1, color: '#E8F5E9' },
  navLabel: { fontSize: 12, color: '#6B7280', fontWeight: '500' },
  navLabelActive: { color: '#E8F5E9', fontWeight: '600' },
  addButton: {
    backgroundColor: '#C4EB9B',
    width: 50,
    height: 50,
    borderRadius: 25,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 4,
    elevation: 5,
  },
  addIcon: { fontSize: 24, color: 'white', fontWeight: 'bold' },
});
