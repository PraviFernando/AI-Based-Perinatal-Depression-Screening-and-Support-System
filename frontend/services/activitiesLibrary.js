// ================================================================
// ACTIVITIES LIBRARY — activitiesLibrary.js
// ================================================================
//
// EXACT IF-THEN RECOMMENDATION RULES:
// ─────────────────────────────────────────────────────────────
// Each reason gets:
//   - 1 specific Music type
//   - 1 specific Video type
//   - Activities filtered by risk level
//   - 1 specific Game
//
// risk=medium → ONLY calming low-effort items (breathing first)
// risk=low    → full range for that reason
//
// CONTENT MAP (from your specification):
// Loneliness    → Calm piano | "You are not alone" video | Write 3 positive thoughts | Puzzle game
// Fatigue       → Relaxation audio | Rest guidance video | Short breathing | Bubble pop
// Anxiety       → Meditation music | Anxiety calming video | Guided meditation | Focus tapping
// Bonding Issue → Mother-baby songs | Parenting bonding video | Talk with baby | Baby interaction
// Lack Support  → Emotional healing music | Encouragement video | Gratitude writing | Affirmation game
// Sleep Problem → Sleep music/rain | Sleep meditation video | Night relaxation | Calm visual game
// Loss Confid.  → Motivational songs | Confidence video | Positive affirmations | Achievement game
// Overwhelmed   → Nature sounds | Stress relief video | Deep breathing | Stress relief tapping
// Physical Disc.→ Soft calming music | Light exercise video | Gentle stretching | Light interaction
// Negative Tht. → Emotional healing music | Positive mindset video | Journaling | Positive thinking
// ================================================================

