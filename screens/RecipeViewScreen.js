// screens/RecipeViewScreen.js
import React from 'react';
import { View, Text, ScrollView, Image, TouchableOpacity } from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useBottomTabBarHeight } from '@react-navigation/bottom-tabs';
import s from '../styles/RecipeViewStyles';

export default function RecipeViewScreen() {
  const nav = useNavigation();
  const { params } = useRoute();
  const recipe = params?.recipe || {};
  const insets = useSafeAreaInsets();
  const tabBarH = useBottomTabBarHeight();

  const title = typeof recipe.title === 'string' ? recipe.title : 'Recipe';
  const ingredients = String(recipe.ingredients ?? '').replace(/\s+/g, ' ').trim();
  const directions = String(recipe.directions ?? '').trim();

  return (
    <ScrollView
      style={s.container}
      contentContainerStyle={{ paddingBottom: tabBarH + Math.max(insets.bottom, 12) }}
    >
      <View style={s.heroWrap}>
        <Image source={require('../assets/images/food1.png')} style={s.hero} />
        <View style={s.heroOverlay} />
      </View>

      <View style={[s.header, { paddingTop: Math.max(insets.top, 12) }]}>
        <TouchableOpacity onPress={() => nav.goBack()} style={s.backBtn} activeOpacity={0.85}>
          <Text style={s.backTxt}>← Back</Text>
        </TouchableOpacity>

        <Text style={s.title}>{title}</Text>
        <Text style={s.sub} numberOfLines={2}>{ingredients}</Text>
      </View>

      <View style={s.card}>
        <Text style={s.cardTitle}>Directions</Text>
        <Text style={s.body}>{directions}</Text>
      </View>
    </ScrollView>
  );
}
