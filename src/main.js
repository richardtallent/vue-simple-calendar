import Vue from "vue"
import App from "./App.vue"

// This is the entry point for vue-cli serve, it shows a minimal demo calendar for
// hot-reloaded testing.

Vue.config.productionTip = false

new Vue({
	render: (h) => h(App),
}).$mount("#app")
