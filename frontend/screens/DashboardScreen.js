import React, { useState, useEffect, useCallback } from 'react';
import {
    View,
    Text,
    ScrollView,
    TouchableOpacity,
    StyleSheet,
    Dimensions,
    Modal,
    RefreshControl,
    ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Toast from 'react-native-toast-message';
import { BarChart, PieChart } from 'react-native-chart-kit';
import AsyncStorage from '@react-native-async-storage/async-storage';
import api from '../services/api';

const { width } = Dimensions.get('window');

// ─────────────────────────────────────────────
// COMPONENTS
// ─────────────────────────────────────────────

function ProgressBar({ label, progress, color }) {
    const percent = Math.round(progress * 100);
    return (
        <View style={styles.progressRow}>
            <View style={styles.progressLabelRow}>
                <Text style={styles.progressLabel}>{label}</Text>
                <Text style={[styles.progressPercent, { color }]}>{percent}%</Text>
            </View>
            <View style={styles.progressTrack}>
                <View style={[styles.progressFill, { width: `${percent}%`, backgroundColor: color }]} />
            </View>
        </View>
    );
}

function StatCard({ icon, label, value, color, loading }) {
    return (
        <View style={[styles.statCard, { borderLeftColor: color }]}>
            <Text style={styles.statIcon}>{icon}</Text>
            {loading ? (
                <ActivityIndicator size="small" color={color} style={styles.statLoader} />
            ) : (
                <Text style={[styles.statValue, { color }]}>{value}</Text>
            )}
            <Text style={styles.statLabel}>{label}</Text>
        </View>
    );
}

function Sidebar({ visible, activeTab, onTabPress, onClose, onLogout, user }) {
    const navItems = [
        { key: 'home', label: 'Dashboard', icon: '🏠' },
        { key: 'screening', label: 'Screening', icon: '📋' },
        { key: 'reports', label: 'Reports', icon: '📈' },
        { key: 'therapy', label: 'Therapy', icon: '💆' },
        { key: 'profile', label: 'Profile', icon: '👤' },
        { key: 'settings', label: 'Settings', icon: '⚙️' },
    ];

    return (
        <Modal transparent visible={visible} animationType="slide" onRequestClose={onClose}>
            <View style={styles.sidebarOverlay}>
                <TouchableOpacity style={styles.sidebarBackdrop} onPress={onClose} />
                <View style={styles.sidebarContainer}>
                    <View style={styles.sidebarHeader}>
                        <View style={styles.sidebarAvatar}>
                            <Text style={styles.sidebarAvatarText}>
                                {user?.name?.split(' ').map(n => n[0]).join('') || 'U'}
                            </Text>
                        </View>
                        <View style={styles.sidebarUserInfo}>
                            <Text style={styles.sidebarUserName}>{user?.name || 'User'}</Text>
                            <Text style={styles.sidebarUserRole}>{user?.role || 'Patient'}</Text>
                        </View>
                        <TouchableOpacity onPress={onClose} style={styles.sidebarCloseBtn}>
                            <Text style={styles.sidebarCloseText}>✕</Text>
                        </TouchableOpacity>
                    </View>

                    <View style={styles.sidebarDivider} />

                    <ScrollView style={styles.sidebarNav}>
                        {navItems.map((item) => (
                            <TouchableOpacity
                                key={item.key}
                                style={[
                                    styles.sidebarNavItem,
                                    activeTab === item.key && styles.sidebarNavItemActive,
                                ]}
                                onPress={() => {
                                    onTabPress(item.key);
                                    onClose();
                                }}
                            >
                                <Text style={styles.sidebarNavIcon}>{item.icon}</Text>
                                <Text
                                    style={[
                                        styles.sidebarNavLabel,
                                        activeTab === item.key && styles.sidebarNavLabelActive,
                                    ]}
                                >
                                    {item.label}
                                </Text>
                                {activeTab === item.key && <View style={styles.sidebarActiveIndicator} />}
                            </TouchableOpacity>
                        ))}
                    </ScrollView>

                    <View style={styles.sidebarDivider} />

                    <TouchableOpacity style={styles.sidebarLogout} onPress={onLogout}>
                        <Text style={styles.sidebarLogoutIcon}>🚪</Text>
                        <Text style={styles.sidebarLogoutText}>Sign Out</Text>
                    </TouchableOpacity>
                </View>
            </View>
        </Modal>
    );
}

function Header({ onMenuPress, onNotifPress, notificationCount }) {
    return (
        <View style={styles.header}>
            <TouchableOpacity onPress={onMenuPress} style={styles.menuBtn}>
                <View style={styles.menuLine} />
                <View style={[styles.menuLine, { width: 20 }]} />
                <View style={styles.menuLine} />
            </TouchableOpacity>

            <View style={styles.headerCenter}>
                <Text style={styles.headerLogo}>🌸</Text>
                <Text style={styles.headerTitle}>PeriCare</Text>
            </View>

            <TouchableOpacity onPress={onNotifPress} style={styles.notifBtn}>
                <Text style={styles.notifIcon}>🔔</Text>
                {notificationCount > 0 && (
                    <View style={styles.notifBadge}>
                        <Text style={styles.notifBadgeText}>{notificationCount}</Text>
                    </View>
                )}
            </TouchableOpacity>
        </View>
    );
}

function Footer({ activeTab, onTabPress }) {
    const footerItems = [
        { key: 'home', label: 'Dashboard', icon: '🏠' },
        { key: 'screening', label: 'Screening', icon: '📋' },
        { key: 'reports', label: 'Reports', icon: '📈' },
        { key: 'therapy', label: 'Therapy', icon: '💆' },
        { key: 'profile', label: 'Profile', icon: '👤' },
    ];

    return (
        <View style={styles.footer}>
            {footerItems.map((item) => (
                <TouchableOpacity
                    key={item.key}
                    style={styles.footerTab}
                    onPress={() => onTabPress(item.key)}
                >
                    <Text style={styles.footerTabIcon}>{item.icon}</Text>
                    <Text
                        style={[
                            styles.footerTabLabel,
                            activeTab === item.key && styles.footerTabLabelActive,
                        ]}
                    >
                        {item.label}
                    </Text>
                    {activeTab === item.key && <View style={styles.footerActiveBar} />}
                </TouchableOpacity>
            ))}
        </View>
    );
}

// ─────────────────────────────────────────────
// MAIN DASHBOARD SCREEN
// ─────────────────────────────────────────────
export default function DashboardScreen({ navigation }) {
    const [sidebarVisible, setSidebarVisible] = useState(false);
    const [activeTab, setActiveTab] = useState('home');
    const [refreshing, setRefreshing] = useState(false);
    const [loading, setLoading] = useState(true);
    
    // State for real data
    const [user, setUser] = useState(null);
    const [stats, setStats] = useState({
        screeningsDone: 0,
        riskScore: '0%',
        sessionsLeft: 0,
        moodStreak: '0 days'
    });
    const [chartData, setChartData] = useState({
        monthlyActivity: {
            labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
            datasets: [{ data: [0, 0, 0, 0, 0, 0] }]
        },
        riskBreakdown: [
            { name: 'Mild', population: 0, color: '#10B981' },
            { name: 'Moderate', population: 0, color: '#F59E0B' },
            { name: 'Severe', population: 0, color: '#EF4444' },
            { name: 'None', population: 0, color: '#7C3AED' },
        ]
    });
    const [progressData, setProgressData] = useState([
        { label: 'Anxiety Level', progress: 0, color: '#EF4444' },
        { label: 'Sleep Quality', progress: 0, color: '#10B981' },
        { label: 'Social Support', progress: 0, color: '#0EA5E9' },
        { label: 'Emotional Balance', progress: 0, color: '#7C3AED' },
    ]);
    const [recentActivities, setRecentActivities] = useState([]);
    const [notificationCount, setNotificationCount] = useState(0);
    const [lastVisit, setLastVisit] = useState('');

    // ── Fetch Dashboard Data ──
    const fetchDashboardData = useCallback(async () => {
        try {
            setLoading(true);
            
            // Get user data from AsyncStorage
            const userData = await AsyncStorage.getItem('user');
            if (userData) {
                setUser(JSON.parse(userData));
            }

            // Fetch real data from API
            const [statsRes, activityRes, progressRes, notificationsRes] = await Promise.all([
                api.get('/dashboard/stats').catch(() => null),
                api.get('/dashboard/activity').catch(() => null),
                api.get('/dashboard/progress').catch(() => null),
                api.get('/notifications/count').catch(() => null),
            ]);

            // Update stats
            if (statsRes?.data) {
                setStats({
                    screeningsDone: statsRes.data.screeningsDone || 0,
                    riskScore: statsRes.data.riskScore || '0%',
                    sessionsLeft: statsRes.data.sessionsLeft || 0,
                    moodStreak: statsRes.data.moodStreak || '0 days'
                });
            }

            // Update chart data
            if (activityRes?.data) {
                setChartData({
                    monthlyActivity: {
                        labels: activityRes.data.labels || chartData.monthlyActivity.labels,
                        datasets: [{ data: activityRes.data.values || [0,0,0,0,0,0] }]
                    },
                    riskBreakdown: activityRes.data.riskBreakdown || chartData.riskBreakdown
                });
            }

            // Update progress data
            if (progressRes?.data) {
                setProgressData(progressRes.data.indicators || progressData);
            }

            // Update recent activities
            if (activityRes?.data?.recentActivities) {
                setRecentActivities(activityRes.data.recentActivities);
            }

            // Update notifications
            if (notificationsRes?.data) {
                setNotificationCount(notificationsRes.data.count || 0);
            }

            // Get last visit from AsyncStorage
            const lastVisitStr = await AsyncStorage.getItem('lastVisit');
            if (lastVisitStr) {
                setLastVisit(lastVisitStr);
            }

        } catch (error) {
            console.error('Error fetching dashboard data:', error);
            Toast.show({
                type: 'error',
                text1: 'Error',
                text2: 'Failed to load dashboard data',
                position: 'top',
            });
        } finally {
            setLoading(false);
        }
    }, []);

    // ── Initial Load ──
    useEffect(() => {
        fetchDashboardData();
    }, []);

    // ── Pull to Refresh ──
    const onRefresh = useCallback(async () => {
        setRefreshing(true);
        await fetchDashboardData();
        setRefreshing(false);
    }, []);

    // ── Handle Logout ──
    const handleLogout = async () => {
        try {
            setSidebarVisible(false);
            
            // Clear AsyncStorage
            await AsyncStorage.multiRemove(['user', 'token', 'lastVisit']);
            
            // Call logout API
            await api.post('/user/logout').catch(() => {});
            
            Toast.show({
                type: 'success',
                text1: 'Signed Out',
                text2: 'You have been signed out successfully.',
                position: 'top',
            });
            
            setTimeout(() => {
                navigation.replace('Login');
            }, 1500);
        } catch (error) {
            console.error('Logout error:', error);
        }
    };

    // ── Handle Tab Press ──
    const handleTabPress = (tab) => {
        setActiveTab(tab);
        
        if (tab !== 'home') {
            Toast.show({
                type: 'info',
                text1: `${tab.charAt(0).toUpperCase() + tab.slice(1)}`,
                text2: 'This section is coming soon!',
                position: 'bottom',
            });
        }
    };

    // ── Handle Notification Press ──
    const handleNotifPress = async () => {
        try {
            const response = await api.get('/notifications');
            // Navigate to notifications screen or show modal
            Toast.show({
                type: 'info',
                text1: '🔔 Notifications',
                text2: `You have ${notificationCount} new notifications`,
                position: 'top',
            });
        } catch (error) {
            console.error('Error fetching notifications:', error);
        }
    };

    // Chart Configuration
    const chartConfig = {
        backgroundGradientFrom: '#fff',
        backgroundGradientTo: '#fff',
        decimalPlaces: 0,
        color: (opacity = 1) => `rgba(124, 58, 237, ${opacity})`,
        labelColor: (opacity = 1) => `rgba(55, 65, 81, ${opacity})`,
        style: { borderRadius: 16 },
        propsForDots: { r: '5', strokeWidth: '2', stroke: '#7C3AED' },
        barPercentage: 0.6,
    };

    // Loading State
    if (loading && !refreshing) {
        return (
            <SafeAreaView style={[styles.safeArea, styles.centerContent]}>
                <ActivityIndicator size="large" color="#7C3AED" />
                <Text style={styles.loadingText}>Loading your dashboard...</Text>
            </SafeAreaView>
        );
    }

    return (
        <SafeAreaView style={styles.safeArea}>
            {/* Sidebar */}
            <Sidebar
                visible={sidebarVisible}
                activeTab={activeTab}
                onTabPress={handleTabPress}
                onClose={() => setSidebarVisible(false)}
                onLogout={handleLogout}
                user={user}
            />

            {/* Header */}
            <Header
                onMenuPress={() => setSidebarVisible(true)}
                onNotifPress={handleNotifPress}
                notificationCount={notificationCount}
            />

            {/* Main Content */}
            <ScrollView
                style={styles.scrollView}
                contentContainerStyle={styles.scrollContent}
                showsVerticalScrollIndicator={false}
                refreshControl={
                    <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={['#7C3AED']} />
                }
            >
                {/* Greeting Banner */}
                <View style={styles.greetingBanner}>
                    <View style={styles.greetingTextContainer}>
                        <Text style={styles.greetingHello}>
                            Hello, {user?.name?.split(' ')[0] || 'User'} 👋
                        </Text>
                        <Text style={styles.greetingSubtitle}>Here's your health overview</Text>
                        {lastVisit ? (
                            <Text style={styles.greetingDate}>Last visit: {lastVisit}</Text>
                        ) : null}
                    </View>
                    <View style={styles.greetingAvatarLarge}>
                        <Text style={styles.greetingAvatarText}>
                            {user?.name?.split(' ').map(n => n[0]).join('') || 'U'}
                        </Text>
                    </View>
                </View>

                <View style={{ height: 20 }} />
            </ScrollView>

            {/* Footer */}
            <Footer activeTab={activeTab} onTabPress={handleTabPress} />

            {/* Toast */}
            <Toast />
        </SafeAreaView>
    );
}

// ─────────────────────────────────────────────
// STYLES
// ─────────────────────────────────────────────
const PURPLE = '#7C3AED';
const BG = '#F3F4F6';
const WHITE = '#FFFFFF';

const styles = StyleSheet.create({
    safeArea: {
        flex: 1,
        backgroundColor: BG,
    },
    centerContent: {
        justifyContent: 'center',
        alignItems: 'center',
    },
    loadingText: {
        marginTop: 12,
        fontSize: 14,
        color: '#6B7280',
    },

    // ── Header ──
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        backgroundColor: WHITE,
        paddingHorizontal: 16,
        paddingVertical: 12,
        elevation: 4,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
    },
    menuBtn: {
        padding: 8,
        gap: 4,
    },
    menuLine: {
        width: 24,
        height: 2.5,
        backgroundColor: '#374151',
        borderRadius: 2,
        marginVertical: 2,
    },
    headerCenter: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
    },
    headerLogo: {
        fontSize: 22,
    },
    headerTitle: {
        fontSize: 20,
        fontWeight: '800',
        color: PURPLE,
        letterSpacing: 0.5,
    },
    notifBtn: {
        padding: 8,
        position: 'relative',
    },
    notifIcon: {
        fontSize: 22,
    },
    notifBadge: {
        position: 'absolute',
        top: 4,
        right: 4,
        backgroundColor: '#EF4444',
        borderRadius: 8,
        width: 16,
        height: 16,
        alignItems: 'center',
        justifyContent: 'center',
    },
    notifBadgeText: {
        color: WHITE,
        fontSize: 10,
        fontWeight: 'bold',
    },

    // ── Sidebar Styles ──
    sidebarOverlay: {
        flex: 1,
        flexDirection: 'row',
    },
    sidebarBackdrop: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.45)',
    },
    sidebarContainer: {
        width: 280,
        backgroundColor: WHITE,
        paddingTop: 40,
        paddingBottom: 24,
        elevation: 16,
        shadowColor: '#000',
        shadowOffset: { width: -4, height: 0 },
        shadowOpacity: 0.2,
        shadowRadius: 12,
    },
    sidebarHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 16,
        paddingBottom: 16,
    },
    sidebarAvatar: {
        width: 48,
        height: 48,
        borderRadius: 24,
        backgroundColor: PURPLE,
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: 12,
    },
    sidebarAvatarText: {
        color: WHITE,
        fontWeight: 'bold',
        fontSize: 16,
    },
    sidebarUserInfo: {
        flex: 1,
    },
    sidebarUserName: {
        fontWeight: '700',
        fontSize: 15,
        color: '#111827',
    },
    sidebarUserRole: {
        fontSize: 12,
        color: '#6B7280',
        marginTop: 2,
    },
    sidebarCloseBtn: {
        padding: 6,
    },
    sidebarCloseText: {
        fontSize: 18,
        color: '#374151',
    },
    sidebarDivider: {
        height: 1,
        backgroundColor: '#E5E7EB',
        marginVertical: 8,
    },
    sidebarNav: {
        flex: 1,
    },
    sidebarNavItem: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 13,
        paddingHorizontal: 20,
        position: 'relative',
    },
    sidebarNavItemActive: {
        backgroundColor: '#EDE9FE',
        borderRadius: 0,
    },
    sidebarNavIcon: {
        fontSize: 20,
        marginRight: 14,
    },
    sidebarNavLabel: {
        fontSize: 15,
        color: '#374151',
        fontWeight: '500',
    },
    sidebarNavLabelActive: {
        color: PURPLE,
        fontWeight: '700',
    },
    sidebarActiveIndicator: {
        position: 'absolute',
        right: 0,
        top: 0,
        bottom: 0,
        width: 4,
        backgroundColor: PURPLE,
        borderTopLeftRadius: 4,
        borderBottomLeftRadius: 4,
    },
    sidebarLogout: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 20,
        paddingVertical: 16,
    },
    sidebarLogoutIcon: {
        fontSize: 20,
        marginRight: 14,
    },
    sidebarLogoutText: {
        fontSize: 15,
        color: '#EF4444',
        fontWeight: '600',
    },

    // ── Scroll View ──
    scrollView: {
        flex: 1,
    },
    scrollContent: {
        paddingHorizontal: 16,
        paddingTop: 16,
    },

    // ── Greeting Banner ──
    greetingBanner: {
        backgroundColor: PURPLE,
        borderRadius: 20,
        padding: 20,
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 20,
        overflow: 'hidden',
    },
    greetingTextContainer: {
        flex: 1,
    },
    greetingHello: {
        color: WHITE,
        fontSize: 20,
        fontWeight: '800',
        marginBottom: 4,
    },
    greetingSubtitle: {
        color: 'rgba(255,255,255,0.85)',
        fontSize: 13,
        marginBottom: 6,
    },
    greetingDate: {
        color: 'rgba(255,255,255,0.65)',
        fontSize: 11,
    },
    greetingAvatarLarge: {
        width: 64,
        height: 64,
        borderRadius: 32,
        backgroundColor: 'rgba(255,255,255,0.25)',
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 2,
        borderColor: 'rgba(255,255,255,0.5)',
    },
    greetingAvatarText: {
        color: WHITE,
        fontWeight: 'bold',
        fontSize: 22,
    },

    // ── Section Title ──
    sectionTitle: {
        fontSize: 16,
        fontWeight: '700',
        color: '#111827',
        marginBottom: 12,
        marginTop: 4,
    },

    // ── Stats Grid ──
    statsGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 10,
        marginBottom: 20,
    },
    statCard: {
        backgroundColor: WHITE,
        borderRadius: 14,
        padding: 14,
        width: (width - 48) / 2,
        borderLeftWidth: 4,
        elevation: 2,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.07,
        shadowRadius: 4,
    },
    statIcon: {
        fontSize: 24,
        marginBottom: 6,
    },
    statValue: {
        fontSize: 22,
        fontWeight: '800',
        marginBottom: 2,
    },
    statLabel: {
        fontSize: 12,
        color: '#6B7280',
        fontWeight: '500',
    },
    statLoader: {
        marginVertical: 8,
    },

    // ── Chart Card ──
    chartCard: {
        backgroundColor: WHITE,
        borderRadius: 16,
        padding: 16,
        marginBottom: 20,
        elevation: 2,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.07,
        shadowRadius: 4,
        alignItems: 'center',
        minHeight: 200,
        justifyContent: 'center',
    },
    chart: {
        borderRadius: 12,
    },

    // ── Progress Card ──
    progressCard: {
        backgroundColor: WHITE,
        borderRadius: 16,
        padding: 16,
        marginBottom: 20,
        elevation: 2,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.07,
        shadowRadius: 4,
    },
    progressRow: {
        marginBottom: 16,
    },
    progressLabelRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 6,
    },
    progressLabel: {
        fontSize: 13,
        fontWeight: '600',
        color: '#374151',
    },
    progressPercent: {
        fontSize: 13,
        fontWeight: '700',
    },
    progressTrack: {
        height: 8,
        backgroundColor: '#E5E7EB',
        borderRadius: 4,
        overflow: 'hidden',
    },
    progressFill: {
        height: '100%',
        borderRadius: 4,
    },

    // ── Activity Card ──
    activityCard: {
        backgroundColor: WHITE,
        borderRadius: 16,
        padding: 16,
        marginBottom: 20,
        elevation: 2,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.07,
        shadowRadius: 4,
    },
    activityRow: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 10,
        borderBottomWidth: 1,
        borderBottomColor: '#F3F4F6',
    },
    activityIconBox: {
        width: 42,
        height: 42,
        borderRadius: 12,
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: 12,
    },
    activityIcon: {
        fontSize: 20,
    },
    activityInfo: {
        flex: 1,
    },
    activityTitle: {
        fontSize: 14,
        fontWeight: '600',
        color: '#111827',
        marginBottom: 2,
    },
    activityTime: {
        fontSize: 12,
        color: '#9CA3AF',
    },
    activityDot: {
        width: 8,
        height: 8,
        borderRadius: 4,
    },
    emptyText: {
        textAlign: 'center',
        color: '#9CA3AF',
        padding: 20,
    },

    // ── Quick Actions ──
    quickActions: {
        flexDirection: 'row',
        gap: 10,
        marginBottom: 10,
    },
    quickActionBtn: {
        flex: 1,
        borderRadius: 14,
        padding: 14,
        alignItems: 'center',
        elevation: 3,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.15,
        shadowRadius: 4,
    },
    quickActionIcon: {
        fontSize: 24,
        marginBottom: 6,
    },
    quickActionText: {
        color: WHITE,
        fontSize: 11,
        fontWeight: '700',
        textAlign: 'center',
    },

    // ── Footer ──
    footer: {
        flexDirection: 'row',
        backgroundColor: WHITE,
        paddingVertical: 8,
        paddingHorizontal: 8,
        borderTopWidth: 1,
        borderTopColor: '#E5E7EB',
        elevation: 8,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: -2 },
        shadowOpacity: 0.08,
        shadowRadius: 4,
    },
    footerTab: {
        flex: 1,
        alignItems: 'center',
        paddingVertical: 4,
        position: 'relative',
    },
    footerTabIcon: {
        fontSize: 20,
        marginBottom: 2,
    },
    footerTabLabel: {
        fontSize: 10,
        color: '#9CA3AF',
        fontWeight: '500',
    },
    footerTabLabelActive: {
        color: PURPLE,
        fontWeight: '700',
    },
    footerActiveBar: {
        position: 'absolute',
        top: -8,
        width: 32,
        height: 3,
        backgroundColor: PURPLE,
        borderRadius: 2,
    },
});