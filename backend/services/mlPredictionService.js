const axios = require('axios');

const ML_API_URL = process.env.ML_API_URL || 'http://localhost:5001';

class MLPredictionService {
    
    /**
     * Predict risk level for a postpartum mother
     * @param {Object} healthData - Postpartum health data
     * @returns {Promise<Object>} Prediction result
     */
    static async predictRisk(healthData) {
        try {
            const pyData = {
                weeks_after_delivery: healthData.weeksAfterDelivery,
                delivery_type: healthData.deliveryType,
                pelvic_pain: healthData.pelvicPain ? 1 : 0,
                back_pain: healthData.backPain ? 1 : 0,
                abdominal_pain: healthData.abdominalPain ? 1 : 0,
                bleeding_complications: healthData.bleedingComplications ? 1 : 0,
                doctor_restrictions: healthData.doctorRestrictions ? 1 : 0,
                muscle_weakness: healthData.muscleWeakness ? 1 : 0,
                fatigue_level: healthData.fatigueLevel,
                mobility_level: healthData.mobilityLevel,
                willingness_to_exercise: healthData.willingnessToExercise,
                ppd_risk_level: healthData.ppdRiskLevel
            };
            
            const response = await axios.post(`${ML_API_URL}/predict`, pyData, {
                timeout: 10000
            });
            
            if (response.data.success) {
                return {
                    success: true,
                    riskLevel: response.data.risk_level,
                    modelUsed: response.data.model_used,
                    recommendedExercises: response.data.recommended_exercises || []
                };
            } else {
                throw new Error(response.data.error);
            }
        } catch (error) {
            console.error('ML Prediction API error:', error.message);
            // Fallback to rule-based prediction if ML API fails
            return this.fallbackPrediction(healthData);
        }
    }
    
    /**
     * Get exercise recommendations based on health data
     * @param {Object} healthData - Postpartum health data
     * @returns {Promise<Object>} Exercise recommendations
     */
    static async recommendExercises(healthData) {
        try {
            const response = await axios.post(`${ML_API_URL}/recommend/exercises`, healthData, {
                timeout: 10000
            });
            
            if (response.data.success) {
                return {
                    success: true,
                    riskLevel: response.data.risk_level,
                    exercises: response.data.exercises
                };
            } else {
                throw new Error(response.data.error);
            }
        } catch (error) {
            console.error('Exercise recommendation API error:', error.message);
            return this.fallbackExercises(healthData);
        }
    }
    
    /**
     * Fallback exercise recommendations when ML API is unavailable
     */
    static fallbackExercises(healthData) {
        const exercises = [];
        const weeks = healthData.weeksAfterDelivery || 6;
        const pain = healthData.pelvicPain || healthData.backPain || healthData.abdominalPain;
        const mobility = healthData.mobilityLevel || 'normal';
        const fatigue = healthData.fatigueLevel || 'low';
        const riskLevel = healthData.ppdRiskLevel || 'low';
        
        // Always add breathing exercise
        exercises.push({
            name: 'Deep Breathing',
            video_url: 'https://www.youtube.com/embed/ifXo8tJE-t4'
        });
        
        // Add more exercises based on conditions
        if (riskLevel !== 'high' && !pain && weeks >= 2) {
            exercises.push({
                name: 'Kegel Exercise',
                video_url: 'https://www.youtube.com/embed/MJ7EfGu03-0'
            });
        }
        
        if (mobility !== 'very_limited' && !pain) {
            exercises.push({
                name: 'Pelvic Tilt',
                video_url: 'https://www.youtube.com/embed/44fYnoSLL1c'
            });
        }
        
        exercises.push({
            name: 'Neck Stretch',
            video_url: 'https://www.youtube.com/embed/X3-gKPNyrTA'
        });
        
        if (fatigue !== 'high' && mobility === 'normal') {
            exercises.push({
                name: 'Gentle Walking',
                video_url: 'https://www.youtube.com/embed/enYITYwvPAQ'
            });
        }
        
        // Remove duplicates and limit to 5
        const seen = new Set();
        const uniqueExercises = exercises.filter(ex => {
            if (seen.has(ex.name)) return false;
            seen.add(ex.name);
            return true;
        });
        
        return {
            success: true,
            riskLevel: riskLevel,
            exercises: uniqueExercises.slice(0, 5),
            isFallback: true
        };
    }
    
    /**
     * Fallback rule-based prediction when ML API is unavailable
     */
    static fallbackPrediction(healthData) {
        let riskLevel = 'low';
        
        // High risk conditions
        if (healthData.ppdRiskLevel === 'high' ||
            healthData.doctorRestrictions === true ||
            healthData.bleedingComplications === true ||
            (healthData.deliveryType === 'c-section' && healthData.weeksAfterDelivery < 6)) {
            riskLevel = 'high';
        }
        // Medium risk conditions
        else if (healthData.ppdRiskLevel === 'medium' ||
                 healthData.pelvicPain === true ||
                 healthData.abdominalPain === true ||
                 healthData.fatigueLevel === 'high' ||
                 healthData.mobilityLevel === 'limited') {
            riskLevel = 'medium';
        }
        
        // Get fallback exercises
        const exercises = this.fallbackExercises(healthData).exercises;
        
        return {
            success: true,
            riskLevel: riskLevel,
            confidenceScores: {
                high: riskLevel === 'high' ? 0.8 : 0.1,
                low: riskLevel === 'low' ? 0.8 : 0.1,
                medium: riskLevel === 'medium' ? 0.8 : 0.1
            },
            modelUsed: 'fallback_rule_based',
            isFallback: true,
            recommendedExercises: exercises
        };
    }
    
    /**
     * Batch prediction for multiple users
     */
    static async batchPredict(records) {
        try {
            const response = await axios.post(`${ML_API_URL}/predict/batch`, { records }, {
                timeout: 30000
            });
            return response.data;
        } catch (error) {
            console.error('Batch prediction error:', error.message);
            return { success: false, error: error.message };
        }
    }
    
    /**
     * Check if ML API is healthy
     */
    static async healthCheck() {
        try {
            const response = await axios.get(`${ML_API_URL}/health`, { timeout: 5000 });
            return response.data;
        } catch (error) {
            return { status: 'unavailable', error: error.message };
        }
    }
}

module.exports = MLPredictionService;