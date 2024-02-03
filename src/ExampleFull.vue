<template>
	<div id="example-full">
		<div class="calendar-controls">
			<div v-if="state.message" class="notification is-success">{{ state.message }}</div>

			<div class="box">
				<h4 class="title is-5">Play with the options!</h4>

				<div class="field">
					<label class="label">Period UOM</label>
					<div class="control">
						<div class="select">
							<select v-model="state.displayPeriodUom">
								<option>month</option>
								<option>week</option>
								<option>year</option>
							</select>
						</div>
					</div>
				</div>

				<div class="field">
					<label class="label">Period Count</label>
					<div class="control">
						<div class="select">
							<select v-model="state.displayPeriodCount">
								<option :value="1">1</option>
								<option :value="2">2</option>
								<option :value="3">3</option>
							</select>
						</div>
					</div>
				</div>

				<div class="field">
					<label class="label">Starting day of the week</label>
					<div class="control">
						<div class="select">
							<select v-model="state.startingDayOfWeek">
								<option v-for="(d, index) in dayNames" :key="index" :value="index">
									{{ d }}
								</option>
							</select>
						</div>
					</div>
				</div>

				<div class="field">
					<label class="checkbox">
						<input v-model="state.useTodayIcons" type="checkbox" />
						Use icon for today's period
					</label>
				</div>

				<div class="field">
					<label class="checkbox">
						<input v-model="state.displayWeekNumbers" type="checkbox" />
						Show week number
					</label>
				</div>

				<div class="field">
					<label class="checkbox">
						<input v-model="state.showTimes" type="checkbox" />
						Show times
					</label>
				</div>

				<div class="field">
					<label class="label">Themes</label>
					<label class="checkbox">
						<input v-model="state.useDefaultTheme" type="checkbox" />
						Default
					</label>
				</div>

				<div class="field">
					<label class="checkbox">
						<input v-model="state.useHolidayTheme" type="checkbox" />
						Holidays
					</label>
				</div>
			</div>

			<div class="box">
				<div class="field">
					<label class="label">Title</label>
					<div class="control">
						<input v-model="state.newItemTitle" class="input" type="text" />
					</div>
				</div>

				<div class="field">
					<label class="label">Start date</label>
					<div class="control">
						<input v-model="state.newItemStartDate" class="input" type="date" />
					</div>
				</div>

				<div class="field">
					<label class="label">End date</label>
					<div class="control">
						<input v-model="state.newItemEndDate" class="input" type="date" />
					</div>
				</div>

				<button class="button is-info" @click="clickTestAddItem">Add Item</button>
			</div>
		</div>
		<div class="calendar-parent">
			<CalendarView
				:items="state.items"
				:show-date="state.showDate"
				:time-format-options="{ hour: 'numeric', minute: '2-digit' }"
				:enable-drag-drop="true"
				:disable-past="state.disablePast"
				:disable-future="state.disableFuture"
				:show-times="state.showTimes"
				:date-classes="myDateClasses()"
				:display-period-uom="state.displayPeriodUom"
				:display-period-count="state.displayPeriodCount"
				:starting-day-of-week="state.startingDayOfWeek"
				:class="themeClasses"
				:period-changed-callback="periodChanged"
				:current-period-label="state.useTodayIcons ? 'icons' : ''"
				:displayWeekNumbers="state.displayWeekNumbers"
				:enable-date-selection="true"
				:selection-start="state.selectionStart"
				:selection-end="state.selectionEnd"
				@date-selection-start="setSelection"
				@date-selection="setSelection"
				@date-selection-finish="finishSelection"
				@drop-on-date="onDrop"
				@click-date="onClickDay"
				@click-item="onClickItem"
			>
				<template #header="{ headerProps }">
					<CalendarViewHeader :header-props @input="setShowDate" />
				</template>
			</CalendarView>
		</div>
	</div>
</template>
<script setup lang="ts">
// Using the publish version, you would do this instead:
// import { CalendarView, CalendarViewHeader, CalendarMath } from "vue-simple-calendar"
import CalendarView from "../../vue-simple-calendar/src/CalendarView.vue"
import CalendarViewHeader from "../../vue-simple-calendar/src/CalendarViewHeader.vue"
import CalendarMath from "../../vue-simple-calendar/src/CalendarMath"
import { ICalendarItem, INormalizedCalendarItem } from "./ICalendarItem"

