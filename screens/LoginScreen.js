// screens/LoginScreen.js
import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ImageBackground,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { BASE_URL } from '../config/api';
import styles from '../styles/LoginStyles';
import { Mail, Lock, Eye, EyeOff } from 'lucide-react-native';
import { showMessage } from 'react-native-flash-message';
import jwtDecode from 'jwt-decode';

export default function LoginScreen({ onSignedIn, onNavigateRegister }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPw, setShowPw] = useState(false);
  const [busy, setBusy] = useState(false);

  const submit = async () => {
    if (!email || !password) {
      showMessage({
        message: 'Missing information',
        description: 'Please enter both email and password.',
        type: 'warning',
        icon: 'warning',
        floating: true,
      }); // nicer than Alert
      return;
    }
    setBusy(true);
    try {
      const res = await fetch(`${BASE_URL}/users/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
      if (!res.ok) {
        const reason = await res.text();
        throw new Error(reason || `HTTP ${res.status}`);
      }
      const { token } = await res.json();
      if (!token) throw new Error('Missing token');

      let expMs;
      try {
        const payload = jwtDecode(token);     // { exp?: number, ... }
        expMs = payload?.exp ? payload.exp * 1000 : Date.now() + 60 * 60 * 1000;
      } catch {
        expMs = Date.now() + 60 * 60 * 1000;
      }

      // Save both values as strings; AsyncStorage stores strings
      await AsyncStorage.multiSet([
        ['token', token],
        ['token_exp', String(expMs)],
      ]);

      onSignedIn?.(token);
      showMessage({ message: 'Welcome back', description: 'Signed in successfully.', type: 'success', icon: 'success', floating: true });
    } catch (e) {
      showMessage({
        message: 'Login failed',
        description: e.message,
        type: 'danger',
        icon: 'danger',
        floating: true,
      });
    } finally {
      setBusy(false);
    }
  };

  return (
    <ImageBackground
      source={require('../assets/images/bg-1.png')}
      style={styles.bg}
      imageStyle={styles.bgImage} // tint/scale via styles
      resizeMode="cover"
    >
      <View style={styles.bgOverlay} />
      <KeyboardAvoidingView
        style={styles.container}
        behavior={Platform.select({ ios: 'padding', android: undefined })}
      >
        <View style={styles.headerCenter}>
          <Text style={styles.brand}>freshify</Text>
          <Text style={styles.tagline}>Fresh food, smart kitchen</Text>
        </View>

        <View style={styles.card}>
          <View style={styles.inputRow}>
            <Mail size={18} color="#6b7280" style={styles.inputIcon} />
            <TextInput
              style={styles.input}
              placeholder="Email"
              placeholderTextColor="#6b7280"
              autoCapitalize="none"
              keyboardType="email-address"
              returnKeyType="next"
              value={email}
              onChangeText={setEmail}
            />
          </View>

          <View style={styles.inputRow}>
            <Lock size={18} color="#6b7280" style={styles.inputIcon} />
            <TextInput
              style={styles.input}
              placeholder="Password"
              placeholderTextColor="#6b7280"
              secureTextEntry={!showPw}
              value={password}
              onChangeText={setPassword}
              returnKeyType="done"
              onSubmitEditing={submit}
            />
            <Pressable onPress={() => setShowPw((v) => !v)} hitSlop={10} style={styles.trailingIcon}>
              {showPw ? <EyeOff size={18} color="#6b7280" /> : <Eye size={18} color="#6b7280" />}
            </Pressable>
          </View>

          <TouchableOpacity style={styles.button} onPress={submit} activeOpacity={0.85} disabled={busy}>
            {busy ? <ActivityIndicator color="#111827" /> : <Text style={styles.buttonText}>Sign in</Text>}
          </TouchableOpacity>

          <View style={styles.footerRow}>
            <Text style={styles.footerText}>Don’t have an account?</Text>
            <TouchableOpacity
              onPress={() => {
                if (onNavigateRegister) onNavigateRegister();
                else Alert.alert('Register', 'Add register screen next.');
              }}
              activeOpacity={0.7}
            >
              <Text style={styles.footerLink}> Register now</Text>
            </TouchableOpacity>
          </View>
        </View>
      </KeyboardAvoidingView>
    </ImageBackground>
  );
}
