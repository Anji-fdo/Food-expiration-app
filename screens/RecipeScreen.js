// screens/RecipeScreen.js
import React, { useEffect, useMemo, useState } from 'react';
import {
  View, Text, ScrollView, TextInput,
  TouchableOpacity, ActivityIndicator, Image
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useNavigation } from '@react-navigation/native';
import { Search } from 'lucide-react-native';
import { BASE_URL, FLASK_URL } from '../config/api';
import styles from '../styles/RecipeStyles';

export default function RecipeScreen() {
  const nav = useNavigation();
  const [profile, setProfile] = useState(null);
  const [risky, setRisky] = useState([]);
  const [foods, setFoods] = useState('orange, apple, ginger');
  const [records] = useState(50);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [recipes, setRecipes] = useState([]);
  const [err, setErr] = useState('');
  const [showForm, setShowForm] = useState(true);

  // In-list search state
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');

  // Debounce the search text
  useEffect(() => {
    const t = setTimeout(() => setDebouncedSearch(search.trim().toLowerCase()), 300);
    return () => clearTimeout(t);
  }, [search]); // debounce via setTimeout inside useEffect [7][13]

  // Chips from input
  const foodChips = useMemo(
    () => foods.split(',').map(s => s.trim()).filter(Boolean),
    [foods]
  ); // TextInput -> tags for API payload and display [1]

  // Filter recipes by debounced search over title/ingredients
  const filtered = useMemo(() => {
    if (!debouncedSearch) return recipes;
    return recipes.filter(r => {
      const t = String(r?.title || '').toLowerCase();
      const ing = String(r?.ingredients || '').toLowerCase();
      return t.includes(debouncedSearch) || ing.includes(debouncedSearch);
    });
  }, [recipes, debouncedSearch]); // simple, fast in-memory filter [6][21]

  // 1) Load profile
  const loadProfile = async () => {
    setErr('');
    try {
      const token = await AsyncStorage.getItem('token');
      const res = await fetch(`${BASE_URL}/users/me`, { headers: { Authorization: `Bearer ${token}` } });
      if (!res.ok) throw new Error((await res.text()) || `HTTP ${res.status}`);
      const json = await res.json();
      setProfile(json);
    } catch (e) {
      setErr(e.message);
    }
  }; // Bearer token header for profile endpoint [22][23]

  // 2) Predict risky foods from profile (return array for immediate use)
  const loadRisky = async (p) => {
    const body = {
      Age: p.Age, Gender: p.Gender, Height_cm: p.Height_cm, Weight_kg: p.Weight_kg, BMI: p.BMI,
      Chronic_Disease: p.Chronic_Disease, Blood_Pressure_Systolic: p.Blood_Pressure_Systolic,
      Blood_Pressure_Diastolic: p.Blood_Pressure_Diastolic, Cholesterol_Level: p.Cholesterol_Level,
      Blood_Sugar_Level: p.Blood_Sugar_Level, Genetic_Risk_Factor: p.Genetic_Risk_Factor,
      Allergies: p.Allergies, Daily_Steps: p.Daily_Steps, Exercise_Frequency: p.Exercise_Frequency,
      Sleep_Hours: p.Sleep_Hours, Alcohol_Consumption: p.Alcohol_Consumption, Smoking_Habit: p.Smoking_Habit,
      Dietary_Habits: p.Dietary_Habits, Caloric_Intake: p.Caloric_Intake, Protein_Intake: p.Protein_Intake,
      Carbohydrate_Intake: p.Carbohydrate_Intake, Fat_Intake: p.Fat_Intake, Preferred_Cuisine: p.Preferred_Cuisine,
      Food_Aversions: p.Food_Aversions, Recommended_Calories: p.Recommended_Calories,
      Recommended_Protein: p.Recommended_Protein, Recommended_Carbs: p.Recommended_Carbs,
      Recommended_Fats: p.Recommended_Fats, Recommended_Meal_Plan: p.Recommended_Meal_Plan,
    };
    const url = `${FLASK_URL}/predict-food-risk`;
    const res = await fetch(url, {
      method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body),
    });
    if (!res.ok) throw new Error((await res.text()) || `HTTP ${res.status}`);
    const json = await res.json();
    const cleaned = Array.isArray(json?.risky_foods) ? json.risky_foods.map(x => String(x).trim()) : [];
    setRisky(cleaned);
    return cleaned;
  }; // POST to Flask for risky_foods exclusions [22]

  // Initial load
  useEffect(() => {
    (async () => {
      setLoading(true);
      await loadProfile();
      setLoading(false);
    })();
  }, []); // fetch profile on mount, show loading state [2]

  // Generate recipes
  const generate = async () => {
    if (generating) return;
    setGenerating(true);
    setErr('');
    try {
      if (!profile) throw new Error('Profile not loaded');
      // use returned exclusions to avoid setState timing issues
      const excludes = risky.length ? risky : await loadRisky(profile);
      const body = { records_count: records, food_items: foodChips, user_exclud: excludes };
      const res = await fetch(`${FLASK_URL}/predict-recipies`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body),
      });
      if (!res.ok) throw new Error((await res.text()) || `HTTP ${res.status}`);
      const json = await res.json();
      setRecipes(Array.isArray(json?.recipies) ? json.recipies : []);
      setShowForm(false);
      setSearch(''); // clear in-list search after a fresh generation
    } catch (e) {
      console.warn('Recipe generate error:', e);
      setErr(e.message || 'Network request failed');
    } finally {
      setGenerating(false);
    }
  }; // POST to Flask for recipes, then flip to results view [22]

  // UI
  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator />
        <Text style={styles.muted}>Loading profile…</Text>
      </View>
    );
  } // simple loading fallback [2]

  return (
    <ScrollView style={styles.container} contentContainerStyle={{ paddingTop: 50, paddingBottom: 24 }}>
      {/* Form */}
      {showForm && (
        <View style={styles.searchCard}>
          <Text style={styles.h1}>Smart Recipe Suggestions</Text>
          {/* Input + trailing Search button */}
          <View style={styles.inputRow}>
            <TextInput
              value={foods}
              onChangeText={setFoods}
              placeholder="Enter ingredients, comma separated (e.g. orange, ginger)"
              placeholderTextColor="#94a3b8"
              style={styles.input}
              returnKeyType="search"
              onSubmitEditing={generate}
            />
            <TouchableOpacity style={styles.searchBtn} onPress={generate} disabled={generating}>
              {generating ? <ActivityIndicator size="small" color="#111827" /> : <Search size={18} color="#111827" />}
            </TouchableOpacity>
          </View>

          <View style={styles.chipsRow}>
            {foodChips.map((c, i) => (
              <View key={`${c}-${i}`} style={styles.chip}>
                <Text style={styles.chipTxt}>{c}</Text>
              </View>
            ))}
          </View>

          {!!err && <Text style={styles.err}>{err}</Text>}
        </View>
      )}

      {/* Results + in-list search */}
      {!showForm && (
        <>
          <View style={styles.headerRow}>
            <Text style={styles.sectionTitle}>Popular Recipes</Text>
            <TouchableOpacity onPress={() => setShowForm(true)}>
              <Text style={styles.link}>Edit ingredients</Text>
            </TouchableOpacity>
          </View>

          {/* In-list search to filter generated recipes */}
          <View style={styles.searchListRow}>
            <TextInput
              style={styles.searchListInput}
              placeholder="Search recipes (title or ingredients)"
              placeholderTextColor="#94a3b8"
              value={search}
              onChangeText={setSearch}
              returnKeyType="search"
              onSubmitEditing={() => setDebouncedSearch(search.trim().toLowerCase())}
            />
          </View>

          {filtered.map((r, idx) => (
            <TouchableOpacity
              key={`${r.title}-${idx}`}
              style={styles.card}
              onPress={() => nav.navigate('RecipeView', { recipe: r })}
              activeOpacity={0.9}
            >
              <Image source={require('../assets/images/food1.png')} style={styles.thumb} />
              <View style={{ flex: 1 }}>
                <Text style={styles.name}>{r.title}</Text>
                <Text style={styles.meta} numberOfLines={2}>
                  {String(r.ingredients || '').replace(/\s+/g, ' ').trim()}
                </Text>
                <View style={styles.badges}>
                  <View style={styles.badge}><Text style={styles.badgeTxt}>5.0★</Text></View>
                  <View style={styles.badge}><Text style={styles.badgeTxt}>Free</Text></View>
                </View>
              </View>
            </TouchableOpacity>
          ))}

          {!filtered.length && (
            <View style={styles.center}>
              <Text style={styles.muted}>No recipes match this search.</Text>
            </View>
          )}
        </>
      )}
    </ScrollView>
  );
}
