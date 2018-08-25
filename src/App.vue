<template>
  <div id="app">
		<calendar-view
			:show-date="showDate"
			class="theme-default holiday-us-traditional holiday-us-official"
			@show-date-change="setShowDate"
		/>
  </div>
</template>

<script>
import CalendarView from "./components/CalendarView.vue"
import CalendarViewHeader from "./components/CalendarViewHeader.vue"

export default {
	name: "CalendarDemoApp",
	components: {
		CalendarView,
		CalendarViewHeader,
	},
	data: function() {
		return { showDate: new Date() }
	},
	methods: {
		setShowDate(d) {
			this.showDate = d
		},
	},
}
</script>

<style lang="scss">
@import "../static/css/default.css";
@import "../static/css/holidays-us.css";

div#app {
	display: flex;
	height: 80vh;
	width: 80vw;
	margin-left: 10vw;
}
</style>
