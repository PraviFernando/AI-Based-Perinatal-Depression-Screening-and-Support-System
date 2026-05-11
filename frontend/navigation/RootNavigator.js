// ================================================================
// ROOT NAVIGATOR — RootNavigator.js
// ================================================================
import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { StatusBar } from 'expo-status-bar';
import OnboardingScreen from '../screens/OnboardingScreen';
import AppNavigator     from './AppNavigator';

const Stack = createNativeStackNavigator();

const RootNavigator = () => (
  <NavigationContainer>
    <StatusBar style="dark" />
    <Stack.Navigator screenOptions={{ headerShown: false }} initialRouteName="Onboarding">
      <Stack.Screen name="Onboarding" component={OnboardingScreen} />
      <Stack.Screen name="Main"       component={AppNavigator}     />
    </Stack.Navigator>
  </NavigationContainer>
);

export default RootNavigator;
