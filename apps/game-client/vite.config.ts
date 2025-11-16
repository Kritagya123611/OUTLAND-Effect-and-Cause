import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  build: {
    lib: {
      entry: "src/main.ts",
      name: "GameClient",
      fileName: () => "bundle.js",
      formats: ["iife"], // React loads it as a <script>
    },
  },
});
