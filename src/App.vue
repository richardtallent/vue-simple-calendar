<template>
	<div id="app">
		<calendar-view
			:show-date="showDate"
			:items="items"
			:enable-date-selection="true"
			:selection-start="selectionStart"
			:selection-end="selectionEnd"
			:displayWeekNumbers="false"
			:itemTop="themeOptions.top"
			:itemContentHeight="themeOptions.height"
			:itemBorderHeight="themeOptions.border"
			:class="`theme-` + theme"
			:currentPeriodLabel="themeOptions.currentPeriodLabel"
			@date-selection-start="setSelection"
			@date-selection="setSelection"
			@date-selection-finish="finishSelection"
			class="holiday-us-traditional holiday-us-official"
		>
			<calendar-view-header
				slot="header"
				slot-scope="{ headerProps }"
				:header-props="headerProps"
				:previousYearLabel="themeOptions.previousYearLabel"
				:previousPeriodLabel="themeOptions.previousPeriodLabel"
				:nextPeriodLabel="themeOptions.nextPeriodLabel"
				:nextYearLabel="themeOptions.nextYearLabel"
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
			selectionStart: null,
			selectionEnd: null,
			theme: "gcal",
			items: Array(25)
				.fill()
				.map((_, i) => this.getRandomEvent(i)),
		}
	},
	computed: {
		themeOptions() {
			return this.theme == "gcal"
				? {
						top: "2.6em",
						height: "2.1em",
						border: "0px",
						previousYearLabel: "\uE5CB\uE5CB",
						previousPeriodLabel: "\uE5CB",
						nextPeriodLabel: "\uE5CC",
						nextYearLabel: "\uE5CC\uE5CC",
						currentPeriodLabel: "Today",
				  }
				: {
						top: "1.4em",
						height: "1.4em",
						border: "2px",
						previousYearLabel: "<<",
						previousPeriodLabel: "<",
						nextPeriodLabel: ">",
						nextYearLabel: ">>",
						currentPeriodLabel: "",
				  }
		},
	},
	methods: {
		setShowDate(d) {
			this.showDate = d
		},
		setSelection(dateRange) {
			this.selectionEnd = dateRange[1]
			this.selectionStart = dateRange[0]
		},
		finishSelection(dateRange) {
			this.setSelection(dateRange)
		},
		getRandomEvent(index) {
			const startDay = Math.floor(Math.random() * 28 + 1)
			const endDay = Math.floor(Math.random() * 4 + 1) + startDay
			var d = new Date()
			return {
				id: index,
				title: "Event " + (index + 1),
				startDate: Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), startDay),
				endDate: Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), endDay),
			}
		},
	},
}
</script>

<style lang="scss">
@import "../static/css/gcal.css";
//@import "../static/css/default.css";
@import "../static/css/holidays-us.css";

div#app {
	font-family: Avenir, Arial, Helvetica, sans-serif;
	display: flex;
	height: 87vh;
	width: 87vw;
	margin-left: 6vw;
}
</style>
