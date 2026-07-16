import path from "node:path"
import react from "@vitejs/plugin-react"
import { defineConfig } from "vitest/config"

export default defineConfig({
	plugins: [react()],
	resolve: {
		alias: { "~": path.resolve(__dirname, "./src") },
	},
	test: {
		globals: true,
		environment: "jsdom",
		setupFiles: ["./src/__tests__/setup.ts", "./src/__tests__/setup.unit.ts"],
		include: [
			"src/services/**/*.test.ts",
			"src/hooks/**/*.test.ts",
			"src/contexts/**/*.test.tsx",
			"src/lib/**/*.test.ts",
		],
		exclude: [
			"node_modules",
			"dist",
			"tests/**",
			"src/components/**/*.test.tsx",
		],
		coverage: {
			provider: "v8",
			reporter: ["text", "json-summary", "html", "lcov"],
			reportsDirectory: "./coverage/unit",
			include: [
				"src/contexts/**/*.{ts,tsx}",
				"src/hooks/**/*.{ts,tsx}",
				"src/lib/**/*.{ts,tsx}",
				"src/services/**/*.{ts,tsx}",
			],
			exclude: [
				"node_modules",
				"src/__tests__/**",
				"src/routeTree.gen.ts",
				"**/*.d.ts",
				"**/*.test.{ts,tsx}",
			],
			thresholds: {
				statements: 80,
				branches: 75,
				functions: 75,
				lines: 80,
			},
		},
	},
})
