import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";

export default defineConfig({
  base: "/holding-quiz/",
  plugins: [react()],
});
