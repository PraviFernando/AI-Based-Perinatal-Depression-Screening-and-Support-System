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
    FlatList,
    Modal,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Toast from 'react-native-toast-message';
import api from '../services/api';

// ─── helpers ────────────────────────────────────────────────────────────────
const toDateString = (d) => {
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${y}-${m}-${day}`;
};

const formatDisplay = (dateStr) => {
    const [y, m, d] = dateStr.split('-');
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    return `${months[parseInt(m, 10) - 1]} ${d}, ${y}`;
};

const today = toDateString(new Date());

// ─── component ───────────────────────────────────────────────────────────────
export default function DiaryScreen({ navigation }) {
    const [selectedDate, setSelectedDate] = useState(today);
    const [content, setContent] = useState('');
    const [saveStatus, setSaveStatus] = useState('idle'); // idle | saving | saved | error
    const [loading, setLoading] = useState(false);
    const [allDates, setAllDates] = useState([]);
    const [searchDate, setSearchDate] = useState('');
    const [searchModalVisible, setSearchModalVisible] = useState(false);
    const [isListening, setIsListening] = useState(false);
    const [voiceSupported, setVoiceSupported] = useState(false);
    const [interimTranscript, setInterimTranscript] = useState('');

    const debounceRef = useRef(null);
    const recognitionRef = useRef(null);
    const contentRef = useRef('');

    // Keep ref in sync for event handlers
    useEffect(() => {
        contentRef.current = content;
    }, [content]);

    // ── check voice support (Web Speech API) ──────────────────────────────────
    useEffect(() => {
        if (Platform.OS === 'web') {
            const hasVoice =
                typeof window !== 'undefined' &&
                (window.SpeechRecognition || window.webkitSpeechRecognition);
            setVoiceSupported(!!hasVoice);
        }
    }, []);

    // ── load diary entry whenever selected date changes ────────────────────────
    useEffect(() => {
        loadEntry(selectedDate);
    }, [selectedDate]);

    // ── load list of all dates with entries ───────────────────────────────────
    useEffect(() => {
        loadAllDates();
    }, []);

    const loadEntry = async (date) => {
        setLoading(true);
        setSaveStatus('idle');
        try {
            const res = await api.get(`/diary/${date}`);
            setContent(res.data?.content || '');
        } catch (err) {
            setContent('');
            if (err.response?.status !== 404) {
                Toast.show({ type: 'error', text1: 'Load Failed', text2: 'Could not load diary entry.', position: 'top' });
            }
        } finally {
            setLoading(false);
        }
    };

    const loadAllDates = async () => {
        try {
            const res = await api.get('/diary');
            setAllDates(res.data || []);
        } catch (_) { }
    };

    // ── debounced auto-save ───────────────────────────────────────────────────
    const handleContentChange = (text) => {
        setContent(text);
        setSaveStatus('saving');

        if (debounceRef.current) clearTimeout(debounceRef.current);
        debounceRef.current = setTimeout(() => {
            saveDiary(text);
        }, 1500);
    };

    const saveDiary = async (text) => {
        try {
            await api.post('/diary', { date: selectedDate, content: text });
            setSaveStatus('saved');
            loadAllDates(); // refresh side list
            setTimeout(() => setSaveStatus('idle'), 2500);
        } catch (err) {
            setSaveStatus('error');
            Toast.show({ type: 'error', text1: 'Auto-save Failed', text2: 'Could not save entry.', position: 'top' });
        }
    };

    // ── manual save ──────────────────────────────────────────────────────────
    const handleManualSave = async () => {
        setSaveStatus('saving');
        await saveDiary(content);
        Toast.show({ type: 'success', text1: '📔 Diary Saved', text2: `Entry for ${formatDisplay(selectedDate)} saved!`, position: 'top' });
    };

    // ── date navigation ───────────────────────────────────────────────────────
    const goDay = (delta) => {
        const d = new Date(selectedDate);
        d.setDate(d.getDate() + delta);
        setSelectedDate(toDateString(d));
    };

    // ── search ────────────────────────────────────────────────────────────────
    const handleSearch = () => {
        if (!searchDate.match(/^\d{4}-\d{2}-\d{2}$/)) {
            Toast.show({ type: 'error', text1: 'Invalid Date', text2: 'Use format YYYY-MM-DD', position: 'top' });
            return;
        }
        setSelectedDate(searchDate);
        setSearchDate('');
        setSearchModalVisible(false);
    };

    // ── voice recognition (Web Speech API) ───────────────────────────────────
    const startListening = useCallback(() => {
        if (Platform.OS !== 'web') {
            Toast.show({ type: 'info', text1: 'Voice', text2: 'Voice input is available on the web version.', position: 'top' });
            return;
        }

        const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
        if (!SR) {
            Toast.show({ type: 'error', text1: 'Not Supported', text2: 'Your browser does not support voice recognition.', position: 'top' });
            return;
        }

        if (recognitionRef.current) {
            recognitionRef.current.stop();
        }

        const recognition = new SR();
        recognition.continuous = true;
        recognition.interimResults = true;
        recognition.lang = 'en-US';
        recognitionRef.current = recognition;

        let accumulatedTranscript = '';

        recognition.onstart = () => {
            setIsListening(true);
            setInterimTranscript('');
        };

        recognition.onresult = (e) => {
            let interim = '';
            for (let i = e.resultIndex; i < e.results.length; i++) {
                const transcript = e.results[i][0].transcript;
                if (e.results[i].isFinal) {
                    accumulatedTranscript += transcript + ' ';
                } else {
                    interim += transcript;
                }
            }
            setInterimTranscript(interim);
        };

        recognition.onend = () => {
            setIsListening(false);
            setInterimTranscript('');
            if (accumulatedTranscript.trim()) {
                const existing = contentRef.current ? contentRef.current.trim() : '';
                const newContent = existing
                    ? `${existing}\n\n${accumulatedTranscript.trim()}`
                    : accumulatedTranscript.trim();
                handleContentChange(newContent);
                Toast.show({ type: 'success', text1: '🎤 Voice Added', text2: 'Transcript appended to diary.', position: 'top' });
            }
        };

        recognition.onerror = (e) => {
            setIsListening(false);
            setInterimTranscript('');
            if (e.error !== 'no-speech') {
                Toast.show({ type: 'error', text1: 'Voice Error', text2: e.error || 'Recognition failed.', position: 'top' });
            }
        };

        recognition.start();
    }, []);

    const stopListening = () => {
        recognitionRef.current?.stop();
        setIsListening(false);
    };

    // ── save status badge ─────────────────────────────────────────────────────
    const statusConfig = {
        idle: { label: '', color: 'transparent' },
        saving: { label: '⏳ Saving…', color: '#F59E0B' },
        saved: { label: '✅ Saved', color: '#10B981' },
        error: { label: '❌ Error', color: '#EF4444' },
    };
    const status = statusConfig[saveStatus];

    // ─── render ───────────────────────────────────────────────────────────────
    return (
        <SafeAreaView style={s.safe}>
            {/* ── Header ── */}
            <View style={s.header}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={s.backBtn}>
                    <Text style={s.backIcon}>←</Text>
                </TouchableOpacity>
                <View style={s.headerCenter}>
                    <Text style={s.headerEmoji}>📔</Text>
                    <Text style={s.headerTitle}>My Diary</Text>
                </View>
                <TouchableOpacity onPress={() => setSearchModalVisible(true)} style={s.searchBtn}>
                    <Text style={s.searchIcon}>🔍</Text>
                </TouchableOpacity>
            </View>

            <View style={s.body}>
                {/* ── Date Strip ── */}
                <View style={s.dateStrip}>
                    <TouchableOpacity onPress={() => goDay(-1)} style={s.arrowBtn}>
                        <Text style={s.arrowText}>‹</Text>
                    </TouchableOpacity>
                    <View style={s.dateCenter}>
                        <Text style={s.dateLabel}>{formatDisplay(selectedDate)}</Text>
                        {selectedDate === today && (
                            <View style={s.todayBadge}><Text style={s.todayBadgeText}>Today</Text></View>
                        )}
                    </View>
                    <TouchableOpacity
                        onPress={() => goDay(1)}
                        style={[s.arrowBtn, selectedDate === today && s.arrowDisabled]}
                        disabled={selectedDate === today}
                    >
                        <Text style={[s.arrowText, selectedDate === today && { color: '#D1D5DB' }]}>›</Text>
                    </TouchableOpacity>
                </View>

                {/* ── Editor + Side Panel ── */}
                <View style={s.editorRow}>
                    {/* Text Area */}
                    <View style={s.editorCard}>
                        {/* Toolbar */}
                        <View style={s.toolbar}>
                            <Text style={s.toolbarTitle}>Write your thoughts…</Text>
                            <View style={s.toolbarRight}>
                                {saveStatus !== 'idle' && (
                                    <Text style={[s.statusBadge, { color: status.color }]}>{status.label}</Text>
                                )}
                                {/* Voice button */}
                                <TouchableOpacity
                                    onPress={isListening ? stopListening : startListening}
                                    style={[s.voiceBtn, isListening && s.voiceBtnActive]}
                                >
                                    <Text style={s.voiceIcon}>{isListening ? '🔴' : '🎤'}</Text>
                                </TouchableOpacity>
                            </View>
                        </View>

                        {loading ? (
                            <ActivityIndicator color={PURPLE} size="large" style={{ flex: 1 }} />
                        ) : (
                            <TextInput
                                style={s.textArea}
                                multiline
                                placeholder={`How are you feeling today?\n\nWrite as much or as little as you like. Your thoughts are saved automatically as you type.`}
                                placeholderTextColor="#9CA3AF"
                                value={content}
                                onChangeText={handleContentChange}
                                textAlignVertical="top"
                            />
                        )}

                        {/* Action Bar */}
                        <View style={s.actionBar}>
                            <Text style={s.wordCount}>{content.trim().split(/\s+/).filter(Boolean).length} words</Text>
                            <TouchableOpacity style={s.saveBtn} onPress={handleManualSave} disabled={saveStatus === 'saving'}>
                                {saveStatus === 'saving'
                                    ? <ActivityIndicator color="#fff" size="small" />
                                    : <Text style={s.saveBtnText}>Save Entry</Text>
                                }
                            </TouchableOpacity>
                        </View>

                        {isListening && (
                            <View style={s.listeningBar}>
                                <View style={s.listeningTop}>
                                    <Text style={s.listeningText}>🎤 Listening… speak now</Text>
                                    <TouchableOpacity onPress={stopListening}>
                                        <Text style={s.stopText}>Done</Text>
                                    </TouchableOpacity>
                                </View>
                                {interimTranscript ? (
                                    <Text style={s.interimText}>"{interimTranscript}..."</Text>
                                ) : (
                                    <Text style={s.interimPlaceholder}>Waiting for speech...</Text>
                                )}
                            </View>
                        )}
                    </View>

                    {/* Past Entries Side Panel */}
                    <View style={s.sidePanel}>
                        <Text style={s.sidePanelTitle}>Past Entries</Text>
                        {allDates.length === 0 ? (
                            <Text style={s.noPastText}>No past entries yet.</Text>
                        ) : (
                            <FlatList
                                data={allDates}
                                keyExtractor={(item) => item.date}
                                showsVerticalScrollIndicator={false}
                                renderItem={({ item }) => (
                                    <TouchableOpacity
                                        onPress={() => setSelectedDate(item.date)}
                                        style={[
                                            s.pastItem,
                                            item.date === selectedDate && s.pastItemActive,
                                        ]}
                                    >
                                        <Text style={[s.pastItemDate, item.date === selectedDate && { color: PURPLE }]}>
                                            {formatDisplay(item.date)}
                                        </Text>
                                        {item.date === today && (
                                            <Text style={s.pastTodayDot}>●</Text>
                                        )}
                                    </TouchableOpacity>
                                )}
                            />
                        )}
                    </View>
                </View>
            </View>

            {/* ── Search Modal ── */}
            <Modal
                visible={searchModalVisible}
                transparent
                animationType="fade"
                onRequestClose={() => setSearchModalVisible(false)}
            >
                <View style={s.modalOverlay}>
                    <View style={s.modalBox}>
                        <Text style={s.modalTitle}>🔍 Search by Date</Text>
                        <Text style={s.modalSubtitle}>Enter a date to view that diary entry</Text>
                        <TextInput
                            style={s.modalInput}
                            placeholder="YYYY-MM-DD  (e.g. 2026-01-15)"
                            placeholderTextColor="#9CA3AF"
                            value={searchDate}
                            onChangeText={setSearchDate}
                            keyboardType="numeric"
                        />
                        <View style={s.modalActions}>
                            <TouchableOpacity
                                style={s.modalCancelBtn}
                                onPress={() => setSearchModalVisible(false)}
                            >
                                <Text style={s.modalCancelText}>Cancel</Text>
                            </TouchableOpacity>
                            <TouchableOpacity style={s.modalSearchBtn} onPress={handleSearch}>
                                <Text style={s.modalSearchText}>Go</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </Modal>

            <Toast />
        </SafeAreaView>
    );
}

// ─── styles ──────────────────────────────────────────────────────────────────
const PURPLE = '#7C3AED';
const BG = '#F3F4F6';
const WHITE = '#FFFFFF';

const s = StyleSheet.create({
    safe: { flex: 1, backgroundColor: BG },

    // Header
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: WHITE,
        paddingHorizontal: 16,
        paddingVertical: 14,
        elevation: 4,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.08,
        shadowRadius: 4,
    },
    backBtn: { padding: 8 },
    backIcon: { fontSize: 22, color: PURPLE, fontWeight: 'bold' },
    headerCenter: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6 },
    headerEmoji: { fontSize: 22 },
    headerTitle: { fontSize: 18, fontWeight: '800', color: PURPLE },
    searchBtn: { padding: 8 },
    searchIcon: { fontSize: 20 },

    // Body
    body: { flex: 1, padding: 14 },

    // Date Strip
    dateStrip: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: WHITE,
        borderRadius: 16,
        paddingVertical: 10,
        paddingHorizontal: 8,
        marginBottom: 12,
        elevation: 2,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.06,
        shadowRadius: 3,
    },
    arrowBtn: { padding: 10 },
    arrowDisabled: { opacity: 0.3 },
    arrowText: { fontSize: 28, color: PURPLE, fontWeight: '300' },
    dateCenter: { flex: 1, alignItems: 'center', flexDirection: 'row', justifyContent: 'center', gap: 8 },
    dateLabel: { fontSize: 16, fontWeight: '700', color: '#111827' },
    todayBadge: { backgroundColor: PURPLE, borderRadius: 10, paddingHorizontal: 8, paddingVertical: 2 },
    todayBadgeText: { color: WHITE, fontSize: 10, fontWeight: '700' },

    // Editor Row
    editorRow: { flex: 1, flexDirection: 'row', gap: 12 },

    // Editor Card
    editorCard: {
        flex: 1,
        backgroundColor: WHITE,
        borderRadius: 18,
        padding: 14,
        elevation: 2,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.06,
        shadowRadius: 3,
    },
    toolbar: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: 10,
        paddingBottom: 10,
        borderBottomWidth: 1,
        borderBottomColor: '#F3F4F6',
    },
    toolbarTitle: { fontSize: 12, color: '#9CA3AF', fontWeight: '600' },
    toolbarRight: { flexDirection: 'row', alignItems: 'center', gap: 8 },
    statusBadge: { fontSize: 12, fontWeight: '700' },
    voiceBtn: {
        backgroundColor: '#F3F4F6',
        borderRadius: 20,
        width: 36,
        height: 36,
        alignItems: 'center',
        justifyContent: 'center',
    },
    voiceBtnActive: { backgroundColor: '#FEE2E2' },
    voiceIcon: { fontSize: 18 },
    textArea: {
        flex: 1,
        fontSize: 15,
        color: '#111827',
        lineHeight: 24,
        textAlignVertical: 'top',
    },
    actionBar: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingTop: 10,
        borderTopWidth: 1,
        borderTopColor: '#F3F4F6',
        marginTop: 6,
    },
    wordCount: { fontSize: 12, color: '#9CA3AF' },
    saveBtn: {
        backgroundColor: PURPLE,
        paddingHorizontal: 18,
        paddingVertical: 8,
        borderRadius: 10,
        elevation: 2,
        shadowColor: PURPLE,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.3,
        shadowRadius: 4,
        minWidth: 90,
        alignItems: 'center',
    },
    saveBtnText: { color: WHITE, fontWeight: '700', fontSize: 13 },
    listeningBar: {
        backgroundColor: '#F5F3FF',
        borderRadius: 14,
        padding: 12,
        marginTop: 10,
        borderWidth: 1.5,
        borderColor: '#DDD6FE',
    },
    listeningTop: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: 8,
    },
    listeningText: { fontSize: 13, color: PURPLE, fontWeight: '700' },
    stopText: { fontSize: 13, color: '#EF4444', fontWeight: '800' },
    interimText: { fontSize: 14, color: '#4B5563', fontStyle: 'italic', lineHeight: 20 },
    interimPlaceholder: { fontSize: 13, color: '#9CA3AF', fontStyle: 'italic' },

    // Side Panel
    sidePanel: {
        width: 140,
        backgroundColor: WHITE,
        borderRadius: 18,
        padding: 12,
        elevation: 2,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.06,
        shadowRadius: 3,
    },
    sidePanelTitle: { fontSize: 11, fontWeight: '800', color: '#6B7280', marginBottom: 10, textTransform: 'uppercase', letterSpacing: 0.5 },
    noPastText: { fontSize: 12, color: '#9CA3AF', textAlign: 'center', marginTop: 16 },
    pastItem: {
        paddingVertical: 8,
        paddingHorizontal: 6,
        borderRadius: 8,
        marginBottom: 4,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
    },
    pastItemActive: { backgroundColor: '#EDE9FE' },
    pastItemDate: { fontSize: 11, color: '#374151', fontWeight: '600', flex: 1 },
    pastTodayDot: { color: PURPLE, fontSize: 8 },

    // Search Modal
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.45)',
        alignItems: 'center',
        justifyContent: 'center',
    },
    modalBox: {
        backgroundColor: WHITE,
        borderRadius: 20,
        padding: 24,
        width: 320,
        elevation: 16,
    },
    modalTitle: { fontSize: 18, fontWeight: '800', color: '#111827', marginBottom: 4 },
    modalSubtitle: { fontSize: 13, color: '#6B7280', marginBottom: 16 },
    modalInput: {
        borderWidth: 1.5,
        borderColor: '#E5E7EB',
        borderRadius: 12,
        padding: 12,
        fontSize: 15,
        color: '#111827',
        backgroundColor: '#F9FAFB',
        marginBottom: 16,
    },
    modalActions: { flexDirection: 'row', justifyContent: 'flex-end', gap: 10 },
    modalCancelBtn: { paddingHorizontal: 16, paddingVertical: 10 },
    modalCancelText: { color: '#6B7280', fontWeight: '600', fontSize: 14 },
    modalSearchBtn: {
        backgroundColor: PURPLE,
        paddingHorizontal: 24,
        paddingVertical: 10,
        borderRadius: 10,
    },
    modalSearchText: { color: WHITE, fontWeight: '700', fontSize: 14 },
});
