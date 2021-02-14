<template>
	<div id="app">
		<calendar-view
			:show-date="showDate"
			:items="items"
			:enable-date-selection="true"
			:selection-start="selectionStart"
			:selection-end="selectionEnd"
			:display-week-numbers="false"
			:enable-drag-drop="true"
			:item-top="themeOptions.top"
			:item-content-height="themeOptions.height"
			:item-border-height="themeOptions.border"
			:class="`theme-` + theme"
			:current-period-label="themeOptions.currentPeriodLabel"
			class="holiday-us-traditional holiday-us-official"
			@date-selection-start="setSelection"
			@date-selection="setSelection"
			@date-selection-finish="finishSelection"
			@drop-on-date="onDrop"
		>
			<template #header="{ headerProps }">
				<calendar-view-header
					:header-props="headerProps"
					:previous-year-label="themeOptions.previousYearLabel"
					:previous-period-label="themeOptions.previousPeriodLabel"
					:next-period-label="themeOptions.nextPeriodLabel"
					:next-year-label="themeOptions.nextYearLabel"
					@input="setShowDate"
				/>
			</template>
		</calendar-view>
	</div>
</template>

<script lang="ts">
import { defineComponent } from "vue"
import CalendarView from "./CalendarView.vue"
import CalendarViewHeader from "./CalendarViewHeader.vue"
import { ICalendarItem, INormalizedCalendarItem } from "./ICalendarItem"
import CalendarMath from "./CalendarMath"

class AppState {
	showDate: Date = new Date()
	selectionStart: Date | null = null
	selectionEnd: Date | null = null
	theme: string = "gcal"
	items: Array<ICalendarItem> = []
}

export default defineComponent({
	name: "CalendarDemoApp",
	components: {
		CalendarView,
		CalendarViewHeader,
	},
	data: () => new AppState(),
	computed: {
		themeOptions(): any {
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
	mounted() {
		this.items = [...Array(25)].map((_, i) => this.getRandomEvent(i))
	},
	methods: {
		setShowDate(d: Date) {
			this.showDate = d
		},
		setSelection(dateRange: Array<Date>) {
			this.selectionEnd = dateRange[1]
			this.selectionStart = dateRange[0]
		},
		finishSelection(dateRange: Array<Date>) {
			this.setSelection(dateRange)
		},
		getRandomEvent(index: number): ICalendarItem {
			const startDay = Math.floor(Math.random() * 28 + 1)
			const endDay = Math.floor(Math.random() * 4) + startDay
			var d = new Date()
			var i = {
				id: index.toString(),
				title: "Event " + (index + 1),
				startDate: new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), startDay)),
				endDate: new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), endDay)),
				classes: Math.random() > 0.9 ? ["custom-date-class-red"] : null,
			}
			return i
		},
		onDrop(item: INormalizedCalendarItem, date: Date) {
			// Determine the delta between the old start date and the date chosen,
			// and apply that delta to both the start and end date to move the item.
			const eLength = CalendarMath.dayDiff(item.startDate, date)
			item.originalItem.startDate = CalendarMath.addDays(item.startDate, eLength)
			item.originalItem.endDate = CalendarMath.addDays(item.endDate, eLength)
		},
	},
})
</script>

<style>
@import "../static/css/gcal.css";

/* @import "../static/css/default.css"; */
@import "../static/css/holidays-us.css";

div#app {
	font-family: Avenir, Arial, Helvetica, sans-serif;
	display: flex;
	height: 87vh;
	width: 87vw;
	margin-left: auto;
	margin-right: auto;
}

.cv-item.custom-date-class-red {
	background-color: #f66;
}
</style>
