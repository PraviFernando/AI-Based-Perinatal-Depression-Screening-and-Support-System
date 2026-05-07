// ================================================================
// ArtScreen.js  — Bloom  (Postpartum App)
// Exactly like coloringonline.com:
//   • SVG line-art rendered onto an HTML5 Canvas
//   • Click / touch any region → BFS flood-fill with selected colour
//   • Undo / Redo stacks
//   • Save as PNG  |  Print
//   • Rectangular palette swatches (5 rows × 8 cols = 40 colours)
//   • Works on Expo Web (iframe) – no extra packages needed
//   • On native install:  npx expo install react-native-webview
// ================================================================

import React, { useState, useRef, useEffect, useCallback } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity,
  StyleSheet, Dimensions, Platform, Alert,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

const { width: SCREEN_W } = Dimensions.get('window');

// Canvas fills the screen width (max 560px for tablet)
const CANVAS_W = Math.min(SCREEN_W - 32, 560);
const CANVAS_H = CANVAS_W; // square

// ================================================================
//  PALETTE  (5 rows × 8 cols — matches coloringonline.com style)
// ================================================================
const PALETTE_ROWS = [
  ['#FF0000','#FF6600','#FF9900','#FFCC00','#FFFF00','#CCFF00','#00FF00','#00FF99'],
  ['#00FFFF','#00CCFF','#0099FF','#0033FF','#3300FF','#9900FF','#FF00FF','#FF0099'],
  ['#FF6699','#FFAACC','#FFCCAA','#FFEEAA','#CCFFAA','#AAFFEE','#AACCFF','#CCAAFF'],
  ['#993300','#996600','#669900','#006666','#003399','#330099','#990066','#660033'],
  ['#FFFFFF','#DDDDDD','#BBBBBB','#888888','#555555','#333333','#111111','#000000'],
];

// ================================================================
//  SVG DESIGNS
//  All have  fill="white"  regions + dark outlines
//  The flood-fill replaces white pixels with the chosen colour
// ================================================================

