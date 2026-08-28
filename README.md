# Veodee

Veodee is a browser-based YouTube player and playlist manager. There's no account or backend — your playlists and followed channels live in your browser's localStorage.

![License](https://img.shields.io/github/license/petermichon/veodee)
![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?logo=typescript&logoColor=white)
![React](https://img.shields.io/badge/React-19-61DAFB?logo=react&logoColor=white)
![Vite](https://img.shields.io/badge/Vite-646CFF?logo=vite&logoColor=white)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-06B6D4?logo=tailwindcss&logoColor=white)
![React Router](https://img.shields.io/badge/React_Router-CA4245?logo=react-router&logoColor=white)
![Plyr](https://img.shields.io/badge/Plyr-00B2FF?logo=plyr&logoColor=white)

## Features

- Multiple playlists: create, rename, import, reorder videos via drag-and-drop
- Subscriptions page to follow YouTube channels
- Player options: YouTube / no-cookie / Plyr, autoplay, loop, fullscreen modes
- Dark / light / system theme and custom page background
- PWA for offline support
- Export and import library as JSON

## Getting started

```bash
npm ci
npm run dev
```

Open http://localhost:5173.

## Project structure

```txt
veodee/
├── package.json   # Root workspace with shared scripts
└── frontend/      # React frontend (npm workspace)
```

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