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

const Stack = createNativeStackNavigator();

export default function App() {
  return (
    <AuthProvider>
      <SafeAreaProvider>
        <NavigationContainer>
          <StatusBar style="auto" />
          <Stack.Navigator initialRouteName="Login">
            <Stack.Screen name="Login" component={LoginScreen} options={{ headerShown: false }} />
            <Stack.Screen name="Signup" component={SignupScreen} options={{ headerShown: false }} />
            <Stack.Screen name="Dashboard" component={DashboardScreen} options={{ headerShown: false }} />
            <Stack.Screen name="Diary" component={DiaryScreen} options={{ headerShown: false }} />
            <Stack.Screen name="Plan" component={PlanScreen} options={{ headerShown: false }} />
            <Stack.Screen name="AdminDashboard" component={AdminDashboardScreen} options={{ headerShown: false }} />
            <Stack.Screen name="MidwifeDashboard" component={MidwifeDashboardScreen} options={{ headerShown: false }} />
          </Stack.Navigator>
        </NavigationContainer>
        {/* Global Toast */}
        <Toast />
      </SafeAreaProvider>
    </AuthProvider>
  );
}