// ── MANDALAS ──────────────────────────────────────────────────
const MANDALAS = [
  {
    id:'m1', name:'මල් මණ්ඩලය', nameEn:'Flower Mandala', icon:'🌸', bg:'#FFF5FF',
    svg:`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 400">
<rect width="400" height="400" fill="white"/>
<circle cx="200" cy="200" r="192" fill="none" stroke="#111" stroke-width="3"/>
<circle cx="200" cy="200" r="155" fill="none" stroke="#222" stroke-width="1.2"/>
<circle cx="200" cy="200" r="118" fill="none" stroke="#222" stroke-width="1.2"/>
<!-- 8 large outer petals -->
<ellipse cx="200" cy="44" rx="26" ry="50" fill="white" stroke="#111" stroke-width="2.5"/>
<ellipse cx="200" cy="44" rx="26" ry="50" fill="white" stroke="#111" stroke-width="2.5" transform="rotate(45,200,200)"/>
<ellipse cx="200" cy="44" rx="26" ry="50" fill="white" stroke="#111" stroke-width="2.5" transform="rotate(90,200,200)"/>
<ellipse cx="200" cy="44" rx="26" ry="50" fill="white" stroke="#111" stroke-width="2.5" transform="rotate(135,200,200)"/>
<ellipse cx="200" cy="44" rx="26" ry="50" fill="white" stroke="#111" stroke-width="2.5" transform="rotate(180,200,200)"/>
<ellipse cx="200" cy="44" rx="26" ry="50" fill="white" stroke="#111" stroke-width="2.5" transform="rotate(225,200,200)"/>
<ellipse cx="200" cy="44" rx="26" ry="50" fill="white" stroke="#111" stroke-width="2.5" transform="rotate(270,200,200)"/>
<ellipse cx="200" cy="44" rx="26" ry="50" fill="white" stroke="#111" stroke-width="2.5" transform="rotate(315,200,200)"/>
<!-- 8 pointy outer tips -->
<polygon points="200,10 206,38 194,38" fill="white" stroke="#111" stroke-width="2"/>
<polygon points="200,10 206,38 194,38" fill="white" stroke="#111" stroke-width="2" transform="rotate(45,200,200)"/>
<polygon points="200,10 206,38 194,38" fill="white" stroke="#111" stroke-width="2" transform="rotate(90,200,200)"/>
<polygon points="200,10 206,38 194,38" fill="white" stroke="#111" stroke-width="2" transform="rotate(135,200,200)"/>
<polygon points="200,10 206,38 194,38" fill="white" stroke="#111" stroke-width="2" transform="rotate(180,200,200)"/>
<polygon points="200,10 206,38 194,38" fill="white" stroke="#111" stroke-width="2" transform="rotate(225,200,200)"/>
<polygon points="200,10 206,38 194,38" fill="white" stroke="#111" stroke-width="2" transform="rotate(270,200,200)"/>
<polygon points="200,10 206,38 194,38" fill="white" stroke="#111" stroke-width="2" transform="rotate(315,200,200)"/>
<!-- 8 middle petals -->
<ellipse cx="200" cy="92" rx="17" ry="32" fill="white" stroke="#111" stroke-width="2"/>
<ellipse cx="200" cy="92" rx="17" ry="32" fill="white" stroke="#111" stroke-width="2" transform="rotate(45,200,200)"/>
<ellipse cx="200" cy="92" rx="17" ry="32" fill="white" stroke="#111" stroke-width="2" transform="rotate(90,200,200)"/>
<ellipse cx="200" cy="92" rx="17" ry="32" fill="white" stroke="#111" stroke-width="2" transform="rotate(135,200,200)"/>
<ellipse cx="200" cy="92" rx="17" ry="32" fill="white" stroke="#111" stroke-width="2" transform="rotate(180,200,200)"/>
<ellipse cx="200" cy="92" rx="17" ry="32" fill="white" stroke="#111" stroke-width="2" transform="rotate(225,200,200)"/>
<ellipse cx="200" cy="92" rx="17" ry="32" fill="white" stroke="#111" stroke-width="2" transform="rotate(270,200,200)"/>
<ellipse cx="200" cy="92" rx="17" ry="32" fill="white" stroke="#111" stroke-width="2" transform="rotate(315,200,200)"/>
<!-- 8 inner dots -->
<circle cx="200" cy="140" r="11" fill="white" stroke="#111" stroke-width="2"/>
<circle cx="200" cy="140" r="11" fill="white" stroke="#111" stroke-width="2" transform="rotate(45,200,200)"/>
<circle cx="200" cy="140" r="11" fill="white" stroke="#111" stroke-width="2" transform="rotate(90,200,200)"/>
<circle cx="200" cy="140" r="11" fill="white" stroke="#111" stroke-width="2" transform="rotate(135,200,200)"/>
<circle cx="200" cy="140" r="11" fill="white" stroke="#111" stroke-width="2" transform="rotate(180,200,200)"/>
<circle cx="200" cy="140" r="11" fill="white" stroke="#111" stroke-width="2" transform="rotate(225,200,200)"/>
<circle cx="200" cy="140" r="11" fill="white" stroke="#111" stroke-width="2" transform="rotate(270,200,200)"/>
<circle cx="200" cy="140" r="11" fill="white" stroke="#111" stroke-width="2" transform="rotate(315,200,200)"/>
<!-- Center flower -->
<circle cx="200" cy="200" r="44" fill="white" stroke="#111" stroke-width="2.5"/>
<ellipse cx="200" cy="166" rx="12" ry="20" fill="white" stroke="#111" stroke-width="1.8"/>
<ellipse cx="200" cy="166" rx="12" ry="20" fill="white" stroke="#111" stroke-width="1.8" transform="rotate(60,200,200)"/>
<ellipse cx="200" cy="166" rx="12" ry="20" fill="white" stroke="#111" stroke-width="1.8" transform="rotate(120,200,200)"/>
<ellipse cx="200" cy="166" rx="12" ry="20" fill="white" stroke="#111" stroke-width="1.8" transform="rotate(180,200,200)"/>
<ellipse cx="200" cy="166" rx="12" ry="20" fill="white" stroke="#111" stroke-width="1.8" transform="rotate(240,200,200)"/>
<ellipse cx="200" cy="166" rx="12" ry="20" fill="white" stroke="#111" stroke-width="1.8" transform="rotate(300,200,200)"/>
<circle cx="200" cy="200" r="18" fill="white" stroke="#111" stroke-width="2"/>
<circle cx="200" cy="200" r="6" fill="#111"/>
</svg>`,
  },
  {
    id:'m2', name:'ලෝටස් මණ්ඩලය', nameEn:'Lotus Mandala', icon:'🪷', bg:'#FFF0F8',
    svg:`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 400">
<rect width="400" height="400" fill="white"/>
<circle cx="200" cy="200" r="192" fill="none" stroke="#111" stroke-width="3"/>
<circle cx="200" cy="200" r="150" fill="none" stroke="#333" stroke-width="1"/>
<!-- 8 large lotus petals -->
<path d="M200,26 Q232,110 200,144 Q168,110 200,26Z" fill="white" stroke="#111" stroke-width="2.5"/>
<path d="M200,26 Q232,110 200,144 Q168,110 200,26Z" fill="white" stroke="#111" stroke-width="2.5" transform="rotate(45,200,200)"/>
<path d="M200,26 Q232,110 200,144 Q168,110 200,26Z" fill="white" stroke="#111" stroke-width="2.5" transform="rotate(90,200,200)"/>
<path d="M200,26 Q232,110 200,144 Q168,110 200,26Z" fill="white" stroke="#111" stroke-width="2.5" transform="rotate(135,200,200)"/>
<path d="M200,26 Q232,110 200,144 Q168,110 200,26Z" fill="white" stroke="#111" stroke-width="2.5" transform="rotate(180,200,200)"/>
<path d="M200,26 Q232,110 200,144 Q168,110 200,26Z" fill="white" stroke="#111" stroke-width="2.5" transform="rotate(225,200,200)"/>
<path d="M200,26 Q232,110 200,144 Q168,110 200,26Z" fill="white" stroke="#111" stroke-width="2.5" transform="rotate(270,200,200)"/>
<path d="M200,26 Q232,110 200,144 Q168,110 200,26Z" fill="white" stroke="#111" stroke-width="2.5" transform="rotate(315,200,200)"/>
<!-- 8 inner petals -->
<path d="M200,100 Q216,148 200,166 Q184,148 200,100Z" fill="white" stroke="#111" stroke-width="2"/>
<path d="M200,100 Q216,148 200,166 Q184,148 200,100Z" fill="white" stroke="#111" stroke-width="2" transform="rotate(45,200,200)"/>
<path d="M200,100 Q216,148 200,166 Q184,148 200,100Z" fill="white" stroke="#111" stroke-width="2" transform="rotate(90,200,200)"/>
<path d="M200,100 Q216,148 200,166 Q184,148 200,100Z" fill="white" stroke="#111" stroke-width="2" transform="rotate(135,200,200)"/>
<path d="M200,100 Q216,148 200,166 Q184,148 200,100Z" fill="white" stroke="#111" stroke-width="2" transform="rotate(180,200,200)"/>
<path d="M200,100 Q216,148 200,166 Q184,148 200,100Z" fill="white" stroke="#111" stroke-width="2" transform="rotate(225,200,200)"/>
<path d="M200,100 Q216,148 200,166 Q184,148 200,100Z" fill="white" stroke="#111" stroke-width="2" transform="rotate(270,200,200)"/>
<path d="M200,100 Q216,148 200,166 Q184,148 200,100Z" fill="white" stroke="#111" stroke-width="2" transform="rotate(315,200,200)"/>
<circle cx="200" cy="200" r="42" fill="white" stroke="#111" stroke-width="2.5"/>
<circle cx="200" cy="200" r="20" fill="white" stroke="#111" stroke-width="2"/>
<circle cx="200" cy="200" r="7" fill="#111"/>
</svg>`,
  },
  {
    id:'m3', name:'ස්ටාර් මණ්ඩලය', nameEn:'Star Mandala', icon:'⭐', bg:'#FFFFF0',
    svg:`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 400">
<rect width="400" height="400" fill="white"/>
<circle cx="200" cy="200" r="192" fill="none" stroke="#111" stroke-width="3"/>
<!-- 12 star points -->
<polygon points="200,16 208,54 192,54" fill="white" stroke="#111" stroke-width="2.5"/>
<polygon points="200,16 208,54 192,54" fill="white" stroke="#111" stroke-width="2.5" transform="rotate(30,200,200)"/>
<polygon points="200,16 208,54 192,54" fill="white" stroke="#111" stroke-width="2.5" transform="rotate(60,200,200)"/>
<polygon points="200,16 208,54 192,54" fill="white" stroke="#111" stroke-width="2.5" transform="rotate(90,200,200)"/>
<polygon points="200,16 208,54 192,54" fill="white" stroke="#111" stroke-width="2.5" transform="rotate(120,200,200)"/>
<polygon points="200,16 208,54 192,54" fill="white" stroke="#111" stroke-width="2.5" transform="rotate(150,200,200)"/>
<polygon points="200,16 208,54 192,54" fill="white" stroke="#111" stroke-width="2.5" transform="rotate(180,200,200)"/>
<polygon points="200,16 208,54 192,54" fill="white" stroke="#111" stroke-width="2.5" transform="rotate(210,200,200)"/>
<polygon points="200,16 208,54 192,54" fill="white" stroke="#111" stroke-width="2.5" transform="rotate(240,200,200)"/>
<polygon points="200,16 208,54 192,54" fill="white" stroke="#111" stroke-width="2.5" transform="rotate(270,200,200)"/>
<polygon points="200,16 208,54 192,54" fill="white" stroke="#111" stroke-width="2.5" transform="rotate(300,200,200)"/>
<polygon points="200,16 208,54 192,54" fill="white" stroke="#111" stroke-width="2.5" transform="rotate(330,200,200)"/>
<!-- 6 diamond shapes -->
<polygon points="200,58 240,104 200,128 160,104" fill="white" stroke="#111" stroke-width="2"/>
<polygon points="200,58 240,104 200,128 160,104" fill="white" stroke="#111" stroke-width="2" transform="rotate(60,200,200)"/>
<polygon points="200,58 240,104 200,128 160,104" fill="white" stroke="#111" stroke-width="2" transform="rotate(120,200,200)"/>
<polygon points="200,58 240,104 200,128 160,104" fill="white" stroke="#111" stroke-width="2" transform="rotate(180,200,200)"/>
<polygon points="200,58 240,104 200,128 160,104" fill="white" stroke="#111" stroke-width="2" transform="rotate(240,200,200)"/>
<polygon points="200,58 240,104 200,128 160,104" fill="white" stroke="#111" stroke-width="2" transform="rotate(300,200,200)"/>
<circle cx="200" cy="200" r="88" fill="none" stroke="#111" stroke-width="1.5"/>
<!-- 6 inner petals -->
<path d="M200,114 Q218,152 200,166 Q182,152 200,114Z" fill="white" stroke="#111" stroke-width="1.8"/>
<path d="M200,114 Q218,152 200,166 Q182,152 200,114Z" fill="white" stroke="#111" stroke-width="1.8" transform="rotate(60,200,200)"/>
<path d="M200,114 Q218,152 200,166 Q182,152 200,114Z" fill="white" stroke="#111" stroke-width="1.8" transform="rotate(120,200,200)"/>
<path d="M200,114 Q218,152 200,166 Q182,152 200,114Z" fill="white" stroke="#111" stroke-width="1.8" transform="rotate(180,200,200)"/>
<path d="M200,114 Q218,152 200,166 Q182,152 200,114Z" fill="white" stroke="#111" stroke-width="1.8" transform="rotate(240,200,200)"/>
<path d="M200,114 Q218,152 200,166 Q182,152 200,114Z" fill="white" stroke="#111" stroke-width="1.8" transform="rotate(300,200,200)"/>
<circle cx="200" cy="200" r="36" fill="white" stroke="#111" stroke-width="2.5"/>
<circle cx="200" cy="200" r="11" fill="#111"/>
</svg>`,
  },
  {
    id:'m4', name:'රෝස මණ්ඩලය', nameEn:'Rose Mandala', icon:'🌹', bg:'#FFF5F5',
    svg:`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 400">
<rect width="400" height="400" fill="white"/>
<circle cx="200" cy="200" r="192" fill="none" stroke="#111" stroke-width="3"/>
<!-- 12 rose petals -->
<ellipse cx="200" cy="38" rx="20" ry="38" fill="white" stroke="#111" stroke-width="2.5"/>
<ellipse cx="200" cy="38" rx="20" ry="38" fill="white" stroke="#111" stroke-width="2.5" transform="rotate(30,200,200)"/>
<ellipse cx="200" cy="38" rx="20" ry="38" fill="white" stroke="#111" stroke-width="2.5" transform="rotate(60,200,200)"/>
<ellipse cx="200" cy="38" rx="20" ry="38" fill="white" stroke="#111" stroke-width="2.5" transform="rotate(90,200,200)"/>
<ellipse cx="200" cy="38" rx="20" ry="38" fill="white" stroke="#111" stroke-width="2.5" transform="rotate(120,200,200)"/>
<ellipse cx="200" cy="38" rx="20" ry="38" fill="white" stroke="#111" stroke-width="2.5" transform="rotate(150,200,200)"/>
<ellipse cx="200" cy="38" rx="20" ry="38" fill="white" stroke="#111" stroke-width="2.5" transform="rotate(180,200,200)"/>
<ellipse cx="200" cy="38" rx="20" ry="38" fill="white" stroke="#111" stroke-width="2.5" transform="rotate(210,200,200)"/>
<ellipse cx="200" cy="38" rx="20" ry="38" fill="white" stroke="#111" stroke-width="2.5" transform="rotate(240,200,200)"/>
<ellipse cx="200" cy="38" rx="20" ry="38" fill="white" stroke="#111" stroke-width="2.5" transform="rotate(270,200,200)"/>
<ellipse cx="200" cy="38" rx="20" ry="38" fill="white" stroke="#111" stroke-width="2.5" transform="rotate(300,200,200)"/>
<ellipse cx="200" cy="38" rx="20" ry="38" fill="white" stroke="#111" stroke-width="2.5" transform="rotate(330,200,200)"/>
<circle cx="200" cy="200" r="122" fill="none" stroke="#222" stroke-width="1"/>
<!-- 6 middle petals -->
<ellipse cx="200" cy="100" rx="14" ry="26" fill="white" stroke="#111" stroke-width="2"/>
<ellipse cx="200" cy="100" rx="14" ry="26" fill="white" stroke="#111" stroke-width="2" transform="rotate(60,200,200)"/>
<ellipse cx="200" cy="100" rx="14" ry="26" fill="white" stroke="#111" stroke-width="2" transform="rotate(120,200,200)"/>
<ellipse cx="200" cy="100" rx="14" ry="26" fill="white" stroke="#111" stroke-width="2" transform="rotate(180,200,200)"/>
<ellipse cx="200" cy="100" rx="14" ry="26" fill="white" stroke="#111" stroke-width="2" transform="rotate(240,200,200)"/>
<ellipse cx="200" cy="100" rx="14" ry="26" fill="white" stroke="#111" stroke-width="2" transform="rotate(300,200,200)"/>
<!-- 6 inner dots -->
<circle cx="200" cy="148" r="10" fill="white" stroke="#111" stroke-width="2"/>
<circle cx="200" cy="148" r="10" fill="white" stroke="#111" stroke-width="2" transform="rotate(60,200,200)"/>
<circle cx="200" cy="148" r="10" fill="white" stroke="#111" stroke-width="2" transform="rotate(120,200,200)"/>
<circle cx="200" cy="148" r="10" fill="white" stroke="#111" stroke-width="2" transform="rotate(180,200,200)"/>
<circle cx="200" cy="148" r="10" fill="white" stroke="#111" stroke-width="2" transform="rotate(240,200,200)"/>
<circle cx="200" cy="148" r="10" fill="white" stroke="#111" stroke-width="2" transform="rotate(300,200,200)"/>
<circle cx="200" cy="200" r="44" fill="white" stroke="#111" stroke-width="2.5"/>
<circle cx="200" cy="200" r="18" fill="white" stroke="#111" stroke-width="2"/>
<circle cx="200" cy="200" r="6" fill="#111"/>
</svg>`,
  },
  {
    id:'m5', name:'සූර්ය මණ්ඩලය', nameEn:'Sun Mandala', icon:'☀️', bg:'#FFFDE7',
    svg:`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 400">
<rect width="400" height="400" fill="white"/>
<circle cx="200" cy="200" r="192" fill="none" stroke="#111" stroke-width="3"/>
<!-- 16 sun rays -->
<polygon points="200,16 207,50 193,50" fill="white" stroke="#111" stroke-width="2"/>
<polygon points="200,16 207,50 193,50" fill="white" stroke="#111" stroke-width="2" transform="rotate(22.5,200,200)"/>
<polygon points="200,16 207,50 193,50" fill="white" stroke="#111" stroke-width="2" transform="rotate(45,200,200)"/>
<polygon points="200,16 207,50 193,50" fill="white" stroke="#111" stroke-width="2" transform="rotate(67.5,200,200)"/>
<polygon points="200,16 207,50 193,50" fill="white" stroke="#111" stroke-width="2" transform="rotate(90,200,200)"/>
<polygon points="200,16 207,50 193,50" fill="white" stroke="#111" stroke-width="2" transform="rotate(112.5,200,200)"/>
<polygon points="200,16 207,50 193,50" fill="white" stroke="#111" stroke-width="2" transform="rotate(135,200,200)"/>
<polygon points="200,16 207,50 193,50" fill="white" stroke="#111" stroke-width="2" transform="rotate(157.5,200,200)"/>
<polygon points="200,16 207,50 193,50" fill="white" stroke="#111" stroke-width="2" transform="rotate(180,200,200)"/>
<polygon points="200,16 207,50 193,50" fill="white" stroke="#111" stroke-width="2" transform="rotate(202.5,200,200)"/>
<polygon points="200,16 207,50 193,50" fill="white" stroke="#111" stroke-width="2" transform="rotate(225,200,200)"/>
<polygon points="200,16 207,50 193,50" fill="white" stroke="#111" stroke-width="2" transform="rotate(247.5,200,200)"/>
<polygon points="200,16 207,50 193,50" fill="white" stroke="#111" stroke-width="2" transform="rotate(270,200,200)"/>
<polygon points="200,16 207,50 193,50" fill="white" stroke="#111" stroke-width="2" transform="rotate(292.5,200,200)"/>
<polygon points="200,16 207,50 193,50" fill="white" stroke="#111" stroke-width="2" transform="rotate(315,200,200)"/>
<polygon points="200,16 207,50 193,50" fill="white" stroke="#111" stroke-width="2" transform="rotate(337.5,200,200)"/>
<!-- 8 flame shapes -->
<path d="M200,58 Q224,114 200,140 Q176,114 200,58Z" fill="white" stroke="#111" stroke-width="2"/>
<path d="M200,58 Q224,114 200,140 Q176,114 200,58Z" fill="white" stroke="#111" stroke-width="2" transform="rotate(45,200,200)"/>
<path d="M200,58 Q224,114 200,140 Q176,114 200,58Z" fill="white" stroke="#111" stroke-width="2" transform="rotate(90,200,200)"/>
<path d="M200,58 Q224,114 200,140 Q176,114 200,58Z" fill="white" stroke="#111" stroke-width="2" transform="rotate(135,200,200)"/>
<path d="M200,58 Q224,114 200,140 Q176,114 200,58Z" fill="white" stroke="#111" stroke-width="2" transform="rotate(180,200,200)"/>
<path d="M200,58 Q224,114 200,140 Q176,114 200,58Z" fill="white" stroke="#111" stroke-width="2" transform="rotate(225,200,200)"/>
<path d="M200,58 Q224,114 200,140 Q176,114 200,58Z" fill="white" stroke="#111" stroke-width="2" transform="rotate(270,200,200)"/>
<path d="M200,58 Q224,114 200,140 Q176,114 200,58Z" fill="white" stroke="#111" stroke-width="2" transform="rotate(315,200,200)"/>
<circle cx="200" cy="200" r="60" fill="none" stroke="#111" stroke-width="2"/>
<!-- Sun face -->
<circle cx="200" cy="200" r="54" fill="white" stroke="#111" stroke-width="2.5"/>
<circle cx="183" cy="192" r="7" fill="#111"/>
<circle cx="217" cy="192" r="7" fill="#111"/>
<ellipse cx="183" cy="213" rx="9" ry="5" fill="white" stroke="#111" stroke-width="1.5"/>
<ellipse cx="217" cy="213" rx="9" ry="5" fill="white" stroke="#111" stroke-width="1.5"/>
<path d="M183,220 Q200,234 217,220" fill="none" stroke="#111" stroke-width="3" stroke-linecap="round"/>
</svg>`,
  },
  {
    id:'m6', name:'ක්‍රිස්ටල් මණ්ඩලය', nameEn:'Crystal Mandala', icon:'💎', bg:'#F0F4FF',
    svg:`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 400">
<rect width="400" height="400" fill="white"/>
<circle cx="200" cy="200" r="192" fill="none" stroke="#111" stroke-width="3"/>
<!-- 12 crystal spikes -->
<polygon points="200,16 210,58 190,58" fill="white" stroke="#111" stroke-width="2.5"/>
<polygon points="200,16 210,58 190,58" fill="white" stroke="#111" stroke-width="2.5" transform="rotate(30,200,200)"/>
<polygon points="200,16 210,58 190,58" fill="white" stroke="#111" stroke-width="2.5" transform="rotate(60,200,200)"/>
<polygon points="200,16 210,58 190,58" fill="white" stroke="#111" stroke-width="2.5" transform="rotate(90,200,200)"/>
<polygon points="200,16 210,58 190,58" fill="white" stroke="#111" stroke-width="2.5" transform="rotate(120,200,200)"/>
<polygon points="200,16 210,58 190,58" fill="white" stroke="#111" stroke-width="2.5" transform="rotate(150,200,200)"/>
<polygon points="200,16 210,58 190,58" fill="white" stroke="#111" stroke-width="2.5" transform="rotate(180,200,200)"/>
<polygon points="200,16 210,58 190,58" fill="white" stroke="#111" stroke-width="2.5" transform="rotate(210,200,200)"/>
<polygon points="200,16 210,58 190,58" fill="white" stroke="#111" stroke-width="2.5" transform="rotate(240,200,200)"/>
<polygon points="200,16 210,58 190,58" fill="white" stroke="#111" stroke-width="2.5" transform="rotate(270,200,200)"/>
<polygon points="200,16 210,58 190,58" fill="white" stroke="#111" stroke-width="2.5" transform="rotate(300,200,200)"/>
<polygon points="200,16 210,58 190,58" fill="white" stroke="#111" stroke-width="2.5" transform="rotate(330,200,200)"/>
<!-- 6 diamond facets -->
<polygon points="200,62 244,108 200,132 156,108" fill="white" stroke="#111" stroke-width="2"/>
<polygon points="200,62 244,108 200,132 156,108" fill="white" stroke="#111" stroke-width="2" transform="rotate(60,200,200)"/>
<polygon points="200,62 244,108 200,132 156,108" fill="white" stroke="#111" stroke-width="2" transform="rotate(120,200,200)"/>
<polygon points="200,62 244,108 200,132 156,108" fill="white" stroke="#111" stroke-width="2" transform="rotate(180,200,200)"/>
<polygon points="200,62 244,108 200,132 156,108" fill="white" stroke="#111" stroke-width="2" transform="rotate(240,200,200)"/>
<polygon points="200,62 244,108 200,132 156,108" fill="white" stroke="#111" stroke-width="2" transform="rotate(300,200,200)"/>
<!-- Hexagon -->
<polygon points="200,146 236,166 236,206 200,226 164,206 164,166" fill="white" stroke="#111" stroke-width="2.5"/>
<polygon points="200,160 224,174 224,204 200,218 176,204 176,174" fill="white" stroke="#111" stroke-width="2"/>
<circle cx="200" cy="200" r="12" fill="#111"/>
</svg>`,
  },
  {
    id:'m7', name:'සාගර මණ්ඩලය', nameEn:'Ocean Mandala', icon:'🌊', bg:'#F0FFFE',
    svg:`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 400">
<rect width="400" height="400" fill="white"/>
<circle cx="200" cy="200" r="192" fill="none" stroke="#111" stroke-width="3"/>
<!-- 10 wave-drops -->
<path d="M200,28 Q228,86 228,122 Q200,152 172,122 Q172,86 200,28Z" fill="white" stroke="#111" stroke-width="2.5"/>
<path d="M200,28 Q228,86 228,122 Q200,152 172,122 Q172,86 200,28Z" fill="white" stroke="#111" stroke-width="2.5" transform="rotate(36,200,200)"/>
<path d="M200,28 Q228,86 228,122 Q200,152 172,122 Q172,86 200,28Z" fill="white" stroke="#111" stroke-width="2.5" transform="rotate(72,200,200)"/>
<path d="M200,28 Q228,86 228,122 Q200,152 172,122 Q172,86 200,28Z" fill="white" stroke="#111" stroke-width="2.5" transform="rotate(108,200,200)"/>
<path d="M200,28 Q228,86 228,122 Q200,152 172,122 Q172,86 200,28Z" fill="white" stroke="#111" stroke-width="2.5" transform="rotate(144,200,200)"/>
<path d="M200,28 Q228,86 228,122 Q200,152 172,122 Q172,86 200,28Z" fill="white" stroke="#111" stroke-width="2.5" transform="rotate(180,200,200)"/>
<path d="M200,28 Q228,86 228,122 Q200,152 172,122 Q172,86 200,28Z" fill="white" stroke="#111" stroke-width="2.5" transform="rotate(216,200,200)"/>
<path d="M200,28 Q228,86 228,122 Q200,152 172,122 Q172,86 200,28Z" fill="white" stroke="#111" stroke-width="2.5" transform="rotate(252,200,200)"/>
<path d="M200,28 Q228,86 228,122 Q200,152 172,122 Q172,86 200,28Z" fill="white" stroke="#111" stroke-width="2.5" transform="rotate(288,200,200)"/>
<path d="M200,28 Q228,86 228,122 Q200,152 172,122 Q172,86 200,28Z" fill="white" stroke="#111" stroke-width="2.5" transform="rotate(324,200,200)"/>
<!-- 10 inner drops -->
<path d="M200,108 Q213,140 200,156 Q187,140 200,108Z" fill="white" stroke="#111" stroke-width="2"/>
<path d="M200,108 Q213,140 200,156 Q187,140 200,108Z" fill="white" stroke="#111" stroke-width="2" transform="rotate(36,200,200)"/>
<path d="M200,108 Q213,140 200,156 Q187,140 200,108Z" fill="white" stroke="#111" stroke-width="2" transform="rotate(72,200,200)"/>
<path d="M200,108 Q213,140 200,156 Q187,140 200,108Z" fill="white" stroke="#111" stroke-width="2" transform="rotate(108,200,200)"/>
<path d="M200,108 Q213,140 200,156 Q187,140 200,108Z" fill="white" stroke="#111" stroke-width="2" transform="rotate(144,200,200)"/>
<path d="M200,108 Q213,140 200,156 Q187,140 200,108Z" fill="white" stroke="#111" stroke-width="2" transform="rotate(180,200,200)"/>
<path d="M200,108 Q213,140 200,156 Q187,140 200,108Z" fill="white" stroke="#111" stroke-width="2" transform="rotate(216,200,200)"/>
<path d="M200,108 Q213,140 200,156 Q187,140 200,108Z" fill="white" stroke="#111" stroke-width="2" transform="rotate(252,200,200)"/>
<path d="M200,108 Q213,140 200,156 Q187,140 200,108Z" fill="white" stroke="#111" stroke-width="2" transform="rotate(288,200,200)"/>
<path d="M200,108 Q213,140 200,156 Q187,140 200,108Z" fill="white" stroke="#111" stroke-width="2" transform="rotate(324,200,200)"/>
<circle cx="200" cy="200" r="44" fill="white" stroke="#111" stroke-width="2.5"/>
<circle cx="200" cy="200" r="14" fill="#111"/>
</svg>`,
  },
  {
    id:'m8', name:'සමනළ මණ්ඩලය', nameEn:'Butterfly Mandala', icon:'🦋', bg:'#F8F0FF',
    svg:`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 400">
<rect width="400" height="400" fill="white"/>
<circle cx="200" cy="200" r="192" fill="none" stroke="#111" stroke-width="3"/>
<!-- 4 large butterfly wings -->
<ellipse cx="200" cy="106" rx="68" ry="84" fill="white" stroke="#111" stroke-width="2.5"/>
<ellipse cx="200" cy="106" rx="68" ry="84" fill="white" stroke="#111" stroke-width="2.5" transform="rotate(90,200,200)"/>
<ellipse cx="200" cy="106" rx="68" ry="84" fill="white" stroke="#111" stroke-width="2.5" transform="rotate(180,200,200)"/>
<ellipse cx="200" cy="106" rx="68" ry="84" fill="white" stroke="#111" stroke-width="2.5" transform="rotate(270,200,200)"/>
<!-- 4 wing inner circles -->
<circle cx="200" cy="126" r="20" fill="white" stroke="#111" stroke-width="2"/>
<circle cx="200" cy="126" r="20" fill="white" stroke="#111" stroke-width="2" transform="rotate(90,200,200)"/>
<circle cx="200" cy="126" r="20" fill="white" stroke="#111" stroke-width="2" transform="rotate(180,200,200)"/>
<circle cx="200" cy="126" r="20" fill="white" stroke="#111" stroke-width="2" transform="rotate(270,200,200)"/>
<!-- 4 diagonal wings smaller -->
<ellipse cx="200" cy="126" rx="36" ry="52" fill="white" stroke="#111" stroke-width="2" transform="rotate(45,200,200)"/>
<ellipse cx="200" cy="126" rx="36" ry="52" fill="white" stroke="#111" stroke-width="2" transform="rotate(135,200,200)"/>
<ellipse cx="200" cy="126" rx="36" ry="52" fill="white" stroke="#111" stroke-width="2" transform="rotate(225,200,200)"/>
<ellipse cx="200" cy="126" rx="36" ry="52" fill="white" stroke="#111" stroke-width="2" transform="rotate(315,200,200)"/>
<!-- Body -->
<ellipse cx="200" cy="200" rx="16" ry="66" fill="white" stroke="#111" stroke-width="2.5"/>
<circle cx="200" cy="200" r="18" fill="white" stroke="#111" stroke-width="2"/>
<circle cx="200" cy="200" r="7" fill="#111"/>
</svg>`,
  },
  {
    id:'m9', name:'සාම මණ්ඩලය', nameEn:'Peace Mandala', icon:'🕊️', bg:'#F0FFF4',
    svg:`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 400">
<rect width="400" height="400" fill="white"/>
<circle cx="200" cy="200" r="192" fill="none" stroke="#111" stroke-width="3"/>
<circle cx="200" cy="200" r="152" fill="none" stroke="#333" stroke-width="1"/>
<circle cx="200" cy="200" r="112" fill="none" stroke="#333" stroke-width="1"/>
<!-- 10 outer teardrop petals -->
<path d="M200,28 Q216,58 200,72 Q184,58 200,28Z" fill="white" stroke="#111" stroke-width="2.5"/>
<path d="M200,28 Q216,58 200,72 Q184,58 200,28Z" fill="white" stroke="#111" stroke-width="2.5" transform="rotate(36,200,200)"/>
<path d="M200,28 Q216,58 200,72 Q184,58 200,28Z" fill="white" stroke="#111" stroke-width="2.5" transform="rotate(72,200,200)"/>
<path d="M200,28 Q216,58 200,72 Q184,58 200,28Z" fill="white" stroke="#111" stroke-width="2.5" transform="rotate(108,200,200)"/>
<path d="M200,28 Q216,58 200,72 Q184,58 200,28Z" fill="white" stroke="#111" stroke-width="2.5" transform="rotate(144,200,200)"/>
<path d="M200,28 Q216,58 200,72 Q184,58 200,28Z" fill="white" stroke="#111" stroke-width="2.5" transform="rotate(180,200,200)"/>
<path d="M200,28 Q216,58 200,72 Q184,58 200,28Z" fill="white" stroke="#111" stroke-width="2.5" transform="rotate(216,200,200)"/>
<path d="M200,28 Q216,58 200,72 Q184,58 200,28Z" fill="white" stroke="#111" stroke-width="2.5" transform="rotate(252,200,200)"/>
<path d="M200,28 Q216,58 200,72 Q184,58 200,28Z" fill="white" stroke="#111" stroke-width="2.5" transform="rotate(288,200,200)"/>
<path d="M200,28 Q216,58 200,72 Q184,58 200,28Z" fill="white" stroke="#111" stroke-width="2.5" transform="rotate(324,200,200)"/>
<!-- 10 middle ellipses -->
<ellipse cx="200" cy="96" rx="10" ry="18" fill="white" stroke="#111" stroke-width="2"/>
<ellipse cx="200" cy="96" rx="10" ry="18" fill="white" stroke="#111" stroke-width="2" transform="rotate(36,200,200)"/>
<ellipse cx="200" cy="96" rx="10" ry="18" fill="white" stroke="#111" stroke-width="2" transform="rotate(72,200,200)"/>
<ellipse cx="200" cy="96" rx="10" ry="18" fill="white" stroke="#111" stroke-width="2" transform="rotate(108,200,200)"/>
<ellipse cx="200" cy="96" rx="10" ry="18" fill="white" stroke="#111" stroke-width="2" transform="rotate(144,200,200)"/>
<ellipse cx="200" cy="96" rx="10" ry="18" fill="white" stroke="#111" stroke-width="2" transform="rotate(180,200,200)"/>
<ellipse cx="200" cy="96" rx="10" ry="18" fill="white" stroke="#111" stroke-width="2" transform="rotate(216,200,200)"/>
<ellipse cx="200" cy="96" rx="10" ry="18" fill="white" stroke="#111" stroke-width="2" transform="rotate(252,200,200)"/>
<ellipse cx="200" cy="96" rx="10" ry="18" fill="white" stroke="#111" stroke-width="2" transform="rotate(288,200,200)"/>
<ellipse cx="200" cy="96" rx="10" ry="18" fill="white" stroke="#111" stroke-width="2" transform="rotate(324,200,200)"/>
<!-- 10 inner dots -->
<circle cx="200" cy="132" r="9" fill="white" stroke="#111" stroke-width="1.8"/>
<circle cx="200" cy="132" r="9" fill="white" stroke="#111" stroke-width="1.8" transform="rotate(36,200,200)"/>
<circle cx="200" cy="132" r="9" fill="white" stroke="#111" stroke-width="1.8" transform="rotate(72,200,200)"/>
<circle cx="200" cy="132" r="9" fill="white" stroke="#111" stroke-width="1.8" transform="rotate(108,200,200)"/>
<circle cx="200" cy="132" r="9" fill="white" stroke="#111" stroke-width="1.8" transform="rotate(144,200,200)"/>
<circle cx="200" cy="132" r="9" fill="white" stroke="#111" stroke-width="1.8" transform="rotate(180,200,200)"/>
<circle cx="200" cy="132" r="9" fill="white" stroke="#111" stroke-width="1.8" transform="rotate(216,200,200)"/>
<circle cx="200" cy="132" r="9" fill="white" stroke="#111" stroke-width="1.8" transform="rotate(252,200,200)"/>
<circle cx="200" cy="132" r="9" fill="white" stroke="#111" stroke-width="1.8" transform="rotate(288,200,200)"/>
<circle cx="200" cy="132" r="9" fill="white" stroke="#111" stroke-width="1.8" transform="rotate(324,200,200)"/>
<circle cx="200" cy="200" r="52" fill="white" stroke="#111" stroke-width="2.5"/>
<circle cx="200" cy="200" r="26" fill="white" stroke="#111" stroke-width="2"/>
<circle cx="200" cy="200" r="8" fill="#111"/>
</svg>`,
  },
  {
    id:'m10', name:'උයන් මණ්ඩලය', nameEn:'Garden Mandala', icon:'🌼', bg:'#FFFEF0',
    svg:`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 400">
<rect width="400" height="400" fill="white"/>
<circle cx="200" cy="200" r="192" fill="none" stroke="#111" stroke-width="3"/>
<!-- 8 large leaf-petals with inner -->
<path d="M200,24 C234,60 244,104 200,142 C156,104 166,60 200,24Z" fill="white" stroke="#111" stroke-width="2.5"/>
<path d="M200,24 C234,60 244,104 200,142 C156,104 166,60 200,24Z" fill="white" stroke="#111" stroke-width="2.5" transform="rotate(45,200,200)"/>
<path d="M200,24 C234,60 244,104 200,142 C156,104 166,60 200,24Z" fill="white" stroke="#111" stroke-width="2.5" transform="rotate(90,200,200)"/>
<path d="M200,24 C234,60 244,104 200,142 C156,104 166,60 200,24Z" fill="white" stroke="#111" stroke-width="2.5" transform="rotate(135,200,200)"/>
<path d="M200,24 C234,60 244,104 200,142 C156,104 166,60 200,24Z" fill="white" stroke="#111" stroke-width="2.5" transform="rotate(180,200,200)"/>
<path d="M200,24 C234,60 244,104 200,142 C156,104 166,60 200,24Z" fill="white" stroke="#111" stroke-width="2.5" transform="rotate(225,200,200)"/>
<path d="M200,24 C234,60 244,104 200,142 C156,104 166,60 200,24Z" fill="white" stroke="#111" stroke-width="2.5" transform="rotate(270,200,200)"/>
<path d="M200,24 C234,60 244,104 200,142 C156,104 166,60 200,24Z" fill="white" stroke="#111" stroke-width="2.5" transform="rotate(315,200,200)"/>
<!-- Inner 8 small petals -->
<path d="M200,96 C214,118 218,138 200,152 C182,138 186,118 200,96Z" fill="white" stroke="#111" stroke-width="2"/>
<path d="M200,96 C214,118 218,138 200,152 C182,138 186,118 200,96Z" fill="white" stroke="#111" stroke-width="2" transform="rotate(45,200,200)"/>
<path d="M200,96 C214,118 218,138 200,152 C182,138 186,118 200,96Z" fill="white" stroke="#111" stroke-width="2" transform="rotate(90,200,200)"/>
<path d="M200,96 C214,118 218,138 200,152 C182,138 186,118 200,96Z" fill="white" stroke="#111" stroke-width="2" transform="rotate(135,200,200)"/>
<path d="M200,96 C214,118 218,138 200,152 C182,138 186,118 200,96Z" fill="white" stroke="#111" stroke-width="2" transform="rotate(180,200,200)"/>
<path d="M200,96 C214,118 218,138 200,152 C182,138 186,118 200,96Z" fill="white" stroke="#111" stroke-width="2" transform="rotate(225,200,200)"/>
<path d="M200,96 C214,118 218,138 200,152 C182,138 186,118 200,96Z" fill="white" stroke="#111" stroke-width="2" transform="rotate(270,200,200)"/>
<path d="M200,96 C214,118 218,138 200,152 C182,138 186,118 200,96Z" fill="white" stroke="#111" stroke-width="2" transform="rotate(315,200,200)"/>
<circle cx="200" cy="200" r="48" fill="white" stroke="#111" stroke-width="2.5"/>
<circle cx="200" cy="200" r="8" fill="#111"/>
</svg>`,
  },
];

