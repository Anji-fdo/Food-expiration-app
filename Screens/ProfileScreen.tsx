import React from 'react';
import {
  View,
  Text,
  Image,
  StyleSheet,
} from 'react-native';

export default function ProfileScreen() {
  return (
    <View style={styles.container}>
      {/* Top Row */}
      <View style={styles.topRow}>
        <Image source={require('../assets/back.png')} style={styles.backIcon} />
        <Image source={require('../assets/logo.png')} style={styles.logo} />
      </View>

      {/* Title */}
      <Text style={styles.title}>Profile</Text>

      {/* Profile Icon */}
      <Image source={require('../assets/profile.png')} style={styles.profileIcon} />

      {/* User Summary */}
      <View style={styles.summaryBox}>
        <Text style={styles.summaryText}>User details summary</Text>
      </View>

      {/* Bottom Navigation */}
      <View style={styles.bottomNav}>
        <Image source={require('../assets/home.jpg')} style={styles.navIcon} />
        <Image source={require('../assets/add.jpg')} style={styles.navIcon} />
        <Image source={require('../assets/inventory logo.png')} style={styles.navIcon} />
        <Image source={require('../assets/recipe.png')} style={styles.navIcon} />
        <Image source={require('../assets/profile.png')} style={styles.navIcon} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 20,
    backgroundColor: '#fff',
    flex: 1,
  },
  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  backIcon: {
    width: 24,
    height: 24,
  },
  logo: {
    width: 60,
    height: 60,
  },
  title: {
    fontSize: 22,
    fontWeight: '600',
    marginTop: 10,
    marginBottom: 30,
  },
  profileIcon: {
    width: 100,
    height: 100,
    alignSelf: 'center',
    marginBottom: 20,
  },
  summaryBox: {
    backgroundColor: '#ddd',
    padding: 20,
    borderRadius: 10,
    marginHorizontal: 20,
    alignItems: 'center',
  },
  summaryText: {
    fontSize: 16,
    color: '#333',
  },
  bottomNav: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    backgroundColor: '#e2fbe2',
    paddingVertical: 10,
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
  },
  navIcon: {
    width: 30,
    height: 30,
  },
});
