const Exercise = require('../models/Exercise');
const User = require('../models/User');
const ExerciseRecord = require('../models/ExerciseRecord');
const PostpartumHealthData = require('../models/PostpartumHealthData');
const Diary = require('../models/Diary');
const MLPredictionService = require('../services/mlPredictionService');

// Clinical Safety Rules
const applySafetyRules = (healthData) => {
    const weeks = healthData.weeksAfterDelivery;
    const deliveryType = healthData.deliveryType;
    const warnings = [];
    let safetyStatus = 'safe';
    let safetyMessage = '';
    let safetyMessageSi = '';
    
    // Rule 1: C-section requires 6 weeks minimum
    if (deliveryType === 'c-section' && weeks < 6) {
        safetyStatus = 'blocked';
        safetyMessage = 'C-section requires at least 6 weeks of recovery before exercise. Please consult your doctor.';
        safetyMessageSi = 'සිසේරියන් සැත්කමකින් පසු ව්‍යායාම සඳහා අවම වශයෙන් සති 6ක් ගතවිය යුතුය. කරුණාකර ඔබේ වෛද්‍යවරයා හමුවන්න.';
        warnings.push(safetyMessage);
        return { safetyStatus, safetyMessage, safetyMessageSi, warnings };
    }
    
    // Rule 2: Severe pain or bleeding
    if (healthData.bleedingComplications) {
        safetyStatus = 'blocked';
        safetyMessage = 'Exercise is not recommended due to bleeding complications. Please rest and consult your doctor.';
        safetyMessageSi = 'රුධිර වහනය හේතුවෙන් ව්‍යායාම නිර්දේශ නොකෙරේ. කරුණාකර විවේක ගෙන ඔබේ වෛද්‍යවරයා හමුවන්න.';
        warnings.push(safetyMessage);
        return { safetyStatus, safetyMessage, safetyMessageSi, warnings };
    }
    
    if (healthData.pelvicPain || healthData.abdominalPain) {
        safetyStatus = 'limited';
        safetyMessage = 'Mild pain detected. Low-intensity exercises only.';
        safetyMessageSi = 'සුළු වේදනාවක් පවතී. අඩු තීව්‍රතාවයකින් යුත් ව්‍යායාම පමණක් කරන්න.';
        warnings.push(safetyMessage);
    }
    
    // Rule 3: Doctor restrictions
    if (healthData.doctorRestrictions) {
        safetyStatus = 'blocked';
        safetyMessage = 'Doctor has restricted exercise. Please follow medical advice.';
        safetyMessageSi = 'වෛද්‍යවරයා ව්‍යායාම සීමා කර ඇත. කරුණාකර වෛද්‍ය උපදෙස් අනුගමනය කරන්න.';
        warnings.push(safetyMessage);
        return { safetyStatus, safetyMessage, safetyMessageSi, warnings };
    }
    
    // Rule 4: Mobility limitations
    if (healthData.mobilityLevel === 'very_limited') {
        safetyStatus = 'limited';
        safetyMessage = 'Limited mobility. Breathing exercises only.';
        safetyMessageSi = 'චලනය වීමේ හැකියාව සීමිතයි. හුස්ම ගැනීමේ ව්‍යායාම පමණක් කරන්න.';
        warnings.push(safetyMessage);
    } else if (healthData.mobilityLevel === 'limited') {
        safetyStatus = 'limited';
        safetyMessage = 'Limited mobility. Light stretching and breathing exercises only.';
        safetyMessageSi = 'චලනය වීමේ හැකියාව සීමිතයි. සැහැල්ලු ඇදීමේ සහ හුස්ම ගැනීමේ ව්‍යායාම පමණක් කරන්න.';
        warnings.push(safetyMessage);
    }
    
    // Rule 5: PPD Risk Level
    if (healthData.ppdRiskLevel === 'high') {
        safetyStatus = 'blocked';
        safetyMessage = 'High PPD risk detected. Please consult a healthcare professional before starting any exercise.';
        safetyMessageSi = 'ඉහළ PPD අවදානමක් අනාවරණය විය. කරුණාකර ඕනෑම ව්‍යායාමයක් ආරම්භ කිරීමට පෙර වෛද්‍ය වෘත්තිකයෙකු හමුවන්න.';
        warnings.push(safetyMessage);
        return { safetyStatus, safetyMessage, safetyMessageSi, warnings };
    }
    
    if (healthData.ppdRiskLevel === 'medium') {
        safetyStatus = 'limited';
        safetyMessage = 'Medium PPD risk. Low-intensity, calming exercises recommended.';
        safetyMessageSi = 'මධ්‍යම මට්ටමේ PPD අවදානමක් ඇත. අඩු තීව්‍රතාවයකින් යුත් සන්සුන් ව්‍යායාම නිර්දේශ කරනු ලැබේ.';
        warnings.push(safetyMessage);
    }
    
    // Rule 6: Fatigue level
    if (healthData.fatigueLevel === 'high') {
        safetyStatus = 'limited';
        safetyMessage = 'High fatigue detected. Short, gentle exercises only.';
        safetyMessageSi = 'වැඩි තෙහෙට්ටුවක් පවතී. කෙටි සහ මෘදු ව්‍යායාම පමණක් කරන්න.';
        warnings.push(safetyMessage);
    }
    
    // Rule 7: Willingness to exercise
    if (healthData.willingnessToExercise === 'low') {
        const msg = 'Low motivation detected. Try very short, simple exercises to start.';
        const msgSi = 'අඩු පෙළඹවීමක් පවතී. ඉතා කෙටි සහ සරල ව්‍යායාම වලින් ආරම්භ කිරීමට උත්සාහ කරන්න.';
        warnings.push(msg);
        if (!safetyMessage) {
            safetyMessage = msg;
            safetyMessageSi = msgSi;
        }
    }
    
    return { safetyStatus, safetyMessage, safetyMessageSi, warnings };
};

// ── Diary Integration Functions ──

/**
 * Bilingual Mood Detection Function
 * Detects mood from text content (English/Sinhala) and emojis
 */