// ── COLOURING PAGES ──────────────────────────────────────────
const COLOUR_PAGES = [
  {
    id:'c1', name:'ආදරේ බඳුන', nameEn:'Hearts in a Jar', icon:'🫙', bg:'#FFF0F5',
    svg:`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 420">
<rect width="400" height="420" fill="white"/>
<!-- Jar body -->
<path d="M108,152 Q86,206 86,282 Q86,366 200,374 Q314,366 314,282 Q314,206 292,152Z" fill="white" stroke="#111" stroke-width="3"/>
<!-- Jar base rings -->
<ellipse cx="200" cy="366" rx="112" ry="18" fill="white" stroke="#111" stroke-width="2.5"/>
<ellipse cx="200" cy="374" rx="96" ry="12" fill="white" stroke="#111" stroke-width="2"/>
<!-- Jar neck -->
<rect x="138" y="118" width="124" height="36" rx="9" fill="white" stroke="#111" stroke-width="2.5"/>
<!-- Bow left wing -->
<path d="M126,24 Q72,6 62,38 Q52,70 96,82 Q124,86 148,104" fill="white" stroke="#111" stroke-width="3"/>
<path d="M130,34 Q94,24 88,48 Q84,66 116,74 Q134,78 146,92" fill="white" stroke="#111" stroke-width="1.8"/>
<!-- Bow right wing -->
<path d="M274,24 Q328,6 338,38 Q348,70 304,82 Q276,86 252,104" fill="white" stroke="#111" stroke-width="3"/>
<path d="M270,34 Q306,24 312,48 Q316,66 284,74 Q266,78 254,92" fill="white" stroke="#111" stroke-width="1.8"/>
<!-- Bow knot -->
<ellipse cx="200" cy="102" rx="22" ry="16" fill="white" stroke="#111" stroke-width="2.5"/>
<!-- Bow tails -->
<path d="M186,112 Q168,132 148,128 Q134,125 128,114" fill="none" stroke="#111" stroke-width="2.5"/>
<path d="M214,112 Q232,132 252,128 Q266,125 272,114" fill="none" stroke="#111" stroke-width="2.5"/>
<!-- Large center heart -->
<path d="M200,212 Q212,196 228,205 Q244,214 244,232 Q244,250 200,276 Q156,250 156,232 Q156,214 172,205 Q188,196 200,212Z" fill="white" stroke="#111" stroke-width="2.5"/>
<!-- Heart shine line -->
<path d="M200,220 Q208,210 216,214 Q222,220 222,230" fill="none" stroke="#111" stroke-width="1.5"/>
<!-- Small hearts -->
<path d="M142,198 Q148,188 156,194 Q162,200 162,208 Q162,216 142,226 Q122,216 122,208 Q122,200 128,194 Q136,188 142,198Z" fill="white" stroke="#111" stroke-width="2"/>
<path d="M258,198 Q264,188 272,194 Q278,200 278,208 Q278,216 258,226 Q238,216 238,208 Q238,200 244,194 Q252,188 258,198Z" fill="white" stroke="#111" stroke-width="2"/>
<path d="M158,256 Q163,248 169,252 Q174,256 174,262 Q174,268 158,276 Q142,268 142,262 Q142,256 147,252 Q153,248 158,256Z" fill="white" stroke="#111" stroke-width="2"/>
<path d="M242,256 Q247,248 253,252 Q258,256 258,262 Q258,268 242,276 Q226,268 226,262 Q226,256 231,252 Q237,248 242,256Z" fill="white" stroke="#111" stroke-width="2"/>
<path d="M200,296 Q204,290 208,292 Q212,296 212,300 Q212,304 200,311 Q188,304 188,300 Q188,296 192,292 Q196,290 200,296Z" fill="white" stroke="#111" stroke-width="2"/>
<!-- Jar shine -->
<path d="M118,178 Q112,206 114,248" fill="none" stroke="#e0e0e0" stroke-width="8" stroke-linecap="round"/>
<path d="M134,168 Q128,184 130,218" fill="none" stroke="#e0e0e0" stroke-width="5" stroke-linecap="round"/>
</svg>`,
  },
  {
    id:'c2', name:'ආදර හදවත', nameEn:'Heart in Basket', icon:'🧺', bg:'#FFF5F0',
    svg:`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 420">
<rect width="400" height="420" fill="white"/>
<!-- Basket body -->
<path d="M86,252 Q74,314 80,368 Q86,402 200,408 Q314,402 320,368 Q326,314 314,252Z" fill="white" stroke="#111" stroke-width="3"/>
<!-- Weave horizontal lines -->
<path d="M90,278 Q200,270 310,278" fill="none" stroke="#111" stroke-width="1.8"/>
<path d="M86,306 Q200,298 314,306" fill="none" stroke="#111" stroke-width="1.8"/>
<path d="M84,334 Q200,326 316,334" fill="none" stroke="#111" stroke-width="1.8"/>
<path d="M83,362 Q200,354 317,362" fill="none" stroke="#111" stroke-width="1.8"/>
<!-- Weave vertical lines -->
<path d="M118,254 Q116,378 118,402" fill="none" stroke="#111" stroke-width="1.5"/>
<path d="M154,252 Q152,382 154,406" fill="none" stroke="#111" stroke-width="1.5"/>
<path d="M200,252 Q200,384 200,408" fill="none" stroke="#111" stroke-width="1.5"/>
<path d="M246,252 Q248,382 246,406" fill="none" stroke="#111" stroke-width="1.5"/>
<path d="M282,254 Q284,378 282,402" fill="none" stroke="#111" stroke-width="1.5"/>
<!-- Basket rim -->
<path d="M82,254 Q88,239 200,233 Q312,239 318,254" fill="white" stroke="#111" stroke-width="3"/>
<ellipse cx="200" cy="244" rx="118" ry="18" fill="white" stroke="#111" stroke-width="2.5"/>
<!-- Leaves -->
<path d="M82,242 Q57,210 48,178 Q80,176 96,210 Z" fill="white" stroke="#111" stroke-width="2.5"/>
<path d="M82,242 Q68,222 66,200" fill="none" stroke="#111" stroke-width="1.5"/>
<path d="M318,242 Q343,210 352,178 Q320,176 304,210 Z" fill="white" stroke="#111" stroke-width="2.5"/>
<path d="M318,242 Q332,222 334,200" fill="none" stroke="#111" stroke-width="1.5"/>
<path d="M90,240 Q65,214 56,188 Q80,190 94,216 Z" fill="white" stroke="#111" stroke-width="2"/>
<path d="M310,240 Q335,214 344,188 Q320,190 306,216 Z" fill="white" stroke="#111" stroke-width="2"/>
<!-- Big heart with face -->
<path d="M200,90 Q218,56 248,66 Q284,78 284,116 Q284,154 200,208 Q116,154 116,116 Q116,78 152,66 Q182,56 200,90Z" fill="white" stroke="#111" stroke-width="3"/>
<!-- Heart shine -->
<path d="M200,104 Q213,84 228,92 Q244,100 244,118" fill="none" stroke="#111" stroke-width="2"/>
<!-- Smile face -->
<circle cx="172" cy="120" r="11" fill="#111"/>
<circle cx="228" cy="120" r="11" fill="#111"/>
<path d="M174,148 Q200,166 226,148" fill="none" stroke="#111" stroke-width="4" stroke-linecap="round"/>
<!-- Cheeks -->
<ellipse cx="148" cy="136" rx="14" ry="10" fill="white" stroke="#111" stroke-width="1.8"/>
<ellipse cx="252" cy="136" rx="14" ry="10" fill="white" stroke="#111" stroke-width="1.8"/>
<!-- Floating hearts around -->
<path d="M72,96 Q77,86 84,90 Q90,96 90,104 Q90,112 72,122 Q54,112 54,104 Q54,96 60,90 Q67,86 72,96Z" fill="white" stroke="#111" stroke-width="2"/>
<path d="M112,46 Q117,37 124,41 Q130,46 130,53 Q130,60 112,70 Q94,60 94,53 Q94,46 100,41 Q107,37 112,46Z" fill="white" stroke="#111" stroke-width="2"/>
<path d="M160,18 Q165,10 171,13 Q176,18 176,24 Q176,30 160,39 Q144,30 144,24 Q144,18 149,13 Q155,10 160,18Z" fill="white" stroke="#111" stroke-width="2"/>
<path d="M200,10 Q205,2 211,5 Q216,10 216,16 Q216,22 200,30 Q184,22 184,16 Q184,10 190,5 Q195,2 200,10Z" fill="white" stroke="#111" stroke-width="2"/>
<path d="M240,18 Q245,10 251,13 Q256,18 256,24 Q256,30 240,39 Q224,30 224,24 Q224,18 229,13 Q235,10 240,18Z" fill="white" stroke="#111" stroke-width="2"/>
<path d="M288,46 Q293,37 300,41 Q306,46 306,53 Q306,60 288,70 Q270,60 270,53 Q270,46 276,41 Q283,37 288,46Z" fill="white" stroke="#111" stroke-width="2"/>
<path d="M328,96 Q333,86 340,90 Q346,96 346,104 Q346,112 328,122 Q310,112 310,104 Q310,96 316,90 Q323,86 328,96Z" fill="white" stroke="#111" stroke-width="2"/>
<!-- Dots -->
<circle cx="136" cy="66" r="5" fill="#111"/>
<circle cx="264" cy="66" r="5" fill="#111"/>
<circle cx="200" cy="48" r="5" fill="#111"/>
</svg>`,
  },
  {
    id:'c3', name:'ජ්‍යාමිතික හදවත', nameEn:'Geometric Heart', icon:'💎', bg:'#FFF0F5',
    svg:`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 420">
<rect width="400" height="420" fill="white"/>
<path d="M200,378 L26,198 L26,116 L90,52 L166,52 L200,94 L234,52 L310,52 L374,116 L374,198 Z" fill="white" stroke="#111" stroke-width="3"/>
<!-- Left top facets -->
<polygon points="26,116 90,52 100,116" fill="white" stroke="#111" stroke-width="2.5"/>
<polygon points="90,52 166,52 100,116" fill="white" stroke="#111" stroke-width="2.5"/>
<polygon points="100,116 166,52 168,116" fill="white" stroke="#111" stroke-width="2.5"/>
<!-- Center top facets -->
<polygon points="166,52 200,94 168,116" fill="white" stroke="#111" stroke-width="2.5"/>
<polygon points="200,94 234,52 232,116 200,94 168,116" fill="white" stroke="#111" stroke-width="2.5"/>
<!-- Right top facets -->
<polygon points="234,52 310,52 300,116" fill="white" stroke="#111" stroke-width="2.5"/>
<polygon points="234,116 300,116 234,52" fill="white" stroke="#111" stroke-width="2.5"/>
<polygon points="310,52 374,116 300,116" fill="white" stroke="#111" stroke-width="2.5"/>
<!-- Left side -->
<polygon points="26,116 100,116 26,198" fill="white" stroke="#111" stroke-width="2.5"/>
<polygon points="100,116 200,200 26,198" fill="white" stroke="#111" stroke-width="2.5"/>
<!-- Right side -->
<polygon points="374,116 300,116 374,198" fill="white" stroke="#111" stroke-width="2.5"/>
<polygon points="300,116 200,200 374,198" fill="white" stroke="#111" stroke-width="2.5"/>
<!-- Center top -->
<polygon points="100,116 168,116 200,200" fill="white" stroke="#111" stroke-width="2.5"/>
<polygon points="168,116 232,116 200,200" fill="white" stroke="#111" stroke-width="2.5"/>
<polygon points="232,116 300,116 200,200" fill="white" stroke="#111" stroke-width="2.5"/>
<!-- Lower left facets -->
<polygon points="26,198 200,200 68,272" fill="white" stroke="#111" stroke-width="2.5"/>
<polygon points="68,272 200,200 114,302" fill="white" stroke="#111" stroke-width="2.5"/>
<polygon points="68,272 114,302 62,348" fill="white" stroke="#111" stroke-width="2.5"/>
<polygon points="62,348 114,302 200,378" fill="white" stroke="#111" stroke-width="2.5"/>
<!-- Lower right facets -->
<polygon points="374,198 200,200 332,272" fill="white" stroke="#111" stroke-width="2.5"/>
<polygon points="332,272 200,200 286,302" fill="white" stroke="#111" stroke-width="2.5"/>
<polygon points="332,272 286,302 338,348" fill="white" stroke="#111" stroke-width="2.5"/>
<polygon points="338,348 286,302 200,378" fill="white" stroke="#111" stroke-width="2.5"/>
<!-- Center lower -->
<polygon points="114,302 200,200 286,302 200,378" fill="white" stroke="#111" stroke-width="2.5"/>
</svg>`,
  },
  {
    id:'c4', name:'ළදරු කෑම', nameEn:'Baby Eating', icon:'👶', bg:'#FFFFF0',
    svg:`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 460">
<rect width="400" height="460" fill="white"/>
<!-- Highchair legs -->
<rect x="94" y="292" width="20" height="148" rx="7" fill="white" stroke="#111" stroke-width="2.5"/>
<rect x="286" y="292" width="20" height="148" rx="7" fill="white" stroke="#111" stroke-width="2.5"/>
<rect x="90" y="338" width="220" height="14" rx="7" fill="white" stroke="#111" stroke-width="2"/>
<rect x="94" y="384" width="212" height="12" rx="6" fill="white" stroke="#111" stroke-width="2"/>
<!-- Seat -->
<rect x="96" y="278" width="208" height="32" rx="12" fill="white" stroke="#111" stroke-width="2.5"/>
<!-- Tray -->
<rect x="68" y="244" width="264" height="24" rx="12" fill="white" stroke="#111" stroke-width="2.5"/>
<!-- Bowl -->
<ellipse cx="200" cy="244" rx="48" ry="10" fill="white" stroke="#111" stroke-width="2"/>
<path d="M152,246 Q200,268 248,246 L248,244 Q200,244 152,244Z" fill="white" stroke="#111" stroke-width="2"/>
<!-- Spoon -->
<path d="M236,222 Q244,234 244,244" fill="none" stroke="#111" stroke-width="4" stroke-linecap="round"/>
<ellipse cx="237" cy="218" rx="10" ry="12" fill="white" stroke="#111" stroke-width="2"/>
<!-- Torso -->
<rect x="146" y="182" width="108" height="100" rx="22" fill="white" stroke="#111" stroke-width="2.5"/>
<!-- Bib -->
<path d="M156,188 Q200,179 244,188 L240,226 Q200,242 160,226 Z" fill="white" stroke="#111" stroke-width="2"/>
<!-- Arms -->
<path d="M146,208 Q118,218 112,242 Q120,254 134,248 L150,230" fill="white" stroke="#111" stroke-width="2.5"/>
<path d="M254,208 Q282,218 288,242 Q280,254 266,248 L250,230" fill="white" stroke="#111" stroke-width="2.5"/>
<circle cx="106" cy="246" r="14" fill="white" stroke="#111" stroke-width="2"/>
<circle cx="294" cy="246" r="14" fill="white" stroke="#111" stroke-width="2"/>
<!-- Legs -->
<path d="M162,278 L155,326 Q152,336 163,340 Q173,338 175,328 L178,278" fill="white" stroke="#111" stroke-width="2.5"/>
<path d="M238,278 L245,326 Q248,336 237,340 Q227,338 225,328 L222,278" fill="white" stroke="#111" stroke-width="2.5"/>
<ellipse cx="159" cy="342" rx="22" ry="13" fill="white" stroke="#111" stroke-width="2"/>
<ellipse cx="241" cy="342" rx="22" ry="13" fill="white" stroke="#111" stroke-width="2"/>
<!-- Neck -->
<rect x="182" y="168" width="36" height="20" rx="9" fill="white" stroke="#111" stroke-width="2"/>
<!-- Head -->
<ellipse cx="200" cy="116" rx="64" ry="70" fill="white" stroke="#111" stroke-width="2.5"/>
<!-- Hair -->
<path d="M138,96 Q142,62 200,56 Q258,62 262,96" fill="white" stroke="#111" stroke-width="2"/>
<!-- Ears -->
<ellipse cx="136" cy="118" rx="12" ry="16" fill="white" stroke="#111" stroke-width="2"/>
<ellipse cx="264" cy="118" rx="12" ry="16" fill="white" stroke="#111" stroke-width="2"/>
<!-- Eyes -->
<ellipse cx="174" cy="110" rx="16" ry="17" fill="white" stroke="#111" stroke-width="2"/>
<ellipse cx="226" cy="110" rx="16" ry="17" fill="white" stroke="#111" stroke-width="2"/>
<circle cx="175" cy="111" r="9" fill="#111"/>
<circle cx="227" cy="111" r="9" fill="#111"/>
<circle cx="179" cy="107" r="3" fill="white"/>
<circle cx="231" cy="107" r="3" fill="white"/>
<!-- Brows -->
<path d="M161,95 Q174,89 187,95" fill="none" stroke="#111" stroke-width="2.5"/>
<path d="M213,95 Q226,89 239,95" fill="none" stroke="#111" stroke-width="2.5"/>
<!-- Cheeks -->
<ellipse cx="153" cy="128" rx="16" ry="11" fill="white" stroke="#111" stroke-width="1.5"/>
<ellipse cx="247" cy="128" rx="16" ry="11" fill="white" stroke="#111" stroke-width="1.5"/>
<!-- Nose -->
<ellipse cx="200" cy="124" rx="9" ry="8" fill="white" stroke="#111" stroke-width="2"/>
<!-- Smile -->
<path d="M180,140 Q200,155 220,140" fill="none" stroke="#111" stroke-width="3" stroke-linecap="round"/>
</svg>`,
  },
  {
    id:'c5', name:'ළදරු රෙදිකොළ', nameEn:'Baby Bunny', icon:'🐰', bg:'#FFF5FF',
    svg:`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 430">
<rect width="400" height="430" fill="white"/>
<!-- Left ear -->
<ellipse cx="144" cy="86" rx="32" ry="74" fill="white" stroke="#111" stroke-width="2.5"/>
<ellipse cx="144" cy="86" rx="17" ry="56" fill="white" stroke="#111" stroke-width="1.8"/>
<!-- Right ear -->
<ellipse cx="256" cy="86" rx="32" ry="74" fill="white" stroke="#111" stroke-width="2.5"/>
<ellipse cx="256" cy="86" rx="17" ry="56" fill="white" stroke="#111" stroke-width="1.8"/>
<!-- Head -->
<ellipse cx="200" cy="196" rx="90" ry="84" fill="white" stroke="#111" stroke-width="2.5"/>
<!-- Eyes -->
<ellipse cx="166" cy="180" rx="21" ry="22" fill="white" stroke="#111" stroke-width="2"/>
<ellipse cx="234" cy="180" rx="21" ry="22" fill="white" stroke="#111" stroke-width="2"/>
<circle cx="167" cy="181" r="14" fill="#111"/>
<circle cx="235" cy="181" r="14" fill="#111"/>
<circle cx="172" cy="175" r="5" fill="white"/>
<circle cx="240" cy="175" r="5" fill="white"/>
<!-- Lashes -->
<line x1="148" y1="163" x2="158" y2="170" stroke="#111" stroke-width="2"/>
<line x1="157" y1="158" x2="165" y2="165" stroke="#111" stroke-width="2"/>
<line x1="249" y1="163" x2="242" y2="170" stroke="#111" stroke-width="2"/>
<line x1="243" y1="158" x2="235" y2="165" stroke="#111" stroke-width="2"/>
<!-- Cheeks -->
<ellipse cx="142" cy="208" rx="24" ry="17" fill="white" stroke="#111" stroke-width="1.8"/>
<ellipse cx="258" cy="208" rx="24" ry="17" fill="white" stroke="#111" stroke-width="1.8"/>
<!-- Nose -->
<path d="M188,197 Q200,190 212,197 Q206,211 194,211 Q188,207 188,197Z" fill="white" stroke="#111" stroke-width="2"/>
<!-- Whiskers -->
<line x1="90" y1="198" x2="180" y2="203" stroke="#111" stroke-width="1.8"/>
<line x1="92" y1="210" x2="180" y2="210" stroke="#111" stroke-width="1.8"/>
<line x1="94" y1="222" x2="181" y2="216" stroke="#111" stroke-width="1.8"/>
<line x1="220" y1="203" x2="310" y2="198" stroke="#111" stroke-width="1.8"/>
<line x1="220" y1="210" x2="308" y2="210" stroke="#111" stroke-width="1.8"/>
<line x1="219" y1="216" x2="306" y2="222" stroke="#111" stroke-width="1.8"/>
<!-- Mouth -->
<line x1="200" y1="211" x2="200" y2="223" stroke="#111" stroke-width="2"/>
<path d="M186,223 Q200,235 214,223" fill="none" stroke="#111" stroke-width="2.5" stroke-linecap="round"/>
<!-- Bow tie -->
<path d="M174,270 Q200,261 226,270 Q200,280 174,270Z" fill="white" stroke="#111" stroke-width="2.5"/>
<path d="M174,270 Q156,260 158,273 Q165,271 174,270Z" fill="white" stroke="#111" stroke-width="2"/>
<path d="M226,270 Q244,260 242,273 Q235,271 226,270Z" fill="white" stroke="#111" stroke-width="2"/>
<circle cx="200" cy="270" r="7" fill="white" stroke="#111" stroke-width="2"/>
<!-- Body -->
<ellipse cx="200" cy="342" rx="90" ry="77" fill="white" stroke="#111" stroke-width="2.5"/>
<ellipse cx="200" cy="348" rx="50" ry="54" fill="white" stroke="#111" stroke-width="1.8"/>
<!-- Arms -->
<path d="M114,310 Q80,322 72,350 Q82,364 98,358 L128,336" fill="white" stroke="#111" stroke-width="2.5"/>
<path d="M286,310 Q320,322 328,350 Q318,364 302,358 L272,336" fill="white" stroke="#111" stroke-width="2.5"/>
<!-- Feet -->
<ellipse cx="152" cy="415" rx="46" ry="20" fill="white" stroke="#111" stroke-width="2.5"/>
<ellipse cx="248" cy="415" rx="46" ry="20" fill="white" stroke="#111" stroke-width="2.5"/>
<!-- Tail -->
<circle cx="290" cy="368" r="24" fill="white" stroke="#111" stroke-width="2"/>
</svg>`,
  },
  {
    id:'c6', name:'සිනාසෙන මුහුණ', nameEn:'Happy Baby Face', icon:'😊', bg:'#FFF9E8',
    svg:`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 400">
<rect width="400" height="400" fill="white"/>
<!-- Background stars -->
<polygon points="48,50 52,38 56,50 44,43 60,43" fill="white" stroke="#111" stroke-width="1.5"/>
<polygon points="348,58 352,46 356,58 344,51 360,51" fill="white" stroke="#111" stroke-width="1.5"/>
<polygon points="28,198 31,189 34,198 25,193 37,193" fill="white" stroke="#111" stroke-width="1.5"/>
<polygon points="372,198 375,189 378,198 369,193 381,193" fill="white" stroke="#111" stroke-width="1.5"/>
<polygon points="48,328 52,316 56,328 44,321 60,321" fill="white" stroke="#111" stroke-width="1.5"/>
<polygon points="348,328 352,316 356,328 344,321 360,321" fill="white" stroke="#111" stroke-width="1.5"/>
<!-- Big face -->
<circle cx="200" cy="200" r="166" fill="white" stroke="#111" stroke-width="3"/>
<!-- Ears -->
<ellipse cx="34" cy="200" rx="24" ry="32" fill="white" stroke="#111" stroke-width="2.5"/>
<ellipse cx="34" cy="200" rx="12" ry="19" fill="white" stroke="#111" stroke-width="1.8"/>
<ellipse cx="366" cy="200" rx="24" ry="32" fill="white" stroke="#111" stroke-width="2.5"/>
<ellipse cx="366" cy="200" rx="12" ry="19" fill="white" stroke="#111" stroke-width="1.8"/>
<!-- Hair curls -->
<path d="M87,76 Q75,46 90,38 Q108,30 106,58" fill="white" stroke="#111" stroke-width="2.5"/>
<path d="M130,54 Q124,26 142,20 Q160,16 154,44" fill="white" stroke="#111" stroke-width="2.5"/>
<path d="M178,44 Q175,16 193,14 Q211,12 205,40" fill="white" stroke="#111" stroke-width="2.5"/>
<path d="M222,44 Q225,16 241,16 Q259,16 252,42" fill="white" stroke="#111" stroke-width="2.5"/>
<path d="M266,54 Q276,26 292,30 Q306,36 296,62" fill="white" stroke="#111" stroke-width="2.5"/>
<path d="M313,76 Q330,48 344,54 Q356,62 342,86" fill="white" stroke="#111" stroke-width="2.5"/>
<!-- Eyebrows thick -->
<path d="M116,144 Q152,131 188,142" fill="none" stroke="#111" stroke-width="5" stroke-linecap="round"/>
<path d="M212,142 Q248,131 284,144" fill="none" stroke="#111" stroke-width="5" stroke-linecap="round"/>
<!-- Eyes -->
<ellipse cx="150" cy="178" rx="34" ry="35" fill="white" stroke="#111" stroke-width="2.5"/>
<ellipse cx="250" cy="178" rx="34" ry="35" fill="white" stroke="#111" stroke-width="2.5"/>
<circle cx="151" cy="179" r="21" fill="#111"/>
<circle cx="251" cy="179" r="21" fill="#111"/>
<circle cx="159" cy="170" r="8" fill="white"/>
<circle cx="259" cy="170" r="8" fill="white"/>
<!-- Cheeks -->
<ellipse cx="96" cy="226" rx="38" ry="28" fill="white" stroke="#111" stroke-width="2"/>
<ellipse cx="304" cy="226" rx="38" ry="28" fill="white" stroke="#111" stroke-width="2"/>
<!-- Nose -->
<ellipse cx="200" cy="225" rx="18" ry="15" fill="white" stroke="#111" stroke-width="2"/>
<!-- Big smile -->
<path d="M126,262 Q200,320 274,262" fill="white" stroke="#111" stroke-width="3.5" stroke-linecap="round"/>
<!-- Teeth lines in smile -->
<line x1="165" y1="272" x2="163" y2="288" stroke="#111" stroke-width="2"/>
<line x1="200" y1="276" x2="200" y2="294" stroke="#111" stroke-width="2"/>
<line x1="235" y1="272" x2="237" y2="288" stroke="#111" stroke-width="2"/>
</svg>`,
  },
  {
    id:'c7', name:'ළදරු ඇතා', nameEn:'Baby Elephant', icon:'🐘', bg:'#F0F8FF',
    svg:`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 380">
<rect width="400" height="380" fill="white"/>
<!-- Ground -->
<path d="M0,322 Q200,308 400,322 L400,380 L0,380 Z" fill="white" stroke="#111" stroke-width="2"/>
<!-- Grass -->
<path d="M28,322 Q30,305 32,322" fill="white" stroke="#111" stroke-width="2"/>
<path d="M42,322 Q46,298 50,322" fill="white" stroke="#111" stroke-width="2"/>
<path d="M62,322 Q64,308 66,322" fill="white" stroke="#111" stroke-width="2"/>
<path d="M342,322 Q344,305 346,322" fill="white" stroke="#111" stroke-width="2"/>
<path d="M358,322 Q362,298 366,322" fill="white" stroke="#111" stroke-width="2"/>
<!-- Flowers -->
<circle cx="76" cy="314" r="12" fill="white" stroke="#111" stroke-width="1.8"/>
<circle cx="76" cy="302" r="8" fill="white" stroke="#111" stroke-width="1.8"/>
<circle cx="88" cy="308" r="8" fill="white" stroke="#111" stroke-width="1.8"/>
<circle cx="64" cy="308" r="8" fill="white" stroke="#111" stroke-width="1.8"/>
<circle cx="330" cy="314" r="12" fill="white" stroke="#111" stroke-width="1.8"/>
<circle cx="330" cy="302" r="8" fill="white" stroke="#111" stroke-width="1.8"/>
<circle cx="342" cy="308" r="8" fill="white" stroke="#111" stroke-width="1.8"/>
<circle cx="318" cy="308" r="8" fill="white" stroke="#111" stroke-width="1.8"/>
<!-- Body -->
<ellipse cx="230" cy="228" rx="128" ry="98" fill="white" stroke="#111" stroke-width="2.5"/>
<!-- Head -->
<ellipse cx="118" cy="178" rx="84" ry="78" fill="white" stroke="#111" stroke-width="2.5"/>
<!-- Ear -->
<ellipse cx="68" cy="162" rx="40" ry="52" fill="white" stroke="#111" stroke-width="2.5"/>
<ellipse cx="70" cy="163" rx="24" ry="36" fill="white" stroke="#111" stroke-width="1.8"/>
<!-- Trunk -->
<path d="M76,224 Q44,248 40,286 Q38,308 60,314 Q82,318 86,298 Q90,272 104,252" fill="white" stroke="#111" stroke-width="2.5"/>
<!-- Trunk wrinkles -->
<path d="M50,252 Q65,248 73,257" fill="none" stroke="#111" stroke-width="1.8"/>
<path d="M44,272 Q59,268 67,276" fill="none" stroke="#111" stroke-width="1.8"/>
<path d="M42,292 Q54,288 62,294" fill="none" stroke="#111" stroke-width="1.8"/>
<!-- Trunk tip -->
<ellipse cx="60" cy="312" rx="22" ry="11" fill="white" stroke="#111" stroke-width="2"/>
<!-- Tusk -->
<path d="M94,220 Q72,236 74,256 Q82,264 96,254 Q108,236 106,222" fill="white" stroke="#111" stroke-width="2"/>
<!-- Eye -->
<ellipse cx="104" cy="165" rx="20" ry="20" fill="white" stroke="#111" stroke-width="2"/>
<circle cx="105" cy="166" r="12" fill="#111"/>
<circle cx="110" cy="161" r="4" fill="white"/>
<!-- Brow -->
<path d="M90,150 Q104,144 118,150" fill="none" stroke="#111" stroke-width="2.5"/>
<!-- Smile -->
<path d="M110,208 Q124,218 138,208" fill="none" stroke="#111" stroke-width="3" stroke-linecap="round"/>
<!-- Tail -->
<path d="M356,212 Q384,202 390,184 Q392,170 380,166 Q368,164 364,180 Q360,198 350,210" fill="white" stroke="#111" stroke-width="2.5"/>
<circle cx="384" cy="164" r="13" fill="white" stroke="#111" stroke-width="2"/>
<!-- Legs -->
<rect x="148" y="308" width="54" height="62" rx="20" fill="white" stroke="#111" stroke-width="2.5"/>
<rect x="214" y="310" width="54" height="60" rx="20" fill="white" stroke="#111" stroke-width="2.5"/>
<rect x="280" y="308" width="54" height="62" rx="20" fill="white" stroke="#111" stroke-width="2.5"/>
<!-- Toenails -->
<ellipse cx="162" cy="368" rx="11" ry="7" fill="white" stroke="#111" stroke-width="1.8"/>
<ellipse cx="178" cy="369" rx="11" ry="7" fill="white" stroke="#111" stroke-width="1.8"/>
<ellipse cx="228" cy="368" rx="11" ry="7" fill="white" stroke="#111" stroke-width="1.8"/>
<ellipse cx="244" cy="369" rx="11" ry="7" fill="white" stroke="#111" stroke-width="1.8"/>
<ellipse cx="294" cy="368" rx="11" ry="7" fill="white" stroke="#111" stroke-width="1.8"/>
<ellipse cx="310" cy="369" rx="11" ry="7" fill="white" stroke="#111" stroke-width="1.8"/>
</svg>`,
  },
  {
    id:'c8', name:'ළදරු බළලා', nameEn:'Cute Cat', icon:'🐱', bg:'#FFF8F0',
    svg:`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 420">
<rect width="400" height="420" fill="white"/>
<!-- Moon -->
<path d="M346,56 Q328,78 336,102 Q358,112 372,96 Q360,68 346,56Z" fill="white" stroke="#111" stroke-width="2"/>
<!-- Stars -->
<polygon points="50,44 54,32 58,44 46,37 62,37" fill="white" stroke="#111" stroke-width="1.5"/>
<polygon points="322,106 325,97 328,106 319,101 331,101" fill="white" stroke="#111" stroke-width="1.5"/>
<polygon points="78,108 81,99 84,108 75,103 87,103" fill="white" stroke="#111" stroke-width="1.5"/>
<!-- Cat ears with inner -->
<polygon points="98,134 82,66 150,116" fill="white" stroke="#111" stroke-width="2.5"/>
<polygon points="104,130 90,76 144,114" fill="white" stroke="#111" stroke-width="1.8"/>
<polygon points="302,134 318,66 250,116" fill="white" stroke="#111" stroke-width="2.5"/>
<polygon points="296,130 310,76 256,114" fill="white" stroke="#111" stroke-width="1.8"/>
<!-- Head -->
<ellipse cx="200" cy="196" rx="118" ry="110" fill="white" stroke="#111" stroke-width="2.5"/>
<!-- Body -->
<ellipse cx="200" cy="324" rx="88" ry="74" fill="white" stroke="#111" stroke-width="2.5"/>
<!-- Bow -->
<path d="M168,264 Q200,254 232,264 Q200,274 168,264Z" fill="white" stroke="#111" stroke-width="2.5"/>
<path d="M168,264 Q152,255 155,268 Q161,266 168,264Z" fill="white" stroke="#111" stroke-width="2"/>
<path d="M232,264 Q248,255 245,268 Q239,266 232,264Z" fill="white" stroke="#111" stroke-width="2"/>
<circle cx="200" cy="264" r="8" fill="white" stroke="#111" stroke-width="2"/>
<!-- Eyes with slit pupils -->
<ellipse cx="150" cy="178" rx="32" ry="30" fill="white" stroke="#111" stroke-width="2.5"/>
<ellipse cx="250" cy="178" rx="32" ry="30" fill="white" stroke="#111" stroke-width="2.5"/>
<ellipse cx="150" cy="178" rx="11" ry="24" fill="#111"/>
<ellipse cx="250" cy="178" rx="11" ry="24" fill="#111"/>
<ellipse cx="156" cy="171" rx="5" ry="8" fill="white"/>
<ellipse cx="256" cy="171" rx="5" ry="8" fill="white"/>
<!-- Eyelashes -->
<path d="M121,158 Q131,150 142,156" fill="none" stroke="#111" stroke-width="2"/>
<path d="M136,152 Q146,145 155,151" fill="none" stroke="#111" stroke-width="2"/>
<path d="M245,151 Q255,145 264,152" fill="none" stroke="#111" stroke-width="2"/>
<path d="M258,152 Q269,150 279,158" fill="none" stroke="#111" stroke-width="2"/>
<!-- Cheeks -->
<ellipse cx="118" cy="214" rx="28" ry="21" fill="white" stroke="#111" stroke-width="1.8"/>
<ellipse cx="282" cy="214" rx="28" ry="21" fill="white" stroke="#111" stroke-width="1.8"/>
<!-- Nose -->
<path d="M188,208 Q200,200 212,208 Q206,222 194,222 Q188,218 188,208Z" fill="white" stroke="#111" stroke-width="2"/>
<!-- Whiskers -->
<line x1="62" y1="206" x2="178" y2="212" stroke="#111" stroke-width="2"/>
<line x1="64" y1="218" x2="178" y2="218" stroke="#111" stroke-width="2"/>
<line x1="66" y1="230" x2="179" y2="224" stroke="#111" stroke-width="2"/>
<line x1="222" y1="212" x2="338" y2="206" stroke="#111" stroke-width="2"/>
<line x1="222" y1="218" x2="336" y2="218" stroke="#111" stroke-width="2"/>
<line x1="221" y1="224" x2="334" y2="230" stroke="#111" stroke-width="2"/>
<!-- Mouth -->
<line x1="200" y1="222" x2="200" y2="234" stroke="#111" stroke-width="2.5"/>
<path d="M182,234 Q200,250 218,234" fill="none" stroke="#111" stroke-width="3" stroke-linecap="round"/>
<!-- Paws -->
<ellipse cx="142" cy="393" rx="36" ry="23" fill="white" stroke="#111" stroke-width="2.5"/>
<ellipse cx="258" cy="393" rx="36" ry="23" fill="white" stroke="#111" stroke-width="2.5"/>
<!-- Toe lines -->
<line x1="120" y1="389" x2="118" y2="402" stroke="#111" stroke-width="2"/>
<line x1="140" y1="385" x2="138" y2="400" stroke="#111" stroke-width="2"/>
<line x1="160" y1="389" x2="162" y2="402" stroke="#111" stroke-width="2"/>
<line x1="238" y1="389" x2="240" y2="402" stroke="#111" stroke-width="2"/>
<line x1="258" y1="385" x2="256" y2="400" stroke="#111" stroke-width="2"/>
<line x1="278" y1="389" x2="276" y2="402" stroke="#111" stroke-width="2"/>
<!-- Tail -->
<path d="M288,344 Q344,322 360,296 Q374,272 356,264 Q340,258 332,282 Q322,306 286,324" fill="white" stroke="#111" stroke-width="2.5"/>
<ellipse cx="360" cy="260" rx="18" ry="14" fill="white" stroke="#111" stroke-width="2"/>
</svg>`,
  },
  {
    id:'c9', name:'අම්මා සහ ළදරු', nameEn:'Mother and Baby', icon:'🤱', bg:'#FFF5F8',
    svg:`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 450">
<rect width="400" height="450" fill="white"/>
<!-- Floating hearts -->
<path d="M342,64 Q349,52 358,58 Q366,64 366,74 Q366,84 342,98 Q318,84 318,74 Q318,64 326,58 Q335,52 342,64Z" fill="white" stroke="#111" stroke-width="2"/>
<path d="M56,90 Q62,79 70,84 Q77,90 77,98 Q77,107 56,118 Q35,107 35,98 Q35,90 42,84 Q50,79 56,90Z" fill="white" stroke="#111" stroke-width="2"/>
<path d="M316,128 Q320,121 325,124 Q329,128 329,133 Q329,138 316,146 Q303,138 303,133 Q303,128 307,124 Q312,121 316,128Z" fill="white" stroke="#111" stroke-width="1.8"/>
<!-- Mother body -->
<path d="M102,280 Q99,358 200,386 Q301,358 298,280 L284,232 Q260,220 200,220 Q140,220 116,232 Z" fill="white" stroke="#111" stroke-width="2.5"/>
<path d="M116,234 Q200,224 284,234 L290,258 Q200,270 110,258 Z" fill="white" stroke="#111" stroke-width="1.8"/>
<!-- Arms -->
<path d="M102,280 Q66,296 50,338 Q62,354 84,346 L114,312" fill="white" stroke="#111" stroke-width="2.5"/>
<path d="M298,280 Q334,296 350,338 Q338,354 316,346 L286,312" fill="white" stroke="#111" stroke-width="2.5"/>
<!-- Mother neck -->
<rect x="182" y="202" width="36" height="24" rx="10" fill="white" stroke="#111" stroke-width="2"/>
<!-- Mother head -->
<ellipse cx="200" cy="162" rx="74" ry="78" fill="white" stroke="#111" stroke-width="2.5"/>
<!-- Mother hair -->
<path d="M128,136 Q124,80 148,62 Q172,48 200,48 Q228,48 252,62 Q276,80 272,136" fill="white" stroke="#111" stroke-width="2.5"/>
<path d="M128,136 Q114,186 118,228" fill="white" stroke="#111" stroke-width="2"/>
<path d="M272,136 Q286,186 282,228" fill="white" stroke="#111" stroke-width="2"/>
<!-- Mother eyes -->
<ellipse cx="176" cy="154" rx="18" ry="19" fill="white" stroke="#111" stroke-width="2"/>
<ellipse cx="224" cy="154" rx="18" ry="19" fill="white" stroke="#111" stroke-width="2"/>
<circle cx="177" cy="155" r="11" fill="#111"/>
<circle cx="225" cy="155" r="11" fill="#111"/>
<circle cx="182" cy="150" r="4" fill="white"/>
<circle cx="230" cy="150" r="4" fill="white"/>
<!-- Brows -->
<path d="M162,140 Q176,133 190,140" fill="none" stroke="#111" stroke-width="2.5"/>
<path d="M210,140 Q224,133 238,140" fill="none" stroke="#111" stroke-width="2.5"/>
<!-- Smile -->
<path d="M182,186 Q200,198 218,186" fill="none" stroke="#111" stroke-width="3" stroke-linecap="round"/>
<!-- Baby held -->
<circle cx="200" cy="262" r="44" fill="white" stroke="#111" stroke-width="2.5"/>
<!-- Baby blanket -->
<path d="M150,298 Q200,286 250,298 Q248,332 200,340 Q152,332 150,298Z" fill="white" stroke="#111" stroke-width="2"/>
<ellipse cx="200" cy="312" rx="54" ry="36" fill="white" stroke="#111" stroke-width="2"/>
<!-- Baby eyes -->
<circle cx="186" cy="256" r="9" fill="#111"/>
<circle cx="214" cy="256" r="9" fill="#111"/>
<circle cx="190" cy="252" r="3" fill="white"/>
<circle cx="218" cy="252" r="3" fill="white"/>
<!-- Baby smile -->
<path d="M189,277 Q200,287 211,277" fill="none" stroke="#111" stroke-width="2.5" stroke-linecap="round"/>
<!-- Baby cheeks -->
<ellipse cx="172" cy="267" rx="12" ry="9" fill="white" stroke="#111" stroke-width="1.5"/>
<ellipse cx="228" cy="267" rx="12" ry="9" fill="white" stroke="#111" stroke-width="1.5"/>
<!-- Tiny baby hand -->
<circle cx="112" cy="308" r="15" fill="white" stroke="#111" stroke-width="2"/>
<line x1="106" y1="296" x2="102" y2="285" stroke="#111" stroke-width="2"/>
<line x1="117" y1="293" x2="115" y2="281" stroke="#111" stroke-width="2"/>
<line x1="128" y1="296" x2="130" y2="284" stroke="#111" stroke-width="2"/>
</svg>`,
  },
  {
    id:'c10', name:'ආදර ගස', nameEn:'Love Tree', icon:'🌳', bg:'#F5FFF5',
    svg:`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 420">
<rect width="400" height="420" fill="white"/>
<!-- Sun -->
<circle cx="330" cy="58" r="42" fill="white" stroke="#111" stroke-width="2.5"/>
<line x1="330" y1="10" x2="330" y2="0" stroke="#111" stroke-width="2.5" stroke-linecap="round"/>
<line x1="360" y1="18" x2="368" y2="10" stroke="#111" stroke-width="2.5" stroke-linecap="round"/>
<line x1="378" y1="48" x2="388" y2="48" stroke="#111" stroke-width="2.5" stroke-linecap="round"/>
<line x1="360" y1="84" x2="368" y2="92" stroke="#111" stroke-width="2.5" stroke-linecap="round"/>
<line x1="300" y1="18" x2="292" y2="10" stroke="#111" stroke-width="2.5" stroke-linecap="round"/>
<line x1="282" y1="48" x2="272" y2="48" stroke="#111" stroke-width="2.5" stroke-linecap="round"/>
<!-- Sun face -->
<circle cx="322" cy="52" r="6" fill="#111"/>
<circle cx="338" cy="52" r="6" fill="#111"/>
<path d="M319,66 Q330,75 341,66" fill="none" stroke="#111" stroke-width="2.5" stroke-linecap="round"/>
<!-- Cloud -->
<path d="M44,72 Q56,52 76,58 Q82,44 104,50 Q120,44 122,62 Q138,60 136,76 Q110,90 72,88 Z" fill="white" stroke="#111" stroke-width="2"/>
<!-- Ground -->
<path d="M0,332 Q100,318 200,332 Q300,346 400,332 L400,420 L0,420 Z" fill="white" stroke="#111" stroke-width="2"/>
<!-- Grass -->
<path d="M24,332 Q26,314 28,332" fill="white" stroke="#111" stroke-width="2"/>
<path d="M38,332 Q42,310 46,332" fill="white" stroke="#111" stroke-width="2"/>
<path d="M62,332 Q64,318 66,332" fill="white" stroke="#111" stroke-width="2"/>
<path d="M354,332 Q356,314 358,332" fill="white" stroke="#111" stroke-width="2"/>
<path d="M370,332 Q374,310 378,332" fill="white" stroke="#111" stroke-width="2"/>
<!-- Tree trunk -->
<rect x="180" y="250" width="40" height="150" rx="14" fill="white" stroke="#111" stroke-width="2.5"/>
<!-- Bark lines -->
<path d="M186,272 Q197,280 207,272" fill="none" stroke="#111" stroke-width="1.5"/>
<path d="M183,300 Q191,292 201,298 Q211,304 217,296" fill="none" stroke="#111" stroke-width="1.5"/>
<path d="M181,328 Q193,320 205,326" fill="none" stroke="#111" stroke-width="1.5"/>
<!-- Branches -->
<path d="M180,220 Q148,202 134,178" fill="none" stroke="#111" stroke-width="3" stroke-linecap="round"/>
<path d="M220,220 Q252,202 266,178" fill="none" stroke="#111" stroke-width="3" stroke-linecap="round"/>
<!-- Main foliage 3 clouds -->
<ellipse cx="200" cy="150" rx="90" ry="78" fill="white" stroke="#111" stroke-width="2.5"/>
<ellipse cx="136" cy="182" rx="62" ry="54" fill="white" stroke="#111" stroke-width="2.5"/>
<ellipse cx="264" cy="182" rx="62" ry="54" fill="white" stroke="#111" stroke-width="2.5"/>
<!-- Hearts in foliage -->
<path d="M200,116 Q208,103 218,110 Q228,118 228,130 Q228,142 200,158 Q172,142 172,130 Q172,118 182,110 Q192,103 200,116Z" fill="white" stroke="#111" stroke-width="2.5"/>
<path d="M152,154 Q158,143 166,149 Q173,155 173,164 Q173,173 152,183 Q131,173 131,164 Q131,155 138,149 Q146,143 152,154Z" fill="white" stroke="#111" stroke-width="2"/>
<path d="M248,154 Q254,143 262,149 Q269,155 269,164 Q269,173 248,183 Q227,173 227,164 Q227,155 234,149 Q242,143 248,154Z" fill="white" stroke="#111" stroke-width="2"/>
<path d="M128,191 Q133,182 139,186 Q144,191 144,198 Q144,205 128,213 Q112,205 112,198 Q112,191 117,186 Q123,182 128,191Z" fill="white" stroke="#111" stroke-width="1.8"/>
<path d="M272,191 Q277,182 283,186 Q288,191 288,198 Q288,205 272,213 Q256,205 256,198 Q256,191 261,186 Q267,182 272,191Z" fill="white" stroke="#111" stroke-width="1.8"/>
<!-- Flowers at base -->
<circle cx="104" cy="323" r="13" fill="white" stroke="#111" stroke-width="1.8"/>
<circle cx="104" cy="310" r="8" fill="white" stroke="#111" stroke-width="1.5"/>
<circle cx="117" cy="315" r="8" fill="white" stroke="#111" stroke-width="1.5"/>
<circle cx="91" cy="315" r="8" fill="white" stroke="#111" stroke-width="1.5"/>
<circle cx="296" cy="323" r="13" fill="white" stroke="#111" stroke-width="1.8"/>
<circle cx="296" cy="310" r="8" fill="white" stroke="#111" stroke-width="1.5"/>
<circle cx="309" cy="315" r="8" fill="white" stroke="#111" stroke-width="1.5"/>
<circle cx="283" cy="315" r="8" fill="white" stroke="#111" stroke-width="1.5"/>
</svg>`,
  },
];

