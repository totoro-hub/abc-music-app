## Project

abc-music-app — A React and Vite app for writing ABC music notation, previewing it as sheet music in real time, and printing or saving scores as PDFs.

## Stack

- Node.js runtime with Vite, React 19, and TypeScript (TS/TSX)
- abcjs renders ABC notation as sheet music
- Plain CSS for styling
- No database, authentication, or deployment platform is configured in this repository

## Structure

- `src/App.tsx` — Main music notation editor and sheet music preview
- `src/App.css` — App layout, component styles, responsive and print styles
- `src/index.css` — Global styles and design defaults
- `src/main.tsx` — React entry point
- `src/components/` — Reusable React UI components
- `tests/` — Vitest component, integration, and utility tests
- `public/` — Static assets
- `vite.config.js` — Vite configuration

## Commands

- Dev server: `npm run dev`
- Production build: `npm run build`
- Lint: `npm run lint`
- Type check: `npm run typecheck`
- Format: `npm run format`
- Unit tests: `npm test`
- Preview production build: `npm run preview`

## Verification

After changes, run:

1. `npm run format`
2. `npm run lint`
3. `npm run typecheck`
4. `npm run build`
5. `npm test`

Tests use Vitest with a jsdom environment and React Testing Library. Component tests are in `tests/components/`, with app integration and utility tests in `tests/`.

## Conventions

- Use typed React function components and hooks, with TSX for components.
- Use the existing `abcjs` dependency for ABC parsing and sheet music rendering.
- Keep styles in the existing CSS files and follow the responsive and print-friendly patterns.
- Use semantic HTML and accessible labels for interactive controls.

## Don't

- Don't add Next.js, a database, authentication, or UI libraries unless the project requirements call for them.
- Don't add dependencies when existing browser APIs or installed packages are sufficient.
- Don't silently swallow errors; provide useful feedback when rendering fails.
