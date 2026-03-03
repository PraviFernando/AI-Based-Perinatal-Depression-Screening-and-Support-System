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
    ScrollView 
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Toast from 'react-native-toast-message';
import api from '../services/api';

export default function SignupScreen({ navigation }) {
    const [username, setUsername] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [loading, setLoading] = useState(false);

    const validateForm = () => {
        // Check empty fields
        if (!username || !email || !password || !confirmPassword) {
            Toast.show({
                type: 'error',
                text1: 'Validation Error',
                text2: 'Please fill in all fields',
                position: 'top',
                topOffset: 60,
                visibilityTime: 3000,
            });
            return false;
        }

        // Username validation
        if (username.length < 3) {
            Toast.show({
                type: 'error',
                text1: 'Validation Error',
                text2: 'Username must be at least 3 characters',
                position: 'top',
                topOffset: 60,
                visibilityTime: 3000,
            });
            return false;
        }

        // Email validation
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            Toast.show({
                type: 'error',
                text1: 'Validation Error',
                text2: 'Please enter a valid email address',
                position: 'top',
                topOffset: 60,
                visibilityTime: 3000,
            });
            return false;
        }

        // Password validation
        if (password.length < 6) {
            Toast.show({
                type: 'error',
                text1: 'Validation Error',
                text2: 'Password must be at least 6 characters',
                position: 'top',
                topOffset: 60,
                visibilityTime: 3000,
            });
            return false;
        }

        // Confirm password validation
        if (password !== confirmPassword) {
            Toast.show({
                type: 'error',
                text1: 'Validation Error',
                text2: 'Passwords do not match',
                position: 'top',
                topOffset: 60,
                visibilityTime: 3000,
            });
            return false;
        }

        return true;
    };

    const handleSignup = async () => {
        if (!validateForm()) return;

        setLoading(true);
        try {
            const response = await api.post('/user/signup', {
                username,
                email,
                password,
            });

            Toast.show({
                type: 'success',
                text1: 'Success!',
                text2: 'Account created successfully',
                position: 'top',
                topOffset: 60,
                visibilityTime: 2000,
            });

            // Clear form
            setUsername('');
            setEmail('');
            setPassword('');
            setConfirmPassword('');

            // Navigate after showing toast
            setTimeout(() => {
                navigation.navigate('Login');
            }, 2000);
            
        } catch (error) {
            console.error('Signup error:', error);
            
            let message = 'Signup failed. Please try again.';
            
            if (error.response) {
                // Handle specific error cases
                if (error.response.status === 409) {
                    message = 'User already exists with this email';
                } else if (error.response.status === 400) {
                    message = error.response.data?.message || 'Invalid input data';
                } else {
                    message = error.response.data?.message || 
                            error.response.data?.error || 
                            `Server error: ${error.response.status}`;
                }
            } else if (error.request) {
                message = 'Network error. Please check your connection.';
            }
            
            Toast.show({
                type: 'error',
                text1: 'Signup Failed',
                text2: message,
                position: 'top',
                topOffset: 60,
                visibilityTime: 4000,
            });
        } finally {
            setLoading(false);
        }
    };

    return (
        <SafeAreaView style={styles.container}>
            <KeyboardAvoidingView 
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                style={styles.keyboardView}
            >
                <ScrollView 
                    contentContainerStyle={styles.scrollContent}
                    showsVerticalScrollIndicator={false}
                >
                    <View style={styles.content}>
                        {/* Header */}
                        <View style={styles.header}>
                            <Text style={styles.title}>Create Account</Text>
                            <Text style={styles.subtitle}>Sign up to get started</Text>
                        </View>

                        {/* Form */}
                        <View style={styles.form}>
                            {/* Username Input */}
                            <View style={styles.inputContainer}>
                                <Text style={styles.label}>Username</Text>
                                <TextInput
                                    style={styles.input}
                                    placeholder="Enter your username"
                                    placeholderTextColor="#999"
                                    value={username}
                                    onChangeText={setUsername}
                                    autoCapitalize="none"
                                    editable={!loading}
                                />
                            </View>

                            {/* Email Input */}
                            <View style={styles.inputContainer}>
                                <Text style={styles.label}>Email Id</Text>
                                <TextInput
                                    style={styles.input}
                                    placeholder="Enter your email"
                                    placeholderTextColor="#999"
                                    value={email}
                                    onChangeText={setEmail}
                                    keyboardType="email-address"
                                    autoCapitalize="none"
                                    editable={!loading}
                                />
                            </View>

                            {/* Password Input */}
                            <View style={styles.inputContainer}>
                                <Text style={styles.label}>Password</Text>
                                <TextInput
                                    style={styles.input}
                                    placeholder="Enter your password"
                                    placeholderTextColor="#999"
                                    value={password}
                                    onChangeText={setPassword}
                                    secureTextEntry
                                    editable={!loading}
                                />
                            </View>

                            {/* Confirm Password Input */}
                            <View style={styles.inputContainer}>
                                <Text style={styles.label}>Confirm Password</Text>
                                <TextInput
                                    style={styles.input}
                                    placeholder="Confirm your password"
                                    placeholderTextColor="#999"
                                    value={confirmPassword}
                                    onChangeText={setConfirmPassword}
                                    secureTextEntry
                                    editable={!loading}
                                />
                            </View>

                            {/* Sign Up Button */}
                            <TouchableOpacity 
                                style={[styles.signupButton, loading && styles.signupButtonDisabled]} 
                                onPress={handleSignup} 
                                disabled={loading}
                                activeOpacity={0.8}
                            >
                                {loading ? (
                                    <ActivityIndicator color="#fff" />
                                ) : (
                                    <Text style={styles.signupButtonText}>Sign Up</Text>
                                )}
                            </TouchableOpacity>
                        </View>

                        {/* Login Link */}
                        <View style={styles.footer}>
                            <Text style={styles.footerText}>Already have an account? </Text>
                            <TouchableOpacity 
                                onPress={() => navigation.navigate('Login')}
                                disabled={loading}
                            >
                                <Text style={styles.loginLink}>Login</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </ScrollView>
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff',
    },
    keyboardView: {
        flex: 1,
    },
    scrollContent: {
        flexGrow: 1,
    },
    content: {
        flex: 1,
        paddingHorizontal: 24,
        justifyContent: 'center',
        paddingVertical: 40,
    },
    header: {
        marginBottom: 30,
    },
    title: {
        fontSize: 32,
        fontWeight: '600',
        color: '#333',
        marginBottom: 8,
        textAlign: 'center',
    },
    subtitle: {
        fontSize: 16,
        color: '#666',
        textAlign: 'center',
    },
    form: {
        marginBottom: 20,
    },
    inputContainer: {
        marginBottom: 20,
    },
    label: {
        fontSize: 14,
        color: '#555',
        marginBottom: 8,
        fontWeight: '500',
    },
    input: {
        borderWidth: 1,
        borderColor: '#ddd',
        borderRadius: 8,
        padding: 15,
        fontSize: 16,
        backgroundColor: '#fff',
        color: '#333',
    },
    signupButton: {
        backgroundColor: '#007AFF',
        padding: 16,
        borderRadius: 8,
        alignItems: 'center',
        marginTop: 10,
    },
    signupButtonDisabled: {
        opacity: 0.7,
        backgroundColor: '#999',
    },
    signupButtonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: '600',
    },
    footer: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        marginTop: 20,
    },
    footerText: {
        color: '#666',
        fontSize: 14,
    },
    loginLink: {
        color: '#007AFF',
        fontSize: 14,
        fontWeight: '600',
    },
});