# Megha - The Storm Goddess AI Companion

Megha is a powerful, persistent AI companion acting as an atmospheric, intelligent entity living on your device. She monitors environmental contexts, communicates proactively via local background notifications, and remembers everything.

## Tech Stack
- **Frontend:** React Native (Expo Managed Workflow), TypeScript
- **State Management:** Zustand (with AsyncStorage persistence)
- **Navigation:** React Navigation Native Stack
- **Voice Capabilities:** `expo-av` (recording) and `expo-speech` (TTS)
- **Sensors:** `expo-location`, `expo-battery`, `expo-network`
- **Background Processes:** `expo-task-manager`, `expo-background-fetch`, `expo-notifications`
- **API Proxy Server:** Node.js / Express

## Installation & Running

### 1. The Proxy Server (Backend)
Megha uses Anthropic's Claude API. To keep your API keys secure and out of the React Native client bundle, you must run the local proxy server.
```bash
cd server
npm install
# Ensure you set your environment variables (see below)
node proxy.js
```

### 2. The Mobile Client
```bash
npm install
npx expo start
```
You can use the Expo Go app on your physical device, or run it on an Android/iOS emulator.

## Required Environment Variables
You must provide an Anthropic API Key to the Proxy server to power Megha's intelligence.
In the `/server` directory, create a `.env` file or export it directly:
```
ANTHROPIC_API_KEY=sk-ant-xxxxxxxxxxxxxxxx
PORT=3000
```

## Folder Structure
```
├── App.tsx                    # Entry point & Navigation stack
├── MEGHA_PERSONA.md           # Instructions governing Megha's personality and logic
├── server/
│   └── proxy.js               # Express server forwarding requests to Anthropic securely
├── src/
│   ├── components/            # Reusable UI components
│   ├── screens/               # App Views (ChatScreen, SettingsScreen, OnboardingScreen)
│   ├── services/              # Core Logic (sensorTelemetry, backgroundTask, websocket)
│   └── store/                 # Zustand state stores (chatStore with persistence)
```
