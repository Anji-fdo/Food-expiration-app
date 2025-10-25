import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Image,
  Alert,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter } from 'expo-router';

export default function NotificationHistoryScreen() {
  const [notifications, setNotifications] = useState([]);
  const router = useRouter();

  useEffect(() => {
    const loadNotifications = async () => {
      try {
        const saved = await AsyncStorage.getItem('notificationHistory');
        if (saved) setNotifications(JSON.parse(saved));
      } catch (error) {
        console.error('Error loading notifications:', error);
      }
    };
    loadNotifications();
  }, []);

  const clearAll = async () => {
    Alert.alert(
      'Clear All Notifications',
      'Are you sure you want to delete all notification history?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Yes, Clear All',
          style: 'destructive',
          onPress: async () => {
            await AsyncStorage.removeItem('notificationHistory');
            setNotifications([]);
          },
        },
      ]
    );
  };

  const renderNotification = ({ item }) => (
    <View style={styles.card}>
      <View style={styles.cardHeader}>
        <Text style={styles.notificationTitle}>{item.title || 'No Title'}</Text>
      </View>
      <Text style={styles.notificationBody}>{item.body || 'No message available.'}</Text>
      <Text style={styles.notificationTime}>
        {item.time ? new Date(item.time).toLocaleString() : 'Unknown time'}
      </Text>
    </View>
  );

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <Text style={styles.backIcon}>←</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Notification History</Text>
        <TouchableOpacity style={styles.clearButton} onPress={clearAll}>
          <Text style={styles.clearText}>🗑️</Text>
        </TouchableOpacity>
      </View>

      {/* No Notifications */}
      {notifications.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Image
            source={require('../assets/images/not.png')}
            style={styles.emptyImage}
            resizeMode="contain"
          />
          <Text style={styles.emptyText}>No notifications yet.</Text>
          <Text style={styles.emptySubText}>Scan a label or predict to start tracking freshness!</Text>
        </View>
      ) : (
        <FlatList
          data={notifications}
          keyExtractor={(item, index) => index.toString()}
          renderItem={renderNotification}
          contentContainerStyle={{ paddingBottom: 30 }}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#EAF4E2', paddingTop: 60, paddingHorizontal: 20 },
  header: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 25,
  },
  backButton: {
    backgroundColor: 'rgba(124,179,66,0.2)',
    borderRadius: 20,
    padding: 8,
  },
  backIcon: { fontSize: 20, color: '#4E7E18', fontWeight: 'bold' },
  headerTitle: { fontSize: 20, fontWeight: 'bold', color: '#4E7E18' },
  clearButton: {
    backgroundColor: 'rgba(255,0,0,0.1)',
    borderRadius: 20,
    padding: 8,
  },
  clearText: { fontSize: 18, color: 'red' },

  card: {
    backgroundColor: '#fff',
    padding: 18,
    borderRadius: 15,
    marginBottom: 12,
    elevation: 3,
    borderLeftWidth: 5,
    borderLeftColor: '#7CB342',
  },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  notificationTitle: { fontWeight: 'bold', fontSize: 16, color: '#2E7D32' },
  notificationBody: { color: '#444', marginVertical: 6, fontSize: 14 },
  notificationTime: { fontSize: 12, color: '#777' },

  emptyContainer: { alignItems: 'center', marginTop: 100 },
  emptyImage: { width: 150, height: 150, opacity: 0.7 },
  emptyText: { fontSize: 18, fontWeight: '600', color: '#4E7E18', marginTop: 10 },
  emptySubText: { fontSize: 14, color: '#666', marginTop: 5, textAlign: 'center' },
});
