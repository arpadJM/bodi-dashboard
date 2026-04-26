import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  resolve: {
    // Ez segít, ha a kódodban kiterjesztés nélkül hivatkozol fájlokra
    extensions: ['.js', '.jsx', '.json']
  },
  build: {
    outDir: 'dist',
    // Biztosítjuk, hogy a JSX feldolgozás ne akadjon el
    commonjsOptions: {
      transformMixedEsModules: true,
    },
  },
  server: {
    port: 3000,
  }
});
