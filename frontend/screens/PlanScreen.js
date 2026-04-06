import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import {
    View, Text, TextInput, TouchableOpacity, StyleSheet,
    ScrollView, ActivityIndicator, Modal, FlatList, Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Toast from 'react-native-toast-message';
import api from '../services/api';

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
    { key: 'Morning', label: '🌅 Morning', bg: '#FFFBEB' },
    { key: 'Midday', label: '☀️ Midday', bg: '#F0F9FF' },
    { key: 'Afternoon', label: '🌤️ Afternoon', bg: '#F5F3FF' },
    { key: 'Night', label: '🌙 Night', bg: '#EFF6FF' },
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
    const now = new Date();
    const [year, setYear] = useState(now.getFullYear());
    const [month, setMonth] = useState(now.getMonth() + 1);
    const [selectedDate, setSelectedDate] = useState(todayStr);

    const [monthRecords, setMonthRecords] = useState([]);
    const [dayRecords, setDayRecords] = useState([]);
    const [loadingDay, setLoadingDay] = useState(false);
    const [savingId, setSavingId] = useState(null);

    // Timer
    const timerRef = useRef(null);
    const [timer, setTimer] = useState({ visible: false, activity: null, seconds: 0, running: false });

    // Custom activity modal
    const [customModal, setCustomModal] = useState({ visible: false });
    const [customName, setCustomName] = useState('');
    const [customTimeOfDay, setCustomTimeOfDay] = useState('Morning');
    const [customIcon, setCustomIcon] = useState('🌟');
    const [customDuration, setCustomDuration] = useState('');
    const [customUseTimer, setCustomUseTimer] = useState(true);
    const [savingCustom, setSavingCustom] = useState(false);

    // ── Load month data (for calendar colors) ────────────────────────────────
    const loadMonthData = useCallback(async () => {
        try {
            const res = await api.get(`/activity/month/${year}/${month}`);
            setMonthRecords(res.data || []);
        } catch (_) { }
    }, [year, month]);

    // ── Load day data ─────────────────────────────────────────────────────────
    const loadDayData = useCallback(async (date) => {
        setLoadingDay(true);
        try {
            const res = await api.get(`/activity/date/${date}`);
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

    // ── Merged activities (defaults + saved records + custom) ─────────────────
    const mergedActivities = useMemo(() => {
        const defaults = DEFAULT_ACTIVITIES.map(act => {
            const rec = dayRecords.find(r => r.activityId === act.id && !r.isCustom);
            return { ...act, _recId: rec?._id || null, completed: rec?.completed || false, timerSeconds: rec?.timerSeconds || 0, isCustom: false };
        });
        const customs = dayRecords.filter(r => r.isCustom).map(r => ({
            id: r.activityId, name: r.activityName, timeOfDay: r.timeOfDay, icon: r.icon,
            suggestedMin: r.note ? parseInt(r.note) : 0, description: 'Custom activity', color: '#6B7280',
            useTimer: r.timerSeconds !== -1, // Use -1 as a flag for "no timer" in DB if needed, but for now let's just use a Note or check if it's stored.
            _recId: r._id, completed: r.completed, timerSeconds: r.timerSeconds || 0, isCustom: true,
        }));
        return [...defaults, ...customs];
    }, [dayRecords]);

    // ── Calendar completion map ───────────────────────────────────────────────
    const completionByDate = useMemo(() => {
        const map = {};
        monthRecords.forEach(r => {
            if (!map[r.date]) map[r.date] = { completed: 0, total: 0 };
            map[r.date].total++;
            if (r.completed) map[r.date].completed++;
        });
        return map;
    }, [monthRecords]);

    const getDayStatus = (dateStr) => {
        const d = completionByDate[dateStr];
        if (!d || d.total === 0) return 'none';
        const pct = d.completed / DEFAULT_ACTIVITIES.length; // relative to all 10 defaults
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
            await api.post('/activity', {
                date: selectedDate, activityId: activity.id, activityName: activity.name,
                timeOfDay: activity.timeOfDay, icon: activity.icon, completed: newCompleted,
                timerSeconds: activity.timerSeconds || 0, isCustom: !!activity.isCustom,
            });
            loadMonthData();
        } catch (err) {
            // Revert
            setDayRecords(prev => prev.map(r => r.activityId === activity.id ? { ...r, completed: !newCompleted } : r));
            Toast.show({ type: 'error', text1: 'Save Failed', text2: 'Could not update activity.', position: 'top' });
        } finally {
            setSavingId(null);
        }
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
            await api.post('/activity', {
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
            Toast.show({ type: 'success', text1: '⏱ Timer Saved', text2: `${formatTime(seconds)} recorded & marked done!`, position: 'top' });
            loadMonthData(); // Update calendar
        } catch (_) {
            Toast.show({ type: 'error', text1: 'Timer Save Failed', text2: 'Could not save timer.', position: 'top' });
        }
    };

    // ── Custom activity ───────────────────────────────────────────────────────
    const openCustomModal = () => {
        setCustomName(''); setCustomTimeOfDay('Morning'); setCustomIcon('🌟'); setCustomDuration(''); setCustomUseTimer(true);
        setCustomModal({ visible: true });
    };

    const saveCustomActivity = async () => {
        if (!customName.trim()) {
            Toast.show({ type: 'error', text1: 'Name Required', text2: 'Please enter an activity name.', position: 'top' });
            return;
        }
        setSavingCustom(true);
        const activityId = `custom_${Date.now()}`;
        try {
            const res = await api.post('/activity', {
                date: selectedDate, activityId, activityName: customName.trim(),
                timeOfDay: customTimeOfDay, icon: customIcon, completed: false,
                timerSeconds: customUseTimer ? 0 : -1, // Use -1 as flag for "no timer"
                isCustom: true,
                note: customDuration || '0', // Storing suggested duration in note for now
            });
            setDayRecords(prev => [...prev, res.data.record]);
            setCustomModal({ visible: false });
            Toast.show({ type: 'success', text1: '✅ Activity Added', text2: `"${customName.trim()}" added to your plan.`, position: 'top' });
        } catch (err) {
            Toast.show({ type: 'error', text1: 'Save Failed', text2: err.response?.data?.message || 'Could not save.', position: 'top' });
        } finally {
            setSavingCustom(false);
        }
    };

    const deleteCustomActivity = (activity) => {
        if (!activity._recId) return;
        Alert.alert('Delete Activity', `Remove "${activity.name}" from today?`, [
            { text: 'Cancel', style: 'cancel' },
            {
                text: 'Delete', style: 'destructive',
                onPress: async () => {
                    try {
                        await api.delete(`/activity/${activity._recId}`);
                        setDayRecords(prev => prev.filter(r => r.activityId !== activity.id));
                        Toast.show({ type: 'success', text1: 'Deleted', text2: 'Custom activity removed.', position: 'top' });
                    } catch (_) {
                        Toast.show({ type: 'error', text1: 'Delete Failed', position: 'top' });
                    }
                },
            },
        ]);
    };

    // ── Month navigation ──────────────────────────────────────────────────────
    const goMonth = (delta) => {
        let m = month + delta, y = year;
        if (m > 12) { m = 1; y += 1; }
        if (m < 1) { m = 12; y -= 1; }
        setMonth(m); setYear(y);
    };

    // ── Calendar cells ────────────────────────────────────────────────────────
    const calCells = useMemo(() => {
        const first = firstDay(year, month);
        const days = daysInMo(year, month);
        const cells = [];
        for (let i = 0; i < first; i++) cells.push(null);
        for (let d = 1; d <= days; d++) cells.push(d);
        return cells;
    }, [year, month]);

    // ── Render helpers ────────────────────────────────────────────────────────
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
                    <Text style={[s.actName, activity.completed && s.actNameDone]} numberOfLines={1}>{activity.name}</Text>
                    <Text style={s.actDesc} numberOfLines={1}>{activity.description}</Text>
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
        if (items.length === 0) return null;
        const done = items.filter(a => a.completed).length;
        return (
            <View key={section.key} style={[s.section, { backgroundColor: section.bg }]}>
                <View style={s.sectionHeader}>
                    <Text style={s.sectionLabel}>{section.label}</Text>
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
        <SafeAreaView style={s.safe}>
            {/* ── Header ── */}
            <View style={s.header}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={s.backBtn}>
                    <Text style={s.backIcon}>←</Text>
                </TouchableOpacity>
                <View style={s.headerCenter}>
                    <Text style={s.headerEmoji}>🌸</Text>
                    <Text style={s.headerTitle}>Wellness Plan</Text>
                </View>
                <View style={s.headerBadge}>
                    <Text style={s.headerBadgeText}>{dayTotals.done}/{dayTotals.total}</Text>
                </View>
            </View>

            <ScrollView style={s.body} showsVerticalScrollIndicator={false}>
                {/* Month Navigator */}
                <View style={s.monthNav}>
                    <TouchableOpacity onPress={() => goMonth(-1)} style={s.monthArrow}><Text style={s.monthArrowTxt}>‹</Text></TouchableOpacity>
                    <Text style={s.monthLabel}>{MONTHS[month - 1]} {year}</Text>
                    <TouchableOpacity onPress={() => goMonth(1)} style={s.monthArrow}><Text style={s.monthArrowTxt}>›</Text></TouchableOpacity>
                </View>

                {/* Calendar */}
                <View style={s.calCard}>
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
                                    {status !== 'none' && !isSelected && (
                                        <View style={[s.calDot, {
                                            backgroundColor: status === 'great' ? '#059669' : status === 'good' ? '#10B981' : '#F59E0B'
                                        }]} />
                                    )}
                                </TouchableOpacity>
                            );
                        })}
                    </View>
                    {/* Legend */}
                    <View style={s.legend}>
                        <View style={s.legendItem}><View style={[s.legendDot, { backgroundColor: '#4014b7ff' }]} /><Text style={s.legendTxt}>Selected</Text></View>
                        <View style={s.legendItem}><View style={[s.legendDot, { backgroundColor: '#F59E0B' }]} /><Text style={s.legendTxt}>Started</Text></View>
                        <View style={s.legendItem}><View style={[s.legendDot, { backgroundColor: '#10B981' }]} /><Text style={s.legendTxt}>Good</Text></View>
                        <View style={s.legendItem}><View style={[s.legendDot, { backgroundColor: '#7b0c6eff' }]} /><Text style={s.legendTxt}>Great</Text></View>
                    </View>
                </View>

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

                {/* Add Custom Activity */}
                <TouchableOpacity style={s.addCustomBtn} onPress={openCustomModal}>
                    <Text style={s.addCustomIcon}>＋</Text>
                    <Text style={s.addCustomText}>Add My Own Activity</Text>
                </TouchableOpacity>

                <View style={{ height: 32 }} />
            </ScrollView>

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

            {/* ═══════════════════════════════════════════════════════════════════
          CUSTOM ACTIVITY MODAL
      ═══════════════════════════════════════════════════════════════════ */}
            <Modal visible={customModal.visible} transparent animationType="slide"
                onRequestClose={() => setCustomModal({ visible: false })}>
                <View style={s.timerOverlay}>
                    <View style={s.customBox}>
                        <Text style={s.customTitle}>＋ Add Custom Activity</Text>
                        <Text style={s.customSubtitle}>Create a personalized wellness activity</Text>

                        <Text style={s.customLabel}>Activity Name*</Text>
                        <TextInput style={s.customInput} placeholder="e.g. Evening Journaling"
                            placeholderTextColor="#9CA3AF" value={customName} onChangeText={setCustomName} />

                        <Text style={s.customLabel}>Time of Day</Text>
                        <View style={s.customTimeRow}>
                            {['Morning', 'Midday', 'Afternoon', 'Night'].map(t => (
                                <TouchableOpacity key={t}
                                    style={[s.customTimeChip, customTimeOfDay === t && s.customTimeChipActive]}
                                    onPress={() => setCustomTimeOfDay(t)}>
                                    <Text style={[s.customTimeChipTxt, customTimeOfDay === t && { color: WHITE }]}>{t}</Text>
                                </TouchableOpacity>
                            ))}
                        </View>

                        <Text style={s.customLabel}>Choose Icon</Text>
                        <View style={s.iconGrid}>
                            {ICON_OPTIONS.map(ic => (
                                <TouchableOpacity key={ic} style={[s.iconCell, customIcon === ic && s.iconCellActive]}
                                    onPress={() => setCustomIcon(ic)}>
                                    <Text style={s.iconCellTxt}>{ic}</Text>
                                </TouchableOpacity>
                            ))}
                        </View>

                        <Text style={s.customLabel}>Suggested Duration (min, optional)</Text>
                        <TextInput style={s.customInput} placeholder="e.g. 15"
                            placeholderTextColor="#9CA3AF" value={customDuration}
                            onChangeText={setCustomDuration} keyboardType="numeric" />

                        <View style={s.customTimerToggle}>
                            <Text style={s.customLabel}>Enable Stopwatch?</Text>
                            <TouchableOpacity
                                style={[s.toggleBtn, customUseTimer && s.toggleBtnActive]}
                                onPress={() => setCustomUseTimer(!customUseTimer)}
                            >
                                <View style={[s.toggleDot, customUseTimer && s.toggleDotActive]} />
                            </TouchableOpacity>
                        </View>

                        <View style={s.customActions}>
                            <TouchableOpacity style={s.customCancelBtn} onPress={() => setCustomModal({ visible: false })}>
                                <Text style={s.customCancelTxt}>Cancel</Text>
                            </TouchableOpacity>
                            <TouchableOpacity style={s.customSaveBtn} onPress={saveCustomActivity} disabled={savingCustom}>
                                {savingCustom
                                    ? <ActivityIndicator color={WHITE} size="small" />
                                    : <Text style={s.customSaveTxt}>Add Activity</Text>
                                }
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </Modal>

            <Toast />
        </SafeAreaView>
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
        flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
        backgroundColor: WHITE, borderRadius: 16, padding: 16, marginBottom: 4, borderWidth: 2,
        borderColor: PURPLE, borderStyle: 'dashed', gap: 8,
        elevation: 1, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.04, shadowRadius: 2
    },
    addCustomIcon: { fontSize: 22, color: PURPLE, fontWeight: '700' },
    addCustomText: { fontSize: 14, fontWeight: '700', color: PURPLE },

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
    customBox: { backgroundColor: WHITE, borderRadius: 24, padding: 24, width: 360, maxHeight: '90%' },
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
});
