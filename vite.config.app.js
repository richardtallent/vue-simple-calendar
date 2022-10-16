import { defineConfig } from "vite"
import vue from "@vitejs/plugin-vue"
const path = require("path")

// Swap this config file with the other one to build the example app instead of the library.

export default defineConfig({
	plugins: [vue()],
	base: "./",
	build: {
		sourcemap: false,
		rollupOptions: {
			output: {
				globals: {
					vue: "Vue",
				},
			},
		},
	},
})
