// ================================================================
// BLOOM — React Native Recommendations Usage Example
// src/screens/RecommendationsExample.js
//
// This shows HOW to:
//   1. Call the backend /api/recommendations endpoint
//   2. Pass recommendation history to avoid repeats
//   3. Open YouTube links with the openYouTubeLink utility
//   4. Display activities, games, music, and videos
//
// Copy relevant sections into your actual RecommendationsScreen.js
// ================================================================

import React, { useEffect, useState, useCallback } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity,
  StyleSheet, ActivityIndicator, Alert,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { openYouTubeLink } from '../utils/openYouTube';

// ── CONFIG ────────────────────────────────────────────────────
const BACKEND_URL = 'http://localhost:8073';  // Change to your IP in prod
const HISTORY_KEY = 'bloom_rec_history';       // AsyncStorage key

// ── COMPONENT ─────────────────────────────────────────────────
export default function RecommendationsExample({ route }) {
  // These come from the diary analysis result
  const {
    riskLevel    = 'medium',
    emotion      = 'anxious',
    primaryReason = 'overwhelmed',
  } = route?.params || {};

  const [recs, setRecs]       = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState(null);

  // ── LOAD RECOMMENDATIONS ────────────────────────────────────
  const loadRecommendations = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      // Load seen-item history from local storage
      const stored  = await AsyncStorage.getItem(HISTORY_KEY);
      const history = stored ? JSON.parse(stored) : [];

      // Fetch recommendations from backend
      const response = await fetch(`${BACKEND_URL}/api/recommendations`, {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          riskLevel,
          emotion,
          primaryReason,
          history,   // ← pass history so backend filters already-seen items
        }),
      });

      if (!response.ok) throw new Error('Server error');
      const data = await response.json();

      if (data.success) {
        setRecs(data);

        // Save newly shown items to history so next call avoids them
        const newSeen = [
          ...history,
          ...data.activities,
          ...(data.games  || []).map(g => g.name),
          ...(data.music  || []).map(m => m.title),
          ...(data.videos || []).map(v => v.title),
        ];
        await AsyncStorage.setItem(HISTORY_KEY, JSON.stringify(newSeen));
      }
    } catch (err) {
      console.error('Recommendation fetch error:', err);
      setError('Could not load recommendations. Please try again.');
    } finally {
      setLoading(false);
    }
  }, [riskLevel, emotion, primaryReason]);

  useEffect(() => { loadRecommendations(); }, []);

  // ── RENDER LOADING ──────────────────────────────────────────
  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#9b59b6" />
        <Text style={styles.loadingText}>Finding something calming for you… 🌸</Text>
      </View>
    );
  }

  // ── RENDER ERROR ────────────────────────────────────────────
  if (error) {
    return (
      <View style={styles.center}>
        <Text style={styles.errorText}>{error}</Text>
        <TouchableOpacity style={styles.retryBtn} onPress={loadRecommendations}>
          <Text style={styles.retryText}>Try Again</Text>
        </TouchableOpacity>
      </View>
    );
  }

  // ── RENDER RECOMMENDATIONS ──────────────────────────────────
  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>

      {/* Support Message — kind, non-judgmental */}
      {recs?.supportMessage && (
        <View style={styles.supportCard}>
          <Text style={styles.supportText}>{recs.supportMessage}</Text>
        </View>
      )}

      {/* ACTIVITIES SECTION */}
      <SectionHeader title="🌿 Gentle Activities for Today" />
      {(recs?.activities || []).map((activity, i) => (
        <View key={i} style={styles.activityCard}>
          <Text style={styles.activityText}>{activity}</Text>
        </View>
      ))}

      {/* GAMES SECTION */}
      <SectionHeader title="🎮 Relaxing Games" />
      {(recs?.games || []).map((game, i) => (
        <View key={i} style={styles.gameCard}>
          <Text style={styles.gameName}>{game.name}</Text>
          <Text style={styles.gameDesc}>{game.description}</Text>
        </View>
      ))}

      {/* MUSIC SECTION — opens YouTube */}
      <SectionHeader title="🎵 Calming Music" />
      {(recs?.music || []).map((track, i) => (
        <TouchableOpacity
          key={i}
          style={styles.mediaCard}
          onPress={() => openYouTubeLink(track.url, track.title)}
          activeOpacity={0.75}
        >
          <Text style={styles.mediaIcon}>▶</Text>
          <Text style={styles.mediaTitle}>{track.title}</Text>
        </TouchableOpacity>
      ))}

      {/* VIDEOS SECTION — opens YouTube */}
      <SectionHeader title="📹 Guided Videos" />
      {(recs?.videos || []).map((video, i) => (
        <TouchableOpacity
          key={i}
          style={styles.mediaCard}
          onPress={() => openYouTubeLink(video.url, video.title)}
          activeOpacity={0.75}
        >
          <Text style={styles.mediaIcon}>▶</Text>
          <Text style={styles.mediaTitle}>{video.title}</Text>
        </TouchableOpacity>
      ))}

      {/* Refresh button — shows different recommendations each time */}
      <TouchableOpacity style={styles.refreshBtn} onPress={loadRecommendations}>
        <Text style={styles.refreshText}>🔄  Show Different Recommendations</Text>
      </TouchableOpacity>

    </ScrollView>
  );
}

