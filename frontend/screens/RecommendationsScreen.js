// ================================================================
// RECOMMENDATIONS SCREEN — RecommendationsScreen.js
// ================================================================

import React, { useState, useEffect } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity,
  StyleSheet, Dimensions, Linking, Alert,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { colors, spacing, radius, shadows } from '../theme';
import { useApp } from '../services/AppContext';
import { ALL_GAMES } from '../services/activitiesLibrary';

const { width } = Dimensions.get('window');

const TABS = [
  { id: 'music', icon: '🎵', label: 'සංගීතය' },
  { id: 'videos', icon: '🎬', label: 'වීඩියෝ' },
  { id: 'activities', icon: '🧘', label: 'ක්‍රියාකාරකම්' },
  { id: 'games', icon: '🎮', label: 'ක්‍රීඩා' },
];

const EMOTION_CFG = {
  happy: { emoji: '😊', label: 'සතුටුයි', badge: ['#FFF9C4', '#FFF3A0'], col: '#E65100' },
  sad: { emoji: '😔', label: 'දුකයි', badge: ['#EDE7F6', '#D1C4E9'], col: '#6A1B9A' },
  stressed: { emoji: '😟', label: 'ආතතියයි', badge: ['#FCE4EC', '#F8BBD9'], col: '#C2185B' },
  anxious: { emoji: '😰', label: 'කනස්සල්ල', badge: ['#FCE4EC', '#F8BBD9'], col: '#C2185B' },
};

const RISK_CFG = {
  low: { label: '🟢 අඩු අවදානම', bg: '#E8F5E9', col: '#388E3C' },
  medium: { label: '🟡 මධ්‍යම අවදානම', bg: '#FFFDE7', col: '#F57F17' },
  high: { label: '🔴 ඉහළ අවදානම', bg: '#FFEBEE', col: '#D32F2F' },
};

// ============================================================
// FALLBACK DATA (only used if API doesn't provide recommendations)
// ============================================================
const FALLBACK_MUSIC = [
  { id: 'm1', title: 'නිදන සංගීතය', titleEn: 'Sleeping Music', emoji: '😴', url: 'https://youtu.be/rCSCPujLs14' },
];

const FALLBACK_VIDEOS = [
  { id: 'v1', title: 'පශ්චාත් ප්‍රසව අවධිය ගැන', titleEn: 'About Postpartum', emoji: '🤰', url: 'https://youtu.be/hrozJ-EbdGI' },
];

// ============================================================
// OPEN YOUTUBE HELPER
// ============================================================
const openYouTube = async (url, title) => {
  if (!url) {
    Alert.alert('සබැඳියක් නැත', `"${title || 'මෙම අන්තර්ගතය'}" සඳහා සබැඳියක් නැත.`);
    return;
  }
  try {
    const supported = await Linking.canOpenURL(url);
    if (supported) {
      await Linking.openURL(url);
    } else {
      Alert.alert('විවෘත කළ නොහැක', `මෙම සබැඳිය විවෘත කළ නොහැක: ${url}`);
    }
  } catch (e) {
    Alert.alert('දෝෂයක්', 'සබැඳිය විවෘත කළ නොහැකි විය.');
  }
};

