import React, { useEffect, useMemo, useState } from 'react';
import { View, Text, ActivityIndicator, ScrollView, RefreshControl, TouchableOpacity, Platform, Image } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useBottomTabBarHeight } from '@react-navigation/bottom-tabs';
import { BASE_URL } from '../config/api';
import s from '../styles/ProfileStyles';

const FLASK_BASE = Platform.select({
  android: 'http://10.0.2.2:5000',
  ios: 'http://127.0.0.1:5000',
  default: 'http://172.20.10.2:5000',
});

export default function ProfileScreen({ onSignOut }) {
  const insets = useSafeAreaInsets();
  const tabBarHeight = useBottomTabBarHeight();
  const [busy, setBusy] = useState(true);
  const [err, setErr] = useState('');
  const [data, setData] = useState(null);
  const [riskBusy, setRiskBusy] = useState(false);
  const [riskyFoods, setRiskyFoods] = useState([]);

  const initials = useMemo(() => {
    const name = data?.name?.trim?.();
    if (!name) return 'F';
    const [first = '', second = ''] = name.split(/\s+/);
    return `${(first || '')}${(second || '')}`.toUpperCase();
  }, [data?.name]);

  const load = async () => {
    setErr('');
    try {
      const token = await AsyncStorage.getItem('token');
      if (!token) throw new Error('Missing token');
      const res = await fetch(`${BASE_URL}/users/me`, {
        method: 'GET',
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) {
        const t = await res.text();
        throw new Error(t || `HTTP ${res.status}`);
      }
      const json = await res.json();
      setData(json);
    } catch (e) {
      setErr(e.message);
    } finally {
      setBusy(false);
    }
  };

  const predictRisk = async () => {
    if (!data) return;
    setRiskBusy(true);
    try {
      const body = {
        Age: data.Age,
        Gender: data.Gender,
        Height_cm: data.Height_cm,
        Weight_kg: data.Weight_kg,
        BMI: data.BMI,
        Chronic_Disease: data.Chronic_Disease,
        Blood_Pressure_Systolic: data.Blood_Pressure_Systolic,
        Blood_Pressure_Diastolic: data.Blood_Pressure_Diastolic,
        Cholesterol_Level: data.Cholesterol_Level,
        Blood_Sugar_Level: data.Blood_Sugar_Level,
        Genetic_Risk_Factor: data.Genetic_Risk_Factor,
        Allergies: data.Allergies,
        Daily_Steps: data.Daily_Steps,
        Exercise_Frequency: data.Exercise_Frequency,
        Sleep_Hours: data.Sleep_Hours,
        Alcohol_Consumption: data.Alcohol_Consumption,
        Smoking_Habit: data.Smoking_Habit,
        Dietary_Habits: data.Dietary_Habits,
        Caloric_Intake: data.Caloric_Intake,
        Protein_Intake: data.Protein_Intake,
        Carbohydrate_Intake: data.Carbohydrate_Intake,
        Fat_Intake: data.Fat_Intake,
        Preferred_Cuisine: data.Preferred_Cuisine,
        Food_Aversions: data.Food_Aversions,
        Recommended_Calories: data.Recommended_Calories,
        Recommended_Protein: data.Recommended_Protein,
        Recommended_Carbs: data.Recommended_Carbs,
        Recommended_Fats: data.Recommended_Fats,
        Recommended_Meal_Plan: data.Recommended_Meal_Plan,
      };

      const res = await fetch(`${FLASK_BASE}/predict-food-risk`, { // model
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
      if (!res.ok) {
        const t = await res.text();
        throw new Error(t || `HTTP ${res.status}`);
      }
      const json = await res.json();
      setRiskyFoods(Array.isArray(json?.risky_foods) ? json.risky_foods : []);
    } catch (e) {
      setRiskyFoods([]);
      setErr(e.message);
    } finally {
      setRiskBusy(false);
    }
  };

  useEffect(() => { load(); }, []);

  const logout = async () => {
    await AsyncStorage.multiRemove(['token', 'token_exp']); // optional local cleanup
    onSignOut?.(); // flips token in App -> NavigationContainer renders Login
  };

  if (busy) {
    return (
      <View style={s.center}>
        <ActivityIndicator />
        <Text style={s.muted}>Loading profile…</Text>
      </View>
    );
  }

  if (err) {
    return (
      <View style={s.center}>
        <Text style={s.error}>Failed to load: {err}</Text>
        <TouchableOpacity onPress={load} style={[s.btn, { marginTop: 12 }]}>
          <Text style={s.btnText}>Retry</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <ScrollView
      style={[s.container, { paddingTop: Math.max(insets.top, 16) }]}
      contentContainerStyle={[s.content, { paddingBottom: tabBarHeight + insets.bottom + 16 }]}
      contentInsetAdjustmentBehavior="automatic"
      refreshControl={<RefreshControl refreshing={busy} onRefresh={load} />}
    >
      <View style={s.cardHeader}>
        <Image source={require('../assets/images/profile.png')} style={s.avatarImg} resizeMode="cover" />
        <View style={{ flex: 1 }}>
          <Text style={s.name}>{data?.name}</Text>
          <Text style={s.muted}>{data?.email}</Text>
        </View>
        <TouchableOpacity onPress={logout} style={s.outBtn}>
          <Text style={s.outBtnText}>Logout</Text>
        </TouchableOpacity>
      </View>

      <View style={s.section}>
        <Text style={s.sectionTitle}>Vitals</Text>
        <View style={s.grid}>
          <Stat label="Age" value={String(data?.Age)} />
          <Stat label="Gender" value={String(data?.Gender)} />
          <Stat label="Height" value={`${data?.Height_cm} cm`} />
          <Stat label="Weight" value={`${data?.Weight_kg} kg`} />
          <Stat label="BMI" value={String(data?.BMI)} />
          <Stat label="BP" value={`${data?.Blood_Pressure_Systolic}/${data?.Blood_Pressure_Diastolic}`} />
          <Stat label="Cholesterol" value={`${data?.Cholesterol_Level} mg/dL`} />
          <Stat label="Sugar" value={`${data?.Blood_Sugar_Level} mg/dL`} />
          <Stat label="Chronic" value={String(data?.Chronic_Disease)} />
          <Stat label="Genetic Risk" value={String(data?.Genetic_Risk_Factor)} />
          <Stat label="Allergies" value={String(data?.Allergies)} />
        </View>
      </View>

      <View style={s.section}>
        <Text style={s.sectionTitle}>Lifestyle</Text>
        <View style={s.grid}>
          <Stat label="Steps/day" value={String(data?.Daily_Steps)} />
          <Stat label="Exercise" value={String(data?.Exercise_Frequency)} />
          <Stat label="Sleep" value={`${data?.Sleep_Hours} h`} />
          <Stat label="Alcohol" value={String(data?.Alcohol_Consumption)} />
          <Stat label="Smoking" value={String(data?.Smoking_Habit)} />
        </View>
      </View>

      <View style={s.section}>
        <Text style={s.sectionTitle}>Diet</Text>
        <View style={s.grid}>
          <Stat label="Diet" value={String(data?.Dietary_Habits)} />
          <Stat label="Cuisine" value={String(data?.Preferred_Cuisine)} />
          <Stat label="Aversions" value={String(data?.Food_Aversions)} />
          <Stat label="Calories" value={`${data?.Caloric_Intake} kcal`} />
          <Stat label="Protein" value={`${data?.Protein_Intake} g`} />
          <Stat label="Carbs" value={`${data?.Carbohydrate_Intake} g`} />
          <Stat label="Fat" value={`${data?.Fat_Intake} g`} />
        </View>
      </View>

      <View style={s.section}>
        <View style={s.rowBetween}>
          <Text style={s.sectionTitle}>Risky foods</Text>
          <TouchableOpacity onPress={predictRisk} style={s.btnSm} disabled={riskBusy}>
            {riskBusy ? <ActivityIndicator size="small" /> : <Text style={s.btnSmText}>Analyze</Text>}
          </TouchableOpacity>
        </View>

        {riskyFoods?.length ? (
          <View style={s.chipsWrap}>
            {riskyFoods.map((f, i) => (
              <View key={`${f}-${i}`} style={s.chipDanger}>
                <Text style={s.chipDangerText}>{String(f).trim()}</Text>
              </View>
            ))}
          </View>
        ) : (
          <Text style={s.muted}>Tap Analyze to predict risky foods from your profile.</Text>
        )}
      </View>
    </ScrollView>
  );
}

function Stat({ label, value }) {
  return (
    <View style={s.stat}>
      <Text style={s.statLabel}>{label}</Text>
      <Text style={s.statValue}>{value || '—'}</Text>
    </View>
  );
}
