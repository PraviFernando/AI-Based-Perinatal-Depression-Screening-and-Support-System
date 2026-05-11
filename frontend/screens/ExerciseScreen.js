import React, { useState, useEffect, useRef } from 'react';
import {
    View, Text, ScrollView, TouchableOpacity, StyleSheet,
    ActivityIndicator, Alert, Modal, TextInput, Switch,
    Dimensions, Image, FlatList, Platform, Linking
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import Toast from 'react-native-toast-message';
import * as DocumentPicker from 'expo-document-picker';
import { Video, ResizeMode } from 'expo-av';
import { WebView } from 'react-native-webview';
import exerciseService from '../services/exerciseService';
import { useAuth } from '../context/AuthContext';
import { useTranslation } from 'react-i18next';

const { width } = Dimensions.get('window');

const todayStr = () => {
    const d = new Date();
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
};

// YouTube Player Component
const YouTubePlayer = ({ url, style }) => {
    const { t } = useTranslation();
    const [error, setError] = useState(false);
    const webViewRef = useRef(null);
    
    const getEmbedUrl = (videoUrl) => {
        if (!videoUrl) return '';
        let videoId = '';
        
        if (videoUrl.includes('youtube.com/embed/')) {
            return videoUrl;
        }
        
        if (videoUrl.includes('youtu.be/')) {
            videoId = videoUrl.split('youtu.be/')[1]?.split('?')[0];
        } else if (videoUrl.includes('youtube.com/watch')) {
            try {
                const urlParams = new URLSearchParams(videoUrl.split('?')[1]);
                videoId = urlParams.get('v');
            } catch (e) {
                console.log('Error parsing URL:', e);
            }
        }
        
        if (videoId) {
            return `https://www.youtube.com/embed/${videoId}?playsinline=1&controls=1&rel=0&modestbranding=1`;
        }
        
        return videoUrl;
    };
    
    const embedUrl = getEmbedUrl(url);
    
    if (!embedUrl.includes('youtube.com/embed/')) {
        return (
            <View style={[styles.videoPlayer, styles.videoPlayerCentered]}>
                <Text style={{ color: '#fff', textAlign: 'center' }}>
                    {t('Failed to load video')}
                </Text>
            </View>
        );
    }
    
    return (
        <View style={[styles.videoPlayer, { overflow: 'hidden' }]}>
            {error && (
                <View style={styles.webViewErrorContainer}>
                    <Text style={styles.webViewErrorText}>
                        {t('Failed to load video')}
                    </Text>
                    <TouchableOpacity 
                        style={styles.webViewRetryBtn}
                        onPress={() => {
                            setError(false);
                            webViewRef.current?.reload();
                        }}
                    >
                        <Text style={styles.webViewRetryBtnText}>
                            {t('Retry')}
                        </Text>
                    </TouchableOpacity>
                </View>
            )}
            {Platform.OS === 'web' ? (
                <iframe
                    src={embedUrl}
                    style={{ flex: 1, border: 'none', width: '100%', height: '100%' }}
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                />
            ) : (
                <WebView
                    ref={webViewRef}
                    source={{ uri: embedUrl }}
                    style={styles.webView}
                    allowsFullscreenVideo={true}
                    allowsInlineMediaPlayback={true}
                    mediaPlaybackRequiresUserAction={false}
                    javaScriptEnabled={true}
                    domStorageEnabled={true}
                    startInLoadingState={true}
                    renderLoading={() => (
                        <View style={styles.webViewLoadingContainer}>
                            <ActivityIndicator size="large" color="#7C3AED" />
                        </View>
                    )}
                    onError={() => {
                        setError(true);
                    }}
                />
            )}
        </View>
    );
};

// Health Data Input Component
const HealthDataForm = ({ onSubmit, loading, initialData, user }) => {
    const { t } = useTranslation();
    
    const [deliveryDate, setDeliveryDate] = useState(user?.deliveryDate || '');
    const [weeks, setWeeks] = useState(initialData?.weeksAfterDelivery || '');
    const [deliveryType, setDeliveryType] = useState(initialData?.deliveryType || 'normal');
    
    useEffect(() => {
        if (deliveryDate && deliveryDate.length === 10) {
            try {
                const birthDate = new Date(deliveryDate);
                const today = new Date();
                if (!isNaN(birthDate.getTime())) {
                    const diffTime = Math.abs(today - birthDate);
                    const calculatedWeeks = Math.floor(diffTime / (1000 * 60 * 60 * 24 * 7));
                    setWeeks(String(calculatedWeeks));
                }
            } catch (e) {
                console.log("Date calculation error", e);
            }
        }
    }, [deliveryDate]);

    const [pelvicPain, setPelvicPain] = useState(initialData?.pelvicPain || false);
    const [backPain, setBackPain] = useState(initialData?.backPain || false);
    const [abdominalPain, setAbdominalPain] = useState(initialData?.abdominalPain || false);
    const [bleeding, setBleeding] = useState(initialData?.bleedingComplications || false);
    const [doctorRestrictions, setDoctorRestrictions] = useState(initialData?.doctorRestrictions || false);
    const [fatigue, setFatigue] = useState(initialData?.fatigueLevel || 'low');
    const [mobility, setMobility] = useState(initialData?.mobilityLevel || 'normal');
    const [muscleWeakness, setMuscleWeakness] = useState(initialData?.muscleWeakness || false);
    const [willingness, setWillingness] = useState(initialData?.willingnessToExercise || 'medium');
    
    const handleSubmit = () => {
        if (!weeks) {
            Toast.show({ type: 'error', text1: t('Please enter weeks after delivery') });
            return;
        }
        onSubmit({
            date: todayStr(),
            deliveryDate,
            weeksAfterDelivery: parseInt(weeks),
            deliveryType,
            pelvicPain,
            backPain,
            abdominalPain,
            bleedingComplications: bleeding,
            doctorRestrictions,
            fatigueLevel: fatigue,
            mobilityLevel: mobility,
            muscleWeakness,
            willingnessToExercise: willingness
        });
    };
    
    return (
        <ScrollView style={styles.formContainer} showsVerticalScrollIndicator={false}>
            <Text style={styles.formTitle}>
                {t('Today\'s Health Status')}
            </Text>
            
            {(!user?.deliveryDate) && (
                <View style={styles.inputGroup}>
                    <Text style={styles.label}>
                        {t('Delivery Date')} ({t('YYYY-MM-DD')})
                    </Text>
                    <TextInput
                        style={styles.input}
                        placeholder={t("2024-05-10")}
                        value={deliveryDate}
                        onChangeText={setDeliveryDate}
                        placeholderTextColor="#9CA3AF"
                    />
                </View>
            )}
            
            <View style={styles.inputGroup}>
                <Text style={styles.label}>
                    {t('Weeks After Delivery')}
                </Text>
                <TextInput
                    style={[styles.input, deliveryDate ? { backgroundColor: '#F3F4F6', color: '#6B7280' } : {}]}
                    placeholder={t("e.g., 4")}
                    keyboardType="numeric"
                    value={String(weeks)}
                    onChangeText={setWeeks}
                    editable={!deliveryDate}
                    placeholderTextColor="#9CA3AF"
                />
            </View>
            
            <View style={styles.inputGroup}>
                <Text style={styles.label}>{t('Delivery Type')}</Text>
                <View style={styles.rowButtons}>
                    <TouchableOpacity
                        style={[styles.optionBtn, deliveryType === 'normal' && styles.optionBtnActive]}
                        onPress={() => setDeliveryType('normal')}
                    >
                        <Text style={[styles.optionText, deliveryType === 'normal' && styles.optionTextActive]}>
                            {t('Normal')}
                        </Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                        style={[styles.optionBtn, deliveryType === 'c-section' && styles.optionBtnActive]}
                        onPress={() => setDeliveryType('c-section')}
                    >
                        <Text style={[styles.optionText, deliveryType === 'c-section' && styles.optionTextActive]}>
                            {t('C-Section')}
                        </Text>
                    </TouchableOpacity>
                </View>
            </View>
            
            <Text style={[styles.label, { marginTop: 8 }]}>
                {t('Pain Conditions')}
            </Text>
            <View style={styles.checkboxGroup}>
                <TouchableOpacity style={styles.checkboxRow} onPress={() => setPelvicPain(!pelvicPain)}>
                    <View style={[styles.checkbox, pelvicPain && styles.checkboxChecked]} />
                    <Text style={styles.checkboxLabel}>{t('Pelvic Pain')}</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.checkboxRow} onPress={() => setBackPain(!backPain)}>
                    <View style={[styles.checkbox, backPain && styles.checkboxChecked]} />
                    <Text style={styles.checkboxLabel}>{t('Back Pain')}</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.checkboxRow} onPress={() => setAbdominalPain(!abdominalPain)}>
                    <View style={[styles.checkbox, abdominalPain && styles.checkboxChecked]} />
                    <Text style={styles.checkboxLabel}>{t('Abdominal Pain')}</Text>
                </TouchableOpacity>
            </View>
            
            <View style={styles.checkboxGroup}>
                <TouchableOpacity style={styles.checkboxRow} onPress={() => setBleeding(!bleeding)}>
                    <View style={[styles.checkbox, bleeding && styles.checkboxChecked]} />
                    <Text style={styles.checkboxLabel}>{t('Bleeding Complications')}</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.checkboxRow} onPress={() => setDoctorRestrictions(!doctorRestrictions)}>
                    <View style={[styles.checkbox, doctorRestrictions && styles.checkboxChecked]} />
                    <Text style={styles.checkboxLabel}>{t('Doctor Restrictions')}</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.checkboxRow} onPress={() => setMuscleWeakness(!muscleWeakness)}>
                    <View style={[styles.checkbox, muscleWeakness && styles.checkboxChecked]} />
                    <Text style={styles.checkboxLabel}>{t('Muscle Weakness')}</Text>
                </TouchableOpacity>
            </View>
            
            <View style={styles.inputGroup}>
                <Text style={styles.label}>{t('Fatigue Level')}</Text>
                <View style={styles.rowButtons}>
                    {['low', 'medium', 'high'].map(level => (
                        <TouchableOpacity
                            key={level}
                            style={[styles.optionBtn, fatigue === level && styles.optionBtnActive]}
                            onPress={() => setFatigue(level)}
                        >
                            <Text style={[styles.optionText, fatigue === level && styles.optionTextActive]}>
                                {t(level.charAt(0).toUpperCase() + level.slice(1))}
                            </Text>
                        </TouchableOpacity>
                    ))}
                </View>
            </View>
            
            <View style={styles.inputGroup}>
                <Text style={styles.label}>{t('Mobility Level')}</Text>
                <View style={styles.columnButtons}>
                    {['very_limited', 'limited', 'normal'].map(level => (
                        <TouchableOpacity
                            key={level}
                            style={[styles.optionBtnWide, mobility === level && styles.optionBtnActive]}
                            onPress={() => setMobility(level)}
                        >
                            <Text style={[styles.optionText, mobility === level && styles.optionTextActive]}>
                                {level === 'very_limited' ? t('Very Restricted') : level === 'limited' ? t('Restricted') : t('Normal Mobility')}
                            </Text>
                        </TouchableOpacity>
                    ))}
                </View>
            </View>
            
            <View style={styles.inputGroup}>
                <Text style={styles.label}>{t('Willingness to Exercise')}</Text>
                <View style={styles.rowButtons}>
                    {['low', 'medium', 'high'].map(level => (
                        <TouchableOpacity
                            key={level}
                            style={[styles.optionBtn, willingness === level && styles.optionBtnActive]}
                            onPress={() => setWillingness(level)}
                        >
                            <Text style={[styles.optionText, willingness === level && styles.optionTextActive]}>
                                {t(level.charAt(0).toUpperCase() + level.slice(1))}
                            </Text>
                        </TouchableOpacity>
                    ))}
                </View>
            </View>
            
            <TouchableOpacity
                style={[styles.submitBtn, loading && styles.submitBtnDisabled]}
                onPress={handleSubmit}
                disabled={loading}
            >
                {loading ? (
                    <ActivityIndicator color="#fff" />
                ) : (
                    <Text style={styles.submitBtnText}>
                        {t('Get Exercise Recommendations')}
                    </Text>
                )}
            </TouchableOpacity>
        </ScrollView>
    );
};

