import { fileURLToPath, URL } from "node:url"
import tailwindcss from "@tailwindcss/vite"
import { devtools } from "@tanstack/devtools-vite"
import { tanstackStart } from "@tanstack/react-start/plugin/vite"
import viteReact from "@vitejs/plugin-react"
import { nitro } from "nitro/vite"
import { defineConfig } from "vite"

const config = defineConfig({
  resolve: {
    tsconfigPaths: true,
    alias: {
      "@": fileURLToPath(new URL("./src", import.meta.url))
    }
  },
  plugins: [
    devtools(),
    nitro({ preset: "node-server" }),
    tailwindcss(),
    tanstackStart({
      srcDirectory: "src",
      router: {
        routeToken: "layout",
        routesDirectory: "app",
        quoteStyle: "double"
      }
    }),
    viteReact()
  ]
})

export default config
