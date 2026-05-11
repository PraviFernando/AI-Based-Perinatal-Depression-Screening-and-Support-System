import React, { useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    ScrollView,
    SafeAreaView,
    StatusBar,
    Image
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import Toast from 'react-native-toast-message';

export default function HomeScreen({ navigation }) {
    const [userName] = useState('John Doe'); // This would come from your auth context/state

    // Sample data for dashboard
    const stats = [
        { id: 1, title: 'Appointments', value: '5', icon: 'calendar-today', color: '#4CAF50' },
        { id: 2, title: 'Prescriptions', value: '3', icon: 'description', color: '#2196F3' },
        { id: 3, title: 'Messages', value: '2', icon: 'message', color: '#FF9800' },
        { id: 4, title: 'Reports', value: '7', icon: 'assessment', color: '#9C27B0' },
    ];

    const upcomingAppointments = [
        { id: 1, doctor: 'Dr. Sarah Wilson', specialty: 'Cardiologist', date: '2024-03-15', time: '10:30 AM' },
        { id: 2, doctor: 'Dr. Michael Chen', specialty: 'Dermatologist', date: '2024-03-18', time: '2:00 PM' },
    ];

    const handleLogout = () => {
        Toast.show({
            type: 'info',
            text1: 'Logging out...',
            text2: 'See you soon!',
            position: 'top',
            topOffset: 60,
            visibilityTime: 2000,
        });
        
        setTimeout(() => {
            navigation.replace('Login');
        }, 2000);
    };

    const Header = () => (
        <View style={styles.header}>
            <View style={styles.headerLeft}>
                <TouchableOpacity onPress={() => navigation.toggleDrawer?.()}>
                    <Icon name="menu" size={28} color="#333" />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>HealthCare</Text>
            </View>
            <View style={styles.headerRight}>
                <TouchableOpacity style={styles.headerIcon}>
                    <Icon name="notifications-none" size={24} color="#333" />
                    <View style={styles.notificationBadge}>
                        <Text style={styles.badgeText}>3</Text>
                    </View>
                </TouchableOpacity>
                <TouchableOpacity style={styles.profileButton}>
                    <View style={styles.profileImage}>
                        <Text style={styles.profileInitials}>
                            {userName.split(' ').map(n => n[0]).join('')}
                        </Text>
                    </View>
                </TouchableOpacity>
            </View>
        </View>
    );

    const Footer = () => (
        <View style={styles.footer}>
            <TouchableOpacity style={styles.footerItem}>
                <Icon name="home" size={24} color="#007AFF" />
                <Text style={[styles.footerText, styles.footerTextActive]}>Home</Text>
            </TouchableOpacity>
            
            <TouchableOpacity style={styles.footerItem}>
                <Icon name="calendar-today" size={24} color="#666" />
                <Text style={styles.footerText}>Appointments</Text>
            </TouchableOpacity>
            
            <TouchableOpacity style={styles.footerItem}>
                <Icon name="message" size={24} color="#666" />
                <Text style={styles.footerText}>Messages</Text>
            </TouchableOpacity>
            
            <TouchableOpacity style={styles.footerItem}>
                <Icon name="person" size={24} color="#666" />
                <Text style={styles.footerText}>Profile</Text>
            </TouchableOpacity>
        </View>
    );

    return (
        <SafeAreaView style={styles.container}>
            <StatusBar barStyle="dark-content" backgroundColor="#fff" />
            
            {/* Header */}
            <Header />

            {/* Main Content */}
            <ScrollView 
                style={styles.content}
                showsVerticalScrollIndicator={false}
            >
                {/* Welcome Section */}
                <View style={styles.welcomeSection}>
                    <Text style={styles.greeting}>Hello, {userName}! 👋</Text>
                    <Text style={styles.welcomeText}>Welcome back to your health dashboard</Text>
                </View>

                {/* Stats Grid */}
                <View style={styles.statsGrid}>
                    {stats.map((stat) => (
                        <TouchableOpacity key={stat.id} style={styles.statCard}>
                            <View style={[styles.statIcon, { backgroundColor: stat.color + '20' }]}>
                                <Icon name={stat.icon} size={24} color={stat.color} />
                            </View>
                            <Text style={styles.statValue}>{stat.value}</Text>
                            <Text style={styles.statTitle}>{stat.title}</Text>
                        </TouchableOpacity>
                    ))}
                </View>

                {/* Upcoming Appointments */}
                <View style={styles.section}>
                    <View style={styles.sectionHeader}>
                        <Text style={styles.sectionTitle}>Upcoming Appointments</Text>
                        <TouchableOpacity>
                            <Text style={styles.seeAllLink}>See All</Text>
                        </TouchableOpacity>
                    </View>

                    {upcomingAppointments.map((appointment) => (
                        <TouchableOpacity key={appointment.id} style={styles.appointmentCard}>
                            <View style={styles.appointmentLeft}>
                                <View style={styles.appointmentDate}>
                                    <Text style={styles.appointmentDay}>
                                        {new Date(appointment.date).getDate()}
                                    </Text>
                                    <Text style={styles.appointmentMonth}>
                                        {new Date(appointment.date).toLocaleString('default', { month: 'short' })}
                                    </Text>
                                </View>
                                <View style={styles.appointmentDetails}>
                                    <Text style={styles.doctorName}>{appointment.doctor}</Text>
                                    <Text style={styles.doctorSpecialty}>{appointment.specialty}</Text>
                                    <Text style={styles.appointmentTime}>
                                        <Icon name="access-time" size={14} color="#666" /> {appointment.time}
                                    </Text>
                                </View>
                            </View>
                            <TouchableOpacity style={styles.rescheduleButton}>
                                <Icon name="chevron-right" size={24} color="#007AFF" />
                            </TouchableOpacity>
                        </TouchableOpacity>
                    ))}

                    <TouchableOpacity style={styles.bookButton}>
                        <Icon name="add" size={20} color="#fff" />
                        <Text style={styles.bookButtonText}>Book New Appointment</Text>
                    </TouchableOpacity>
                </View>

                {/* Health Tips Section */}
                <View style={[styles.section, styles.lastSection]}>
                    <Text style={styles.sectionTitle}>Health Tips</Text>
                    <View style={styles.tipCard}>
                        <Icon name="favorite" size={24} color="#FF6B6B" />
                        <View style={styles.tipContent}>
                            <Text style={styles.tipTitle}>Stay Hydrated</Text>
                            <Text style={styles.tipText}>Drink at least 8 glasses of water daily</Text>
                        </View>
                    </View>
                    <View style={styles.tipCard}>
                        <Icon name="directions-walk" size={24} color="#4CAF50" />
                        <View style={styles.tipContent}>
                            <Text style={styles.tipTitle}>Daily Exercise</Text>
                            <Text style={styles.tipText}>30 minutes of walking can improve heart health</Text>
                        </View>
                    </View>
                </View>
            </ScrollView>

            {/* Footer */}
            <Footer />
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f5f5f5',
    },
    // Header Styles
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 16,
        paddingVertical: 12,
        backgroundColor: '#fff',
        borderBottomWidth: 1,
        borderBottomColor: '#f0f0f0',
        elevation: 2,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 2,
    },
    headerLeft: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    headerTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#007AFF',
        marginLeft: 12,
    },
    headerRight: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    headerIcon: {
        marginRight: 16,
        position: 'relative',
    },
    notificationBadge: {
        position: 'absolute',
        top: -5,
        right: -5,
        backgroundColor: '#FF3B30',
        borderRadius: 10,
        minWidth: 18,
        height: 18,
        justifyContent: 'center',
        alignItems: 'center',
    },
    badgeText: {
        color: '#fff',
        fontSize: 10,
        fontWeight: 'bold',
    },
    profileButton: {
        padding: 2,
    },
    profileImage: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: '#007AFF',
        justifyContent: 'center',
        alignItems: 'center',
    },
    profileInitials: {
        color: '#fff',
        fontSize: 16,
        fontWeight: 'bold',
    },
    // Main Content Styles
    content: {
        flex: 1,
        paddingHorizontal: 16,
    },
    welcomeSection: {
        marginTop: 20,
        marginBottom: 24,
    },
    greeting: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#333',
        marginBottom: 4,
    },
    welcomeText: {
        fontSize: 14,
        color: '#666',
    },
    // Stats Grid
    statsGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'space-between',
        marginBottom: 24,
    },
    statCard: {
        width: '48%',
        backgroundColor: '#fff',
        borderRadius: 12,
        padding: 16,
        marginBottom: 12,
        alignItems: 'center',
        elevation: 2,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 2,
    },
    statIcon: {
        width: 50,
        height: 50,
        borderRadius: 25,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 10,
    },
    statValue: {
        fontSize: 22,
        fontWeight: 'bold',
        color: '#333',
        marginBottom: 4,
    },
    statTitle: {
        fontSize: 12,
        color: '#666',
    },
    // Section Styles
    section: {
        marginBottom: 24,
    },
    lastSection: {
        marginBottom: 80, // Extra space for footer
    },
    sectionHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 12,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: '600',
        color: '#333',
    },
    seeAllLink: {
        color: '#007AFF',
        fontSize: 14,
        fontWeight: '500',
    },
    // Appointment Card
    appointmentCard: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        backgroundColor: '#fff',
        borderRadius: 12,
        padding: 16,
        marginBottom: 12,
        elevation: 2,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 2,
    },
    appointmentLeft: {
        flexDirection: 'row',
        flex: 1,
    },
    appointmentDate: {
        width: 50,
        height: 50,
        backgroundColor: '#f0f8ff',
        borderRadius: 10,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 12,
    },
    appointmentDay: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#007AFF',
    },
    appointmentMonth: {
        fontSize: 12,
        color: '#666',
    },
    appointmentDetails: {
        flex: 1,
    },
    doctorName: {
        fontSize: 16,
        fontWeight: '600',
        color: '#333',
        marginBottom: 4,
    },
    doctorSpecialty: {
        fontSize: 13,
        color: '#666',
        marginBottom: 4,
    },
    appointmentTime: {
        fontSize: 12,
        color: '#666',
    },
    rescheduleButton: {
        padding: 8,
    },
    bookButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#007AFF',
        borderRadius: 10,
        padding: 14,
        marginTop: 8,
    },
    bookButtonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: '600',
        marginLeft: 8,
    },
    // Tip Card
    tipCard: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#fff',
        borderRadius: 12,
        padding: 16,
        marginBottom: 10,
        elevation: 2,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 2,
    },
    tipContent: {
        marginLeft: 12,
        flex: 1,
    },
    tipTitle: {
        fontSize: 16,
        fontWeight: '600',
        color: '#333',
        marginBottom: 4,
    },
    tipText: {
        fontSize: 13,
        color: '#666',
    },
    // Footer Styles
    footer: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        alignItems: 'center',
        backgroundColor: '#fff',
        paddingVertical: 8,
        paddingHorizontal: 16,
        borderTopWidth: 1,
        borderTopColor: '#f0f0f0',
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        elevation: 8,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: -2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
    },
    footerItem: {
        alignItems: 'center',
        padding: 8,
    },
    footerText: {
        fontSize: 12,
        color: '#666',
        marginTop: 4,
    },
    footerTextActive: {
        color: '#007AFF',
        fontWeight: '500',
    },
});