import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      // Ez a legfontosabb: a @ jelet a főkönyvtárra irányítjuk
      "@": path.resolve(__dirname, "./"),
    },
    extensions: ['.mjs', '.js', '.mts', '.ts', '.jsx', '.tsx', '.json']
  },
  build: {
    outDir: 'dist',
    sourcemap: false,
    commonjsOptions: {
      include: [/node_modules/],
      transformMixedEsModules: true,
    },
  }
});
