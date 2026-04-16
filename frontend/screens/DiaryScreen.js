import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
    View,
    Text,
    TextInput,
    TouchableOpacity,
    StyleSheet,
    ScrollView,
    Platform,
    ActivityIndicator,
    Modal,
    Image,
    Dimensions
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Toast from 'react-native-toast-message';
import * as DocumentPicker from 'expo-document-picker';
import { LinearGradient } from 'expo-linear-gradient';
import api from '../services/api';
import { transliterate } from '../services/sinhalaTransliteration';
import SinhalaKeyboard from '../components/SinhalaKeyboard';
import { useTranslation } from 'react-i18next';

const { width } = Dimensions.get('window');

// ─── helpers ────────────────────────────────────────────────────────────────
const toDateString = (d) => {
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${y}-${m}-${day}`;
};

const formatDisplay = (dateStr) => {
    if (!dateStr) return '';
    const [y, m, d] = dateStr.split('-');
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    return `${months[parseInt(m, 10) - 1]} ${d}, ${y}`;
};

const getDayName = (dateStr) => {
    if (!dateStr) return '';
    const date = new Date(dateStr);
    const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    return days[date.getDay()];
};

const getMonthName = (dateStr) => {
    if (!dateStr) return '';
    const date = new Date(dateStr);
    const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
    return months[date.getMonth()];
};

const analyzeSentiment = (text) => {
    if (!text || text.trim().length === 0) return 'Skipped';
    const lower = text.toLowerCase();

    // Simple Keyword based Sentiment Analysis
    const posWords = ['good', 'great', 'happy', 'better', 'love', 'amazing', 'excellent', 'hope', 'eager', 'content', 'relief', 'smile', 'joy', 'blessed'];
    const negWords = ['sad', 'bad', 'down', 'stress', 'anxious', 'depress', 'tired', 'hate', 'cry', 'pain', 'worst', 'fear', 'overwhelm', 'alone', 'angry'];

    let posCount = 0;
    let negCount = 0;

    posWords.forEach(w => { if (lower.includes(w)) posCount++; });
    negWords.forEach(w => { if (lower.includes(w)) negCount++; });

    if (posCount > negCount) return 'Positive Mind';
    if (negCount > posCount) return 'Negative Mind';
    return 'Neutral Mind';
};

const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Good Morning ☀️";
    if (hour < 18) return "Good Afternoon ⛅";
    return "Good Evening 🌙";
};

const MOODS = ['😊', '😌', '😔', '😪', '😠', '🌈', '🌟', '☁️'];

const THEMES = {
    'default': { bg1: '#F4F0FB', bg2: '#FDFCFE', card: '#FFFFFF', text: '#334155', accent: '#a18cd1' },
    'pastel-pink': { bg1: '#FDF2F8', bg2: '#FFF0F5', card: '#FFFFFF', text: '#831843', accent: '#fbc2eb' },
    'ocean-blue': { bg1: '#F0F9FF', bg2: '#E0F2FE', card: '#FFFFFF', text: '#0C4A6E', accent: '#84fab0' },
    'mint-green': { bg1: '#ECFDF5', bg2: '#D1FAE5', card: '#FFFFFF', text: '#064E3B', accent: '#a1c4fd' },
    'warm-sunset': { bg1: '#FFF7ED', bg2: '#FFEDD5', card: '#FFFFFF', text: '#7C2D12', accent: '#ffecd2' }
};

const today = toDateString(new Date());

export default function DiaryScreen({ navigation }) {
    const { t, i18n } = useTranslation();
    const [selectedDate, setSelectedDate] = useState(today);
    const [content, setContent] = useState('');
    const [isLocked, setIsLocked] = useState(false);
    const [currentTheme, setCurrentTheme] = useState('default');
    const [media, setMedia] = useState([]);
    const [mood, setMood] = useState('😊');
    const [sentiment, setSentiment] = useState('Skipped');

    const [saveStatus, setSaveStatus] = useState('idle');
    const [loading, setLoading] = useState(false);
    const [allDates, setAllDates] = useState([]);
    const [stats, setStats] = useState({ totalJournals: 0, totalWords: 0 });

    // Auth & Lock
    const [isUnlocked, setIsUnlocked] = useState(true);
    const [passwordModalVisible, setPasswordModalVisible] = useState(false);
    const [passwordInput, setPasswordInput] = useState('');
    const [needsSetup, setNeedsSetup] = useState(false);

    // Voice
    const [isListening, setIsListening] = useState(false);
    const [interimTranscript, setInterimTranscript] = useState('');

    // Sinhala Mode
    const [sinhalaMode, setSinhalaMode] = useState(false);
    const [showVisualKeyboard, setShowVisualKeyboard] = useState(false);

    // Time
    const [currentTime, setCurrentTime] = useState(new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }));

    const debounceRef = useRef(null);
    const recognitionRef = useRef(null);
    const contentRef = useRef('');

    useEffect(() => {
        contentRef.current = content;
    }, [content]);

    useEffect(() => {
        const timer = setInterval(() => {
            setCurrentTime(new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }));
        }, 30000); // update every 30s
        return () => clearInterval(timer);
    }, []);

    useEffect(() => {
        loadEntry(selectedDate);
    }, [selectedDate]);

    useEffect(() => {
        loadAllDates();
    }, []);

    const loadEntry = async (date) => {
        setLoading(true);
        setSaveStatus('idle');
        try {
            const res = await api.get(`/diary/${date}`);
            const data = res.data || {};
            setContent(data.content || '');
            setIsLocked(data.isLocked || false);
            setCurrentTheme(data.theme || 'default');
            setMedia(data.media || []);
            setMood(data.mood || '😊');
            setSentiment(data.sentiment || analyzeSentiment(data.content || ''));
            setIsUnlocked(!data.isLocked);
        } catch (err) {
            setContent('');
            setIsLocked(false);
            setCurrentTheme('default');
            setMedia([]);
            setMood('😊');
            setSentiment('Skipped');
            setIsUnlocked(true);
        } finally {
            setLoading(false);
        }
    };

    const loadAllDates = async () => {
        try {
            const res = await api.get('/diary');
            if (res.data?.entries) {
                setAllDates(res.data.entries);
                setStats(res.data.stats || { totalJournals: 0, totalWords: 0 });
            }
        } catch (_) { }
    };

    const handleUnlockSubmit = async () => {
        if (!passwordInput.trim()) return;
        try {
            if (needsSetup) {
                await api.post('/diary/auth/set', { password: passwordInput });
                Toast.show({ type: 'success', text1: 'Password Set', position: 'top' });
                setNeedsSetup(false);
                setIsUnlocked(true);
                setPasswordModalVisible(false);
                setPasswordInput('');
                if (!isLocked) toggleLock();
            } else {
                const res = await api.post('/diary/auth/check', { password: passwordInput });
                if (res.data.valid) {
                    setIsUnlocked(true);
                    setPasswordModalVisible(false);
                    setPasswordInput('');
                    if (!isLocked && !isUnlocked) {
                        setIsLocked(true);
                        saveDiary(content, true, currentTheme, media, mood, sentiment);
                    }
                } else if (res.data.needsSetup) {
                    setNeedsSetup(true);
                } else {
                    Toast.show({ type: 'error', text1: 'Incorrect Password', position: 'top' });
                }
            }
        } catch (err) {
            Toast.show({ type: 'error', text1: 'Error verifying password.', position: 'top' });
        }
    };

    const toggleLock = async () => {
        if (isLocked) {
            setIsLocked(false);
            saveDiary(content, false, currentTheme, media, mood, sentiment);
            Toast.show({ type: 'info', text1: 'Entry Unlocked', position: 'top' });
        } else {
            try {
                const res = await api.post('/diary/auth/check', { password: '' });
                if (res.data.needsSetup) {
                    setNeedsSetup(true);
                    setPasswordModalVisible(true);
                } else {
                    setPasswordModalVisible(true);
                    setIsUnlocked(false);
                }
            } catch (err) {
                if (err.response?.status === 401) {
                    setPasswordModalVisible(true);
                    setIsUnlocked(false);
                }
            }
        }
    };

    const handleContentChange = (text) => {
        let newText = text;
        if (sinhalaMode && text.length > content.length) {
            const lastChar = text[text.length - 1];
            if ([' ', '\n', '.', ',', '?', '!', '\t'].includes(lastChar)) {
                const words = text.split(/(\s+)/);
                const lastWordIndex = words.length - 2;
                const lastWord = words[lastWordIndex];
                if (lastWord && /^[a-zA-Z]+$/.test(lastWord)) {
                    const siWord = transliterate(lastWord);
                    if (siWord !== lastWord) {
                        words[lastWordIndex] = siWord;
                        newText = words.join('');
                    }
                }
            }
        }
        setContent(newText);
        const newSentiment = analyzeSentiment(newText);
        setSentiment(newSentiment);
        setSaveStatus('saving');
        if (debounceRef.current) clearTimeout(debounceRef.current);
        debounceRef.current = setTimeout(() => saveDiary(newText, isLocked, currentTheme, media, mood, newSentiment), 1500);
    };

    const saveDiary = async (text, locked = isLocked, theme = currentTheme, mediaList = media, m = mood, s = sentiment) => {
        try {
            await api.post('/diary', { date: selectedDate, content: text, isLocked: locked, theme, media: mediaList, mood: m, sentiment: s });
            setSaveStatus('saved');
            loadAllDates();
            setTimeout(() => setSaveStatus('idle'), 2500);
        } catch (err) {
            setSaveStatus('error');
        }
    };

    const changeMood = (m) => {
        setMood(m);
        setSaveStatus('saving');
        saveDiary(content, isLocked, currentTheme, media, m, sentiment);
    };

    const changeTheme = (newTheme) => {
        setCurrentTheme(newTheme);
        setSaveStatus('saving');
        saveDiary(content, isLocked, newTheme, media, mood, sentiment);
    };

    const addMedia = async (type) => {
        try {
            if (type === 'location') {
                const newMedia = [...media, { type, url: 'geo:0,0', name: `Location` }];
                setMedia(newMedia);
                saveDiary(content, isLocked, currentTheme, newMedia, mood, sentiment);
                return;
            }
            let mimeType = '*/*';
            if (type === 'image') mimeType = 'image/*';
            else if (type === 'video') mimeType = 'video/*';
            else if (type === 'audio') mimeType = 'audio/*';
            else if (type === 'document') mimeType = ['application/pdf', 'application/msword', 'text/plain'];

            const result = await DocumentPicker.getDocumentAsync({ type: mimeType, copyToCacheDirectory: true });
            if (result.canceled) return;
            const asset = result.assets[0];
            const newMedia = [...media, { type, url: asset.uri, name: asset.name }];
            setMedia(newMedia);
            saveDiary(content, isLocked, currentTheme, newMedia, mood, sentiment);
        } catch (err) {
            Toast.show({ type: 'error', text1: 'Error adding file.', position: 'top' });
        }
    };

    const removeMedia = (index) => {
        const newMedia = [...media];
        newMedia.splice(index, 1);
        setMedia(newMedia);
        saveDiary(content, isLocked, currentTheme, newMedia, mood, sentiment);
    };

    const startListening = useCallback(() => {
        if (Platform.OS !== 'web') {
            Toast.show({ type: 'info', text1: 'Voice input is available on the web version.', position: 'top' });
            return;
        }
        const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
        if (!SR) return;
        if (recognitionRef.current) recognitionRef.current.stop();
        const recognition = new SR();
        recognition.continuous = true;
        recognition.interimResults = true;
        recognition.lang = sinhalaMode ? 'si-LK' : 'en-US';
        recognitionRef.current = recognition;
        let accumulatedTranscript = '';
        recognition.onstart = () => { setIsListening(true); setInterimTranscript(''); };
        recognition.onresult = (e) => {
            let interim = '';
            for (let i = e.resultIndex; i < e.results.length; i++) {
                const transcript = e.results[i][0].transcript;
                if (e.results[i].isFinal) accumulatedTranscript += transcript + ' ';
                else interim += transcript;
            }
            setInterimTranscript(interim);
        };
        recognition.onend = () => {
            setIsListening(false);
            setInterimTranscript('');
            if (accumulatedTranscript.trim()) {
                const existing = contentRef.current ? contentRef.current.trim() : '';
                const newContent = existing ? `${existing}\n\n${accumulatedTranscript.trim()}` : accumulatedTranscript.trim();
                handleContentChange(newContent);
            }
        };
        recognition.start();
    }, [sinhalaMode]);

    const stopListening = () => {
        recognitionRef.current?.stop();
        setIsListening(false);
    };

    const tc = THEMES[currentTheme] || THEMES['default'];

    return (
        <LinearGradient colors={[tc.bg1, tc.bg2]} style={s.safe}>
            <SafeAreaView style={{ flex: 1 }}>
                {/* ── Top App Header ── */}
                <View style={s.header}>
                    <TouchableOpacity onPress={() => navigation.goBack()} style={s.backBtn}>
                        <Text style={[s.backIcon, { color: tc.text }]}>←</Text>
                    </TouchableOpacity>
                    <View style={s.headerCenter}>
                        <Text style={[s.headerTitle, { color: tc.text }]}>{t('AI Journal')}</Text>
                    </View>
                    <View style={s.backBtn} /> {/* Balancer */}
                </View>

                <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 40 }}>

                    {/* ── Analytics & Insights Dashboard (Dribbble Replicon) ── */}
                    <View style={s.insightSection}>
                        <View style={{ flex: 1 }}>
                            <Text style={[s.insightTitle, { color: tc.text }]}>{t('Analytics & Insights')}</Text>
                            <Text style={[s.insightSub, { color: tc.text }]}>{getGreeting()}</Text>
                        </View>
                    </View>

                    <View style={s.statsCardsRow}>
                        <LinearGradient colors={['#FF9A9E', '#FECFEF']} style={s.statCard} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}>
                            <Text style={s.statNumber}>{stats.totalJournals}</Text>
                            <Text style={s.statLabel}>{t('Total Journals')}</Text>
                        </LinearGradient>
                        <LinearGradient colors={['#fbc2eb', '#a6c1ee']} style={s.statCard} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}>
                            <Text style={s.statNumber}>{stats.totalWords}</Text>
                            <Text style={s.statLabel}>{t('Total Words')}</Text>
                        </LinearGradient>
                        <LinearGradient colors={['#84fab0', '#8fd3f4']} style={s.statCard} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}>
                            <Text style={[s.statNumber, { fontSize: 18, marginTop: 4 }]}>{currentTime}</Text>
                            <Text style={s.statLabel}>{t('Current Time')}</Text>
                        </LinearGradient>
                    </View>

                    {/* ── Calendar Strip ── */}
                    <View style={s.calendarMonthWrap}>
                        <Text style={[s.calendarMonthTitle, { color: tc.text }]}>{t(getMonthName(selectedDate))} {selectedDate.split('-')[0]}</Text>
                    </View>
                    <View style={s.calendarContainer}>
                        {[-3, -2, -1, 0, 1, 2, 3].map(offset => {
                            const d = new Date(selectedDate);
                            d.setDate(d.getDate() + offset);
                            const ds = toDateString(d);
                            const isSelected = offset === 0;
                            return (
                                <TouchableOpacity
                                    key={offset}
                                    onPress={() => setSelectedDate(ds)}
                                    style={[s.calendarDay, isSelected && [s.calendarDayActive, { backgroundColor: tc.accent }]]}
                                >
                                    <Text style={[s.calendarDayName, isSelected && { color: '#FFF' }]}>{getDayName(ds)}</Text>
                                    <Text style={[s.calendarDayNum, isSelected && { color: '#FFF' }]}>{d.getDate()}</Text>
                                    {ds === today && <View style={[s.dotIndicator, isSelected ? { backgroundColor: '#FFF' } : { backgroundColor: tc.accent }]} />}
                                </TouchableOpacity>
                            );
                        })}
                    </View>

                    {/* ── Sentiment and Date Display ── */}
                    <View style={s.sentimentRow}>
                        <View>
                            <Text style={[s.sentimentDate, { color: tc.text }]}>{formatDisplay(selectedDate)}</Text>
                            <Text style={[s.sentimentTitle, { color: tc.text }]}>{t('My mind state')}</Text>
                        </View>
                        <View style={[
                            s.sentimentPill,
                            sentiment === 'Positive Mind' ? { backgroundColor: '#dcfce7' } :
                                sentiment === 'Negative Mind' ? { backgroundColor: '#fee2e2' } :
                                    sentiment === 'Neutral Mind' ? { backgroundColor: '#f1f5f9' } : { backgroundColor: '#fff7ed' }
                        ]}>
                            <Text style={[
                                s.sentimentPillText,
                                sentiment === 'Positive Mind' ? { color: '#166534' } :
                                    sentiment === 'Negative Mind' ? { color: '#991b1b' } :
                                        sentiment === 'Neutral Mind' ? { color: '#475569' } : { color: '#9a3412' }
                            ]}>{sentiment}</Text>
                        </View>
                    </View>

                    {/* ── Emotional Landscape (Mood) ── */}
                    <View style={[s.moodCard, { backgroundColor: 'rgba(255,255,255,0.7)' }]}>
                        <Text style={[s.moodTitle, { color: tc.text }]}>{t('Emotional Landscape')}</Text>
                        <Text style={[s.moodSub, { color: tc.text }]}>{t('How are you feeling today? Tap to log it.')}</Text>
                        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={s.moodScroll}>
                            {MOODS.map(m => (
                                <TouchableOpacity
                                    key={m}
                                    onPress={() => changeMood(m)}
                                    style={[s.moodIconBox, mood === m && { backgroundColor: tc.bg1, borderColor: tc.accent, borderWidth: 2 }]}
                                >
                                    <Text style={s.moodEmoji}>{m}</Text>
                                </TouchableOpacity>
                            ))}
                        </ScrollView>
                    </View>

                    {/* ── Editor Card ── */}
                    <View style={[s.editorCard, { backgroundColor: tc.card, shadowColor: tc.accent }]}>

                        <View style={s.toolbar}>
                            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={s.themeSelector}>
                                {Object.keys(THEMES).map(t => (
                                    <TouchableOpacity
                                        key={t}
                                        onPress={() => changeTheme(t)}
                                        style={[s.themeCircle, { backgroundColor: THEMES[t].accent, borderWidth: currentTheme === t ? 2 : 0, borderColor: '#111827' }]}
                                    />
                                ))}
                            </ScrollView>
                            <View style={s.toolbarRight}>
                                {saveStatus === 'saving' && <ActivityIndicator color={tc.accent} size="small" />}
                                {saveStatus === 'saved' && <Text style={{ fontSize: 10, color: '#10B981' }}>Saved</Text>}
                                <TouchableOpacity onPress={toggleLock} style={[s.iconBox, isLocked && { backgroundColor: '#FEE2E2' }]}>
                                    <Text style={s.iconText}>{isLocked ? '🔒' : '🔓'}</Text>
                                </TouchableOpacity>
                                <TouchableOpacity onPress={() => {
                                    const isSi = !sinhalaMode;
                                    setSinhalaMode(isSi);
                                    setShowVisualKeyboard(isSi);
                                    i18n.changeLanguage(isSi ? 'si' : 'en');
                                }} style={[s.iconBox, sinhalaMode && { backgroundColor: tc.text }]}>
                                    <Text style={[s.iconText, sinhalaMode && { color: '#FFF' }]}>{sinhalaMode ? 'සිං' : 'Abc'}</Text>
                                </TouchableOpacity>
                                <TouchableOpacity onPress={isListening ? stopListening : startListening} style={[s.iconBox, isListening && { backgroundColor: '#FEE2E2' }]}>
                                    <Text style={s.iconText}>{isListening ? '🔴' : '🎤'}</Text>
                                </TouchableOpacity>
                            </View>
                        </View>

                        {loading ? (
                            <ActivityIndicator color={tc.accent} size="large" style={{ marginVertical: 30 }} />
                        ) : !isUnlocked ? (
                            <View style={s.lockedContainer}>
                                <Text style={s.lockEmoji}>🔒</Text>
                                <Text style={s.lockedText}>{t('Locked entry.')}</Text>
                                <TouchableOpacity style={[s.unlockBtn, { backgroundColor: tc.accent }]} onPress={() => setPasswordModalVisible(true)}>
                                    <Text style={s.unlockBtnText}>{t('Unlock to Read')}</Text>
                                </TouchableOpacity>
                            </View>
                        ) : (
                            <View>
                                {media.length > 0 && (
                                    <ScrollView horizontal showsHorizontalScrollIndicator={false} style={s.mediaList}>
                                        {media.map((m, idx) => (
                                            <View key={idx} style={s.mediaItemWrapper}>
                                                {m.type === 'image' && m.url ? (
                                                    <Image source={{ uri: m.url }} style={s.mediaImagePreview} blurRadius={0} />
                                                ) : (
                                                    <View style={[s.mediaItemFallback, { backgroundColor: tc.bg1 }]}>
                                                        <Text style={s.mediaItemIcon}>
                                                            {m.type === 'video' ? '🎬' : m.type === 'audio' ? '🎵' : m.type === 'location' ? '📍' : '📄'}
                                                        </Text>
                                                        <Text style={s.mediaFallbackText} numberOfLines={1}>{m.name || 'Attachment'}</Text>
                                                    </View>
                                                )}
                                                <TouchableOpacity onPress={() => removeMedia(idx)} style={s.mediaRemove}>
                                                    <Text style={s.mediaRemoveText}>✕</Text>
                                                </TouchableOpacity>
                                            </View>
                                        ))}
                                    </ScrollView>
                                )}

                                <TextInput
                                    style={[s.textArea, { color: tc.text }]}
                                    multiline
                                    placeholder="Write your thoughts... let's begin your journey within."
                                    placeholderTextColor="#94A3B8"
                                    value={content}
                                    onChangeText={handleContentChange}
                                    textAlignVertical="top"
                                />

                                {isListening && (
                                    <View style={[s.listeningBar, { borderColor: tc.accent }]}>
                                        <Text style={[s.listeningText, { color: tc.accent }]}>Listening... {interimTranscript}</Text>
                                    </View>
                                )}

                                <View style={s.bottomActions}>
                                    <View style={s.mediaActionBar}>
                                        <TouchableOpacity onPress={() => addMedia('image')} style={s.mediaBtn}><Text style={s.mediaIcon}>🖼️</Text></TouchableOpacity>
                                        <TouchableOpacity onPress={() => addMedia('video')} style={s.mediaBtn}><Text style={s.mediaIcon}>🎬</Text></TouchableOpacity>
                                        <TouchableOpacity onPress={() => addMedia('audio')} style={s.mediaBtn}><Text style={s.mediaIcon}>🎵</Text></TouchableOpacity>
                                    </View>
                                </View>
                            </View>
                        )}
                    </View>
                </ScrollView>
            </SafeAreaView>

            <Modal visible={passwordModalVisible} transparent animationType="fade" onRequestClose={() => setPasswordModalVisible(false)}>
                <View style={s.modalOverlay}>
                    <View style={s.modalBox}>
                        <Text style={s.modalTitle}>🔒 Diary Security</Text>
                        <Text style={s.modalSubtitle}>{needsSetup ? "Create a simple password." : "Verify your identity."}</Text>
                        <TextInput style={s.modalInput} placeholder="Password" secureTextEntry value={passwordInput} onChangeText={setPasswordInput} autoFocus />
                        <View style={s.modalActions}>
                            <TouchableOpacity style={s.modalCancel} onPress={() => setPasswordModalVisible(false)}>
                                <Text style={s.modalCancelText}>Cancel</Text>
                            </TouchableOpacity>
                            <TouchableOpacity style={[s.modalConfirm, { backgroundColor: tc.accent }]} onPress={handleUnlockSubmit}>
                                <Text style={s.modalConfirmText}>{needsSetup ? "Set" : "Unlock"}</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </Modal>
            {showVisualKeyboard && <SinhalaKeyboard onKeyPress={handleVisualKeyPress} onClose={() => setShowVisualKeyboard(false)} />}
            <Toast />
        </LinearGradient>
    );
}

const s = StyleSheet.create({
    safe: { flex: 1 },
    header: { paddingHorizontal: 20, paddingTop: 16, paddingBottom: 10, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
    backBtn: { padding: 8, width: 44, alignItems: 'center', justifyContent: 'center' },
    backIcon: { fontSize: 32, fontWeight: '900' },
    headerCenter: { flex: 1, alignItems: 'center' },
    headerTitle: { fontSize: 20, fontWeight: '800', fontFamily: Platform.OS === 'ios' ? 'San Francisco' : 'sans-serif' },

    insightSection: { marginTop: 10, marginBottom: 16 },
    insightTitle: { fontSize: 22, fontWeight: '800' },
    insightSub: { fontSize: 13, opacity: 0.6, marginTop: 4, fontWeight: '500' },

    statsCardsRow: { flexDirection: 'row', gap: 10, marginBottom: 24 },
    statCard: { flex: 1, paddingVertical: 18, paddingHorizontal: 12, borderRadius: 24, alignItems: 'center', elevation: 3, shadowColor: '#000', shadowOpacity: 0.1, shadowRadius: 10, shadowOffset: { height: 5, width: 0 } },
    statNumber: { fontSize: 24, fontWeight: '900', color: '#FFF' },
    statLabel: { fontSize: 11, color: '#FFF', fontWeight: '700', marginTop: 4, textAlign: 'center' },

    calendarMonthWrap: { alignItems: 'center', marginBottom: 12 },
    calendarMonthTitle: { fontSize: 18, fontWeight: '800', letterSpacing: 0.5 },
    calendarContainer: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 24 },
    calendarDay: { paddingVertical: 12, width: 44, borderRadius: 22, alignItems: 'center', backgroundColor: 'rgba(255,255,255,0.4)' },
    calendarDayActive: { shadowColor: '#A855F7', shadowOpacity: 0.3, shadowRadius: 10, elevation: 5 },
    calendarDayName: { fontSize: 11, fontWeight: '700', color: '#64748B' },
    calendarDayNum: { fontSize: 16, fontWeight: '800', color: '#1E293B', marginTop: 4 },
    dotIndicator: { width: 4, height: 4, borderRadius: 2, marginTop: 4 },

    sentimentRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20, paddingHorizontal: 4 },
    sentimentDate: { fontSize: 13, fontWeight: '600', opacity: 0.6 },
    sentimentTitle: { fontSize: 18, fontWeight: '800', marginTop: 2 },
    sentimentPill: { paddingHorizontal: 14, paddingVertical: 8, borderRadius: 20 },
    sentimentPillText: { fontSize: 13, fontWeight: '800' },

    moodCard: { borderRadius: 28, padding: 20, marginBottom: 20 },
    moodTitle: { fontSize: 16, fontWeight: '800' },
    moodSub: { fontSize: 12, opacity: 0.6, marginTop: 4, marginBottom: 12 },
    moodScroll: { flexDirection: 'row', gap: 12 },
    moodIconBox: { width: 44, height: 44, borderRadius: 22, backgroundColor: '#FFF', alignItems: 'center', justifyContent: 'center', elevation: 2, shadowOpacity: 0.05 },
    moodEmoji: { fontSize: 22 },

    editorCard: { borderRadius: 32, padding: 24, shadowOpacity: 0.05, shadowRadius: 20, elevation: 3, minHeight: 400 },
    toolbar: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 },
    themeSelector: { flex: 1, marginRight: 16 },
    themeCircle: { width: 22, height: 22, borderRadius: 11, marginRight: 8 },
    toolbarRight: { flexDirection: 'row', gap: 8, alignItems: 'center' },
    iconBox: { width: 36, height: 36, backgroundColor: '#F1F5F9', borderRadius: 14, alignItems: 'center', justifyContent: 'center' },
    iconText: { fontSize: 14, fontWeight: '800', color: '#475569' },

    lockedContainer: { alignItems: 'center', justifyContent: 'center', marginTop: 40 },
    lockEmoji: { fontSize: 40, marginBottom: 16 },
    lockedText: { fontSize: 16, color: '#64748B', marginBottom: 24, fontWeight: '600' },
    unlockBtn: { paddingHorizontal: 24, paddingVertical: 14, borderRadius: 20 },
    unlockBtnText: { color: '#FFF', fontWeight: 'bold', fontSize: 15 },

    mediaList: { flexDirection: 'row', marginBottom: 16, maxHeight: 90 },
    mediaItemWrapper: { marginRight: 12, position: 'relative' },
    mediaImagePreview: { width: 80, height: 80, borderRadius: 16 },
    mediaItemFallback: { width: 80, height: 80, borderRadius: 16, alignItems: 'center', justifyContent: 'center', padding: 8 },
    mediaItemIcon: { fontSize: 24, marginBottom: 4 },
    mediaFallbackText: { fontSize: 10, color: '#64748B', textAlign: 'center' },
    mediaRemove: { position: 'absolute', top: -6, right: -6, backgroundColor: '#EF4444', width: 22, height: 22, borderRadius: 11, alignItems: 'center', justifyContent: 'center', borderWidth: 2, borderColor: '#FFF', zIndex: 5 },
    mediaRemoveText: { color: '#FFF', fontSize: 10, fontWeight: 'bold' },

    textArea: { flex: 1, fontSize: 16, lineHeight: 26, minHeight: 200 },
    listeningBar: { backgroundColor: '#F8FAFC', padding: 12, borderRadius: 16, borderWidth: 1, marginBottom: 16 },
    listeningText: { fontSize: 14, fontWeight: '600', fontStyle: 'italic' },

    bottomActions: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingTop: 16, borderTopWidth: 1, borderTopColor: 'rgba(0,0,0,0.05)' },
    mediaActionBar: { flexDirection: 'row', gap: 10 },
    mediaBtn: { padding: 8, backgroundColor: '#F8FAFC', borderRadius: 12 },
    mediaIcon: { fontSize: 20 },

    modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', alignItems: 'center', justifyContent: 'center' },
    modalBox: { backgroundColor: '#FFF', borderRadius: 32, padding: 28, width: 320 },
    modalTitle: { fontSize: 20, fontWeight: '800', color: '#1E293B', marginBottom: 8 },
    modalSubtitle: { fontSize: 14, color: '#64748B', marginBottom: 20 },
    modalInput: { backgroundColor: '#F1F5F9', borderRadius: 16, padding: 16, fontSize: 16, marginBottom: 24 },
    modalActions: { flexDirection: 'row', justifyContent: 'flex-end', gap: 12 },
    modalCancel: { paddingHorizontal: 16, paddingVertical: 12 },
    modalCancelText: { color: '#64748B', fontWeight: '700', fontSize: 15 },
    modalConfirm: { paddingHorizontal: 24, paddingVertical: 12, borderRadius: 16 },
    modalConfirmText: { color: '#FFF', fontWeight: '800', fontSize: 15 },
});
