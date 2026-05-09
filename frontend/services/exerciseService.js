import api from './api';

const exerciseService = {
    // Submit daily health data
    submitHealthData: async (data) => {
        const response = await api.post('/exercise/health-data', data);
        return response.data;
    },
    
    // Get health data for a specific date
    getHealthData: async (date) => {
        const response = await api.get(`/exercise/health-data/${date}`);
        return response.data;
    },
    
    // Get recommendations for a date
    getRecommendations: async (date) => {
        const response = await api.get(`/exercise/recommendations/${date}`);
        return response.data;
    },
    
    // Save exercise completion record
    saveExerciseRecord: async (data) => {
        const response = await api.post('/exercise/record', data);
        return response.data;
    },
    
    // Upload video for analysis
    uploadVideo: async (data) => {
        const response = await api.post('/exercise/video/upload', data);
        return response.data;
    },
    
    // Get progress over time
    getProgress: async (days = 30) => {
        const response = await api.get(`/exercise/progress?days=${days}`);
        return response.data;
    }
};

export default exerciseService;