// ── SECTION HEADER COMPONENT ───────────────────────────────────
function SectionHeader({ title }) {
  return <Text style={styles.sectionHeader}>{title}</Text>;
}

// ── STYLES ────────────────────────────────────────────────────
const styles = StyleSheet.create({
  container:    { flex: 1, backgroundColor: '#fdf6ff' },
  content:      { padding: 20, paddingBottom: 40 },
  center:       { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 24 },
  loadingText:  { marginTop: 16, color: '#9b59b6', fontSize: 15, textAlign: 'center' },
  errorText:    { color: '#c0392b', fontSize: 15, textAlign: 'center', marginBottom: 16 },

  supportCard: {
    backgroundColor: '#f3e5f5', borderRadius: 16,
    padding: 18, marginBottom: 24,
    borderLeftWidth: 4, borderLeftColor: '#9b59b6',
  },
  supportText: { color: '#6c3483', fontSize: 15, lineHeight: 22, fontStyle: 'italic' },

  sectionHeader: {
    fontSize: 17, fontWeight: '700', color: '#6c3483',
    marginTop: 24, marginBottom: 12,
  },

  activityCard: {
    backgroundColor: '#fff', borderRadius: 12,
    padding: 14, marginBottom: 10,
    shadowColor: '#9b59b6', shadowOpacity: 0.08,
    shadowRadius: 6, elevation: 2,
  },
  activityText: { color: '#4a235a', fontSize: 14, lineHeight: 20 },

  gameCard: {
    backgroundColor: '#f8f0ff', borderRadius: 12,
    padding: 14, marginBottom: 10,
  },
  gameName: { color: '#6c3483', fontSize: 15, fontWeight: '600' },
  gameDesc: { color: '#7d3c98', fontSize: 13, marginTop: 4, lineHeight: 19 },

  mediaCard: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: '#fff', borderRadius: 12,
    padding: 14, marginBottom: 10,
    borderWidth: 1, borderColor: '#e8d5f5',
  },
  mediaIcon:  { fontSize: 18, color: '#9b59b6', marginRight: 12 },
  mediaTitle: { color: '#4a235a', fontSize: 14, flex: 1, lineHeight: 20 },

  refreshBtn: {
    backgroundColor: '#9b59b6', borderRadius: 14,
    padding: 16, alignItems: 'center', marginTop: 32,
  },
  refreshText: { color: '#fff', fontSize: 15, fontWeight: '600' },

  retryBtn: {
    backgroundColor: '#9b59b6', borderRadius: 12,
    paddingHorizontal: 24, paddingVertical: 12,
  },
  retryText: { color: '#fff', fontSize: 15, fontWeight: '600' },
});
