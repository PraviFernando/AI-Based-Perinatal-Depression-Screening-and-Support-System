// ================================================================
// RECOMMENDATIONS SCREEN — RecommendationsScreen.js
// ================================================================
// WHAT THIS SCREEN SHOWS:
//   Based on IF-THEN rules (reason + risk) the system selects:
//   - 10 specific music tracks for this reason
//   - 10 specific videos for this reason
//   - 2-4 activities matching the reason+risk level
//   - 1 recommended game for this reason
//
// THE IF-THEN LOGIC IS IN:
//   src/services/activitiesLibrary.js → RECOMMENDATION_RULES object
//   src/services/emotionEngine.js     → getRecommendations() function
//
// HOW TO CONNECT REAL VIDEOS:
//   Go to: src/services/mediaLibrary.js
//   Find the reason key (e.g. 'anxiety') and change source: null
//   → source: require('../assets/videos/anxiety_calming.mp4')
//   OR → source: { uri: 'https://your-server.com/video.mp4' }
//
// HOW TO CONNECT REAL MUSIC:
//   Same as above but in src/assets/music/ folder and .mp3 files
//
// FILES CONNECTED:
//   src/services/emotionEngine.js      → provides latestRecommendations
//   src/services/activitiesLibrary.js  → ALL_GAMES list
//   src/services/AppContext.js         → useApp() hook
//   src/screens/ActivityScreen.js      → navigated to for activities/games
//   src/screens/ArtScreen.js          → navigated to for mandala/colouring
// ================================================================

import React, { useState } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity,
  StyleSheet, Dimensions, Modal,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { colors, spacing, radius, shadows } from '../theme';
import { useApp } from '../services/AppContext';
import { ALL_GAMES } from '../services/activitiesLibrary';

const { width } = Dimensions.get('window');

const TABS = [
  { id: 'music',      icon: '🎵', label: 'සංගීතය'    },
  { id: 'videos',     icon: '🎬', label: 'වීඩියෝ'    },
  { id: 'activities', icon: '🧘', label: 'ශ්‍රේෂ්ඨ'  },
  { id: 'games',      icon: '🎮', label: 'ශ්‍රේෂ්ඨ'  },
];

const EMOTION_CFG = {
  happy:    { emoji: '😊', label: 'සතුටු',    badge: ['#FFF9C4','#FFF3A0'], col: '#E65100' },
  sad:      { emoji: '😔', label: 'දුකයි',    badge: ['#EDE7F6','#D1C4E9'], col: '#6A1B9A' },
  stressed: { emoji: '😟', label: 'ආතතියයි', badge: ['#FCE4EC','#F8BBD9'], col: '#C2185B' },
};
const RISK_CFG = {
  low:    { label: '🟢 අඩු',     bg: '#E8F5E9', col: '#388E3C' },
  medium: { label: '🟡 මධ්‍යම', bg: '#FFFDE7', col: '#F57F17' },
};

// ── MEDIA PLAYER MODAL ────────────────────────────────────────
const PlayerModal = ({ item, type, onClose }) => (
  <Modal visible animationType="slide" transparent onRequestClose={onClose}>
    <View style={m.overlay}>
      <LinearGradient colors={['#F8F4FF','#FFF0F8']} style={m.sheet}>
        <Text style={m.title}>{type === 'music' ? '🎵 සංගීතය' : '🎬 වීඩියෝ'}</Text>
        <View style={m.card}>
          <Text style={m.emoji}>{item.emoji}</Text>
          <Text style={m.name}>{item.title}</Text>
          <Text style={m.sub}>{item.titleEn} · {item.duration}</Text>

          {/* ── HOW TO ADD REAL AUDIO/VIDEO ────────────────────
              1. Put your files in:
                 src/assets/music/filename.mp3
                 src/assets/videos/filename.mp4
              2. In mediaLibrary.js change:
                 source: null
                 → source: require('../assets/music/filename.mp3')
              3. Use expo-av to play:
                 import { Audio } from 'expo-av';
                 const { sound } = await Audio.Sound.createAsync(item.source);
                 await sound.playAsync();
              ────────────────────────────────────────────────── */}
          <View style={m.noSource}>
            <Text style={m.noSourceTitle}>ශ්‍රේෂ්ඨ ශ්‍රේෂ්ඨ ශ්‍රේෂ්ඨ</Text>
            <Text style={m.noSourceText}>
              {type === 'music'
                ? 'src/assets/music/ → .mp3 ශ්‍රේෂ්ඨ\nmediaLibrary.js: source: null → require(...)\nnpx expo install expo-av'
                : 'src/assets/videos/ → .mp4 ශ්‍රේෂ්ඨ\nmediaLibrary.js: source: null → require(...)\nnpx expo install expo-av'}
            </Text>
          </View>
        </View>
        <TouchableOpacity style={m.closeBtn} onPress={onClose}>
          <Text style={m.closeBtnText}>← ශ්‍රේෂ්ඨ</Text>
        </TouchableOpacity>
      </LinearGradient>
    </View>
  </Modal>
);

