import React, { useState, useEffect, useCallback } from 'react';
import {
    View, Text, ScrollView, TouchableOpacity, StyleSheet,
    ActivityIndicator, Modal, TextInput, Alert, RefreshControl,
    Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Toast from 'react-native-toast-message';
import api, { setAuthToken } from '../services/api';
import { useAuth } from '../context/AuthContext';

const { width } = Dimensions.get('window');

const ROLES = ['patient', 'midwife', 'admin', 'manager', 'doctor'];
const ROLE_COLORS = {
    admin: '#7C3AED',
    midwife: '#0EA5E9',
    patient: '#10B981',
    manager: '#F59E0B',
    doctor: '#EF4444',
};
const ROLE_ICONS = {
    admin: '🛡️',
    midwife: '👩‍⚕️',
    patient: '🤰',
    manager: '📋',
    doctor: '🩺',
};

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

// ─── User Row ─────────────────────────────────
function UserRow({ user, onEdit, onDelete }) {
    const roleColor = ROLE_COLORS[user.role] || '#6B7280';
    const roleIcon = ROLE_ICONS[user.role] || '👤';
    const initials = user.username?.slice(0, 2).toUpperCase() || '??';
    return (
        <View style={styles.userRow}>
            <View style={[styles.avatar, { backgroundColor: roleColor + '22' }]}>
                <Text style={[styles.avatarText, { color: roleColor }]}>{initials}</Text>
            </View>
            <View style={styles.userInfo}>
                <Text style={styles.userName}>{user.username}</Text>
                <Text style={styles.userEmail} numberOfLines={1}>{user.email}</Text>
                <View style={[styles.roleBadge, { backgroundColor: roleColor + '22' }]}>
                    <Text style={[styles.roleBadgeText, { color: roleColor }]}>
                        {roleIcon} {user.role}
                    </Text>
                </View>
            </View>
            <View style={styles.userActions}>
                <TouchableOpacity style={styles.editBtn} onPress={() => onEdit(user)}>
                    <Text style={styles.editBtnText}>✏️</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.deleteBtn} onPress={() => onDelete(user)}>
                    <Text style={styles.deleteBtnText}>🗑️</Text>
                </TouchableOpacity>
            </View>
        </View>
    );
}

// ─── Edit Modal ───────────────────────────────
function EditModal({ visible, user, onClose, onSave }) {
    const [username, setUsername] = useState('');
    const [role, setRole] = useState('patient');

    useEffect(() => {
        if (user) { setUsername(user.username); setRole(user.role); }
    }, [user]);

    return (
        <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
            <View style={styles.modalOverlay}>
                <View style={styles.modalCard}>
                    <Text style={styles.modalTitle}>✏️ Edit User</Text>

                    <Text style={styles.modalLabel}>Username</Text>
                    <TextInput
                        style={styles.modalInput}
                        value={username}
                        onChangeText={setUsername}
                        placeholder="Username"
                        placeholderTextColor="#9CA3AF"
                    />

                    <Text style={styles.modalLabel}>Role</Text>
                    <View style={styles.roleGrid}>
                        {ROLES.map(r => (
                            <TouchableOpacity
                                key={r}
                                style={[styles.roleChip, role === r && { backgroundColor: ROLE_COLORS[r], borderColor: ROLE_COLORS[r] }]}
                                onPress={() => setRole(r)}
                            >
                                <Text style={[styles.roleChipText, role === r && { color: '#fff' }]}>
                                    {ROLE_ICONS[r]} {r}
                                </Text>
                            </TouchableOpacity>
                        ))}
                    </View>

                    <View style={styles.modalBtns}>
                        <TouchableOpacity style={styles.cancelBtn} onPress={onClose}>
                            <Text style={styles.cancelBtnText}>Cancel</Text>
                        </TouchableOpacity>
                        <TouchableOpacity style={styles.saveBtn} onPress={() => onSave({ username, role })}>
                            <Text style={styles.saveBtnText}>Save</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </View>
        </Modal>
    );
}

