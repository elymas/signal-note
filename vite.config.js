import { fileURLToPath, URL } from 'node:url';
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

const siteRoot = fileURLToPath(new URL('.', import.meta.url));
export default defineConfig({
  root: siteRoot,
  base: '/signal-note/',
  plugins: [react()],
  build: {
    outDir: fileURLToPath(new URL('./dist', import.meta.url)),
    emptyOutDir: true,
  },
});