import { onMounted, reactive, computed } from "vue"

const thisMonth = (d: number, h?: number, m?: number): Date => {
	const t = new Date()
	return new Date(t.getFullYear(), t.getMonth(), d, h || 0, m || 0)
}

interface IExampleState {
	showDate: Date
	message: string
	startingDayOfWeek: number
	disablePast: boolean
	disableFuture: boolean
	displayPeriodUom: string
	displayPeriodCount: number
	displayWeekNumbers: boolean
	showTimes: boolean
	selectionStart?: Date
	selectionEnd?: Date
	newItemTitle: string
	newItemStartDate: string
	newItemEndDate: string
	useDefaultTheme: boolean
	useHolidayTheme: boolean
	useTodayIcons: boolean
	items: ICalendarItem[]
}

const state = reactive({
	/* Show the current month, and give it some fake items to show */
	showDate: thisMonth(1),
	message: "",
	startingDayOfWeek: 0,
	disablePast: false,
	disableFuture: false,
	displayPeriodUom: "month",
	displayPeriodCount: 1,
	displayWeekNumbers: false,
	showTimes: true,
	selectionStart: undefined,
	selectionEnd: undefined,
	newItemTitle: "",
	newItemStartDate: "",
	newItemEndDate: "",
	useDefaultTheme: true,
	useHolidayTheme: true,
	useTodayIcons: false,
	items: [
		/*{
			id: "e0",
			startDate: "2018-01-05",
		},*/
		{
			id: "e1",
			startDate: thisMonth(15, 18, 30),
		},
		{
			id: "e2",
			startDate: thisMonth(15),
			title: "Single-day item with a long title",
		},
		{
			id: "e3",
			startDate: thisMonth(7, 9, 25),
			endDate: thisMonth(10, 16, 30),
			title: "Multi-day item with a long title and times",
		},
		{
			id: "e4",
			startDate: thisMonth(20),
			title: "My Birthday!",
			classes: "birthday",
			url: "https://en.wikipedia.org/wiki/Birthday",
		},
		{
			id: "e5",
			startDate: thisMonth(5),
			endDate: thisMonth(12),
			title: "Multi-day item",
			classes: "purple",
			tooltip: "This spans multiple days",
		},
		{
			id: "foo",
			startDate: thisMonth(29),
			title: "Same day 1",
		},
		{
			id: "e6",
			startDate: thisMonth(29),
			title: "Same day 2",
			classes: "orange",
		},
		{
			id: "e7",
			startDate: thisMonth(29),
			title: "Same day 3",
		},
		{
			id: "e8",
			startDate: thisMonth(29),
			title: "Same day 4",
			classes: "orange",
		},
		{
			id: "e9",
			startDate: thisMonth(29),
			title: "Same day 5",
		},
		{
			id: "e10",
			startDate: thisMonth(29),
			title: "Same day 6",
			classes: "orange",
		},
		{
			id: "e11",
			startDate: thisMonth(29),
			title: "Same day 7",
		},
	],
} as IExampleState)

const userLocale = computed((): string => CalendarMath.getDefaultBrowserLocale())

const dayNames = computed((): string[] => CalendarMath.getFormattedWeekdayNames(userLocale.value, "long", 0))

const themeClasses = computed(() => ({
	"theme-default": state.useDefaultTheme,
	"holiday-us-traditional": state.useHolidayTheme,
	"holiday-us-official": state.useHolidayTheme,
}))

const myDateClasses = (): Record<string, string[]> => {
	// This was added to demonstrate the dateClasses prop. Note in particular that the
	// keys of the object are `yyyy-mm-dd` ISO date strings (not dates), and the values
	// for those keys are strings or string arrays. Keep in mind that your CSS to style these
	// may need to be fairly specific to make it override your theme's styles. See the
	// CSS at the bottom of this component to see how these are styled.
	const o = {} as Record<string, string[]>
	const theFirst = thisMonth(1)
	const ides = [2, 4, 6, 9].includes(theFirst.getMonth()) ? 15 : 13
	const idesDate = thisMonth(ides)
	o[CalendarMath.isoYearMonthDay(idesDate)] = ["ides"]
	o[CalendarMath.isoYearMonthDay(thisMonth(21))] = ["do-you-remember", "the-21st"]
	return o
}

