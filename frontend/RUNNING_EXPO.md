# How to Run the App with Expo Go

## Prerequisites
1. **Node.js**: Ensure Node.js is installed on your computer.
2. **Expo Go App**: Install "Expo Go" from the Google Play Store (Android) or App Store (iOS) on your physical phone.
3. **Same Network**: Ensure your computer and your phone are connected to the **SAME WiFi network**.

## Steps to Run

1. **Open Terminal**
   Navigate to the `frontend` directory in your terminal:
   ```bash
   cd frontend
   ```

2. **Start the Development Server**
   Run the following command:
   ```bash
   npx expo start
   ```

3. **Scan the QR Code**
   - **Android**: Open Expo Go and allow permissions. Use the "Scan QR Code" feature within the app to scan the QR code displayed in your terminal.
   - **iOS**: Open the default Camera app and scan the QR code. It will prompt you to open in Expo Go.

4. **Troubleshooting Connection**
   - If the app doesn't load or says "Network request failed":
     - Open `frontend/services/api.js`.
     - Find the line `const DEV_MACHINE_IP = '...'`.
     - Replace the IP address with your computer's local LAN IP (e.g., `192.168.1.5`). You can find this by running `ipconfig` (Windows) or `ifconfig` (Mac/Linux) in your terminal.
     - Reload the app in Expo Go (shake phone -> Reload).

## Backend
Ensure your backend server is running!
1. Open a separate terminal.
2. `cd backend`
3. `npm start` (or whatever your start command is).