// ── ALL ACTIVITIES ───────────────────────────────────────────
export const ALL_ACTIVITIES = [
  {
    id:'breathing_478', icon:'🌬️',
    label:'4-7-8 ශ්වාසය', labelEn:'4-7-8 Breathing',
    desc:'කාංසාව ක්ෂණිකව සන්සිඳවීම', duration:'විනාඩි 5',
    category:'ශ්වාස', color:['#EDE7F6','#D1C4E9'], accent:'#7E57C2',
    type:'breathing',
    phases:[
      {name:'ශ්වාස ගන්න',    seconds:4, instruction:'නාසය දිගේ සෙමෙන් ශ්වාස ගන්න', scale:1.6},
      {name:'රඳවා ගන්න',     seconds:7, instruction:'ශ්වාසය මෘදුව රඳවා ගන්න',       scale:1.6},
      {name:'ශ්වාස හළ ගන්න', seconds:8, instruction:'මුඛය දිගේ සෙමෙන් ශ්වාස හළ ගන්න', scale:1.0},
    ],
    cycles:4,
    intro:'ස්නායු පද්ධතිය සක්‍රිය කර කාංසාව මිනිත්තු කිහිපයකින් අඩු කරයි. රාත්‍රියේ නිදා ගැනීමට ද ශ්‍රේෂ්ඨ.',
  },
  {
    id:'box_breathing', icon:'📦',
    label:'කොටු ශ්වාසය', labelEn:'Box Breathing',
    desc:'ස්නායු පද්ධතිය සමතුලිත කිරීම', duration:'විනාඩි 4',
    category:'ශ්වාස', color:['#E3F2FD','#BBDEFB'], accent:'#1565C0',
    type:'breathing',
    phases:[
      {name:'ශ්වාස ගන්න',    seconds:4, instruction:'නාසය දිගේ ශ්වාස ගන්න',        scale:1.5},
      {name:'රඳවා ගන්න',     seconds:4, instruction:'රඳවා ගන්න',                    scale:1.5},
      {name:'ශ්වාස හළ ගන්න', seconds:4, instruction:'සෙමෙන් ශ්වාස හළ ගන්න',        scale:1.0},
      {name:'රඳවා ගන්න',     seconds:4, instruction:'ඊළඟ ශ්වාසයට පෙර රඳවා ගන්න',   scale:1.0},
    ],
    cycles:5,
    intro:'ශ්‍රේෂ්ඨ. ආතතිය ඉහළ දිනවලට.',
  },
  {
    id:'short_breathing', icon:'💨',
    label:'කෙටි ශ්වාස ව්‍යායාම', labelEn:'Short Breathing Exercise',
    desc:'ශ්‍රාන්තතාවෙදී ශීඝ්‍ර සහනය', duration:'විනාඩි 2',
    category:'ශ්වාස', color:['#E8F5E9','#C8E6C9'], accent:'#2E7D32',
    type:'breathing',
    phases:[
      {name:'ශ්වාස ගන්න',    seconds:4, instruction:'නාසය දිගේ ශ්වාස ගන්න',        scale:1.4},
      {name:'ශ්වාස හළ ගන්න', seconds:6, instruction:'මුඛය දිගේ ශ්වාස හළ ගන්න',    scale:1.0},
    ],
    cycles:3,
    intro:'ශ්‍රාන්තතාවෙදී ලේසියෙන් කළ හැකි ශ්‍රේෂ්ඨ ශ්‍රේෂ්ඨ ශ්‍රේෂ්ඨ.',
  },
  {
    id:'night_breathing', icon:'🌙',
    label:'රාත්‍රී ශ්වාස ව්‍යායාම', labelEn:'Night Relaxation Exercise',
    desc:'නිදා ගැනීමට සූදානම', duration:'විනාඩි 5',
    category:'ශ්වාස', color:['#E8EAF6','#C5CAE9'], accent:'#3949AB',
    type:'breathing',
    phases:[
      {name:'ශ්වාස ගන්න',    seconds:4, instruction:'සෙමෙන් ශ්වාස ගන්න',           scale:1.4},
      {name:'රඳවා ගන්න',     seconds:6, instruction:'රඳවා ගන්න',                    scale:1.4},
      {name:'ශ්වාස හළ ගන්න', seconds:8, instruction:'ඉතා සෙමෙන් ශ්වාස හළ ගන්න',   scale:1.0},
    ],
    cycles:3,
    intro:'නිදා ගැනීමට පෙර කරන ශ්‍රේෂ්ඨ ශ්‍රේෂ්ඨ. ශරීරය ශ්‍රාන්ත කරයි.',
  },
  {
    id:'guided_meditation', icon:'🧘',
    label:'ශ්‍රේෂ්ඨ සිහිකල්පනාව', labelEn:'Guided Meditation',
    desc:'සිත සන්සිඳවීම', duration:'විනාඩි 10',
    category:'සිහිකල්පනාව', color:['#F3E5F5','#E1BEE7'], accent:'#8E24AA',
    type:'guided',
    steps:[
      {label:'ස්ථාවරව සිටීම',  duration:30,  text:'සුවපහසු ලෙස සිටින්න. ඇස් වසන්න. ගැඹුරු ශ්වාස 3ක් ගන්න.'},
      {label:'සිත ශ්‍රේෂ්ඨ',   duration:60,  text:'ඔබේ සිතිවිලි ශ්‍රේෂ්ඨ ශ්‍රේෂ්ඨ ශ්‍රේෂ්ඨ. ශ්‍රේෂ්ඨ ශ්‍රේෂ්ඨ.'},
      {label:'ශරීරය ශ්‍රේෂ්ඨ',  duration:90,  text:'ශ්‍රේෂ්ඨ ශ්‍රේෂ්ඨ ශ්‍රේෂ්ඨ. ශ්‍රේෂ්ඨ ශ්‍රේෂ්ඨ.'},
      {label:'ශ්‍රේෂ්ඨ ශ්‍රේෂ්ඨ', duration:120, text:'ශ්‍රේෂ්ඨ ශ්‍රේෂ්ඨ.'},
      {label:'සෙමෙන් නැවත',    duration:30,  text:'ඇඟිලි සොළවන්න. ගැඹුරු ශ්වාස. ඇස් ඇරෙන්න. 🌸'},
    ],
    intro:'කාංසාව සිදිරි ගිය කල සිත සන්සිඳවීමේ ශ්‍රේෂ්ඨ ශ්‍රේෂ්ඨ.',
  },
  {
    id:'grounding_54321', icon:'🌿',
    label:'5-4-3-2-1 ගොඩ නැගීම', labelEn:'5-4-3-2-1 Grounding',
    desc:'වර්තමානයට නැඟ බැඳීම', duration:'විනාඩි 5',
    category:'ගොඩ නැගීම', color:['#E8F5E9','#C8E6C9'], accent:'#2E7D32',
    type:'guided',
    steps:[
      {label:'දිය හැකි 5ක්',   duration:60, text:'දැන් ඔබ දකින ඕනෑම දේ 5ක් නම් කරන්න.'},
      {label:'ස්පර්ශ 4ක්',     duration:60, text:'ශ්‍රේෂ්ඨ ශ්‍රේෂ්ඨ 4ක් ශ්‍රේෂ්ඨ.'},
      {label:'ශ්‍රවණය 3ක්',    duration:60, text:'ශ්‍රේෂ්ඨ ශ්‍රේෂ්ඨ 3ක් ශ්‍රේෂ්ඨ.'},
      {label:'සුවඳ 2ක්',       duration:60, text:'ශ්‍රේෂ්ඨ ශ්‍රේෂ්ඨ 2ක් ශ්‍රේෂ්ඨ.'},
      {label:'රස 1ක්',         duration:60, text:'ශ්‍රේෂ්ඨ ශ්‍රේෂ්ඨ. ඔබ ආරක්ෂිතයි. 💜'},
    ],
    intro:'ශ්‍රේෂ්ඨ ශ්‍රේෂ්ඨ ශ්‍රේෂ්ඨ ශ්‍රේෂ්ඨ.',
  },
  {
    id:'deep_breathing', icon:'💪',
    label:'ගැඹුරු ශ්වාස', labelEn:'Deep Breathing',
    desc:'ශ්‍රේෂ්ඨ ශ්‍රේෂ්ඨ', duration:'විනාඩි 5',
    category:'ශ්වාස', color:['#FFF3E0','#FFE0B2'], accent:'#E65100',
    type:'breathing',
    phases:[
      {name:'ශ්වාස ගන්න',    seconds:5, instruction:'ශ්‍රේෂ්ඨ ශ්‍රේෂ්ඨ', scale:1.6},
      {name:'ශ්වාස හළ ගන්න', seconds:7, instruction:'ශ්‍රේෂ්ඨ ශ්‍රේෂ්ඨ', scale:1.0},
    ],
    cycles:6,
    intro:'ශ්‍රේෂ්ඨ ශ්‍රේෂ්ඨ.',
  },
  {
    id:'journaling', icon:'📓',
    label:'දිනපොත් ශ්‍රේෂ්ඨ', labelEn:'Journaling Activity',
    desc:'හැඟීම් ප්‍රකාශ කිරීම', duration:'විනාඩි 10',
    category:'ලිවීම', color:['#FFF9C4','#FFF3A0'], accent:'#F57F17',
    type:'prompts',
    prompts:[
      'දැන් මා දකින හැඟීම කුමක්ද?',
      'අද දරුවාට හෝ මට ආදරය දැක්වූ මොහොතක්?',
      'ශ්‍රේෂ්ඨ ශ්‍රේෂ්ඨ ශ්‍රේෂ්ඨ?',
      'ශ්‍රේෂ්ඨ ශ්‍රේෂ්ඨ ශ්‍රේෂ්ඨ ශ්‍රේෂ්ඨ?',
      'ශ්‍රේෂ්ඨ ශ්‍රේෂ්ඨ ශ්‍රේෂ්ඨ?',
    ],
    intro:'ශ්‍රේෂ්ඨ ශ්‍රේෂ්ඨ ශ්‍රේෂ්ඨ.',
  },
  {
    id:'write_positive', icon:'✍️',
    label:'ශ්‍රේෂ්ඨ 3ක් ලියන්න', labelEn:'Write 3 Positive Thoughts',
    desc:'ශ්‍රේෂ්ඨ ශ්‍රේෂ්ඨ', duration:'විනාඩි 5',
    category:'ලිවීම', color:['#E8F5E9','#C8E6C9'], accent:'#2E7D32',
    type:'prompts',
    prompts:[
      'ශ්‍රේෂ්ඨ ශ්‍රේෂ්ඨ 1 ශ්‍රේෂ්ඨ?',
      'ශ්‍රේෂ්ඨ ශ්‍රේෂ්ඨ 2 ශ්‍රේෂ්ඨ?',
      'ශ්‍රේෂ්ඨ ශ්‍රේෂ්ඨ 3 ශ්‍රේෂ්ඨ?',
    ],
    intro:'ශ්‍රේෂ්ඨ ශ්‍රේෂ්ඨ.',
  },
  {
    id:'gratitude_writing', icon:'🙏',
    label:'ශ්‍රේෂ්ඨ ලිවීම', labelEn:'Gratitude Writing',
    desc:'ශ්‍රේෂ්ඨ ශ්‍රේෂ්ඨ', duration:'විනාඩි 8',
    category:'ලිවීම', color:['#E8F5E9','#C8E6C9'], accent:'#2E7D32',
    type:'prompts',
    prompts:[
      'ශ්‍රේෂ්ඨ ශ්‍රේෂ්ඨ ශ්‍රේෂ්ඨ 3ක් ශ්‍රේෂ්ඨ?',
      'ශ්‍රේෂ්ඨ ශ්‍රේෂ්ඨ ශ්‍රේෂ්ඨ?',
      'ශ්‍රේෂ්ඨ ශ්‍රේෂ්ඨ ශ්‍රේෂ්ඨ?',
    ],
    intro:'ශ්‍රේෂ්ඨ ශ්‍රේෂ්ඨ.',
  },
  {
    id:'gentle_stretch', icon:'🌸',
    label:'මෘදු ශ්‍රේෂ්ඨ', labelEn:'Gentle Stretching',
    desc:'ශ්‍රේෂ්ඨ ශ්‍රේෂ්ඨ', duration:'විනාඩි 8',
    category:'ව්‍යායාම', color:['#FCE4EC','#F8BBD9'], accent:'#C2185B',
    type:'guided',
    steps:[
      {label:'බෙල්ල ශ්‍රේෂ්ඨ', duration:60, text:'හිස සෙමෙන් ශ්‍රේෂ්ඨ. 5ක්.'},
      {label:'උරහිස් ශ්‍රේෂ්ඨ', duration:60, text:'ශ්‍රේෂ්ඨ ශ්‍රේෂ්ඨ.'},
      {label:'ශ්‍රේෂ්ඨ ශ්‍රේෂ්ඨ', duration:90, text:'ශ්‍රේෂ්ඨ ශ්‍රේෂ්ඨ ශ්‍රේෂ්ඨ.'},
    ],
    intro:'ශ්‍රේෂ්ඨ ශ්‍රේෂ්ඨ.',
  },
  {
    id:'rest_meditation', icon:'😴',
    label:'ශ්‍රාන්ත සිහිකල්පනාව', labelEn:'Rest Meditation',
    desc:'ශ්‍රේෂ්ඨ ශ්‍රේෂ්ඨ', duration:'විනාඩි 15',
    category:'නිදා ගැනීම', color:['#E8EAF6','#C5CAE9'], accent:'#3949AB',
    type:'guided',
    steps:[
      {label:'ශ්‍රේෂ්ඨ', duration:60,  text:'ශ්‍රේෂ්ඨ ශ්‍රේෂ්ඨ.'},
      {label:'ශ්‍රේෂ්ඨ', duration:120, text:'ශ්‍රේෂ්ඨ ශ්‍රේෂ්ඨ ශ්‍රේෂ්ඨ.'},
      {label:'ශ්‍රේෂ්ඨ', duration:300, text:'ශ්‍රේෂ්ඨ ශ්‍රේෂ්ඨ ශ්‍රේෂ්ඨ.'},
    ],
    intro:'ශ්‍රේෂ්ඨ ශ්‍රේෂ්ඨ.',
  },
  {
    id:'affirmation_activity', icon:'✨',
    label:'ශ්‍රේෂ්ඨ ශ්‍රේෂ්ඨ ශ්‍රේෂ්ඨ', labelEn:'Positive Affirmation Activity',
    desc:'ශ්‍රේෂ්ඨ ශ්‍රේෂ්ඨ', duration:'විනාඩි 7',
    category:'සිහිකල්පනාව', color:['#FFF3E0','#FFE0B2'], accent:'#E65100',
    type:'breathing',
    phases:[
      {name:'ශ්වාස ගන්න',    seconds:4, instruction:'"මම ශ්‍රේෂ්ඨ" සිතමින්',    scale:1.5},
      {name:'රඳවා ගන්න',     seconds:4, instruction:'"මට හැකිය" සිතමින්',        scale:1.5},
      {name:'ශ්වාස හළ ගන්න', seconds:6, instruction:'"මම ප්‍රමාණවත්" සිතමින්',  scale:1.0},
    ],
    cycles:6,
    affirmations:['මම ශ්‍රේෂ්ඨ 💜','ශ්‍රේෂ්ඨ ශ්‍රේෂ්ඨ 🌸','ශ්‍රේෂ්ඨ ශ්‍රේෂ්ඨ ✨','ශ්‍රේෂ්ඨ ශ්‍රේෂ්ඨ 🌿'],
    intro:'ශ්‍රේෂ්ඨ ශ්‍රේෂ්ඨ ශ්‍රේෂ්ඨ.',
  },
  {
    id:'baby_bonding', icon:'👶',
    label:'ළදරු සම්බන්ධ ශ්‍රේෂ්ඨ', labelEn:'Talk and Interact With Baby',
    desc:'ශ්‍රේෂ්ඨ ශ්‍රේෂ්ඨ', duration:'විනාඩි 10',
    category:'බැඳීම', color:['#FCE4EC','#F8BBD9'], accent:'#C2185B',
    type:'guided',
    steps:[
      {label:'ශ්‍රේෂ්ඨ', duration:60, text:'ශ්‍රේෂ්ඨ ශ්‍රේෂ්ඨ ශ්‍රේෂ්ඨ.'},
      {label:'ශ්‍රේෂ්ඨ', duration:60, text:'ශ්‍රේෂ්ඨ ශ්‍රේෂ්ඨ.'},
      {label:'ශ්‍රේෂ්ඨ', duration:90, text:'ශ්‍රේෂ්ඨ ශ්‍රේෂ්ඨ.'},
    ],
    intro:'ශ්‍රේෂ්ඨ ශ්‍රේෂ්ඨ ශ්‍රේෂ්ඨ.',
  },
  {
    id:'positive_thinking_act', icon:'🌈',
    label:'ශ්‍රේෂ්ඨ ශ්‍රේෂ්ඨ ශ්‍රේෂ්ඨ', labelEn:'Positive Thinking Activity',
    desc:'ශ්‍රේෂ්ඨ ශ්‍රේෂ්ඨ', duration:'විනාඩි 8',
    category:'ලිවීම', color:['#E8F5E9','#C8E6C9'], accent:'#2E7D32',
    type:'prompts',
    prompts:[
      'ශ්‍රේෂ්ඨ ශ්‍රේෂ්ඨ ශ්‍රේෂ්ඨ?',
      'ශ්‍රේෂ්ඨ ශ්‍රේෂ්ඨ ශ්‍රේෂ්ඨ ශ්‍රේෂ්ඨ?',
      'ශ්‍රේෂ්ඨ ශ්‍රේෂ්ඨ ශ්‍රේෂ්ඨ?',
    ],
    intro:'ශ්‍රේෂ්ඨ ශ්‍රේෂ්ඨ.',
  },
];