// ─── Create Modal ─────────────────────────────
function CreateModal({ visible, onClose, onCreated }) {
    const [username, setUsername] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [role, setRole] = useState('patient');
    const [loading, setLoading] = useState(false);

    const handleCreate = async () => {
        if (!username || !email || !password) {
            Toast.show({ type: 'error', text1: 'All fields required', position: 'top' });
            return;
        }
        setLoading(true);
        try {
            await api.post('/admin/users', { username, email, password, role });
            Toast.show({ type: 'success', text1: '✅ User created', position: 'top' });
            setUsername(''); setEmail(''); setPassword(''); setRole('patient');
            onCreated();
            onClose();
        } catch (err) {
            Toast.show({ type: 'error', text1: err.response?.data?.message || 'Create failed', position: 'top' });
        } finally {
            setLoading(false);
        }
    };

    return (
        <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
            <View style={styles.modalOverlay}>
                <ScrollView contentContainerStyle={{ flexGrow: 1, justifyContent: 'center' }}>
                    <View style={styles.modalCard}>
                        <Text style={styles.modalTitle}>➕ Create User</Text>

                        {[
                            { label: 'Username', value: username, set: setUsername, placeholder: 'e.g. janedoe' },
                            { label: 'Email', value: email, set: setEmail, placeholder: 'e.g. jane@example.com', keyboardType: 'email-address' },
                            { label: 'Password', value: password, set: setPassword, placeholder: 'min 6 chars', secure: true },
                        ].map(f => (
                            <View key={f.label}>
                                <Text style={styles.modalLabel}>{f.label}</Text>
                                <TextInput
                                    style={styles.modalInput}
                                    value={f.value}
                                    onChangeText={f.set}
                                    placeholder={f.placeholder}
                                    placeholderTextColor="#9CA3AF"
                                    keyboardType={f.keyboardType || 'default'}
                                    secureTextEntry={f.secure}
                                    autoCapitalize="none"
                                />
                            </View>
                        ))}

                        <Text style={styles.modalLabel}>Role</Text>
                        <View style={styles.roleGrid}>
                            {ROLES.map(r => (
                                <TouchableOpacity
                                    key={r}
                                    style={[styles.roleChip, role === r && { backgroundColor: ROLE_COLORS[r], borderColor: ROLE_COLORS[r] }]}
                                    onPress={() => setRole(r)}
                                >
                                    <Text style={[styles.roleChipText, role === r && { color: '#fff' }]}>
                                        {ROLE_ICONS[r]} {r}
                                    </Text>
                                </TouchableOpacity>
                            ))}
                        </View>

                        <View style={styles.modalBtns}>
                            <TouchableOpacity style={styles.cancelBtn} onPress={onClose}>
                                <Text style={styles.cancelBtnText}>Cancel</Text>
                            </TouchableOpacity>
                            <TouchableOpacity style={styles.saveBtn} onPress={handleCreate} disabled={loading}>
                                {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.saveBtnText}>Create</Text>}
                            </TouchableOpacity>
                        </View>
                    </View>
                </ScrollView>
            </View>
        </Modal>
    );
}