const analyzeDiaryMood = (text, emoji) => {
    let mood = 'neutral';
    const content = (text || '').toLowerCase();

    // Emoji detection
    const happyEmojis = ['😊', '😄', '🥰', '🌟', '🌈', '🤩'];
    const sadEmojis = ['😔', '😢', '😭', '💔', '🥀', '😟'];
    const tiredEmojis = ['😪', '😴', '🥱', '🔋', '😫', '💤'];
    const stressedEmojis = ['😰', '😰', '🤯', '⚡', '🌋', '🆘'];
    const angryEmojis = ['😠', '😡', '🤬', '🔥', '💢', '😤'];

    if (happyEmojis.includes(emoji)) mood = 'happy';
    else if (sadEmojis.includes(emoji)) mood = 'sad';
    else if (tiredEmojis.includes(emoji)) mood = 'tired';
    else if (stressedEmojis.includes(emoji)) mood = 'stressed';
    else if (angryEmojis.includes(emoji)) mood = 'angry';

    // English Keywords detection
    if (content.includes('happy') || content.includes('great') || content.includes('good') || content.includes('joy')) mood = 'happy';
    if (content.includes('sad') || content.includes('cry') || content.includes('unhappy') || content.includes('depressed')) mood = 'sad';
    if (content.includes('tired') || content.includes('exhausted') || content.includes('sleepy') || content.includes('fatigue')) mood = 'tired';
    if (content.includes('stressed') || content.includes('anxious') || content.includes('pressure') || content.includes('tension')) mood = 'stressed';
    if (content.includes('angry') || content.includes('mad') || content.includes('furious') || content.includes('hate')) mood = 'angry';

    // Sinhala Keywords detection
    if (content.includes('සතුට') || content.includes('හොඳයි') || content.includes('ප්‍රීති')) mood = 'happy';
    if (content.includes('දුක') || content.includes('අඬන') || content.includes('කණගාටු')) mood = 'sad';
    if (content.includes('තෙහෙට්ටුව') || content.includes('මහන්සි') || content.includes('නිදිමත')) mood = 'tired';
    if (content.includes('ආතතිය') || content.includes('බිය') || content.includes('කලබල')) mood = 'stressed';
    if (content.includes('තරහ') || content.includes('කේන්ති') || content.includes('වෛර')) mood = 'angry';

    return mood;
};

/**
 * Diary Rule Engine
 * Modifies recommendations based on detected mood
 */
const applyDiaryRules = (recommendations, mood) => {
    if (mood === 'happy' || mood === 'neutral') return recommendations;

    console.log(`[Diary Module] Applying rules for mood: ${mood}`);
    let modifiedRecs = [...recommendations];

    if (mood === 'sad' || mood === 'stressed') {
        // Replace high-energy exercises with calming ones
        modifiedRecs = modifiedRecs.map(rec => {
            if (rec.type === 'walking' || rec.type === 'cardio' || rec.type === 'strength') {
                return {
                    ...rec,
                    type: 'breathing',
                    customName: 'Calming Breathing for Mood Relief',
                    customNameSi: 'මනෝභාවය සැහැල්ලු කිරීම සඳහා සන්සුන් හුස්ම ගැනීම',
                    duration: 10
                };
            }
            return rec;
        });
    } else if (mood === 'tired') {
        // Reduce durations and remove high-effort movement
        modifiedRecs = modifiedRecs
            .filter(rec => rec.type !== 'walking')
            .map(rec => ({
                ...rec,
                duration: Math.max(5, Math.floor((rec.duration || 10) * 0.5))
            }));
    } else if (mood === 'angry') {
        // Switch to meditative/breathing focus
        modifiedRecs = modifiedRecs.map(rec => {
            if (rec.type !== 'breathing' && rec.type !== 'stretching') {
                return {
                    ...rec,
                    type: 'breathing',
                    customName: 'Mindful Breathing',
                    customNameSi: 'මනස සන්සුන් කරන හුස්ම ගැනීම',
                    duration: 5
                };
            }
            return rec;
        });
    }

    return modifiedRecs;
};

