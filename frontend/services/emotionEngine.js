// ================================================================
// EMOTION ENGINE — emotionEngine.js
// ================================================================
// EXACT LOGIC:
//   diary text → detectEmotion + detectReason → riskLevel
//   reason + riskLevel → getRecommendationRule()
//   → specific music, video, activities, game
//
// EXAMPLES:
//   Reason=Anxiety,  Mood=Stressed, Risk=Medium → breathing_478, guided_meditation + bubble_pop
//   Reason=Bonding,  Mood=Sad,      Risk=Medium → baby_bonding + baby_interaction
//   Reason=Sleep,    Mood=Stressed, Risk=Medium → night_breathing, rest_meditation + colouring
//   Reason=LackSupp, Mood=Sad,      Risk=Low    → gratitude_writing + affirmation_game
// ================================================================

import { getRecommendationRule } from './activitiesLibrary';
import { MUSIC_LIBRARY, VIDEO_LIBRARY } from './mediaLibrary';

export const RISK = { LOW: 'low', MEDIUM: 'medium' };

// ── KEYWORD MAPS ─────────────────────────────────────────────
const REASON_KW = {
  loneliness:          ['alone','lonely','isolated','nobody','no one','miss','empty','no friends','left out'],
  fatigue:             ['tired','exhausted','drained','no energy','worn out','sleepy','burnt out','sluggish'],
  anxiety:             ['anxious','worried','panic','scared','nervous','overthinking','heart racing','restless'],
  bonding_issues:      ['bond','bonding','feel nothing','not attached','distant from baby','no connection','indifferent'],
  lack_of_support:     ['husband','partner','no help','unsupported','nobody helps','no family','doing it alone'],
  sleep_problems:      ['sleep','insomnia','awake all night','sleep deprived','cant sleep','no sleep','exhausted'],
  loss_of_confidence:  ['confidence','self-doubt','failure','bad mother','useless','not capable','worthless'],
  overwhelmed:         ['overwhelmed','too much','drowning','breaking down','cant cope','too hard','falling apart'],
  physical_discomfort: ['pain','hurt','sore','c-section','recovery','stitches','body aches','discomfort'],
  negative_thoughts:   ['hopeless','hate myself','dark','disappear','dark thoughts','no point','worthless'],
};

const EMOTION_KW = {
  happy:    ['happy','joy','smile','grateful','wonderful','positive','hopeful','great','good day'],
  sad:      ['sad','cry','unhappy','depressed','hopeless','hurt','empty','down','devastated'],
  stressed: ['stress','overwhelmed','tense','frustrated','on edge','pressure','anxious','irritated'],
};

// These reasons + sad mood = medium risk automatically
const HIGH_RISK_REASONS = new Set([
  'negative_thoughts', 'bonding_issues', 'loss_of_confidence', 'lack_of_support',
]);

// Crisis keywords → always medium risk regardless of reason
const CRISIS_KW = [
  'hopeless', 'hate myself', 'disappear', 'want to die', 'dark thoughts',
  'no point in living', 'end it all', 'cant go on',
];

// ── SUPPORT MESSAGES (no reason label shown to user) ─────────
const SUPPORT_MESSAGES = {
  loneliness:          ['ශ්‍රේෂ්ඨ. ශ්‍රේෂ්ඨ ශ්‍රේෂ්ඨ ශ්‍රේෂ්ඨ 💜', 'ශ්‍රේෂ්ඨ ශ්‍රේෂ්ඨ. ශ්‍රේෂ්ඨ ශ්‍රේෂ්ඨ 🌸'],
  fatigue:             ['ශ්‍රේෂ්ඨ ශ්‍රේෂ්ඨ ශ්‍රේෂ්ඨ 🌙', 'ශ්‍රේෂ්ඨ ශ්‍රේෂ්ඨ. ශ්‍රේෂ්ඨ ශ්‍රේෂ්ඨ 🌸'],
  anxiety:             ['ශ්‍රේෂ්ඨ ශ්‍රේෂ්ඨ 💜', 'ශ්‍රේෂ්ඨ ශ්‍රේෂ්ඨ. ශ්‍රේෂ්ඨ. 🌿'],
  bonding_issues:      ['ශ්‍රේෂ්ඨ — ශ්‍රේෂ්ඨ ශ්‍රේෂ්ඨ 🌸', 'ශ්‍රේෂ්ඨ ශ්‍රේෂ්ඨ. ශ්‍රේෂ්ඨ ශ්‍රේෂ්ඨ 💜'],
  lack_of_support:     ['ශ්‍රේෂ්ඨ ශ්‍රේෂ්ඨ ශ්‍රේෂ්ඨ 💜', 'ශ්‍රේෂ්ඨ ශ්‍රේෂ්ඨ. ශ්‍රේෂ්ඨ 🌸'],
  sleep_problems:      ['ශ්‍රේෂ්ඨ ශ්‍රේෂ්ඨ 🌙', 'ශ්‍රේෂ්ඨ ශ්‍රේෂ්ඨ 💜'],
  loss_of_confidence:  ['ශ්‍රේෂ්ඨ ශ්‍රේෂ්ඨ 🌸', 'ශ්‍රේෂ්ඨ ශ්‍රේෂ්ඨ 💜'],
  overwhelmed:         ['ශ්‍රේෂ්ඨ ශ්‍රේෂ්ඨ 💜', 'ශ්‍රේෂ්ඨ ශ්‍රේෂ්ඨ 🌸'],
  physical_discomfort: ['ශ්‍රේෂ්ඨ ශ්‍රේෂ්ඨ 🌸', 'ශ්‍රේෂ්ඨ ශ්‍රේෂ්ඨ 💜'],
  negative_thoughts:   ['ශ්‍රේෂ්ඨ ශ්‍රේෂ්ඨ 💜', 'ශ්‍රේෂ්ඨ ශ්‍රේෂ්ඨ 🌸'],
};