// ================================================================
//  IFRAME HTML — exactly like coloringonline.com
//  SVG → Canvas → BFS flood fill on click
//  Undo / Redo stacks
//  postMessage: { type:'progress', value:0-100 }
// ================================================================
function buildColourHTML(svgString) {
  // escape for JSON.stringify inside template literal
  const escaped = JSON.stringify(svgString);
  return `<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1,user-scalable=no">
<style>
*{margin:0;padding:0;box-sizing:border-box}
html,body{
  width:100%;height:100%;overflow:hidden;
  background:#f9f5ff;
  display:flex;align-items:center;justify-content:center;
}
canvas{
  cursor:crosshair;
  display:block;
  box-shadow:0 4px 24px rgba(126,87,194,.18);
  border-radius:12px;
  background:white;
}
#loading{
  position:fixed;inset:0;
  display:flex;align-items:center;justify-content:center;
  background:#f9f5ff;
  font-family:sans-serif;font-size:14px;color:#7E57C2;
}
</style>
</head>
<body>
<div id="loading">Loading…</div>
<canvas id="c"></canvas>
<script>
const SVG_STRING = ${escaped};
const canvas  = document.getElementById('c');
const ctx     = canvas.getContext('2d');

let selColor  = '#FF0000';
let undoStack = [];      // array of ImageData
let redoStack = [];

// ── Load SVG onto canvas ─────────────────────────────────────
function loadSVG(callback) {
  const blob = new Blob([SVG_STRING], {type:'image/svg+xml;charset=utf-8'});
  const url  = URL.createObjectURL(blob);
  const img  = new Image();
  img.onload = () => {
    const maxW = window.innerWidth  - 8;
    const maxH = window.innerHeight - 8;
    const scale = Math.min(maxW / img.naturalWidth, maxH / img.naturalHeight);
    canvas.width  = Math.round(img.naturalWidth  * scale);
    canvas.height = Math.round(img.naturalHeight * scale);
    ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
    URL.revokeObjectURL(url);
    document.getElementById('loading').style.display = 'none';
    if (callback) callback();
  };
  img.onerror = () => { document.getElementById('loading').textContent = 'Error loading SVG'; };
  img.src = url;
}
loadSVG();

// ── Colour helpers ────────────────────────────────────────────
function hexToRgba(hex) {
  let h = hex.replace('#','');
  if (h.length === 3) h = h[0]+h[0]+h[1]+h[1]+h[2]+h[2];
  return [
    parseInt(h.slice(0,2),16),
    parseInt(h.slice(2,4),16),
    parseInt(h.slice(4,6),16),
    255
  ];
}
function colorClose(d, i, t, tol) {
  return Math.abs(d[i  ]-t[0]) < tol &&
         Math.abs(d[i+1]-t[1]) < tol &&
         Math.abs(d[i+2]-t[2]) < tol &&
         Math.abs(d[i+3]-t[3]) < tol;
}
function isDark(d, i) {
  return d[i] < 80 && d[i+1] < 80 && d[i+2] < 80;
}

// ── BFS flood fill ────────────────────────────────────────────
function floodFill(px, py) {
  const w = canvas.width, h = canvas.height;
  const imgData = ctx.getImageData(0, 0, w, h);
  const d = imgData.data;
  const idx = (py * w + px) * 4;

  if (isDark(d, idx)) return;          // clicked on outline
  const target = [d[idx],d[idx+1],d[idx+2],d[idx+3]];
  const fill   = hexToRgba(selColor);

  if (colorClose(d, idx, fill, 4)) return; // already same color

  // Save undo snapshot
  undoStack.push(ctx.getImageData(0, 0, w, h));
  if (undoStack.length > 30) undoStack.shift();
  redoStack = [];

  // Iterative BFS using typed array for speed
  const visited = new Uint8Array(w * h);
  const queue   = new Int32Array(w * h * 2);
  let qs = 0, qe = 0;
  queue[qe++] = px;
  queue[qe++] = py;

  while (qs < qe) {
    const x = queue[qs++];
    const y = queue[qs++];
    if (x < 0 || x >= w || y < 0 || y >= h) continue;
    const pos = y * w + x;
    if (visited[pos]) continue;
    visited[pos] = 1;
    const i = pos * 4;
    if (!colorClose(d, i, target, 28)) continue;

    d[i  ] = fill[0];
    d[i+1] = fill[1];
    d[i+2] = fill[2];
    d[i+3] = fill[3];

    queue[qe++] = x+1; queue[qe++] = y;
    queue[qe++] = x-1; queue[qe++] = y;
    queue[qe++] = x;   queue[qe++] = y+1;
    queue[qe++] = x;   queue[qe++] = y-1;
  }

  ctx.putImageData(imgData, 0, 0);
  sendProgress(d, w * h);
}

function sendProgress(data, total) {
  let colored = 0, countable = 0;
  for (let i = 0; i < data.length; i += 4) {
    if (data[i+3] < 10) continue;
    if (isDark(data, i)) continue;
    countable++;
    if (data[i] !== 255 || data[i+1] !== 255 || data[i+2] !== 255) colored++;
  }
  const pct = countable > 0 ? Math.round((colored / countable) * 100) : 0;
  const msg = JSON.stringify({type:'progress', value: pct});
  try { window.ReactNativeWebView.postMessage(msg); } catch(e){}
  try { window.parent.postMessage(msg, '*'); } catch(e){}
}

// ── Canvas interaction ────────────────────────────────────────
function getXY(e) {
  const rect = canvas.getBoundingClientRect();
  const scaleX = canvas.width  / rect.width;
  const scaleY = canvas.height / rect.height;
  const cx = e.touches ? e.touches[0].clientX : e.clientX;
  const cy = e.touches ? e.touches[0].clientY : e.clientY;
  return [
    Math.round((cx - rect.left) * scaleX),
    Math.round((cy - rect.top)  * scaleY),
  ];
}
canvas.addEventListener('click', e => {
  const [x,y] = getXY(e);
  floodFill(x, y);
});
canvas.addEventListener('touchstart', e => {
  e.preventDefault();
  const [x,y] = getXY(e);
  floodFill(x, y);
}, {passive:false});

// ── Message API from React Native / parent ────────────────────
function applyMsg(raw) {
  let msg;
  try { msg = JSON.parse(raw); } catch { return; }

  if (msg.type === 'setColor') {
    selColor = msg.color;
  }
  if (msg.type === 'undo' && undoStack.length > 0) {
    redoStack.push(ctx.getImageData(0,0,canvas.width,canvas.height));
    ctx.putImageData(undoStack.pop(), 0, 0);
  }
  if (msg.type === 'redo' && redoStack.length > 0) {
    undoStack.push(ctx.getImageData(0,0,canvas.width,canvas.height));
    ctx.putImageData(redoStack.pop(), 0, 0);
  }
  if (msg.type === 'reset') {
    undoStack = []; redoStack = [];
    ctx.clearRect(0,0,canvas.width,canvas.height);
    loadSVG();
    const m = JSON.stringify({type:'progress',value:0});
    try { window.ReactNativeWebView.postMessage(m); } catch(e){}
    try { window.parent.postMessage(m,'*'); } catch(e){}
  }
  if (msg.type === 'getImage') {
    const data = canvas.toDataURL('image/png');
    const m = JSON.stringify({type:'image',data});
    try { window.ReactNativeWebView.postMessage(m); } catch(e){}
    try { window.parent.postMessage(m,'*'); } catch(e){}
  }
}
window.addEventListener('message', e => applyMsg(e.data));
window.receiveMessage = applyMsg;
<\/script>
</body>
</html>`;
}

