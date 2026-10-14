import react from "@vitejs/plugin-react";
import { defineConfig } from "vitest/config";

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  base: "/abc-music-app/",
  build: {
    chunkSizeWarningLimit: 520,
  },
  test: {
    environment: "jsdom",
    setupFiles: "./tests/setup.ts",
  },
});