const ensureExercisesSeeded = async () => {
    const count = await Exercise.countDocuments();
    if (count > 0) return;
    
    console.log('Seeding default exercises...');
    const exercises = [
        {
            name: 'Deep Breathing',
            nameSi: 'ගැඹුරු හුස්ම ගැනීම',
            type: 'breathing',
            intensity: 'low',
            duration: 5,
            description: 'Gentle breathing exercises to reduce stress and improve oxygen flow.',
            descriptionSi: 'ආතතිය අඩු කිරීමට සහ ඔක්සිජන් ප්‍රවාහය වැඩි දියුණු කිරීමට මෘදු හුස්ම ගැනීමේ ව්‍යායාම.',
            videoUrl: 'https://example.com/breathing.mp4',
            steps: [
                { stepNumber: 1, instruction: 'Sit comfortably with your back straight', instructionSi: 'ඔබේ පිටුපස කෙළින් තබාගෙන සුවපහසු ලෙස වාඩි වන්න', duration: 60 },
                { stepNumber: 2, instruction: 'Inhale deeply through your nose for 4 seconds', instructionSi: 'තත්පර 4ක් නාසයෙන් ගැඹුරින් හුස්ම ගන්න', duration: 4 },
                { stepNumber: 3, instruction: 'Hold for 4 seconds', instructionSi: 'තත්පර 4ක් රඳවා තබා ගන්න', duration: 4 },
                { stepNumber: 4, instruction: 'Exhale slowly through your mouth for 6 seconds', instructionSi: 'තත්පර 6ක් මුඛයෙන් සෙමින් හුස්ම පිට කරන්න', duration: 6 }
            ]
        },
        {
            name: 'Pelvic Floor Exercise (Kegel)',
            nameSi: 'ශ්‍රෝණි තට්ටු ව්‍යායාම (කේගල්)',
            type: 'pelvic_floor',
            intensity: 'low',
            duration: 10,
            description: 'Strengthen pelvic floor muscles to prevent incontinence and improve recovery.',
            descriptionSi: 'මුත්‍රාශය පාලනය වැළැක්වීමට සහ ප්‍රකෘතිය වැඩිදියුණු කිරීමට ශ්‍රෝණි තට්ටු මාංශ පේශි ශක්තිමත් කරන්න.',
            videoUrl: 'https://example.com/kegel.mp4',
            steps: [
                { stepNumber: 1, instruction: 'Lie down with knees bent and feet flat', instructionSi: 'දණහිස් නමා පාද පැතලි කර වැතිරෙන්න', duration: 60 },
                { stepNumber: 2, instruction: 'Tighten pelvic floor muscles as if stopping urine flow', instructionSi: 'මුත්‍රා ප්‍රවාහය නතර කරනවාක් මෙන් ශ්‍රෝණි තට්ටු මාංශ පේශි තද කරන්න', duration: 5 },
                { stepNumber: 3, instruction: 'Hold for 5-10 seconds', instructionSi: 'තත්පර 5-10ක් තද කර තබා ගන්න', duration: 5 },
                { stepNumber: 4, instruction: 'Relax for 10 seconds', instructionSi: 'තත්පර 10ක් ලිහිල් කරන්න', duration: 10 }
            ]
        },
        {
            name: 'Gentle Neck Stretch',
            nameSi: 'මෘදු බෙල්ල දිගු කිරීම',
            type: 'stretching',
            intensity: 'low',
            duration: 5,
            description: 'Relieve neck and shoulder tension from breastfeeding and baby care.',
            descriptionSi: 'මව්කිරි දීමෙන් සහ ළදරු රැකවරණයෙන් ඇතිවන බෙල්ල සහ උරහිස් ආතතිය සමනය කරන්න.',
            videoUrl: 'https://example.com/neck-stretch.mp4',
            steps: [
                { stepNumber: 1, instruction: 'Sit or stand with good posture', instructionSi: 'හොඳ ඉරියව්වකින් වාඩි වන්න හෝ සිටගන්න', duration: 30 },
                { stepNumber: 2, instruction: 'Slowly tilt head to the right shoulder', instructionSi: 'සෙමෙන් හිස දකුණු උරහිසට නමන්න', duration: 10 },
                { stepNumber: 3, instruction: 'Hold for 15-20 seconds', instructionSi: 'තත්පර 15-20ක් රඳවා තබා ගන්න', duration: 20 },
                { stepNumber: 4, instruction: 'Repeat on left side', instructionSi: 'වම් පැත්තෙන් නැවත කරන්න', duration: 20 }
            ]
        },
        {
            name: 'Gentle Walking',
            nameSi: 'මෘදු ඇවිදීම',
            type: 'walking',
            intensity: 'low',
            duration: 15,
            description: 'Low-impact walking to improve circulation and mood.',
            descriptionSi: 'රුධිර සංසරණය සහ මනෝභාවය වැඩිදියුණු කිරීම සඳහා අඩු බලපෑමක් ඇති ඇවිදීම.',
            videoUrl: 'https://example.com/walking.mp4',
            steps: [
                { stepNumber: 1, instruction: 'Start with gentle warm-up marching in place', instructionSi: 'ස්ථානයේම මෘදු උණුසුම් කිරීමේ පාගමනකින් ආරම්භ කරන්න', duration: 60 },
                { stepNumber: 2, instruction: 'Walk at a comfortable pace', instructionSi: 'සුවපහසු වේගයකින් ඇවිදින්න', duration: 60 },
                { stepNumber: 3, instruction: 'Maintain good posture with shoulders back', instructionSi: 'උරහිස් පසුපසට තබාගෙන හොඳ ඉරියව්වක් පවත්වා ගන්න', duration: 60 }
            ]
        },
        {
            name: 'Shoulder Rolls',
            nameSi: 'උරහිස් කරකැවීම',
            type: 'stretching',
            intensity: 'low',
            duration: 3,
            description: 'Release tension in shoulders and upper back.',
            descriptionSi: 'උරහිස් සහ ඉහළ පිටුපස ආතතිය මුදාහරින්න.',
            videoUrl: 'https://example.com/shoulder-roll.mp4',
            steps: [
                { stepNumber: 1, instruction: 'Sit comfortably with arms relaxed', instructionSi: 'අත් ලිහිල් කර සුවපහසු ලෙස වාඩි වන්න', duration: 10 },
                { stepNumber: 2, instruction: 'Roll shoulders forward in a circular motion', instructionSi: 'උරහිස් ඉදිරියට වටයක් කරකවන්න', duration: 15 },
                { stepNumber: 3, instruction: 'Roll shoulders backward', instructionSi: 'උරහිස් පසුපසට කරකවන්න', duration: 15 }
            ]
        }
    ];
    
    for (const ex of exercises) {
        await Exercise.findOneAndUpdate(
            { name: ex.name },
            ex,
            { upsert: true }
        );
    }
    console.log('Exercises seeded successfully');
};

