## Project
abc-music-app — A React and Vite app for writing ABC music notation, previewing it as sheet music in real time, and printing or saving scores as PDFs.

## Stack
- Node.js runtime with Vite, React 19, and JavaScript (JSX)
- abcjs renders ABC notation as sheet music
- Plain CSS for styling
- No database, authentication, or deployment platform is configured in this repository

## Structure
- `src/App.jsx` — Main music notation editor and sheet music preview
- `src/App.css` — App layout, component styles, responsive and print styles
- `src/index.css` — Global styles and design defaults
- `src/main.jsx` — React entry point
- `public/` — Static assets
- `vite.config.js` — Vite configuration

## Commands
- Dev server: `npm run dev`
- Production build: `npm run build`
- Lint: `npm run lint`
- Preview production build: `npm run preview`

## Verification
After changes, run:
1. `npm run lint`
2. `npm run build`

There is no test or TypeScript check script configured currently.

## Conventions
- Use React function components and hooks; keep components in JSX unless the project is deliberately migrated to TypeScript.
- Use the existing `abcjs` dependency for ABC parsing and sheet music rendering.
- Keep styles in the existing CSS files and follow the responsive and print-friendly patterns.
- Use semantic HTML and accessible labels for interactive controls.

## Don't
- Don't add Next.js, TypeScript, a database, authentication, or UI libraries unless the project requirements call for them.
- Don't add dependencies when existing browser APIs or installed packages are sufficient.
- Don't silently swallow errors; provide useful feedback when rendering fails.
