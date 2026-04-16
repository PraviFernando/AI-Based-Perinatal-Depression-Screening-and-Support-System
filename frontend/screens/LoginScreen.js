import React, { useState } from 'react';
import {
    View,
    Text,
    TextInput,
    TouchableOpacity,
    StyleSheet,
    ActivityIndicator,
    KeyboardAvoidingView,
    Platform,
    ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Toast from 'react-native-toast-message';
import api, { setAuthToken } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useTranslation } from 'react-i18next';

export default function LoginScreen({ navigation }) {
    const { t, i18n } = useTranslation();
    const { login } = useAuth();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);

    const handleLogin = async () => {
        if (!email || !password) {
            Toast.show({
                type: 'error',
                text1: 'Missing Fields',
                text2: 'Please fill in your email and password.',
                position: 'top',
            });
            return;
        }

        setLoading(true);
        try {
            const response = await api.post('/user/signin', { email, password });
            const { token, ...userData } = response.data;

            // Store token so all future API calls are authenticated
            setAuthToken(token);
            login(userData, token);

            Toast.show({
                type: 'success',
                text1: '✅ Welcome Back!',
                text2: `Signed in as ${userData?.username || email}`,
                position: 'top',
            });

            // Route to the correct dashboard based on role
            const role = userData?.role || 'patient';
            setTimeout(() => {
                if (role === 'admin') {
                    navigation.replace('AdminDashboard');
                } else if (role === 'midwife') {
                    navigation.replace('MidwifeDashboard');
                } else {
                    navigation.replace('Dashboard');
                }
            }, 1000);
        } catch (error) {
            console.error(error);
            const message =
                error.response?.data?.message || 'Login failed. Please try again.';
            Toast.show({
                type: 'error',
                text1: '❌ Sign In Failed',
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

                    {/* Decorative top banner */}
                    <View style={styles.topBanner}>
                        <Text style={styles.bannerEmoji}>🌸</Text>
                        <Text style={styles.bannerTitle}>{t('PeriCare')}</Text>
                        <Text style={styles.bannerSubtitle}>
                            {t('Perinatal Depression Support System')}
                        </Text>
                    </View>

                    {/* Card */}
                    <View style={styles.card}>
                        <Text style={styles.title}>{t('Welcome Back')}</Text>
                        <Text style={styles.subtitle}>{t('Sign in to continue')}</Text>

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

                        {/* Forgot Password */}
                        <TouchableOpacity
                            style={styles.forgotRow}
                            onPress={() =>
                                Toast.show({
                                    type: 'info',
                                    text1: 'Reset Password',
                                    text2: 'Password reset feature coming soon.',
                                    position: 'top',
                                })
                            }
                        >
                            <Text style={styles.forgotText}>Forgot Password?</Text>
                        </TouchableOpacity>

                        {/* Sign In Button */}
                        <TouchableOpacity
                            style={[styles.button, loading && styles.buttonDisabled]}
                            onPress={handleLogin}
                            disabled={loading}
                        >
                            {loading ? (
                                <ActivityIndicator color="#fff" />
                            ) : (
                                <Text style={styles.buttonText}>{t('Sign In')}</Text>
                            )}
                        </TouchableOpacity>

                        {/* Signup Link */}
                        <View style={styles.footer}>
                            <Text style={styles.footerText}>{t('Don\'t have an account?')} </Text>
                            <TouchableOpacity onPress={() => navigation.navigate('Signup')}>
                                <Text style={styles.link}>{t('Sign Up')}</Text>
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
        marginBottom: 28,
    },
    bannerEmoji: {
        fontSize: 52,
        marginBottom: 6,
    },
    bannerTitle: {
        fontSize: 28,
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
        fontSize: 26,
        fontWeight: '800',
        color: '#111827',
        marginBottom: 4,
    },
    subtitle: {
        fontSize: 14,
        color: '#6B7280',
        marginBottom: 24,
    },
    inputContainer: {
        marginBottom: 16,
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
        height: '100%',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 13,
    },
    eyeIcon: {
        fontSize: 18,
    },
    forgotRow: {
        alignSelf: 'flex-end',
        marginBottom: 20,
        marginTop: -4,
    },
    forgotText: {
        color: PURPLE,
        fontSize: 13,
        fontWeight: '600',
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