// Generate Exercise Recommendations based on health data
const generateRecommendations = async (healthData) => {
    await ensureExercisesSeeded();

    const recommendations = [];
    const weeks = healthData.weeksAfterDelivery;
    const ppdRisk = healthData.ppdRiskLevel;
    const mobility = healthData.mobilityLevel;
    const fatigue = healthData.fatigueLevel;
    const pain = healthData.pelvicPain || healthData.backPain || healthData.abdominalPain;
    const mood = healthData.mood;
    const stressKeywords = healthData.stressKeywords || [];
    
    console.log('=== DEBUG: generateRecommendations called ===');
    console.log('healthData.safetyStatus:', healthData.safetyStatus);
    console.log('weeks:', weeks, 'deliveryType:', healthData.deliveryType);
    console.log('pain:', pain, 'mobility:', mobility, 'fatigue:', fatigue);
    
    // Breathing exercises (always safe for low/medium risk)
    if (healthData.safetyStatus !== 'blocked') {
        console.log('Looking for breathing exercise...');
        const breathingEx = await Exercise.findOne({ type: 'breathing' });
        console.log('Breathing exercise found:', breathingEx ? breathingEx.name : 'NOT FOUND');
        if (breathingEx) {
            recommendations.push({
                exerciseId: breathingEx._id,
                type: 'breathing',
                duration: breathingEx.duration
            });
        }
    }
    
    // Pelvic floor exercises (safe after week 2 for normal delivery, week 6 for C-section)
    const pelvicFloorAllowed = (healthData.deliveryType === 'normal' && weeks >= 2) ||
                               (healthData.deliveryType === 'c-section' && weeks >= 6);
    
    if (healthData.safetyStatus !== 'blocked' && !pain && pelvicFloorAllowed && ppdRisk !== 'high') {
        console.log('Looking for pelvic_floor exercise...');
        const pelvicEx = await Exercise.findOne({ type: 'pelvic_floor' });
        console.log('Pelvic floor exercise found:', pelvicEx ? pelvicEx.name : 'NOT FOUND');
        if (pelvicEx) {
            recommendations.push({
                exerciseId: pelvicEx._id,
                type: 'pelvic_floor',
                duration: pelvicEx.duration
            });
        }
    }
    
    // Stretching (allowed for limited mobility, low pain)
    if (healthData.safetyStatus !== 'blocked' && mobility !== 'very_limited' && !healthData.abdominalPain && ppdRisk !== 'high') {
        console.log('Looking for stretching exercise...');
        const stretchingEx = await Exercise.findOne({ type: 'stretching' });
        console.log('Stretching exercise found:', stretchingEx ? stretchingEx.name : 'NOT FOUND');
        if (stretchingEx) {
            recommendations.push({
                exerciseId: stretchingEx._id,
                type: 'stretching',
                duration: stretchingEx.duration
            });
        }
    }
    
    // Light movement / walking (for normal mobility, low fatigue)
    if (healthData.safetyStatus === 'safe' && mobility === 'normal' && fatigue !== 'high' && weeks >= 2) {
        console.log('Looking for walking exercise...');
        const walkingEx = await Exercise.findOne({ type: 'walking' });
        console.log('Walking exercise found:', walkingEx ? walkingEx.name : 'NOT FOUND');
        if (walkingEx) {
            recommendations.push({
                exerciseId: walkingEx._id,
                type: 'walking',
                duration: Math.min(15 + Math.floor(weeks / 2) * 5, 45)
            });
        }
    }
    
    // Stress reduction based on diary keywords
    const stressIndicators = ['stress', 'anxious', 'worried', 'tired', 'overwhelmed'];
    const hasStress = stressKeywords.some(k => stressIndicators.includes(k.toLowerCase()));
    
    if (hasStress && healthData.safetyStatus !== 'blocked') {
        const calmingEx = await Exercise.findOne({ name: /Breathing/i });
        if (calmingEx && !recommendations.some(r => r.type === 'breathing')) {
            recommendations.push({
                exerciseId: calmingEx._id,
                type: 'breathing',
                duration: 5
            });
        }
    }
    
    // Diary positive mood - encourage more activity
    if (mood === '😊' && healthData.safetyStatus === 'safe' && fatigue !== 'high') {
        if (recommendations.length > 0) {
            recommendations[0].duration += 5;
        }
    }
    
    console.log('Total recommendations generated:', recommendations.length);
    console.log('=========================================');
    
    return recommendations;
};

