# Veodee

A YouTube player and playlist manager.

A single-page React app that stores playlists and subscriptions in the browser, fetches video metadata lazily, and supports multiple players (YouTube, no-cookie YouTube, Plyr).

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