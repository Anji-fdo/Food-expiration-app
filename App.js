import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Image,
  StyleSheet,
} from 'react-native';

export default function App() {
  const [name, setName] = useState<string>('');
  const [password, setPassword] = useState<string>('');

  return (
    <View style={styles.container}>
      {/* Back Arrow */}
      <Image source={require('./assets/back.png')} style={styles.backIcon} />

      {/* App Logo */}
      <Image source={require('./assets/LOGO.png')} style={styles.logo} />

      {/* Login Title */}
      <Text style={styles.title}>Login</Text>

      {/* Input Fields */}
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
        secureTextEntry
        placeholder="••••••"
      />

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
      <View style={styles.navBar}>
        <Image source={require('./assets/home.jpg')} style={styles.navIcon} />
        <Image source={require('./assets/add.jpg')} style={styles.navIcon} />
        <Image source={require('./assets/inventory logo.png')} style={styles.navIcon} />
        <Image source={require('./assets/recipe.png')} style={styles.navIcon} />
        <Image source={require('./assets/profile.png')} style={styles.navIcon} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#ffffff',
  },
  backIcon: {
    width: 25,
    height: 25,
    marginBottom: 10,
  },
  logo: {
    width: 70,
    height: 70,
    position: 'absolute',
    top: 20,
    right: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 30,
  },
  label: {
    fontSize: 16,
    marginBottom: 4,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    backgroundColor: '#eee',
    padding: 10,
    marginBottom: 20,
    borderRadius: 6,
  },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginVertical: 10,
  },
  button: {
    padding: 12,
    backgroundColor: '#ccc',
    width: '45%',
    alignItems: 'center',
    borderRadius: 5,
  },
  navBar: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    backgroundColor: '#e0f7e9',
    paddingVertical: 10,
    position: 'absolute',
    bottom: 0,
    width: '100%',
  },
  navIcon: {
    width: 28,
    height: 28,
  },
});
