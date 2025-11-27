import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  server: {
    port: 8080,
    proxy: {
      "/api": {
        target: "https://jujuyconecta.com", // o https://www.jujuyconecta.com o el .vercel.app que no redirija
        changeOrigin: true,
        secure: true,
      }, 
    }
  },
  plugins: [react()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
}));
