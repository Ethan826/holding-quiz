import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";

export default defineConfig({
  base: "/holding-quiz/", // Match your repository name for GitHub Pages
  build: {
    outDir: "dist", // Default build directory
  },
  plugins: [react()],
});
