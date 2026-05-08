import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import Toast from 'react-native-toast-message';

import { AuthProvider } from './context/AuthContext';

import LoginScreen from './screens/LoginScreen';
import SignupScreen from './screens/SignupScreen';
import DashboardScreen from './screens/DashboardScreen';
import DiaryScreen from './screens/DiaryScreen';
import PlanScreen from './screens/PlanScreen';
import AdminDashboardScreen from './screens/AdminDashboardScreen';
import MidwifeDashboardScreen from './screens/MidwifeDashboardScreen';

import HomeScreen from './screens/HomeScreen';
import ActivityScreen from './screens/ActivityScreen';
import ChatbotScreen from './screens/ChatbotScreen';

const Stack = createNativeStackNavigator();

export default function App() {
  return (
    <AuthProvider>
      <SafeAreaProvider>
        <NavigationContainer>
          <StatusBar style="auto" />

          <Stack.Navigator
            initialRouteName="Login"
            screenOptions={{
              headerShown: false,
            }}
          >
            {/* AUTH */}
            <Stack.Screen
              name="Login"
              component={LoginScreen}
            />

            <Stack.Screen
              name="Signup"
              component={SignupScreen}
            />

            {/* MAIN */}
            <Stack.Screen
              name="Dashboard"
              component={DashboardScreen}
            />

            <Stack.Screen
              name="Home"
              component={HomeScreen}
            />

            <Stack.Screen
              name="Diary"
              component={DiaryScreen}
            />

            <Stack.Screen
              name="Activity"
              component={ActivityScreen}
            />

            <Stack.Screen
              name="Plan"
              component={PlanScreen}
            />

            <Stack.Screen
              name="AdminDashboard"
              component={AdminDashboardScreen}
            />

            <Stack.Screen
              name="MidwifeDashboard"
              component={MidwifeDashboardScreen}
            />

            {/* CHATBOT */}
            <Stack.Screen
              name="Chatbot"
              component={ChatbotScreen}
            />
          </Stack.Navigator>
        </NavigationContainer>

        <Toast />
      </SafeAreaProvider>
    </AuthProvider>
  );
}