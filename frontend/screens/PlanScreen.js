import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import {
    View, Text, TextInput, TouchableOpacity, StyleSheet,
    ScrollView, ActivityIndicator, Modal, FlatList, Alert, Dimensions
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Toast from 'react-native-toast-message';
import { LinearGradient } from 'expo-linear-gradient';
import api from '../services/api';
import { useTranslation } from 'react-i18next';
import SinhalaKeyboard from '../components/SinhalaKeyboard';
import { transliterate } from '../services/sinhalaTransliteration';

// ─────────────────────────────────────────────────────────────────────────────
// CONSTANTS
// ─────────────────────────────────────────────────────────────────────────────
const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'];
const DAYS_SHORT = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'];

const DEFAULT_ACTIVITIES = [
    // Morning
    { id: 'a1', name: 'Gentle Stretching / Yoga', timeOfDay: 'Morning', icon: '🧘‍♀️', suggestedMin: 12, useTimer: true, description: '10–15 min · Improves blood flow and reduces tension', color: '#10B981' },
    { id: 'a2', name: 'Meditation / Deep Breathing', timeOfDay: 'Morning', icon: '🌬️', suggestedMin: 7, useTimer: true, description: '5–10 min · Promotes calmness and mental clarity', color: '#7C3AED' },
    { id: 'a3', name: 'Healthy Breakfast', timeOfDay: 'Morning', icon: '🥗', suggestedMin: 20, useTimer: false, description: 'Fruits, whole grains & protein for energy', color: '#F59E0B' },
    // Midday
    { id: 'a4', name: 'Short Walk Outside', timeOfDay: 'Midday', icon: '🚶‍♀️', suggestedMin: 17, useTimer: true, description: '15–20 min · Sunlight boosts vitamin D & mood', color: '#0EA5E9' },
    { id: 'a5', name: 'Social Connection', timeOfDay: 'Midday', icon: '💬', suggestedMin: 20, useTimer: false, description: 'Talk with a friend or family member', color: '#EC4899' },
    { id: 'a6', name: 'Light Hobby', timeOfDay: 'Midday', icon: '🎨', suggestedMin: 30, useTimer: true, description: 'Drawing, journaling, knitting, or reading', color: '#F97316' },
    // Afternoon
    { id: 'a7', name: 'Prenatal Yoga / Swimming', timeOfDay: 'Afternoon', icon: '🏊‍♀️', suggestedMin: 30, useTimer: true, description: 'Gentle exercise or stretching', color: '#06B6D4' },
    { id: 'a8', name: 'Mindfulness Break', timeOfDay: 'Afternoon', icon: '🌸', suggestedMin: 10, useTimer: true, description: 'Relax and focus on the present moment', color: '#8B5CF6' },
    // Night
    { id: 'a9', name: 'Relaxation Routine', timeOfDay: 'Night', icon: '🛁', suggestedMin: 20, useTimer: false, description: 'Warm bath, soothing music or aromatherapy', color: '#6366F1' },
    { id: 'a10', name: 'Good Sleep Habits', timeOfDay: 'Night', icon: '😴', suggestedMin: 0, useTimer: false, description: 'Same bedtime · Reduce screen time before sleep', color: '#1D4ED8' },
];

const TIME_SECTIONS = [
    { key: 'Morning', label: '🌅 Morning', bg: '#FFFBEB', accent: '#F59E0B' },
    { key: 'Midday', label: '☀️ Midday', bg: '#F0F9FF', accent: '#0EA5E9' },
    { key: 'Afternoon', label: '🌤️ Afternoon', bg: '#F5F3FF', accent: '#8B5CF6' },
    { key: 'Night', label: '🌙 Night', bg: '#EFF6FF', accent: '#1D4ED8' },
];

const ICON_OPTIONS = ['🧘', '🏃', '🎨', '📚', '💬', '🥗', '🛁', '😴', '🌸', '💊', '🎵', '🌳', '✍️', '🧶', '☕', '🏊', '🌬️', '🧹', '🌻', '💆'];

const toDateStr = (y, m, d) =>
    `${y}-${String(m).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
const todayStr = toDateStr(new Date().getFullYear(), new Date().getMonth() + 1, new Date().getDate());
const firstDay = (y, m) => new Date(y, m - 1, 1).getDay();
const daysInMo = (y, m) => new Date(y, m, 0).getDate();
const formatTime = (s) => `${String(Math.floor(s / 60)).padStart(2, '0')}:${String(s % 60).padStart(2, '0')}`;

// ─────────────────────────────────────────────────────────────────────────────
// MAIN COMPONENT
// ─────────────────────────────────────────────────────────────────────────────
export default function PlanScreen({ navigation }) {
    const { t, i18n } = useTranslation();
    const now = new Date();
    const [year, setYear] = useState(now.getFullYear());
    const [month, setMonth] = useState(now.getMonth() + 1);
    const [selectedDate, setSelectedDate] = useState(todayStr);
    const [showFullCalendar, setShowFullCalendar] = useState(false);

    const [monthRecords, setMonthRecords] = useState([]);
    const [dayRecords, setDayRecords] = useState([]);
    const [loadingDay, setLoadingDay] = useState(false);
    const [savingId, setSavingId] = useState(null);

    // Timer
    const timerRef = useRef(null);
    const [timer, setTimer] = useState({ visible: false, activity: null, seconds: 0, running: false });

    // Sinhala modes
    const [sinhalaMode, setSinhalaMode] = useState(false);
    const [showVisualKeyboard, setShowVisualKeyboard] = useState(false);

    // Custom activity modal
    const [showCustomModal, setShowCustomModal] = useState(false);
    const [customForm, setCustomForm] = useState({
        name: '', nameDesc: '', icon: '🌟', timeOfDay: 'Morning', useTimer: false,
    });
    const [savingCustom, setSavingCustom] = useState(false);
    const [customNameSinhalaMode, setCustomNameSinhalaMode] = useState(false);
    const [customDescSinhalaMode, setCustomDescSinhalaMode] = useState(false);
    const [activeField, setActiveField] = useState(null); // 'name' | 'desc'

    // ── Load month data (for calendar colors) ────────────────────────────────
    const loadMonthData = useCallback(async () => {
        try {
            const res = await api.get(`/plan/activity/month/${year}/${month}`);
            setMonthRecords(res.data || []);
        } catch (_) { }
    }, [year, month]);

    // ── Load day data ─────────────────────────────────────────────────────────
    const loadDayData = useCallback(async (date) => {
        setLoadingDay(true);
        try {
            const res = await api.get(`/plan/activity/date/${date}`);
            setDayRecords(res.data || []);
        } catch (_) {
            setDayRecords([]);
        } finally {
            setLoadingDay(false);
        }
    }, []);

    useEffect(() => { loadMonthData(); }, [loadMonthData]);
    useEffect(() => { loadDayData(selectedDate); }, [loadDayData, selectedDate]);

    // Cleanup timer on unmount
    useEffect(() => () => { if (timerRef.current) clearInterval(timerRef.current); }, []);

    // ── Merged activities (defaults + saved records) ─────────────────
    const mergedActivities = useMemo(() => {
        const defaults = DEFAULT_ACTIVITIES.map(act => {
            const rec = dayRecords.find(r => r.activityId === act.id);
            return { ...act, _recId: rec?._id || null, completed: rec?.completed || false, timerSeconds: rec?.timerSeconds || 0, isCustom: false };
        });
        // Append custom activities saved for this day
        const customs = dayRecords
            .filter(r => r.isCustom)
            .map(r => ({
                id: r.activityId,
                name: r.activityName,
                timeOfDay: r.timeOfDay,
                icon: r.icon || '🌟',
                suggestedMin: 0,
                useTimer: false,
                description: r.note || '',
                color: '#9C27B0',
                _recId: r._id,
                completed: r.completed,
                timerSeconds: r.timerSeconds || 0,
                isCustom: true,
            }));
        return [...defaults, ...customs];
    }, [dayRecords]);

    // ── Calendar completion map ───────────────────────────────────────────────
    const completionByDate = useMemo(() => {
        const map = {};
        monthRecords.forEach(r => {
            const ds = r.date;
            if (!map[ds]) {
                map[ds] = { completed: 0, customs: 0 };
            }
            if (r.completed) map[ds].completed++;
            if (r.isCustom) map[ds].customs++;
        });
        // Convert to final structure with total
        const finalMap = {};
        Object.keys(map).forEach(ds => {
            finalMap[ds] = {
                completed: map[ds].completed,
                total: DEFAULT_ACTIVITIES.length + map[ds].customs
            };
        });
        return finalMap;
    }, [monthRecords]);

    const getDayStatus = (dateStr) => {
        const d = completionByDate[dateStr];
        const total = d ? d.total : DEFAULT_ACTIVITIES.length;
        if (!d || total === 0) return 'none';
        const pct = d.completed / total;
        if (pct >= 0.8) return 'great';
        if (pct >= 0.4) return 'good';
        return 'started';
    };

    const dayTotals = useMemo(() => {
        const all = mergedActivities;
        return { total: all.length, done: all.filter(a => a.completed).length };
    }, [mergedActivities]);

    // ── Toggle activity completion ────────────────────────────────────────────
    const toggleActivity = async (activity) => {
        const newCompleted = !activity.completed;
        setSavingId(activity.id);

        // Optimistic update
        setDayRecords(prev => {
            const exists = prev.find(r => r.activityId === activity.id);
            if (exists) return prev.map(r => r.activityId === activity.id ? { ...r, completed: newCompleted } : r);
            return [...prev, {
                activityId: activity.id, activityName: activity.name, timeOfDay: activity.timeOfDay,
                icon: activity.icon, completed: newCompleted, timerSeconds: 0, isCustom: !!activity.isCustom, date: selectedDate
            }];
        });

        try {
            await api.post('/plan/activity', {
                date: selectedDate, activityId: activity.id, activityName: activity.name,
                timeOfDay: activity.timeOfDay, icon: activity.icon, completed: newCompleted,
                timerSeconds: activity.timerSeconds || 0, isCustom: !!activity.isCustom,
            });
            loadMonthData();
        } catch (err) {
            // Revert
            setDayRecords(prev => prev.map(r => r.activityId === activity.id ? { ...r, completed: !newCompleted } : r));
            Toast.show({ type: 'error', text1: t('Save Failed'), text2: t('Could not update activity.'), position: 'top' });
        } finally {
            setSavingId(null);
        }
    };

    // ── Save custom activity ─────────────────────────────────────────────────
    const saveCustomActivity = async () => {
        if (!customForm.name.trim()) {
            Toast.show({ type: 'error', text1: t('Name Required'), text2: t('Please enter an activity name.'), position: 'top' });
            return;
        }
        setSavingCustom(true);
        try {
            const activityId = `custom_${Date.now()}`;
            await api.post('/plan/activity', {
                date: selectedDate,
                activityId,
                activityName: customForm.name.trim(),
                timeOfDay: customForm.timeOfDay,
                icon: customForm.icon,
                completed: false,
                timerSeconds: 0,
                isCustom: true,
                note: customForm.nameDesc.trim(),
            });
            await loadDayData(selectedDate);
            setShowCustomModal(false);
            setCustomForm({ name: '', nameDesc: '', icon: '🌟', timeOfDay: 'Morning', useTimer: false });
            setActiveField(null);
            Toast.show({ type: 'success', text1: t('Activity Added'), text2: `"${customForm.name.trim()}" ${t('added to your plan.')}`, position: 'top' });
        } catch (_) {
            Toast.show({ type: 'error', text1: t('Save Failed'), text2: t('Could not save.'), position: 'top' });
        } finally {
            setSavingCustom(false);
        }
    };

    // ── Delete custom activity ───────────────────────────────────────────────
    const deleteCustomActivity = async (activity) => {
        if (!activity._recId) return;
        try {
            await api.delete(`/plan/activity/${activity._recId}`);
            setDayRecords(prev => prev.filter(r => r._id !== activity._recId));
            Toast.show({ type: 'success', text1: t('Deleted'), text2: t('Custom activity removed.'), position: 'top' });
        } catch (_) {
            Toast.show({ type: 'error', text1: t('Delete Failed'), text2: t('Could not remove activity.'), position: 'top' });
        }
    };

    // ── Sinhala keyboard handler for custom modal fields ─────────────────────
    const handleSinhalaKey = (char) => {
        const field = activeField;
        if (!field) return;
        setCustomForm(prev => {
            const cur = prev[field];
            if (char === 'BACKSPACE') return { ...prev, [field]: cur.slice(0, -1) };
            if (char === 'SPACE') return { ...prev, [field]: cur + ' ' };
            return { ...prev, [field]: cur + char };
        });
    };

    // ── Timer controls ────────────────────────────────────────────────────────
    const openTimer = (activity) => {
        if (timer.running) { clearInterval(timerRef.current); }
        setTimer({ visible: true, activity, seconds: activity.timerSeconds || 0, running: false });
    };

    const startTimer = () => {
        clearInterval(timerRef.current);
        timerRef.current = setInterval(() => {
            setTimer(prev => ({ ...prev, seconds: prev.seconds + 1 }));
        }, 1000);
        setTimer(prev => ({ ...prev, running: true }));
    };

    const pauseTimer = () => {
        clearInterval(timerRef.current);
        setTimer(prev => ({ ...prev, running: false }));
    };

    const resetTimer = () => {
        clearInterval(timerRef.current);
        setTimer(prev => ({ ...prev, seconds: 0, running: false }));
    };

    const saveTimerAndClose = async () => {
        clearInterval(timerRef.current);
        const { activity, seconds } = timer;
        setTimer(prev => ({ ...prev, visible: false, running: false }));

        // Auto-mark as completed if duration is > 0
        const shouldComplete = seconds > 0 || activity.completed;

        try {
            await api.post('/plan/activity', {
                date: selectedDate, activityId: activity.id, activityName: activity.name,
                timeOfDay: activity.timeOfDay, icon: activity.icon,
                completed: shouldComplete, timerSeconds: seconds, isCustom: !!activity.isCustom,
            });
            setDayRecords(prev => {
                const exists = prev.find(r => r.activityId === activity.id);
                if (exists) return prev.map(r => r.activityId === activity.id ? { ...r, timerSeconds: seconds, completed: shouldComplete } : r);
                return [...prev, {
                    activityId: activity.id, activityName: activity.name, timeOfDay: activity.timeOfDay,
                    icon: activity.icon, completed: shouldComplete, timerSeconds: seconds, isCustom: !!activity.isCustom, date: selectedDate
                }];
            });
            Toast.show({ type: 'success', text1: t('Timer Saved'), text2: `${formatTime(seconds)} ${t('recorded & marked done!')}`, position: 'top' });
            loadMonthData(); // Update calendar
        } catch (_) {
            Toast.show({ type: 'error', text1: t('Timer Save Failed'), text2: t('Could not save timer.'), position: 'top' });
        }
    };

    // ─────────────────────────────────────────────────────────────────────────
    // Month navigation ──────────────────────────────────────────────────────
    const goMonth = (delta) => {
        let m = month + delta, y = year;
        if (m > 12) { m = 1; y += 1; }
        if (m < 1) { m = 12; y -= 1; }
        setMonth(m); setYear(y);
    };

    // ── Calendar cells ────────────────────────────────────────────────────────
    const getWeekDays = (baseDate) => {
        const d = new Date(baseDate);
        const day = d.getDay();
        const diff = d.getDate() - day;
        const startOfWeek = new Date(d.setDate(diff));
        
        const days = [];
        for (let i = 0; i < 7; i++) {
            const date = new Date(startOfWeek);
            date.setDate(date.getDate() + i);
            days.push(toDateStr(date.getFullYear(), date.getMonth() + 1, date.getDate()));
        }
        return days;
    };

    // ── Render helpers ────────────────────────────────────────────────────────
    const calCells = useMemo(() => {
        const first = firstDay(year, month);
        const days = daysInMo(year, month);
        const cells = [];
        for (let i = 0; i < first; i++) cells.push(null);
        for (let d = 1; d <= days; d++) cells.push(d);
        return cells;
    }, [year, month]);

    const renderActivityRow = (activity) => {
        const isSaving = savingId === activity.id;
        const hasTimer = activity.timerSeconds > 0;
        const pct = activity.suggestedMin > 0
            ? Math.min(1, (activity.timerSeconds / 60) / activity.suggestedMin)
            : 0;

        return (
            <View key={activity.id} style={[s.actRow, activity.completed && s.actRowDone]}>
                {/* Left color bar */}
                <View style={[s.actBar, { backgroundColor: activity.color || '#9CA3AF' }]} />

                {/* Icon */}
                <Text style={s.actIcon}>{activity.icon}</Text>

                {/* Info */}
                <View style={s.actInfo}>
                    <Text style={[s.actName, activity.completed && s.actNameDone]} numberOfLines={1}>{t(activity.name)}</Text>
                    <Text style={s.actDesc} numberOfLines={1}>{t(activity.description)}</Text>
                    {hasTimer && (
                        <Text style={[s.actTimer, { color: activity.color || PURPLE }]}>
                            ⏱ {formatTime(activity.timerSeconds)}
                            {activity.suggestedMin > 0 && ` / ${activity.suggestedMin} min target`}
                        </Text>
                    )}
                    {hasTimer && activity.suggestedMin > 0 && (
                        <View style={s.actMiniBar}>
                            <View style={[s.actMiniFill, { width: `${Math.round(pct * 100)}%`, backgroundColor: activity.color || PURPLE }]} />
                        </View>
                    )}
                </View>

                {/* Timer button (conditional) */}
                {activity.useTimer && (
                    <TouchableOpacity onPress={() => openTimer(activity)} style={s.timerBtn}>
                        <Text style={s.timerBtnIcon}>⏱</Text>
                    </TouchableOpacity>
                )}

                {/* Checkbox */}
                <TouchableOpacity onPress={() => toggleActivity(activity)} style={s.checkbox} disabled={isSaving}>
                    {isSaving
                        ? <ActivityIndicator size="small" color={PURPLE} />
                        : <View style={[s.checkboxInner, activity.completed && { backgroundColor: activity.color || PURPLE, borderColor: activity.color || PURPLE }]}>
                            {activity.completed && <Text style={s.checkmark}>✓</Text>}
                        </View>
                    }
                </TouchableOpacity>

                {/* Delete for custom */}
                {activity.isCustom && (
                    <TouchableOpacity onPress={() => deleteCustomActivity(activity)} style={s.deleteBtn}>
                        <Text style={s.deleteBtnText}>✕</Text>
                    </TouchableOpacity>
                )}
            </View>
        );
    };

    const renderSection = (section) => {
        const items = mergedActivities.filter(a => a.timeOfDay === section.key);
        const done = items.filter(a => a.completed).length;
        return (
            <View key={section.key} style={[s.section, { backgroundColor: section.bg }]}>
                <View style={s.sectionHeader}>
                    <Text style={s.sectionLabel}>{t(section.label)}</Text>
                    <Text style={s.sectionCount}>{done}/{items.length}</Text>
                </View>
                {items.map(renderActivityRow)}
            </View>
        );
    };

    // ─────────────────────────────────────────────────────────────────────────
    // RENDER
    // ─────────────────────────────────────────────────────────────────────────
    const suggestedMin = timer.activity?.suggestedMin || 0;
    const timerTarget = suggestedMin * 60;
    const timerPct = timerTarget > 0 ? Math.min(1, timer.seconds / timerTarget) : 0;

    return (
        <LinearGradient colors={['#F5F3FF', '#FFFFFF']} style={{ flex: 1 }}>
        <SafeAreaView style={[s.safe, { backgroundColor: 'transparent' }]}>
            {/* ── Header ── */}
            <View style={s.header}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={s.backBtn}>
                    <Text style={s.backIcon}>←</Text>
                </TouchableOpacity>
                <View style={s.headerCenter}>
                    <Text style={s.headerEmoji}>🌸</Text>
                    <Text style={s.headerTitle}>{t('Wellness Plan')}</Text>
                </View>
                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                    <TouchableOpacity onPress={() => i18n.changeLanguage(i18n.language === 'en' ? 'si' : 'en')} style={{ marginRight: 10 }}>
                        <Text style={{ fontWeight: '700', fontSize: 13, color: '#7C3AED', backgroundColor: '#EDE9FE', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12 }}>
                            {i18n.language === 'en' ? 'සිං' : 'EN'}
                        </Text>
                    </TouchableOpacity>
                    <View style={s.headerBadge}>
                        <Text style={s.headerBadgeText}>{dayTotals.done}/{dayTotals.total}</Text>
                    </View>
                </View>
            </View>

            <ScrollView style={s.body} showsVerticalScrollIndicator={false}>
                {/* ── Relaxing Message ── */}
                <View style={s.relaxHeader}>
                    <Text style={s.relaxTitle}>{t('Your Gentle Path')}</Text>
                    <Text style={s.relaxSub}>{t("One step at a time, you're doing great.")}</Text>
                </View>

                {/* ── Weekly Strip Calendar ── */}
                <View style={s.weeklyStrip}>
                    <View style={s.weeklyStripHeader}>
                        <Text style={s.weeklyStripMonth}>{MONTHS[month - 1]} {year}</Text>
                        <TouchableOpacity onPress={() => setShowFullCalendar(!showFullCalendar)}>
                            <Text style={s.fullCalToggle}>{showFullCalendar ? '↑ Hide' : '↓ Full Calendar'}</Text>
                        </TouchableOpacity>
                    </View>
                    <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={s.weekScroll}>
                        {getWeekDays(selectedDate).map(ds => {
                            const dateObj = new Date(ds);
                            const isSelected = ds === selectedDate;
                            const isToday = ds === todayStr;
                            const status = getDayStatus(ds);
                            
                            return (
                                <TouchableOpacity 
                                    key={ds} 
                                    style={[s.weekDay, isSelected && s.weekDaySelected]}
                                    onPress={() => setSelectedDate(ds)}
                                >
                                    <Text style={[s.weekDayName, isSelected && { color: WHITE }]}>{DAYS_SHORT[dateObj.getDay()]}</Text>
                                    <Text style={[s.weekDayNum, isSelected && { color: WHITE }]}>{dateObj.getDate()}</Text>
                                    <Text style={[s.weekCount, isSelected && { color: WHITE }]}>
                                        {completionByDate[ds] ? `${completionByDate[ds].completed}/${completionByDate[ds].total}` : `0/${DEFAULT_ACTIVITIES.length}`}
                                    </Text>
                                </TouchableOpacity>
                            );
                        })}
                    </ScrollView>
                </View>

                {/* Full Calendar (Conditional) */}
                {showFullCalendar && (
                    <View style={s.calCard}>
                        {/* Month Navigator inside full calendar */}
                        <View style={s.monthNav}>
                            <TouchableOpacity onPress={() => goMonth(-1)} style={s.monthArrow}><Text style={s.monthArrowTxt}>‹</Text></TouchableOpacity>
                            <Text style={s.monthLabel}>{MONTHS[month - 1]} {year}</Text>
                            <TouchableOpacity onPress={() => goMonth(1)} style={s.monthArrow}><Text style={s.monthArrowTxt}>›</Text></TouchableOpacity>
                        </View>
                        <View style={s.calRow}>
                            {DAYS_SHORT.map(d => <Text key={d} style={s.calDayHdr}>{d}</Text>)}
                        </View>
                        <View style={s.calGrid}>
                            {calCells.map((day, idx) => {
                                if (!day) return <View key={`e${idx}`} style={s.calCell} />;
                                const ds = toDateStr(year, month, day);
                                const status = getDayStatus(ds);
                                const isToday = ds === todayStr;
                                const isSelected = ds === selectedDate;
                                const cellBg = isSelected ? PURPLE
                                    : isToday ? '#EDE9FE'
                                        : status === 'great' ? '#6EE7B7'
                                            : status === 'good' ? '#A7F3D0'
                                                : status === 'started' ? '#FEF3C7'
                                                    : 'transparent';
                                return (
                                    <TouchableOpacity key={ds} style={[s.calCell, s.calDayCell, { backgroundColor: cellBg }]}
                                        onPress={() => setSelectedDate(ds)}>
                                        <Text style={[s.calDayNum,
                                        isSelected && { color: WHITE, fontWeight: '800' },
                                        isToday && !isSelected && { color: PURPLE, fontWeight: '700' },
                                        ]}>{day}</Text>
                                        <Text style={[s.calCount, isSelected && { color: WHITE }]}>
                                            {completionByDate[ds] ? `${completionByDate[ds].completed}/${completionByDate[ds].total}` : `0/${DEFAULT_ACTIVITIES.length}`}
                                        </Text>
                                    </TouchableOpacity>
                                );
                            })}
                        </View>
                        <View style={s.legend}>
                            <View style={s.legendItem}><View style={[s.legendDot, { backgroundColor: PURPLE }]} /><Text style={s.legendTxt}>Selected</Text></View>
                            <View style={s.legendItem}><View style={[s.legendDot, { backgroundColor: '#FBBF24' }]} /><Text style={s.legendTxt}>Started</Text></View>
                            <View style={s.legendItem}><View style={[s.legendDot, { backgroundColor: '#10B981' }]} /><Text style={s.legendTxt}>Done</Text></View>
                        </View>
                    </View>
                )}

                {/* Selected Day Summary */}
                <View style={s.daySummary}>
                    <Text style={s.daySummaryDate}>📅 {selectedDate}</Text>
                    <View style={s.daySummaryRight}>
                        <Text style={s.daySummaryCount}>{dayTotals.done} of {dayTotals.total} done</Text>
                    </View>
                </View>
                <View style={s.dayProgressBar}>
                    <View style={[s.dayProgressFill, {
                        width: dayTotals.total > 0 ? `${Math.round((dayTotals.done / dayTotals.total) * 100)}%` : '0%',
                        backgroundColor: dayTotals.done === dayTotals.total && dayTotals.total > 0 ? '#10B981' : PURPLE,
                    }]} />
                </View>

                {/* Activity Sections */}
                {loadingDay
                    ? <ActivityIndicator color={PURPLE} size="large" style={{ marginTop: 40 }} />
                    : TIME_SECTIONS.map(renderSection)
                }

                {/* ── Add My Own Activity Button ── */}
                {!loadingDay && (
                    <TouchableOpacity style={s.addCustomBtn} onPress={() => {
                        setCustomForm({ name: '', nameDesc: '', icon: '🌟', timeOfDay: 'Morning', useTimer: false });
                        setActiveField(null);
                        setShowCustomModal(true);
                    }}>
                        <Text style={s.addCustomIcon}>＋</Text>
                        <View>
                            <Text style={s.addCustomText}>{t('Add My Own Activity')}</Text>
                            <Text style={s.addCustomSub}>{t('Create a custom plan step')}</Text>
                        </View>
                    </TouchableOpacity>
                )}

                <View style={{ height: 32 }} />
            </ScrollView>

            {/* ═══════════════════════════════════════════════════════════════
              CUSTOM ACTIVITY MODAL
            ═══════════════════════════════════════════════════════════════ */}
            <Modal visible={showCustomModal} transparent animationType="slide"
                onRequestClose={() => setShowCustomModal(false)}>
                <View style={s.modalOverlay}>
                    <View style={s.customBox}>
                        <ScrollView showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="always">
                            {/* Title */}
                            <Text style={s.customTitle}>✨ {t('Add My Own Activity')}</Text>
                            <Text style={s.customSubtitle}>{t('Create a custom plan step')}</Text>

                            {/* Language Toggle */}
                            <View style={[s.customTimerToggle, { marginBottom: 14 }]}>
                                <Text style={s.customLabel}>{t('Input Language')}</Text>
                                <TouchableOpacity
                                    style={[s.langToggle, (customNameSinhalaMode || customDescSinhalaMode) && s.langToggleActive]}
                                    onPress={() => {
                                        const next = !(customNameSinhalaMode || customDescSinhalaMode);
                                        setCustomNameSinhalaMode(next);
                                        setCustomDescSinhalaMode(next);
                                    }}>
                                    <Text style={s.langToggleTxt}>
                                        {(customNameSinhalaMode || customDescSinhalaMode) ? 'සිං ON' : 'EN'}
                                    </Text>
                                </TouchableOpacity>
                            </View>

                            {/* Activity Name */}
                            <Text style={s.customLabel}>🏷️ {t('Activity Name*')}</Text>
                            <TouchableOpacity
                                style={[s.customInput, activeField === 'name' && s.customInputFocused]}
                                activeOpacity={1}
                                onPress={() => setActiveField('name')}>
                                <Text style={customForm.name ? s.inputText : s.inputPlaceholder}>
                                    {customForm.name || t('e.g. Evening Walk, Prayer, Reading...')}
                                </Text>
                            </TouchableOpacity>
                            {/* Regular TextInput when not in Sinhala mode */}
                            {activeField === 'name' && !customNameSinhalaMode && (
                                <TextInput
                                    style={s.customInput}
                                    placeholder={t('e.g. Evening Walk, Prayer, Reading...')}
                                    value={customForm.name}
                                    onChangeText={v => setCustomForm(p => ({ ...p, name: v }))}
                                    autoFocus
                                    onBlur={() => setActiveField(null)}
                                />
                            )}

                            {/* Activity Description */}
                            <Text style={s.customLabel}>📝 {t('Short Description (optional)')}</Text>
                            <TouchableOpacity
                                style={[s.customInput, { minHeight: 48 }, activeField === 'desc' && s.customInputFocused]}
                                activeOpacity={1}
                                onPress={() => setActiveField('desc')}>
                                <Text style={customForm.nameDesc ? s.inputText : s.inputPlaceholder}>
                                    {customForm.nameDesc || t('Brief note about this activity...')}
                                </Text>
                            </TouchableOpacity>
                            {activeField === 'desc' && !customDescSinhalaMode && (
                                <TextInput
                                    style={[s.customInput, { minHeight: 48 }]}
                                    placeholder={t('Brief note about this activity...')}
                                    value={customForm.nameDesc}
                                    onChangeText={v => setCustomForm(p => ({ ...p, nameDesc: v }))}
                                    multiline
                                    autoFocus
                                    onBlur={() => setActiveField(null)}
                                />
                            )}

                            {/* Sinhala Keyboard */}
                            {(customNameSinhalaMode || customDescSinhalaMode) && activeField && (
                                <SinhalaKeyboard
                                    onKeyPress={handleSinhalaKey}
                                    onClose={() => setActiveField(null)}
                                />
                            )}

                            {/* Time of Day */}
                            <Text style={s.customLabel}>🕐 {t('Time of Day')}</Text>
                            <View style={s.customTimeRow}>
                                {TIME_SECTIONS.map(sec => (
                                    <TouchableOpacity
                                        key={sec.key}
                                        style={[s.customTimeChip, customForm.timeOfDay === sec.key && { backgroundColor: sec.accent, borderColor: sec.accent }]}
                                        onPress={() => setCustomForm(p => ({ ...p, timeOfDay: sec.key }))}>
                                        <Text style={[s.customTimeChipTxt, customForm.timeOfDay === sec.key && { color: '#fff' }]}>
                                            {t(sec.label)}
                                        </Text>
                                    </TouchableOpacity>
                                ))}
                            </View>

                            {/* Icon Picker */}
                            <Text style={s.customLabel}>🎨 {t('Choose Icon')}</Text>
                            <View style={s.iconGrid}>
                                {ICON_OPTIONS.map(ico => (
                                    <TouchableOpacity
                                        key={ico}
                                        style={[s.iconCell, customForm.icon === ico && s.iconCellActive]}
                                        onPress={() => setCustomForm(p => ({ ...p, icon: ico }))}>
                                        <Text style={s.iconCellTxt}>{ico}</Text>
                                    </TouchableOpacity>
                                ))}
                            </View>

                            {/* Actions */}
                            <View style={s.customActions}>
                                <TouchableOpacity style={s.customCancelBtn} onPress={() => setShowCustomModal(false)}>
                                    <Text style={s.customCancelTxt}>{t('Cancel')}</Text>
                                </TouchableOpacity>
                                <TouchableOpacity style={s.customSaveBtn} onPress={saveCustomActivity} disabled={savingCustom}>
                                    {savingCustom
                                        ? <ActivityIndicator color="#fff" size="small" />
                                        : <Text style={s.customSaveTxt}>✓ {t('Add to Plan')}</Text>
                                    }
                                </TouchableOpacity>
                            </View>
                        </ScrollView>
                    </View>
                </View>
            </Modal>

            {/* ═══════════════════════════════════════════════════════════════════
          TIMER MODAL
      ═══════════════════════════════════════════════════════════════════ */}
            <Modal visible={timer.visible} transparent animationType="fade"
                onRequestClose={() => { if (timer.running) pauseTimer(); setTimer(p => ({ ...p, visible: false })); }}>
                <View style={s.timerOverlay}>
                    <View style={s.timerBox}>
                        {/* Title */}
                        <Text style={s.timerIcon}>{timer.activity?.icon || '⏱'}</Text>
                        <Text style={s.timerName}>{timer.activity?.name}</Text>
                        {suggestedMin > 0 && <Text style={s.timerTarget}>Target: {suggestedMin} min</Text>}

                        {/* Clock */}
                        <View style={s.timerClockRing}>
                            <Text style={s.timerClock}>{formatTime(timer.seconds)}</Text>
                            {suggestedMin > 0 && (
                                <Text style={s.timerPercent}>{Math.min(100, Math.round(timerPct * 100))}%</Text>
                            )}
                        </View>

                        {/* Progress arc (simple bar for RN) */}
                        {suggestedMin > 0 && (
                            <View style={s.timerBar}>
                                <View style={[s.timerBarFill, { width: `${Math.min(100, Math.round(timerPct * 100))}%` }]} />
                            </View>
                        )}

                        {/* Controls */}
                        <View style={s.timerControls}>
                            <TouchableOpacity style={s.timerResetBtn} onPress={resetTimer}>
                                <Text style={s.timerResetTxt}>↺</Text>
                            </TouchableOpacity>

                            {timer.running
                                ? <TouchableOpacity style={[s.timerPlayBtn, { backgroundColor: '#F59E0B' }]} onPress={pauseTimer}>
                                    <Text style={s.timerPlayTxt}>⏸</Text>
                                </TouchableOpacity>
                                : <TouchableOpacity style={s.timerPlayBtn} onPress={startTimer}>
                                    <Text style={s.timerPlayTxt}>▶</Text>
                                </TouchableOpacity>
                            }

                            <TouchableOpacity style={s.timerSaveBtn} onPress={saveTimerAndClose}>
                                <Text style={s.timerSaveTxt}>✓</Text>
                            </TouchableOpacity>
                        </View>

                        <Text style={s.timerHint}>Tap ▶ to start · ✓ to save & close</Text>

                        <TouchableOpacity style={s.timerCloseBtn}
                            onPress={() => { pauseTimer(); setTimer(p => ({ ...p, visible: false })); }}>
                            <Text style={s.timerCloseTxt}>Close without saving</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </Modal>

            <Toast />
        </SafeAreaView>
        </LinearGradient>
    );
}

// ─────────────────────────────────────────────────────────────────────────────
// STYLES
// ─────────────────────────────────────────────────────────────────────────────
const PURPLE = '#7C3AED';
const WHITE = '#FFFFFF';
const BG = '#F3F4F6';

const s = StyleSheet.create({
    safe: { flex: 1, backgroundColor: BG },

    // Header
    header: {
        flexDirection: 'row', alignItems: 'center', backgroundColor: WHITE,
        paddingHorizontal: 16, paddingVertical: 14,
        elevation: 4, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.08, shadowRadius: 4,
    },
    backBtn: { padding: 8 },
    backIcon: { fontSize: 22, color: PURPLE, fontWeight: 'bold' },
    headerCenter: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6 },
    headerEmoji: { fontSize: 22 },
    headerTitle: { fontSize: 18, fontWeight: '800', color: PURPLE },
    headerBadge: { backgroundColor: PURPLE, paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12 },
    headerBadgeText: { color: WHITE, fontSize: 12, fontWeight: '700' },

    body: { flex: 1, paddingHorizontal: 14 },

    // Month Nav
    monthNav: {
        flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
        backgroundColor: WHITE, borderRadius: 16, paddingVertical: 10, paddingHorizontal: 16,
        marginTop: 14, marginBottom: 10,
        elevation: 2, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.06, shadowRadius: 3,
    },
    monthArrow: { padding: 8 },
    monthArrowTxt: { fontSize: 26, color: PURPLE },
    monthLabel: { fontSize: 17, fontWeight: '800', color: '#111827' },

    // Calendar
    calCard: {
        backgroundColor: WHITE, borderRadius: 18, padding: 14, marginBottom: 12,
        elevation: 2, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.06, shadowRadius: 3
    },
    calRow: { flexDirection: 'row', justifyContent: 'space-around', marginBottom: 4 },
    calDayHdr: { width: 36, textAlign: 'center', fontSize: 11, fontWeight: '700', color: '#9CA3AF' },
    calGrid: { flexDirection: 'row', flexWrap: 'wrap' },
    calCell: { width: '14.28%', aspectRatio: 1, padding: 2 },
    calDayCell: { alignItems: 'center', justifyContent: 'center', borderRadius: 8 },
    calDayNum: { fontSize: 12, fontWeight: '600', color: '#374151' },
    calDot: { width: 4, height: 4, borderRadius: 2, marginTop: 1 },
    legend: {
        flexDirection: 'row', justifyContent: 'center', gap: 12, marginTop: 10,
        paddingTop: 10, borderTopWidth: 1, borderTopColor: '#F3F4F6'
    },
    legendItem: { flexDirection: 'row', alignItems: 'center', gap: 4 },
    legendDot: { width: 8, height: 8, borderRadius: 4 },
    legendTxt: { fontSize: 10, color: '#6B7280' },

    // Day Summary
    daySummary: {
        flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
        paddingHorizontal: 4, marginBottom: 6
    },
    daySummaryDate: { fontSize: 13, fontWeight: '700', color: '#111827' },
    daySummaryRight: {},
    daySummaryCount: { fontSize: 12, color: PURPLE, fontWeight: '700' },
    dayProgressBar: { height: 6, backgroundColor: '#E5E7EB', borderRadius: 3, overflow: 'hidden', marginBottom: 14 },
    dayProgressFill: { height: '100%', borderRadius: 3 },

    // Sections
    section: {
        borderRadius: 16, marginBottom: 12, overflow: 'hidden',
        elevation: 2, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.05, shadowRadius: 3
    },
    sectionHeader: {
        flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
        paddingHorizontal: 14, paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: 'rgba(0,0,0,0.05)'
    },
    sectionLabel: { fontSize: 14, fontWeight: '800', color: '#111827' },
    sectionCount: { fontSize: 12, color: '#6B7280', fontWeight: '600' },

    // Activity Row
    actRow: {
        flexDirection: 'row', alignItems: 'center', backgroundColor: WHITE,
        paddingVertical: 10, paddingRight: 12, borderBottomWidth: 1, borderBottomColor: '#F9FAFB'
    },
    actRowDone: { opacity: 0.85 },
    actBar: { width: 4, alignSelf: 'stretch', marginRight: 10 },
    actIcon: { fontSize: 22, marginHorizontal: 10 },
    actInfo: { flex: 1, marginRight: 4 },
    actName: { fontSize: 13, fontWeight: '700', color: '#111827', marginBottom: 2 },
    actNameDone: { textDecorationLine: 'line-through', color: '#9CA3AF' },
    actDesc: { fontSize: 11, color: '#9CA3AF', lineHeight: 15 },
    actTimer: { fontSize: 11, fontWeight: '600', marginTop: 3 },
    actMiniBar: { height: 3, backgroundColor: '#E5E7EB', borderRadius: 2, overflow: 'hidden', marginTop: 4, width: '100%' },
    actMiniFill: { height: '100%', borderRadius: 2 },
    timerBtn: { padding: 8, borderRadius: 10, backgroundColor: '#F3F4F6', marginRight: 6 },
    timerBtnIcon: { fontSize: 16 },
    checkbox: { width: 34, height: 34, alignItems: 'center', justifyContent: 'center' },
    checkboxInner: {
        width: 24, height: 24, borderRadius: 12, borderWidth: 2, borderColor: '#D1D5DB',
        alignItems: 'center', justifyContent: 'center'
    },
    checkmark: { color: WHITE, fontSize: 14, fontWeight: '800' },
    deleteBtn: { padding: 6, marginLeft: 2 },
    deleteBtnText: { color: '#EF4444', fontSize: 14, fontWeight: '700' },

    // Add Custom Button
    addCustomBtn: {
        flexDirection: 'row', alignItems: 'center', justifyContent: 'flex-start',
        backgroundColor: WHITE, borderRadius: 16, padding: 16, marginBottom: 4, borderWidth: 2,
        borderColor: PURPLE, borderStyle: 'dashed', gap: 12,
        elevation: 1, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.04, shadowRadius: 2
    },
    addCustomIcon: { fontSize: 28, color: PURPLE, fontWeight: '700' },
    addCustomText: { fontSize: 14, fontWeight: '700', color: PURPLE },
    addCustomSub: { fontSize: 11, color: '#9CA3AF', marginTop: 2 },

    // Modal Overlay
    modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.55)', justifyContent: 'flex-end' },

    // Timer Modal
    timerOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.6)', alignItems: 'center', justifyContent: 'center' },
    timerBox: { backgroundColor: WHITE, borderRadius: 28, padding: 28, width: 320, alignItems: 'center' },
    timerIcon: { fontSize: 48, marginBottom: 8 },
    timerName: { fontSize: 17, fontWeight: '800', color: '#111827', textAlign: 'center', marginBottom: 4 },
    timerTarget: { fontSize: 12, color: '#9CA3AF', marginBottom: 20 },
    timerClockRing: {
        width: 160, height: 160, borderRadius: 80, borderWidth: 6, borderColor: PURPLE,
        alignItems: 'center', justifyContent: 'center', marginBottom: 16, backgroundColor: '#F5F3FF'
    },
    timerClock: { fontSize: 38, fontWeight: '900', color: PURPLE, letterSpacing: 2 },
    timerPercent: { fontSize: 13, color: '#6B7280', marginTop: 4 },
    timerBar: {
        width: '100%', height: 8, backgroundColor: '#E5E7EB', borderRadius: 4,
        overflow: 'hidden', marginBottom: 24
    },
    timerBarFill: { height: '100%', backgroundColor: PURPLE, borderRadius: 4 },
    timerControls: { flexDirection: 'row', alignItems: 'center', gap: 16, marginBottom: 12 },
    timerResetBtn: {
        width: 52, height: 52, borderRadius: 26, backgroundColor: '#F3F4F6',
        alignItems: 'center', justifyContent: 'center'
    },
    timerResetTxt: { fontSize: 22, color: '#374151' },
    timerPlayBtn: {
        width: 68, height: 68, borderRadius: 34, backgroundColor: PURPLE,
        alignItems: 'center', justifyContent: 'center', elevation: 4,
        shadowColor: PURPLE, shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.4, shadowRadius: 8
    },
    timerPlayTxt: { fontSize: 26, color: WHITE },
    timerSaveBtn: {
        width: 52, height: 52, borderRadius: 26, backgroundColor: '#10B981',
        alignItems: 'center', justifyContent: 'center'
    },
    timerSaveTxt: { fontSize: 22, color: WHITE, fontWeight: '800' },
    timerHint: { fontSize: 11, color: '#9CA3AF', marginBottom: 16 },
    timerCloseBtn: { paddingVertical: 6 },
    timerCloseTxt: { fontSize: 12, color: '#9CA3AF', textDecorationLine: 'underline' },

    // Custom Activity Modal
    customBox: {
        backgroundColor: WHITE, borderTopLeftRadius: 28, borderTopRightRadius: 28,
        padding: 24, maxHeight: '92%',
    },
    customTitle: { fontSize: 18, fontWeight: '800', color: '#111827', marginBottom: 4 },
    customSubtitle: { fontSize: 13, color: '#6B7280', marginBottom: 20 },
    customLabel: { fontSize: 12, fontWeight: '700', color: '#374151', marginBottom: 6 },
    customInput: {
        borderWidth: 1.5, borderColor: '#E5E7EB', borderRadius: 12, padding: 12,
        fontSize: 14, backgroundColor: '#F9FAFB', color: '#111827', marginBottom: 14
    },
    customTimeRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginBottom: 14 },
    customTimeChip: {
        paddingHorizontal: 12, paddingVertical: 6, borderRadius: 20,
        borderWidth: 1.5, borderColor: '#E5E7EB', backgroundColor: '#F9FAFB'
    },
    customTimeChipActive: { backgroundColor: PURPLE, borderColor: PURPLE },
    customTimeChipTxt: { fontSize: 12, fontWeight: '600', color: '#374151' },
    iconGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginBottom: 14 },
    iconCell: {
        width: 40, height: 40, borderRadius: 10, backgroundColor: '#F9FAFB',
        borderWidth: 1.5, borderColor: '#E5E7EB', alignItems: 'center', justifyContent: 'center'
    },
    iconCellActive: { backgroundColor: '#EDE9FE', borderColor: PURPLE },
    iconCellTxt: { fontSize: 20 },
    customActions: { flexDirection: 'row', gap: 10, marginTop: 10 },
    customTimerToggle: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 },
    toggleBtn: { width: 44, height: 24, borderRadius: 12, backgroundColor: '#E5E7EB', padding: 2 },
    toggleBtnActive: { backgroundColor: PURPLE },
    toggleDot: { width: 20, height: 20, borderRadius: 10, backgroundColor: WHITE },
    toggleDotActive: { marginLeft: 20 },
    customCancelBtn: {
        flex: 1, paddingVertical: 13, borderRadius: 12, alignItems: 'center',
        borderWidth: 1.5, borderColor: '#E5E7EB'
    },
    customCancelTxt: { color: '#6B7280', fontWeight: '700', fontSize: 14 },
    customSaveBtn: { flex: 2, paddingVertical: 13, borderRadius: 12, alignItems: 'center', backgroundColor: PURPLE },
    customSaveTxt: { color: WHITE, fontWeight: '700', fontSize: 14 },

    // Lang toggle
    langToggle: {
        paddingHorizontal: 14, paddingVertical: 6, borderRadius: 20,
        backgroundColor: '#F3F4F6', borderWidth: 1.5, borderColor: '#E5E7EB',
    },
    langToggleActive: { backgroundColor: PURPLE, borderColor: PURPLE },
    langToggleTxt: { fontSize: 13, fontWeight: '700', color: '#374151' },

    // Input display states
    customInputFocused: { borderColor: PURPLE, backgroundColor: '#FAF5FF' },
    inputText: { fontSize: 14, color: '#111827' },
    inputPlaceholder: { fontSize: 14, color: '#C4C4C4' },

    relaxHeader: { marginTop: 20, marginBottom: 20, paddingHorizontal: 4 },
    relaxTitle: { fontSize: 24, fontWeight: '800', color: '#1E1B4B' },
    relaxSub: { fontSize: 14, color: '#6366F1', marginTop: 4, fontWeight: '500' },

    weeklyStrip: { backgroundColor: WHITE, borderRadius: 24, padding: 16, marginBottom: 16, elevation: 2, shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 10 },
    weeklyStripHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
    weeklyStripMonth: { fontSize: 16, fontWeight: '800', color: '#1E293B' },
    fullCalToggle: { fontSize: 12, color: PURPLE, fontWeight: '700' },
    weekScroll: { gap: 10 },
    weekDay: { width: 45, height: 65, borderRadius: 22, backgroundColor: '#F8FAFC', alignItems: 'center', justifyContent: 'center' },
    weekDaySelected: { backgroundColor: PURPLE, elevation: 4, shadowColor: PURPLE, shadowOpacity: 0.3, shadowRadius: 8 },
    weekDayName: { fontSize: 11, fontWeight: '700', color: '#94A3B8' },
    weekDayNum: { fontSize: 16, fontWeight: '800', color: '#1E293B', marginTop: 4 },
    weekDot: { width: 4, height: 4, borderRadius: 2, marginTop: 4 },
    weekCount: { fontSize: 8, fontWeight: '700', color: '#94A3B8', marginTop: 2 },
    calCount: { fontSize: 7, fontWeight: '700', color: '#6B7280', marginTop: 1, textAlign: 'center' },
});
