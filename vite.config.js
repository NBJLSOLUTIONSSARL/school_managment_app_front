import path from "node:path"
import { fileURLToPath } from "node:url"
import react from "@vitejs/plugin-react"
import { defineConfig, loadEnv } from "vite"
import tailwindcss from "@tailwindcss/vite"

const __dirname = path.dirname(fileURLToPath(import.meta.url))

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), "")

  return {
    base: env.VITE_BASE_PATH || "/",
    plugins: [react(), tailwindcss()],
    resolve: {
      alias: {
        "@": path.resolve(__dirname, "./src"),
      },
    },
    server: {
      port: Number(env.VITE_DEV_PORT) || 3000,
      proxy: {
        "/api": { target: "http://localhost:8080", changeOrigin: true },
        "/ws": { target: "http://localhost:8080", ws: true, changeOrigin: true },
      },
    },
    build: {
      sourcemap: env.VITE_BUILD_SOURCEMAP === "true",
      rollupOptions: {
        output: {
          manualChunks(id) {
            if (id.includes('node_modules')) {
              if (id.includes('lucide-react')) return 'icons'
              if (id.includes('yup')) return 'validation'
              return 'vendor'
            }
          },
        },
      },
    },
    test: {
      environment: "jsdom",
      globals: true,
      setupFiles: "./src/test/setup.js",
      clearMocks: true,
    },
  }
})
