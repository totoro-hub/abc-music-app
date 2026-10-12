import { watch } from "node:fs";
import { spawn } from "node:child_process";
import process from "node:process";
import { fileURLToPath } from "node:url";
import path from "node:path";

const projectRoot = fileURLToPath(new URL("../", import.meta.url));
const viteCli = fileURLToPath(
  new URL("../node_modules/vite/bin/vite.js", import.meta.url),
);
const eslintCli = fileURLToPath(
  new URL("../node_modules/eslint/bin/eslint.js", import.meta.url),
);
const rootFiles = new Set([
  "eslint.config.js",
  "package.json",
  "package-lock.json",
  "vite.config.js",
]);
const children = new Set();
let lintProcess = null;
let lintQueued = false;
let lintTimer = null;
let stopping = false;

function stopAll(exitCode) {
  if (stopping) return;

  stopping = true;
  process.exitCode = exitCode;
  clearTimeout(lintTimer);
  fileWatcher.close();

  for (const child of children) {
    child.kill();
  }
}

function startProcess(label, executable, args, stopOnExit = true) {
  const child = spawn(process.execPath, [executable, ...args], {
    cwd: projectRoot,
    stdio: "inherit",
  });
  children.add(child);

  child.on("error", (error) => {
    console.error(`${label} could not start: ${error.message}`);
    stopAll(1);
  });

  child.on("exit", (code, signal) => {
    children.delete(child);
    if (stopping || !stopOnExit) return;

    console.error(
      `${label} stopped unexpectedly (${signal ?? `exit code ${code ?? "unknown"}`}).`,
    );
    stopAll(code ?? 1);
  });

  return child;
}

function runLint() {
  if (stopping) return;
  if (lintProcess) {
    lintQueued = true;
    return;
  }

  console.log("\nRunning ESLint...");
  lintProcess = startProcess("ESLint", eslintCli, ["."], false);
  lintProcess.on("exit", (code, signal) => {
    lintProcess = null;
    if (signal) {
      console.error(`ESLint stopped unexpectedly (${signal}).`);
      stopAll(1);
      return;
    }

    if (code === 0) {
      console.log("ESLint passed.");
    } else {
      console.error(`ESLint failed with exit code ${code ?? "unknown"}.`);
    }

    if (lintQueued && !stopping) {
      lintQueued = false;
      runLint();
    }
  });
}

function isLintRelevant(relativePath) {
  const normalizedPath = relativePath.split(path.sep).join("/");
  return (
    normalizedPath.startsWith("src/") ||
    normalizedPath.startsWith("tests/") ||
    normalizedPath.startsWith("scripts/") ||
    rootFiles.has(normalizedPath)
  );
}

const fileWatcher = watch(
  projectRoot,
  { recursive: true },
  (_eventType, fileName) => {
    if (!fileName) {
      clearTimeout(lintTimer);
      lintTimer = setTimeout(runLint, 150);
      return;
    }

    const relativePath = fileName.toString();
    if (!isLintRelevant(relativePath)) return;

    console.log(`\nDetected change: ${relativePath}`);
    clearTimeout(lintTimer);
    lintTimer = setTimeout(runLint, 150);
  },
);

fileWatcher.on("error", (error) => {
  console.error(`File watcher failed: ${error.message}`);
  stopAll(1);
});

process.on("SIGINT", () => stopAll(130));
process.on("SIGTERM", () => stopAll(143));

console.log("Starting Vite development server...");
startProcess("Vite development server", viteCli, []);
console.log("Starting production build watcher...");
startProcess("Production build watcher", viteCli, ["build", "--watch"]);
runLint();
