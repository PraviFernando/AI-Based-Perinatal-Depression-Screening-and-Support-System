import React, { useState, useEffect } from 'react';
import {
    View, Text, TextInput, TouchableOpacity, StyleSheet,
    ScrollView, ActivityIndicator, Alert
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Toast from 'react-native-toast-message';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useTranslation } from 'react-i18next';

export default function ProfileScreen({ navigation }) {
    const { t } = useTranslation();
    const { logout } = useAuth();
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    
    const [profile, setProfile] = useState({
        username: '',
        email: '',
        fullName: '',
        age: '',
        district: '',
        village: '',
    });

    useEffect(() => {
        fetchProfile();
    }, []);

    const fetchProfile = async () => {
        try {
            const res = await api.get('/user/me');
            if (res.data) {
                setProfile({
                    username: res.data.username || '',
                    email: res.data.email || '',
                    fullName: res.data.fullName || '',
                    age: res.data.age ? String(res.data.age) : '',
                    district: res.data.district || '',
                    village: res.data.village || '',
                });
            }
        } catch (err) {
            Toast.show({ type: 'error', text1: t('Error'), text2: t('Failed to load profile') });
        } finally {
            setLoading(false);
        }
    };

    const handleUpdate = async () => {
        setSaving(true);
        try {
            await api.put('/user/me', {
                fullName: profile.fullName,
                age: profile.age ? Number(profile.age) : null,
                district: profile.district,
                village: profile.village
            });
            Toast.show({ type: 'success', text1: t('Success'), text2: t('Profile updated successfully') });
        } catch (err) {
            Toast.show({ type: 'error', text1: t('Error'), text2: t('Failed to update profile') });
        } finally {
            setSaving(false);
        }
    };

    const handleDelete = () => {
        Alert.alert(
            t("Delete Account"),
            t("Are you sure you want to delete your account? This action cannot be undone."),
            [
                { text: t("Cancel"), style: "cancel" },
                { 
                    text: t("Delete"), 
                    style: "destructive", 
                    onPress: async () => {
                        try {
                            await api.delete('/user/me');
                            logout();
                            navigation.replace('Login');
                        } catch (err) {
                            Toast.show({ type: 'error', text1: t('Error'), text2: t('Failed to delete account') });
                        }
                    }
                }
            ]
        );
    };

    if (loading) {
        return (
            <SafeAreaView style={[styles.safe, styles.centered]}>
                <ActivityIndicator size="large" color="#7C3AED" />
                <Text style={styles.loadingText}>{t('Loading profile...')}</Text>
            </SafeAreaView>
        );
    }

    return (
        <SafeAreaView style={styles.safe}>
            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
                    <Text style={styles.backIcon}>←</Text>
                </TouchableOpacity>
                <Text style={styles.headerTitle}>{t('My Profile')}</Text>
                <View style={{ width: 40 }} />
            </View>

            <ScrollView contentContainerStyle={styles.scroll}>
                <View style={styles.avatarContainer}>
                    <View style={styles.avatar}>
                        <Text style={styles.avatarText}>{profile.username?.slice(0, 2).toUpperCase() || '👤'}</Text>
                    </View>
                    <Text style={styles.username}>{profile.username}</Text>
                    <Text style={styles.email}>{profile.email}</Text>
                </View>

                <View style={styles.card}>
                    <Text style={styles.sectionTitle}>{t('Personal Details')}</Text>

                    <Text style={styles.label}>{t('Full Name')}</Text>
                    <TextInput
                        style={styles.input}
                        value={profile.fullName}
                        onChangeText={text => setProfile({ ...profile, fullName: text })}
                        placeholder={t('Enter your full name')}
                    />

                    <Text style={styles.label}>{t('Age')}</Text>
                    <TextInput
                        style={styles.input}
                        value={profile.age}
                        onChangeText={text => setProfile({ ...profile, age: text })}
                        placeholder={t('Enter your age')}
                        keyboardType="numeric"
                    />

                    <Text style={styles.label}>{t('District')}</Text>
                    <TextInput
                        style={styles.input}
                        value={profile.district}
                        onChangeText={text => setProfile({ ...profile, district: text })}
                        placeholder={t('Enter your district')}
                    />

                    <Text style={styles.label}>{t('Village')}</Text>
                    <TextInput
                        style={styles.input}
                        value={profile.village}
                        onChangeText={text => setProfile({ ...profile, village: text })}
                        placeholder={t('Enter your village')}
                    />

                    <TouchableOpacity style={styles.updateBtn} onPress={handleUpdate} disabled={saving}>
                        {saving ? (
                            <ActivityIndicator color="#fff" />
                        ) : (
                            <Text style={styles.updateBtnText}>{t('Update Profile')}</Text>
                        )}
                    </TouchableOpacity>
                </View>

                <View style={[styles.card, { marginTop: 20 }]}>
                    <Text style={[styles.sectionTitle, { color: '#EF4444' }]}>{t('Danger Zone')}</Text>
                    <Text style={styles.dangerText}>{t('Once you delete your account, there is no going back. Please be certain.')}</Text>
                    <TouchableOpacity style={styles.deleteBtn} onPress={handleDelete}>
                        <Text style={styles.deleteBtnText}>{t('Delete Account')}</Text>
                    </TouchableOpacity>
                </View>
                
                <View style={{ height: 40 }} />
            </ScrollView>

            <Toast />
        </SafeAreaView>
    );
}