// Exercise Recommendation Card Component
const ExerciseCard = ({ exercise, onComplete, onUploadVideo, isCompleted }) => {
    const { t } = useTranslation();
    const [videoModal, setVideoModal] = useState(false);
    const [selectedVideo, setSelectedVideo] = useState(null);
    const [uploading, setUploading] = useState(false);
    const [videoPlaying, setVideoPlaying] = useState(false);
    const videoRef = useRef(null);
    
    const details = exercise.exerciseDetails || {};
    
    const videoList = details.videos || (details.videoUrl ? [{ url: details.videoUrl, title: details.name, titleSi: details.nameSi, duration: `${details.duration} ${t('min')}`, source: "YouTube" }] : []);
    const hasMultipleVideos = videoList.length > 1;
    
    const getExerciseIcon = (type) => {
        switch(type) {
            case 'breathing': return '🌬️';
            case 'pelvic_floor': return '💪';
            case 'stretching': return '🧘';
            case 'walking': return '🚶';
            default: return '🏋️';
        }
    };
    
    const handleUpload = async () => {
        try {
            const result = await DocumentPicker.getDocumentAsync({
                type: 'video/*',
                copyToCacheDirectory: true
            });
            
            if (result.canceled || !result.assets || result.assets.length === 0) return;
            
            setSelectedVideo(result.assets[0]);
            setUploading(true);
            
            const response = await onUploadVideo(exercise.exerciseId, result.assets[0].uri);
            
            Toast.show({
                type: response.accuracy > 70 ? 'success' : 'info',
                text1: `📊 ${t('Analysis Complete')}`,
                text2: response.feedbackSi || response.feedback,
                position: 'top',
                visibilityTime: 4000
            });
            
            setVideoModal(false);
            setSelectedVideo(null);
        } catch (err) {
            Toast.show({ type: 'error', text1: t('Upload failed'), text2: err.message });
        } finally {
            setUploading(false);
        }
    };
    
    const renderVideoItem = ({ item, index }) => (
        <TouchableOpacity
            style={styles.videoOption}
            onPress={() => setSelectedVideo(item)}
        >
            <Text style={styles.videoOptionIcon}>📹</Text>
            <View style={styles.videoOptionInfo}>
                <Text style={styles.videoOptionTitle}>
                    {item.titleSi || item.title || `${t('Video')} ${index + 1}`}
                </Text>
                <Text style={styles.videoOptionDuration}>{item.duration || `${details.duration} ${t('min')}`} • {item.source === 'YouTube' ? t('YouTube') : (item.source || t('YouTube'))}</Text>
            </View>
            <Text style={styles.videoOptionArrow}>→</Text>
        </TouchableOpacity>
    );
    
    return (
        <LinearGradient
            colors={isCompleted ? ['#E8F5E9', '#C8E6C9'] : ['#FFFFFF', '#F5F3FF']}
            style={[styles.exerciseCard, isCompleted && styles.exerciseCardCompleted]}
        >
            <View style={styles.exerciseHeader}>
                <Text style={styles.exerciseIcon}>{getExerciseIcon(details.type)}</Text>
                <View style={styles.exerciseInfo}>
                    <Text style={styles.exerciseName}>
                        {details.nameSi || details.name}
                    </Text>
                    <Text style={styles.exerciseMeta}>
                        ⏱️ {t('Duration')}: {details.duration || exercise.duration} {t('min')} • 
                        📊 {t('Intensity')}: {
                            details.intensity === 'low' ? t('Low') : details.intensity === 'medium' ? t('Medium') : details.intensity === 'controlled' ? t('Controlled') : ''
                        }
                    </Text>
                </View>
                {!isCompleted && (
                    <TouchableOpacity
                        style={styles.completeBtn}
                        onPress={() => onComplete(exercise)}
                    >
                        <Text style={styles.completeBtnText}>✓</Text>
                    </TouchableOpacity>
                )}
                {isCompleted && (
                    <View style={styles.completedBadge}>
                        <Text style={styles.completedBadgeText}>✓ {t('Done')}</Text>
                    </View>
                )}
            </View>
            
            <Text style={styles.exerciseDesc}>
                {details.descriptionSi || details.description}
            </Text>
            
            {details.steps && details.steps.length > 0 && (
                <View style={styles.stepsContainer}>
                    <Text style={styles.stepsTitle}>📋 {t('Steps')}:</Text>
                    {details.steps.slice(0, 3).map((step, idx) => (
                        <Text key={idx} style={styles.stepText}>
                            {idx + 1}. {step.instructionSi || step.instruction}
                        </Text>
                    ))}
                </View>
            )}
            
            {videoList.length > 0 && (
                <TouchableOpacity
                    style={styles.watchVideoBtn}
                    onPress={() => {
                        setSelectedVideo(null);
                        setVideoModal(true);
                    }}
                >
                    <Text style={styles.watchVideoBtnText}>
                        🎬 {t('Watch Video')} 
                        {hasMultipleVideos ? ` (${videoList.length})` : ''}
                    </Text>
                </TouchableOpacity>
            )}
            
            <Modal visible={videoModal} transparent animationType="slide" onRequestClose={() => {
                setVideoModal(false);
                setVideoPlaying(false);
                setSelectedVideo(null);
            }}>
                <View style={styles.modalOverlay}>
                    <View style={styles.videoModalContent}>
                        <Text style={styles.modalTitle}>
                            {t('Select a Video')}
                        </Text>
                        
                        {!selectedVideo ? (
                            <FlatList
                                data={videoList}
                                keyExtractor={(item, index) => index.toString()}
                                renderItem={renderVideoItem}
                                style={styles.videoList}
                                showsVerticalScrollIndicator={false}
                            />
                        ) : (
                            <>
                                <TouchableOpacity 
                                    style={styles.backToVideoList}
                                    onPress={() => setSelectedVideo(null)}
                                >
                                    <Text style={styles.backToVideoListText}>← {t('Back')} {t('to videos')}</Text>
                                </TouchableOpacity>
                                
                                {(selectedVideo.url.includes('youtube') || selectedVideo.url.includes('youtu.be')) ? (
                                    <YouTubePlayer 
                                        url={selectedVideo.url} 
                                        style={styles.videoPlayer}
                                    />
                                ) : (
                                    <Video
                                        ref={videoRef}
                                        source={{ uri: selectedVideo.url }}
                                        rate={1.0}
                                        volume={1.0}
                                        isMuted={false}
                                        shouldPlay={videoPlaying}
                                        useNativeControls
                                        resizeMode={ResizeMode.CONTAIN}
                                        style={styles.videoPlayer}
                                        onError={(error) => console.log('Video error:', error)}
                                    />
                                )}
                                
                                <View style={styles.videoControls}>
                                    <TouchableOpacity 
                                        style={styles.playBtn} 
                                        onPress={() => {
                                            if (selectedVideo.url.includes('youtube') || selectedVideo.url.includes('youtu.be')) {
                                                return;
                                            } else {
                                                if (videoPlaying) {
                                                    videoRef.current?.pauseAsync();
                                                } else {
                                                    videoRef.current?.playAsync();
                                                }
                                                setVideoPlaying(!videoPlaying);
                                            }
                                        }}
                                    >
                                        <Text style={styles.playBtnText}>
                                            {(selectedVideo.url.includes('youtube') || selectedVideo.url.includes('youtu.be'))
                                                ? t('YouTube Video')
                                                : (videoPlaying ? '⏸ ' + t('Pause') : '▶ ' + t('Play'))}
                                        </Text>
                                    </TouchableOpacity>
                                </View>
                                
                                <Text style={styles.videoTitle}>
                                    {selectedVideo.titleSi || selectedVideo.title}
                                </Text>
                            </>
                        )}
                        
                        <TouchableOpacity style={styles.modalCloseBtn} onPress={() => {
                            setVideoModal(false);
                            setVideoPlaying(false);
                            setSelectedVideo(null);
                        }}>
                            <Text style={styles.modalCloseText}>{t('Close')}</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </Modal>
        </LinearGradient>
    );
};

