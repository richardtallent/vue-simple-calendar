<template>
	<div id="app">
		<calendar-view
			:show-date="state.showDate"
			:items="state.items"
			:enable-date-selection="true"
			:selection-start="state.selectionStart"
			:selection-end="state.selectionEnd"
			:display-week-numbers="false"
			:enable-drag-drop="true"
			:item-top="themeOptions.top"
			:item-content-height="themeOptions.height"
			:item-border-height="themeOptions.border"
			:class="`theme-${state.theme}`"
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
<script setup lang="ts">
import { computed, onMounted, reactive } from "vue"
import CalendarView from "./CalendarView.vue"
import CalendarViewHeader from "./CalendarViewHeader.vue"
import { ICalendarItem, INormalizedCalendarItem } from "./ICalendarItem"
import CalendarMath from "./CalendarMath"

class AppState {
	showDate: Date = new Date()
	selectionStart?: Date = undefined
	selectionEnd?: Date = undefined
	theme: string = "gcal"
	items: Array<ICalendarItem> = []
}

const state = reactive(new AppState())

const themeOptions = computed((): any =>
	state.theme == "gcal"
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
)

const setShowDate = (d: Date) => (state.showDate = d)

const setSelection = (dateRange: Date[]) => {
	state.selectionEnd = dateRange[1]
	state.selectionStart = dateRange[0]
}

const finishSelection = (dateRange: Date[]) => setSelection(dateRange)

const getRandomEvent = (index: number): ICalendarItem => {
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
}

const onDrop = (item: INormalizedCalendarItem, date: Date) => {
	// Determine the delta between the old start date and the date chosen,
	// and apply that delta to both the start and end date to move the item.
	const eLength = CalendarMath.dayDiff(item.startDate, date)
	item.originalItem.startDate = CalendarMath.addDays(item.startDate, eLength)
	item.originalItem.endDate = CalendarMath.addDays(item.endDate, eLength)
}

onMounted(() => (state.items = [...Array(25)].map((_, i) => getRandomEvent(i))))
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