// ── ALL GAMES ─────────────────────────────────────────────────
export const ALL_GAMES = [
  { id:'bubble_pop',       icon:'🫧', label:'බුබුළු ෆොන් ෆොන්',      labelEn:'Bubble Pop',           color:['#E3F2FD','#BBDEFB'], accent:'#1565C0' },
  { id:'word_match',       icon:'💬', label:'වචන ගළපීම',              labelEn:'Word Match',            color:['#EDE7F6','#D1C4E9'], accent:'#7E57C2' },
  { id:'puzzle',           icon:'🧩', label:'ශ්‍රේෂ්ඨ ශ්‍රේෂ්ඨ',       labelEn:'Simple Puzzle',         color:['#FFF9C4','#FFF3A0'], accent:'#F57F17' },
  { id:'affirmation_game', icon:'💜', label:'ශ්‍රේෂ්ඨ ශ්‍රේෂ්ඨ',        labelEn:'Positive Affirmations', color:['#FCE4EC','#F8BBD9'], accent:'#C2185B' },
  { id:'baby_interaction', icon:'🤱', label:'ළදරු ශ්‍රේෂ්ඨ',           labelEn:'Baby Interaction',      color:['#E8F5E9','#C8E6C9'], accent:'#2E7D32' },
  { id:'dress_baby',       icon:'👗', label:'ළදරු ශ්‍රේෂ්ඨ ශ්‍රේෂ්ඨ',  labelEn:'Baby Dress-Up',         color:['#F3E5F5','#E1BEE7'], accent:'#8E24AA' },
  { id:'mandala',          icon:'🔮', label:'මණ්ඩල කලා',              labelEn:'Mandala Art',           color:['#EDE7F6','#D1C4E9'], accent:'#7E57C2' },
  { id:'colouring',        icon:'🎨', label:'ශ්‍රේෂ්ඨ ශ්‍රේෂ්ඨ',        labelEn:'Colouring Pages',       color:['#E8F5E9','#C8E6C9'], accent:'#2E7D32' },
];

