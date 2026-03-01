import { defineConfig } from "vite";
import { resolve } from "path";

export default defineConfig({
  base: "./",
  server: {
    host: "0.0.0.0",
    port: 5173,
  },
  build: {
    assetsDir: "vite-scripts", // <-- LA SOLUTION POUR ÉVITER LE CONFLIT
    rollupOptions: {
      input: {
        main: resolve(__dirname, 'index.html'),
        garage: resolve(__dirname, 'garage.html'),
        play: resolve(__dirname, 'play.html')
      }
    }
  }
});