// Progress Dashboard Component
const ProgressDashboard = ({ progress }) => {
    const { t } = useTranslation();
    if (!progress) return null;
    
    return (
        <View style={styles.progressContainer}>
            <Text style={styles.progressTitle}>
                {t('Your Progress')}
            </Text>
            
            <View style={styles.statsGrid}>
                <LinearGradient colors={['#FF9A9E', '#FECFEF']} style={styles.statBox} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}>
                    <Text style={styles.statValue}>{progress.totalExercises}</Text>
                    <Text style={styles.statLabel}>{t('Total Exercises')}</Text>
                </LinearGradient>
                <LinearGradient colors={['#fbc2eb', '#a6c1ee']} style={styles.statBox} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}>
                    <Text style={styles.statValue}>{progress.currentStreak}</Text>
                    <Text style={styles.statLabel}>{t('Current Streak')}</Text>
                </LinearGradient>
                <LinearGradient colors={['#84fab0', '#8fd3f4']} style={styles.statBox} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}>
                    <Text style={styles.statValue}>{progress.bestStreak}</Text>
                    <Text style={styles.statLabel}>{t('Best Streak')}</Text>
                </LinearGradient>
            </View>
            
            {progress.progressData && progress.progressData.length > 0 && (
                <View style={styles.chartContainer}>
                    <Text style={styles.chartTitle}>{t('Weekly Accuracy')}</Text>
                    <View style={styles.barChart}>
                        {progress.progressData.slice(-7).map((item, idx) => (
                            <View key={idx} style={styles.barItem}>
                                <View style={[styles.bar, { height: Math.min((item.avgAccuracy || 0) / 2, 80) }]} />
                                <Text style={styles.barLabel}>{item.date ? item.date.slice(5) : ''}</Text>
                            </View>
                        ))}
                    </View>
                </View>
            )}
        </View>
    );
};

