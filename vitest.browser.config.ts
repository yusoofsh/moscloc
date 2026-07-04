import path from "node:path"
import react from "@vitejs/plugin-react"
import { playwright } from "@vitest/browser-playwright"
import { defineConfig } from "vitest/config"

export default defineConfig({
	plugins: [react()],
	resolve: {
		alias: { "~": path.resolve(__dirname, "./src") },
		dedupe: ["react", "react-dom"],
	},
	optimizeDeps: {
		include: [
			"@tanstack/react-router-devtools",
			"class-variance-authority",
			"clsx",
			"radix-ui",
			"tailwind-merge",
		],
	},
	test: {
		globals: true,
		setupFiles: ["./src/__tests__/setup.browser.ts"],
		include: ["src/components/**/*.test.tsx"],
		browser: {
			enabled: true,
			provider: playwright(),
			instances: [{ browser: "chromium" }],
			headless: true,
		},
	},
})
