import { defineConfig } from "vitest/config"

// Separate from vite.config.js so tests don't run the library build plugins
export default defineConfig({
	test: {
		environment: "node",
		include: ["test/**/*.test.ts"],
	},
})
