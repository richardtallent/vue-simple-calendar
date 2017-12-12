module.exports = {
	env: {
		browser: true,
		es6: true,
	},
	globals: {
		Vue: true,
	},
	extends: [
		"eslint:recommended",
		"plugin:vue/recommended"
	],
	rules: {
		"vue/html-indent": "tab",
		"vue/max-attributes-per-line": 3,
		"no-console": "warn"
	},
}