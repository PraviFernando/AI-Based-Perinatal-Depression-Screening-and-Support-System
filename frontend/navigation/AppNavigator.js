// ================================================================
// APP NAVIGATOR — AppNavigator.js
// Bottom tabs with Sinhala labels + Art screen in stack
// ================================================================
import React from 'react';
import { View, TouchableOpacity, Text, StyleSheet } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { LinearGradient } from 'expo-linear-gradient';
import { colors, shadows, radius } from '../theme';

import DashboardScreen from '../screens/DashboardScreen copy';
import SupportScreen from '../screens/SupportScreen';
import RecommendationsScreen from '../screens/RecommendationsScreen';
import ActivityScreen from '../screens/ActivityScreen';
import ProgressScreen from '../screens/ProgressScreen';
import PreferencesScreen from '../screens/PreferencesScreen';
import ArtScreen from '../screens/ArtScreen';

const Tab = createBottomTabNavigator();
const Stack = createNativeStackNavigator();

const TABS = [
  { name: 'Home', icon: '🏠', label: 'ගෙදර', screen: DashboardScreen },
  { name: 'Support', icon: '💭', label: 'ශ්‍රේෂ්ඨ', screen: SupportScreen },
  { name: 'Recommendations', icon: '💜', label: 'ආධාර', screen: RecommendationsScreen },
  { name: 'Activity', icon: '🎮', label: 'ශ්‍රේෂ්ඨ', screen: ActivityScreen },
  { name: 'Progress', icon: '📊', label: 'ශ්‍රේෂ්ඨ', screen: ProgressScreen },
];

const CustomTabBar = ({ state, navigation }) => (
  <View style={s.wrapper}>
    <View style={s.bar}>
      {state.routes.map((route, i) => {
        const focused = state.index === i;
        const tab = TABS.find(t => t.name === route.name);
        if (!tab) return null;
        return (
          <TouchableOpacity key={route.key} style={s.tab} activeOpacity={0.75}
            onPress={() => { if (!focused) navigation.navigate(route.name); }}>
            {focused ? (
              <LinearGradient colors={[colors.lavenderDark, colors.roseDark]} style={s.activeChip}>
                <Text style={s.activeIcon}>{tab.icon}</Text>
                <Text style={s.activeLabel}>{tab.label}</Text>
              </LinearGradient>
            ) : (
              <View style={s.inactiveChip}>
                <Text style={s.inactiveIcon}>{tab.icon}</Text>
                <Text style={s.inactiveLabel}>{tab.label}</Text>
              </View>
            )}
          </TouchableOpacity>
        );
      })}
    </View>
  </View>
);

const TabsNavigator = () => (
  <Tab.Navigator tabBar={props => <CustomTabBar {...props} />} screenOptions={{ headerShown: false }}>
    {TABS.map(tab => (
      <Tab.Screen key={tab.name} name={tab.name} component={tab.screen} />
    ))}
  </Tab.Navigator>
);

const AppNavigator = () => (
  <Stack.Navigator screenOptions={{ headerShown: false }}>
    <Stack.Screen name="Tabs" component={TabsNavigator} />
    <Stack.Screen name="Preferences" component={PreferencesScreen} options={{ presentation: 'modal' }} />
    <Stack.Screen name="Art" component={ArtScreen} />
  </Stack.Navigator>
);

const s = StyleSheet.create({
  wrapper: { position: 'absolute', bottom: 0, left: 0, right: 0, paddingHorizontal: 14, paddingBottom: 24, paddingTop: 8 },
  bar: { flexDirection: 'row', backgroundColor: 'rgba(255,255,255,0.97)', borderRadius: 32, paddingVertical: 8, paddingHorizontal: 8, ...shadows.strong, alignItems: 'center' },
  tab: { flex: 1, alignItems: 'center' },
  activeChip: { borderRadius: 22, paddingVertical: 8, paddingHorizontal: 8, alignItems: 'center', minWidth: 52 },
  activeIcon: { fontSize: 16 },
  activeLabel: { fontSize: 8, color: colors.white, fontWeight: '800', marginTop: 2 },
  inactiveChip: { paddingVertical: 8, alignItems: 'center' },
  inactiveIcon: { fontSize: 18 },
  inactiveLabel: { fontSize: 8, color: colors.textMuted, fontWeight: '600', marginTop: 2 },
});

export default AppNavigator;
