<template>
	<div id="app">
		<calendar-view
			:show-date="showDate"
			:items="items"
			:enable-date-selection="true"
			:selection-start="selectionStart"
			:selection-end="selectionEnd"
			:display-week-numbers="false"
			:item-top="themeOptions.top"
			:item-content-height="themeOptions.height"
			:item-border-height="themeOptions.border"
			:class="`theme-` + theme"
			:current-period-label="themeOptions.currentPeriodLabel"
			class="holiday-us-traditional holiday-us-official"
			@date-selection-start="setSelection"
			@date-selection="setSelection"
			@date-selection-finish="finishSelection"
		>
			<calendar-view-header
				slot="header"
				slot-scope="{ headerProps }"
				:header-props="headerProps"
				:previous-year-label="themeOptions.previousYearLabel"
				:previous-period-label="themeOptions.previousPeriodLabel"
				:next-period-label="themeOptions.nextPeriodLabel"
				:next-year-label="themeOptions.nextYearLabel"
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
			const endDay = Math.floor(Math.random() * 4) + startDay
			var d = new Date()
			var i = {
				id: index,
				title: "Event " + (index + 1),
				startDate: Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), startDay),
				endDate: Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), endDay),
				classes: Math.random() > 0.9 ? ["custom-date-class-red"] : null,
			}
			return i
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

.cv-item.custom-date-class-red {
	background-color: #ff6666;
}
</style>
