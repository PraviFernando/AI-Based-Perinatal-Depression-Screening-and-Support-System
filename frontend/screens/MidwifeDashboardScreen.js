import React, { useState, useEffect, useCallback } from 'react';
import {
    View, Text, ScrollView, TouchableOpacity, StyleSheet,
    ActivityIndicator, RefreshControl, TextInput, Dimensions, Modal,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Toast from 'react-native-toast-message';
import api, { setAuthToken } from '../services/api';
import { useAuth } from '../context/AuthContext';

const { width } = Dimensions.get('window');

// ─── Stat Card ────────────────────────────────
function StatCard({ icon, label, value, color }) {
    return (
        <View style={[styles.statCard, { borderTopColor: color }]}>
            <Text style={styles.statIcon}>{icon}</Text>
            <Text style={[styles.statValue, { color }]}>{value}</Text>
            <Text style={styles.statLabel}>{label}</Text>
        </View>
    );
}

// ─── Patient Card ─────────────────────────────
function PatientCard({ patient, onView }) {
    const initials = patient.username?.slice(0, 2).toUpperCase() || '??';
    const joined = new Date(patient.createdAt).toLocaleDateString('en-GB', {
        day: 'numeric', month: 'short', year: 'numeric',
    });
    return (
        <TouchableOpacity style={styles.patientCard} onPress={() => onView(patient)} activeOpacity={0.85}>
            <View style={styles.patientAvatar}>
                <Text style={styles.patientAvatarText}>{initials}</Text>
            </View>
            <View style={styles.patientInfo}>
                <Text style={styles.patientName}>{patient.username}</Text>
                <Text style={styles.patientEmail} numberOfLines={1}>{patient.email}</Text>
                <Text style={styles.patientJoined}>Joined: {joined}</Text>
            </View>
            <View style={styles.patientChevron}>
                <Text style={styles.chevronText}>›</Text>
            </View>
        </TouchableOpacity>
    );
}

// ─── Patient Detail Modal ─────────────────────
function PatientModal({ visible, patient, onClose }) {
    if (!patient) return null;
    const joined = new Date(patient.createdAt).toLocaleDateString('en-GB', {
        day: 'numeric', month: 'long', year: 'numeric',
    });
    const initials = patient.username?.slice(0, 2).toUpperCase() || '??';
    return (
        <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
            <View style={styles.modalOverlay}>
                <View style={styles.modalCard}>
                    <View style={styles.modalAvatarBig}>
                        <Text style={styles.modalAvatarBigText}>{initials}</Text>
                    </View>
                    <Text style={styles.modalName}>{patient.username}</Text>

                    <View style={styles.detailRow}>
                        <Text style={styles.detailIcon}>📧</Text>
                        <Text style={styles.detailText}>{patient.email}</Text>
                    </View>
                    <View style={styles.detailRow}>
                        <Text style={styles.detailIcon}>📅</Text>
                        <Text style={styles.detailText}>Joined {joined}</Text>
                    </View>
                    <View style={styles.detailRow}>
                        <Text style={styles.detailIcon}>🏷️</Text>
                        <Text style={[styles.detailText, { color: '#10B981', fontWeight: '700' }]}>
                            {patient.role}
                        </Text>
                    </View>

                    <TouchableOpacity style={styles.closeBtn} onPress={onClose}>
                        <Text style={styles.closeBtnText}>Close</Text>
                    </TouchableOpacity>
                </View>
            </View>
        </Modal>
    );
}

// ─── MAIN SCREEN ──────────────────────────────
export default function MidwifeDashboardScreen({ navigation }) {
    const { user: authUser, token, logout } = useAuth();
    const [stats, setStats] = useState(null);
    const [patients, setPatients] = useState([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [searchText, setSearchText] = useState('');
    const [selected, setSelected] = useState(null);

    useEffect(() => { if (token) setAuthToken(token); }, [token]);

    const fetchData = useCallback(async () => {
        try {
            const [statsRes, patientsRes] = await Promise.all([
                api.get('/midwife/stats'),
                api.get('/midwife/patients'),
            ]);
            setStats(statsRes.data);
            setPatients(patientsRes.data);
        } catch (err) {
            Toast.show({
                type: 'error',
                text1: 'Failed to load data',
                text2: err.response?.data?.message || 'Please try again',
                position: 'top',
            });
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    }, []);

    useEffect(() => { fetchData(); }, [fetchData]);

    const onRefresh = () => { setRefreshing(true); fetchData(); };

    const handleLogout = () => {
        logout();
        navigation.replace('Login');
    };

    const filtered = patients.filter(p =>
        p.username?.toLowerCase().includes(searchText.toLowerCase()) ||
        p.email?.toLowerCase().includes(searchText.toLowerCase())
    );

    return (
        <SafeAreaView style={styles.safe}>
            {/* ── Header ── */}
            <View style={styles.header}>
                <View>
                    <Text style={styles.headerTitle}>👩‍⚕️ Midwife Portal</Text>
                    <Text style={styles.headerSub}>Welcome, {authUser?.username || 'Midwife'}</Text>
                </View>
                <TouchableOpacity style={styles.logoutBtn} onPress={handleLogout}>
                    <Text style={styles.logoutText}>Sign Out</Text>
                </TouchableOpacity>
            </View>

            <ScrollView
                contentContainerStyle={styles.scroll}
                showsVerticalScrollIndicator={false}
                refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={['#0EA5E9']} />}
            >
                {/* ── Stats ── */}
                {stats && (
                    <View style={styles.statsRow}>
                        <StatCard icon="🤰" label="Total Patients" value={stats.totalPatients} color="#10B981" />
                        <StatCard icon="👩‍⚕️" label="Midwives" value={stats.totalMidwives} color="#0EA5E9" />
                    </View>
                )}

                {/* ── Tip Banner ── */}
                <View style={styles.tipBanner}>
                    <Text style={styles.tipIcon}>💡</Text>
                    <Text style={styles.tipText}>
                        Tap any patient card to view their profile details. Pull down to refresh the list.
                    </Text>
                </View>

                {/* ── Search ── */}
                <View style={styles.searchBox}>
                    <Text style={styles.searchIcon}>🔍</Text>
                    <TextInput
                        style={styles.searchInput}
                        placeholder="Search patients…"
                        placeholderTextColor="#9CA3AF"
                        value={searchText}
                        onChangeText={setSearchText}
                        autoCapitalize="none"
                    />
                    {searchText.length > 0 && (
                        <TouchableOpacity onPress={() => setSearchText('')}>
                            <Text style={{ fontSize: 18, color: '#9CA3AF' }}>✕</Text>
                        </TouchableOpacity>
                    )}
                </View>

                {/* ── Patient List ── */}
                <Text style={styles.sectionTitle}>
                    {filtered.length} Patient{filtered.length !== 1 ? 's' : ''}
                </Text>

                {loading ? (
                    <ActivityIndicator size="large" color="#0EA5E9" style={{ marginTop: 40 }} />
                ) : filtered.length === 0 ? (
                    <View style={styles.emptyBox}>
                        <Text style={styles.emptyIcon}>😶</Text>
                        <Text style={styles.emptyText}>No patients found</Text>
                    </View>
                ) : (
                    filtered.map(p => (
                        <PatientCard key={p._id} patient={p} onView={setSelected} />
                    ))
                )}

                <View style={{ height: 32 }} />
            </ScrollView>

            {/* ── Patient Detail Modal ── */}
            <PatientModal
                visible={!!selected}
                patient={selected}
                onClose={() => setSelected(null)}
            />

            <Toast />
        </SafeAreaView>
    );
}

// ─── Styles ───────────────────────────────────
const TEAL = '#0EA5E9';
const styles = StyleSheet.create({
    safe: { flex: 1, backgroundColor: '#F0F9FF' },

    // Header
    header: {
        flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
        backgroundColor: TEAL, paddingHorizontal: 20, paddingVertical: 16,
    },
    headerTitle: { color: '#fff', fontSize: 20, fontWeight: '800' },
    headerSub: { color: 'rgba(255,255,255,0.75)', fontSize: 13, marginTop: 2 },
    logoutBtn: {
        backgroundColor: 'rgba(255,255,255,0.2)', paddingHorizontal: 14,
        paddingVertical: 8, borderRadius: 20,
    },
    logoutText: { color: '#fff', fontWeight: '700', fontSize: 13 },

    // Scroll
    scroll: { paddingHorizontal: 16, paddingTop: 16 },

    // Stats
    statsRow: { flexDirection: 'row', gap: 12, marginBottom: 16 },
    statCard: {
        backgroundColor: '#fff', borderRadius: 14, padding: 14,
        flex: 1, borderTopWidth: 4, elevation: 2,
        shadowColor: '#000', shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.07, shadowRadius: 4, alignItems: 'center',
    },
    statIcon: { fontSize: 26, marginBottom: 6 },
    statValue: { fontSize: 26, fontWeight: '800', marginBottom: 2 },
    statLabel: { fontSize: 12, color: '#6B7280', fontWeight: '500' },

    // Tip banner
    tipBanner: {
        flexDirection: 'row', alignItems: 'center', backgroundColor: '#E0F2FE',
        borderRadius: 12, padding: 12, marginBottom: 14, gap: 10,
    },
    tipIcon: { fontSize: 20 },
    tipText: { flex: 1, fontSize: 13, color: '#0369A1', lineHeight: 18 },

    // Search
    searchBox: {
        flexDirection: 'row', alignItems: 'center', backgroundColor: '#fff',
        borderRadius: 12, paddingHorizontal: 14, marginBottom: 14,
        elevation: 1, shadowColor: '#000', shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05, shadowRadius: 4,
    },
    searchIcon: { fontSize: 18, marginRight: 8 },
    searchInput: { flex: 1, paddingVertical: 12, fontSize: 14, color: '#111827' },

    // Section title
    sectionTitle: { fontSize: 16, fontWeight: '700', color: '#111827', marginBottom: 10 },

    // Patient card
    patientCard: {
        flexDirection: 'row', alignItems: 'center', backgroundColor: '#fff',
        borderRadius: 14, padding: 14, marginBottom: 10, elevation: 2,
        shadowColor: '#000', shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.07, shadowRadius: 4,
    },
    patientAvatar: {
        width: 48, height: 48, borderRadius: 24,
        backgroundColor: '#DBEAFE', alignItems: 'center', justifyContent: 'center', marginRight: 14,
    },
    patientAvatarText: { color: TEAL, fontWeight: '800', fontSize: 17 },
    patientInfo: { flex: 1 },
    patientName: { fontWeight: '700', fontSize: 15, color: '#111827' },
    patientEmail: { fontSize: 12, color: '#6B7280', marginTop: 2 },
    patientJoined: { fontSize: 11, color: '#9CA3AF', marginTop: 4 },
    patientChevron: { paddingLeft: 8 },
    chevronText: { fontSize: 26, color: '#9CA3AF', fontWeight: '300' },

    // Empty
    emptyBox: { alignItems: 'center', paddingVertical: 48 },
    emptyIcon: { fontSize: 48, marginBottom: 12 },
    emptyText: { fontSize: 16, color: '#6B7280', fontWeight: '600' },

    // Modal
    modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', padding: 28 },
    modalCard: { backgroundColor: '#fff', borderRadius: 24, padding: 24, alignItems: 'center' },
    modalAvatarBig: {
        width: 80, height: 80, borderRadius: 40,
        backgroundColor: '#DBEAFE', alignItems: 'center', justifyContent: 'center', marginBottom: 12,
    },
    modalAvatarBigText: { color: TEAL, fontWeight: '800', fontSize: 28 },
    modalName: { fontSize: 22, fontWeight: '800', color: '#111827', marginBottom: 20 },
    detailRow: { flexDirection: 'row', alignItems: 'center', width: '100%', marginBottom: 12, gap: 10 },
    detailIcon: { fontSize: 20 },
    detailText: { fontSize: 14, color: '#374151' },
    closeBtn: {
        marginTop: 20, backgroundColor: TEAL, borderRadius: 14,
        paddingVertical: 13, paddingHorizontal: 40,
    },
    closeBtnText: { color: '#fff', fontWeight: '700', fontSize: 15 },
});
