const webpack = require("webpack")
const path = require("path")
const merge = require("webpack-merge")
const CopyWebpackPlugin = require("copy-webpack-plugin")

var commonConfig = {
	output: {
		path: path.resolve(__dirname + "/dist/"),
	},
	module: {
		loaders: [
			{
				test: /\.js$/,
				loader: "babel-loader",
				exclude: /node_modules/,
			},
			{
				test: /\.vue$/,
				loader: "vue-loader",
			},
		],
	},
	externals: {
		vue: "vue",
	},
	plugins: [
		new webpack.optimize.UglifyJsPlugin({
			minimize: true,
			sourceMap: false,
			mangle: true,
			compress: {
				warnings: false,
			},
		}),
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
			library: "CalendarMonth",
		},
	}),

	// Config 2: For Node-based development environments
	merge(commonConfig, {
		entry: path.resolve(__dirname + "/src/CalendarMonth.vue"),
		output: {
			filename: "vue-simple-calendar.js",
			libraryTarget: "umd",
			library: "CalendarMonth",
			umdNamedDefine: true,
		},
	}),
]
