// ============================================================
// MEDIA LIBRARY — Complete with 10 tracks + 10 videos per reason
// Keys match exactly what emotionEngine.js expects
// ============================================================
// HOW TO ADD YOUR OWN FILES:
//   1. Put .mp3 files in:  src/assets/music/
//   2. Put .mp4 files in:  src/assets/videos/
//   3. Change: source: null  →  source: require('../assets/music/yourfile.mp3')
//   OR stream: source: { uri: 'https://your-server.com/audio.mp3' }
// ============================================================

export const MUSIC_LIBRARY = {
  // ── LONELINESS ──────────────────────────────────────────
  loneliness: [
    { id: 'lo1', title: 'ඔබ තනිවම නොවෙයි', titleEn: 'You Are Not Alone', duration: '6:20', emoji: '💜', source: null },
    { id: 'lo2', title: 'සන්සුන් පියානෝ සංගීතය', titleEn: 'Calm Piano Music', duration: '8:00', emoji: '🎹', source: null },
    { id: 'lo3', title: 'සැනසිලිදායක උණුසුම', titleEn: 'Comforting Warmth', duration: '5:45', emoji: '🌸', source: null },
    { id: 'lo4', title: 'සහෝදරියන්ගේ ගීතය', titleEn: 'Sisterhood Song', duration: '7:10', emoji: '🤗', source: null },
    { id: 'lo5', title: 'ආලෝකය ළඟයි', titleEn: 'Light is Near', duration: '6:30', emoji: '✨', source: null },
    { id: 'lo6', title: 'මෘදු සන්සුන් භාවය', titleEn: 'Soft Serenity', duration: '9:00', emoji: '🌿', source: null },
    { id: 'lo7', title: 'සුන්දර ජීවිතය', titleEn: 'Beautiful Life', duration: '5:30', emoji: '🌈', source: null },
    { id: 'lo8', title: 'ආදරණීය හදවත', titleEn: 'Dear Heart', duration: '7:00', emoji: '❤️', source: null },
    { id: 'lo9', title: 'මිහිරි ගෙදර තනුව', titleEn: 'Sweet Home Melody', duration: '6:15', emoji: '🏡', source: null },
    { id: 'lo10', title: 'උදෑසන ආලෝකය', titleEn: 'Morning Light', duration: '5:00', emoji: '☀️', source: null },
  ],
  // ── FATIGUE ─────────────────────────────────────────────
  fatigue: [
    { id: 'fa1', title: 'විවේක සංගීතය', titleEn: 'Relaxation Audio', duration: '10:00', emoji: '🛌', source: null },
    { id: 'fa2', title: 'ස්වභාව ධ්වනි - කුරුල්ලන්', titleEn: 'Nature Sounds - Birds', duration: '15:00', emoji: '🐦', source: null },
    { id: 'fa3', title: 'සාගර රළ', titleEn: 'Ocean Waves', duration: '20:00', emoji: '🌊', source: null },
    { id: 'fa4', title: 'රාත්‍රී සාමය', titleEn: 'Night Peace', duration: '30:00', emoji: '🌙', source: null },
    { id: 'fa5', title: 'මෘදු පියානෝ සංගීතය', titleEn: 'Gentle Piano', duration: '8:00', emoji: '🎵', source: null },
    { id: 'fa6', title: 'සැනසිලිදායක තන්තු සංගීතය', titleEn: 'Soothing Strings', duration: '12:00', emoji: '🎼', source: null },
    { id: 'fa7', title: 'කොළ මත වැසි හඬ', titleEn: 'Rain on Leaves', duration: '25:00', emoji: '🌧️', source: null },
    { id: 'fa8', title: 'සුදු ශබ්ද සැනසීම', titleEn: 'White Noise Comfort', duration: '60:00', emoji: '🌫️', source: null },
    { id: 'fa9', title: 'අම්මාගේ විවේක ගීතාවලිය', titleEn: 'Mama Rest Playlist', duration: '20:00', emoji: '💜', source: null },
    { id: 'fa10', title: 'සුවදායී නින්ද රළ', titleEn: 'Healing Sleep Waves', duration: '45:00', emoji: '🌊', source: null },
  ],
  // ── ANXIETY ─────────────────────────────────────────────
  anxiety: [
    { id: 'an1', title: 'භාවනා සංගීතය', titleEn: 'Meditation Music', duration: '10:00', emoji: '🧘', source: null },
    { id: 'an2', title: '432Hz සුවදායී සංඛ්‍යාත', titleEn: '432Hz Healing Frequencies', duration: '15:00', emoji: '🔮', source: null },
    { id: 'an3', title: 'සන්සුන් සාගර රළ', titleEn: 'Ocean Waves Calm', duration: '20:00', emoji: '🌊', source: null },
    { id: 'an4', title: 'ටිබෙටන් ගායන භාජන', titleEn: 'Tibetan Singing Bowls', duration: '12:00', emoji: '🎵', source: null },
    { id: 'an5', title: 'මෘදු බටනලා ශබ්ද', titleEn: 'Soft Flute Sounds', duration: '8:00', emoji: '🎶', source: null },
    { id: 'an6', title: 'වනාන්තර හුස්ම', titleEn: 'Forest Breathing', duration: '10:00', emoji: '🌲', source: null },
    { id: 'an7', title: 'කාංසාව නිවන ගීතාවලිය', titleEn: 'Anxiety Ease Playlist', duration: '9:00', emoji: '🌬️', source: null },
    { id: 'an8', title: 'ඩෙල්ටා රළ සන්සුන්තාව', titleEn: 'Delta Wave Calm', duration: '30:00', emoji: '😴', source: null },
    { id: 'an9', title: 'සාමකාමී තණබිම්', titleEn: 'Peaceful Meadow', duration: '15:00', emoji: '🌾', source: null },
    { id: 'an10', title: 'නිශ්චල ජල භාවනාව', titleEn: 'Still Water Meditation', duration: '18:00', emoji: '🪷', source: null },
  ],
  // ── BONDING ISSUES ──────────────────────────────────────
  bonding_issues: [
    { id: 'bo1', title: 'අම්මා-දරු බැඳීම් ගීත', titleEn: 'Mother-Baby Bonding Songs', duration: '8:00', emoji: '💓', source: null },
    { id: 'bo2', title: 'සිංහල නැලවිලි ගීය 1', titleEn: 'Sinhala Lullaby 1', duration: '4:30', emoji: '🌙', source: null },
    { id: 'bo3', title: 'සිංහල නැලවිලි ගීය 2', titleEn: 'Sinhala Lullaby 2', duration: '5:10', emoji: '⭐', source: null },
    { id: 'bo4', title: 'සමට-සම තනුව', titleEn: 'Skin-to-Skin Melody', duration: '6:30', emoji: '👶', source: null },
    { id: 'bo5', title: 'පළමු සිනාව ගීතය', titleEn: 'First Smile Song', duration: '5:00', emoji: '😊', source: null },
    { id: 'bo6', title: 'ආදර භාෂා නැලවිලි ගීය', titleEn: 'Love Language Lullaby', duration: '7:20', emoji: '💜', source: null },
    { id: 'bo7', title: 'ළදරු හදගැස්ම සහභාගීත්වය', titleEn: 'Baby Heartbeat Harmony', duration: '8:00', emoji: '🤱', source: null },
    { id: 'bo8', title: 'මුදු මොහොත', titleEn: 'Tender Moments', duration: '6:00', emoji: '🌸', source: null },
    { id: 'bo9', title: 'ඔබේ අත්වල ආරක්ෂාව', titleEn: 'Safe in Your Arms', duration: '8:30', emoji: '🌺', source: null },
    { id: 'bo10', title: 'දිනෙන් දින වැඩෙන ආදරය', titleEn: 'Growing Love Day by Day', duration: '5:45', emoji: '🌱', source: null },
  ],
  // ── LACK OF SUPPORT ─────────────────────────────────────
  lack_of_support: [
    { id: 'ls1', title: 'චිත්තවේගීය සුව සංගීතය', titleEn: 'Emotional Healing Music', duration: '8:00', emoji: '💜', source: null },
    { id: 'ls2', title: 'අභිප්‍රේරණ ගීත', titleEn: 'Motivational Songs', duration: '5:30', emoji: '💪', source: null },
    { id: 'ls3', title: 'ඔබ ප්‍රමාණවත්', titleEn: 'You Are Enough', duration: '6:30', emoji: '🌟', source: null },
    { id: 'ls4', title: 'ධෛර්යවන්ත හදවත් ගීත', titleEn: 'Brave Heart Songs', duration: '7:00', emoji: '❤️', source: null },
    { id: 'ls5', title: 'අභ්‍යන්තර ශක්තිය', titleEn: 'Strength Within', duration: '6:15', emoji: '🦋', source: null },
    { id: 'ls6', title: 'නැවත නැඟිටීම', titleEn: 'Rise Again', duration: '5:45', emoji: '🌈', source: null },
    { id: 'ls7', title: 'බලාපොරොත්තුව සහ සුවය', titleEn: 'Hope and Healing', duration: '9:00', emoji: '🕯️', source: null },
    { id: 'ls8', title: 'උදෑසන සවිබල ගැන්වීම', titleEn: 'Morning Empowerment', duration: '5:45', emoji: '☀️', source: null },
    { id: 'ls9', title: 'සුන්දර රණශූරි', titleEn: 'Beautiful Warrior', duration: '7:20', emoji: '⚔️', source: null },
    { id: 'ls10', title: 'ඔබට මෙය කළ හැකිය', titleEn: 'You Got This', duration: '4:50', emoji: '🎯', source: null },
  ],
  // ── SLEEP PROBLEMS ──────────────────────────────────────
  sleep_problems: [
    { id: 'sl1', title: 'නිදන සංගීතය', titleEn: 'Sleep Music', duration: '6:20', emoji: '🌙', url: 'https://youtu.be/rCSCPujLs14' },
    { id: 'sl2', title: 'වැසි හඬ', titleEn: 'Rain Sounds', duration: '8:00', emoji: '🌧️', url: 'https://youtu.be/GA1D88HF0xE' },
    { id: 'sl3', title: 'රාත්‍රී සාමය', titleEn: 'Night Peace', duration: '5:45', emoji: '⭐', url: 'https://youtu.be/q76bMs-NwRk' },
    { id: 'sl4', title: 'නිදන සුදු හඬ', titleEn: 'White Sound for Sleeping', duration: '6:30', emoji: '🌫️', url: 'https://youtu.be/5dden6Vqj4A' },
    { id: 'sl5', title: 'අම්මාට නැලවිලි ගීය', titleEn: 'Lullaby for Mama', duration: '7:00', emoji: '🌸', url: 'https://youtu.be/4owTdwvbyNA' },
    { id: 'sl6', title: 'රළ හඬ', titleEn: 'Wave Sound', duration: '5:30', emoji: '🌊', url: 'https://youtu.be/KcU6w1Pr5gc' },
    { id: 'sl7', title: 'ගැඹුරු නින්ද ඇතිකරන සංගීතය', titleEn: 'Deep Sleep Music', duration: '40:00', emoji: '😴', url: 'https://youtu.be/rCSCPujLs14' },
    { id: 'sl8', title: 'සවස් සන්සුන් භාවනාව', titleEn: 'Evening Calm Meditation', duration: '25:00', emoji: '🌅', url: 'https://youtu.be/q76bMs-NwRk' },
    { id: 'sl9', title: 'සාගර රළ නින්ද සඳහා', titleEn: 'Ocean Waves for Sleep', duration: '50:00', emoji: '🌊', url: 'https://youtu.be/KcU6w1Pr5gc' },
    { id: 'sl10', title: 'නින්ද සඳහා පියානෝ සංගීතය', titleEn: 'Piano for Sleep', duration: '30:00', emoji: '🎹', url: 'https://youtu.be/4owTdwvbyNA' },
  ],
  // ── LOSS OF CONFIDENCE ──────────────────────────────────
  loss_of_confidence: [
    { id: 'lc1', title: 'අභිප්‍රේරණ ගීත', titleEn: 'Motivational Songs', duration: '5:00', emoji: '🌟', source: null },
    { id: 'lc2', title: 'විශ්වාසය තහවුරු කිරීම්', titleEn: 'Confidence Affirmations', duration: '8:00', emoji: '💪', source: null },
    { id: 'lc3', title: 'ඔබ ප්‍රමාණවත්', titleEn: 'You Are Enough', duration: '6:30', emoji: '💜', source: null },
    { id: 'lc4', title: 'නැඟිට බබළන්න අම්මා', titleEn: 'Rise and Shine Mama', duration: '5:45', emoji: '☀️', source: null },
    { id: 'lc5', title: 'ඔසවා තබන ගීත', titleEn: 'Uplifting Songs', duration: '7:00', emoji: '🦋', source: null },
    { id: 'lc6', title: 'මට මෙය කළ හැකිය', titleEn: 'I Can Do This', duration: '6:15', emoji: '🎯', source: null },
    { id: 'lc7', title: 'ධෛර්යවන්ත අම්මා ගීත', titleEn: 'Brave Mama Songs', duration: '5:30', emoji: '❤️', source: null },
    { id: 'lc8', title: 'ශක්තිමත් වීම', titleEn: 'Growing Stronger', duration: '6:00', emoji: '🌱', source: null },
    { id: 'lc9', title: 'උදෑසන ශක්ති ගීතාවලිය', titleEn: 'Morning Power Playlist', duration: '8:30', emoji: '⚡', source: null },
    { id: 'lc10', title: 'සුන්දර රණශූරි', titleEn: 'Beautiful Warrior', duration: '7:20', emoji: '⚔️', source: null },
  ],
  // ── OVERWHELMED ─────────────────────────────────────────
  overwhelmed: [
    { id: 'ow1', title: 'ස්වභාව ධ්වනි', titleEn: 'Nature Sounds', duration: '20:00', emoji: '🌾', source: null },
    { id: 'ow2', title: 'සන්සුන් විවේක සංගීතය', titleEn: 'Calm Relaxing Music', duration: '15:00', emoji: '🌊', source: null },
    { id: 'ow3', title: 'වනාන්තර ශබ්ද', titleEn: 'Forest Sounds', duration: '30:00', emoji: '🌲', source: null },
    { id: 'ow4', title: 'සරල බව ගීතාවලිය', titleEn: 'Simplicity Playlist', duration: '12:00', emoji: '✂️', source: null },
    { id: 'ow5', title: '432Hz සන්සුන්තාව', titleEn: '432Hz Calm', duration: '10:00', emoji: '🔮', source: null },
    { id: 'ow6', title: 'මන්දගාමී පියානෝ සංගීතය', titleEn: 'Slow Piano Music', duration: '8:00', emoji: '🎹', source: null },
    { id: 'ow7', title: 'නිශ්චල ජලය', titleEn: 'Still Water', duration: '18:00', emoji: '🪷', source: null },
    { id: 'ow8', title: 'වැසි සහ සුළඟ', titleEn: 'Rain and Wind', duration: '25:00', emoji: '🌧️', source: null },
    { id: 'ow9', title: 'සිහිකල්පනා මොහොත', titleEn: 'Mindful Moments', duration: '7:45', emoji: '🧘', source: null },
    { id: 'ow10', title: 'අලුයම සාගරය', titleEn: 'Ocean at Dawn', duration: '22:00', emoji: '🌅', source: null },
  ],
  // ── PHYSICAL DISCOMFORT ─────────────────────────────────
  physical_discomfort: [
    { id: 'pd1', title: 'මෘදු සන්සුන් සංගීතය', titleEn: 'Soft Calming Music', duration: '12:00', emoji: '🌿', source: null },
    { id: 'pd2', title: 'ශරීර සුව කිරීමේ සංඛ්‍යාත', titleEn: 'Body Healing Frequencies', duration: '20:00', emoji: '✨', source: null },
    { id: 'pd3', title: 'වේදනා සහන භාවනාව', titleEn: 'Pain Relief Meditation', duration: '15:00', emoji: '💊', source: null },
    { id: 'pd4', title: 'විවේකී පසුබිම් සංගීතය', titleEn: 'Relaxing Background Music', duration: '30:00', emoji: '🎵', source: null },
    { id: 'pd5', title: 'සුවය ලැබීමේ ස්වර', titleEn: 'Recovery Tones', duration: '18:00', emoji: '🩺', source: null },
    { id: 'pd6', title: 'ශරීරය සනසවන', titleEn: 'Soothing the Body', duration: '11:00', emoji: '🧘', source: null },
    { id: 'pd7', title: 'සුව කරන ආලෝක සංගීතය', titleEn: 'Healing Light Music', duration: '14:00', emoji: '☀️', source: null },
    { id: 'pd8', title: 'මෘදු සුවය', titleEn: 'Gentle Recovery', duration: '10:00', emoji: '🌸', source: null },
    { id: 'pd9', title: 'අලුත්වැඩියා කර පිපෙන්න', titleEn: 'Mend and Bloom', duration: '13:00', emoji: '🌺', source: null },
    { id: 'pd10', title: 'ඔබේ ශරීරය යථා තත්ත්වයට', titleEn: 'Restore Your Body', duration: '16:00', emoji: '💆', source: null },
  ],
  // ── NEGATIVE THOUGHTS ───────────────────────────────────
  negative_thoughts: [
    { id: 'nt1', title: 'චිත්තවේගීය සුව සංගීතය', titleEn: 'Emotional Healing Music', duration: '8:00', emoji: '💜', source: null },
    { id: 'nt2', title: 'අඳුරේ ආලෝකය', titleEn: 'Light in the Dark', duration: '7:00', emoji: '🕯️', source: null },
    { id: 'nt3', title: 'බලාපොරොත්තුව සහ සුවය', titleEn: 'Hope and Healing', duration: '9:00', emoji: '🌈', source: null },
    { id: 'nt4', title: 'මෘදු සෙමින් ගීත', titleEn: 'Soft Slow Songs', duration: '10:00', emoji: '🌸', source: null },
    { id: 'nt5', title: 'උදෑසන බලාපොරොත්තු සංගීතය', titleEn: 'Morning Hope Music', duration: '6:30', emoji: '☀️', source: null },
    { id: 'nt6', title: 'ඔබ වැදගත් ගීත', titleEn: 'You Matter Songs', duration: '7:45', emoji: '💛', source: null },
    { id: 'nt7', title: 'ආලෝකය නැවත පැමිණේ', titleEn: 'The Light Returns', duration: '8:30', emoji: '🌟', source: null },
    { id: 'nt8', title: 'මෘදු සැනසිලි සංගීතය', titleEn: 'Gentle Comfort Music', duration: '11:00', emoji: '🌿', source: null },
    { id: 'nt9', title: 'සෙමින් නැවත නැඟිටීම', titleEn: 'Rise Again Slowly', duration: '6:00', emoji: '🌱', source: null },
    { id: 'nt10', title: 'ධෛර්යවන්ත කුඩා හදවත', titleEn: 'Brave Little Heart', duration: '5:30', emoji: '❤️', source: null },
  ],
};

