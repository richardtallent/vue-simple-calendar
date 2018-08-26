import Vue from "vue"
import CalendarView from "./CalendarView.vue"
import CalendarViewHeader from "./CalendarViewHeader.vue"
import CalendarMathMixin from "./CalendarMathMixin.js"
Vue.config.productionTip = false

const Components = {
	CalendarView: CalendarView,
	CalendarViewHeader: CalendarViewHeader,
}

Object.keys(Components).forEach(name => {
	Vue.component(name, Components[name])
})

// Export the compiled Vue components, and also the mixin for those who wish to use
// those methods in their own custom headers, etc.
export { CalendarView, CalendarViewHeader, CalendarMathMixin }
