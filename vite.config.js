import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      // Ez a beállítás feloldja a @/ hivatkozásokat a projekt gyökerére,
      // így ha a kódodban valahol maradna ilyen útvonal, a Vite tudni fogja, hova nyúljon.
      "@": path.resolve(__dirname, "./"),
    },
    // Biztosítjuk, hogy minden releváns kiterjesztést felismerjen a rendszer
    extensions: ['.mjs', '.js', '.mts', '.ts', '.jsx', '.tsx', '.json']
  },
  build: {
    outDir: 'dist',
    sourcemap: false,
    // A CommonJS modulok (mint a régebbi Firebase könyvtárak) kezelése
    commonjsOptions: {
      include: [/node_modules/],
      transformMixedEsModules: true,
    },
  },
  server: {
    port: 3000,
  }
});
