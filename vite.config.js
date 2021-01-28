import vue from "@vitejs/plugin-vue"
const path = require("path")

module.exports = {
	plugins: [vue()],
	build: {
		cssCodeSplit: true,
		sourcemap: true,
		lib: {
			entry: path.resolve(__dirname, "src/components/bundle.js"),
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
}