// POST /exercise/health-data - Save daily health data and get recommendations
const submitHealthData = async (req, res, next) => {
    try {
        const userId = req.user.id;
        const { date, weeksAfterDelivery, deliveryDate, deliveryType, pelvicPain, backPain, abdominalPain,
                bleedingComplications, doctorRestrictions, fatigueLevel, mobilityLevel,
                muscleWeakness, willingnessToExercise, mood, sentiment, stressKeywords } = req.body;
        
        // --- Calculate Weeks After Delivery from Delivery Date ---
        let finalWeeks = weeksAfterDelivery;
        let finalDeliveryDate = deliveryDate;

        if (deliveryDate) {
            // If provided in request, update user profile for "ask one time" logic
            await User.findByIdAndUpdate(userId, { deliveryDate });
            finalDeliveryDate = deliveryDate;
        } else {
            // If not provided, fetch from user profile
            const user = await User.findById(userId);
            if (user && user.deliveryDate) {
                finalDeliveryDate = user.deliveryDate;
            }
        }

        if (finalDeliveryDate) {
            const birthDate = new Date(finalDeliveryDate);
            const today = new Date();
            const diffTime = Math.abs(today - birthDate);
            finalWeeks = Math.floor(diffTime / (1000 * 60 * 60 * 24 * 7));
            console.log(`[Exercise] Calculated weeks: ${finalWeeks} from delivery date: ${finalDeliveryDate}`);
        }
        // ---------------------------------------------------------
        
        // Get PPD risk level from screening module (mock for now)
        // In production, fetch from screening module API
        let ppdRiskLevel = req.body.ppdRiskLevel || 'low';
        
        // Create health data object
        const healthData = {
            userId,
            date,
            deliveryDate: finalDeliveryDate,
            weeksAfterDelivery: finalWeeks || weeksAfterDelivery || 0,
            deliveryType,
            pelvicPain: pelvicPain || false,
            backPain: backPain || false,
            abdominalPain: abdominalPain || false,
            bleedingComplications: bleedingComplications || false,
            doctorRestrictions: doctorRestrictions || false,
            fatigueLevel: fatigueLevel || 'low',
            mobilityLevel: mobilityLevel || 'normal',
            muscleWeakness: muscleWeakness || false,
            willingnessToExercise: willingnessToExercise || 'medium',
            ppdRiskLevel,
            mood: mood || '😊',
            sentiment: sentiment || 'Neutral',
            stressKeywords: stressKeywords || []
        };
        
        console.log('=== DEBUG: submitHealthData called ===');
        console.log('User ID:', userId);
        console.log('Date:', date);
        console.log('Weeks:', finalWeeks, 'Delivery:', deliveryType);
        
        // Get ML-based risk prediction
        let mlRiskLevel = ppdRiskLevel;
        let mlConfidence = null;
        let mlRecommendedExercises = [];
        try {
            const mlPrediction = await MLPredictionService.predictRisk({
                weeksAfterDelivery: finalWeeks || weeksAfterDelivery || 0,
                deliveryType: deliveryType,
                pelvicPain: pelvicPain || false,
                backPain: backPain || false,
                abdominalPain: abdominalPain || false,
                bleedingComplications: bleedingComplications || false,
                doctorRestrictions: doctorRestrictions || false,
                fatigueLevel: fatigueLevel || 'low',
                mobilityLevel: mobilityLevel || 'normal',
                muscleWeakness: muscleWeakness || false,
                willingnessToExercise: willingnessToExercise || 'medium',
                ppdRiskLevel: ppdRiskLevel
            });
            
            if (mlPrediction.success) {
                mlRiskLevel = mlPrediction.riskLevel;
                mlConfidence = mlPrediction.confidenceScores;
                mlRecommendedExercises = mlPrediction.recommendedExercises || [];
                console.log(`ML Prediction: ${mlRiskLevel} (Confidence: ${JSON.stringify(mlConfidence)})`);
                // Update healthData with ML predicted risk level
                healthData.ppdRiskLevel = mlRiskLevel;
            }
        } catch (err) {
            console.log('ML prediction failed, using rule-based:', err.message);
        }
        
        // Apply safety rules with updated risk level
        const safety = applySafetyRules({ ...healthData, ppdRiskLevel: mlRiskLevel });
        healthData.safetyStatus = safety.safetyStatus;
        healthData.safetyMessage = safety.safetyMessage;
        healthData.safetyMessageSi = safety.safetyMessageSi;
        
        console.log('Safety Status:', safety.safetyStatus);
        console.log('Risk Level Used:', mlRiskLevel);
        
        // Generate recommendations if not blocked
        let recommendations = [];
        if (safety.safetyStatus !== 'blocked') {
            if (mlRecommendedExercises && mlRecommendedExercises.length > 0) {
                recommendations = mlRecommendedExercises.map(ex => ({
                    type: 'ml_recommended',
                    duration: 10,
                    customName: ex.name,
                    videoUrl: ex.video_url || ex.videoUrl
                }));
            } else {
                recommendations = await generateRecommendations({ ...healthData, safetyStatus: safety.safetyStatus, ppdRiskLevel: mlRiskLevel });
            }

            // Apply Diary-based Mood Logic
            const diaryEntry = await Diary.findOne({ userId, date });
            const detectedMood = analyzeDiaryMood(diaryEntry ? diaryEntry.content : '', mood);
            recommendations = applyDiaryRules(recommendations, detectedMood);

            healthData.recommendedExercises = recommendations;
        }
        
        // Save to database (upsert)
        const savedData = await PostpartumHealthData.findOneAndUpdate(
            { userId, date },
            healthData,
            { upsert: true, new: true }
        );
        
        console.log('Saved to database, recommendations count:', recommendations.length);
        console.log('=========================================');
        
        // Populate exercise details for the response
        const populatedRecommendations = [];
        for (const rec of recommendations) {
            if (rec.exerciseId) {
                const exercise = await Exercise.findById(rec.exerciseId);
                if (exercise) {
                    populatedRecommendations.push({
                        ...rec,
                        exerciseDetails: exercise
                    });
                }
            } else if (rec.type === 'ml_recommended' || rec.customName) {
                const sinhalaTranslations = {
                    'Deep Breathing': 'ගැඹුරු හුස්ම ගැනීම',
                    'Pelvic Floor Exercise (Kegel)': 'ශ්‍රෝණි තට්ටු ව්‍යායාම',
                    'Gentle Neck Stretch': 'මෘදු බෙල්ල දිගු කිරීම',
                    'Gentle Walking': 'මෘදු ඇවිදීම',
                    'Shoulder Rolls': 'උරහිස් කරකැවීම',
                    'Side Leg Raises': 'පැති කකුල් එසවීම',
                    'Toe Taps': 'පාද තට්ටු කිරීම',
                    'Seated March': 'වාඩි වී පාගමන',
                    'Supported Sitting Exercise': 'සහාය දක්වන වාඩි වීමේ ව්‍යායාමය',
                    'Heel Slides': 'විලුඹ ලිස්සා යාම',
                    'Hand Stretch': 'අත් දිගු කිරීම',
                    'Walking': 'ඇවිදීම',
                    'Gentle Breathing': 'මෘදු හුස්ම ගැනීම',
                    'Ankle Pumps': 'වළලුකර පොම්ප කිරීම',
                    'Pelvic Floor Activation': 'ශ්‍රෝණි තට්ටුව සක්‍රිය කිරීම',
                    'Bridge Exercise': 'පාලම් ව්‍යායාමය',
                    'Gentle Ankle Pumps': 'මෘදු වළලුකර පොම්ප කිරීම',
                    'Bed Mobility Exercise': 'ඇඳේ චලනය වීමේ ව්‍යායාමය',
                    'Guided Relaxation': 'මඟ පෙන්වන විවේකය',
                    'Wrist Mobility': 'මැණික්කටුව චලනය',
                    'Bird Dog': 'කුරුළු බල්ලා ව්‍යායාමය',
                    'Kegel Exercise': 'කේගල් ව්‍යායාමය',
                    'Pelvic Tilt': 'ශ්‍රෝණි ඇලය',
                    'Neck Stretch': 'බෙල්ල දිගු කිරීම',
                    'Cat Cow Stretch': 'බළලා-එළදෙන දිගු කිරීම',
                    'Arm Circles': 'අත් කව කිරීම',
                    'Modified Squats': 'වෙනස් කළ ස්කොට්ස්',
                    'Wall Pushups': 'බිත්ති තල්ලු කිරීම්'
                };
                
                const englishName = rec.customName || rec.name;
                const sinhalaName = rec.customNameSi || sinhalaTranslations[englishName] || englishName;

                populatedRecommendations.push({
                    ...rec,
                    exerciseDetails: {
                        name: englishName,
                        nameSi: sinhalaName,
                        videoUrl: rec.videoUrl,
                        duration: rec.duration || 10,
                        description: 'Recommended specifically for your health profile.',
                        descriptionSi: 'ඔබේ සෞඛ්‍ය පැතිකඩ සඳහා විශේෂයෙන් නිර්දේශ කර ඇත.',
                        type: 'ml_recommended'
                    }
                });
            } else {
                populatedRecommendations.push(rec);
            }
        }

        // Return response with ML info
        res.json({
            success: true,
            safetyStatus: safety.safetyStatus,
            safetyMessage: safety.safetyMessage,
            safetyMessageSi: safety.safetyMessageSi,
            warnings: safety.warnings || [],
            recommendedExercises: populatedRecommendations,
            healthDataId: savedData._id,
            mlPrediction: {
                riskLevel: mlRiskLevel,
                confidence: mlConfidence,
                modelUsed: mlConfidence ? 'random_forest' : 'rule_based'
            }
        });
        
    } catch (err) {
        console.error('Error in submitHealthData:', err);
        next(err);
    }
};

