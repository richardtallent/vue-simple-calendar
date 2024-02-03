<template>
	<div id="example-simple">
		<CalendarView
			:show-date="state.showDate"
			:items="state.items"
			:enable-date-selection="true"
			:selection-start="state.selectionStart"
			:selection-end="state.selectionEnd"
			:starting-day-of-week="1"
			:enable-drag-drop="true"
			:item-top="themeOptions.top"
			:item-content-height="themeOptions.height"
			:item-border-height="themeOptions.border"
			:class="`theme-${state.theme}`"
			:current-period-label="themeOptions.currentPeriodLabel"
			:show-times="true"
			:display-week-numbers="true"
			class="holiday-us-traditional holiday-us-official holiday-ue"
			@date-selection-start="setSelection"
			@date-selection="setSelection"
			@date-selection-finish="finishSelection"
			@drop-on-date="onDrop"
		>
			<template #header="{ headerProps }">
				<CalendarViewHeader
					:header-props
					:previous-year-label="themeOptions.previousYearLabel"
					:previous-period-label="themeOptions.previousPeriodLabel"
					:next-period-label="themeOptions.nextPeriodLabel"
					:next-year-label="themeOptions.nextYearLabel"
					@input="setShowDate"
				/>
			</template>
		</CalendarView>
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
	items: ICalendarItem[] = []
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
	const endDay = Math.floor(Math.random() * 3) + startDay
	var d = new Date()
	var i = {
		id: index.toString(),
		title: "Event " + (index + 1),
		startDate: new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), startDay)),
		endDate: new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), endDay)),
		classes: Math.random() > 0.9 ? ["custom-date-class-red"] : null,
	}
	if (startDay === endDay) {
		const eightAM = 8
		const timeRange = 12
		const startTime = startDay === endDay ? (eightAM + Math.floor(Math.random() * timeRange)) * 60 * 60 * 1000 : 0
		const endTime = startTime + Math.floor(Math.random() * 3) * 60 * 60 * 1000
		i.startDate = new Date(i.startDate.getTime() + startTime)
		i.startDate = new Date(i.endDate.getTime() + endTime)
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
/* For apps using the npm package, the below URLs should reference /node_modules/vue-simple-calendar/dist/css/ instead */
@import "/css/default.css";
@import "/css/gcal.css";
@import "/css/holidays-us.css";
@import "/css/holidays-ue.css";

#example-simple {
	font-family: Avenir, Arial, Helvetica, sans-serif;
	display: flex;
	flex-direction: column;
	height: 85vh;
	width: 96vw;
	margin-left: auto;
	margin-right: auto;
}

#example-simple .cv-item.custom-date-class-red {
	background-color: #f66;
}
</style>