// Safety Warning Component
const SafetyWarning = ({ safetyStatus, safetyMessage, safetyMessageSi }) => {
    const { t } = useTranslation();
    const message = safetyMessageSi || safetyMessage;
    
    if (safetyStatus === 'blocked') {
        return (
            <View style={styles.safetyBlocked}>
                <Text style={styles.safetyIcon}>⚠️</Text>
                <Text style={styles.safetyTitle}>{t('Warning')}</Text>
                <Text style={styles.safetyMessage}>{message}</Text>
                <Text style={styles.safetyAdvice}>
                    {t('Please consult your doctor')}
                </Text>
            </View>
        );
    }
    
    if (safetyStatus === 'limited') {
        return (
            <View style={styles.safetyLimited}>
                <Text style={styles.safetyIcon}>⚠️</Text>
                <Text style={styles.safetyTitle}>{t('Limited Exercise')}</Text>
                <Text style={styles.safetyMessage}>{message}</Text>
                <Text style={styles.safetySubtext}>
                    {t('Only gentle exercises are recommended')}
                </Text>
            </View>
        );
    }
    
    return (
        <View style={styles.safetySafe}>
            <Text style={styles.safetyIcon}>✅</Text>
            <Text style={styles.safetyTitle}>{t('Safe')}</Text>
            <Text style={styles.safetyMessage}>
                {t('Your condition is suitable for exercise')}
            </Text>
        </View>
    );
};