// GET /exercise/health-data/:date - Get health data for a specific date
const getHealthData = async (req, res, next) => {
    try {
        const userId = req.user.id;
        const { date } = req.params;
        
        const data = await PostpartumHealthData.findOne({ userId, date });
        if (!data) {
            return res.json({ exists: false });
        }
        
        res.json({
            exists: true,
            safetyStatus: data.safetyStatus,
            safetyMessage: data.safetyMessage,
            recommendedExercises: data.recommendedExercises,
            date: data.date
        });
    } catch (err) {
        next(err);
    }
};

// GET /exercise/recommendations/:date - Get recommendations for a date
const getRecommendations = async (req, res, next) => {
    try {
        const userId = req.user.id;
        const { date } = req.params;
        
        const healthData = await PostpartumHealthData.findOne({ userId, date });
        if (!healthData) {
            return res.json({ recommendations: [], hasData: false });
        }
        
        // Populate exercise details
        const recommendations = [];
        for (const rec of healthData.recommendedExercises) {
            if (rec.exerciseId) {
                const exercise = await Exercise.findById(rec.exerciseId);
                if (exercise) {
                    recommendations.push({
                        ...rec.toObject(),
                        exerciseDetails: exercise
                    });
                }
            } else if (rec.type === 'ml_recommended' || rec.customName) {
                const sinhalaTranslations = {
                    'Deep Breathing': 'ගැඹුරු හුස්ම ගැනීම',
                    'Pelvic Floor Exercise (Kegel)': 'ශ්‍රෝණි තට්ටු ව්‍යායාම',
                    'Gentle Neck Stretch': 'මෘදු බෙල්ල දිගු කිරීම',
                    'Gentle Walking': 'මෘදු ඇවිදීම',
                    'Shoulder Rolls': 'උරහිස් කරකැවීම',
                    'Side Leg Raises': 'පැති කකුල් එසවීම',
                    'Toe Taps': 'පාද තට්ටු කිරීම',
                    'Seated March': 'වාඩි වී පාගමන',
                    'Supported Sitting Exercise': 'සහාය දක්වන වාඩි වීමේ ව්‍යායාමය',
                    'Heel Slides': 'විලුඹ ලිස්සා යාම',
                    'Hand Stretch': 'අත් දිගු කිරීම',
                    'Walking': 'ඇවිදීම',
                    'Gentle Breathing': 'මෘදු හුස්ම ගැනීම',
                    'Ankle Pumps': 'වළලුකර පොම්ප කිරීම',
                    'Pelvic Floor Activation': 'ශ්‍රෝණි තට්ටුව සක්‍රිය කිරීම',
                    'Bridge Exercise': 'පාලම් ව්‍යායාමය',
                    'Gentle Ankle Pumps': 'මෘදු වළලුකර පොම්ප කිරීම',
                    'Bed Mobility Exercise': 'ඇඳේ චලනය වීමේ ව්‍යායාමය',
                    'Guided Relaxation': 'මඟ පෙන්වන විවේකය',
                    'Wrist Mobility': 'මැණික්කටුව චලනය',
                    'Bird Dog': 'කුරුළු බල්ලා ව්‍යායාමය',
                    'Kegel Exercise': 'කේගල් ව්‍යායාමය',
                    'Pelvic Tilt': 'ශ්‍රෝණි ඇලය',
                    'Neck Stretch': 'බෙල්ල දිගු කිරීම',
                    'Cat Cow Stretch': 'බළලා-එළදෙන දිගු කිරීම',
                    'Arm Circles': 'අත් කව කිරීම',
                    'Modified Squats': 'වෙනස් කළ ස්කොට්ස්',
                    'Wall Pushups': 'බිත්ති තල්ලු කිරීම්'
                };
                
                const recObj = rec.toObject ? rec.toObject() : rec;
                const englishName = recObj.customName || recObj.name;
                const sinhalaName = sinhalaTranslations[englishName] || englishName;

                recommendations.push({
                    ...recObj,
                    exerciseDetails: {
                        name: englishName,
                        nameSi: sinhalaName,
                        videoUrl: recObj.videoUrl,
                        duration: recObj.duration || 10,
                        description: 'Recommended specifically for your health profile.',
                        descriptionSi: 'ඔබේ සෞඛ්‍ය පැතිකඩ සඳහා විශේෂයෙන් නිර්දේශ කර ඇත.',
                        type: 'ml_recommended'
                    }
                });
            } else {
                recommendations.push(rec);
            }
        }
        
        res.json({
            recommendations,
            hasData: true,
            safetyStatus: healthData.safetyStatus,
            safetyMessage: healthData.safetyMessage,
            safetyMessageSi: healthData.safetyMessageSi
        });
    } catch (err) {
        next(err);
    }
};

// POST /exercise/record - Save exercise completion record
const saveExerciseRecord = async (req, res, next) => {
    try {
        const userId = req.user.id;
        const { date, exerciseId, customActivityName, status, accuracy, durationCompleted, userFeedback, liked } = req.body;
        
        const record = await ExerciseRecord.findOneAndUpdate(
            { userId, date, exerciseId: exerciseId || null },
            { userId, date, exerciseId, customActivityName, status, accuracy, durationCompleted, userFeedback, liked, updatedAt: Date.now() },
            { upsert: true, new: true }
        );
        
        // Update health data record to mark exercise as completed
        if (status === 'completed') {
            await PostpartumHealthData.findOneAndUpdate(
                { userId, date, 'recommendedExercises.exerciseId': exerciseId },
                { $set: { 'recommendedExercises.$.completed': true } }
            );
        }
        
        res.json({ success: true, record });
    } catch (err) {
        next(err);
    }
};