onMounted((): void => {
	state.newItemStartDate = CalendarMath.isoYearMonthDay(CalendarMath.today())
	state.newItemEndDate = CalendarMath.isoYearMonthDay(CalendarMath.today())
})

const periodChanged = (): void => {
	// range, eventSource) {
	// Demo does nothing with this information, just including the method to demonstrate how
	// you can listen for changes to the displayed range and react to them (by loading items, etc.)
	//console.log(eventSource)
	//console.log(range)
}

const onClickDay = (d: Date): void => {
	state.selectionStart = undefined
	state.selectionEnd = undefined
	state.message = `You clicked: ${d.toLocaleDateString()}`
}

const onClickItem = (item: INormalizedCalendarItem): void => {
	state.message = `You clicked: ${item.title}`
}

const setShowDate = (d: Date): void => {
	state.message = `Changing calendar view to ${d.toLocaleDateString()}`
	state.showDate = d
}

const setSelection = (dateRange: Date[]): void => {
	state.selectionEnd = dateRange[1]
	state.selectionStart = dateRange[0]
}

const finishSelection = (dateRange: Date[]): void => {
	setSelection(dateRange)
	state.message = `You selected: ${state.selectionStart?.toLocaleDateString() ?? "n/a"} - ${state.selectionEnd?.toLocaleDateString() ?? "n/a"}`
}

const onDrop = (item: INormalizedCalendarItem, date: Date): void => {
	state.message = `You dropped ${item.id} on ${date.toLocaleDateString()}`
	// Determine the delta between the old start date and the date chosen,
	// and apply that delta to both the start and end date to move the item.
	const eLength = CalendarMath.dayDiff(item.startDate, date)
	item.originalItem.startDate = CalendarMath.addDays(item.startDate, eLength)
	item.originalItem.endDate = CalendarMath.addDays(item.endDate, eLength)
}

const clickTestAddItem = (): void => {
	state.items.push({
		startDate: CalendarMath.fromIsoStringToLocalDate(state.newItemStartDate),
		endDate: CalendarMath.fromIsoStringToLocalDate(state.newItemEndDate),
		title: state.newItemTitle,
		id: "e" + Math.random().toString(36).substring(2, 11),
	})
	state.message = "You added a calendar item!"
}
</script>
<style>
@import "https://cdnjs.cloudflare.com/ajax/libs/bulma/0.7.2/css/bulma.min.css";
/* For apps using the npm package, the below URLs should reference /node_modules/vue-simple-calendar/dist/css/ instead */
@import "/css/gcal.css";
@import "/css/holidays-us.css";
@import "/css/holidays-ue.css";

#example-full {
	display: flex;
	flex-direction: row;
	font-family: Calibri, sans-serif;
	width: 96vw;
	min-width: 30rem;
	max-width: 100rem;
	min-height: 40rem;
	margin-left: auto;
	margin-right: auto;
}

#example-full .calendar-controls {
	margin-right: 1rem;
	min-width: 14rem;
	max-width: 14rem;
}

#example-full .calendar-parent {
	display: flex;
	flex-direction: column;
	flex-grow: 1;
	overflow-x: hidden;
	overflow-y: hidden;
	max-height: 80vh;
	background-color: white;
}

/* For long calendars, ensure each week gets sufficient height. The body of the calendar will scroll if needed */
#example-full .cv-wrapper.period-month.periodCount-2 .cv-week,
#example-full .cv-wrapper.period-month.periodCount-3 .cv-week,
#example-full .cv-wrapper.period-year .cv-week {
	min-height: 6rem;
}

/* These styles are optional, to illustrate the flexbility of styling the calendar purely with CSS. */

/* Add some styling for items tagged with the "birthday" class */
#example-full .theme-default .cv-item.birthday {
	background-color: #e0f0e0;
	border-color: #d7e7d7;
}

#example-full .theme-default .cv-item.birthday::before {
	content: "\1F382"; /* Birthday cake */
	margin-right: 0.5em;
}

/* The following classes style the classes computed in myDateClasses and passed to the component's dateClasses prop. */
#example-full .theme-default .cv-day.ides {
	background-color: #ffe0e0;
}

#example-full .ides .cv-day-number::before {
	content: "\271D";
}

#example-full .cv-day.do-you-remember.the-21st .cv-day-number::after {
	content: "\1F30D\1F32C\1F525";
}
</style>
