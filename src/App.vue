<template>
	<div id="app">
		<calendar-view
			:show-date="showDate"
			:items="items"
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
			items: Array(5)
				.fill()
				.map((_, i) => this.getRandomEvent(i)),
		}
	},
	methods: {
		setShowDate(d) {
			this.showDate = d
		},
		getRandomEvent(index) {
			const startDay = Math.floor(Math.random() * 28 + 1)
			const endDay = Math.floor(Math.random() * 9 + 1) + startDay
			var d = new Date()
			return {
				title: "Event " + (index + 1),
				startDate: Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), startDay),
				endDate: Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), endDay),
			}
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
