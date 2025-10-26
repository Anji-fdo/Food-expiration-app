// App.js
import React, { useEffect, useRef, useState } from 'react';
import { ActivityIndicator, View } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import FlashMessage from 'react-native-flash-message';
import { Home as HomeIcon, Eye, Package, ChefHat, Bell, User } from 'lucide-react-native';
import { navigationRef } from './navigationRef';

import HomeScreen from './screens/HomeScreen';
import DetectionScreen from './screens/DetectionScreen';
import StorageScreen from './screens/StorageScreen';
import NotificationScreen from './screens/NotificationScreen';
import RecipeScreen from './screens/RecipeScreen';
import LoginScreen from './screens/LoginScreen';
import ProfileScreen from './screens/ProfileScreen';
import RecipeViewScreen from './screens/RecipeViewScreen';
import RegisterScreen from './screens/RegisterScreen';


const Tab = createBottomTabNavigator();
const Stack = createNativeStackNavigator();

const RecipesStack = createNativeStackNavigator();
function RecipesStackNavigator() {
  return (
    <RecipesStack.Navigator screenOptions={{ headerShown: false }}>
      <RecipesStack.Screen name="RecipeList" component={RecipeScreen} />
      <RecipesStack.Screen name="RecipeView" component={RecipeViewScreen} />
    </RecipesStack.Navigator>
  );
}

export default function App() {
  const [loading, setLoading] = useState(true);
  const [token, setToken] = useState(null);
  const signoutTimer = useRef(null);

  const scheduleAutoSignOut = async () => {
    if (signoutTimer.current) { clearTimeout(signoutTimer.current); signoutTimer.current = null; }
    const expStr = (await AsyncStorage.getItem('token_exp')) || '';
    let expMs = parseInt(expStr, 10);
    if (!expMs) {
      expMs = Date.now() + 60 * 60 * 1000;
      await AsyncStorage.setItem('token_exp', String(expMs));
    }
    const now = Date.now();
    if (now >= expMs) {
      await AsyncStorage.multiRemove(['token', 'token_exp']);
      setToken(null);
      return;
    }
    const remaining = expMs - now;
    signoutTimer.current = setTimeout(async () => {
      await AsyncStorage.multiRemove(['token', 'token_exp']);
      setToken(null);
    }, remaining);
  };

  useEffect(() => {
    (async () => {
      const [[, t], [, expStr]] = await AsyncStorage.multiGet(['token', 'token_exp']);
      const expMs = parseInt(expStr || '0', 10) || 0;
      const now = Date.now();
      if (t && expMs && now < expMs) {
        setToken(t);
        await scheduleAutoSignOut();
      } else {
        await AsyncStorage.multiRemove(['token', 'token_exp']);
        setToken(null);
      }
      setLoading(false);
    })();
    return () => { if (signoutTimer.current) clearTimeout(signoutTimer.current); };
  }, []);

  useEffect(() => { if (token) scheduleAutoSignOut(); }, [token]);

  function Tabs() {
    return (
      <Tab.Navigator
        screenOptions={({ route }) => ({
          headerShown: false,
          tabBarIcon: ({ color, size }) => {
            const icons = { Home: HomeIcon, Detect: Eye, Storage: Package, Recipes: ChefHat, Alerts: Bell, Profile: User };
            const Icon = icons[route.name];
            return Icon ? <Icon color={color} size={size} /> : null;
          },
          tabBarActiveTintColor: '#111827',
          tabBarInactiveTintColor: '#9CA3AF',
        })}
      >
        <Tab.Screen name="Home" component={HomeScreen} />
        <Tab.Screen name="Detect" component={DetectionScreen} />
        <Tab.Screen name="Storage" component={StorageScreen} />
        <Tab.Screen name="Recipes" component={RecipesStackNavigator} />
        <Tab.Screen name="Alerts" component={NotificationScreen} />
        <Tab.Screen name="Profile">
          {() => (
            <ProfileScreen
              onSignOut={async () => {
                await AsyncStorage.multiRemove(['token', 'token_exp']);
                setToken(null); // auth gate flips to Login automatically
              }}
            />
          )}
        </Tab.Screen>
      </Tab.Navigator>
    );
  }

  if (loading) {
    return (
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
        <ActivityIndicator />
      </View>
    );
  }

  return (
    <NavigationContainer ref={navigationRef}>
      {token ? (
        <Tabs />
      ) : (
        <Stack.Navigator screenOptions={{ headerShown: false }}>
          <Stack.Screen name="Login">
            {({ navigation }) => (
              <LoginScreen
                onSignedIn={(t) => setToken(t)}
                onNavigateRegister={() => navigation.navigate('Register')}
              />
            )}
          </Stack.Screen>

          <Stack.Screen name="Register">
          {({ navigation }) => (
            <RegisterScreen
              onRegistered={() => navigation.goBack()}
              onNavigateLogin={() => navigation.goBack()}
            />
          )}
        </Stack.Screen>
        </Stack.Navigator>
      )}
      <FlashMessage position="top" floating />
    </NavigationContainer>
  );
}
