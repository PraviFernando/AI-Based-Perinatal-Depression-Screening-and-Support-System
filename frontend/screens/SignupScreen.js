import React, { useState } from 'react';
import {
    View,
    Text,
    TextInput,
    TouchableOpacity,
    StyleSheet,
    ActivityIndicator,
    ScrollView,
    KeyboardAvoidingView,
    Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Toast from 'react-native-toast-message';
import api from '../services/api';
import { useTranslation } from 'react-i18next';

export default function SignupScreen({ navigation }) {
    const { t, i18n } = useTranslation();
    const [username, setUsername] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);

    const handleSignup = async () => {
        if (!username || !email || !password || !confirmPassword) {
            Toast.show({
                type: 'error',
                text1: 'Missing Fields',
                text2: 'Please fill in all fields.',
                position: 'top',
            });
            return;
        }

        if (password !== confirmPassword) {
            Toast.show({
                type: 'error',
                text1: 'Password Mismatch',
                text2: 'Passwords do not match. Please try again.',
                position: 'top',
            });
            return;
        }

        if (password.length < 6) {
            Toast.show({
                type: 'error',
                text1: 'Weak Password',
                text2: 'Password must be at least 6 characters.',
                position: 'top',
            });
            return;
        }

        setLoading(true);
        try {
            await api.post('/user/signup', {
                username,
                email,
                password,
            });

            Toast.show({
                type: 'success',
                text1: '🎉 Account Created!',
                text2: 'Your account has been registered. Please sign in.',
                position: 'top',
                visibilityTime: 2500,
            });

            setTimeout(() => {
                navigation.navigate('Login');
            }, 2000);
        } catch (error) {
            console.error(error);
            const message =
                error.response?.data?.message || 'Signup failed. Please try again.';
            Toast.show({
                type: 'error',
                text1: '❌ Registration Failed',
                text2: message,
                position: 'top',
            });
        } finally {
            setLoading(false);
        }
    };

    return (
        <SafeAreaView style={styles.container}>
            <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                style={{ flex: 1 }}
            >
                <ScrollView
                    contentContainerStyle={styles.scrollContent}
                    keyboardShouldPersistTaps="handled"
                >
                    <View style={{ position: 'absolute', top: 30, right: 20, zIndex: 10 }}>
                        <TouchableOpacity onPress={() => i18n.changeLanguage(i18n.language === 'en' ? 'si' : 'en')} style={{ paddingHorizontal: 12, paddingVertical: 6, backgroundColor: '#EDE9FE', borderRadius: 16 }}>
                            <Text style={{ fontWeight: 'bold', color: '#7C3AED', fontSize: 14 }}>{i18n.language === 'en' ? 'සිං' : 'EN'}</Text>
                        </TouchableOpacity>
                    </View>

                    {/* Top Banner */}
                    <View style={styles.topBanner}>
                        <Text style={styles.bannerEmoji}>🌸</Text>
                        <Text style={styles.bannerTitle}>{t('PeriCare')}</Text>
                        <Text style={styles.bannerSubtitle}>
                            {t('Create a new account')}
                        </Text>
                    </View>

                    {/* Card */}
                    <View style={styles.card}>
                        <Text style={styles.title}>{t('Create Account')}</Text>
                        <Text style={styles.subtitle}>{t('Join PeriCare today')}</Text>

                        {/* Username */}
                        <View style={styles.inputContainer}>
                            <Text style={styles.label}>👤 {t('Username')}</Text>
                            <TextInput
                                style={styles.input}
                                placeholder="Enter your username"
                                placeholderTextColor="#9CA3AF"
                                value={username}
                                onChangeText={setUsername}
                                autoCapitalize="none"
                                autoCorrect={false}
                            />
                        </View>

                        {/* Email */}
                        <View style={styles.inputContainer}>
                            <Text style={styles.label}>📧 {t('Email')}</Text>
                            <TextInput
                                style={styles.input}
                                placeholder="Enter your email"
                                placeholderTextColor="#9CA3AF"
                                value={email}
                                onChangeText={setEmail}
                                keyboardType="email-address"
                                autoCapitalize="none"
                                autoCorrect={false}
                            />
                        </View>

                        {/* Password */}
                        <View style={styles.inputContainer}>
                            <Text style={styles.label}>🔒 {t('Password')}</Text>
                            <View style={styles.passwordRow}>
                                <TextInput
                                    style={[styles.input, { flex: 1 }]}
                                    placeholder="Enter your password"
                                    placeholderTextColor="#9CA3AF"
                                    value={password}
                                    onChangeText={setPassword}
                                    secureTextEntry={!showPassword}
                                />
                                <TouchableOpacity
                                    onPress={() => setShowPassword(!showPassword)}
                                    style={styles.eyeBtn}
                                >
                                    <Text style={styles.eyeIcon}>
                                        {showPassword ? '🙈' : '👁️'}
                                    </Text>
                                </TouchableOpacity>
                            </View>
                        </View>

                        {/* Confirm Password */}
                        <View style={styles.inputContainer}>
                            <Text style={styles.label}>🔒 {t('Password')} (Confirm)</Text>
                            <View style={styles.passwordRow}>
                                <TextInput
                                    style={[styles.input, { flex: 1 }]}
                                    placeholder="Re-enter your password"
                                    placeholderTextColor="#9CA3AF"
                                    value={confirmPassword}
                                    onChangeText={setConfirmPassword}
                                    secureTextEntry={!showConfirmPassword}
                                />
                                <TouchableOpacity
                                    onPress={() => setShowConfirmPassword(!showConfirmPassword)}
                                    style={styles.eyeBtn}
                                >
                                    <Text style={styles.eyeIcon}>
                                        {showConfirmPassword ? '🙈' : '👁️'}
                                    </Text>
                                </TouchableOpacity>
                            </View>
                        </View>

                        {/* Password strength hint */}
                        <Text style={styles.hint}>
                            💡 Password must be at least 6 characters
                        </Text>

                        {/* Sign Up Button */}
                        <TouchableOpacity
                            style={[styles.button, loading && styles.buttonDisabled]}
                            onPress={handleSignup}
                            disabled={loading}
                        >
                            {loading ? (
                                <ActivityIndicator color="#fff" />
                            ) : (
                                <Text style={styles.buttonText}>{t('Create Account')}</Text>
                            )}
                        </TouchableOpacity>

                        {/* Login Link */}
                        <View style={styles.footer}>
                            <Text style={styles.footerText}>{t('Already have an account?')} </Text>
                            <TouchableOpacity onPress={() => navigation.navigate('Login')}>
                                <Text style={styles.link}>{t('Sign In')}</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </ScrollView>
            </KeyboardAvoidingView>
            <Toast />
        </SafeAreaView>
    );
}

