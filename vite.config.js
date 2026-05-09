import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

// On Kevin's machine the project lives on a network share (\\FS01\USERS\khill)
// that's mapped to two drive letters (H: and Y:). Without pinning `root`,
// Rollup canonicalizes the html path through the alternate letter and errors
// out with "must not be absolute". Pinning root to this file's directory
// fixes it and is also the right thing to do regardless.
const here = path.dirname(fileURLToPath(import.meta.url));

// Builds default to '/calisthenics-tracker/' so they work directly on
// kevinhill515.github.io/calisthenics-tracker. Local dev still serves at '/'.
export default defineConfig(({ command }) => ({
  root: here,
  base: command === 'build' ? '/calisthenics-tracker/' : '/',
  plugins: [react(), tailwindcss()],
}));
