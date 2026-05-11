import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    ScrollView,
    TouchableOpacity,
    StyleSheet,
    Dimensions,
    Modal,
    Image,
    Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Toast from 'react-native-toast-message';
import { BarChart, PieChart } from 'react-native-chart-kit';
import { useTranslation } from 'react-i18next';
import { Video, ResizeMode } from 'expo-av';
import { WebView } from 'react-native-webview';
import exerciseService from '../services/exerciseService';
const getYouTubeId = (url) => {
    if (!url) return null;
    if (url.includes('youtube.com/embed/'))
        return url.split('embed/')[1]?.split('?')[0];
    if (url.includes('youtu.be/'))
        return url.split('youtu.be/')[1]?.split('?')[0];
    if (url.includes('youtube.com/watch')) {
        const parts = url.split('v=');
        return parts.length > 1 ? parts[1].split('&')[0] : null;
    }
    return null;
};

const getEmbedUrl = (url) => {
    const id = getYouTubeId(url);
    return id
        ? `https://www.youtube.com/embed/${id}?rel=0&autoplay=1&modestbranding=1&playsinline=1`
        : url;
};
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
    { key: 'exercise', label: t('Exercise'), icon: '🏃‍♀️' },
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
                <Text style={[styles.progressPercent, { color }]}>
                    {percent}%
                </Text>
            </View>

            <View style={styles.progressTrack}>
                <View
                    style={[
                        styles.progressFill,
                        {
                            width: `${percent}%`,
                            backgroundColor: color,
                        },
                    ]}
                />
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
                <TouchableOpacity
                    style={styles.sidebarBackdrop}
                    onPress={onClose}
                />

                <View style={styles.sidebarContainer}>
                    {/* Sidebar Header */}
                    <View style={styles.sidebarHeader}>
                        <View style={styles.sidebarAvatar}>
                            <Text style={styles.sidebarAvatarText}>SJ</Text>
                        </View>

                        <View style={styles.sidebarUserInfo}>
                            <Text style={styles.sidebarUserName}>
                                {mockUser.name}
                            </Text>

                            <Text style={styles.sidebarUserRole}>
                                {mockUser.role}
                            </Text>
                        </View>

                        <TouchableOpacity
                            onPress={onClose}
                            style={styles.sidebarCloseBtn}
                        >
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
                                    activeTab === item.key &&
                                        styles.sidebarNavItemActive,
                                ]}
                                onPress={() => {
                                    onTabPress(item.key);
                                    onClose();
                                }}
                            >
                                <Text style={styles.sidebarNavIcon}>
                                    {item.icon}
                                </Text>

                                <Text
                                    style={[
                                        styles.sidebarNavLabel,
                                        activeTab === item.key &&
                                            styles.sidebarNavLabelActive,
                                    ]}
                                >
                                    {item.label}
                                </Text>

                                {activeTab === item.key && (
                                    <View
                                        style={
                                            styles.sidebarActiveIndicator
                                        }
                                    />
                                )}
                            </TouchableOpacity>
                        ))}
                    </ScrollView>

                    <View style={styles.sidebarDivider} />

                    {/* Logout */}
                    <TouchableOpacity
                        style={styles.sidebarLogout}
                        onPress={onLogout}
                    >
                        <Text style={styles.sidebarLogoutIcon}>🚪</Text>

                        <Text style={styles.sidebarLogoutText}>
                            {t('Sign Out')}
                        </Text>
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
            <TouchableOpacity
                onPress={onMenuPress}
                style={styles.menuBtn}
            >
                <View style={styles.menuLine} />
                <View style={[styles.menuLine, { width: 20 }]} />
                <View style={styles.menuLine} />
            </TouchableOpacity>

            <View style={styles.headerCenter}>
                <Text style={styles.headerLogo}>🌸</Text>

                <Text style={styles.headerTitle}>
                    {t('PeriCare')}
                </Text>
            </View>

            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                <TouchableOpacity
                    onPress={() =>
                        i18n.changeLanguage(
                            i18n.language === 'en' ? 'si' : 'en'
                        )
                    }
                    style={{ marginRight: 15 }}
                >
                    <Text
                        style={{
                            fontWeight: '700',
                            fontSize: 13,
                            color: '#7C3AED',
                            backgroundColor: '#EDE9FE',
                            paddingHorizontal: 10,
                            paddingVertical: 4,
                            borderRadius: 12,
                        }}
                    >
                        {i18n.language === 'en' ? 'සිං' : 'EN'}
                    </Text>
                </TouchableOpacity>

                <TouchableOpacity
                    onPress={onNotifPress}
                    style={styles.notifBtn}
                >
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

    const footerItems = [
        ...navItems(t).slice(0, 3), // home, screening, diary
        navItems(t).find((i) => i.key === 'exercise'),
        ...navItems(t).slice(3, 5), // plan, profile
    ];

    return (
        <View style={styles.footer}>
            {footerItems.map((item) => (
                <TouchableOpacity
                    key={item.key}
                    style={styles.footerTab}
                    onPress={() => onTabPress(item.key)}
                >
                    <Text style={styles.footerTabIcon}>
                        {item.icon}
                    </Text>

                    <Text
                        style={[
                            styles.footerTabLabel,
                            activeTab === item.key &&
                                styles.footerTabLabelActive,
                        ]}
                    >
                        {item.label}
                    </Text>

                    {activeTab === item.key && (
                        <View style={styles.footerActiveBar} />
                    )}
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
    const [suggestedExercises, setSuggestedExercises] = useState([]);
    const [loadingExercises, setLoadingExercises] = useState(true);
    const [videoModalVisible, setVideoModalVisible] = useState(false);
    const [selectedVideoUrl, setSelectedVideoUrl] = useState(null);

    useEffect(() => {
        const fetchExercises = async () => {
            try {
                const today = new Date().toISOString().split('T')[0];
                const data = await exerciseService.getRecommendations(today);
                if (data.hasData && data.recommendations) {
                    setSuggestedExercises(data.recommendations.slice(0, 2));
                }
            } catch (err) {
                console.log('Failed to fetch suggested exercises', err);
            } finally {
                setLoadingExercises(false);
            }
        };
        fetchExercises();
    }, []);

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
        } else if (tab === 'exercise') {
            navigation.navigate('Exercise');
        } else if (tab !== 'home') {
            Toast.show({
                type: 'info',
                text1:
                    navItems(t).find((n) => n.key === tab)?.label ||
                    tab,
                text2: t('This section is coming soon!'),
                position: 'bottom',
            });
        }
    };

    const chartConfig = {
        backgroundGradientFrom: '#fff',
        backgroundGradientTo: '#fff',
        decimalPlaces: 0,
        color: (opacity = 1) =>
            `rgba(124, 58, 237, ${opacity})`,
        labelColor: (opacity = 1) =>
            `rgba(55, 65, 81, ${opacity})`,
        style: { borderRadius: 16 },
        propsForDots: {
            r: '5',
            strokeWidth: '2',
            stroke: '#7C3AED',
        },
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

            {/* ── Video Player Modal ── */}
            <Modal
                visible={videoModalVisible}
                transparent
                animationType="fade"
                onRequestClose={() => setVideoModalVisible(false)}
            >
                <View style={styles.videoModalOverlay}>
                    <View style={styles.videoModalContainer}>
                        <TouchableOpacity
                            style={styles.videoModalClose}
                            onPress={() => setVideoModalVisible(false)}
                        >
                            <Text style={styles.videoModalCloseText}>✕</Text>
                        </TouchableOpacity>

                        <View style={styles.dashboardVideoWrapper}>
                            {selectedVideoUrl &&
                                (getYouTubeId(selectedVideoUrl) ? (
                                    Platform.OS === 'web' ? (
                                        <iframe
                                            src={getEmbedUrl(selectedVideoUrl)}
                                            style={{
                                                flex: 1,
                                                border: 'none',
                                                width: '100%',
                                                height: '100%',
                                            }}
                                            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                            allowFullScreen
                                        />
                                    ) : (
                                        <WebView
                                            source={{
                                                uri: getEmbedUrl(selectedVideoUrl),
                                            }}
                                            style={styles.dashboardWebView}
                                            allowsFullscreenVideo={true}
                                            allowsInlineMediaPlayback={true}
                                            mediaPlaybackRequiresUserAction={false}
                                            javaScriptEnabled={true}
                                            domStorageEnabled={true}
                                            startInLoadingState={true}
                                        />
                                    )
                                ) : (
                                    <Video
                                        source={{
                                            uri: selectedVideoUrl,
                                        }}
                                        style={styles.dashboardVideo}
                                        useNativeControls
                                        resizeMode={ResizeMode.CONTAIN}
                                        shouldPlay
                                    />
                                ))}
                        </View>
                    </View>
                </View>
            </Modal>

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
                {/* Greeting Banner */}
                <View style={styles.greetingBanner}>
                    <View style={styles.greetingTextContainer}>
                        <Text style={styles.greetingHello}>
                            {t('Hello')},{' '}
                            {mockUser.name.split(' ')[0]} 👋
                        </Text>

                        <Text style={styles.greetingSubtitle}>
                            {t("Here's your health overview")}
                        </Text>

                        <Text style={styles.greetingDate}>
                            {t('Last visit')}: {mockUser.lastVisit}
                        </Text>
                    </View>

                    <View style={styles.greetingAvatarLarge}>
                        <Text style={styles.greetingAvatarText}>
                            SJ
                        </Text>
                    </View>
                </View>

                <View style={styles.sectionHeader}>
                    <Text style={styles.sectionTitle}>
                        {t('Overview')}
                    </Text>

                    <Text style={styles.lastVisit}>
                        {t('Last visit')}: {mockUser.lastVisit}
                    </Text>
                </View>

                <View style={styles.statsGrid}>
                    {mockStats(t).map((stat, i) => (
                        <StatCard key={i} {...stat} />
                    ))}
                </View>

                {/* ── Progress Chart ── */}
                <View style={styles.card}>
                    <Text style={styles.cardTitle}>
                        {t('Monthly Progress')}
                    </Text>

                    <BarChart
                        data={barChartData(t)}
                        width={width - 64}
                        height={180}
                        yAxisLabel=""
                        chartConfig={chartConfig}
                        verticalLabelRotation={0}
                        style={styles.chart}
                        showValuesOnTopOfBars
                        fromZero
                    />
                </View>

                {/* ── Health Indicators ── */}
                <View style={styles.indicatorRow}>
                    <View
                        style={[
                            styles.card,
                            { flex: 1, marginBottom: 0 },
                        ]}
                    >
                        <Text style={styles.cardTitle}>
                            {t('Health Scores')}
                        </Text>

                        {progressData(t).map((p, i) => (
                            <ProgressBar key={i} {...p} />
                        ))}
                    </View>

                    <View
                        style={[
                            styles.card,
                            {
                                flex: 0.9,
                                marginBottom: 0,
                                marginLeft: 12,
                            },
                        ]}
                    >
                        <Text style={styles.cardTitle}>
                            {t('Risk Level')}
                        </Text>

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
                {/* ── Suggested Exercises ── */}
                {!loadingExercises && suggestedExercises.length > 0 && (
                    <View style={{ marginTop: 20 }}>
                        <View style={styles.sectionHeader}>
                            <Text style={styles.sectionTitle}>
                                {t('Suggested Exercises')}
                            </Text>
                            <TouchableOpacity onPress={() => navigation.navigate('Exercise')}>
                                <Text style={styles.viewAllText}>{t('View All')}</Text>
                            </TouchableOpacity>
                        </View>
                        <View style={styles.exerciseGrid}>
                            {suggestedExercises.map((rec, index) => {
                                const details = rec.exerciseDetails || {};
                                const videoUrl = details.videoUrl || (details.videos && details.videos[0]?.url);
                                const youtubeId = getYouTubeId(videoUrl);
                                
                                return (
                                    <TouchableOpacity
                                        key={index}
                                        style={styles.exerciseDashCard}
                                        onPress={() => {
                                            if (videoUrl) {
                                                setSelectedVideoUrl(videoUrl);
                                                setVideoModalVisible(true);
                                            } else {
                                                navigation.navigate('Exercise');
                                            }
                                        }}
                                    >
                                        <View style={styles.exerciseDashThumbnailContainer}>
                                            {youtubeId ? (
                                                <Image
                                                    source={{ uri: `https://img.youtube.com/vi/${youtubeId}/0.jpg` }}
                                                    style={styles.exerciseDashThumbnail}
                                                    resizeMode="cover"
                                                />
                                            ) : (
                                                <View style={styles.exerciseDashIconFallback}>
                                                    <Text style={styles.exerciseDashIcon}>
                                                        {details.type === 'walking' ? '🚶' : details.type === 'breathing' ? '🌬️' : '🏋️'}
                                                    </Text>
                                                </View>
                                            )}
                                            <View style={styles.playIconOverlay}>
                                                <Text style={styles.playIcon}>▶</Text>
                                            </View>
                                        </View>
                                        <View style={styles.exerciseDashInfo}>
                                            <Text style={styles.exerciseDashName} numberOfLines={1}>
                                                {details.nameSi || details.name}
                                            </Text>
                                            <Text style={styles.exerciseDashMeta}>
                                                {details.duration || rec.duration} {t('min')} • {t(details.intensity)}
                                            </Text>
                                        </View>
                                    </TouchableOpacity>
                                );
                            })}
                        </View>
                    </View>
                )}

                {/* ── Recent Activity ── */}
                <View style={styles.sectionHeader}>
                    <Text style={styles.sectionTitle}>
                        {t('Recent Activities')}
                    </Text>

                    <TouchableOpacity>
                        <Text style={styles.viewAllText}>
                            {t('View All')}
                        </Text>
                    </TouchableOpacity>
                </View>

                <View style={styles.activityList}>
                    {recentActivities(t).map((item) => (
                        <View
                            key={item.id}
                            style={styles.activityItem}
                        >
                            <View
                                style={[
                                    styles.activityIconBox,
                                    {
                                        backgroundColor:
                                            item.color + '22',
                                    },
                                ]}
                            >
                                <Text style={{ fontSize: 16 }}>
                                    {item.icon}
                                </Text>
                            </View>

                            <View style={styles.activityInfo}>
                                <Text style={styles.activityTitle}>
                                    {item.title}
                                </Text>

                                <Text style={styles.activityTime}>
                                    {item.time}
                                </Text>
                            </View>

                            <View
                                style={[
                                    styles.activityDot,
                                    {
                                        backgroundColor: item.color,
                                    },
                                ]}
                            />
                        </View>
                    ))}
                </View>

                {/* Quick Action Buttons */}
                <Text style={styles.sectionTitle}>
                    {t('Quick Actions')}
                </Text>

                <View style={styles.quickActions}>
                    <TouchableOpacity
                        style={[
                            styles.quickActionBtn,
                            { backgroundColor: '#7C3AED' },
                        ]}
                        onPress={() =>
                            navigation.navigate('Diary')
                        }
                    >
                        <Text style={styles.quickActionIcon}>
                            📔
                        </Text>

                        <Text style={styles.quickActionText}>
                            {t('My Diary')}
                        </Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={[
                            styles.quickActionBtn,
                            { backgroundColor: '#0EA5E9' },
                        ]}
                        onPress={() =>
                            navigation.navigate('Plan')
                        }
                    >
                        <Text style={styles.quickActionIcon}>
                            📅
                        </Text>

                        <Text style={styles.quickActionText}>
                            {t('My Plans')}
                        </Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={[
                            styles.quickActionBtn,
                            { backgroundColor: '#10B981' },
                        ]}
                        onPress={() =>
                            Toast.show({
                                type: 'success',
                                text1: `😊 ${t('Mood')}`,
                                text2: t(
                                    'Mood log updated!'
                                ),
                                position: 'top',
                            })
                        }
                    >
                        <Text style={styles.quickActionIcon}>
                            😊
                        </Text>

                        <Text style={styles.quickActionText}>
                            {t('Log Mood')}
                        </Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={[
                            styles.quickActionBtn,
                            { backgroundColor: '#10B981' },
                        ]}
                        onPress={() =>
                            navigation.navigate('Exercise')
                        }
                    >
                        <Text style={styles.quickActionIcon}>
                            🏃‍♀️
                        </Text>

                        <Text style={styles.quickActionText}>
                            {t('Postpartum Exercise')}
                        </Text>
                    </TouchableOpacity>
                </View>

                <View style={{ height: 20 }} />
            </ScrollView>

            {/* ── Footer ── */}
            <Footer
                activeTab={activeTab}
                onTabPress={handleTabPress}
            />

            {/* Toast */}
            <Toast />
        </SafeAreaView>
    );
}

const PURPLE = '#7C3AED';
const PURPLE_LIGHT = '#EDE9FE';
const BG = '#F3F4F6';
const WHITE = '#FFFFFF';

const styles = StyleSheet.create({
    safeArea: {
        flex: 1,
        backgroundColor: BG,
    },

    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        backgroundColor: WHITE,
        paddingHorizontal: 16,
        paddingVertical: 12,
        elevation: 4,
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

    scrollView: {
        flex: 1,
    },

    scrollContent: {
        paddingHorizontal: 16,
        paddingTop: 16,
    },

    greetingBanner: {
        backgroundColor: PURPLE,
        borderRadius: 20,
        padding: 20,
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 20,
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
    },

    greetingAvatarText: {
        color: WHITE,
        fontWeight: 'bold',
        fontSize: 22,
    },

    sectionTitle: {
        fontSize: 16,
        fontWeight: '700',
        color: '#111827',
    },

    sectionHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 12,
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
    },

    statIcon: {
        fontSize: 24,
        marginBottom: 6,
    },

    statValue: {
        fontSize: 22,
        fontWeight: '800',
    },

    statLabel: {
        fontSize: 12,
        color: '#6B7280',
    },

    card: {
        backgroundColor: WHITE,
        borderRadius: 16,
        padding: 16,
        marginBottom: 20,
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

    activityList: {
        backgroundColor: WHITE,
        borderRadius: 16,
        padding: 8,
        marginBottom: 20,
    },

    activityItem: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 10,
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

    activityInfo: {
        flex: 1,
    },

    activityTitle: {
        fontSize: 14,
        fontWeight: '600',
        color: '#111827',
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

    quickActions: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 10,
        marginBottom: 10,
    },

    quickActionBtn: {
        width: (width - 58) / 2,
        borderRadius: 14,
        padding: 14,
        alignItems: 'center',
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

    footer: {
        flexDirection: 'row',
        backgroundColor: WHITE,
        paddingVertical: 8,
        paddingHorizontal: 8,
        borderTopWidth: 1,
        borderTopColor: '#E5E7EB',
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
    exerciseGrid: {
        flexDirection: 'row',
        gap: 12,
        marginTop: 8,
    },
    exerciseDashCard: {
        flex: 1,
        backgroundColor: WHITE,
        borderRadius: 16,
        overflow: 'hidden',
        elevation: 3,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
    },
    exerciseDashThumbnailContainer: {
        width: '100%',
        height: 100,
        backgroundColor: '#F3F4F6',
        position: 'relative',
    },
    exerciseDashThumbnail: {
        width: '100%',
        height: '100%',
    },
    exerciseDashIconFallback: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#F3F4F6',
    },
    playIconOverlay: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0,0,0,0.2)',
        alignItems: 'center',
        justifyContent: 'center',
    },
    playIcon: {
        color: WHITE,
        fontSize: 28,
        textShadowColor: 'rgba(0, 0, 0, 0.5)',
        textShadowOffset: { width: 0, height: 1 },
        textShadowRadius: 4,
    },
    exerciseDashIcon: {
        fontSize: 32,
    },
    exerciseDashInfo: {
        padding: 10,
    },
    exerciseDashName: {
        fontSize: 13,
        fontWeight: '700',
        color: '#1F2937',
    },
    exerciseDashMeta: {
        fontSize: 11,
        color: '#6B7280',
        marginTop: 2,
    },
    videoModalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.85)',
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20,
    },
    videoModalContainer: {
        width: '100%',
        maxWidth: 600,
        backgroundColor: '#000',
        borderRadius: 16,
        overflow: 'hidden',
        position: 'relative',
    },
    videoModalClose: {
        position: 'absolute',
        top: 10,
        right: 10,
        zIndex: 10,
        backgroundColor: 'rgba(0,0,0,0.5)',
        width: 34,
        height: 34,
        borderRadius: 17,
        alignItems: 'center',
        justifyContent: 'center',
    },
    videoModalCloseText: {
        color: WHITE,
        fontSize: 18,
        fontWeight: 'bold',
    },
    dashboardVideoWrapper: {
        width: '100%',
        aspectRatio: 16 / 9,
        height: Platform.OS === 'web' ? 337 : undefined, // 600 * 9/16 = 337.5
        backgroundColor: '#000',
    },
    dashboardWebView: {
        flex: 1,
        backgroundColor: '#000',
    },
    dashboardVideo: {
        flex: 1,
    },
});