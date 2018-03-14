const path = require("path")
const merge = require("webpack-merge")
const CopyWebpackPlugin = require("copy-webpack-plugin")

var commonConfig = {
	mode: "production",
	module: {
		rules: [
			{
				test: /\.js$/,
				exclude: /node_modules/,
				use: {
					loader: "babel-loader",
				},
			},
			{
				test: /\.vue$/,
				use: {
					loader: "vue-loader",
				},
			},
		],
	},
	externals: {
		vue: "vue",
	},
	plugins: [
		// copy custom static assets
		new CopyWebpackPlugin([
			{
				from: path.resolve(__dirname + "/static"),
				to: path.resolve(__dirname + "/dist/static"),
				ignore: [".*"],
			},
		]),
	],
}

module.exports = [
	// Config 1: For browser environment
	merge(commonConfig, {
		entry: path.resolve(__dirname + "/src/plugin.js"),
		output: {
			filename: "calendar-month.min.js",
			libraryTarget: "window",
			library: "CalendarView",
		},
	}),

	// Config 2: For Node-based development environments
	merge(commonConfig, {
		entry: path.resolve(__dirname + "/src/CalendarView.vue"),
		output: {
			filename: "vue-simple-calendar.js",
			libraryTarget: "umd",
			library: "CalendarView",
			umdNamedDefine: true,
		},
	}),

	// Config 3: Separate export of the mixin for external node use
	merge(commonConfig, {
		entry: path.resolve(__dirname + "/src/CalendarMathMixin.js"),
		output: {
			filename: "calendar-math-mixin.js",
			libraryTarget: "umd",
			library: "CalendarMathMixin",
			umdNamedDefine: true,
		},
	}),
]
