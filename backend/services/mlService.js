const axios = require("axios");

const ML_URL = "http://127.0.0.1:5001/analyze";

async function analyzeText(text) {

  try {

    const response = await axios.post(ML_URL, {
      text: text
    });

    return response.data;

  } catch (error) {

    console.log("ML Service Error:", error.message);

    return {
      emotion: "sad",
      primaryReason: "overwhelmed",
      riskLevel: "medium",
      recommendations: {
        activities: ["breathing_478"],
        games: ["bubble_pop"],
        videoUrl: "https://youtu.be/jzGyjLGbAUc"
      }
    };
  }
}

module.exports = { analyzeText };