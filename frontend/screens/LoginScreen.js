import React, { useState } from 'react';
import { 
    View, 
    Text, 
    TextInput, 
    TouchableOpacity, 
    StyleSheet, 
    ActivityIndicator,
    KeyboardAvoidingView,
    Platform
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Toast from 'react-native-toast-message';
import api from '../services/api';

export default function LoginScreen({ navigation }) {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);

    const handleLogin = async () => {
        // Validation
        if (!email || !password) {
            Toast.show({
                type: 'error',
                text1: 'Validation Error',
                text2: 'Please fill in all fields',
                position: 'top',
                topOffset: 60,
                visibilityTime: 3000,
            });
            return;
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
            return;
        }

        setLoading(true);
        try {
            const response = await api.post('/user/signin', {
                email,
                password,
            });

            // Show success message
            Toast.show({
                type: 'success',
                text1: 'Success!',
                text2: 'Logged in successfully',
                position: 'top',
                topOffset: 60,
                visibilityTime: 2000,
            });

            // Clear form
            setEmail('');
            setPassword('');
            
            // Navigate after showing toast
            setTimeout(() => {
                navigation.replace('Home');
            }, 2000);
            
        } catch (error) {
            console.error('Login error:', error);
            
            let message = 'Login failed. Please try again.';
            
            if (error.response) {
                // The request was made and the server responded with a status code
                // that falls out of the range of 2xx
                message = error.response.data?.message || 
                        error.response.data?.error || 
                        `Server error: ${error.response.status}`;
            } else if (error.request) {
                // The request was made but no response was received
                message = 'Network error. Please check your connection.';
            }
            
            Toast.show({
                type: 'error',
                text1: 'Login Failed',
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
                <View style={styles.content}>
                    {/* Header */}
                    <View style={styles.header}>
                        <Text style={styles.title}>User Login</Text>
                        <Text style={styles.subtitle}>Welcome back!</Text>
                    </View>

                    {/* Form */}
                    <View style={styles.form}>
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
                                autoComplete="email"
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
                                autoCapitalize="none"
                                editable={!loading}
                            />
                        </View>

                        {/* Login Button */}
                        <TouchableOpacity 
                            style={[styles.loginButton, loading && styles.loginButtonDisabled]} 
                            onPress={handleLogin} 
                            disabled={loading}
                            activeOpacity={0.8}
                        >
                            {loading ? (
                                <ActivityIndicator color="#fff" />
                            ) : (
                                <Text style={styles.loginButtonText}>Login</Text>
                            )}
                        </TouchableOpacity>

                        {/* Forgot Password Link */}
                        <TouchableOpacity 
                            style={styles.forgotContainer}
                            onPress={() => {
                                Toast.show({
                                    type: 'info',
                                    text1: 'Info',
                                    text2: 'Password reset feature coming soon',
                                    position: 'top',
                                    topOffset: 60,
                                    visibilityTime: 2000,
                                });
                            }}
                            disabled={loading}
                        >
                            <Text style={styles.forgotText}>Forgot Username / Password?</Text>
                        </TouchableOpacity>
                    </View>

                    {/* Sign Up Link */}
                    <View style={styles.footer}>
                        <Text style={styles.footerText}>Don't have an account? </Text>
                        <TouchableOpacity 
                            onPress={() => navigation.navigate('Signup')}
                            disabled={loading}
                        >
                            <Text style={styles.signupLink}>Sign Up</Text>
                        </TouchableOpacity>
                    </View>
                </View>
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
    content: {
        flex: 1,
        paddingHorizontal: 24,
        justifyContent: 'center',
    },
    header: {
        marginBottom: 40,
    },
    title: {
        fontSize: 32,
        fontWeight: '600',
        color: '#333',
        textAlign: 'center',
        marginBottom: 8,
    },
    subtitle: {
        fontSize: 16,
        color: '#666',
        textAlign: 'center',
    },
    form: {
        marginBottom: 30,
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
    loginButton: {
        backgroundColor: '#007AFF',
        padding: 16,
        borderRadius: 8,
        alignItems: 'center',
        marginTop: 10,
        marginBottom: 15,
    },
    loginButtonDisabled: {
        opacity: 0.7,
        backgroundColor: '#999',
    },
    loginButtonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: '600',
    },
    forgotContainer: {
        alignItems: 'center',
        paddingVertical: 10,
    },
    forgotText: {
        color: '#007AFF',
        fontSize: 14,
        fontWeight: '500',
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
    signupLink: {
        color: '#007AFF',
        fontSize: 14,
        fontWeight: '600',
    },
});