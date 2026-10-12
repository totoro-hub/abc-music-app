# ABC Music App

A React and Vite app for editing ABC music notation, previewing it as sheet music,
and exporting the score as a PDF.

## Requirements

- Node.js
- npm

## Run locally

Install the project dependencies once:

```sh
npm install
```

Start the local development server:

```sh
npm run dev
```

Open the `Local` URL printed by Vite in your terminal (usually
`http://localhost:5173/`). Keep the terminal running while you use the app.
Changes to files under `src/` are served by Vite and normally appear in the
browser automatically. If the terminal reports that the default port is busy,
Vite may choose another port; use the URL it prints so the browser is connected
to the current server.

To stop the server, focus its terminal and press `Ctrl+C`.

## Build and preview locally

Create a production build:

```sh
npm run build
```

This first runs the TypeScript type checker, then creates the production files
in `dist/`. To run that build on your computer:

```sh
npm run preview
```

Open the preview URL printed by Vite (usually `http://localhost:4173/`). The
preview serves the most recently created build; run `npm run build` again after
making changes before previewing them.

## Other project commands

```sh
npm run typecheck  # Check TypeScript types
npm run lint       # Run ESLint
npm test           # Run the Vitest test suite
npm run format     # Format source, tests, and package.json
```

## Updating local run and build instructions

The available command names and the commands they run are defined in the
`scripts` section of `package.json`. When changing a script or the local
workflow, update the matching command and explanation in this README as well.
The development server's actual address is printed by Vite each time it starts;
use that address rather than assuming a port if another process is already using
the default.
