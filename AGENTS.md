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
- `tests/` — Vitest component and utility tests
- `public/` — Static assets
- `vite.config.js` — Vite configuration

## Commands

- Dev server: `npm run dev`
- Dev server with lint and production-build watchers: `npm run dev:watch`
- Production build: `npm run build`
- Type check: `npm run typecheck`
- Lint: `npm run lint`
- Format source and tests: `npm run format`
- Unit tests: `npm test`
- Preview production build: `npm run preview`

`npm run dev:watch` starts the Vite development server, rebuilds the production
bundle when files change, and reruns ESLint when source, test, or configuration
files change.

## Verification

After changes, run:

1. `npm run format`
2. `npm run lint`
3. `npm run build`
4. `npm test`

Tests use Vitest with a jsdom environment and React Testing Library. Component tests are in `tests/components/`, with app integration tests in `tests/` and test setup in `tests/setup.ts`.
Prettier formats TypeScript, TSX, CSS, remaining JavaScript configuration files, and the package manifest through `npm run format`.

## Conventions

- Use typed React function components and hooks, with TSX for components.
- Use the existing `abcjs` dependency for ABC parsing and sheet music rendering.
- Keep styles in the existing CSS files and follow the responsive and print-friendly patterns.
- Use semantic HTML and accessible labels for interactive controls.

## Don't

- Don't add Next.js, a database, authentication, or UI libraries unless the project requirements call for them.
- Don't add dependencies when existing browser APIs or installed packages are sufficient.
- Don't silently swallow errors; provide useful feedback when rendering fails.