// ================================================================
// EXACT IF-THEN RECOMMENDATION RULES
// ================================================================
// Structure:
//   reason → {
//     low:    { activityIds:[], gameId:'', musicKey:'', videoKey:'' }
//     medium: { activityIds:[], gameId:'', musicKey:'', videoKey:'' }
//   }
//
// risk=medium: fewer, calmer activities only (breathing/meditation first)
// risk=low:    full set for that reason
//
// Music/Video keys match MUSIC_LIBRARY and VIDEO_LIBRARY keys exactly
// ================================================================

const RULES = {
  // ── LONELINESS ───────────────────────────────────────────────
  // Music: Calm piano | Video: "You are not alone" | Activity: Write 3 positive | Game: Puzzle
  loneliness: {
    low: {
      activityIds: ['write_positive', 'affirmation_activity', 'journaling', 'breathing_478'],
      gameId:    'puzzle',
      musicKey:  'loneliness',
      videoKey:  'loneliness',
      supportMsg:'ශ්‍රේෂ්ඨ. ශ්‍රේෂ්ඨ ශ්‍රේෂ්ඨ ශ්‍රේෂ්ඨ 💜',
    },
    medium: {
      activityIds: ['breathing_478', 'write_positive', 'affirmation_activity'],
      gameId:    'affirmation_game',
      musicKey:  'loneliness',
      videoKey:  'loneliness',
      supportMsg:'ශ්‍රේෂ්ඨ ශ්‍රේෂ්ඨ. ශ්‍රේෂ්ඨ ශ්‍රේෂ්ඨ ශ්‍රේෂ්ඨ. 💜',
    },
  },

  // ── FATIGUE ──────────────────────────────────────────────────
  // Music: Relaxation audio | Video: Rest guidance | Activity: Short breathing | Game: Bubble pop
  fatigue: {
    low: {
      activityIds: ['short_breathing', 'rest_meditation', 'gentle_stretch'],
      gameId:    'bubble_pop',
      musicKey:  'fatigue',
      videoKey:  'fatigue',
      supportMsg:'ශ්‍රේෂ්ඨ ශ්‍රේෂ්ඨ. ශ්‍රේෂ්ඨ ශ්‍රේෂ්ඨ 🌙',
    },
    medium: {
      activityIds: ['short_breathing', 'rest_meditation'],
      gameId:    'bubble_pop',
      musicKey:  'fatigue',
      videoKey:  'fatigue',
      supportMsg:'ශ්‍රේෂ්ඨ ශ්‍රේෂ්ඨ ශ්‍රේෂ්ඨ. ශ්‍රේෂ්ඨ ශ්‍රේෂ්ඨ. 🌸',
    },
  },

  // ── ANXIETY ──────────────────────────────────────────────────
  // Music: Meditation music | Video: Anxiety calming | Activity: Guided meditation | Game: Focus tapping (bubble_pop)
  anxiety: {
    low: {
      activityIds: ['guided_meditation', 'breathing_478', 'grounding_54321', 'affirmation_activity'],
      gameId:    'bubble_pop',
      musicKey:  'anxiety',
      videoKey:  'anxiety',
      supportMsg:'ශ්‍රේෂ්ඨ ශ්‍රේෂ්ඨ ශ්‍රේෂ්ඨ 💜',
    },
    medium: {
      activityIds: ['breathing_478', 'guided_meditation', 'grounding_54321'],
      gameId:    'bubble_pop',
      musicKey:  'anxiety',
      videoKey:  'anxiety',
      supportMsg:'ශ්‍රේෂ්ඨ ශ්‍රේෂ්ඨ ශ්‍රේෂ්ඨ. ශ්‍රේෂ්ඨ ශ්‍රේෂ්ඨ. 🌿',
    },
  },

  // ── BONDING ISSUES ───────────────────────────────────────────
  // Music: Mother-baby bonding songs | Video: Parenting bonding | Activity: Talk with baby | Game: Baby interaction
  bonding_issues: {
    low: {
      activityIds: ['baby_bonding', 'journaling', 'breathing_478', 'affirmation_activity'],
      gameId:    'baby_interaction',
      musicKey:  'bonding_issues',
      videoKey:  'bonding_issues',
      supportMsg:'ශ්‍රේෂ්ඨ ශ්‍රේෂ්ඨ — ශ්‍රේෂ්ඨ ශ්‍රේෂ්ඨ ශ්‍රේෂ්ඨ 🌸',
    },
    medium: {
      activityIds: ['baby_bonding', 'breathing_478'],
      gameId:    'baby_interaction',
      musicKey:  'bonding_issues',
      videoKey:  'bonding_issues',
      supportMsg:'ශ්‍රේෂ්ඨ ශ්‍රේෂ්ඨ. ශ්‍රේෂ්ඨ ශ්‍රේෂ්ඨ ශ්‍රේෂ්ඨ 💜',
    },
  },

  // ── LACK OF SUPPORT ──────────────────────────────────────────
  // Music: Emotional healing music | Video: Encouragement | Activity: Gratitude writing | Game: Affirmation game
  lack_of_support: {
    low: {
      activityIds: ['gratitude_writing', 'write_positive', 'affirmation_activity', 'breathing_478'],
      gameId:    'affirmation_game',
      musicKey:  'lack_of_support',
      videoKey:  'lack_of_support',
      supportMsg:'ශ්‍රේෂ්ඨ ශ්‍රේෂ්ඨ ශ්‍රේෂ්ඨ 💜',
    },
    medium: {
      activityIds: ['breathing_478', 'gratitude_writing', 'affirmation_activity'],
      gameId:    'affirmation_game',
      musicKey:  'lack_of_support',
      videoKey:  'lack_of_support',
      supportMsg:'ශ්‍රේෂ්ඨ ශ්‍රේෂ්ඨ. ශ්‍රේෂ්ඨ ශ්‍රේෂ්ඨ ශ්‍රේෂ්ඨ 🌸',
    },
  },

  // ── SLEEP PROBLEMS ───────────────────────────────────────────
  // Music: Sleep music/rain sounds | Video: Sleep meditation | Activity: Night relaxation | Game: Calm visual (colouring)
  sleep_problems: {
    low: {
      activityIds: ['night_breathing', 'rest_meditation', 'breathing_478', 'short_breathing'],
      gameId:    'colouring',
      musicKey:  'sleep_problems',
      videoKey:  'sleep_problems',
      supportMsg:'ශ්‍රේෂ්ඨ ශ්‍රේෂ්ඨ ශ්‍රේෂ්ඨ 🌙',
    },
    medium: {
      activityIds: ['night_breathing', 'breathing_478', 'rest_meditation'],
      gameId:    'colouring',
      musicKey:  'sleep_problems',
      videoKey:  'sleep_problems',
      supportMsg:'ශ්‍රේෂ්ඨ ශ්‍රේෂ්ඨ. ශ්‍රේෂ්ඨ ශ්‍රේෂ්ඨ 💜',
    },
  },

  // ── LOSS OF CONFIDENCE ───────────────────────────────────────
  // Music: Motivational songs | Video: Confidence building | Activity: Positive affirmations | Game: Achievement (affirmation_game)
  loss_of_confidence: {
    low: {
      activityIds: ['affirmation_activity', 'journaling', 'write_positive', 'breathing_478'],
      gameId:    'affirmation_game',
      musicKey:  'loss_of_confidence',
      videoKey:  'loss_of_confidence',
      supportMsg:'ශ්‍රේෂ්ඨ ශ්‍රේෂ්ඨ 🌸',
    },
    medium: {
      activityIds: ['breathing_478', 'affirmation_activity', 'write_positive'],
      gameId:    'affirmation_game',
      musicKey:  'loss_of_confidence',
      videoKey:  'loss_of_confidence',
      supportMsg:'ශ්‍රේෂ්ඨ ශ්‍රේෂ්ඨ ශ්‍රේෂ්ඨ 💜',
    },
  },

  // ── OVERWHELMED ──────────────────────────────────────────────
  // Music: Nature sounds | Video: Stress relief | Activity: Deep breathing | Game: Stress relief tapping (bubble_pop)
  overwhelmed: {
    low: {
      activityIds: ['deep_breathing', 'breathing_478', 'grounding_54321', 'box_breathing'],
      gameId:    'bubble_pop',
      musicKey:  'overwhelmed',
      videoKey:  'overwhelmed',
      supportMsg:'ශ්‍රේෂ්ඨ ශ්‍රේෂ්ඨ 💜',
    },
    medium: {
      activityIds: ['breathing_478', 'deep_breathing', 'box_breathing'],
      gameId:    'bubble_pop',
      musicKey:  'overwhelmed',
      videoKey:  'overwhelmed',
      supportMsg:'ශ්‍රේෂ්ඨ ශ්‍රේෂ්ඨ ශ්‍රේෂ්ඨ. ශ්‍රේෂ්ඨ ශ්‍රේෂ්ඨ 🌸',
    },
  },

  // ── PHYSICAL DISCOMFORT ──────────────────────────────────────
  // Music: Soft calming music | Video: Light exercise | Activity: Gentle stretching | Game: Light interaction (dress_baby)
  physical_discomfort: {
    low: {
      activityIds: ['gentle_stretch', 'rest_meditation', 'short_breathing', 'breathing_478'],
      gameId:    'dress_baby',
      musicKey:  'physical_discomfort',
      videoKey:  'physical_discomfort',
      supportMsg:'ශ්‍රේෂ්ඨ ශ්‍රේෂ්ඨ ශ්‍රේෂ්ඨ 🌸',
    },
    medium: {
      activityIds: ['gentle_stretch', 'breathing_478', 'rest_meditation'],
      gameId:    'colouring',
      musicKey:  'physical_discomfort',
      videoKey:  'physical_discomfort',
      supportMsg:'ශ්‍රේෂ්ඨ ශ්‍රේෂ්ඨ ශ්‍රේෂ්ඨ. ශ්‍රේෂ්ඨ ශ්‍රේෂ්ඨ 💜',
    },
  },

  // ── NEGATIVE THOUGHTS ────────────────────────────────────────
  // Music: Emotional healing music | Video: Positive mindset | Activity: Journaling | Game: Positive thinking (affirmation_game)
  negative_thoughts: {
    low: {
      activityIds: ['journaling', 'positive_thinking_act', 'breathing_478', 'write_positive'],
      gameId:    'affirmation_game',
      musicKey:  'negative_thoughts',
      videoKey:  'negative_thoughts',
      supportMsg:'ශ්‍රේෂ්ඨ ශ්‍රේෂ්ඨ ශ්‍රේෂ්ඨ 💜',
    },
    medium: {
      activityIds: ['breathing_478', 'journaling', 'positive_thinking_act'],
      gameId:    'affirmation_game',
      musicKey:  'negative_thoughts',
      videoKey:  'negative_thoughts',
      supportMsg:'ශ්‍රේෂ්ඨ ශ්‍රේෂ්ඨ. ශ්‍රේෂ්ඨ ශ්‍රේෂ්ඨ ශ්‍රේෂ්ඨ 🌸',
    },
  },
};

