# Veodee

Veodee is a browser-based YouTube player and playlist manager. There's no account or backend — your playlists and followed channels live in your browser's localStorage.

## Features

- Multiple playlists: create, rename, import, reorder videos via drag-and-drop
- Subscriptions page to follow YouTube channels
- Player options: YouTube / no-cookie / Plyr, autoplay, loop, fullscreen modes
- Dark / light / system theme and custom page background
- PWA for offline support
- Export and import library as JSON

## Getting started

```bash
cd frontend
npm ci
npm run dev
```

Open http://localhost:5173.

## Scripts

| Command           | Description                  |
| ----------------- | ---------------------------- |
| `npm run dev`     | Start the Vite dev server    |
| `npm run build`   | Type-check and build to dist |
| `npm run preview` | Preview the production build |
| `npm run lint`    | Run ESLint                   |
| `npm run format`  | Format code with Prettier    |

## Tech stack

React 19 · TypeScript · Vite · Tailwind CSS · React Router · Plyr

## License

Apache 2.0