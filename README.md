# Veodee

A fast, offline-capable YouTube player and playlist manager.

Veodee is a single-page React app that stores your playlists and subscriptions locally in the browser, fetches video metadata lazily, and lets you watch with your choice of player (YouTube, no-cookie YouTube, or Plyr).

## Features

- Multiple playlists — create, rename, import, and reorder videos with drag-and-drop
- Subscriptions page to follow YouTube channels
- Flexible player: YouTube / no-cookie / Plyr, autoplay, loop, and fullscreen modes
- Dark / light / system theme and custom page background
- Offline support via PWA
- Export and import your library as JSON

## Getting started

```bash
cd frontend
npm ci
npm run dev
```

Open http://localhost:5173.

## Scripts

| Command           | Description                        |
| ----------------- | ---------------------------------- |
| `npm run dev`     | Start the Vite dev server          |
| `npm run build`   | Type-check and build to `dist/`    |
| `npm run preview` | Preview the production build       |
| `npm run lint`    | Run ESLint                         |
| `npm run format`  | Format code with Prettier          |

## Tech stack

React 19 · TypeScript · Vite · Tailwind CSS · React Router · Plyr

## License

Apache 2.0