// ============================================================
// MAIN SCREEN
// ============================================================
const RecommendationsScreen = ({ navigation, route }) => {
  const { latestRecommendations, latestAnalysis, userPreferredActivities } = useApp();
  const [tab, setTab] = useState(route?.params?.tab || 'activities');

  const emotion = latestAnalysis?.detectedEmotion || 'stressed';
  const risk = latestAnalysis?.riskLevel || 'low';
  const ec = EMOTION_CFG[emotion] || EMOTION_CFG.stressed;
  const rc = RISK_CFG[risk] || RISK_CFG.low;

  // Get recommendations from API
  const apiActivities = latestRecommendations?.activities || [];
  const apiGames = latestRecommendations?.games || [];
  const apiMusic = latestRecommendations?.music || [];
  const apiVideos = latestRecommendations?.videos || [];

  // Support messages based on risk level
  const getMessages = () => {
    if (risk === 'high') {
      return [
        "💜 ඔබ වැදගත්. කරුණාකර උපකාර ලබා ගන්න. ඔබ තනිවම නෙවෙයි.",
        "📞 හදිසි උපකාර සඳහා 1926 අමතන්න",
        "🌸 සෑම පියවරක්ම ගණන් ගනීවි. ඔබ ශක්තිමත්."
      ];
    } else if (risk === 'medium') {
      return [
        "ඔබ හොඳින් කරනවා. සෑම පියවරක්ම වැදගත් වෙයි 💜",
        "ඔබේ හැඟීම් සාමාන්‍යයි. ඔබ තනිවම නෙවෙයි 🌸",
        "මේ මොහොතේ සන්සුන් වීමට ඉඩ දෙන්න 🌿"
      ];
    }
    return [
      "ඔබ හොඳින් කරනවා 🌸",
      "දිගටම රැකවරණය ලබන්න 💜",
      "සතුටු දිනයක්! 🌟"
    ];
  };

  const messages = getMessages();

  // ── MUSIC TAB (uses API recommendations) ─────────────────────
  const renderMusic = () => {
    const musicData = apiMusic.length > 0 ? apiMusic : FALLBACK_MUSIC;

    return (
      <View>
        <Text style={s.tabIntro}>සන්සුන් කරන සංගීතය 🎵</Text>
        {musicData.map((track, idx) => (
          <TouchableOpacity
            key={track.id || idx}
            style={s.mediaCard}
            onPress={() => openYouTube(track.url, track.title)}
            activeOpacity={0.8}
          >
            <View style={[s.mediaIcon, { backgroundColor: colors.lavenderLight }]}>
              <Text style={s.mediaEmoji}>{track.emoji || '🎵'}</Text>
            </View>
            <View style={s.mediaInfo}>
              <Text style={s.mediaTitle}>{track.title}</Text>
              <Text style={s.mediaSub}>{track.titleEn || track.description || 'සන්සුන් සංගීතය'} · {track.duration || '5:00'}</Text>
            </View>
            <View style={[s.playBtn, { backgroundColor: colors.lavenderLight }]}>
              <Text style={[s.playArrow, { color: colors.lavenderDark }]}>▶ සවන් දෙන්න</Text>
            </View>
          </TouchableOpacity>
        ))}
      </View>
    );
  };

  // ── VIDEOS TAB (uses API recommendations) ────────────────────
  const renderVideos = () => {
    const videoData = apiVideos.length > 0 ? apiVideos : FALLBACK_VIDEOS;

    return (
      <View>
        <Text style={s.tabIntro}>ඔබ වෙනුවෙන් නිර්දේශිත වීඩියෝ 🎬</Text>
        {videoData.map((video, idx) => (
          <TouchableOpacity
            key={video.id || idx}
            style={s.mediaCard}
            onPress={() => openYouTube(video.url, video.title)}
            activeOpacity={0.8}
          >
            <View style={[s.mediaIcon, { backgroundColor: colors.roseLight }]}>
              <Text style={s.mediaEmoji}>{video.emoji || '🎬'}</Text>
            </View>
            <View style={s.mediaInfo}>
              <Text style={s.mediaTitle}>{video.title}</Text>
              <Text style={s.mediaSub}>{video.titleEn || video.description || 'නිර්දේශිත වීඩියෝව'} · {video.duration || '10:00'}</Text>
            </View>
            <View style={[s.playBtn, { backgroundColor: colors.roseLight }]}>
              <Text style={[s.playArrow, { color: colors.roseDark }]}>▶ බලන්න</Text>
            </View>
          </TouchableOpacity>
        ))}
      </View>
    );
  };

  // ── ACTIVITIES TAB (uses API recommendations) ────────────────
  const renderActivities = () => {
    const activities = apiActivities;

    return (
      <View>
        <View style={[s.riskNote, { backgroundColor: rc.bg }]}>
          <Text style={[s.riskNoteText, { color: rc.col }]}>
            {rc.label} — ඔබේ අවදානම් මට්ටම අනුව නිර්දේශ
          </Text>
        </View>

        {activities.length === 0 ? (
          <View style={s.emptyBox}>
            <Text style={s.emptyEmoji}>🌸</Text>
            <Text style={s.emptyText}>ක්‍රියාකාරකම් නිර්දේශ නැත.</Text>
          </View>
        ) : (
          activities.map((act, idx) => (
            <TouchableOpacity
              key={act.id || idx}
              onPress={() => navigation.navigate('Activity', { activityId: act.id })}
              style={s.actCard}
            >
              <LinearGradient colors={act.color || ['#EDE7F6', '#D1C4E9']} style={s.actGrad}>
                {idx === 0 && risk !== 'low' && (
                  <View style={s.firstBadge}>
                    <Text style={s.firstBadgeText}>ආරම්භ කරන්න</Text>
                  </View>
                )}
                <Text style={s.actIcon}>{act.icon || '🌸'}</Text>
                <View style={s.actInfo}>
                  <Text style={[s.actTitle, { color: act.accent || '#7E57C2' }]}>{act.label || act}</Text>
                  <Text style={s.actDesc}>{act.desc || 'සන්සුන් ක්‍රියාකාරකමක්'}</Text>
                  <Text style={s.actDur}>⏱ {act.duration || 'විනාඩි 5'} · {act.category || 'සුවය'}</Text>
                </View>
                <View style={[s.startBtn, { backgroundColor: (act.accent || '#7E57C2') + '22' }]}>
                  <Text style={[s.startBtnT, { color: act.accent || '#7E57C2' }]}>ආරම්භ කරන්න</Text>
                </View>
              </LinearGradient>
            </TouchableOpacity>
          ))
        )}
      </View>
    );
  };

  // ── GAMES TAB (uses API recommendations) ─────────────────────
  const renderGames = () => {
    const recommendedGameIds = apiGames;

    // Filter games from ALL_GAMES that are recommended
    const recommendedGames = ALL_GAMES.filter(g => recommendedGameIds.includes(g.id));
    const otherGames = ALL_GAMES.filter(g => !recommendedGameIds.includes(g.id));

    return (
      <View>
        {recommendedGames.length > 0 && (
          <View style={s.recGame}>
            <Text style={s.recGameLabel}>⭐ ඔබ වෙනුවෙන් නිර්දේශිත ක්‍රීඩා</Text>
            {recommendedGames.map((game) => (
              <TouchableOpacity
                key={game.id}
                onPress={() => {
                  if (game.id === 'mandala' || game.id === 'colouring') {
                    navigation.navigate('Art');
                  } else {
                    navigation.navigate('Activity', { gameId: game.id });
                  }
                }}
              >
                <LinearGradient colors={game.color || ['#EDE7F6', '#D1C4E9']} style={s.primaryGameCard}>
                  <Text style={s.primaryGameIcon}>{game.icon || '🎮'}</Text>
                  <View style={s.primaryGameInfo}>
                    <Text style={[s.primaryGameName, { color: game.accent || '#7E57C2' }]}>{game.label}</Text>
                    <Text style={s.primaryGameSub}>{game.labelEn || 'සුවය ලබාදෙන ක්‍රීඩාව'}</Text>
                  </View>
                  <View style={[s.playBigBtn, { backgroundColor: game.accent || '#7E57C2' }]}>
                    <Text style={s.playBigBtnText}>ක්‍රීඩා කරන්න →</Text>
                  </View>
                </LinearGradient>
              </TouchableOpacity>
            ))}
          </View>
        )}

        <TouchableOpacity onPress={() => navigation.navigate('Art')} style={s.artCard}>
          <Text style={s.artCardIcon}>🎨</Text>
          <View style={s.artCardInfo}>
            <Text style={s.artCardTitle}>කලා සහ රූප පාටකිරීම</Text>
            <Text style={s.artCardSub}>මණ්ඩල 10 + රූප 10 · සන්සුන් කලාව</Text>
          </View>
          <Text style={s.artCardArrow}>→</Text>
        </TouchableOpacity>

        {otherGames.length > 0 && (
          <>
            <Text style={s.allGamesLabel}>වෙනත් ක්‍රීඩා:</Text>
            <View style={s.gamesGrid}>
              {otherGames.map((g) => (
                <TouchableOpacity key={g.id} style={s.gameCardWrap}
                  onPress={() => {
                    if (g.id === 'mandala' || g.id === 'colouring') navigation.navigate('Art');
                    else navigation.navigate('Activity', { gameId: g.id });
                  }}>
                  <LinearGradient colors={g.color}
                    style={s.gameCard}>
                    <Text style={s.gameIcon}>{g.icon}</Text>
                    <Text style={[s.gameName, { color: g.accent }]}>{g.label}</Text>
                    <Text style={s.gameDesc}>{g.labelEn}</Text>
                  </LinearGradient>
                </TouchableOpacity>
              ))}
            </View>
          </>
        )}
      </View>
    );
  };

  return (
    <View style={s.container}>
      <LinearGradient colors={['#F8F4FF', '#FFF0F8']} style={s.gradient}>
        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={s.scroll}>

          <TouchableOpacity onPress={() => navigation.goBack()} style={s.backBtn}>
            <Text style={s.backText}>← ආපසු</Text>
          </TouchableOpacity>

          <Text style={s.title}>නිර්දේශිත සහන 💜</Text>

          <View style={s.badgesRow}>
            <LinearGradient colors={ec.badge} style={s.badge}>
              <Text style={[s.badgeText, { color: ec.col }]}>{ec.emoji} {ec.label}</Text>
            </LinearGradient>
            <View style={[s.badge, { backgroundColor: rc.bg }]}>
              <Text style={[s.badgeText, { color: rc.col }]}>{rc.label}</Text>
            </View>
          </View>

          {risk !== 'low' && (
            <View style={[s.urgencyCard, risk === 'high' && { backgroundColor: '#FFEBEE', borderColor: '#D32F2F' }]}>
              <Text style={s.urgencyIcon}>{risk === 'high' ? '❤️' : '💛'}</Text>
              <Text style={[s.urgencyText, risk === 'high' && { color: '#D32F2F', fontWeight: '700' }]}>
                {risk === 'high'
                  ? 'කරුණාකර වහාම උපකාර ලබා ගන්න. ඔබ තනිවම නොවෙයි. කරුණාකර පහත නිර්දේශ අනුගමනය කරන්න 💜'
                  : 'ඔබට යම් අවදානමක් ඇත. කරුණාකර පහත නිර්දේශ අනුගමනය කරන්න. ඔබ තනිවම නොවෙයි 💜'}
              </Text>
            </View>
          )}

          {messages.map((msg, i) => (
            <LinearGradient key={i} colors={i === 0 ? ['#EDE7F6', '#FCE4EC'] : ['#FCE4EC', '#EDE7F6']} style={s.msgCard}>
              <Text style={s.msgText}>{msg}</Text>
            </LinearGradient>
          ))}

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
            {tab === 'music' && renderMusic()}
            {tab === 'videos' && renderVideos()}
            {tab === 'activities' && renderActivities()}
            {tab === 'games' && renderGames()}
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
  scroll: { paddingHorizontal: spacing.md, paddingTop: 50 },
  loading: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: colors.offWhite },
  loadingText: { fontSize: 18, color: colors.textSecondary },
  backBtn: { marginBottom: 12, alignSelf: 'flex-start' },
  backText: { color: colors.lavenderDark, fontWeight: '700', fontSize: 16 },
  title: { fontSize: 24, fontWeight: '900', color: colors.textPrimary, marginBottom: 12 },
  badgesRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: spacing.md },
  badge: { borderRadius: radius.full, paddingVertical: 6, paddingHorizontal: 14 },
  badgeText: { fontSize: 12, fontWeight: '700' },
  urgencyCard: { flexDirection: 'row', gap: 10, alignItems: 'flex-start', backgroundColor: '#FFFDE7', borderRadius: radius.lg, padding: spacing.md, marginBottom: spacing.md, borderWidth: 1, borderColor: '#FFD54F' },
  urgencyIcon: { fontSize: 20 },
  urgencyText: { flex: 1, fontSize: 13, color: '#E65100', lineHeight: 20 },
  msgCard: { borderRadius: radius.xl, padding: spacing.md, marginBottom: 8 },
  msgText: { fontSize: 14, color: colors.textSecondary, lineHeight: 22, fontStyle: 'italic' },
  tabsScroll: { marginBottom: spacing.md },
  tabsCont: { gap: 8, paddingRight: spacing.md },
  tab: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingVertical: 10, paddingHorizontal: 16, borderRadius: radius.full, backgroundColor: colors.white, ...shadows.soft },
  tabActive: { backgroundColor: colors.lavenderDark },
  tabIcon: { fontSize: 14 },
  tabLabel: { fontSize: 12, fontWeight: '700', color: colors.textSecondary },
  tabLabelActive: { color: colors.white },
  tabContent: { marginBottom: spacing.md },
  tabIntro: { fontSize: 13, color: colors.textMuted, marginBottom: spacing.md, fontStyle: 'italic' },
  mediaCard: { flexDirection: 'row', alignItems: 'center', backgroundColor: colors.white, borderRadius: radius.lg, padding: spacing.md, marginBottom: 10, ...shadows.soft },
  mediaIcon: { width: 48, height: 48, borderRadius: 12, justifyContent: 'center', alignItems: 'center', marginRight: 12 },
  mediaEmoji: { fontSize: 24 },
  mediaInfo: { flex: 1 },
  mediaTitle: { fontSize: 14, fontWeight: '700', color: colors.textPrimary },
  mediaSub: { fontSize: 11, color: colors.textMuted, marginTop: 3 },
  playBtn: { width: 70, height: 40, borderRadius: 20, justifyContent: 'center', alignItems: 'center' },
  playArrow: { fontSize: 11, fontWeight: '800' },
  riskNote: { borderRadius: radius.lg, padding: spacing.sm + 4, marginBottom: spacing.md },
  riskNoteText: { fontSize: 12, fontWeight: '700' },
  emptyBox: { backgroundColor: colors.white, borderRadius: radius.xl, padding: spacing.xl, alignItems: 'center', ...shadows.soft },
  emptyEmoji: { fontSize: 36, marginBottom: 10 },
  emptyText: { fontSize: 14, color: colors.textSecondary, textAlign: 'center', lineHeight: 22 },
  actCard: { borderRadius: radius.lg, marginBottom: 10, overflow: 'hidden', ...shadows.soft },
  actGrad: { flexDirection: 'row', alignItems: 'center', padding: spacing.md },
  firstBadge: { position: 'absolute', top: 6, right: 6, backgroundColor: 'rgba(255,193,7,0.9)', borderRadius: radius.full, paddingVertical: 2, paddingHorizontal: 8 },
  firstBadgeText: { fontSize: 9, fontWeight: '800', color: '#5D4037' },
  actIcon: { fontSize: 28, marginRight: 12 },
  actInfo: { flex: 1 },
  actTitle: { fontSize: 14, fontWeight: '800' },
  actDesc: { fontSize: 12, color: colors.textSecondary, marginTop: 2 },
  actDur: { fontSize: 11, color: colors.textMuted, marginTop: 4 },
  startBtn: { paddingVertical: 8, paddingHorizontal: 12, borderRadius: radius.full },
  startBtnT: { fontSize: 12, fontWeight: '700' },
  prefNote: { backgroundColor: colors.lavenderLight, borderRadius: radius.lg, padding: spacing.sm + 4, alignItems: 'center', marginTop: spacing.sm },
  prefNoteText: { fontSize: 12, color: colors.lavenderDark, fontWeight: '600' },
  recGame: { marginBottom: spacing.md },
  recGameLabel: { fontSize: 13, fontWeight: '800', color: colors.textPrimary, marginBottom: 8 },
  primaryGameCard: { flexDirection: 'row', alignItems: 'center', borderRadius: radius.xl, padding: spacing.lg, ...shadows.card },
  primaryGameIcon: { fontSize: 40, marginRight: 12 },
  primaryGameInfo: { flex: 1 },
  primaryGameName: { fontSize: 16, fontWeight: '900' },
  primaryGameSub: { fontSize: 12, color: colors.textSecondary, marginTop: 4 },
  playBigBtn: { paddingVertical: 12, paddingHorizontal: 16, borderRadius: radius.full },
  playBigBtnText: { color: colors.white, fontWeight: '800', fontSize: 13 },
  artCard: { flexDirection: 'row', alignItems: 'center', backgroundColor: colors.lavenderLight, borderRadius: radius.xl, padding: spacing.md, marginBottom: spacing.lg, borderWidth: 1.5, borderColor: colors.lavenderDark, ...shadows.soft },
  artCardIcon: { fontSize: 30, marginRight: 12 },
  artCardInfo: { flex: 1 },
  artCardTitle: { fontSize: 14, fontWeight: '800', color: colors.lavenderDark },
  artCardSub: { fontSize: 11, color: colors.textSecondary, marginTop: 2 },
  artCardArrow: { fontSize: 20, color: colors.lavenderDark },
  allGamesLabel: { fontSize: 13, fontWeight: '700', color: colors.textSecondary, marginBottom: 10 },
  gamesGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  gameCardWrap: { width: (width - spacing.md * 2 - 10) / 2 },
  gameCard: { borderRadius: radius.xl, padding: spacing.md, alignItems: 'center', ...shadows.soft, position: 'relative' },
  isRecStar: { position: 'absolute', top: 8, right: 8, fontSize: 14 },
  gameIcon: { fontSize: 34, marginBottom: 8 },
  gameName: { fontSize: 13, fontWeight: '800', textAlign: 'center' },
  gameDesc: { fontSize: 10, color: colors.textSecondary, textAlign: 'center', marginTop: 4 },
});

export default RecommendationsScreen;