// ================================================================
//  COLOUR CANVAS COMPONENT
// ================================================================
const ColourCanvas = ({ design }) => {
  const iframeRef    = useRef(null);
  const [selCol,     setSelCol]     = useState('#FF0000');
  const [progress,   setProgress]   = useState(0);
  const [iframeSrc,  setIframeSrc]  = useState('');
  const isWeb = Platform.OS === 'web';

  // Rebuild blob URL whenever design changes
  useEffect(() => {
    if (!isWeb) return;
    const html = buildColourHTML(design.svg);
    const blob = new Blob([html], { type: 'text/html' });
    const url  = URL.createObjectURL(blob);
    setIframeSrc(url);
    setProgress(0);
    return () => URL.revokeObjectURL(url);
  }, [design.id, isWeb]);

  // Listen for messages from iframe
  useEffect(() => {
    if (!isWeb) return;
    const handler = (e) => {
      try {
        const msg = JSON.parse(e.data);
        if (msg.type === 'progress') setProgress(msg.value);
      } catch {}
    };
    window.addEventListener('message', handler);
    return () => window.removeEventListener('message', handler);
  }, [isWeb]);

  const send = useCallback((obj) => {
    if (isWeb) {
      iframeRef.current?.contentWindow?.postMessage(JSON.stringify(obj), '*');
    }
  }, [isWeb]);

  const pickColor = (col) => { setSelCol(col); send({ type:'setColor', color: col }); };
  const undo  = () => send({ type:'undo' });
  const redo  = () => send({ type:'redo' });
  const reset = () => { setProgress(0); send({ type:'reset' }); };

  const handlePrint = () => {
    if (isWeb) { iframeRef.current?.contentWindow?.print(); return; }
    Alert.alert('🖨️ Print', 'Run:\nnpx expo install expo-print\nthen restart.');
  };

  return (
    <View style={cv.container}>
      {/* ── Progress bar ── */}
      <View style={cv.progRow}>
        <View style={cv.progBg}>
          <View style={[cv.progFill, { width: `${progress}%` }]} />
        </View>
        <Text style={cv.progPct}>{progress}%</Text>
      </View>

      {/* ── Tip ── */}
      <Text style={cv.tip}>
        ✏️ Select a colour below, then click anywhere in the picture to fill it
      </Text>

      {/* ── Canvas (iframe) ── */}
      <View style={[cv.canvasWrap, { width: CANVAS_W, height: CANVAS_H }]}>
        {isWeb ? (
          <iframe
            ref={iframeRef}
            src={iframeSrc}
            style={{ width:'100%', height:'100%', border:'none', borderRadius:12, display:'block' }}
            title={design.nameEn}
            sandbox="allow-scripts allow-same-origin"
          />
        ) : (
          <View style={cv.nativeMsg}>
            <Text style={cv.nativeTxt}>
              Install WebView:{'\n'}npx expo install react-native-webview
            </Text>
          </View>
        )}
      </View>

      {/* ── Colour palette — rectangular swatches like coloringonline.com ── */}
      <View style={cv.palSection}>
        <Text style={cv.palTitle}>🎨 Colour</Text>
        {PALETTE_ROWS.map((row, ri) => (
          <View key={ri} style={cv.palRow}>
            {row.map(col => (
              <TouchableOpacity
                key={col}
                onPress={() => pickColor(col)}
                style={[cv.swatch, {
                  backgroundColor: col,
                  borderWidth: selCol === col ? 3 : 1,
                  borderColor: selCol === col ? '#333' : '#bbb',
                }]}
              >
                {selCol === col && <View style={cv.swatchTick} />}
              </TouchableOpacity>
            ))}
          </View>
        ))}
      </View>

      {/* ── Toolbar ── */}
      <View style={cv.toolbar}>
        <TouchableOpacity style={cv.toolBtn} onPress={undo}>
          <Text style={cv.toolTxt}>↩ Undo</Text>
        </TouchableOpacity>
        <TouchableOpacity style={cv.toolBtn} onPress={redo}>
          <Text style={cv.toolTxt}>↪ Redo</Text>
        </TouchableOpacity>
        <TouchableOpacity style={cv.toolBtn} onPress={reset}>
          <Text style={cv.toolTxt}>🔄 Reset</Text>
        </TouchableOpacity>
        {progress > 5 && (
          <TouchableOpacity onPress={handlePrint} style={cv.printBtn}>
            <LinearGradient colors={['#7E57C2','#E91E8C']} style={cv.printBtnIn}>
              <Text style={cv.printTxt}>🖨️ Print</Text>
            </LinearGradient>
          </TouchableOpacity>
        )}
      </View>

      {progress >= 60 && (
        <LinearGradient colors={['#EDE7F6','#FCE4EC']} style={cv.doneCard}>
          <Text style={cv.doneTxt}>✨ ලස්සනයි! ශ්‍රේෂ්ඨ ශ්‍රේෂ්ඨ! 💜</Text>
        </LinearGradient>
      )}
    </View>
  );
};

