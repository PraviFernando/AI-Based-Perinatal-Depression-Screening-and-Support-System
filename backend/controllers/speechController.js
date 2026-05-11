const axios = require('axios');
const fs = require('fs');
const path = require('path');

// Try a more standard model ID
const HF_MODEL = "openai/whisper-large-v3";
const HF_API_URL = `https://api-inference.huggingface.co/models/${HF_MODEL}`;

exports.transcribe = async (req, res) => {
    try {
        console.log('--- Hugging Face Transcription Request Started ---');
        console.log('Using Model:', HF_MODEL);

        if (!process.env.HUGGING_FACE_API_KEY || process.env.HUGGING_FACE_API_KEY === 'your_huggingface_api_key_here') {
            return res.status(500).json({ message: 'Hugging Face API key is missing.' });
        }

        if (!req.file) {
            return res.status(400).json({ message: 'No audio file provided' });
        }

        const filePath = req.file.path;
        console.log('Reading file:', filePath);
        const audioData = fs.readFileSync(filePath);

        console.log('Calling Hugging Face API...');
        const response = await axios.post(HF_API_URL, audioData, {
            headers: {
                Authorization: `Bearer ${process.env.HUGGING_FACE_API_KEY}`,
                "Content-Type": "application/octet-stream",
            },
            timeout: 90000, // 90 seconds
        });

        // Clean up
        fs.unlinkSync(filePath);

        console.log('API Response status:', response.status);

        // Hugging Face Whisper can return { text: "..." } or [{ generated_text: "..." }]
        let transcript = "";
        if (response.data.text) {
            transcript = response.data.text;
        } else if (Array.isArray(response.data) && response.data[0]?.generated_text) {
            transcript = response.data[0].generated_text;
        } else if (response.data.generated_text) {
            transcript = response.data.generated_text;
        }

        console.log('Transcript:', transcript);

        if (!transcript) {
            return res.status(500).json({ message: 'Transcription empty', details: response.data });
        }

        res.status(200).json({ text: transcript });

    } catch (error) {
        console.error('Hugging Face API Error:', {
            status: error.response?.status,
            data: error.response?.data,
            message: error.message
        });

        if (error.response?.status === 503) {
            return res.status(503).json({
                message: 'Model is loading, please wait...',
                estimated_time: error.response.data?.estimated_time
            });
        }

        res.status(500).json({
            message: 'Failed to transcribe audio via Hugging Face',
            error: error.message,
            details: error.response?.data || 'Check backend logs'
        });
    }
};
