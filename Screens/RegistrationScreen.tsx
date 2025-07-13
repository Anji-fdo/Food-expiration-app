import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Image,
  Alert,
} from 'react-native';

export default function RegistrationScreen() {
  const [form, setForm] = useState({
    name: '',
    age: '',
    preferences: '',
    allergies: '',
    healthStatus: '',
    familyMember: '',
    password: '',
    confirmPassword: '',
  });

  const handleChange = (key: string, value: string) => {
    setForm({ ...form, [key]: value });
  };

  const handleSave = () => {
    if (form.password !== form.confirmPassword) {
      Alert.alert('Error', 'Passwords do not match');
      return;
    }
    // You can save data to backend or local storage here
    Alert.alert('Success', 'Registration saved!');
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      {/* Back Arrow */}
      <Image source={require('../assets/back.png')} style={styles.backIcon} />

      {/* Logo */}
      <Image source={require('../assets/logo.png')} style={styles.logo} />

      {/* Title */}
      <Text style={styles.title}>Registration</Text>

      {/* Banner placeholder */}
      <View style={styles.banner} />

      {/* Input fields */}
      <View style={styles.form}>
        {[
          { label: 'Name', key: 'name' },
          { label: 'Age', key: 'age' },
          { label: 'Preferences', key: 'preferences' },
          { label: 'Allergies', key: 'allergies' },
          { label: 'Health Status', key: 'healthStatus' },
          { label: 'Family Member', key: 'familyMember' },
          { label: 'Password', key: 'password', secure: true },
          { label: 'Re-enter the password', key: 'confirmPassword', secure: true },
        ].map((field) => (
          <View key={field.key} style={styles.inputGroup}>
            <Text style={styles.label}>{field.label} :</Text>
            <TextInput
              style={styles.input}
              value={(form as any)[field.key]}
              onChangeText={(text) => handleChange(field.key, text)}
              secureTextEntry={field.secure}
            />
          </View>
        ))}

        <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
          <Text>Save</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 20,
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
    fontSize: 24,
    fontWeight: '600',
    marginBottom: 20,
  },
  banner: {
    backgroundColor: '#d8fdd8',
    height: 80,
    marginBottom: 20,
  },
  form: {
    marginBottom: 40,
  },
  inputGroup: {
    marginBottom: 12,
  },
  label: {
    fontSize: 15,
    marginBottom: 4,
  },
  input: {
    backgroundColor: '#eee',
    padding: 10,
    borderRadius: 6,
  },
  saveButton: {
    backgroundColor: '#ccc',
    padding: 14,
    alignItems: 'center',
    borderRadius: 6,
    marginTop: 20,
  },
});