// ── PUBLIC API ────────────────────────────────────────────────
// Returns the exact recommendation set for reason + riskLevel
// Respects user preferences if set
export const getRecommendationRule = (reason, riskLevel, preferredActivities = [], preferredGames = []) => {
  const rules    = RULES[reason] || RULES.overwhelmed;
  const rule     = rules[riskLevel] || rules.low;

  // Get activity objects (maintain order from rule)
  let acts = rule.activityIds
    .map(id => ALL_ACTIVITIES.find(a => a.id === id))
    .filter(Boolean);

  // If user has preferences, filter to those — fallback to full list
  if (preferredActivities.length > 0) {
    const filtered = acts.filter(a => preferredActivities.includes(a.id));
    if (filtered.length > 0) acts = filtered;
  }

  // Get the single recommended game
  let game = ALL_GAMES.find(g => g.id === rule.gameId);

  // If user prefers different games, use first matching preference
  if (preferredGames.length > 0) {
    const prefGame = ALL_GAMES.find(g => preferredGames.includes(g.id));
    if (prefGame) game = prefGame;
  }

  return {
    activities:  acts,
    game:        game,
    games:       game ? [game] : [],  // also expose as array for UI
    musicKey:    rule.musicKey,
    videoKey:    rule.videoKey,
    supportMsg:  rule.supportMsg,
  };
};
