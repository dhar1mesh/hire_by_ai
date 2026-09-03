# Round-0 AI Technical Interview System

An end-to-end, sub-second latency, two-way conversational AI technical interview platform built for high-signal candidate assessment.

This project is decoupled into **two independent applications**:
1. **`backend/`**: Dedicated Node.js & TypeScript Express server (OpenAI Realtime session broker & `gpt-4o-mini` evaluation bar raiser).
2. **`frontend/`**: Next.js 14 client application (WebRTC direct audio connection, audio-reactive visualizer, live webcam feed, rolling transcript, and recruiter scorecard).

---

## 🏗️ Architecture & Communication

```
+------------------------------------------------------------------------------------+
|                         FRONTEND (Next.js - Port 3030)                             |
|                                                                                    |
|  - Live Webcam Feed (`getUserMedia`)                                               |
|  - Audio-Reactive Visualizer (`AnalyserNode` + Canvas Waveforms)                    |
|  - Real-Time Rolling Transcript (`RTCDataChannel`)                                 |
|  - Scorecard Dashboard (`/scorecard`)                                              |
+------------------------------------------------------------------------------------+
       |                                                  |
       | 1. POST http://localhost:4000/api/session        | 2. Direct WebRTC PeerConnection
       |    (Requests ephemeral client token)             |    (Sub-300ms Opus audio)
       v                                                  v
+----------------------------------------+    +--------------------------------------+
|     BACKEND (Express - Port 4000)      |    |        OPENAI REALTIME API           |
|                                        |    |     `gpt-4o-realtime-preview`        |
| - Secure OpenAI Session Broker         |    |                                      |
| - Injects Sarah Chen Lead Architect    |    | - Server VAD with live interruption  |
| - Automated Whisper-1 Candidate ASR    |    | - Whisper-1 candidate transcription  |
| - POST /api/evaluate Scorecard Engine  |    | - Full-duplex direct audio streaming |
+----------------------------------------+    +--------------------------------------+
```

---

## 📁 Project Structure

```
hire_by_ai/
├── backend/                        # Dedicated Backend Application (Port 4000)
│   ├── src/
│   │   ├── server.ts               # Express server, CORS, /api/session & /api/evaluate
│   │   ├── resumeData.ts           # Hardcoded Alex Doe profile, rubrics & prompt generator
│   │   └── scorecardTypes.ts       # Structured JSON evaluation schema
│   ├── package.json
│   ├── tsconfig.json
│   └── .env.example
│
├── frontend/                       # Dedicated Frontend Application (Port 3030)
│   ├── app/
│   │   ├── interview/page.tsx      # Dual-pane live WebRTC video call room
│   │   ├── scorecard/page.tsx      # Recruiter scorecard report with metric gauges
│   │   ├── page.tsx                # Hardware readiness test & candidate lobby
│   │   ├── layout.tsx
│   │   └── globals.css
│   ├── components/
│   │   └── AudioReactiveVisualizer.tsx # Multi-ring glowing orb + dynamic canvas wave
│   ├── hooks/
│   │   └── useWebRTCInterview.ts   # WebRTC PeerConnection, DataChannel & audio meters
│   ├── lib/
│   │   ├── resumeData.ts           # Shared candidate resume constants
│   │   ├── scorecardTypes.ts       # Scorecard TypeScript interfaces
│   │   └── utils.ts
│   ├── package.json
│   ├── next.config.mjs
│   ├── tailwind.config.js
│   ├── tsconfig.json
│   └── .env.example
│
├── package.json                    # Root orchestrator scripts
└── README.md
```

---

## ⚡ Quickstart Guide

### 1. Environment Setup

#### Backend (`backend/.env`):
```bash
cd backend
cp .env.example .env
```
Add your OpenAI key:
```env
PORT=4000
OPENAI_API_KEY=sk-proj-your-openai-api-key-here
```

#### Frontend (`frontend/.env.local`):
```bash
cd frontend
cp .env.example .env.local
```
Configured by default to point to the backend:
```env
NEXT_PUBLIC_BACKEND_URL=http://localhost:4000
```
*(Note: You can also supply the OpenAI API key directly inside the frontend interview room modal).*

---

### 2. Running the Applications

#### Option A: Run Both from Root
```bash
# In hire_by_ai/
npm run dev:backend    # Terminal 1: Starts Express on http://localhost:4000
npm run dev:frontend   # Terminal 2: Starts Next.js on http://localhost:3030
```

#### Option B: Run Individually

**Backend**:
```bash
cd backend
npm install
npm run dev     # Starts on http://localhost:4000
```

**Frontend**:
```bash
cd frontend
npm install
npm run dev     # Starts on http://localhost:3030
```

---

## 🌐 Endpoints & Pages

### Backend (`http://localhost:4000`)
- `GET /health` - Service health and OpenAI key configuration status.
- `POST /api/session` - Requests ephemeral token from OpenAI Realtime API.
- `POST /api/evaluate` - Evaluates interview transcripts with `gpt-4o-mini`.

### Frontend (`http://localhost:3030`)
- **Lobby & Pre-flight**: [http://localhost:3030](http://localhost:3030)
- **Live Interview Stage**: [http://localhost:3030/interview](http://localhost:3030/interview)
- **Recruiter Scorecard**: [http://localhost:3030/scorecard](http://localhost:3030/scorecard)
