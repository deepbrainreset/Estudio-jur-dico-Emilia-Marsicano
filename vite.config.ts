import { defineConfig } from 'vite';

// Single active frontend: index.html + public/styles.css + public/app.js.
export default defineConfig({
  publicDir: 'public',
  build: { outDir: 'dist' },
});
