// ================================================================
// PREFERENCES SCREEN — PreferencesScreen.js (Sinhala UI)
// ================================================================

import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, Dimensions } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { colors, spacing, radius, shadows } from '../theme';
import { ALL_ACTIVITIES, ALL_GAMES } from '../services/activitiesLibrary';
import { useApp } from '../services/AppContext';
import { SI } from '../services/translations';

const { width } = Dimensions.get('window');

const PreferencesScreen = ({ navigation }) => {
  const { savePreferences, userPreferredActivities, userPreferredGames } = useApp();
  const [selActs,  setSelActs]  = useState(userPreferredActivities);
  const [selGames, setSelGames] = useState(userPreferredGames);

  const toggleAct  = (id) => setSelActs(p  => p.includes(id) ? p.filter(x => x !== id) : [...p, id]);
  const toggleGame = (id) => setSelGames(p => p.includes(id) ? p.filter(x => x !== id) : [...p, id]);

  const handleSave = () => { savePreferences(selActs, selGames); navigation.goBack(); };

  return (
    <View style={s.container}>
      <LinearGradient colors={['#F8F4FF','#FFF0F8']} style={s.gradient}>
        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={s.scroll}>

          <Text style={s.title}>{SI.myPreferences}</Text>
          <Text style={s.subtitle}>{SI.prefSubtitle}</Text>

          {/* Activities */}
          <View style={s.section}>
            <View style={s.sectionHeader}>
              <Text style={s.sectionTitle}>{SI.mindfulActs}</Text>
              <Text style={s.selCount}>{selActs.length} {SI.selected}</Text>
            </View>
            <Text style={s.sectionSub}>{SI.chooseActs}</Text>
            {ALL_ACTIVITIES.map((act) => {
              const sel = selActs.includes(act.id);
              return (
                <TouchableOpacity key={act.id} onPress={() => toggleAct(act.id)}>
                  <View style={[s.actCard, sel && s.actCardSel]}>
                    <View style={[s.actIconBox, sel && { backgroundColor: act.accent + '44' }]}>
                      <Text style={s.actIcon}>{act.icon}</Text>
                    </View>
                    <View style={s.actInfo}>
                      <Text style={[s.actLabel, sel && { color: act.accent }]}>{act.label}</Text>
                      <Text style={s.actDesc}>{act.desc}</Text>
                      <View style={s.actMeta}>
                        <Text style={s.actDur}>⏱ {act.duration}</Text>
                        <View style={[s.catBadge, { backgroundColor: act.color[0] }]}>
                          <Text style={[s.catBadgeText, { color: act.accent }]}>{act.category}</Text>
                        </View>
                      </View>
                    </View>
                    <View style={[s.checkbox, sel && { backgroundColor: act.accent, borderColor: act.accent }]}>
                      {sel && <Text style={s.checkMark}>✓</Text>}
                    </View>
                  </View>
                </TouchableOpacity>
              );
            })}
          </View>

          {/* Games */}
          <View style={s.section}>
            <View style={s.sectionHeader}>
              <Text style={s.sectionTitle}>{SI.gamesSection}</Text>
              <Text style={s.selCount}>{selGames.length} {SI.selected}</Text>
            </View>
            <Text style={s.sectionSub}>{SI.chooseGames}</Text>
            <View style={s.gamesGrid}>
              {ALL_GAMES.map((game) => {
                const sel = selGames.includes(game.id);
                return (
                  <TouchableOpacity key={game.id} onPress={() => toggleGame(game.id)} style={s.gameCardWrap}>
                    <LinearGradient
                      colors={sel ? [game.accent, game.accent + 'BB'] : game.color}
                      style={[s.gameCard, sel && s.gameCardSel]}
                    >
                      {sel && <View style={s.gameCheck}><Text style={s.gameCheckText}>✓</Text></View>}
                      <Text style={s.gameIcon}>{game.icon}</Text>
                      <Text style={[s.gameName, sel && { color: colors.white }]}>{game.label}</Text>
                      <Text style={[s.gameDesc, sel && { color: 'rgba(255,255,255,0.8)' }]}>{game.labelEn}</Text>
                    </LinearGradient>
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>

          <TouchableOpacity onPress={handleSave} style={s.saveBtn}>
            <LinearGradient colors={[colors.lavenderDark, colors.roseDark]} style={s.saveBtnInner}>
              <Text style={s.saveBtnText}>{SI.savePrefs}</Text>
            </LinearGradient>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => navigation.goBack()} style={s.skipBtn}>
            <Text style={s.skipText}>{SI.skipNow}</Text>
          </TouchableOpacity>
          <View style={{ height: 40 }} />
        </ScrollView>
      </LinearGradient>
    </View>
  );
};

const s = StyleSheet.create({
  container:     { flex: 1 },
  gradient:      { flex: 1 },
  scroll:        { paddingHorizontal: spacing.md, paddingTop: 60 },
  title:         { fontSize: 26, fontWeight: '900', color: colors.textPrimary, marginBottom: 8 },
  subtitle:      { fontSize: 14, color: colors.textSecondary, lineHeight: 22, marginBottom: spacing.xl },
  section:       { marginBottom: spacing.xl },
  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 },
  sectionTitle:  { fontSize: 17, fontWeight: '800', color: colors.textPrimary },
  sectionSub:    { fontSize: 13, color: colors.textMuted, marginBottom: spacing.md },
  selCount:      { fontSize: 13, color: colors.lavenderDark, fontWeight: '700' },
  actCard:       { flexDirection: 'row', alignItems: 'center', backgroundColor: colors.white, borderRadius: radius.lg, padding: spacing.md, marginBottom: 10, borderWidth: 2, borderColor: 'transparent', ...shadows.soft },
  actCardSel:    { borderColor: colors.lavenderDark, backgroundColor: colors.lavenderLight },
  actIconBox:    { width: 48, height: 48, borderRadius: radius.md, backgroundColor: colors.softGray, justifyContent: 'center', alignItems: 'center', marginRight: 12 },
  actIcon:       { fontSize: 24 },
  actInfo:       { flex: 1 },
  actLabel:      { fontSize: 15, fontWeight: '700', color: colors.textPrimary },
  actDesc:       { fontSize: 12, color: colors.textMuted, marginTop: 2 },
  actMeta:       { flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 6 },
  actDur:        { fontSize: 11, color: colors.textSecondary, fontWeight: '600' },
  catBadge:      { borderRadius: radius.full, paddingVertical: 2, paddingHorizontal: 8 },
  catBadgeText:  { fontSize: 10, fontWeight: '700', textTransform: 'capitalize' },
  checkbox:      { width: 24, height: 24, borderRadius: 12, borderWidth: 2, borderColor: colors.lavenderMid, justifyContent: 'center', alignItems: 'center' },
  checkMark:     { color: colors.white, fontSize: 14, fontWeight: '800' },
  gamesGrid:     { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  gameCardWrap:  { width: (width - spacing.md * 2 - 10) / 2 },
  gameCard:      { borderRadius: radius.xl, padding: spacing.md, alignItems: 'center', ...shadows.soft, borderWidth: 2, borderColor: 'transparent', position: 'relative' },
  gameCardSel:   { borderColor: 'transparent' },
  gameCheck:     { position: 'absolute', top: 10, right: 10, width: 22, height: 22, borderRadius: 11, backgroundColor: 'rgba(255,255,255,0.3)', justifyContent: 'center', alignItems: 'center' },
  gameCheckText: { color: colors.white, fontWeight: '900', fontSize: 13 },
  gameIcon:      { fontSize: 36, marginBottom: 8 },
  gameName:      { fontSize: 14, fontWeight: '800', color: colors.textPrimary, textAlign: 'center' },
  gameDesc:      { fontSize: 10, color: colors.textSecondary, textAlign: 'center', marginTop: 4 },
  saveBtn:       { borderRadius: radius.full, overflow: 'hidden', marginBottom: 12 },
  saveBtnInner:  { paddingVertical: 16, alignItems: 'center' },
  saveBtnText:   { color: colors.white, fontWeight: '800', fontSize: 16 },
  skipBtn:       { alignItems: 'center', paddingVertical: 12 },
  skipText:      { color: colors.textMuted, fontWeight: '600', fontSize: 14 },
});

export default PreferencesScreen;
