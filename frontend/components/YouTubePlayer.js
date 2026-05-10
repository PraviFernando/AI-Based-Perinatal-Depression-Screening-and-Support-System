import React, { useState, useRef } from 'react';
import { View, StyleSheet, ActivityIndicator, Text, TouchableOpacity } from 'react-native';
import { WebView } from 'react-native-webview';
import { Video, ResizeMode } from 'expo-av';

const YouTubePlayer = ({ url, style, isSinhala }) => {
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(false);
    const webViewRef = useRef(null);
    
    // Convert YouTube URL to embed format
    const getEmbedUrl = (videoUrl) => {
        let videoId = '';
        
        if (videoUrl.includes('youtube.com/embed/')) {
            return videoUrl;
        }
        
        if (videoUrl.includes('youtu.be/')) {
            videoId = videoUrl.split('youtu.be/')[1]?.split('?')[0];
        } else if (videoUrl.includes('youtube.com/watch')) {
            const urlParams = new URLSearchParams(videoUrl.split('?')[1]);
            videoId = urlParams.get('v');
        } else if (videoUrl.includes('youtube.com/embed/')) {
            return videoUrl;
        }
        
        if (videoId) {
            return `https://www.youtube.com/embed/${videoId}?playsinline=1&controls=1&rel=0&modestbranding=1`;
        }
        
        return videoUrl;
    };
    
    const embedUrl = getEmbedUrl(url);
    
    if (!embedUrl.includes('youtube.com/embed/')) {
        return (
            <View style={[styles.container, style]}>
                <Text style={styles.errorText}>
                    {isSinhala ? 'වීඩියෝව පැටවීමට නොහැක' : 'Cannot load video'}
                </Text>
            </View>
        );
    }
    
    return (
        <View style={[styles.container, style]}>
            {loading && (
                <View style={styles.loadingContainer}>
                    <ActivityIndicator size="large" color="#7C3AED" />
                    <Text style={styles.loadingText}>
                        {isSinhala ? 'වීඩියෝව පූරණය වෙමින්...' : 'Loading video...'}
                    </Text>
                </View>
            )}
            {error && (
                <View style={styles.errorContainer}>
                    <Text style={styles.errorText}>
                        {isSinhala ? 'වීඩියෝව පැටවීමට අසමත් විය' : 'Failed to load video'}
                    </Text>
                    <TouchableOpacity 
                        style={styles.retryBtn}
                        onPress={() => {
                            setError(false);
                            setLoading(true);
                            webViewRef.current?.reload();
                        }}
                    >
                        <Text style={styles.retryBtnText}>
                            {isSinhala ? 'නැවත උත්සාහ කරන්න' : 'Retry'}
                        </Text>
                    </TouchableOpacity>
                </View>
            )}
            <WebView
                ref={webViewRef}
                source={{ uri: embedUrl }}
                style={styles.webview}
                allowsFullscreenVideo={true}
                allowsInlineMediaPlayback={true}
                mediaPlaybackRequiresUserAction={false}
                javaScriptEnabled={true}
                domStorageEnabled={true}
                onLoadStart={() => setLoading(true)}
                onLoadEnd={() => setLoading(false)}
                onError={() => {
                    setLoading(false);
                    setError(true);
                }}
                containerStyle={{ backgroundColor: '#000' }}
            />
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#000',
        borderRadius: 12,
        overflow: 'hidden',
    },
    webview: {
        flex: 1,
    },
    loadingContainer: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#000',
        zIndex: 10,
    },
    loadingText: {
        color: '#fff',
        marginTop: 10,
        fontSize: 12,
    },
    errorContainer: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#000',
        zIndex: 10,
    },
    errorText: {
        color: '#fff',
        fontSize: 14,
        marginBottom: 15,
    },
    retryBtn: {
        backgroundColor: '#7C3AED',
        paddingHorizontal: 20,
        paddingVertical: 10,
        borderRadius: 8,
    },
    retryBtnText: {
        color: '#fff',
        fontWeight: '600',
    },
});

export default YouTubePlayer;