// ─── MAIN SCREEN ──────────────────────────────
export default function AdminDashboardScreen({ navigation }) {
    const { user: authUser, token, logout } = useAuth();
    const [stats, setStats] = useState(null);
    const [users, setUsers] = useState([]);
    const [filter, setFilter] = useState('all');
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [editTarget, setEditTarget] = useState(null);
    const [showCreate, setShowCreate] = useState(false);
    const [searchText, setSearchText] = useState('');

    // Ensure token is set globally before any API call
    useEffect(() => { if (token) setAuthToken(token); }, [token]);

    const fetchData = useCallback(async () => {
        try {
            const [statsRes, usersRes] = await Promise.all([
                api.get('/admin/stats'),
                api.get('/admin/users'),
            ]);
            setStats(statsRes.data);
            setUsers(usersRes.data);
        } catch (err) {
            Toast.show({ type: 'error', text1: 'Failed to load data', text2: err.response?.data?.message, position: 'top' });
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    }, []);

    useEffect(() => { fetchData(); }, [fetchData]);

    const onRefresh = () => { setRefreshing(true); fetchData(); };

    const handleDelete = (user) => {
        Alert.alert('Delete User', `Delete "${user.username}"?`, [
            { text: 'Cancel', style: 'cancel' },
            {
                text: 'Delete', style: 'destructive', onPress: async () => {
                    try {
                        await api.delete(`/admin/users/${user._id}`);
                        Toast.show({ type: 'success', text1: '🗑️ User deleted', position: 'top' });
                        fetchData();
                    } catch (err) {
                        Toast.show({ type: 'error', text1: 'Delete failed', position: 'top' });
                    }
                },
            },
        ]);
    };

    const handleSaveEdit = async (updates) => {
        try {
            await api.patch(`/admin/users/${editTarget._id}`, updates);
            Toast.show({ type: 'success', text1: '✅ User updated', position: 'top' });
            setEditTarget(null);
            fetchData();
        } catch (err) {
            Toast.show({ type: 'error', text1: 'Update failed', position: 'top' });
        }
    };

    const handleLogout = () => {
        logout();
        navigation.replace('Login');
    };

    const filteredUsers = users
        .filter(u => filter === 'all' || u.role === filter)
        .filter(u =>
            u.username?.toLowerCase().includes(searchText.toLowerCase()) ||
            u.email?.toLowerCase().includes(searchText.toLowerCase())
        );

    const filterTabs = [
        { key: 'all', label: 'All', icon: '👥' },
        { key: 'patient', label: 'Patients', icon: '🤰' },
        { key: 'midwife', label: 'Midwives', icon: '👩‍⚕️' },
        { key: 'admin', label: 'Admins', icon: '🛡️' },
    ];

    return (
        <SafeAreaView style={styles.safe}>
            {/* ── Header ── */}
            <View style={styles.header}>
                <View>
                    <Text style={styles.headerTitle}>🛡️ Admin Panel</Text>
                    <Text style={styles.headerSub}>Welcome, {authUser?.username || 'Admin'}</Text>
                </View>
                <TouchableOpacity style={styles.logoutBtn} onPress={handleLogout}>
                    <Text style={styles.logoutText}>Sign Out</Text>
                </TouchableOpacity>
            </View>

            <ScrollView
                contentContainerStyle={styles.scroll}
                showsVerticalScrollIndicator={false}
                refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={['#7C3AED']} />}
            >
                {/* ── Stats ── */}
                {stats && (
                    <View style={styles.statsRow}>
                        <StatCard icon="👥" label="Total Users" value={stats.totalUsers} color="#7C3AED" />
                        <StatCard icon="🤰" label="Patients" value={stats.totalPatients} color="#10B981" />
                        <StatCard icon="👩‍⚕️" label="Midwives" value={stats.totalMidwives} color="#0EA5E9" />
                        <StatCard icon="🛡️" label="Admins" value={stats.totalAdmins} color="#F59E0B" />
                    </View>
                )}

                {/* ── Create Button ── */}
                <TouchableOpacity style={styles.createBtn} onPress={() => setShowCreate(true)}>
                    <Text style={styles.createBtnText}>➕  Create New User</Text>
                </TouchableOpacity>

                {/* ── Search ── */}
                <View style={styles.searchBox}>
                    <Text style={styles.searchIcon}>🔍</Text>
                    <TextInput
                        style={styles.searchInput}
                        placeholder="Search by name or email…"
                        placeholderTextColor="#9CA3AF"
                        value={searchText}
                        onChangeText={setSearchText}
                        autoCapitalize="none"
                    />
                </View>

                {/* ── Filter Tabs ── */}
                <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filterRow}>
                    {filterTabs.map(t => (
                        <TouchableOpacity
                            key={t.key}
                            style={[styles.filterTab, filter === t.key && styles.filterTabActive]}
                            onPress={() => setFilter(t.key)}
                        >
                            <Text style={[styles.filterTabText, filter === t.key && styles.filterTabTextActive]}>
                                {t.icon} {t.label}
                            </Text>
                        </TouchableOpacity>
                    ))}
                </ScrollView>

                {/* ── User List ── */}
                <Text style={styles.sectionTitle}>
                    {filteredUsers.length} {filter === 'all' ? 'Users' : filter.charAt(0).toUpperCase() + filter.slice(1) + 's'}
                </Text>

                {loading ? (
                    <ActivityIndicator size="large" color="#7C3AED" style={{ marginTop: 40 }} />
                ) : filteredUsers.length === 0 ? (
                    <View style={styles.emptyBox}>
                        <Text style={styles.emptyIcon}>😶</Text>
                        <Text style={styles.emptyText}>No users found</Text>
                    </View>
                ) : (
                    filteredUsers.map(u => (
                        <UserRow
                            key={u._id}
                            user={u}
                            onEdit={setEditTarget}
                            onDelete={handleDelete}
                        />
                    ))
                )}

                <View style={{ height: 32 }} />
            </ScrollView>

            {/* ── Modals ── */}
            <EditModal
                visible={!!editTarget}
                user={editTarget}
                onClose={() => setEditTarget(null)}
                onSave={handleSaveEdit}
            />
            <CreateModal
                visible={showCreate}
                onClose={() => setShowCreate(false)}
                onCreated={fetchData}
            />

            <Toast />
        </SafeAreaView>
    );
}

