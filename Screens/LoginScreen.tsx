import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Image,
} from 'react-native';

export default function LoginScreen() {
  const [name, setName] = useState('');
  const [password, setPassword] = useState('');

  return (
    <View style={styles.container}>
      {/* Top Bar */}
      <View style={styles.topRow}>
        <Image source={require('../assets/back.png')} style={styles.backIcon} />
        <Image source={require('../assets/logo.png')} style={styles.logo} />
      </View>

      {/* Title */}
      <Text style={styles.title}>Login</Text>

      {/* Form */}
      <View style={styles.form}>
        <Text style={styles.label}>Name :</Text>
        <TextInput
          style={styles.input}
          value={name}
          onChangeText={setName}
          placeholder="John"
        />

        <Text style={styles.label}>Password :</Text>
        <TextInput
          style={styles.input}
          value={password}
          onChangeText={setPassword}
          placeholder="••••••"
          secureTextEntry
        />
      </View>

      {/* Buttons */}
      <View style={styles.buttonRow}>
        <TouchableOpacity style={styles.button}>
          <Text>Login</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.button}>
          <Text>Sign up</Text>
        </TouchableOpacity>
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
    flex: 1,
    padding: 20,
    backgroundColor: '#fff',
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
    fontSize: 24,
    fontWeight: '600',
    marginVertical: 20,
  },
  form: {
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    marginTop: 10,
  },
  input: {
    backgroundColor: '#ddd',
    padding: 10,
    borderRadius: 6,
    marginBottom: 10,
  },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 10,
    marginBottom: 30,
  },
  button: {
    backgroundColor: '#ccc',
    padding: 14,
    borderRadius: 6,
    width: '45%',
    alignItems: 'center',
  },
  bottomNav: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingVertical: 10,
    backgroundColor: '#e2fbe2',
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
