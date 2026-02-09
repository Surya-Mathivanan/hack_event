import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  server: {
    port: 5173,
    proxy: process.env.NODE_ENV === 'development' ? {
      "/api": {
        target: "http://localhost:3000",
        changeOrigin: true,
      },
    } : undefined,
  },
  build: {
    outDir: "dist",
    emptyOutDir: true,
    rollupOptions: {
      external: [
        'drizzle-orm',
        'drizzle-orm/pg-core',
        'drizzle-zod'
      ],
      onwarn(warning, warn) {
        // Suppress warnings about drizzle-orm imports
        if (warning.code === 'UNRESOLVED_IMPORT' && warning.message.includes('drizzle')) {
          return;
        }
        warn(warning);
      }
    }
  },
});