const PURPLE = '#7C3AED';

const styles = StyleSheet.create({
    safe: { flex: 1, backgroundColor: '#F3F4F6' },
    centered: { justifyContent: 'center', alignItems: 'center' },
    loadingText: { marginTop: 12, color: '#6B7280', fontSize: 15 },
    
    header: {
        flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
        backgroundColor: '#fff', paddingHorizontal: 16, paddingVertical: 14,
        elevation: 4, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.08, shadowRadius: 4,
    },
    backBtn: { padding: 8 },
    backIcon: { fontSize: 22, color: PURPLE, fontWeight: 'bold' },
    headerTitle: { fontSize: 18, fontWeight: '800', color: PURPLE },

    scroll: { padding: 16 },

    avatarContainer: { alignItems: 'center', marginBottom: 24, marginTop: 10 },
    avatar: { width: 80, height: 80, borderRadius: 40, backgroundColor: '#EDE9FE', alignItems: 'center', justifyContent: 'center', marginBottom: 12 },
    avatarText: { fontSize: 28, color: PURPLE, fontWeight: 'bold' },
    username: { fontSize: 22, fontWeight: '800', color: '#111827' },
    email: { fontSize: 14, color: '#6B7280', marginTop: 4 },

    card: { backgroundColor: '#fff', borderRadius: 16, padding: 20, elevation: 2, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.05, shadowRadius: 3 },
    sectionTitle: { fontSize: 16, fontWeight: '700', color: '#111827', marginBottom: 16 },
    label: { fontSize: 12, fontWeight: '600', color: '#4B5563', marginBottom: 6, marginTop: 12 },
    input: { borderWidth: 1.5, borderColor: '#E5E7EB', borderRadius: 10, padding: 12, fontSize: 14, backgroundColor: '#F9FAFB', color: '#111827' },
    
    updateBtn: { backgroundColor: PURPLE, borderRadius: 12, padding: 14, alignItems: 'center', marginTop: 24 },
    updateBtnText: { color: '#fff', fontSize: 15, fontWeight: 'bold' },

    dangerText: { fontSize: 13, color: '#6B7280', marginBottom: 16, lineHeight: 20 },
    deleteBtn: { backgroundColor: '#FEF2F2', borderWidth: 1.5, borderColor: '#FECACA', borderRadius: 12, padding: 14, alignItems: 'center' },
    deleteBtnText: { color: '#EF4444', fontSize: 15, fontWeight: 'bold' },
});
