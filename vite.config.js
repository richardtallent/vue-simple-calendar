import { defineConfig } from "vite"
import vue from "@vitejs/plugin-vue"
//import typescript from "rollup-plugin-typescript2"
const path = require("path")

export default defineConfig({
	plugins: [vue()],
	build: {
		sourcemap: false,
		//esbuild: false,
		lib: {
			entry: path.resolve(__dirname, "lib/main.ts"),
			name: "CalendarView",
		},
		rollupOptions: {
			// make sure to externalize deps that shouldn't be bundled into your library
			external: ["vue"],
			output: {
				// Provide global variables to use in the UMD build for externalized deps
				globals: {
					vue: "Vue",
				},
			},
		},
	},
})
