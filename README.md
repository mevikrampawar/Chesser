# Chesser

AI-powered chess opening trainer. Play moves on the board and the AI identifies the opening, provides statistics, and coaches you through the theory.

## Live Demo

→ [https://mevikrampawar.github.io/Chesser/](https://mevikrampawar.github.io/Chesser/)

## Features

- Interactive chessboard with drag-and-drop
- AI opening identification (Phi-3.5 Mini running in your browser via WebGPU)
- Opening statistics from millions of Lichess games
- AI coaching: explanations, key ideas, common continuations
- Google Sign-In to save your favorite openings (Firebase)
- Runs entirely client-side — no server needed

## Tech

| Layer | Tech |
|-------|------|
| Frontend | React 19, TypeScript, Vite, Tailwind CSS |
| Chess | chess.js, react-chessboard |
| AI | WebLLM (Phi-3.5 Mini, in-browser via WebGPU) |
| Data | Lichess Opening Explorer API |
| Auth | Firebase Auth (Google) |
| Storage | Cloud Firestore |
| Hosting | GitHub Pages (auto-deploy via GitHub Actions) |

## How It Works

1. Play moves on the chessboard
2. AI identifies the opening from the move sequence (runs in your browser)
3. Lichess API provides win/draw/loss stats from millions of games
4. Results display: opening name, ECO code, statistics, and coaching
5. Sign in with Google to save openings to your profile

## Development

```bash
npm install
npm run dev
```

## Deployment

Push to `main` branch → GitHub Actions auto-builds and deploys to GitHub Pages.

## License

MIT