// ─── Styles ───────────────────────────────────
const PURPLE = '#7C3AED';
const styles = StyleSheet.create({
    safe: { flex: 1, backgroundColor: '#F3F4F6' },

    // Header
    header: {
        flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
        backgroundColor: PURPLE, paddingHorizontal: 20, paddingVertical: 16,
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
    statsRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginBottom: 16 },
    statCard: {
        backgroundColor: '#fff', borderRadius: 14, padding: 14,
        width: (width - 48) / 2, borderTopWidth: 4,
        elevation: 2, shadowColor: '#000', shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.07, shadowRadius: 4, alignItems: 'center',
    },
    statIcon: { fontSize: 24, marginBottom: 6 },
    statValue: { fontSize: 24, fontWeight: '800', marginBottom: 2 },
    statLabel: { fontSize: 12, color: '#6B7280', fontWeight: '500' },

    // Create button
    createBtn: {
        backgroundColor: PURPLE, borderRadius: 14, paddingVertical: 14,
        alignItems: 'center', marginBottom: 14, elevation: 3,
        shadowColor: PURPLE, shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3, shadowRadius: 8,
    },
    createBtnText: { color: '#fff', fontWeight: '700', fontSize: 15 },

    // Search
    searchBox: {
        flexDirection: 'row', alignItems: 'center', backgroundColor: '#fff',
        borderRadius: 12, paddingHorizontal: 14, marginBottom: 14,
        elevation: 1, shadowColor: '#000', shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05, shadowRadius: 4,
    },
    searchIcon: { fontSize: 18, marginRight: 8 },
    searchInput: { flex: 1, paddingVertical: 12, fontSize: 14, color: '#111827' },

    // Filter tabs
    filterRow: { marginBottom: 14 },
    filterTab: {
        paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20,
        backgroundColor: '#fff', marginRight: 8, borderWidth: 1.5, borderColor: '#E5E7EB',
    },
    filterTabActive: { backgroundColor: PURPLE, borderColor: PURPLE },
    filterTabText: { fontSize: 13, color: '#374151', fontWeight: '600' },
    filterTabTextActive: { color: '#fff' },

    // Section title
    sectionTitle: { fontSize: 16, fontWeight: '700', color: '#111827', marginBottom: 10 },

    // User row
    userRow: {
        flexDirection: 'row', alignItems: 'center', backgroundColor: '#fff',
        borderRadius: 14, padding: 14, marginBottom: 10, elevation: 1,
        shadowColor: '#000', shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.06, shadowRadius: 4,
    },
    avatar: { width: 46, height: 46, borderRadius: 23, alignItems: 'center', justifyContent: 'center', marginRight: 12 },
    avatarText: { fontWeight: '800', fontSize: 16 },
    userInfo: { flex: 1 },
    userName: { fontWeight: '700', fontSize: 14, color: '#111827' },
    userEmail: { fontSize: 12, color: '#6B7280', marginTop: 2 },
    roleBadge: { alignSelf: 'flex-start', paddingHorizontal: 8, paddingVertical: 3, borderRadius: 8, marginTop: 5 },
    roleBadgeText: { fontSize: 11, fontWeight: '700' },
    userActions: { flexDirection: 'row', gap: 8 },
    editBtn: { backgroundColor: '#EDE9FE', padding: 8, borderRadius: 10 },
    editBtnText: { fontSize: 16 },
    deleteBtn: { backgroundColor: '#FEE2E2', padding: 8, borderRadius: 10 },
    deleteBtnText: { fontSize: 16 },

    // Empty
    emptyBox: { alignItems: 'center', paddingVertical: 48 },
    emptyIcon: { fontSize: 48, marginBottom: 12 },
    emptyText: { fontSize: 16, color: '#6B7280', fontWeight: '600' },

    // Modal
    modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', padding: 24 },
    modalCard: { backgroundColor: '#fff', borderRadius: 20, padding: 24 },
    modalTitle: { fontSize: 20, fontWeight: '800', color: '#111827', marginBottom: 16 },
    modalLabel: { fontSize: 13, fontWeight: '600', color: '#374151', marginBottom: 6 },
    modalInput: {
        borderWidth: 1.5, borderColor: '#E5E7EB', borderRadius: 12,
        padding: 12, fontSize: 14, backgroundColor: '#F9FAFB',
        color: '#111827', marginBottom: 14,
    },
    roleGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 20 },
    roleChip: { paddingHorizontal: 12, paddingVertical: 7, borderRadius: 20, borderWidth: 1.5, borderColor: '#E5E7EB' },
    roleChipText: { fontSize: 13, color: '#374151', fontWeight: '600' },
    modalBtns: { flexDirection: 'row', gap: 12, marginTop: 4 },
    cancelBtn: { flex: 1, paddingVertical: 13, borderRadius: 12, backgroundColor: '#F3F4F6', alignItems: 'center' },
    cancelBtnText: { fontWeight: '700', color: '#374151' },
    saveBtn: { flex: 1, paddingVertical: 13, borderRadius: 12, backgroundColor: PURPLE, alignItems: 'center' },
    saveBtnText: { fontWeight: '700', color: '#fff' },
});