export const VIDEO_LIBRARY = {
  // ── LONELINESS ──────────────────────────────────────────
  loneliness: [
    { id: 'vlo1', title: 'ඔබ කිසිදා තනිවම නැත', titleEn: 'You Are Never Truly Alone', duration: '8 min', emoji: '🌸', source: null },
    { id: 'vlo2', title: 'අම්මාට අභිප්‍රේරණ වීඩියෝ', titleEn: 'Motivational Videos for Mothers', duration: '12 min', emoji: '💪', source: null },
    { id: 'vlo3', title: 'අම්මාගේ ප්‍රජාව', titleEn: 'Community of Mothers', duration: '6 min', emoji: '💜', source: null },
    { id: 'vlo4', title: 'ඔබ වැනි අම්මලාගේ කතා', titleEn: 'Stories from Mamas Like You', duration: '15 min', emoji: '👩‍👧', source: null },
    { id: 'vlo5', title: 'ඔබේ ගම සොයා ගැනීම', titleEn: 'Finding Your Village', duration: '10 min', emoji: '🏡', source: null },
    { id: 'vlo6', title: 'සැබෑ අම්මලා අවංකව කතා කරයි', titleEn: 'Real Mamas Talk Honestly', duration: '14 min', emoji: '💬', source: null },
    { id: 'vlo7', title: 'ඔබට තනිවම කිරීමට අවශ්‍ය නැත', titleEn: 'You Don\'t Have to Do It Alone', duration: '7 min', emoji: '🤝', source: null },
    { id: 'vlo8', title: 'අලුත් අම්මලාට ලිපි', titleEn: 'Letters to New Mamas', duration: '9 min', emoji: '✉️', source: null },
    { id: 'vlo9', title: 'ආදරයේ නොපෙනෙන වැඩ', titleEn: 'The Invisible Labour of Love', duration: '11 min', emoji: '💛', source: null },
    { id: 'vlo10', title: 'ප්‍රසව සහාය කවය', titleEn: 'Postpartum Support Circle', duration: '20 min', emoji: '⭕', source: null },
  ],
  // ── FATIGUE ─────────────────────────────────────────────
  fatigue: [
    { id: 'vfa1', title: 'විවේක මගපෙන්වීම් වීඩියෝ', titleEn: 'Rest Guidance Video', duration: '6 min', emoji: '🌙', source: null },
    { id: 'vfa2', title: 'විවේකය පූජනීය වන්නේ ඇයි', titleEn: 'Why Rest Is Sacred', duration: '8 min', emoji: '😴', source: null },
    { id: 'vfa3', title: 'ක්ෂුද්ර විවේක ශිල්පීය ක්‍රම', titleEn: 'Micro-Rest Techniques', duration: '5 min', emoji: '⏱️', source: null },
    { id: 'vfa4', title: 'කෙටි නැවත ආරෝපණ දිනචරියාව', titleEn: 'Short Recharge Routine', duration: '4 min', emoji: '⚡', source: null },
    { id: 'vfa5', title: 'අලුත් අම්මලාට නිදන උපදෙස්', titleEn: 'Sleep Tips for New Mamas', duration: '10 min', emoji: '🛌', source: null },
    { id: 'vfa6', title: 'ශක්ති ප්‍රතිසාධන මගපෙන්වීම', titleEn: 'Energy Recovery Guide', duration: '7 min', emoji: '💚', source: null },
    { id: 'vfa7', title: 'අලුත් අම්මලාට පෝෂණය', titleEn: 'Nutrition for New Mamas', duration: '9 min', emoji: '🥗', source: null },
    { id: 'vfa8', title: 'ඔබේ ශරීරය පුදුම සහගත දෙයක් කළා', titleEn: 'Your Body Did Something Amazing', duration: '11 min', emoji: '✨', source: null },
    { id: 'vfa9', title: 'මෘදු ප්‍රතිසාධන චලන', titleEn: 'Gentle Recovery Moves', duration: '12 min', emoji: '🤸', source: null },
    { id: 'vfa10', title: 'සුවය රේඛීය නොවේ', titleEn: 'Healing Is Not Linear', duration: '7 min', emoji: '📈', source: null },
  ],
  // ── ANXIETY ─────────────────────────────────────────────
  anxiety: [
    { id: 'van1', title: 'කාංසාව සන්සිඳවන වීඩියෝ', titleEn: 'Anxiety Calming Video', duration: '8 min', emoji: '🌿', source: null },
    { id: 'van2', title: 'මග පෙන්වන භාවනා වීඩියෝ', titleEn: 'Guided Meditation Video', duration: '10 min', emoji: '🧘', source: null },
    { id: 'van3', title: 'ඔබේ දුවන සිත සන්සුන් කරන්න', titleEn: 'Calm Your Racing Mind', duration: '9 min', emoji: '🧠', source: null },
    { id: 'van4', title: 'එක හුස්මක්', titleEn: 'One Breath at a Time', duration: '5 min', emoji: '🌬️', source: null },
    { id: 'van5', title: 'ප්‍රසව කාංසාව පැහැදිලි කිරීම', titleEn: 'Postpartum Anxiety Explained', duration: '15 min', emoji: '📖', source: null },
    { id: 'van6', title: 'බිම ස්ථාවර කිරීමේ ශිල්පීය ක්‍රම', titleEn: 'Grounding Techniques', duration: '8 min', emoji: '🌱', source: null },
    { id: 'van7', title: 'මේ මොහොතේ ආරක්ෂිතයි', titleEn: 'Safe in This Moment', duration: '7 min', emoji: '🛡️', source: null },
    { id: 'van8', title: 'ඔබේ සිතුවිලි කරුණු නොවේ', titleEn: 'Your Thoughts Are Not Facts', duration: '9 min', emoji: '💡', source: null },
    { id: 'van9', title: 'බලාපොරොත්තු කතා', titleEn: 'Hopeful Stories', duration: '14 min', emoji: '🌟', source: null },
    { id: 'van10', title: 'මග පෙන්වන හුස්ම ගැනීමේ උපදෙස්', titleEn: 'Guided Breathing Tutorial', duration: '6 min', emoji: '🌬️', source: null },
  ],
  // ── BONDING ISSUES ──────────────────────────────────────
  bonding_issues: [
    { id: 'vbo1', title: 'දෙමාපිය දරු බැඳීමේ වීඩියෝ', titleEn: 'Parenting Bonding Video', duration: '12 min', emoji: '👶', source: null },
    { id: 'vbo2', title: 'බැඳීමට කාලය ගත වේ - කමක් නැත', titleEn: 'Bonding Takes Time - OK', duration: '8 min', emoji: '⏱️', source: null },
    { id: 'vbo3', title: 'දෙමාපිය චිත්තවේගීය සහාය', titleEn: 'Parenting Emotional Support', duration: '15 min', emoji: '💜', source: null },
    { id: 'vbo4', title: 'සමට-සම ප්‍රතිලාභ', titleEn: 'Skin-to-Skin Benefits', duration: '6 min', emoji: '🤱', source: null },
    { id: 'vbo5', title: 'ළදරු ආදරයේ විද්‍යාව', titleEn: 'The Science of Baby Love', duration: '10 min', emoji: '🔬', source: null },
    { id: 'vbo6', title: 'මට එය ක්ෂණිකව දැනුණේ නැත', titleEn: 'I Didn\'t Feel It Instantly', duration: '14 min', emoji: '🌸', source: null },
    { id: 'vbo7', title: 'ඇස් ස්පර්ශය සහ ආරක්ෂාව', titleEn: 'Eye Contact and Safety', duration: '8 min', emoji: '👁️', source: null },
    { id: 'vbo8', title: 'ළදරු කතා සහ සම්බන්ධතාව', titleEn: 'Baby Talk and Connection', duration: '7 min', emoji: '🗣️', source: null },
    { id: 'vbo9', title: 'සෑම පෝෂණයක්ම බැඳීමකි', titleEn: 'Every Feeding Is Bonding', duration: '5 min', emoji: '🍼', source: null },
    { id: 'vbo10', title: 'දිනෙන් දින වැඩෙන ආදරය', titleEn: 'Growing Love Day by Day', duration: '11 min', emoji: '🌱', source: null },
  ],
  // ── LACK OF SUPPORT ─────────────────────────────────────
  lack_of_support: [
    { id: 'vls1', title: 'දිරිගන්වන වීඩියෝ', titleEn: 'Encouragement Videos', duration: '8 min', emoji: '💜', source: null },
    { id: 'vls2', title: 'ඔබ ශක්තිමත් පණිවිඩ', titleEn: 'You Are Strong Messages', duration: '5 min', emoji: '💪', source: null },
    { id: 'vls3', title: 'අලුත් අම්මාවියේදී සහාය සොයා ගැනීම', titleEn: 'Finding Support as a New Mama', duration: '10 min', emoji: '🏡', source: null },
    { id: 'vls4', title: 'උපකාර ඉල්ලීම ධෛර්යයකි', titleEn: 'Asking For Help Is Brave', duration: '5 min', emoji: '🦁', source: null },
    { id: 'vls5', title: 'තනිකම ගැන සැබෑ අම්මලා', titleEn: 'Real Mamas on Loneliness', duration: '12 min', emoji: '💬', source: null },
    { id: 'vls6', title: 'ඔබට තනිවම සිටීමට අවශ්‍ය නැත', titleEn: 'You Don\'t Have to Alone', duration: '7 min', emoji: '🤝', source: null },
    { id: 'vls7', title: 'ප්‍රසව සහාය කවය', titleEn: 'Postpartum Support Circle', duration: '20 min', emoji: '⭕', source: null },
    { id: 'vls8', title: 'අපට සුදුසු ගම', titleEn: 'The Village We Deserve', duration: '9 min', emoji: '🌏', source: null },
    { id: 'vls9', title: 'අලුත් අම්මලාට ලිපි', titleEn: 'Letters to New Mamas', duration: '9 min', emoji: '✉️', source: null },
    { id: 'vls10', title: 'ඔබ බොහෝ වැදගත්', titleEn: 'You Matter So Much', duration: '6 min', emoji: '💛', source: null },
  ],
  // ── SLEEP PROBLEMS ──────────────────────────────────────
  sleep_problems: [
    { id: 'vsl1', title: 'පශ්චාත් ප්‍රසව අවධිය ගැන', titleEn: 'About Postpartum', duration: '10 min', emoji: '🌙', url: 'https://youtu.be/hrozJ-EbdGI' },
    { id: 'vsl2', title: 'අලුත් අම්මාට නිදන උපදෙස්', titleEn: 'Sleeping Tips for New Moms', duration: '9 min', emoji: '😴', url: 'https://youtu.be/92Oc8-lnx4k' },
    { id: 'vsl3', title: 'පශ්චාත් ප්‍රසව අවධිය ගැන 2', titleEn: 'About Postpartum Part 2', duration: '8 min', emoji: '🛌', url: 'https://youtu.be/1n46HPsYsHM' },
    { id: 'vsl4', title: 'සන්සුන් නින්දට පෙර කතා', titleEn: 'Calm Bedtime Stories', duration: '12 min', emoji: '📖', url: 'https://youtu.be/Y2IZNS39kM8' },
    { id: 'vsl5', title: 'නින්ද සඳහා භාවනා මගපෙන්වීම', titleEn: 'Sleep Meditation Guide', duration: '15 min', emoji: '🧘', source: null },
    { id: 'vsl6', title: 'රාත්‍රී ලිහිල් කිරීමේ මගපෙන්වීම', titleEn: 'Night Relaxation Guide', duration: '12 min', emoji: '🌟', source: null },
    { id: 'vsl7', title: 'නින්ද නොලැබීම සඳහා විසඳුම්', titleEn: 'Sleep Deprivation Solutions', duration: '9 min', emoji: '💡', source: null },
    { id: 'vsl8', title: 'නින්දට පෙර ශරීරය ලිහිල් කිරීම', titleEn: 'Body Relaxation Before Sleep', duration: '8 min', emoji: '🧘', source: null },
    { id: 'vsl9', title: 'විවේකය තුළින් සුවය', titleEn: 'Healing Through Rest', duration: '7 min', emoji: '💜', source: null },
    { id: 'vsl10', title: 'නින්ද යනු ස්වයං රැකවරණයකි', titleEn: 'Sleep Is Self-Care', duration: '6 min', emoji: '🌸', source: null },
  ],
  // ── LOSS OF CONFIDENCE ──────────────────────────────────
  loss_of_confidence: [
    { id: 'vlc1', title: 'විශ්වාසය ගොඩනැගීමේ වීඩියෝ', titleEn: 'Confidence Building Video', duration: '8 min', emoji: '💪', source: null },
    { id: 'vlc2', title: 'ඔබ සැමවිටම ප්‍රමාණවත්', titleEn: 'You Are Enough Always', duration: '10 min', emoji: '💜', source: null },
    { id: 'vlc3', title: 'හොඳ මව්වරු පෙනෙන්නේ කෙසේද', titleEn: 'What Good Mothers Look Like', duration: '9 min', emoji: '🌟', source: null },
    { id: 'vlc4', title: 'අසම්පූර්ණ සහ පරිපූර්ණ', titleEn: 'Imperfect and Perfect', duration: '6 min', emoji: '🧩', source: null },
    { id: 'vlc5', title: 'ඔබ අසමත් වන්නේ නැත', titleEn: 'You\'re Not Failing', duration: '7 min', emoji: '🛡️', source: null },
    { id: 'vlc6', title: 'කුඩා ජයග්‍රහණ සමරන්න', titleEn: 'Celebrate Small Wins', duration: '5 min', emoji: '🎉', source: null },
    { id: 'vlc7', title: 'සැසඳීමේ උගුල', titleEn: 'The Comparison Trap', duration: '11 min', emoji: '🪤', source: null },
    { id: 'vlc8', title: 'ඔබ ළදරුවාගේ ප්‍රවීණයා', titleEn: 'You Are the Expert on Baby', duration: '14 min', emoji: '👑', source: null },
    { id: 'vlc9', title: 'විවේක ගැනීමට අවසර', titleEn: 'Permission to Rest', duration: '8 min', emoji: '🛌', source: null },
    { id: 'vlc10', title: 'ඔබ ගැන විශ්වාස කරන්න අම්මා', titleEn: 'Believe in Yourself Mama', duration: '7 min', emoji: '🌸', source: null },
  ],
  // ── OVERWHELMED ─────────────────────────────────────────
  overwhelmed: [
    { id: 'vow1', title: 'ආතති සහන වීඩියෝ', titleEn: 'Stress Relief Videos', duration: '8 min', emoji: '🌊', source: null },
    { id: 'vow2', title: 'සියල්ල ඕනෑවට වඩා වැඩි වූ විට', titleEn: 'When Everything Is Too Much', duration: '12 min', emoji: '💜', source: null },
    { id: 'vow3', title: 'එක හුස්මක් හරහා', titleEn: 'One Breath at a Time', duration: '5 min', emoji: '🌬️', source: null },
    { id: 'vow4', title: 'මග පෙන්වන හුස්ම වීඩියෝ', titleEn: 'Guided Breathing Videos', duration: '6 min', emoji: '🧘', source: null },
    { id: 'vow5', title: 'මාතෘත්වය සරල කිරීම', titleEn: 'Simplifying Motherhood', duration: '9 min', emoji: '✂️', source: null },
    { id: 'vow6', title: 'විවේක ගැනීමට අවසර', titleEn: 'Permission to Rest', duration: '8 min', emoji: '🛌', source: null },
    { id: 'vow7', title: 'අඩුවෙන් කිරීමේ කලාව', titleEn: 'The Art of Doing Less', duration: '7 min', emoji: '🎨', source: null },
    { id: 'vow8', title: 'අම්මා ඔබ ප්‍රමාණවත්', titleEn: 'Mama You Are Enough', duration: '6 min', emoji: '🌸', source: null },
    { id: 'vow9', title: 'කාර්යබහුල අම්මලා සඳහා සිහිකල්පනාව', titleEn: 'Mindfulness for Busy Mamas', duration: '10 min', emoji: '🌿', source: null },
    { id: 'vow10', title: 'මෘදුව සීමා නියම කිරීම', titleEn: 'Setting Boundaries Gently', duration: '8 min', emoji: '🛡️', source: null },
  ],
  // ── PHYSICAL DISCOMFORT ─────────────────────────────────
  physical_discomfort: [
    { id: 'vpd1', title: 'ආරක්ෂිත ව්‍යායාම වීඩියෝ', titleEn: 'Safe Exercise Video', duration: '12 min', emoji: '🤸', source: null },
    { id: 'vpd2', title: 'සැහැල්ලු ව්‍යායාම වීඩියෝ', titleEn: 'Light Exercise Videos', duration: '8 min', emoji: '🌸', source: null },
    { id: 'vpd3', title: 'ශරීර ලිහිල් කිරීමේ මගපෙන්වීම', titleEn: 'Body Relaxation Guidance', duration: '10 min', emoji: '🧘', source: null },
    { id: 'vpd4', title: 'ප්‍රසව ශරීරයට කරුණාවන්ත වන්න', titleEn: 'Postpartum Body Be Kind', duration: '8 min', emoji: '💜', source: null },
    { id: 'vpd5', title: 'සී-අංශයෙන් සුවය ලැබීමේ මගපෙන්වීම', titleEn: 'C-Section Recovery Guide', duration: '15 min', emoji: '🏥', source: null },
    { id: 'vpd6', title: 'සුවය රේඛීය නොවේ', titleEn: 'Healing Is Not Linear', duration: '7 min', emoji: '📈', source: null },
    { id: 'vpd7', title: 'මෘදු ප්‍රසව දිගු කිරීම්', titleEn: 'Gentle Postpartum Stretches', duration: '10 min', emoji: '🌺', source: null },
    { id: 'vpd8', title: 'ඔබේ ශරීරය පුදුම සහගත දෙයක් කළා', titleEn: 'Your Body Did Something Amazing', duration: '6 min', emoji: '✨', source: null },
    { id: 'vpd9', title: 'ප්‍රකෘතිය සඳහා පෝෂණය', titleEn: 'Nutrition for Recovery', duration: '9 min', emoji: '🥗', source: null },
    { id: 'vpd10', title: 'විවේකය දුර්වලකමක් නොවේ', titleEn: 'Rest Is Not Weakness', duration: '5 min', emoji: '🌙', source: null },
  ],
  // ── NEGATIVE THOUGHTS ───────────────────────────────────
  negative_thoughts: [
    { id: 'vnt1', title: 'ධනාත්මක සිතුවිලි වීඩියෝ', titleEn: 'Positive Mindset Videos', duration: '8 min', emoji: '🌟', source: null },
    { id: 'vnt2', title: 'චිත්තවේගීය සහාය කතා', titleEn: 'Emotional Support Talks', duration: '12 min', emoji: '💜', source: null },
    { id: 'vnt3', title: 'අඳුරු සිතුවිලි යන්නේ නැත', titleEn: 'Dark Thoughts Not Broken', duration: '10 min', emoji: '🌑', source: null },
    { id: 'vnt4', title: 'ඔබ බොහෝ වැදගත්', titleEn: 'You Matter So Much', duration: '6 min', emoji: '💛', source: null },
    { id: 'vnt5', title: 'ආලෝකය නැවත පැමිණේ', titleEn: 'The Light Returns', duration: '11 min', emoji: '🕯️', source: null },
    { id: 'vnt6', title: 'බලාපොරොත්තු කතා', titleEn: 'Hopeful Stories', duration: '14 min', emoji: '🌈', source: null },
    { id: 'vnt7', title: 'ඔබේ සිතුවිලි කරුණු නොවේ', titleEn: 'Your Thoughts Are Not Facts', duration: '9 min', emoji: '💡', source: null },
    { id: 'vnt8', title: 'අඳුරු මොහොත ගෙවී යයි', titleEn: 'Dark Moments Pass', duration: '8 min', emoji: '🌊', source: null },
    { id: 'vnt9', title: 'දිවි ගලවා ගත් අය කතා බෙදා ගනිති', titleEn: 'Survivors Share Stories', duration: '15 min', emoji: '🌱', source: null },
    { id: 'vnt10', title: 'මේ මොහොතේ ආරක්ෂිතයි', titleEn: 'Safe in This Moment', duration: '7 min', emoji: '🛡️', source: null },
  ],
};