// ================================================================
//  GALLERY CARD — shows SVG preview inline on web
// ================================================================
const ArtCard = ({ item, onPress }) => {
  // Scale down SVG preview to fit card thumbnail
  const previewSvg = item.svg
    .replace(/viewBox="([^"]+)"/, 'viewBox="$1"')
    .replace(/width="\d+"/, '')
    .replace(/height="\d+"/, '');

  return (
    <TouchableOpacity style={[gc.card, { backgroundColor: item.bg }]} onPress={onPress}>
      {Platform.OS === 'web' ? (
        <div
          style={{
            width: 118, height: 118, overflow: 'hidden',
            borderRadius: 12, marginBottom: 8,
            background: 'white',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            boxShadow: '0 2px 8px rgba(126,87,194,.12)',
          }}
          dangerouslySetInnerHTML={{
            __html: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 400" width="118" height="118">${
              item.svg.replace(/<svg[^>]*>/, '').replace('</svg>','')
            }</svg>`,
          }}
        />
      ) : (
        <View style={gc.emojiBox}>
          <Text style={gc.emoji}>{item.icon}</Text>
        </View>
      )}
      <Text style={gc.name}>{item.name}</Text>
      <Text style={gc.sub}>{item.nameEn}</Text>
      <View style={gc.startBtn}>
        <Text style={gc.startTxt}>Colour →</Text>
      </View>
    </TouchableOpacity>
  );
};

// ================================================================
//  MAIN SCREEN
// ================================================================
const ArtScreen = ({ navigation }) => {
  const [tab,      setTab]      = useState('mandala');
  const [selected, setSelected] = useState(null);

  const items = tab === 'mandala' ? MANDALAS : COLOUR_PAGES;

  // ── Colouring view ──
  if (selected) {
    return (
      <View style={s.root}>
        <LinearGradient colors={['#F8F4FF','#FFF0F8']} style={s.flex}>
          <ScrollView contentContainerStyle={s.scroll} bounces={false}>
            <TouchableOpacity onPress={() => setSelected(null)} style={s.backBtn}>
              <Text style={s.backTxt}>← ආපසු</Text>
            </TouchableOpacity>
            <Text style={s.pageTitle}>{selected.name}</Text>
            <Text style={s.pageSub}>{selected.nameEn}</Text>
            <ColourCanvas design={selected} />
            <View style={{ height: 60 }} />
          </ScrollView>
        </LinearGradient>
      </View>
    );
  }

  // ── Gallery view ──
  return (
    <View style={s.root}>
      <LinearGradient colors={['#F8F4FF','#FFF0F8']} style={s.flex}>
        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={s.scroll}>

          <TouchableOpacity onPress={() => navigation.goBack()} style={s.backBtn}>
            <Text style={s.backTxt}>← ආපසු</Text>
          </TouchableOpacity>

          <Text style={s.pageTitle}>🎨 ශ්‍රේෂ්ඨ කලා</Text>
          <Text style={s.pageSub}>ඔබේ ශ්‍රේෂ්ඨ කෘතිය නිර්මාණය කරන්න</Text>

          {/* How-to tip */}
          <View style={s.howTo}>
            <Text style={s.howToTxt}>
              💡 Select a colour → click any region in the drawing → it fills instantly!
              {'\n'}Supports Undo, Redo & Print — just like coloringonline.com.
            </Text>
          </View>

          {/* Tab switcher */}
          <View style={s.tabRow}>
            {['mandala','colouring'].map(t => (
              <TouchableOpacity
                key={t}
                style={[s.tab, tab === t && s.tabOn]}
                onPress={() => setTab(t)}
              >
                <Text style={[s.tabTxt, tab === t && s.tabTxtOn]}>
                  {t === 'mandala' ? '🔮 මණ්ඩල (10)' : '🎨 ශ්‍රේෂ්ඨ (10)'}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* Grid */}
          <View style={s.grid}>
            {items.map(item => (
              <ArtCard key={item.id} item={item} onPress={() => setSelected(item)} />
            ))}
          </View>

          <View style={{ height: 110 }} />
        </ScrollView>
      </LinearGradient>
    </View>
  );
};

// ================================================================
//  STYLES
// ================================================================
const s = StyleSheet.create({
  root:      { flex:1 },
  flex:      { flex:1 },
  scroll:    { paddingHorizontal:16, paddingTop:52 },
  backBtn:   { marginBottom:12, alignSelf:'flex-start' },
  backTxt:   { color:'#7E57C2', fontWeight:'700', fontSize:16 },
  pageTitle: { fontSize:22, fontWeight:'900', color:'#3D2A5E', marginBottom:4 },
  pageSub:   { fontSize:13, color:'#7B6A99', marginBottom:12 },
  howTo:     { backgroundColor:'#EDE7F6', borderRadius:14, padding:12, marginBottom:14 },
  howToTxt:  { fontSize:12, color:'#5C3D9A', lineHeight:19 },
  tabRow:    { flexDirection:'row', gap:10, marginBottom:16 },
  tab:       { flex:1, paddingVertical:12, borderRadius:999, backgroundColor:'white', alignItems:'center',
               shadowColor:'#9C7CC0', shadowOffset:{width:0,height:3}, shadowOpacity:0.1, elevation:3 },
  tabOn:     { backgroundColor:'#7E57C2' },
  tabTxt:    { fontSize:13, fontWeight:'700', color:'#7B6A99' },
  tabTxtOn:  { color:'white' },
  grid:      { flexDirection:'row', flexWrap:'wrap', gap:12 },
});

const gc = StyleSheet.create({
  card:     { width:(SCREEN_W-44)/2, borderRadius:20, padding:12, alignItems:'center',
              shadowColor:'#7E57C2', shadowOffset:{width:0,height:4}, shadowOpacity:0.12, elevation:3 },
  emojiBox: { width:118, height:118, backgroundColor:'white', borderRadius:12,
              justifyContent:'center', alignItems:'center', marginBottom:8 },
  emoji:    { fontSize:52 },
  name:     { fontSize:12, fontWeight:'800', color:'#3D2A5E', textAlign:'center', marginBottom:2 },
  sub:      { fontSize:10, color:'#B0A4CC', textAlign:'center', marginBottom:10 },
  startBtn: { backgroundColor:'#7E57C2', borderRadius:999, paddingVertical:7, paddingHorizontal:18 },
  startTxt: { fontSize:12, fontWeight:'800', color:'white' },
});

const cv = StyleSheet.create({
  container:  { width:'100%', alignItems:'center' },
  progRow:    { flexDirection:'row', alignItems:'center', gap:8, marginBottom:6, width:'100%' },
  progBg:     { flex:1, height:7, backgroundColor:'#EDE7F6', borderRadius:4, overflow:'hidden' },
  progFill:   { height:7, backgroundColor:'#7E57C2', borderRadius:4 },
  progPct:    { fontSize:12, color:'#7E57C2', fontWeight:'700', width:38, textAlign:'right' },
  tip:        { fontSize:11, color:'#9E88CC', fontStyle:'italic', textAlign:'center',
               marginBottom:8, width:'100%', lineHeight:16 },
  canvasWrap: { borderRadius:12, overflow:'hidden', backgroundColor:'white', marginBottom:14,
               alignSelf:'center',
               shadowColor:'#7E57C2', shadowOffset:{width:0,height:6}, shadowOpacity:0.16, elevation:6 },
  nativeMsg:  { flex:1, justifyContent:'center', alignItems:'center', padding:20 },
  nativeTxt:  { color:'#7B6A99', fontSize:13, textAlign:'center', lineHeight:22 },
  // Palette
  palSection: { width:'100%', marginBottom:10 },
  palTitle:   { fontSize:13, fontWeight:'700', color:'#7B6A99', marginBottom:6 },
  palRow:     { flexDirection:'row', gap:3, marginBottom:3 },
  swatch:     { flex:1, aspectRatio:1, borderRadius:4, minWidth:32, minHeight:32,
               justifyContent:'center', alignItems:'center' },
  swatchTick: { width:8, height:8, borderRadius:4, backgroundColor:'rgba(0,0,0,0.35)' },
  // Toolbar
  toolbar:    { flexDirection:'row', gap:8, width:'100%', marginBottom:10 },
  toolBtn:    { flex:1, backgroundColor:'#F0ECF8', borderRadius:999,
               paddingVertical:10, alignItems:'center' },
  toolTxt:    { fontSize:12, color:'#7E57C2', fontWeight:'700' },
  printBtn:   { flex:1, borderRadius:999, overflow:'hidden' },
  printBtnIn: { paddingVertical:10, alignItems:'center' },
  printTxt:   { color:'white', fontWeight:'800', fontSize:13 },
  // Done card
  doneCard:   { borderRadius:16, padding:14, alignItems:'center', width:'100%' },
  doneTxt:    { fontSize:15, fontWeight:'800', color:'#3D2A5E' },
});

export default ArtScreen;
