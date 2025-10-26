// screens/RegisterScreen.js
import React, { useMemo, useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from 'react-native';
import { Mail, Lock, Eye, EyeOff, User } from 'lucide-react-native';
import { showMessage } from 'react-native-flash-message';
import { BASE_URL } from '../config/api';
import styles from '../styles/RegisterStyles';
import { Picker } from '@react-native-picker/picker';

// 🛡️ Safe wrapper for raw text/icons
const SafeNode = ({ node }) => {
  if (React.isValidElement(node)) return node;
  if (typeof node === 'string' || typeof node === 'number') {
    return <Text style={{ color: '#111827' }}>{String(node)}</Text>;
  }
  if (node !== null && node !== undefined) {
    console.warn('Invalid node passed to SafeNode:', node);
  }
  return null;
};

// ✅ Updated OPTIONS to match your backend values
const OPTIONS = {
  Gender: ['Male', 'Female', 'Non-binary', 'Prefer not to say'],
  Chronic_Disease: ['None', 'Diabetes', 'Hypertension', 'Heart Disease', 'Asthma', 'Other'],
  Genetic_Risk_Factor: ['Yes', 'No'],
  Allergies: ['None', 'Peanuts', 'Tree nuts', 'Dairy', 'Eggs', 'Gluten', 'Shellfish', 'Soy', 'Other'],
  Exercise_Frequency: ['Low', 'Medium', 'High'],
  Alcohol_Consumption: ['Yes', 'No'],
  Smoking_Habit: ['Yes', 'No'],
  Dietary_Habits: ['Vegetarian', 'Non-Vegetarian', 'Vegan'],
  Preferred_Cuisine: ['Sri Lankan', 'Indian', 'Chinese', 'Italian', 'Mexican', 'Mediterranean', 'Japanese', 'Thai', 'American', 'Other'],
  Food_Aversions: ['None', 'Spicy', 'Sweet', 'Sour', 'Bitter', 'Salty', 'Lactose', 'Gluten', 'Peanuts', 'Shellfish', 'Other'],
  Recommended_Meal_Plan: ['Balanced', 'Low-Fat', 'Low-Carb', 'High-Protein', 'Weight Loss', 'Maintenance', 'Muscle Gain', 'Heart Healthy', 'Diabetic Friendly'],
};

// Which fields should be rendered as dropdowns
const TEXT_DROPDOWNS = new Set([
  'Gender',
  'Chronic_Disease',
  'Genetic_Risk_Factor',
  'Allergies',
  'Exercise_Frequency',
  'Alcohol_Consumption',
  'Smoking_Habit',
  'Dietary_Habits',
  'Preferred_Cuisine',
  'Food_Aversions',
  'Recommended_Meal_Plan',
]);

// ✅ Memoized Field to prevent losing focus
const Field = React.memo(({
  icon,
  placeholder,
  value,
  onChangeText,
  keyboardType = 'default',
  secureTextEntry = false,
  trailing,
}) => (
  <View style={styles.inputRow}>
    <SafeNode node={icon} />
    <TextInput
      style={styles.input}
      placeholder={placeholder}
      placeholderTextColor="#6b7280"
      value={value}
      onChangeText={onChangeText}
      keyboardType={keyboardType}
      secureTextEntry={secureTextEntry}
      returnKeyType="next"
    />
    <SafeNode node={trailing} />
  </View>
));

// ✅ Memoized DropDownField
const DropDownField = React.memo(({
  icon,
  placeholder,
  value,
  onValueChange,
  options = [],
}) => (
  <View style={styles.inputRow}>
    <SafeNode node={icon} />
    <View style={{ flex: 1 }}>
      <Picker
        selectedValue={value}
        onValueChange={(val) => onValueChange(val)}
        style={{ color: '#111827' }}
        dropdownIconColor="#6b7280"
      >
        <Picker.Item
          label={`Select ${placeholder}`}
          value=""
          color="#6b7280"
        />
        {options.map((opt) => (
          <Picker.Item key={opt} label={opt} value={opt} />
        ))}
      </Picker>
    </View>
  </View>
));

// ✅ Constant schema arrays (outside render) to avoid recreation
const vitalsFields = [
  { key: 'Age', type: 'number-pad' },
  { key: 'Gender' },
  { key: 'Height_cm', type: 'number-pad' },
  { key: 'Weight_kg', type: 'number-pad' },
  { key: 'BMI', type: 'decimal-pad' },
  { key: 'Chronic_Disease' },
  { key: 'Blood_Pressure_Systolic', type: 'number-pad' },
  { key: 'Blood_Pressure_Diastolic', type: 'number-pad' },
  { key: 'Cholesterol_Level', type: 'number-pad' },
  { key: 'Blood_Sugar_Level', type: 'number-pad' },
];

const lifestyleFields = [
  { key: 'Genetic_Risk_Factor' },
  { key: 'Allergies' },
  { key: 'Daily_Steps', type: 'number-pad' },
  { key: 'Exercise_Frequency' },
  { key: 'Sleep_Hours', type: 'decimal-pad' },
  { key: 'Alcohol_Consumption' },
  { key: 'Smoking_Habit' },
  { key: 'Dietary_Habits' },
  { key: 'Preferred_Cuisine' },
  { key: 'Food_Aversions' },
];

const macroFields = [
  { key: 'Caloric_Intake', type: 'number-pad' },
  { key: 'Protein_Intake', type: 'number-pad' },
  { key: 'Carbohydrate_Intake', type: 'number-pad' },
  { key: 'Fat_Intake', type: 'number-pad' },
  { key: 'Recommended_Calories', type: 'number-pad' },
  { key: 'Recommended_Protein', type: 'number-pad' },
  { key: 'Recommended_Carbs', type: 'number-pad' },
  { key: 'Recommended_Fats', type: 'number-pad' },
  { key: 'Recommended_Meal_Plan' },
];

export default function RegisterScreen({ onRegistered, onNavigateLogin }) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPw, setShowPw] = useState(false);
  const [busy, setBusy] = useState(false);

  const [form, setForm] = useState({
    Age: '', Gender: '',
    Height_cm: '', Weight_kg: '', BMI: '',
    Chronic_Disease: '',
    Blood_Pressure_Systolic: '', Blood_Pressure_Diastolic: '',
    Cholesterol_Level: '', Blood_Sugar_Level: '',
    Genetic_Risk_Factor: '',
    Allergies: '',
    Daily_Steps: '',
    Exercise_Frequency: '',
    Sleep_Hours: '',
    Alcohol_Consumption: '',
    Smoking_Habit: '',
    Dietary_Habits: '',
    Caloric_Intake: '',
    Protein_Intake: '',
    Carbohydrate_Intake: '',
    Fat_Intake: '',
    Preferred_Cuisine: '',
    Food_Aversions: '',
    Recommended_Calories: '',
    Recommended_Protein: '',
    Recommended_Carbs: '',
    Recommended_Fats: '',
    Recommended_Meal_Plan: '',
  });

  const numKeys = useMemo(() =>
    new Set([
      'Age', 'Height_cm', 'Weight_kg', 'BMI',
      'Blood_Pressure_Systolic', 'Blood_Pressure_Diastolic',
      'Cholesterol_Level', 'Blood_Sugar_Level',
      'Daily_Steps', 'Sleep_Hours',
      'Caloric_Intake', 'Protein_Intake',
      'Carbohydrate_Intake', 'Fat_Intake',
      'Recommended_Calories', 'Recommended_Protein',
      'Recommended_Carbs', 'Recommended_Fats',
    ]), []
  );

  const update = (k, v) => setForm((prev) => ({ ...prev, [k]: v }));

  const submit = async () => {
  if (!name.trim() || !email.trim() || !password.trim()) {
    showMessage({
      message: 'Missing info',
      description: 'Name, email, and password are required.',
      type: 'warning',
      icon: 'warning',
      floating: true,
    });
    return;
  }

  // ✅ Validate all form fields
  for (const [key, value] of Object.entries(form)) {
    if (value === '' || value === null || value === undefined) {
      showMessage({
        message: 'Missing info',
        description: `${key.replace(/_/g, ' ')} is required.`,
        type: 'warning',
        icon: 'warning',
        floating: true,
      });
      return;
    }
  }

  setBusy(true);
  try {
    const payload = { name: name.trim(), email: email.trim(), password };

    for (const [k, v] of Object.entries(form)) {
      if (numKeys.has(k)) {
        const n = v === '' ? '' : Number(v);
        payload[k] = Number.isFinite(n) ? n : undefined;
      } else {
        payload[k] = typeof v === 'string' ? v.trim() : v;
      }
    }

    const res = await fetch(`${BASE_URL}/users/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });

    if (!res.ok) {
      const t = await res.text();
      throw new Error(t || `HTTP ${res.status}`);
    }

    showMessage({
      message: 'Account created',
      description: 'Registration successful. Sign in to continue.',
      type: 'success',
      icon: 'success',
      floating: true,
    });

    onRegistered?.();
    onNavigateLogin?.();
  } catch (e) {
    showMessage({
      message: 'Registration failed',
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
    <KeyboardAvoidingView
      style={styles.screen}
      behavior={Platform.select({ ios: 'padding', android: undefined })}
    >
      <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
        <View style={styles.header}>
          <Text style={styles.brand}>freshify</Text>
          <Text style={styles.tagline}>Create an account</Text>
        </View>

        <View style={styles.card}>
          {/* Basic Info */}
          <Field
            icon={<User size={18} color="#6b7280" style={styles.icon} />}
            placeholder="Full name"
            value={name}
            onChangeText={setName}
          />
          <Field
            icon={<Mail size={18} color="#6b7280" style={styles.icon} />}
            placeholder="Email"
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
          />
          <Field
            icon={<Lock size={18} color="#6b7280" style={styles.icon} />}
            placeholder="Password"
            value={password}
            onChangeText={setPassword}
            secureTextEntry={!showPw}
            trailing={
              <TouchableOpacity style={styles.trailing} onPress={() => setShowPw((v) => !v)}>
                {showPw ? <EyeOff size={18} color="#6b7280" /> : <Eye size={18} color="#6b7280" />}
              </TouchableOpacity>
            }
          />

          {/* Health profile */}
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Health profile</Text>
          </View>

          {/* Vitals */}
          <View style={styles.grid2}>
            {vitalsFields.map(({ key, type = 'default' }) => (
              <View style={styles.gridItem} key={key}>
                {TEXT_DROPDOWNS.has(key) ? (
                  <DropDownField
                    placeholder={key.replace(/_/g, ' ')}
                    value={form[key]}
                    onValueChange={(v) => update(key, v)}
                    options={OPTIONS[key] || []}
                  />
                ) : (
                  <Field
                    placeholder={key.replace(/_/g, ' ')}
                    value={form[key]}
                    onChangeText={(v) => update(key, v)}
                    keyboardType={type}
                  />
                )}
              </View>
            ))}
          </View>

          {/* Lifestyle */}
          <View style={styles.grid2}>
            {lifestyleFields.map(({ key, type = 'default' }) => (
              <View style={styles.gridItem} key={key}>
                {TEXT_DROPDOWNS.has(key) ? (
                  <DropDownField
                    placeholder={key.replace(/_/g, ' ')}
                    value={form[key]}
                    onValueChange={(v) => update(key, v)}
                    options={OPTIONS[key] || []}
                  />
                ) : (
                  <Field
                    placeholder={key.replace(/_/g, ' ')}
                    value={form[key]}
                    onChangeText={(v) => update(key, v)}
                    keyboardType={type}
                  />
                )}
              </View>
            ))}
          </View>

          {/* Macros */}
          <View style={styles.grid2}>
            {macroFields.map(({ key, type = 'default' }) => (
              <View style={styles.gridItem} key={key}>
                {TEXT_DROPDOWNS.has(key) ? (
                  <DropDownField
                    placeholder={key.replace(/_/g, ' ')}
                    value={form[key]}
                    onValueChange={(v) => update(key, v)}
                    options={OPTIONS[key] || []}
                  />
                ) : (
                  <Field
                    placeholder={key.replace(/_/g, ' ')}
                    value={form[key]}
                    onChangeText={(v) => update(key, v)}
                    keyboardType={type}
                  />
                )}
              </View>
            ))}
          </View>

          <TouchableOpacity style={styles.button} onPress={submit} activeOpacity={0.85} disabled={busy}>
            {busy ? <ActivityIndicator color="#111827" /> : <Text style={styles.buttonText}>Create account</Text>}
          </TouchableOpacity>

          <View style={styles.footerRow}>
            <Text style={styles.footerText}>Already have an account?</Text>
            <TouchableOpacity onPress={onNavigateLogin} activeOpacity={0.7}>
              <Text style={styles.footerLink}> Sign in</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
