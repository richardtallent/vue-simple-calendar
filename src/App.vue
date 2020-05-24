<template>
	<div id="app">
		<calendar-view
			:show-date="showDate"
			:events="events"
			class="theme-default holiday-us-traditional holiday-us-official"
		>
			<calendar-view-header
				slot="header"
				slot-scope="{ headerProps }"
				:header-props="headerProps"
				@input="setShowDate"
			/>
		</calendar-view>
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
	data: function () {
		return {
			showDate: new Date(),
			events: [
				{
					id: 1,
					title: "test",
					startDate: "2020-03-31",
					endDate: "2020-03-31",
				},
			],
		}
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
	height: 87vh;
	width: 87vw;
	margin-left: 6vw;
}
</style>
