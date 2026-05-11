// ================================================================
// DASHBOARD SCREEN — DashboardScreen copy.js  (Sinhala UI with Quick Actions)
// ================================================================

import React, { useEffect, useRef } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity,
  StyleSheet, Dimensions, Animated, StatusBar,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { colors, spacing, radius, shadows } from '../theme';
import { useApp } from '../services/AppContext';
import { SI } from '../services/translations';

const { width } = Dimensions.get('window');

const emotionConfig = {
  happy:    { emoji: '😊', label: SI.happy,    gradient: ['#FFF9C4','#FFF3E0'], color: '#F57F17', bg: '#FFFDE7' },
  sad:      { emoji: '😔', label: SI.sad,      gradient: ['#E8EAF6','#E3F2FD'], color: '#3949AB', bg: '#EDE7F6' },
  stressed: { emoji: '😟', label: SI.stressed, gradient: ['#EDE7F6','#FCE4EC'], color: '#7E57C2', bg: '#F3E5F5' },
};

const summaryMessages = {
  happy:    'ඔබ අද ආලෝකය විහිදිනවා 🌸 ඒ සතුට රක්ෂා කරන්න.',
  sad:      'දුකක් දැනෙනවා නම් හරි. අපි ඔබ සමඟ ආදරෙන් ඉදිමු 💜',
  stressed: 'ඔබ ගොඩ දෙයක් රැගෙන ඉදිමු. සන්සුන් දෙයක් සොයා ගනිමු 🌿',
};

