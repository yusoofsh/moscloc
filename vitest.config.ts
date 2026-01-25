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
			enabled: true,
			reporter: ["text", "json", "html", "lcov"],
			reportsDirectory: "./coverage",
			include: ["src/**/*.{ts,tsx}"],
			exclude: [
				"node_modules",
				"src/__tests__/**",
				"src/routeTree.gen.ts",
				"src/main.tsx",
				"**/*.d.ts",
				"**/*.test.{ts,tsx}",
			],
			thresholds: {
				statements: 20,
				branches: 5,
				functions: 10,
				lines: 20,
			},
		},
	},
})
