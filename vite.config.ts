import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import dts from "vite-plugin-dts";

export default defineConfig({
  server: {
    port: 3000,
  },
  plugins: [
    react(),
    dts({
      include: ["src/components", "src/index.ts"],
      outDir: "dist",
      insertTypesEntry: true,
      copyDtsFiles: true,
    }),
  ],
  build: {
    cssCodeSplit: false,
    lib: {
      entry: "src/index.ts",
      name: "ReactImageInspector",
      formats: ["es", "cjs"],
      fileName: (format) => (format === "es" ? "index.js" : "index.cjs"),
      cssFileName: "index",
    },
    rollupOptions: {
      external: ["react", "react-dom", "react/jsx-runtime"],
    },
  },
  test: {
    environment: "node",
    include: ["src/**/*.test.ts"],
  },
});
