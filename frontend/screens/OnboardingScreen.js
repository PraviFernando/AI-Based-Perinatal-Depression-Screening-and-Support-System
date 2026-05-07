// ================================================================
// ONBOARDING SCREEN — OnboardingScreen.js  (Sinhala UI)
// ================================================================
import React, { useState, useRef } from 'react';
import { View, Text, StyleSheet, Dimensions, TouchableOpacity, FlatList } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { colors, spacing, radius, shadows } from '../theme';
import { SI } from '../services/translations';

const { width, height } = Dimensions.get('window');

const slides = [
  { id:'1', emoji:'🌸', title:SI.welcome,   subtitle:SI.on1Sub, gradient:['#F8F4FF','#FFE8F8'] },
  { id:'2', emoji:'📓', title:SI.on2Title,  subtitle:SI.on2Sub, gradient:['#EDE7F6','#F8F4FF'] },
  { id:'3', emoji:'💜', title:SI.on3Title,  subtitle:SI.on3Sub, gradient:['#FFF0F8','#E8F8FF'] },
  { id:'4', emoji:'🎮', title:SI.on4Title,  subtitle:SI.on4Sub, gradient:['#E8F8F0','#F0F8FF'] },
  { id:'5', emoji:'⚙️', title:SI.on5Title,  subtitle:SI.on5Sub, gradient:['#FFF9C4','#FFF0E0'] },
];

const OnboardingScreen = ({ navigation }) => {
  const [idx, setIdx] = useState(0);
  const ref = useRef(null);

  const goNext = () => {
    if (idx < slides.length - 1) {
      ref.current?.scrollToIndex({ index: idx + 1 });
      setIdx(idx + 1);
    } else {
      navigation.replace('Main');
    }
  };

  return (
    <View style={s.container}>
      <FlatList ref={ref} data={slides} keyExtractor={i=>i.id} horizontal pagingEnabled
        showsHorizontalScrollIndicator={false}
        onMomentumScrollEnd={e => setIdx(Math.round(e.nativeEvent.contentOffset.x / width))}
        renderItem={({ item }) => (
          <LinearGradient colors={item.gradient} style={s.slide}>
            <View style={s.emojiBox}><Text style={s.emoji}>{item.emoji}</Text></View>
            <Text style={s.slideTitle}>{item.title}</Text>
            <Text style={s.slideSub}>{item.subtitle}</Text>
          </LinearGradient>
        )}
      />
      <View style={s.dots}>
        {slides.map((_,i) => <View key={i} style={[s.dot, i===idx && s.dotActive]}/>)}
      </View>
      <View style={s.btnWrap}>
        <TouchableOpacity onPress={goNext} style={s.nextBtn}>
          <LinearGradient colors={[colors.lavenderDark, colors.roseDark]} style={s.nextBtnInner}>
            <Text style={s.nextBtnText}>{idx===slides.length-1 ? SI.getStarted : SI.continueBtn}</Text>
          </LinearGradient>
        </TouchableOpacity>
        {idx < slides.length - 1 && (
          <TouchableOpacity onPress={() => navigation.replace('Main')} style={s.skipBtn}>
            <Text style={s.skipText}>{SI.skipBtn}</Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
};

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.offWhite },
  slide:     { width, height, alignItems: 'center', justifyContent: 'center', paddingHorizontal: spacing.xl },
  emojiBox:  { width: 140, height: 140, borderRadius: 70, backgroundColor: 'rgba(255,255,255,0.6)', justifyContent: 'center', alignItems: 'center', marginBottom: spacing.xl, ...shadows.card },
  emoji:     { fontSize: 70 },
  slideTitle:{ fontSize: 28, fontWeight: '900', color: colors.textPrimary, textAlign: 'center', marginBottom: spacing.md },
  slideSub:  { fontSize: 16, color: colors.textSecondary, textAlign: 'center', lineHeight: 26 },
  dots:      { position: 'absolute', bottom: 160, flexDirection: 'row', gap: 8, alignSelf: 'center' },
  dot:       { width: 8, height: 8, borderRadius: 4, backgroundColor: colors.lavenderLight },
  dotActive: { width: 28, backgroundColor: colors.lavenderDark },
  btnWrap:   { position: 'absolute', bottom: 60, left: spacing.xl, right: spacing.xl, alignItems: 'center', gap: 12 },
  nextBtn:   { width: '100%', borderRadius: radius.full, overflow: 'hidden' },
  nextBtnInner:{ paddingVertical: 16, alignItems: 'center' },
  nextBtnText: { color: colors.white, fontWeight: '800', fontSize: 17 },
  skipBtn:   { paddingVertical: 8 },
  skipText:  { color: colors.textMuted, fontWeight: '600', fontSize: 14 },
});

export default OnboardingScreen;
