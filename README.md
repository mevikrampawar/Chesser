# Chesser - AI Chess Opening Trainer

Identify chess openings in real-time with an AI that runs entirely in your browser. No server needed.

## Features

- **Interactive chessboard** — play moves with drag-and-drop
- **AI opening identification** — Phi-3.5 Mini LLM runs in-browser via WebGPU
- **Lichess statistics** — win/draw/loss stats from millions of games
- **Opening coaching** — explanations, key ideas, and common continuations
- **Google Sign-In** — save your favorite openings to the cloud (Firebase)
- **Offline support** — model caches after first load

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 19 + TypeScript + Vite |
| Chess | chess.js + react-chessboard |
| AI (in-browser) | WebLLM + Phi-3.5 Mini (3.8B) |
| Opening data | Lichess Opening Explorer API |
| Auth | Firebase Auth (Google Sign-In) |
| Database | Cloud Firestore |
| Hosting | Firebase Hosting |
| Styling | Tailwind CSS |

## Setup

### 1. Install dependencies

```bash
npm install
```

### 2. Configure Firebase

1. Go to [Firebase Console](https://console.firebase.google.com)
2. Create a project (or use existing Google Cloud project)
3. Enable **Authentication** → Sign-in method → Google
4. Enable **Cloud Firestore**
5. Register a web app and copy the config
6. Create `.env` from `.env.example` and fill in your Firebase config:

```bash
cp .env.example .env
# Edit .env with your Firebase config values
```

### 3. Run locally

```bash
npm run dev
```

### 4. Deploy to Firebase Hosting

```bash
npm install -g firebase-tools
firebase login
firebase deploy
```

## Project Structure

```
src/
├── components/        # UI components
│   ├── ChessBoard     # Interactive chessboard
│   ├── OpeningPanel   # AI results + stats
│   ├── StatsBar       # Win/Draw/Loss visualization
│   ├── TopMoves       # Popular continuations
│   ├── MoveHistory    # Move list
│   ├── SavedOpenings  # Cloud-saved openings
│   └── SetupScreen    # LLM loading screen
├── hooks/             # React hooks
│   ├── useChessGame   # Chess game state
│   ├── useLLM         # WebLLM engine
│   ├── useAuth        # Firebase auth
│   └── useOpeningStats # Opening analysis
├── services/          # Business logic
│   ├── llm            # WebLLM wrapper
│   ├── lichess        # Lichess API client
│   ├── opening        # Opening orchestrator
│   ├── firebase       # Firebase config
│   └── firestore      # Cloud Firestore ops
├── types/             # TypeScript types
└── utils/             # Prompt templates
```

## How It Works

1. User plays moves on the chessboard
2. After each move, two things happen in parallel:
   - **WebLLM** (Phi-3.5 Mini) identifies the opening from the move sequence
   - **Lichess API** fetches statistics from millions of games
3. Results merge and display: opening name, ECO code, stats, and AI coaching
4. Signed-in users can save openings to their Firestore profile

## License

MIT