// Main Exercise Screen
export default function ExerciseScreen({ navigation }) {
    const { t } = useTranslation();
    const { user } = useAuth();
    const [hasData, setHasData] = useState(false);
    const [recommendations, setRecommendations] = useState([]);
    const [safetyStatus, setSafetyStatus] = useState(null);
    const [safetyMessage, setSafetyMessage] = useState('');
    const [safetyMessageSi, setSafetyMessageSi] = useState('');
    const [loading, setLoading] = useState(false);
    const [progress, setProgress] = useState(null);
    const [showForm, setShowForm] = useState(true);
    
    useEffect(() => {
        loadProgress();
        checkTodayData();
    }, []);
    
    const loadProgress = async () => {
        try {
            const data = await exerciseService.getProgress(30);
            setProgress(data);
        } catch (err) {
            console.error('Failed to load progress:', err);
        }
    };
    
    const checkTodayData = async () => {
        try {
            const data = await exerciseService.getHealthData(todayStr());
            if (data.exists) {
                setHasData(true);
                await loadRecommendations();
            }
        } catch (err) {
            console.error('Failed to check data:', err);
        }
    };
    
    const loadRecommendations = async () => {
        try {
            const data = await exerciseService.getRecommendations(todayStr());
            if (data.hasData) {
                setRecommendations(data.recommendations || []);
                setSafetyStatus(data.safetyStatus);
                setSafetyMessage(data.safetyMessage || '');
                setSafetyMessageSi(data.safetyMessageSi || '');
                setShowForm(false);
            }
        } catch (err) {
            console.error('Failed to load recommendations:', err);
        }
    };
    
    const handleSubmitHealthData = async (healthData) => {
        setLoading(true);
        try {
            const response = await exerciseService.submitHealthData(healthData);
            if (response.success) {
                setSafetyStatus(response.safetyStatus);
                setSafetyMessage(response.safetyMessage);
                setSafetyMessageSi(response.safetyMessageSi);
                setRecommendations(response.recommendedExercises || []);
                setHasData(true);
                setShowForm(false);
                
                Toast.show({
                    type: response.safetyStatus === 'blocked' ? 'error' : 'success',
                    text1: `✅ ${t('Information Saved')}`,
                    position: 'top'
                });
            }
        } catch (err) {
            Toast.show({
                type: 'error',
                text1: `❌ ${t('Error')}`,
                text2: err.response?.data?.message || t('Failed to save data'),
                position: 'top'
            });
        } finally {
            setLoading(false);
        }
    };
    
    const handleCompleteExercise = async (exercise) => {
        try {
            await exerciseService.saveExerciseRecord({
                date: todayStr(),
                exerciseId: exercise.exerciseId,
                status: 'completed',
                durationCompleted: exercise.duration || 15,
                liked: true
            });
            
            setRecommendations(prev =>
                prev.map(rec =>
                    rec.exerciseId === exercise.exerciseId
                        ? { ...rec, completed: true }
                        : rec
                )
            );
            
            Toast.show({
                type: 'success',
                text1: `🎉 ${t('Exercise Completed!')}`,
                position: 'top'
            });
            
            loadProgress();
        } catch (err) {
            Toast.show({
                type: 'error',
                text1: t('Failed to save'),
                position: 'top'
            });
        }
    };
    
    const handleUploadVideo = async (exerciseId, videoUri) => {
        try {
            const response = await exerciseService.uploadVideo({
                date: todayStr(),
                exerciseId,
                videoUri
            });
            return response;
        } catch (err) {
            throw err;
        }
    };
    
    return (
        <SafeAreaView style={styles.safe}>
            <LinearGradient colors={['#F4F0FB', '#FDFCFE']} style={styles.gradient}>
                <View style={styles.header}>
                    <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
                        <Text style={styles.backIcon}>←</Text>
                    </TouchableOpacity>
                    <View style={styles.headerCenter}>
                        <Text style={styles.headerEmoji}>🏃‍♀️</Text>
                        <Text style={styles.headerTitle}>
                            {t('Postpartum Exercise')}
                        </Text>
                    </View>
                    <View style={styles.backBtn} />
                </View>
                
                <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
                    <ProgressDashboard progress={progress} />
                    
                    {safetyStatus && (
                        <SafetyWarning
                            safetyStatus={safetyStatus}
                            safetyMessage={safetyMessage}
                            safetyMessageSi={safetyMessageSi}
                        />
                    )}
                    
                    {(showForm || !hasData) && (
                        <HealthDataForm
                            onSubmit={handleSubmitHealthData}
                            loading={loading}
                            user={user}
                        />
                    )}
                    
                    {!showForm && hasData && recommendations.length > 0 && safetyStatus !== 'blocked' && (
                        <View style={styles.recommendationsContainer}>
                            <Text style={styles.recommendationsTitle}>
                                {t("Today's Exercise Plan")}
                            </Text>
                            {recommendations.map((rec, idx) => (
                                <ExerciseCard
                                    key={idx}
                                    exercise={rec}
                                    onComplete={handleCompleteExercise}
                                    onUploadVideo={handleUploadVideo}
                                    isCompleted={rec.completed}
                                />
                            ))}
                        </View>
                    )}
                    
                    {!showForm && hasData && recommendations.length === 0 && safetyStatus !== 'blocked' && (
                        <View style={styles.emptyContainer}>
                            <Text style={styles.emptyEmoji}>🌸</Text>
                            <Text style={styles.emptyTitle}>
                                {t('A Rest Day')}
                            </Text>
                            <Text style={styles.emptyText}>
                                {t('Based on your current condition, no exercise is recommended today. Rest and hydration are important.')}
                            </Text>
                        </View>
                    )}
                    
                    {safetyStatus === 'blocked' && (
                        <View style={styles.emptyContainer}>
                            <Text style={styles.emptyEmoji}>🩺</Text>
                            <Text style={styles.emptyTitle}>
                                {t('Medical Advice Needed')}
                            </Text>
                            <Text style={styles.emptyText}>
                                {t('Please consult your doctor before starting any exercise.')}
                            </Text>
                        </View>
                    )}
                    
                    {!showForm && hasData && (
                        <TouchableOpacity
                            style={styles.addDataBtn}
                            onPress={() => setShowForm(true)}
                        >
                            <Text style={styles.addDataBtnText}>
                                {t('+ Enter New Health Data')}
                            </Text>
                        </TouchableOpacity>
                    )}
                    
                    <View style={{ height: 40 }} />
                </ScrollView>
            </LinearGradient>
            <Toast />
        </SafeAreaView>
    );
}