const PURPLE = '#7C3AED';

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F3F4F6',
    },
    scrollContent: {
        flexGrow: 1,
        justifyContent: 'center',
        paddingHorizontal: 20,
        paddingVertical: 32,
    },
    topBanner: {
        alignItems: 'center',
        marginBottom: 24,
    },
    bannerEmoji: {
        fontSize: 48,
        marginBottom: 6,
    },
    bannerTitle: {
        fontSize: 26,
        fontWeight: '800',
        color: PURPLE,
        letterSpacing: 1,
    },
    bannerSubtitle: {
        fontSize: 13,
        color: '#6B7280',
        marginTop: 4,
        textAlign: 'center',
    },
    card: {
        backgroundColor: '#fff',
        borderRadius: 24,
        padding: 24,
        elevation: 4,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
    },
    title: {
        fontSize: 24,
        fontWeight: '800',
        color: '#111827',
        marginBottom: 4,
    },
    subtitle: {
        fontSize: 14,
        color: '#6B7280',
        marginBottom: 22,
    },
    inputContainer: {
        marginBottom: 14,
    },
    label: {
        fontSize: 13,
        color: '#374151',
        marginBottom: 6,
        fontWeight: '600',
    },
    input: {
        borderWidth: 1.5,
        borderColor: '#E5E7EB',
        borderRadius: 12,
        padding: 13,
        fontSize: 15,
        backgroundColor: '#F9FAFB',
        color: '#111827',
    },
    passwordRow: {
        flexDirection: 'row',
        alignItems: 'center',
        borderWidth: 1.5,
        borderColor: '#E5E7EB',
        borderRadius: 12,
        backgroundColor: '#F9FAFB',
        overflow: 'hidden',
    },
    eyeBtn: {
        paddingHorizontal: 12,
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 13,
    },
    eyeIcon: {
        fontSize: 18,
    },
    hint: {
        fontSize: 12,
        color: '#9CA3AF',
        marginBottom: 18,
        marginTop: -4,
    },
    button: {
        backgroundColor: PURPLE,
        padding: 16,
        borderRadius: 14,
        alignItems: 'center',
        elevation: 3,
        shadowColor: PURPLE,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.4,
        shadowRadius: 8,
    },
    buttonDisabled: {
        opacity: 0.7,
    },
    buttonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: '700',
        letterSpacing: 0.5,
    },
    footer: {
        flexDirection: 'row',
        justifyContent: 'center',
        marginTop: 20,
    },
    footerText: {
        color: '#6B7280',
        fontSize: 14,
    },
    link: {
        color: PURPLE,
        fontSize: 14,
        fontWeight: '700',
    },
});
