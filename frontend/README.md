# Veodee Frontend

A modern YouTube playlist manager built with React 19, TypeScript, and Vite.

## Features

- Organize videos with custom tags
- Multiple player options (YouTube, Plyr)
- Dark/light theme
- Export/import library
- Responsive design

## Tech Stack

- **React 19** - UI library
- **TypeScript** - Type safety
- **Vite** - Build tool and dev server
- **Tailwind CSS** - Styling
- **React Router** - Client-side routing
- **Radix UI** - Accessible UI components
- **Lucide React** - Icons

## Project Structure

```txt
frontend/
├── public/
│   └── pre-style.js  # Sets the initial background to prevent flash of unstyled content
├── src/
│   ├── components/
│   │   ├── player/   # Video player components
│   │   ├── playlist/ # Playlist management components
│   │   └── ui/       # Reusable UI components
│   ├── contexts/     # React contexts (theme, video state)
│   ├── hooks/        # Custom React hooks
│   ├── lib/          # Utility functions
│   ├── pages/        # Page components
│   ├── services/     # API services
│   └── types/        # TypeScript type definitions
├── index.html        # Entry HTML
├── vite.config.ts    # Vite configuration
├── tsconfig.json     # Root TypeScript config (project references)
├── tsconfig.app.json # TypeScript configuration for app
└── tsconfig.node.json # TypeScript configuration for Node files
```

## Development

Run from the project root (using npm workspaces):

```bash
npm run dev
```

Or run directly in the frontend directory:

```bash
cd frontend
npm install
npm run dev
```

This starts the Vite dev server at `http://localhost:5173/`

## Build

```bash
npm run build
```

Builds the frontend to the `dist/` directory in the project root.

## Linting

```bash
npm run lint
```

Runs ESLint on the frontend code.

## Formatting

```bash
npm run format
```

Formats the frontend code with Prettier.

## Configuration

All frontend-specific configuration files are located in the `frontend/` directory:

- **Vite Config**: `vite.config.ts`
  - Base path: `/`
  - Root: `frontend/`
  - Build output: `../dist`
  - Path alias: `@` → `./src`
  - PostCSS config: `./postcss.config.js`

- **TypeScript**: `tsconfig.app.json`
  - Target: ES2023
  - JSX: react-jsx
  - Path mapping: `@/*` → `./src/*`

- **Tailwind CSS**: `tailwind.config.js`
  - Content paths: `./index.html`, `./src/**/*.{js,ts,jsx,tsx}`
  - Dark mode: class-based

- **ESLint**: `eslint.config.js`
  - Extends: recommended, TypeScript, React Hooks, React Refresh, Prettier
  - Files: `**/*.{ts,tsx}`

- **Prettier**: `.prettierrc`
  - Code formatting configuration

- **PostCSS**: `postcss.config.js`
  - Autoprefixer configuration