// POST /exercise/video/upload - Upload exercise video (mock for now)
const uploadVideo = async (req, res, next) => {
    try {
        const userId = req.user.id;
        const { date, exerciseId, videoUri } = req.body;
        
        // Mock video analysis
        // In production: use ML model to analyze pose
        const mockAccuracy = 65 + Math.floor(Math.random() * 30);
        const mockFeedback = mockAccuracy > 80 ? 'Excellent posture! Keep it up!' :
                            mockAccuracy > 60 ? 'Good effort. Try to improve your range of motion.' :
                            'Keep practicing. Focus on maintaining proper posture.';
        
        // Save video record
        const record = await ExerciseRecord.findOneAndUpdate(
            { userId, date, exerciseId },
            { videoUrl: videoUri, accuracy: mockAccuracy, feedback: mockFeedback },
            { upsert: true, new: true }
        );
        
        res.json({
            success: true,
            accuracy: mockAccuracy,
            feedback: mockFeedback,
            feedbackSi: mockAccuracy > 80 ? 'විශිෂ්ට ඉරියව්වක්! දිගටම කරගෙන යන්න!' :
                       mockAccuracy > 60 ? 'හොඳ උත්සාහයක්. ඔබේ චලන පරාසය වැඩිදියුණු කිරීමට උත්සාහ කරන්න.' :
                       'දිගටම පුහුණු වන්න. නිවැරදි ඉරියව්ව පවත්වා ගැනීමට අවධානය යොමු කරන්න.'
        });
    } catch (err) {
        next(err);
    }
};

// GET /exercise/progress - Get user progress over time
const getProgress = async (req, res, next) => {
    try {
        const userId = req.user.id;
        const { days = 30 } = req.query;
        
        const startDate = new Date();
        startDate.setDate(startDate.getDate() - days);
        const startDateStr = startDate.toISOString().split('T')[0];
        
        const records = await ExerciseRecord.find({
            userId,
            date: { $gte: startDateStr },
            status: 'completed'
        }).sort({ date: 1 });
        
        const dailyAccuracy = {};
        const weeklyCount = {};
        
        records.forEach(record => {
            if (!dailyAccuracy[record.date]) {
                dailyAccuracy[record.date] = { total: 0, count: 0 };
            }
            if (record.accuracy) {
                dailyAccuracy[record.date].total += record.accuracy;
                dailyAccuracy[record.date].count++;
            }
        });
        
        const progressData = Object.entries(dailyAccuracy).map(([date, data]) => ({
            date,
            avgAccuracy: data.count > 0 ? Math.round(data.total / data.count) : 0
        }));
        
        // Calculate streak
        let currentStreak = 0;
        let bestStreak = 0;
        let streak = 0;
        
        for (let i = 0; i < records.length; i++) {
            const currentDate = new Date(records[i].date);
            const prevDate = i > 0 ? new Date(records[i-1].date) : null;
            
            if (prevDate) {
                const diffDays = (currentDate - prevDate) / (1000 * 60 * 60 * 24);
                if (diffDays === 1) {
                    streak++;
                } else {
                    streak = 1;
                }
            } else {
                streak = 1;
            }
            
            bestStreak = Math.max(bestStreak, streak);
        }
        
        currentStreak = streak;
        
        res.json({
            progressData,
            totalExercises: records.length,
            averageAccuracy: records.length > 0 ? 
                Math.round(records.reduce((sum, r) => sum + (r.accuracy || 0), 0) / records.length) : 0,
            currentStreak,
            bestStreak
        });
    } catch (err) {
        next(err);
    }
};

