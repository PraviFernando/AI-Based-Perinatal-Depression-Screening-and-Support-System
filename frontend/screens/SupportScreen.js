// ================================================================
// SUPPORT SCREEN — SupportScreen.js  (Sinhala UI)
// Shows detected mood, risk level, support message
// ================================================================

import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { colors, spacing, radius, shadows } from '../theme';
import { useApp } from '../services/AppContext';
import { SI } from '../services/translations';

const emotionConfig = {
  happy: { emoji: '😊', label: SI.happy, gradient: ['#FFF9C4', '#FFF0E0'], color: '#E65100', bg: '#FFFDE7' },
  sad: { emoji: '😔', label: SI.sad, gradient: ['#EDE7F6', '#E3F2FD'], color: '#283593', bg: '#EDE7F6' },
  stressed: { emoji: '😟', label: SI.stressed, gradient: ['#EDE7F6', '#FCE4EC'], color: '#6A1B9A', bg: '#F3E5F5' },
};

const supportMessages = {
  happy: { title: 'ඔබ අද දිලිසෙනවා ✨', body: 'ඔබේ ධනාත්මක ශක්තිය ප්‍රමාද යයි — ඔබ සහ ඔබේ දරුවාට. මෙම සතුටු මොහොත ආදරෙන් ගෙවන්න.' },
  sad: { title: 'ඔබේ හැඟීම් වලංගුයි 🌧️', body: 'දුකක් දැනෙනවා නම් හරිය. අම්මා වීම ලෝකයේ හැහෑ දෙකක් ඇති කාර්යයකි. දැන් ඔබ වෙනුවෙන් ඉඩ ගනිමු.' },
  stressed: { title: 'ඔබ තනිව නොමැත 💜', body: 'ආතතිය ආදරය — ශ්‍රේෂ්ඨ ගොඩ බිමකට ළඟා වීමට. දැන් ඔබ සඳහා සන්සුන් සහ සහනය සොයා ගනිමු.' },
};

const SupportScreen = ({ navigation }) => {
  const { latestAnalysis, latestRecommendations, simulateNextDiary, nextDemoPreview } = useApp();
  const [processing, setProcessing] = useState(false);

  const emotion = latestAnalysis?.detectedEmotion || 'stressed';
  const risk = latestAnalysis?.riskLevel || 'low';
  const ec = emotionConfig[emotion] || emotionConfig.stressed;
  const msg = supportMessages[emotion];

  const riskPct = risk === 'medium' ? 65 : 30;
  const riskColor = risk === 'medium' ? colors.riskMediumDark : colors.riskLowDark;
  const riskBg = risk === 'medium' ? '#FFFDE7' : '#E8F5E9';
  const riskDesc = risk === 'medium' ? 'ඔබට දැන් ඉතිරි ආධාරක ශ්‍රේෂ්ඨ 💛' : 'ඔබ ශ්‍රේෂ්ඨව ගෙවනවා. දිගටම! 💚';

  const handleSimulate = () => {
    setProcessing(true);
    setTimeout(() => { simulateNextDiary(); setProcessing(false); }, 600);
  };

  return (
    <View style={s.container}>
      <LinearGradient colors={['#F8F4FF', '#FFF0F8']} style={s.gradient}>
        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={s.scroll}>

          <Text style={s.title}>{SI.emotionalAnalysis}</Text>
          <Text style={s.subtitle}>{SI.diaryProcessed}</Text>

          {/* System Note */}
          <View style={s.systemNote}>
            <Text style={s.systemNoteText}>{SI.systemNote}</Text>
          </View>

          {/* Detected Mood */}
          <LinearGradient colors={ec.gradient} style={s.moodCard}>
            <Text style={s.moodCardLabel}>{SI.detectedMood}</Text>
            <View style={s.moodRow}>
              <Text style={s.moodEmojiBig}>{ec.emoji}</Text>
              <View>
                <Text style={[s.moodName, { color: ec.color }]}>{ec.label}</Text>
                <Text style={s.moodSub}>{SI.diaryProcessed}</Text>
              </View>
            </View>
          </LinearGradient>

          {/* Risk Level */}
          <View style={[s.riskCard, { backgroundColor: riskBg }]}>
            <View style={s.riskTop}>
              <Text style={s.riskCardLabel}>{SI.riskLevel}</Text>
              <Text style={[s.riskText, { color: riskColor }]}>
                {risk === 'medium' ? 'මධ්‍යම' : 'අඩු'}
              </Text>
            </View>
            <View style={s.riskBar}>
              <View style={[s.riskBarFill, { width: `${riskPct}%`, backgroundColor: riskColor }]} />
            </View>
            <Text style={[s.riskDesc, { color: riskColor }]}>{riskDesc}</Text>
          </View>

          {/* Support Message */}
          <LinearGradient colors={['#EDE7F6', '#FCE4EC']} style={s.msgCard}>
            <Text style={s.msgTitle}>{msg.title}</Text>
            <Text style={s.msgBody}>{msg.body}</Text>
          </LinearGradient>

          {/* Medium risk urgency */}
          {risk === 'medium' && (
            <View style={s.urgencyCard}>
              <Text style={s.urgencyIcon}>💛</Text>
              <Text style={s.urgencyText}>{SI.mediumRiskMsg}</Text>
            </View>
          )}

          {/* Get Recommendations */}
          <TouchableOpacity
            onPress={() =>
              navigation.navigate('Recommendations', {
                riskLevel: latestAnalysis?.riskLevel,
                emotion: latestAnalysis?.detectedEmotion,
                primaryReason: latestAnalysis?.primaryReason,
              })
            }
            style={s.recBtn}
          >
            <LinearGradient
              colors={['#8E24AA', '#D81B60']}
              start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}
              style={s.recBtnInner}
            >
              <Text style={s.recBtnText}>{SI.getSupport}</Text>
            </LinearGradient>
          </TouchableOpacity>


          {/* Demo simulator */}
          <View style={s.demoSection}>
            <Text style={s.demoTitle}>{SI.simulateDiary}</Text>
            <Text style={s.demoPreview}>ඊළඟ: "{nextDemoPreview?.slice(0, 60)}..."</Text>
            <TouchableOpacity style={s.demoBtn} onPress={handleSimulate} disabled={processing}>
              <Text style={s.demoBtnText}>{processing ? 'විශ්ලේෂණය කරමින්...' : SI.processNewEntry}</Text>
            </TouchableOpacity>
          </View>

          <View style={{ height: 110 }} />
        </ScrollView>
      </LinearGradient>
    </View>
  );
};

