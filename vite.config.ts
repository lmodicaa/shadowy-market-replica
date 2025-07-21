import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import viteCompression from "vite-plugin-compression";
import runtimeErrorOverlay from "@replit/vite-plugin-runtime-error-modal";
import { cartographer } from "@replit/vite-plugin-cartographer";

import { fileURLToPath } from "url";
import path from "path";

// Definición de __dirname en ES module
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const isDev = process.env.NODE_ENV !== "production";

export default defineConfig({
  plugins: [
    react(),
    runtimeErrorOverlay(),
    viteCompression({
      verbose: true,
      disable: false,
      threshold: 10240, // archivos >10kb
      algorithm: "brotliCompress", // o 'gzip'
      ext: ".br", // o '.gz'
    }),
    ...(isDev && process.env.REPL_ID !== undefined ? [cartographer()] : []),
  ],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "client", "src"),
      "@shared": path.resolve(__dirname, "shared"),
      "@assets": path.resolve(__dirname, "attached_assets"),
    },
  },
  root: path.resolve(__dirname, "client"),
  build: {
    target: "es2020", // solo navegadores modernos
    outDir: path.resolve(__dirname, "dist/public"),
    emptyOutDir: true,
    minify: "esbuild", // rápido y eficiente
    sourcemap: false,
    cssCodeSplit: true,
    assetsInlineLimit: 4096, // imágenes pequeñas embebidas
    rollupOptions: {
      output: {
        manualChunks: {
          react: ["react", "react-dom"],
        },
      },
      treeshake: {
        moduleSideEffects: false,
      },
    },
  },
});