// GET /exercise/seed - Seed default exercises (for initial setup)
const seedExercises = async (req, res, next) => {
    try {
        const exercises = [
            {
                name: 'Deep Breathing',
                nameSi: 'ගැඹුරු හුස්ම ගැනීම',
                type: 'breathing',
                intensity: 'low',
                duration: 5,
                description: 'Gentle breathing exercises to reduce stress and improve oxygen flow.',
                descriptionSi: 'ආතතිය අඩු කිරීමට සහ ඔක්සිජන් ප්‍රවාහය වැඩි දියුණු කිරීමට මෘදු හුස්ම ගැනීමේ ව්‍යායාම.',
                videoUrl: 'https://example.com/breathing.mp4',
                steps: [
                    { stepNumber: 1, instruction: 'Sit comfortably with your back straight', instructionSi: 'ඔබේ පිටුපස කෙළින් තබාගෙන සුවපහසු ලෙස වාඩි වන්න', duration: 60 },
                    { stepNumber: 2, instruction: 'Inhale deeply through your nose for 4 seconds', instructionSi: 'තත්පර 4ක් නාසයෙන් ගැඹුරින් හුස්ම ගන්න', duration: 4 },
                    { stepNumber: 3, instruction: 'Hold for 4 seconds', instructionSi: 'තත්පර 4ක් රඳවා තබා ගන්න', duration: 4 },
                    { stepNumber: 4, instruction: 'Exhale slowly through your mouth for 6 seconds', instructionSi: 'තත්පර 6ක් මුඛයෙන් සෙමින් හුස්ම පිට කරන්න', duration: 6 }
                ]
            },
            {
                name: 'Pelvic Floor Exercise (Kegel)',
                nameSi: 'ශ්‍රෝණි තට්ටු ව්‍යායාම (කේගල්)',
                type: 'pelvic_floor',
                intensity: 'low',
                duration: 10,
                description: 'Strengthen pelvic floor muscles to prevent incontinence and improve recovery.',
                descriptionSi: 'මුත්‍රාශය පාලනය වැළැක්වීමට සහ ප්‍රකෘතිය වැඩිදියුණු කිරීමට ශ්‍රෝණි තට්ටු මාංශ පේශි ශක්තිමත් කරන්න.',
                videoUrl: 'https://example.com/kegel.mp4',
                steps: [
                    { stepNumber: 1, instruction: 'Lie down with knees bent and feet flat', instructionSi: 'දණහිස් නමා පාද පැතලි කර වැතිරෙන්න', duration: 60 },
                    { stepNumber: 2, instruction: 'Tighten pelvic floor muscles as if stopping urine flow', instructionSi: 'මුත්‍රා ප්‍රවාහය නතර කරනවාක් මෙන් ශ්‍රෝණි තට්ටු මාංශ පේශි තද කරන්න', duration: 5 },
                    { stepNumber: 3, instruction: 'Hold for 5-10 seconds', instructionSi: 'තත්පර 5-10ක් තද කර තබා ගන්න', duration: 5 },
                    { stepNumber: 4, instruction: 'Relax for 10 seconds', instructionSi: 'තත්පර 10ක් ලිහිල් කරන්න', duration: 10 }
                ]
            },
            {
                name: 'Gentle Neck Stretch',
                nameSi: 'මෘදු බෙල්ල දිගු කිරීම',
                type: 'stretching',
                intensity: 'low',
                duration: 5,
                description: 'Relieve neck and shoulder tension from breastfeeding and baby care.',
                descriptionSi: 'මව්කිරි දීමෙන් සහ ළදරු රැකවරණයෙන් ඇතිවන බෙල්ල සහ උරහිස් ආතතිය සමනය කරන්න.',
                videoUrl: 'https://example.com/neck-stretch.mp4',
                steps: [
                    { stepNumber: 1, instruction: 'Sit or stand with good posture', instructionSi: 'හොඳ ඉරියව්වකින් වාඩි වන්න හෝ සිටගන්න', duration: 30 },
                    { stepNumber: 2, instruction: 'Slowly tilt head to the right shoulder', instructionSi: 'සෙමෙන් හිස දකුණු උරහිසට නමන්න', duration: 10 },
                    { stepNumber: 3, instruction: 'Hold for 15-20 seconds', instructionSi: 'තත්පර 15-20ක් රඳවා තබා ගන්න', duration: 20 },
                    { stepNumber: 4, instruction: 'Repeat on left side', instructionSi: 'වම් පැත්තෙන් නැවත කරන්න', duration: 20 }
                ]
            },
            {
                name: 'Gentle Walking',
                nameSi: 'මෘදු ඇවිදීම',
                type: 'walking',
                intensity: 'low',
                duration: 15,
                description: 'Low-impact walking to improve circulation and mood.',
                descriptionSi: 'රුධිර සංසරණය සහ මනෝභාවය වැඩිදියුණු කිරීම සඳහා අඩු බලපෑමක් ඇති ඇවිදීම.',
                videoUrl: 'https://example.com/walking.mp4',
                steps: [
                    { stepNumber: 1, instruction: 'Start with gentle warm-up marching in place', instructionSi: 'ස්ථානයේම මෘදු උණුසුම් කිරීමේ පාගමනකින් ආරම්භ කරන්න', duration: 60 },
                    { stepNumber: 2, instruction: 'Walk at a comfortable pace', instructionSi: 'සුවපහසු වේගයකින් ඇවිදින්න', duration: 60 },
                    { stepNumber: 3, instruction: 'Maintain good posture with shoulders back', instructionSi: 'උරහිස් පසුපසට තබාගෙන හොඳ ඉරියව්වක් පවත්වා ගන්න', duration: 60 }
                ]
            },
            {
                name: 'Shoulder Rolls',
                nameSi: 'උරහිස් කරකැවීම',
                type: 'stretching',
                intensity: 'low',
                duration: 3,
                description: 'Release tension in shoulders and upper back.',
                descriptionSi: 'උරහිස් සහ ඉහළ පිටුපස ආතතිය මුදාහරින්න.',
                videoUrl: 'https://example.com/shoulder-roll.mp4',
                steps: [
                    { stepNumber: 1, instruction: 'Sit comfortably with arms relaxed', instructionSi: 'අත් ලිහිල් කර සුවපහසු ලෙස වාඩි වන්න', duration: 10 },
                    { stepNumber: 2, instruction: 'Roll shoulders forward in a circular motion', instructionSi: 'උරහිස් ඉදිරියට වටයක් කරකවන්න', duration: 15 },
                    { stepNumber: 3, instruction: 'Roll shoulders backward', instructionSi: 'උරහිස් පසුපසට කරකවන්න', duration: 15 }
                ]
            }
        ];
        
        for (const ex of exercises) {
            await Exercise.findOneAndUpdate(
                { name: ex.name },
                ex,
                { upsert: true }
            );
        }
        
        res.json({ success: true, message: 'Exercises seeded successfully' });
    } catch (err) {
        next(err);
    }
};

// DEBUG: Get all exercises (temporary)
const debugGetExercises = async (req, res, next) => {
    try {
        const allExercises = await Exercise.find({});
        const breathing = await Exercise.findOne({ type: 'breathing' });
        const pelvic = await Exercise.findOne({ type: 'pelvic_floor' });
        const stretching = await Exercise.findOne({ type: 'stretching' });
        const walking = await Exercise.findOne({ type: 'walking' });
        
        res.json({
            total: allExercises.length,
            breathing: breathing ? { id: breathing._id, name: breathing.name, type: breathing.type } : null,
            pelvicFloor: pelvic ? { id: pelvic._id, name: pelvic.name, type: pelvic.type } : null,
            stretching: stretching ? { id: stretching._id, name: stretching.name, type: stretching.type } : null,
            walking: walking ? { id: walking._id, name: walking.name, type: walking.type } : null,
            all: allExercises.map(e => ({ name: e.name, type: e.type }))
        });
    } catch (err) {
        res.json({ error: err.message });
    }
};

module.exports = {
    submitHealthData,
    getHealthData,
    getRecommendations,
    saveExerciseRecord,
    uploadVideo,
    getProgress,
    seedExercises,
    debugGetExercises
};