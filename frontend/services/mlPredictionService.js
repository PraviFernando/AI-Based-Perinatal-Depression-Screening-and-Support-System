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
            const response = await axios.post(`${ML_API_URL}/predict/risk`, healthData, {
                timeout: 10000
            });
            
            if (response.data.success) {
                return {
                    success: true,
                    riskLevel: response.data.risk_level,
                    confidenceScores: response.data.confidence_scores,
                    modelUsed: response.data.model_used
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
        
        return {
            success: true,
            riskLevel: riskLevel,
            confidenceScores: {
                high: riskLevel === 'high' ? 0.8 : 0.1,
                low: riskLevel === 'low' ? 0.8 : 0.1,
                medium: riskLevel === 'medium' ? 0.8 : 0.1
            },
            modelUsed: 'fallback_rule_based',
            isFallback: true
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