// ── MAIN SCREEN ───────────────────────────────────────────────
const RecommendationsScreen = ({ navigation, route }) => {
  const { latestRecommendations, latestAnalysis, userPreferredActivities } = useApp();
  const [tab,     setTab]     = useState(route?.params?.tab || 'music');
  const [playing, setPlaying] = useState(null);
  const [playType,setPlayType]= useState('music');

  const emotion = latestAnalysis?.detectedEmotion || 'stressed';
  const risk    = latestAnalysis?.riskLevel       || 'low';
  const rec     = latestRecommendations;
  const ec      = EMOTION_CFG[emotion] || EMOTION_CFG.stressed;
  const rc      = RISK_CFG[risk]       || RISK_CFG.low;

  if (!rec) return (
    <View style={s.loading}>
      <Text style={s.loadingText}>🌸 ශ්‍රේෂ්ඨ ශ්‍රේෂ්ඨ...</Text>
    </View>
  );

  // ── MUSIC TAB ─────────────────────────────────────────────
  const renderMusic = () => (
    <View>
      <Text style={s.tabIntro}>ශ්‍රේෂ්ඨ ශ්‍රේෂ්ඨ ශ්‍රේෂ්ඨ 🎵</Text>
      {rec.music.map(track => (
        <TouchableOpacity key={track.id} style={s.mediaCard}
          onPress={() => { setPlaying(track); setPlayType('music'); }}>
          <View style={[s.mediaIcon, { backgroundColor: colors.lavenderLight }]}>
            <Text style={s.mediaEmoji}>{track.emoji}</Text>
          </View>
          <View style={s.mediaInfo}>
            <Text style={s.mediaTitle}>{track.title}</Text>
            <Text style={s.mediaSub}>{track.titleEn} · {track.duration}</Text>
          </View>
          <View style={[s.playBtn, { backgroundColor: colors.lavenderLight }]}>
            <Text style={[s.playArrow, { color: colors.lavenderDark }]}>▶</Text>
          </View>
        </TouchableOpacity>
      ))}
    </View>
  );

  // ── VIDEOS TAB ────────────────────────────────────────────
  const renderVideos = () => (
    <View>
      <Text style={s.tabIntro}>ශ්‍රේෂ්ඨ ශ්‍රේෂ්ඨ ශ්‍රේෂ්ඨ 🎬</Text>
      {rec.videos.map(video => (
        <TouchableOpacity key={video.id} style={s.mediaCard}
          onPress={() => { setPlaying(video); setPlayType('video'); }}>
          <View style={[s.mediaIcon, { backgroundColor: colors.roseLight }]}>
            <Text style={s.mediaEmoji}>{video.emoji}</Text>
          </View>
          <View style={s.mediaInfo}>
            <Text style={s.mediaTitle}>{video.title}</Text>
            <Text style={s.mediaSub}>{video.titleEn} · {video.duration}</Text>
          </View>
          <View style={[s.playBtn, { backgroundColor: colors.roseLight }]}>
            <Text style={[s.playArrow, { color: colors.roseDark }]}>▶</Text>
          </View>
        </TouchableOpacity>
      ))}
    </View>
  );

  // ── ACTIVITIES TAB ─────────────────────────────────────────
  const renderActivities = () => (
    <View>
      {/* Risk level context — short, clean */}
      <View style={[s.riskNote, { backgroundColor: rc.bg }]}>
        <Text style={[s.riskNoteText, { color: rc.col }]}>
          {rc.label} {risk === 'medium'
            ? '— ශ්‍රේෂ්ඨ ශ්‍රේෂ්ඨ ශ්‍රේෂ්ඨ ශ්‍රේෂ්ඨ'
            : '— ශ්‍රේෂ්ඨ ශ්‍රේෂ්ඨ ශ්‍රේෂ්ඨ'}
        </Text>
      </View>

      {rec.activities.length === 0 ? (
        <View style={s.emptyBox}>
          <Text style={s.emptyEmoji}>🌸</Text>
          <Text style={s.emptyText}>ශ්‍රේෂ්ඨ ශ්‍රේෂ්ඨ ශ්‍රේෂ්ඨ.</Text>
        </View>
      ) : rec.activities.map((act, idx) => (
        <TouchableOpacity key={act.id}
          onPress={() => navigation.navigate('Activity', { activityId: act.id })}
          style={s.actCard}>
          <LinearGradient colors={act.color} style={s.actGrad}>
            {/* ── FIRST ACTIVITY gets "Start Here" badge when risk=medium */}
            {idx === 0 && risk === 'medium' && (
              <View style={s.firstBadge}>
                <Text style={s.firstBadgeText}>ශ්‍රේෂ්ඨ ශ්‍රේෂ්ඨ</Text>
              </View>
            )}
            <Text style={s.actIcon}>{act.icon}</Text>
            <View style={s.actInfo}>
              <Text style={[s.actTitle, { color: act.accent }]}>{act.label}</Text>
              <Text style={s.actDesc}>{act.desc}</Text>
              <Text style={s.actDur}>⏱ {act.duration} · {act.category}</Text>
            </View>
            <View style={[s.startBtn, { backgroundColor: act.accent + '22' }]}>
              <Text style={[s.startBtnT, { color: act.accent }]}>ශ්‍රේෂ්ඨ</Text>
            </View>
          </LinearGradient>
        </TouchableOpacity>
      ))}

      {/* Preferences shortcut */}
      <TouchableOpacity onPress={() => navigation.navigate('Preferences')} style={s.prefNote}>
        <Text style={s.prefNoteText}>
          {userPreferredActivities.length > 0
            ? `⚙️ ශ්‍රේෂ්ඨ ශ්‍රේෂ්ඨ ${userPreferredActivities.length}ක් ශ්‍රේෂ්ඨ. ශ්‍රේෂ්ඨ →`
            : '⚙️ ශ්‍රේෂ්ඨ ශ්‍රේෂ්ඨ ශ්‍රේෂ්ඨ ශ්‍රේෂ්ඨ →'}
        </Text>
      </TouchableOpacity>
    </View>
  );

  // ── GAMES TAB ─────────────────────────────────────────────
  const renderGames = () => (
    <View>
      {/* Primary recommended game */}
      {rec.game && (
        <View style={s.recGame}>
          <Text style={s.recGameLabel}>⭐ ශ්‍රේෂ්ඨ ශ්‍රේෂ්ඨ</Text>
          <TouchableOpacity
            onPress={() => {
              // ── GAME NAVIGATION ────────────────────────────
              // mandala and colouring go to ArtScreen
              // all other games go to ActivityScreen with gameId param
              if (rec.game.id === 'mandala' || rec.game.id === 'colouring') {
                navigation.navigate('Art');
              } else {
                navigation.navigate('Activity', { gameId: rec.game.id });
              }
            }}>
            <LinearGradient colors={rec.game.color} style={s.primaryGameCard}>
              <Text style={s.primaryGameIcon}>{rec.game.icon}</Text>
              <View style={s.primaryGameInfo}>
                <Text style={[s.primaryGameName, { color: rec.game.accent }]}>{rec.game.label}</Text>
                <Text style={s.primaryGameSub}>{rec.game.labelEn}</Text>
              </View>
              <View style={[s.playBigBtn, { backgroundColor: rec.game.accent }]}>
                <Text style={s.playBigBtnText}>ශ්‍රේෂ්ඨ →</Text>
              </View>
            </LinearGradient>
          </TouchableOpacity>
        </View>
      )}

      {/* Art gallery shortcut */}
      <TouchableOpacity onPress={() => navigation.navigate('Art')} style={s.artCard}>
        <Text style={s.artCardIcon}>🎨</Text>
        <View style={s.artCardInfo}>
          <Text style={s.artCardTitle}>ශ්‍රේෂ්ඨ ශ්‍රේෂ්ඨ + ශ්‍රේෂ්ඨ</Text>
          <Text style={s.artCardSub}>ශ්‍රේෂ්ඨ 10 + ශ්‍රේෂ්ඨ 10 · ශ්‍රේෂ්ඨ</Text>
        </View>
        <Text style={s.artCardArrow}>→</Text>
      </TouchableOpacity>

      {/* All games grid */}
      <Text style={s.allGamesLabel}>ශ්‍රේෂ්ඨ ශ්‍රේෂ්ඨ:</Text>
      <View style={s.gamesGrid}>
        {ALL_GAMES.map(game => {
          const isRec = rec.game?.id === game.id;
          return (
            <TouchableOpacity key={game.id} style={s.gameCardWrap}
              onPress={() => {
                if (game.id === 'mandala' || game.id === 'colouring') navigation.navigate('Art');
                else navigation.navigate('Activity', { gameId: game.id });
              }}>
              <LinearGradient colors={game.color}
                style={[s.gameCard, isRec && { borderWidth:2, borderColor: game.accent }]}>
                {isRec && <Text style={s.isRecStar}>⭐</Text>}
                <Text style={s.gameIcon}>{game.icon}</Text>
                <Text style={[s.gameName, { color: game.accent }]}>{game.label}</Text>
                <Text style={s.gameDesc}>{game.labelEn}</Text>
              </LinearGradient>
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );

  return (
    <View style={s.container}>
      <LinearGradient colors={['#F8F4FF','#FFF0F8']} style={s.gradient}>
        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={s.scroll}>

          {/* Back button */}
          <TouchableOpacity onPress={() => navigation.goBack()} style={s.backBtn}>
            <Text style={s.backText}>← ශ්‍රේෂ්ඨ</Text>
          </TouchableOpacity>

          <Text style={s.title}>ශ්‍රේෂ්ඨ ශ්‍රේෂ්ඨ 💜</Text>

          {/* Emotion + Risk badges (clean, no IF-THEN card) */}
          <View style={s.badgesRow}>
            <LinearGradient colors={ec.badge} style={s.badge}>
              <Text style={[s.badgeText, { color: ec.col }]}>{ec.emoji} {ec.label}</Text>
            </LinearGradient>
            <View style={[s.badge, { backgroundColor: rc.bg }]}>
              <Text style={[s.badgeText, { color: rc.col }]}>{rc.label}</Text>
            </View>
          </View>

          {/* Medium risk notice */}
          {risk === 'medium' && (
            <View style={s.urgencyCard}>
              <Text style={s.urgencyIcon}>💛</Text>
              <Text style={s.urgencyText}>
                ශ්‍රේෂ්ඨ ශ්‍රේෂ්ඨ. ශ්‍රේෂ්ඨ ශ්‍රේෂ්ඨ ශ්‍රේෂ්ඨ ශ්‍රේෂ්ඨ ශ්‍රේෂ්ඨ ශ්‍රේෂ්ඨ 💜
              </Text>
            </View>
          )}

          {/* Support messages */}
          {rec.messages?.map((msg, i) => (
            <LinearGradient key={i} colors={i===0?['#EDE7F6','#FCE4EC']:['#FCE4EC','#EDE7F6']} style={s.msgCard}>
              <Text style={s.msgText}>{msg}</Text>
            </LinearGradient>
          ))}

          {/* Tabs */}
          <ScrollView horizontal showsHorizontalScrollIndicator={false}
            style={s.tabsScroll} contentContainerStyle={s.tabsCont}>
            {TABS.map(t => (
              <TouchableOpacity key={t.id} onPress={() => setTab(t.id)}
                style={[s.tab, tab === t.id && s.tabActive]}>
                <Text style={s.tabIcon}>{t.icon}</Text>
                <Text style={[s.tabLabel, tab === t.id && s.tabLabelActive]}>{t.label}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>

          <View style={s.tabContent}>
            {tab === 'music'      && renderMusic()}
            {tab === 'videos'     && renderVideos()}
            {tab === 'activities' && renderActivities()}
            {tab === 'games'      && renderGames()}
          </View>

          <View style={{ height: 110 }} />
        </ScrollView>
      </LinearGradient>

      {/* Audio/Video Player Modal */}
      {playing && (
        <PlayerModal item={playing} type={playType} onClose={() => setPlaying(null)} />
      )}
    </View>
  );
};

const m = StyleSheet.create({
  overlay:      { flex:1, backgroundColor:'rgba(0,0,0,0.55)', justifyContent:'flex-end' },
  sheet:        { borderTopLeftRadius:radius.xl, borderTopRightRadius:radius.xl, padding:spacing.xl, paddingBottom:40 },
  title:        { fontSize:20, fontWeight:'900', color:colors.textPrimary, textAlign:'center', marginBottom:spacing.lg },
  card:         { backgroundColor:colors.white, borderRadius:radius.xl, padding:spacing.xl, alignItems:'center', ...shadows.card },
  emoji:        { fontSize:52, marginBottom:12 },
  name:         { fontSize:17, fontWeight:'800', color:colors.textPrimary, textAlign:'center', marginBottom:4 },
  sub:          { fontSize:12, color:colors.textMuted, marginBottom:spacing.md },
  noSource:     { backgroundColor:colors.softGray, borderRadius:radius.lg, padding:spacing.md, width:'100%', marginBottom:spacing.md },
  noSourceTitle:{ fontSize:12, fontWeight:'700', color:colors.textSecondary, marginBottom:4 },
  noSourceText: { fontSize:11, color:colors.textSecondary, lineHeight:18 },
  closeBtn:     { alignSelf:'center', marginTop:spacing.lg },
  closeBtnText: { color:colors.lavenderDark, fontWeight:'700', fontSize:15 },
});

const s = StyleSheet.create({
  container:   { flex:1 },
  gradient:    { flex:1 },
  scroll:      { paddingHorizontal:spacing.md, paddingTop:50 },
  loading:     { flex:1, justifyContent:'center', alignItems:'center', backgroundColor:colors.offWhite },
  loadingText: { fontSize:18, color:colors.textSecondary },
  backBtn:     { marginBottom:12, alignSelf:'flex-start' },
  backText:    { color:colors.lavenderDark, fontWeight:'700', fontSize:16 },
  title:       { fontSize:24, fontWeight:'900', color:colors.textPrimary, marginBottom:12 },
  badgesRow:   { flexDirection:'row', flexWrap:'wrap', gap:8, marginBottom:spacing.md },
  badge:       { borderRadius:radius.full, paddingVertical:6, paddingHorizontal:14 },
  badgeText:   { fontSize:12, fontWeight:'700' },
  urgencyCard: { flexDirection:'row', gap:10, alignItems:'flex-start', backgroundColor:'#FFFDE7', borderRadius:radius.lg, padding:spacing.md, marginBottom:spacing.md, borderWidth:1, borderColor:'#FFD54F' },
  urgencyIcon: { fontSize:20 },
  urgencyText: { flex:1, fontSize:13, color:'#E65100', lineHeight:20 },
  msgCard:     { borderRadius:radius.xl, padding:spacing.md, marginBottom:8 },
  msgText:     { fontSize:14, color:colors.textSecondary, lineHeight:22, fontStyle:'italic' },
  tabsScroll:  { marginBottom:spacing.md },
  tabsCont:    { gap:8, paddingRight:spacing.md },
  tab:         { flexDirection:'row', alignItems:'center', gap:6, paddingVertical:10, paddingHorizontal:16, borderRadius:radius.full, backgroundColor:colors.white, ...shadows.soft },
  tabActive:   { backgroundColor:colors.lavenderDark },
  tabIcon:     { fontSize:14 },
  tabLabel:    { fontSize:12, fontWeight:'700', color:colors.textSecondary },
  tabLabelActive:{ color:colors.white },
  tabContent:  { marginBottom:spacing.md },
  tabIntro:    { fontSize:13, color:colors.textMuted, marginBottom:spacing.md, fontStyle:'italic' },
  mediaCard:   { flexDirection:'row', alignItems:'center', backgroundColor:colors.white, borderRadius:radius.lg, padding:spacing.md, marginBottom:10, ...shadows.soft },
  mediaIcon:   { width:48, height:48, borderRadius:12, justifyContent:'center', alignItems:'center', marginRight:12 },
  mediaEmoji:  { fontSize:24 },
  mediaInfo:   { flex:1 },
  mediaTitle:  { fontSize:14, fontWeight:'700', color:colors.textPrimary },
  mediaSub:    { fontSize:11, color:colors.textMuted, marginTop:3 },
  playBtn:     { width:40, height:40, borderRadius:20, justifyContent:'center', alignItems:'center' },
  playArrow:   { fontSize:15, fontWeight:'800' },
  riskNote:    { borderRadius:radius.lg, padding:spacing.sm+4, marginBottom:spacing.md },
  riskNoteText:{ fontSize:12, fontWeight:'700' },
  emptyBox:    { backgroundColor:colors.white, borderRadius:radius.xl, padding:spacing.xl, alignItems:'center', ...shadows.soft },
  emptyEmoji:  { fontSize:36, marginBottom:10 },
  emptyText:   { fontSize:14, color:colors.textSecondary, textAlign:'center', lineHeight:22 },
  actCard:     { borderRadius:radius.lg, marginBottom:10, overflow:'hidden', ...shadows.soft },
  actGrad:     { flexDirection:'row', alignItems:'center', padding:spacing.md },
  firstBadge:  { position:'absolute', top:6, right:6, backgroundColor:'rgba(255,193,7,0.9)', borderRadius:radius.full, paddingVertical:2, paddingHorizontal:8 },
  firstBadgeText:{ fontSize:9, fontWeight:'800', color:'#5D4037' },
  actIcon:     { fontSize:28, marginRight:12 },
  actInfo:     { flex:1 },
  actTitle:    { fontSize:14, fontWeight:'800' },
  actDesc:     { fontSize:12, color:colors.textSecondary, marginTop:2 },
  actDur:      { fontSize:11, color:colors.textMuted, marginTop:4 },
  startBtn:    { paddingVertical:8, paddingHorizontal:12, borderRadius:radius.full },
  startBtnT:   { fontSize:12, fontWeight:'700' },
  prefNote:    { backgroundColor:colors.lavenderLight, borderRadius:radius.lg, padding:spacing.sm+4, alignItems:'center', marginTop:spacing.sm },
  prefNoteText:{ fontSize:12, color:colors.lavenderDark, fontWeight:'600' },
  recGame:     { marginBottom:spacing.md },
  recGameLabel:{ fontSize:13, fontWeight:'800', color:colors.textPrimary, marginBottom:8 },
  primaryGameCard:{ flexDirection:'row', alignItems:'center', borderRadius:radius.xl, padding:spacing.lg, ...shadows.card },
  primaryGameIcon:{ fontSize:40, marginRight:12 },
  primaryGameInfo:{ flex:1 },
  primaryGameName:{ fontSize:16, fontWeight:'900' },
  primaryGameSub: { fontSize:12, color:colors.textSecondary, marginTop:4 },
  playBigBtn:     { paddingVertical:12, paddingHorizontal:16, borderRadius:radius.full },
  playBigBtnText: { color:colors.white, fontWeight:'800', fontSize:13 },
  artCard:     { flexDirection:'row', alignItems:'center', backgroundColor:colors.lavenderLight, borderRadius:radius.xl, padding:spacing.md, marginBottom:spacing.lg, borderWidth:1.5, borderColor:colors.lavenderDark, ...shadows.soft },
  artCardIcon: { fontSize:30, marginRight:12 },
  artCardInfo: { flex:1 },
  artCardTitle:{ fontSize:14, fontWeight:'800', color:colors.lavenderDark },
  artCardSub:  { fontSize:11, color:colors.textSecondary, marginTop:2 },
  artCardArrow:{ fontSize:20, color:colors.lavenderDark },
  allGamesLabel:{ fontSize:13, fontWeight:'700', color:colors.textSecondary, marginBottom:10 },
  gamesGrid:   { flexDirection:'row', flexWrap:'wrap', gap:10 },
  gameCardWrap:{ width:(width-spacing.md*2-10)/2 },
  gameCard:    { borderRadius:radius.xl, padding:spacing.md, alignItems:'center', ...shadows.soft, position:'relative' },
  isRecStar:   { position:'absolute', top:8, right:8, fontSize:14 },
  gameIcon:    { fontSize:34, marginBottom:8 },
  gameName:    { fontSize:13, fontWeight:'800', textAlign:'center' },
  gameDesc:    { fontSize:10, color:colors.textSecondary, textAlign:'center', marginTop:4 },
});

export default RecommendationsScreen;