const DashboardScreenCopy = ({ navigation }) => {
  const { user, latestAnalysis, moodHistory, preferencesSet, simulateNextDiary, nextDemoPreview } = useApp();
  const fadeAnim  = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(24)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim,  { toValue: 1, duration: 700, useNativeDriver: true }),
      Animated.timing(slideAnim, { toValue: 0, duration: 700, useNativeDriver: true }),
    ]).start();
  }, []);

  const affirmation = SI.affirmations[new Date().getDay() % SI.affirmations.length];
  const emotion  = latestAnalysis?.detectedEmotion || 'stressed';
  const risk     = latestAnalysis?.riskLevel || 'low';
  const ec       = emotionConfig[emotion] || emotionConfig.stressed;
  const weekDays = moodHistory.slice(-7);

  // Quick Actions with proper navigation
  const quickActions = [
    { icon: '🎵', label: 'සංගීතය',     color: colors.lavenderLight, nav: 'Main', params: { screen: 'Tabs', params: { screen: 'Recommendations', params: { tab: 'music' } } } },
    { icon: '🧘', label: 'ක්‍රියාකාරකම්', color: colors.roseLight,     nav: 'Main', params: { screen: 'Tabs', params: { screen: 'Activity' } } },
    { icon: '🎮', label: 'ක්‍රීඩා',      color: colors.mintLight,     nav: 'Main', params: { screen: 'Tabs', params: { screen: 'Activity' } } },
    { icon: '📊', label: 'ශ්‍රේෂ්ඨතාව',  color: colors.peach,         nav: 'Main', params: { screen: 'Tabs', params: { screen: 'Progress' } } },
  ];

  return (
    <View style={s.container}>
      <StatusBar barStyle="dark-content" />
      <LinearGradient colors={['#F8F4FF','#FFF0F8','#F5FBFF']} style={s.gradient}>
        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={s.scroll}>

          {/* Back Button */}
          <TouchableOpacity onPress={() => navigation.goBack()} style={s.backBtn}>
            <Text style={s.backText}>← ආපසු</Text>
          </TouchableOpacity>

          {/* Header */}
          <Animated.View style={[s.header, { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }]}>
            <View>
              <Text style={s.greeting}>{SI.goodMorning}</Text>
              <Text style={s.name}>{SI.hi} {user.name}</Text>
              <Text style={s.week}>සතිය {user.weekPostpartum} {SI.week}</Text>
            </View>
            <View style={s.avatar}>
              <Text style={s.avatarText}>{user.name[0]}</Text>
            </View>
          </Animated.View>

          {/* Preferences prompt */}
          {!preferencesSet && (
            <TouchableOpacity onPress={() => navigation.navigate('Main', { screen: 'Preferences' })} style={s.prefBanner}>
              <Text style={s.prefBannerText}>✨ ඔබේ ආධාර පෞද්ගලිකෘත කරන්න — ඔබේ කැමති ක්‍රියාකාරකම් තෝරන්න</Text>
              <Text style={s.prefArrow}>→</Text>
            </TouchableOpacity>
          )}

          {/* Emotion Card */}
          <Animated.View style={{ opacity: fadeAnim, transform: [{ translateY: slideAnim }] }}>
            <LinearGradient colors={ec.gradient} start={{x:0,y:0}} end={{x:1,y:1}} style={s.emotionCard}>
              <View style={s.emotionTop}>
                <View style={s.emotionLeft}>
                  <Text style={s.emotionSub}>{SI.todaysFeeling}</Text>
                  <Text style={[s.emotionTitle, { color: ec.color }]}>{ec.label} {ec.emoji} {SI.feeling}</Text>
                  <View style={[s.riskBadge, { backgroundColor: ec.bg }]}>
                    <Text style={[s.riskLabel, { color: ec.color }]}>
                      {risk === 'medium' ? SI.mediumRisk : SI.lowRisk}
                    </Text>
                  </View>
                </View>
                <Text style={s.emotionEmoji}>{ec.emoji}</Text>
              </View>
              <Text style={s.emotionMsg}>{summaryMessages[emotion]}</Text>
              <TouchableOpacity style={s.viewBtn} onPress={() => navigation.navigate('Main', { screen: 'Tabs', params: { screen: 'Support' } })}>
                <Text style={[s.viewBtnText, { color: ec.color }]}>{SI.viewSupportPlan}</Text>
              </TouchableOpacity>
            </LinearGradient>
          </Animated.View>

          {/* 7-Day Strip */}
          <View style={s.section}>
            <Text style={s.sectionTitle}>{SI.thisWeek}</Text>
            <View style={s.weekStrip}>
              {weekDays.map((d, i) => {
                const e = emotionConfig[d.emotion] || emotionConfig.stressed;
                const isToday = i === weekDays.length - 1;
                return (
                  <View key={i} style={[s.dayChip, { backgroundColor: e.bg }, isToday && s.dayChipToday]}>
                    <Text style={s.dayEmoji}>{e.emoji}</Text>
                    <Text style={[s.dayLabel, isToday && { color: colors.lavenderDark, fontWeight: '800' }]}>{d.day}</Text>
                    <Text style={s.riskDot}>{d.risk === 'medium' ? '🟡' : '🟢'}</Text>
                  </View>
                );
              })}
            </View>
          </View>

          {/* Quick Actions - THIS WAS MISSING! */}
          <View style={s.section}>
            <Text style={s.sectionTitle}>{SI.quickSupport}</Text>
            <View style={s.quickGrid}>
              {quickActions.map((a, i) => (
                <TouchableOpacity 
                  key={i} 
                  style={[s.quickCard, { backgroundColor: a.color }]}
                  onPress={() => navigation.navigate(a.nav, a.params)}
                >
                  <Text style={s.quickIcon}>{a.icon}</Text>
                  <Text style={s.quickLabel}>{a.label}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Affirmation */}
          <LinearGradient colors={['#EDE7F6','#FCE4EC']} style={s.affirmCard}>
            <Text style={s.affirmTitle}>{SI.todaysAffirm}</Text>
            <Text style={s.affirmText}>"{affirmation}"</Text>
          </LinearGradient>

          {/* Demo Simulator */}
          <View style={s.demoCard}>
            <Text style={s.demoTitle}>{SI.diaryDemo}</Text>
            <Text style={s.demoPreview}>ඊළඟ: "{nextDemoPreview?.slice(0, 60)}..."</Text>
            <TouchableOpacity style={s.demoBtn}
              onPress={() => { simulateNextDiary(); navigation.navigate('Main', { screen: 'Tabs', params: { screen: 'Support' } }); }}>
              <Text style={s.demoBtnText}>{SI.processDiary}</Text>
            </TouchableOpacity>
          </View>

          <View style={{ height: 110 }} />
        </ScrollView>
      </LinearGradient>
    </View>
  );
};

const s = StyleSheet.create({
  container:      { flex: 1 },
  gradient:       { flex: 1 },
  scroll:         { paddingHorizontal: spacing.md, paddingTop: 56 },
  backBtn:        { marginBottom: 12, alignSelf: 'flex-start' },
  backText:       { color: colors.lavenderDark, fontWeight: '700', fontSize: 16 },
  header:         { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: spacing.lg },
  greeting:       { fontSize: 13, color: colors.textSecondary, fontWeight: '600' },
  name:           { fontSize: 26, fontWeight: '900', color: colors.textPrimary, marginTop: 2 },
  week:           { fontSize: 12, color: colors.textMuted, marginTop: 3 },
  avatar:         { width: 48, height: 48, borderRadius: 24, backgroundColor: colors.lavender, justifyContent: 'center', alignItems: 'center', ...shadows.soft },
  avatarText:     { fontSize: 20, fontWeight: '800', color: colors.white },
  prefBanner:     { flexDirection: 'row', alignItems: 'center', backgroundColor: colors.lavenderLight, borderRadius: radius.lg, padding: spacing.md, marginBottom: spacing.md, borderWidth: 1.5, borderColor: colors.lavenderMid },
  prefBannerText: { flex: 1, fontSize: 13, color: colors.lavenderDark, fontWeight: '700' },
  prefArrow:      { fontSize: 18, color: colors.lavenderDark },
  emotionCard:    { borderRadius: radius.xl, padding: spacing.lg, marginBottom: spacing.lg, ...shadows.card },
  emotionTop:     { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: spacing.sm },
  emotionLeft:    { flex: 1 },
  emotionSub:     { fontSize: 11, color: colors.textMuted, fontWeight: '600', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 4 },
  emotionTitle:   { fontSize: 20, fontWeight: '900', marginBottom: 10 },
  riskBadge:      { alignSelf: 'flex-start', paddingVertical: 4, paddingHorizontal: 10, borderRadius: radius.full },
  riskLabel:      { fontSize: 12, fontWeight: '800' },
  emotionEmoji:   { fontSize: 52 },
  emotionMsg:     { fontSize: 14, color: colors.textSecondary, lineHeight: 22, marginBottom: spacing.md },
  viewBtn:        { backgroundColor: 'rgba(255,255,255,0.85)', borderRadius: radius.full, paddingVertical: 10, paddingHorizontal: 18, alignSelf: 'flex-start', ...shadows.soft },
  viewBtnText:    { fontWeight: '800', fontSize: 13 },
  section:        { marginBottom: spacing.lg },
  sectionTitle:   { fontSize: 17, fontWeight: '800', color: colors.textPrimary, marginBottom: spacing.md },
  weekStrip:      { flexDirection: 'row', justifyContent: 'space-between' },
  dayChip:        { flex: 1, marginHorizontal: 2, paddingVertical: 8, alignItems: 'center', borderRadius: radius.lg },
  dayChipToday:   { borderWidth: 2, borderColor: colors.lavenderDark },
  dayEmoji:       { fontSize: 16, marginBottom: 2 },
  dayLabel:       { fontSize: 9, color: colors.textSecondary, fontWeight: '600' },
  riskDot:        { fontSize: 8, marginTop: 2 },
  quickGrid:      { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  quickCard:      { width: (width - spacing.md * 2 - 10) / 2, borderRadius: radius.xl, padding: spacing.md, alignItems: 'center', ...shadows.soft },
  quickIcon:      { fontSize: 32, marginBottom: 8 },
  quickLabel:     { fontSize: 13, fontWeight: '800', color: colors.textPrimary, textAlign: 'center' },
  affirmCard:     { borderRadius: radius.xl, padding: spacing.lg, marginBottom: spacing.md, ...shadows.soft },
  affirmTitle:    { fontSize: 13, fontWeight: '800', color: colors.lavenderDark, marginBottom: 8 },
  affirmText:     { fontSize: 15, color: colors.textSecondary, lineHeight: 24, fontStyle: 'italic' },
  demoCard:       { backgroundColor: colors.softGray, borderRadius: radius.xl, padding: spacing.lg, marginBottom: spacing.md },
  demoTitle:      { fontSize: 14, fontWeight: '800', color: colors.textPrimary, marginBottom: 6 },
  demoPreview:    { fontSize: 12, color: colors.textSecondary, fontStyle: 'italic', marginBottom: 12, lineHeight: 18 },
  demoBtn:        { backgroundColor: colors.white, borderRadius: radius.full, paddingVertical: 10, paddingHorizontal: 20, alignSelf: 'flex-start', ...shadows.soft },
  demoBtnText:    { color: colors.lavenderDark, fontWeight: '700', fontSize: 13 },
});

export default DashboardScreenCopy;