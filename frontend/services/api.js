import axios from 'axios';
import { Platform } from 'react-native';

// START: Update this with your computer's local IP address if running on a physical device.
// For Android Emulator, 10.0.2.2 is usually correct.
// For iOS Simulator, localhost is fine.
const DEV_MACHINE_IP = '192.168.1.5'; // Example: '192.168.1.5'
const PORT = '8073';

const getBaseUrl = () => {
    if (Platform.OS === 'android') {
        // 10.0.2.2 is the special alias to your host loopback interface (127.0.0.1)
        // on the Android emulator.
        return `http://10.0.2.2:${PORT}`;
    }
    // For iOS simulator or if you want to use your LAN IP
    // return `http://${DEV_MACHINE_IP}:${PORT}`;
    return `http://localhost:${PORT}`;
};

const api = axios.create({
    baseURL: getBaseUrl(),
    withCredentials: true, // This is important for cookies
    headers: {
        'Content-Type': 'application/json',
    },
});

export default api;
