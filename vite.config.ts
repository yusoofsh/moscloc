import path from "node:path"
import tailwindcss from "@tailwindcss/vite"
import tanstackRouter from "@tanstack/router-plugin/vite"
import react from "@vitejs/plugin-react"
import { defineConfig } from "vite"

export default defineConfig({
	build: { outDir: "dist" },
	plugins: [
		tanstackRouter({
			autoCodeSplitting: true,
			quoteStyle: "double",
			semicolons: true,
		}),
		react(),
		tailwindcss(),
	],
	resolve: {
		alias: {
			"~": path.resolve(__dirname, "./src"),
		},
	},
})
