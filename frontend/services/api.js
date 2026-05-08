import axios from 'axios';

const BASE_URL = 'http://192.168.8.199:8073/api/chatbot';

export const sendMessageToBot = async (message, riskLevel) => {
  try {
    const response = await axios.post(`${BASE_URL}/chat`, {
      message,
      riskLevel,
    });

    return response.data;
  } catch (error) {
    console.log(error);

    return {
      reply: 'Sorry, I could not respond right now.',
      routines: [],
      reminders: [],
    };
  }
};