const s = StyleSheet.create({
  container: { flex: 1 },
  gradient: { flex: 1 },
  scroll: { paddingHorizontal: spacing.md, paddingTop: 60 },
  title: { fontSize: 26, fontWeight: '900', color: colors.textPrimary, marginBottom: 8 },
  subtitle: { fontSize: 14, color: colors.textSecondary, lineHeight: 22, marginBottom: spacing.md },
  systemNote: {
    backgroundColor: '#F3E5F5',
    borderRadius: radius.full,
    paddingVertical: 10,
    paddingHorizontal: 16,
    marginBottom: spacing.lg,
    borderWidth: 1,
    borderColor: '#E1BEE7'
  },
  systemNoteText: { fontSize: 12, color: '#7B1FA2', fontWeight: '600' },
  moodCard: { borderRadius: radius.xl, padding: spacing.lg, marginBottom: spacing.md, ...shadows.soft },
  moodCardLabel: { fontSize: 11, fontWeight: '800', color: colors.textMuted, letterSpacing: 1.5, marginBottom: 12 },
  moodRow: { flexDirection: 'row', alignItems: 'center', gap: 16 },
  moodEmojiBig: { fontSize: 52 },
  moodName: { fontSize: 26, fontWeight: '900' },
  moodSub: { fontSize: 13, color: colors.textSecondary, marginTop: 4 },
  riskCard: { borderRadius: radius.xl, padding: spacing.lg, marginBottom: spacing.md, ...shadows.soft },
  riskTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  riskCardLabel: { fontSize: 11, fontWeight: '800', color: colors.textMuted, letterSpacing: 1.5 },
  riskText: { fontSize: 18, fontWeight: '900' },
  riskBar: { height: 10, backgroundColor: 'rgba(0,0,0,0.08)', borderRadius: 5, overflow: 'hidden', marginBottom: 10 },
  riskBarFill: { height: 10, borderRadius: 5 },
  riskDesc: { fontSize: 13, fontWeight: '600' },
  msgCard: { borderRadius: radius.xl, padding: spacing.lg, marginBottom: spacing.md, ...shadows.soft },
  msgTitle: { fontSize: 19, fontWeight: '800', color: colors.textPrimary, marginBottom: 8 },
  msgBody: { fontSize: 14, color: colors.textSecondary, lineHeight: 23 },
  urgencyCard: { flexDirection: 'row', gap: 10, alignItems: 'flex-start', backgroundColor: '#FFFDE7', borderRadius: radius.lg, padding: spacing.md, marginBottom: spacing.md, borderWidth: 1, borderColor: '#FFD54F' },
  urgencyIcon: { fontSize: 20 },
  urgencyText: { flex: 1, fontSize: 13, color: '#E65100', lineHeight: 20 },
  recBtn: { borderRadius: radius.full, overflow: 'hidden', marginBottom: spacing.xl, ...shadows.card },
  recBtnInner: { paddingVertical: 16, alignItems: 'center', justifyContent: 'center' },
  recBtnText: { color: colors.white, fontWeight: '800', fontSize: 16 },
  demoSection: { backgroundColor: colors.softGray, borderRadius: radius.xl, padding: spacing.lg },
  demoTitle: { fontSize: 14, fontWeight: '800', color: colors.textPrimary, marginBottom: 6 },
  demoPreview: { fontSize: 12, color: colors.textSecondary, marginBottom: 12, lineHeight: 18, fontStyle: 'italic' },
  demoBtn: { backgroundColor: colors.white, borderRadius: radius.full, paddingVertical: 10, paddingHorizontal: 20, alignSelf: 'flex-start', ...shadows.soft },
  demoBtnText: { color: colors.lavenderDark, fontWeight: '700', fontSize: 13 },
});

export default SupportScreen;