// ── ANALYZE DIARY ─────────────────────────────────────────────
export const analyzeDiary = (text) => {
  const t = text.toLowerCase();

  // Step 1: Score emotions
  let eScores = {};
  Object.entries(EMOTION_KW).forEach(([e, kws]) => {
    eScores[e] = kws.filter(k => t.includes(k)).length;
  });
  const total = Object.values(eScores).reduce((a, b) => a + b, 0);
  const detectedEmotion = total > 0
    ? Object.entries(eScores).sort((a, b) => b[1] - a[1])[0][0]
    : 'stressed';

  // Step 2: Score reasons
  let rScores = {};
  Object.entries(REASON_KW).forEach(([r, kws]) => {
    rScores[r] = kws.filter(k => t.includes(k)).length;
  });
  const sortedReasons = Object.entries(rScores).sort((a, b) => b[1] - a[1]);
  const primaryReason    = sortedReasons[0][0];
  const secondaryReason  = sortedReasons[1]?.[1] > 0 ? sortedReasons[1][0] : null;

  // Step 3: Determine risk level
  //   medium if: crisis keywords OR high-risk reason + sad mood OR crisis reason
  const hasCrisis    = CRISIS_KW.some(k => t.includes(k));
  const isHighRisk   = HIGH_RISK_REASONS.has(primaryReason);
  const isSad        = detectedEmotion === 'sad';
  const riskLevel    = (hasCrisis || (isHighRisk && isSad) || hasCrisis) ? RISK.MEDIUM : RISK.LOW;

  return {
    detectedEmotion,
    primaryReason,
    secondaryReason,
    riskLevel,
    scores: { eScores, rScores },
  };
};

// ── GET RECOMMENDATIONS ───────────────────────────────────────
// Uses exact IF-THEN rules: reason + riskLevel → specific content
export const getRecommendations = (analysisResult, preferredActivities = [], preferredGames = []) => {
  const { detectedEmotion, primaryReason, riskLevel } = analysisResult;

  // Get the rule for this exact reason + risk combination
  const rule = getRecommendationRule(primaryReason, riskLevel, preferredActivities, preferredGames);

  // Music: 10 tracks specific to this reason
  const music  = MUSIC_LIBRARY[rule.musicKey]  || MUSIC_LIBRARY.loneliness;

  // Videos: 10 videos specific to this reason
  const videos = VIDEO_LIBRARY[rule.videoKey]  || VIDEO_LIBRARY.loneliness;

  // Support messages (no reason label shown to user)
  const messages = SUPPORT_MESSAGES[primaryReason] || SUPPORT_MESSAGES.overwhelmed;

  // Urgency message for medium risk
  const urgencyMessage = riskLevel === RISK.MEDIUM
    ? 'ශ්‍රේෂ්ඨ ශ්‍රේෂ්ඨ ශ්‍රේෂ්ඨ. ශ්‍රේෂ්ඨ ශ්‍රේෂ්ඨ ශ්‍රේෂ්ඨ ශ්‍රේෂ්ඨ 💜'
    : null;

  return {
    detectedEmotion,
    riskLevel,
    music,
    videos,
    activities:    rule.activities,   // filtered activities for this reason+risk
    games:         rule.games,         // single recommended game as array
    game:          rule.game,          // single recommended game object
    messages,
    urgencyMessage,
    supportMsg:    rule.supportMsg,
    _internal:     { primaryReason }, // never shown to user as label
  };
};