// Keep all existing styles as they are (they remain unchanged)
const styles = StyleSheet.create({
    safe: { flex: 1 },
    gradient: { flex: 1 },
    header: {
        flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
        paddingHorizontal: 20, paddingTop: 16, paddingBottom: 10,
        backgroundColor: 'transparent',
    },
    backBtn: { padding: 8, width: 44, alignItems: 'center', justifyContent: 'center' },
    backIcon: { fontSize: 32, color: '#a18cd1', fontWeight: '900' },
    headerCenter: { flexDirection: 'row', alignItems: 'center', gap: 8 },
    headerEmoji: { fontSize: 26 },
    headerTitle: { fontSize: 20, fontWeight: '800', color: '#334155' },
    scrollContent: { paddingHorizontal: 20, paddingBottom: 40 },

    // Progress
    progressContainer: {
        backgroundColor: 'rgba(255,255,255,0.85)',
        borderRadius: 28,
        padding: 20,
        marginBottom: 16,
        elevation: 4,
        shadowColor: '#a18cd1',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.12,
        shadowRadius: 12,
    },
    progressTitle: { fontSize: 20, fontWeight: '800', color: '#334155', marginBottom: 14 },
    statsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
    statBox: {
        flex: 1,
        borderRadius: 24,
        paddingVertical: 18,
        paddingHorizontal: 10,
        alignItems: 'center',
        minWidth: (width - 60) / 3,
        elevation: 3,
        shadowColor: '#000',
        shadowOpacity: 0.10,
        shadowRadius: 10,
        shadowOffset: { height: 5, width: 0 },
    },
    statValue: { fontSize: 24, fontWeight: '900', color: '#FFF' },
    statLabel: { fontSize: 11, color: '#FFF', fontWeight: '700', marginTop: 4, textAlign: 'center' },
    chartContainer: { marginTop: 16 },
    chartTitle: { fontSize: 13, fontWeight: '700', color: '#334155', marginBottom: 12 },
    barChart: { flexDirection: 'row', justifyContent: 'space-around', alignItems: 'flex-end', height: 100 },
    barItem: { alignItems: 'center', width: 35 },
    bar: { width: 24, backgroundColor: '#a18cd1', borderRadius: 6, marginBottom: 8, minHeight: 4 },
    barLabel: { fontSize: 9, color: '#6B7280' },

    // Safety
    safetyBlocked: {
        backgroundColor: '#FEE2E2',
        borderRadius: 28,
        padding: 20,
        marginBottom: 16,
        alignItems: 'center',
        borderWidth: 1,
        borderColor: '#EF4444',
        elevation: 2,
        shadowColor: '#EF4444',
        shadowOpacity: 0.1,
        shadowRadius: 8,
        shadowOffset: { height: 3, width: 0 },
    },
    safetyLimited: {
        backgroundColor: '#FEF3C7',
        borderRadius: 28,
        padding: 20,
        marginBottom: 16,
        borderWidth: 1,
        borderColor: '#F59E0B',
        elevation: 2,
        shadowColor: '#F59E0B',
        shadowOpacity: 0.1,
        shadowRadius: 8,
        shadowOffset: { height: 3, width: 0 },
    },
    safetySafe: {
        backgroundColor: '#D1FAE5',
        borderRadius: 28,
        padding: 20,
        marginBottom: 16,
        alignItems: 'center',
        borderWidth: 1,
        borderColor: '#10B981',
        elevation: 2,
        shadowColor: '#10B981',
        shadowOpacity: 0.1,
        shadowRadius: 8,
        shadowOffset: { height: 3, width: 0 },
    },
    safetyIcon: { fontSize: 36, marginBottom: 8 },
    safetyTitle: { fontSize: 18, fontWeight: '800', color: '#1F2937', marginBottom: 8 },
    safetyMessage: { fontSize: 14, color: '#374151', textAlign: 'center', marginBottom: 8, lineHeight: 20 },
    safetySubtext: { fontSize: 12, color: '#6B7280', textAlign: 'center' },
    safetyAdvice: { fontSize: 13, fontWeight: '700', color: '#EF4444' },

    // Form
    formContainer: {
        backgroundColor: 'rgba(255,255,255,0.92)',
        borderRadius: 32,
        padding: 24,
        marginBottom: 16,
        elevation: 4,
        shadowColor: '#a18cd1',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.10,
        shadowRadius: 16,
    },
    formTitle: { fontSize: 20, fontWeight: '800', color: '#334155', marginBottom: 18 },
    inputGroup: { marginBottom: 18 },
    label: { fontSize: 14, fontWeight: '700', color: '#334155', marginBottom: 8 },
    input: {
        borderWidth: 1.5,
        borderColor: '#E5E7EB',
        borderRadius: 16,
        padding: 14,
        fontSize: 14,
        backgroundColor: '#F1F5F9',
        color: '#1F2937',
    },
    rowButtons: { flexDirection: 'row', gap: 10 },
    columnButtons: { gap: 8 },
    optionBtn: {
        flex: 1,
        paddingVertical: 12,
        borderRadius: 14,
        backgroundColor: '#F1F5F9',
        alignItems: 'center',
        borderWidth: 1.5,
        borderColor: '#E5E7EB',
    },
    optionBtnWide: {
        paddingVertical: 12,
        borderRadius: 14,
        backgroundColor: '#F1F5F9',
        alignItems: 'center',
        borderWidth: 1.5,
        borderColor: '#E5E7EB',
    },
    optionBtnActive: { backgroundColor: '#a18cd1', borderColor: '#a18cd1' },
    optionText: { fontSize: 14, color: '#334155', fontWeight: '600' },
    optionTextActive: { color: '#fff', fontWeight: '700' },
    checkboxGroup: { marginBottom: 12 },
    checkboxRow: { flexDirection: 'row', alignItems: 'center', marginVertical: 6 },
    checkbox: {
        width: 24,
        height: 24,
        borderRadius: 8,
        borderWidth: 2,
        borderColor: '#D1D5DB',
        marginRight: 12,
        backgroundColor: '#fff',
    },
    checkboxChecked: { backgroundColor: '#a18cd1', borderColor: '#a18cd1' },
    checkboxLabel: { fontSize: 14, color: '#334155', fontWeight: '500' },
    submitBtn: {
        backgroundColor: '#a18cd1',
        padding: 16,
        borderRadius: 20,
        alignItems: 'center',
        marginTop: 10,
        elevation: 4,
        shadowColor: '#a18cd1',
        shadowOpacity: 0.35,
        shadowRadius: 10,
        shadowOffset: { height: 4, width: 0 },
    },
    submitBtnDisabled: { opacity: 0.7 },
    submitBtnText: { color: '#fff', fontWeight: '800', fontSize: 16 },

    // Exercise Cards
    recommendationsContainer: { marginBottom: 16 },
    recommendationsTitle: { fontSize: 20, fontWeight: '800', color: '#334155', marginBottom: 14 },
    exerciseCard: {
        borderRadius: 28,
        padding: 20,
        marginBottom: 14,
        elevation: 3,
        shadowColor: '#a18cd1',
        shadowOffset: { width: 0, height: 3 },
        shadowOpacity: 0.08,
        shadowRadius: 10,
    },
    exerciseCardCompleted: { opacity: 0.82 },
    exerciseHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 12 },
    exerciseIcon: { fontSize: 34, marginRight: 14 },
    exerciseInfo: { flex: 1 },
    exerciseName: { fontSize: 17, fontWeight: '800', color: '#1E293B' },
    exerciseMeta: { fontSize: 12, color: '#64748B', marginTop: 3 },
    completeBtn: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: '#a18cd1',
        alignItems: 'center',
        justifyContent: 'center',
        elevation: 2,
        shadowColor: '#a18cd1',
        shadowOpacity: 0.3,
        shadowRadius: 6,
        shadowOffset: { height: 3, width: 0 },
    },
    completeBtnText: { color: '#fff', fontSize: 20, fontWeight: 'bold' },
    completedBadge: {
        backgroundColor: '#10B981',
        paddingHorizontal: 12,
        paddingVertical: 5,
        borderRadius: 14,
    },
    completedBadgeText: { fontSize: 12, color: '#fff', fontWeight: '700' },
    exerciseDesc: { fontSize: 13, color: '#64748B', marginBottom: 12, lineHeight: 20 },
    stepsContainer: { marginBottom: 12 },
    stepsTitle: { fontSize: 13, fontWeight: '700', color: '#334155', marginBottom: 6 },
    stepText: { fontSize: 12, color: '#64748B', marginLeft: 8, marginBottom: 3, lineHeight: 18 },

    // Video
    watchVideoBtn: {
        backgroundColor: '#a18cd1',
        padding: 14,
        borderRadius: 16,
        alignItems: 'center',
        marginTop: 10,
        elevation: 3,
        shadowColor: '#a18cd1',
        shadowOpacity: 0.3,
        shadowRadius: 8,
        shadowOffset: { height: 3, width: 0 },
    },
    watchVideoBtnText: { fontSize: 14, color: '#fff', fontWeight: '700' },
    videoBtn: {
        backgroundColor: '#F1F5F9',
        padding: 14,
        borderRadius: 16,
        alignItems: 'center',
        marginTop: 8,
    },
    videoBtnText: { fontSize: 14, color: '#a18cd1', fontWeight: '700' },

    // Video Modal
    videoModalContent: { backgroundColor: '#fff', borderRadius: 32, padding: 24, width: width - 40, alignItems: 'center', maxHeight: '90%' },
    videoPlayer: { width: width - 80, height: 220, borderRadius: 16, marginBottom: 16, backgroundColor: '#000' },
    videoPlayerCentered: { justifyContent: 'center', alignItems: 'center' },
    videoControls: { flexDirection: 'row', justifyContent: 'center', marginBottom: 16 },
    playBtn: { backgroundColor: '#a18cd1', paddingHorizontal: 28, paddingVertical: 12, borderRadius: 24 },
    playBtnText: { color: '#fff', fontWeight: '700', fontSize: 14 },
    videoList: { width: '100%', maxHeight: 400 },
    videoOption: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#F1F5F9',
        borderRadius: 16,
        padding: 14,
        marginBottom: 10,
    },
    videoOptionIcon: { fontSize: 24, marginRight: 12 },
    videoOptionInfo: { flex: 1 },
    videoOptionTitle: { fontSize: 14, fontWeight: '700', color: '#1E293B' },
    videoOptionDuration: { fontSize: 11, color: '#64748B', marginTop: 2 },
    videoOptionArrow: { fontSize: 18, color: '#9CA3AF' },
    backToVideoList: { alignSelf: 'flex-start', marginBottom: 12 },
    backToVideoListText: { fontSize: 14, color: '#a18cd1', fontWeight: '700' },
    videoTitle: { fontSize: 14, color: '#334155', textAlign: 'center', marginBottom: 12, fontWeight: '600' },

    // WebView
    webView: { flex: 1 },
    webViewLoadingContainer: {
        position: 'absolute', top: 0, left: 0, right: 0, bottom: 0,
        justifyContent: 'center', alignItems: 'center',
        backgroundColor: '#000', zIndex: 10,
    },
    webViewErrorContainer: {
        position: 'absolute', top: 0, left: 0, right: 0, bottom: 0,
        justifyContent: 'center', alignItems: 'center',
        backgroundColor: '#000', zIndex: 10,
    },
    webViewErrorText: { color: '#fff', fontSize: 14, marginBottom: 15 },
    webViewRetryBtn: { backgroundColor: '#a18cd1', paddingHorizontal: 20, paddingVertical: 10, borderRadius: 12 },
    webViewRetryBtnText: { color: '#fff', fontWeight: '700' },

    // Empty State
    emptyContainer: {
        backgroundColor: 'rgba(255,255,255,0.85)',
        borderRadius: 32,
        padding: 36,
        alignItems: 'center',
        marginBottom: 16,
        elevation: 3,
        shadowColor: '#a18cd1',
        shadowOpacity: 0.08,
        shadowRadius: 12,
        shadowOffset: { height: 4, width: 0 },
    },
    emptyEmoji: { fontSize: 52, marginBottom: 16 },
    emptyTitle: { fontSize: 22, fontWeight: '900', color: '#1E293B', marginBottom: 8 },
    emptyText: { fontSize: 14, color: '#64748B', textAlign: 'center', lineHeight: 22 },

    // Add Data Button
    addDataBtn: {
        backgroundColor: 'rgba(161,140,209,0.08)',
        padding: 16,
        borderRadius: 20,
        alignItems: 'center',
        borderWidth: 1.5,
        borderColor: '#a18cd1',
        borderStyle: 'dashed',
        marginBottom: 16,
    },
    addDataBtnText: { fontSize: 14, color: '#a18cd1', fontWeight: '700' },

    // Modal
    modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', alignItems: 'center' },
    modalContent: { backgroundColor: '#fff', borderRadius: 32, padding: 24, width: width - 40, maxHeight: '80%' },
    modalTitle: { fontSize: 18, fontWeight: '800', color: '#1E293B', marginBottom: 8, textAlign: 'center' },
    modalSubtitle: { fontSize: 13, color: '#64748B', marginBottom: 16, textAlign: 'center' },
    videoPreview: { width: '100%', height: 200, borderRadius: 16, marginBottom: 16 },
    pickVideoBtn: { backgroundColor: '#a18cd1', padding: 14, borderRadius: 16, alignItems: 'center', marginBottom: 12 },
    pickVideoBtnText: { color: '#fff', fontWeight: '700' },
    modalCloseBtn: { alignItems: 'center', padding: 12 },
    modalCloseText: { color: '#64748B', fontSize: 14, fontWeight: '600' },
});