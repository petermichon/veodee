# Veodee

Veodee is a browser-based YouTube player and playlist manager. There's no account or backend — your playlists and followed channels live in your browser's localStorage.

![License](https://img.shields.io/github/license/petermichon/veodee)
![veodee.com](https://img.shields.io/website?url=https://veodee.com&label=veodee.com&up_message=online)
![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?logo=typescript&logoColor=white)
![React](https://img.shields.io/badge/React-20232A?logo=react&logoColor=61DAFB)
![Vite](https://img.shields.io/badge/Vite-646CFF?logo=vite&logoColor=white)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-06B6D4?logo=tailwindcss&logoColor=white)

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

## YouTube compliance

Veodee plays videos through the official YouTube IFrame Player API and loads metadata from the public oEmbed endpoint. It does not scrape, download, re-host content, block ads, or support background playback.

Implemented:

- `/terms` and `/privacy` pages linking the YouTube Terms of Service and Google Privacy Policy.
- Privacy-enhanced (`youtube-nocookie`) playback by default and autoplay off by default.
- Referer identity left intact (no `Referrer-Policy` suppression).
- Embedded player viewport floored at 200×200 per YouTube's Required Minimum Functionality.

Accepted gaps:

- **Explicit agreement flow** — features are not gated behind an explicit privacy-policy acceptance. Low risk for a non-commercial project; revisit by adding a first-run accept if that changes.
- **Made For Kids (MFK) lookup** — Developer Policies §III.E.4.j asks API clients to check each embedded video's `status.madeForKids` via the Data API and disable tracking for MFK videos. oEmbed cannot provide this, and a Data API key cannot ship in an open-source client (§III.D.1.d), so it would require a server-side proxy. The app is not child-directed and collects no playback data itself.

## License

Apache 2.0