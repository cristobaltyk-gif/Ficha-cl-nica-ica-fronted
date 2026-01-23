import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],

  // 👉 proyecto en ROOT (sin src/)
  root: ".",

  resolve: {
    extensions: [".js", ".jsx"],
  },

  build: {
    outDir: "dist",
    emptyOutDir: true,
  },
});
