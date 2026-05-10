import React, { useState } from 'react';
import {
    View,
    Text,
    ScrollView,
    TouchableOpacity,
    StyleSheet,
    Dimensions,
    Image,
    Modal,
    Animated,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Toast from 'react-native-toast-message';
import { BarChart, PieChart } from 'react-native-chart-kit';
import { useTranslation } from 'react-i18next';

const { width } = Dimensions.get('window');

// ─────────────────────────────────────────────
// MOCK DATA
// ─────────────────────────────────────────────
const mockUser = {
    name: 'සාරා ජොන්සන්',
    role: 'රෝගියා',
    avatar: null,
    lastVisit: '2026 පෙබරවාරි 28',
};

const mockStats = (t) => [
    { label: t('Screenings Done'), value: 12, icon: '📋', color: '#7C3AED' },
    { label: t('Risk Score'), value: '34%', icon: '📊', color: '#0EA5E9' },
    { label: t('Sessions Left'), value: 5, icon: '🕐', color: '#10B981' },
    { label: t('Mood Streak'), value: '7 ' + t('days'), icon: '🌟', color: '#F59E0B' },
];

const barChartData = (t) => ({
    labels: [t('Jan'), t('Feb'), t('Mar'), t('Apr'), t('May'), t('Jun')],
    datasets: [
        {
            data: [30, 45, 28, 60, 40, 55],
        },
    ],
});

const pieChartData = (t) => [
    { name: t('Low'), population: 35, color: '#10B981', legendFontColor: '#374151', legendFontSize: 13 },
    { name: t('Medium'), population: 40, color: '#F59E0B', legendFontColor: '#374151', legendFontSize: 13 },
    { name: t('High'), population: 15, color: '#EF4444', legendFontColor: '#374151', legendFontSize: 13 },
    { name: t('None'), population: 10, color: '#7C3AED', legendFontColor: '#374151', legendFontSize: 13 },
];

const progressData = (t) => [
    { label: t('Anxiety Level'), progress: 0.62, color: '#EF4444' },
    { label: t('Sleep Quality'), progress: 0.75, color: '#10B981' },
    { label: t('Social Support'), progress: 0.48, color: '#0EA5E9' },
    { label: t('Emotional Balance'), progress: 0.83, color: '#7C3AED' },
];

const recentActivities = (t) => [
    { id: 1, title: t('EPDS Screening Completed'), time: t('2 hours ago'), icon: '✅', color: '#10B981' },
    { id: 2, title: t('Therapy Session Scheduled'), time: t('Yesterday'), icon: '📅', color: '#0EA5E9' },
    { id: 3, title: t('Mood Log Updated'), time: t('2 days ago'), icon: '😊', color: '#F59E0B' },
    { id: 4, title: t('Doctor Note Added'), time: t('3 days ago'), icon: '📝', color: '#7C3AED' },
];

const navItems = (t) => [
    { key: 'home', label: t('Dashboard'), icon: '🏠' },
    { key: 'screening', label: t('Screening'), icon: '📋' },
    { key: 'diary', label: t('My Diary'), icon: '📔' },
    { key: 'plan', label: t('My Plans'), icon: '📅' },
    { key: 'profile', label: t('Profile'), icon: '👤' },
    { key: 'settings', label: t('Settings'), icon: '⚙️' },
];

// ─────────────────────────────────────────────
// PROGRESS BAR COMPONENT
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

// ─────────────────────────────────────────────
// STAT CARD COMPONENT
// ─────────────────────────────────────────────
function StatCard({ icon, label, value, color }) {
    return (
        <View style={[styles.statCard, { borderLeftColor: color }]}>
            <Text style={styles.statIcon}>{icon}</Text>
            <Text style={[styles.statValue, { color }]}>{value}</Text>
            <Text style={styles.statLabel}>{label}</Text>
        </View>
    );
}

// ─────────────────────────────────────────────
// SIDEBAR COMPONENT
// ─────────────────────────────────────────────
function Sidebar({ visible, activeTab, onTabPress, onClose, onLogout }) {
    const { t } = useTranslation();
    return (
        <Modal
            transparent
            visible={visible}
            animationType="slide"
            onRequestClose={onClose}
        >
            <View style={styles.sidebarOverlay}>
                <TouchableOpacity style={styles.sidebarBackdrop} onPress={onClose} />
                <View style={styles.sidebarContainer}>
                    {/* Sidebar Header */}
                    <View style={styles.sidebarHeader}>
                        <View style={styles.sidebarAvatar}>
                            <Text style={styles.sidebarAvatarText}>SJ</Text>
                        </View>
                        <View style={styles.sidebarUserInfo}>
                            <Text style={styles.sidebarUserName}>{mockUser.name}</Text>
                            <Text style={styles.sidebarUserRole}>{mockUser.role}</Text>
                        </View>
                        <TouchableOpacity onPress={onClose} style={styles.sidebarCloseBtn}>
                            <Text style={styles.sidebarCloseText}>✕</Text>
                        </TouchableOpacity>
                    </View>

                    <View style={styles.sidebarDivider} />

                    {/* Nav Items */}
                    <ScrollView style={styles.sidebarNav}>
                        {navItems(t).map((item) => (
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

                    {/* Logout */}
                    <TouchableOpacity style={styles.sidebarLogout} onPress={onLogout}>
                        <Text style={styles.sidebarLogoutIcon}>🚪</Text>
                        <Text style={styles.sidebarLogoutText}>{t('Sign Out')}</Text>
                    </TouchableOpacity>
                </View>
            </View>
        </Modal>
    );
}

// ─────────────────────────────────────────────
// HEADER COMPONENT
// ─────────────────────────────────────────────
function Header({ onMenuPress, onNotifPress }) {
    const { t, i18n } = useTranslation();
    return (
        <View style={styles.header}>
            <TouchableOpacity onPress={onMenuPress} style={styles.menuBtn}>
                <View style={styles.menuLine} />
                <View style={[styles.menuLine, { width: 20 }]} />
                <View style={styles.menuLine} />
            </TouchableOpacity>

            <View style={styles.headerCenter}>
                <Text style={styles.headerLogo}>🌸</Text>
                <Text style={styles.headerTitle}>{t('PeriCare')}</Text>
            </View>

            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                <TouchableOpacity onPress={onNotifPress} style={styles.notifBtn}>
                    <Text style={styles.notifIcon}>🔔</Text>
                    <View style={styles.notifBadge}>
                        <Text style={styles.notifBadgeText}>3</Text>
                    </View>
                </TouchableOpacity>
            </View>
        </View>
    );
}

// ─────────────────────────────────────────────
// FOOTER COMPONENT
// ─────────────────────────────────────────────
function Footer({ activeTab, onTabPress }) {
    const { t } = useTranslation();
    const footerItems = navItems(t).slice(0, 5);
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
    const { t } = useTranslation();
    const [activeTab, setActiveTab] = useState('home');
    const [sidebarVisible, setSidebarVisible] = useState(false);

    const handleLogout = () => {
        setSidebarVisible(false);
        Toast.show({
            type: 'success',
            text1: t('Signed Out'),
            text2: t('You have been signed out successfully.'),
            position: 'top',
        });
        setTimeout(() => {
            navigation.replace('Login');
        }, 1500);
    };

    const handleNotifPress = () => {
        Toast.show({
            type: 'info',
            text1: `🔔 ${t('Notifications')}`,
            text2: t('You have 3 new notifications.'),
            position: 'top',
        });
    };

    const handleTabPress = (tab) => {
        setActiveTab(tab);
        if (tab === 'diary') {
            navigation.navigate('Diary');
        } else if (tab === 'plan') {
            navigation.navigate('Plan');
        } else if (tab !== 'home') {
            Toast.show({
                type: 'info',
                text1: navItems(t).find(n => n.key === tab)?.label || tab,
                text2: t('This section is coming soon!'),
                position: 'bottom',
            });
        }
    };

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

    return (
        <SafeAreaView style={styles.safeArea}>
            {/* ── Sidebar ── */}
            <Sidebar
                visible={sidebarVisible}
                activeTab={activeTab}
                onTabPress={handleTabPress}
                onClose={() => setSidebarVisible(false)}
                onLogout={handleLogout}
            />

            {/* ── Header ── */}
            <Header
                onMenuPress={() => setSidebarVisible(true)}
                onNotifPress={handleNotifPress}
            />

            {/* ── Main Scrollable Content ── */}
            <ScrollView
                style={styles.scrollView}
                contentContainerStyle={styles.scrollContent}
                showsVerticalScrollIndicator={false}
            >
                <View style={styles.sectionHeader}>
                    <Text style={styles.sectionTitle}>{t('Overview')}</Text>
                    <Text style={styles.lastVisit}>{t('Last visit')}: {mockUser.lastVisit}</Text>
                </View>

                <View style={styles.statsGrid}>
                    {mockStats(t).map((stat, i) => (
                        <StatCard key={i} {...stat} />
                    ))}
                </View>

                {/* ── Progress Chart ── */}
                <View style={styles.card}>
                    <Text style={styles.cardTitle}>{t('Monthly Progress')}</Text>
                    <BarChart
                        data={barChartData(t)}
                        width={width - 64}
                        height={180}
                        yAxisLabel=""
                        chartConfig={chartConfig}
                        verticalLabelRotation={0}
                        style={styles.chart}
                    />
                </View>

                {/* ── Health Indicators ── */}
                <View style={styles.indicatorRow}>
                    <View style={[styles.card, { flex: 1, marginBottom: 0 }]}>
                        <Text style={styles.cardTitle}>{t('Health Scores')}</Text>
                        {progressData(t).map((p, i) => (
                            <ProgressBar key={i} {...p} />
                        ))}
                    </View>
                    
                    <View style={[styles.card, { flex: 0.9, marginBottom: 0, marginLeft: 12 }]}>
                        <Text style={styles.cardTitle}>{t('Risk Level')}</Text>
                        <PieChart
                            data={pieChartData(t)}
                            width={width * 0.4}
                            height={160}
                            chartConfig={chartConfig}
                            accessor="population"
                            backgroundColor="transparent"
                            paddingLeft="10"
                            absolute
                        />
                    </View>
                </View>

                {/* ── Recent Activity ── */}
                <View style={styles.sectionHeader}>
                    <Text style={styles.sectionTitle}>{t('Recent Activities')}</Text>
                    <TouchableOpacity>
                        <Text style={styles.viewAllText}>{t('View All')}</Text>
                    </TouchableOpacity>
                </View>

                <View style={styles.activityList}>
                    {recentActivities(t).map((item) => (
                        <View key={item.id} style={styles.activityItem}>
                            <View style={[styles.activityIcon, { backgroundColor: item.color + '22' }]}>
                                <Text style={{ fontSize: 16 }}>{item.icon}</Text>
                            </View>
                            <View style={styles.activityInfo}>
                                <Text style={styles.activityTitle}>{item.title}</Text>
                                <Text style={styles.activityTime}>{item.time}</Text>
                            </View>
                        </View>
                    ))}
                </View>

                {/* Quick Action Buttons */}
                <Text style={styles.sectionTitle}>{t('Quick Actions')}</Text>
                <View style={styles.quickActions}>
                    <TouchableOpacity
                        style={[styles.quickActionBtn, { backgroundColor: '#7C3AED' }]}
                        onPress={() => navigation.navigate('Diary')}
                    >
                        <Text style={styles.quickActionIcon}>📔</Text>
                        <Text style={styles.quickActionText}>{t('My Diary')}</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={[styles.quickActionBtn, { backgroundColor: '#0EA5E9' }]}
                        onPress={() => navigation.navigate('Plan')}
                    >
                        <Text style={styles.quickActionIcon}>📅</Text>
                        <Text style={styles.quickActionText}>{t('My Plans')}</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={[styles.quickActionBtn, { backgroundColor: '#10B981' }]}
                        onPress={() =>
                            Toast.show({ type: 'success', text1: `😊 ${t('Mood')}`, text2: t('Mood log updated!'), position: 'top' })
                        }
                    >
                        <Text style={styles.quickActionIcon}>😊</Text>
                        <Text style={styles.quickActionText}>{t('Log Mood')}</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={[styles.quickActionBtn, { backgroundColor: '#10B981' }]}
                        onPress={() => navigation.navigate('Exercise')}
                    >
                        <Text style={styles.quickActionIcon}>🏃‍♀️</Text>
                        <Text style={styles.quickActionText}>{t('Postpartum Exercise')}</Text>
                    </TouchableOpacity>
                </View>

                <View style={{ height: 20 }} />
            </ScrollView>

            {/* ── Footer ── */}
            <Footer activeTab={activeTab} onTabPress={handleTabPress} />

            {/* Toast must be the last child */}
            <Toast />
        </SafeAreaView>
    );
}

// ─────────────────────────────────────────────
// STYLES
// ─────────────────────────────────────────────
const PURPLE = '#7C3AED';
const PURPLE_LIGHT = '#EDE9FE';
const BG = '#F3F4F6';
const WHITE = '#FFFFFF';

const styles = StyleSheet.create({
    safeArea: {
        flex: 1,
        backgroundColor: BG,
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

    // ── Sidebar ──
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
        backgroundColor: PURPLE_LIGHT,
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

    // ── Scroll ──
    scrollView: {
        flex: 1,
    },
    scrollContent: {
        paddingHorizontal: 16,
        paddingTop: 16,
    },

    // ── Greeting ──
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
    sectionHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 12,
        marginTop: 4,
    },
    lastVisit: {
        fontSize: 11,
        color: '#6B7280',
    },
    viewAllText: {
        fontSize: 12,
        color: PURPLE,
        fontWeight: '600',
    },

    // ── Stats ──
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

    // ── Chart & Indicator Cards ──
    card: {
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
    cardTitle: {
        fontSize: 14,
        fontWeight: '700',
        color: '#374151',
        marginBottom: 12,
    },
    indicatorRow: {
        flexDirection: 'row',
        marginBottom: 20,
    },
    chart: {
        borderRadius: 12,
        marginVertical: 8,
    },

    // ── Activity List ──
    activityList: {
        backgroundColor: WHITE,
        borderRadius: 16,
        padding: 8,
        marginBottom: 20,
        elevation: 2,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.07,
        shadowRadius: 4,
    },
    activityItem: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 10,
        borderBottomWidth: 1,
        borderBottomColor: '#F3F4F6',
    },

    // ── Progress ──
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

    // ── Activity ──
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