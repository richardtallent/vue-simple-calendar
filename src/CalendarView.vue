<template>
	<div
		aria-label="Calendar"
		:class="[
			'cv-wrapper',
			`locale-${CalendarMath.languageCode(displayLocale)}`,
			`locale-${displayLocale}`,
			`y${periodStart.getFullYear()}`,
			`m${CalendarMath.paddedMonth(periodStart)}`,
			`period-${displayPeriodUom}`,
			`periodCount-${displayPeriodCount}`,
			{
				past: CalendarMath.isPastMonth(periodStart),
				future: CalendarMath.isFutureMonth(periodStart),
				noIntl: !CalendarMath.supportsIntl,
			},
		]"
	>
		<slot :headerProps="headerProps" name="header" />
		<div class="cv-header-days">
			<div v-if="displayWeekNumbers" class="cv-weeknumber" />
			<template v-for="(label, index) in weekdayNames">
				<slot :index="getColumnDOWClass(index)" :label="label" name="day-header">
					<div :key="getColumnDOWClass(index)" :class="getColumnDOWClass(index)" class="cv-header-day">
						{{ label }}
					</div>
				</slot>
			</template>
		</div>
		<div :aria-multiselectable="enableDateSelection" class="cv-weeks">
			<div
				v-for="(weekStart, weekIndex) in weeksOfPeriod"
				:key="`${weekIndex}-week`"
				:class="['cv-week', `week${weekIndex + 1}`, `ws${CalendarMath.isoYearMonthDay(weekStart)}`]"
			>
				<div v-if="displayWeekNumbers" class="cv-weeknumber">
					<slot name="week-number" :date="weekStart" :numberInYear="periodStartCalendarWeek + weekIndex" :numberInPeriod="weekIndex + 1">
						<span>{{ periodStartCalendarWeek + weekIndex }}</span>
					</slot>
				</div>
				<div class="cv-weekdays">
					<div
						v-for="(day, dayIndex) in CalendarMath.daysOfWeek(weekStart)"
						:key="getColumnDOWClass(dayIndex)"
						:draggable="enableDateSelection"
						:class="[
							'cv-day',
							getColumnDOWClass(dayIndex),
							`d${CalendarMath.isoYearMonthDay(day)}`,
							`d${CalendarMath.isoMonthDay(day)}`,
							`d${CalendarMath.paddedDay(day)}`,
							`instance${CalendarMath.instanceOfMonth(day)}`,
							{
								today: CalendarMath.isSameDate(day, CalendarMath.today()),
								outsideOfMonth: !CalendarMath.isSameMonth(day, defaultedShowDate),
								past: CalendarMath.isInPast(day),
								future: CalendarMath.isInFuture(day),
								last: CalendarMath.isLastDayOfMonth(day),
								lastInstance: CalendarMath.isLastInstanceOfMonth(day),
								hasItems: dayHasItems(day),
								selectionStart: CalendarMath.isSameDate(day, selectionStart),
								selectionEnd: CalendarMath.isSameDate(day, selectionEnd),
							},
							...((dateClasses && dateClasses[CalendarMath.isoYearMonthDay(day)]) || []),
						]"
						:aria-grabbed="enableDateSelection ? dayIsSelected(day) : undefined"
						:aria-label="day.getDate().toString()"
						:aria-selected="dayIsSelected(day)"
						:aria-dropeffect="enableDragDrop && state.currentDragItem ? 'move' : enableDateSelection && state.dateSelectionOrigin ? 'execute' : 'none'"
						@click="onClickDay(day, $event)"
						@dragstart="onDragDateStart(day, $event)"
						@drop.prevent="onDrop(day, $event)"
						@dragover.prevent="onDragOver(day, $event)"
						@dragenter.prevent="onDragEnter(day, $event)"
						@dragleave.prevent="onDragLeave(day, $event)"
					>
						<div class="cv-day-number">
							<span v-if="fomName(day)" class="cv-fom-name">{{ fomName(day) }}</span>
							{{ day.getDate() }}
						</div>
						<slot :day="day" name="day-content" />
					</div>
					<template v-if="props.enableHtmlTitles" v-for="i in getWeekItems(weekStart)">
						<slot :value="i" :weekStartDate="weekStart" :top="getItemTop(i)" name="item">
							<div
								:key="i.id"
								:draggable="enableDragDrop"
								:aria-grabbed="enableDragDrop ? i == state.currentDragItem : undefined"
								:class="i.classes"
								:title="i.tooltip || i.title"
								:style="`top:${getItemTop(i)};${i.originalItem.style}`"
								class="cv-item"
								@dragstart="onDragItemStart(i, $event)"
								@mouseenter="onMouseEnterItem(i, $event)"
								@mouseleave="onMouseLeaveItem(i, $event)"
								@click.stop="onClickItem(i, $event)"
								v-html="getItemTitle(i)"
							/>
						</slot>
					</template>
					<template v-else v-for="i in getWeekItems(weekStart)">
						<slot :value="i" :weekStartDate="weekStart" :top="getItemTop(i)" name="item">
							<div
								:key="i.id"
								:draggable="enableDragDrop"
								:aria-grabbed="enableDragDrop ? i == state.currentDragItem : undefined"
								:class="i.classes"
								:title="i.tooltip || i.title"
								:style="`top:${getItemTop(i)};${i.originalItem.style}`"
								class="cv-item"
								@dragstart="onDragItemStart(i, $event)"
								@mouseenter="onMouseEnterItem(i, $event)"
								@mouseleave="onMouseLeaveItem(i, $event)"
								@click.stop="onClickItem(i, $event)"
							>
								{{ getItemTitle(i) }}
							</div>
							div>
						</slot>
					</template>
				</div>
			</div>
		</div>
	</div>
</template>
<script setup lang="ts">
import CalendarMath from "./CalendarMath"
import CalendarViewState from "./CalendarViewState"
import { computed, reactive, watch } from "vue"
import { ICalendarItem, INormalizedCalendarItem, DateTimeFormatOption } from "./ICalendarItem"
import { IHeaderProps } from "./IHeaderProps"

const props = withDefaults(
	defineProps<{
		showDate?: Date
		displayPeriodUom?: string
		displayPeriodCount?: number
		displayWeekNumbers?: boolean
		locale?: string
		monthNameFormat?: DateTimeFormatOption
		weekdayNameFormat?: DateTimeFormatOption
		showTimes?: boolean
		timeFormatOptions?: object
		disablePast?: boolean
		disableFuture?: boolean
		enableDateSelection?: boolean
		selectionStart?: Date
		selectionEnd?: Date
		enableDragDrop?: boolean
		startingDayOfWeek?: number
		items?: ICalendarItem[]
		dateClasses?: Record<string, string[]>
		itemTop?: string
		itemContentHeight?: string
		itemBorderHeight?: string
		periodChangedCallback?: Function
		currentPeriodLabel?: string
		currentPeriodLabelIcons?: string
		doEmitItemMouseEvents?: boolean
		enableHtmlTitles?: boolean
		monthNameOn1st?: boolean
	}>(),
	{
		showDate: undefined,
		displayPeriodUom: "month",
		displayPeriodCount: 1,
		displayWeekNumbers: false,
		locale: undefined,
		monthNameFormat: "long",
		weekdayNameFormat: "short",
		showTimes: false,
		timeFormatOptions: () => ({}),
		disablePast: false,
		disableFuture: false,
		enableDateSelection: false,
		selectionStart: undefined,
		selectionEnd: undefined,
		enableDragDrop: false,
		startingDayOfWeek: 0,
		items: () => [],
		dateClasses: () => ({}),
		itemTop: "1.4em",
		itemContentHeight: "1.4em",
		itemBorderHeight: "2px",
		periodChangedCallback: undefined,
		currentPeriodLabel: "",
		currentPeriodLabelIcons: "⇤-⇥",
		doEmitItemMouseEvents: false,
		enableHtmlTitles: true,
		monthNameOn1st: true,
	}
)

const emit = defineEmits<{
	//(e: "input", payload: foo, windowEvent: Event): void
	(e: "period-changed"): void
	(e: "click-date", day: Date, itemsInRange: INormalizedCalendarItem[], windowEvent: Event): void
	(e: "click-item", item: INormalizedCalendarItem, windowEvent: Event): void
	(e: "item-mouseenter", item: INormalizedCalendarItem, windowEvent: Event): void
	(e: "item-mouseleave", item: INormalizedCalendarItem, windowEvent: Event): void
	(e: "drag-start", item: INormalizedCalendarItem, windowEvent: Event): void
	(e: "drag-over-date", currentDragItem: INormalizedCalendarItem, day: Date, windowEvent: Event): void
	(e: "drag-enter-date", currentDragItem: INormalizedCalendarItem, day: Date, windowEvent: Event): void
	(e: "drag-leave-date", currentDragItem: INormalizedCalendarItem, day: Date, windowEvent: Event): void
	(e: "drop-on-date", currentDragItem: INormalizedCalendarItem, day: Date, windowEvent: Event): void
	(e: "date-selection", selectedDateRange: [Date, Date], windowEvent: Event): void
	(e: "date-selection-start", selectedDateRange: [Date, Date], windowEvent: Event): void
	(e: "date-selection-finish", selectedDateRange: [Date, Date], windowEvent: Event): void
}>()

const state = reactive(new CalendarViewState())

// Props cannot default to computed/method returns, so create defaulted version of this
// property and use it rather than the bare prop (Vue Issue #6013).
const displayLocale = computed((): string => props.locale || CalendarMath.getDefaultBrowserLocale())

/*
ShowDate, but defaulted to today. Needed both for periodStart below and for the
"outside of month" class. Any time component passed as part of showDate is discarded.
*/
const defaultedShowDate = computed((): Date => (props.showDate ? CalendarMath.dateOnly(props.showDate) : CalendarMath.today()))

// Given the showDate, defaulted to today, computes the beginning and end of the period
// that the date falls within.
const periodStart = computed((): Date => CalendarMath.beginningOfPeriod(defaultedShowDate.value, props.displayPeriodUom, props.startingDayOfWeek))

const periodEnd = computed(
	(): Date => CalendarMath.addDays(CalendarMath.incrementPeriod(periodStart.value, props.displayPeriodUom, props.displayPeriodCount), -1)
)

const periodStartCalendarWeek = computed((): number => {
	const jan1 = new Date(periodStart.value.getFullYear(), 0, 1)
	const firstThursday = CalendarMath.addDays(jan1, (11 - jan1.getDay()) % 7)
	const startOfFirstWeek = CalendarMath.beginningOfPeriod(firstThursday, "week", props.startingDayOfWeek)
	const periodWeekStarts = CalendarMath.beginningOfWeek(periodStart.value, props.startingDayOfWeek)
	return 1 + Math.floor(CalendarMath.dayDiff(startOfFirstWeek, periodWeekStarts) / 7)
})

// For month and year views, the first and last dates displayed in the grid may not
// be the same as the intended period, since the period may not start and stop evenly
// on the starting day of the week.
const displayFirstDate = computed((): Date => CalendarMath.beginningOfWeek(periodStart.value, props.startingDayOfWeek))
const displayLastDate = computed((): Date => CalendarMath.endOfWeek(periodEnd.value, props.startingDayOfWeek))

// Create an array of dates, where each date represents the beginning of a week that
// should be rendered in the view for the current period.
const weeksOfPeriod = computed((): Date[] => {
	const numWeeks = Math.floor((CalendarMath.dayDiff(displayFirstDate.value, displayLastDate.value) + 1) / 7)
	return [...Array(numWeeks)].map((_, i) => CalendarMath.addDays(displayFirstDate.value, i * 7))
})

// Cache the names based on current locale and format settings
const monthNames = computed((): string[] => CalendarMath.getFormattedMonthNames(displayLocale.value, props.monthNameFormat))
const weekdayNames = computed((): string[] => CalendarMath.getFormattedWeekdayNames(displayLocale.value, props.weekdayNameFormat, props.startingDayOfWeek))

// Ensure all item properties have suitable default
const fixedItems = computed((): INormalizedCalendarItem[] => {
	if (!props.items) return []
	return props.items.map((item) => CalendarMath.normalizeItem(item, item.id === state.currentHoveredItemId))
})

// Period that today's date sits within
const currentPeriodStart = computed((): Date => CalendarMath.beginningOfPeriod(CalendarMath.today(), props.displayPeriodUom, props.startingDayOfWeek))
const currentPeriodEnd = computed(
	(): Date => CalendarMath.addDays(CalendarMath.incrementPeriod(currentPeriodStart.value, props.displayPeriodUom, props.displayPeriodCount), -1)
)

// Creates the HTML to render the date range for the calendar header.
const periodLabel = computed((): string => CalendarMath.formattedPeriod(periodStart.value, periodEnd.value, props.displayPeriodUom, monthNames.value))

const currentPeriodLabelFinal = computed((): string => {
	const c = currentPeriodStart.value
	const s = periodStart.value
	if (!props.currentPeriodLabel) return CalendarMath.formattedPeriod(c, currentPeriodEnd.value, props.displayPeriodUom, monthNames.value)
	if (props.currentPeriodLabel === "icons") return props.currentPeriodLabelIcons[Math.sign(c.getTime() - s.getTime()) + 1]
	return props.currentPeriodLabel
})

const showMonthNameOn1st = computed(() => props.monthNameOn1st && (props.displayPeriodUom !== "month" || props.displayPeriodCount > 1))
const fomName = (day: Date): string => (showMonthNameOn1st.value && day.getDate() == 1 ? monthNames.value[day.getMonth()] : "")

const headerProps = computed(
	(): IHeaderProps => ({
		// Dates for UI navigation
		previousYear: getIncrementedPeriod(-12),
		previousPeriod: getIncrementedPeriod(-1),
		nextPeriod: getIncrementedPeriod(1),
		previousFullPeriod: getIncrementedPeriod(-props.displayPeriodCount),
		nextFullPeriod: getIncrementedPeriod(props.displayPeriodCount),
		nextYear: getIncrementedPeriod(12),
		currentPeriod: currentPeriodStart.value,
		currentPeriodLabel: currentPeriodLabelFinal.value,
		// Dates for header display
		periodStart: periodStart.value,
		periodEnd: periodEnd.value,
		// Extra information that could be useful to a custom header
		displayLocale: displayLocale.value,
		displayFirstDate: displayFirstDate.value,
		displayLastDate: displayLastDate.value,
		monthNames: monthNames.value,
		fixedItems: fixedItems.value,
		periodLabel: periodLabel.value,
	})
)

const periodRange = computed(() => ({
	periodStart: periodStart,
	periodEnd: periodEnd,
	displayFirstDate: displayFirstDate,
	displayLastDate: displayLastDate,
}))

watch(
	() => periodRange,
	(newVal) => {
		if (props.periodChangedCallback) {
			emit("period-changed")
			props.periodChangedCallback(newVal, "watch")
		}
	},
	{ immediate: true, deep: true }
)

// ******************************
// UI Events
// ******************************

const onClickDay = (day: Date, windowEvent: Event): void => {
	if (props.disablePast && CalendarMath.isInPast(day)) return
	if (props.disableFuture && CalendarMath.isInFuture(day)) return
	emit("click-date", day, findAndSortItemsInDateRange(day, day), windowEvent)
}

const onClickItem = (calendarItem: INormalizedCalendarItem, windowEvent: Event): void => emit("click-item", calendarItem, windowEvent)

// The day name header needs to know the dow for class assignment, and this value should
// not change based on startingDayOfWeek (i.e., Sunday is always 0). This function
// computes the dow for a given day index.
const getColumnDOWClass = (dayIndex: number): string => "dow" + ((dayIndex + props.startingDayOfWeek) % 7)

// ******************************
// Date Periods
// ******************************

// Returns a date for the current display date moved forward or backward by a given
// number of the current display units. Returns null if said move would result in a
// disallowed display period.
const getIncrementedPeriod = (count: number): Date | null => {
	const newStartDate = CalendarMath.incrementPeriod(periodStart.value, props.displayPeriodUom, count)
	const newEndDate = CalendarMath.incrementPeriod(newStartDate, props.displayPeriodUom, props.displayPeriodCount)
	if (props.disablePast && newEndDate <= CalendarMath.today()) return null
	if (props.disableFuture && newStartDate > CalendarMath.today()) return null
	return newStartDate
}

// ******************************
// Hover items (#95, #136)
// ******************************

const onMouseEnterItem = (calendarItem: INormalizedCalendarItem, windowEvent: Event): void => {
	state.currentHoveredItemId = calendarItem.id
	if (props.doEmitItemMouseEvents) {
		emit("item-mouseenter", calendarItem, windowEvent)
	}
}

const onMouseLeaveItem = (calendarItem: INormalizedCalendarItem, windowEvent: Event): void => {
	state.currentHoveredItemId = ""
	if (props.doEmitItemMouseEvents) {
		emit("item-mouseleave", calendarItem, windowEvent)
	}
}

// ******************************
// Dragging across days (selection)
// ******************************

const onDragDateStart = (day: Date, windowEvent: DragEvent): boolean => {
	if (!props.enableDateSelection) return false
	// Push the date where the selection started into dataTransfer. This is not used by this component, but
	// a value required in Firefox and possibly other browsers.
	windowEvent.dataTransfer?.setData("text", day.toString())
	let img = new Image()
	img.src = "data:image/gif;base64,R0lGODlhAQABAIAAAP///wAAACH5BAEAAAAALAAAAAABAAEAAAICRAEAOw=="
	windowEvent.dataTransfer?.setDragImage(img, 10, 10)
	state.dateSelectionOrigin = day
	emit("date-selection-start", getSelectedDateRange(day), windowEvent)
	return true
}

// ******************************
// Drag and drop items
// ******************************

const onDragItemStart = (calendarItem: INormalizedCalendarItem, windowEvent: DragEvent): boolean => {
	if (!props.enableDragDrop) return false
	// Firefox and possibly other browsers require dataTransfer to be set, even if the value is not used. IE11
	// requires that the first argument be exactly "text" (not "text/plain", etc.). The calendar item's ID is
	// passed, allowing calling applications to receive items dragged outside the component.
	windowEvent.dataTransfer?.setData("text", calendarItem.id)
	// However, we don't use dataTransfer within the component. Instead, we just keep a handled on the item
	// currently being dragged. This avoids having to look it up later.
	state.currentDragItem = calendarItem
	// Reset date selection origin so the onenter events aren't confused
	state.dateSelectionOrigin = undefined
	// Allow the calling application to add additional functionality.
	emit("drag-start", calendarItem, windowEvent)
	return true
}

// If the user drags an item FROM this calendar TO this calendar, currentDragItem will be initialized to the
// most recent item with a dragStart event. If not, we still emit the event, and the caller will need to
// determine what to do based on the third argument (windowEvent, which gives them access to `dataTransfer`).
// This allows developers to create custom calendars where things can be dragged in from the outside. This
// also allows developers using scoped slots for items to handle the drag and drop themselves.

// Non-null assertion used because the selection origin is pre-checked in all use cases
const getSelectedDateRange = (d: Date): [Date, Date] => (d <= state.dateSelectionOrigin! ? [d, state.dateSelectionOrigin!] : [state.dateSelectionOrigin!, d])

const onDragOver = (day: Date, windowEvent: Event): void => {
	if (!props.enableDragDrop) return
	emit("drag-over-date", state.currentDragItem!, day, windowEvent)
}

const onDragEnter = (day: Date, windowEvent: Event) => {
	if (props.enableDateSelection && state.dateSelectionOrigin) {
		// User is selecting dates, not items.
		emit("date-selection", getSelectedDateRange(day), windowEvent)
	}
	if (!props.enableDragDrop) return
	emit("drag-enter-date", state.currentDragItem!, day, windowEvent)
	const el = windowEvent.target as HTMLElement
	el.classList.add("draghover")
}

const onDragLeave = (day: Date, windowEvent: Event): void => {
	// User is selecting dates, not items. No emit.
	if (props.enableDateSelection && props.selectionStart) return
	if (!props.enableDragDrop) return
	emit("drag-leave-date", state.currentDragItem!, day, windowEvent)
	const el = windowEvent.target as HTMLElement
	el.classList.remove("draghover")
}

const onDrop = (day: Date, windowEvent: Event): void => {
	if (props.enableDateSelection && state.dateSelectionOrigin) {
		// User is selecting dates, not items.
		emit("date-selection-finish", getSelectedDateRange(day), windowEvent)
		return
	}
	if (!props.enableDragDrop) return
	emit("drop-on-date", state.currentDragItem!, day, windowEvent)
	const el = windowEvent.target as HTMLElement
	el.classList.remove("draghover")
}

// ******************************
// Calendar Items
// ******************************

const itemComparer = (a: INormalizedCalendarItem, b: INormalizedCalendarItem) => {
	if (a.startDate < b.startDate) return -1
	if (b.startDate < a.startDate) return 1
	if (a.endDate > b.endDate) return -1
	if (b.endDate > a.endDate) return 1
	return a.id < b.id ? -1 : 1
}

// Return a list of items that INCLUDE any portion of a given week.
const findAndSortItemsInWeek = (weekStart: Date): INormalizedCalendarItem[] => findAndSortItemsInDateRange(weekStart, CalendarMath.addDays(weekStart, 6))

// Return a list of items that INCLUDE any day within the date range,
// inclusive, sorted so items that start earlier are returned first.
const findAndSortItemsInDateRange = (startDate: Date, endDate: Date): INormalizedCalendarItem[] =>
	fixedItems.value.filter((item) => item.endDate >= startDate && CalendarMath.dateOnly(item.startDate) <= endDate, this).sort(itemComparer)

const dayHasItems = (day: Date): boolean => !!fixedItems.value.find((d) => d.endDate >= day && CalendarMath.dateOnly(d.startDate) <= day)

const dayIsSelected = (day: Date): boolean => {
	if (!props.selectionStart || !props.selectionEnd) return false
	if (day < CalendarMath.dateOnly(props.selectionStart)) return false
	if (day > CalendarMath.dateOnly(props.selectionEnd)) return false
	return true
}

// Return a list of items that CONTAIN the week starting on a day.
// Sorted so the items that start earlier are always shown first.
const getWeekItems = (weekStart: Date): INormalizedCalendarItem[] => {
	const items = findAndSortItemsInWeek(weekStart)
	const results = [] as INormalizedCalendarItem[]
	const itemRows: boolean[][] = [[], [], [], [], [], [], []]
	if (!items) return results
	for (let i = 0; i < items.length; i++) {
		const ep = Object.assign({}, items[i], {
			classes: [...items[i].classes],
			itemRow: 0,
		})
		const continued = ep.startDate < weekStart
		const startOffset = continued ? 0 : CalendarMath.dayDiff(weekStart, ep.startDate)
		const span = Math.max(1, Math.min(7 - startOffset, CalendarMath.dayDiff(CalendarMath.addDays(weekStart, startOffset), ep.endDate) + 1))
		if (continued) ep.classes.push("continued")
		if (CalendarMath.dayDiff(weekStart, ep.endDate) > 6) ep.classes.push("toBeContinued")
		if (CalendarMath.isInPast(ep.endDate)) ep.classes.push("past")
		if (ep.originalItem.url) ep.classes.push("hasUrl")
		for (let d = 0; d < 7; d++) {
			if (d === startOffset) {
				let s = 0
				while (itemRows[d][s]) s++
				ep.itemRow = s
				itemRows[d][s] = true
			} else if (d < startOffset + span) {
				itemRows[d][ep.itemRow] = true
			}
		}
		ep.classes.push(`offset${startOffset}`)
		ep.classes.push(`span${span}`)
		results.push(ep)
	}
	return results
}

// Creates the HTML to prefix the item title showing the items start and/or end time.
// Midnight is not displayed.
const getFormattedTimeRange = (item: INormalizedCalendarItem): string => {
	const startTime = '<span class="startTime">' + CalendarMath.formattedTime(item.startDate, displayLocale.value, props.timeFormatOptions) + "</span>"
	let endTime = ""
	if (!CalendarMath.isSameDateTime(item.startDate, item.endDate)) {
		endTime = '<span class="endTime">' + CalendarMath.formattedTime(item.endDate, displayLocale.value, props.timeFormatOptions) + "</span>"
	}
	return startTime + endTime
}

const getItemTitle = (item: INormalizedCalendarItem): string => {
	if (!props.showTimes) return item.title
	return getFormattedTimeRange(item) + " " + item.title
}

// Compute the top position of the item based on its assigned row within the given week.
const getItemTop = (item: INormalizedCalendarItem): string => {
	const r = item.itemRow
	const h = props.itemContentHeight
	const b = props.itemBorderHeight
	return `calc(${props.itemTop} + ${r}*${h} + ${r}*${b})`
}
</script>
<!--

The CSS below represents only the CSS required for proper rendering (positioning, etc.) and
minimalist default borders and colors. Special-day colors, holiday emoji, item colors,
and decorations like border-radius should be part of a theme. Styles related to the default
header are in the CalendarViewHeader component.

-->
<style>
/* Position/Flex */

/* Make the calendar flex vertically */
.cv-wrapper {
	display: flex;
	flex-direction: column;
	flex-grow: 1;
	height: 100%;
	min-height: 100%;
	max-height: 100%;
	overflow-x: hidden;
	overflow-y: hidden;
}

.cv-wrapper,
.cv-wrapper div {
	box-sizing: border-box;
	line-height: 1em;
	font-size: 1em;
}

.cv-header-days {
	display: flex;
	flex-grow: 0;
	flex-shrink: 0;
	flex-basis: auto;
	flex-flow: row nowrap;
	border-width: 0 0 0 1px;
}

.cv-header-day {
	display: flex;
	flex-grow: 1;
	flex-shrink: 0;
	flex-basis: 0;
	flex-flow: row nowrap;
	align-items: center;
	justify-content: center;
	text-align: center;
	border-width: 1px 1px 0 0;
}

/* The calendar grid should take up the remaining vertical space */
.cv-weeks {
	display: flex;
	flex-grow: 1;
	flex-shrink: 1;
	flex-basis: auto;
	flex-flow: column nowrap;
	border-width: 0 0 1px 1px;

	/* Allow grid to scroll if there are too may weeks to fit in the view */
	overflow-y: auto;
	-ms-overflow-style: none;
	scrollbar-width: none;
}

.cv-weeknumber {
	width: 2rem;
	position: relative;
	text-align: center;
	border-width: 1px 1px 0 0;
	border-style: solid;
	line-height: 1;
}

/* Use flex basis of 0 on week row so all weeks will be same height regardless of content */
.cv-week {
	display: flex;

	/* Shorthand flex: 1 1 0 not supported by IE11 */
	flex-grow: 1;
	flex-shrink: 1;
	flex-basis: 0;
	flex-flow: row nowrap;
	min-height: 3em;
	border-width: 0;

	/* Allow week items to scroll if they are too tall */
	position: relative;
	width: 100%;
	overflow-y: auto;
	-ms-overflow-style: none;
}

.cv-weekdays {
	display: flex;

	/* Shorthand flex: 1 1 0 not supported by IE11 */
	flex-grow: 1;
	flex-shrink: 0;
	flex-basis: 0;
	flex-flow: row nowrap;

	/* Days of the week go left to right even if user's language is RTL (#138) */
	direction: ltr;
	position: relative;
	overflow-y: auto;
	scrollbar-width: none;
}

.cv-day {
	display: flex;

	/* Shorthand flex: 1 1 0 not supported by IE11 */
	flex-grow: 1;
	flex-shrink: 0;
	flex-basis: 0;
	position: relative; /* Fallback for IE11, which doesn't support sticky */
	position: sticky; /* When week's items are scrolled, keep the day content fixed */
	top: 0;
	border-width: 1px 1px 0 0;

	/* Restore user's direction setting (overridden for week) */
	direction: initial;
}

.cv-day-number {
	height: auto;
	width: 100%;
	align-self: flex-start;
}

.d01 .cv-day-number:has(.cv-fom-name) {
	background-color: var(--cal-fom-name-bg, #fcf);
}

/* Default styling for holiday hover descriptions */

.cv-day-number:hover::after {
	position: absolute;
	top: 1rem;
	background-color: var(--cal-holiday-bg, #f7f7f7);
	border: var(--cal-holiday-border, 1px solid #f0f0f0);
	box-shadow: 0.1rem 0.1rem 0.2rem var(--cal-holiday-shadow, rgba(0, 0, 0, 0.25));
	padding: 0.2rem;
	margin: 0.5rem;
	line-height: 1.2;
}

/*
A bug in Microsoft Edge 41 (EdgeHTML 16) has been reported (#109) where days "disappear" because they are
wrapping under the next week (despite the "nowrap" on cv-week). This appears to be an issue specifically
with our metrics and the sticky positioning. I was not able to reproduce this issue in Edge 38, 42, or 44.
I'm reticent to turn off the sticky functionality for all Edge users because of one version (or perhaps an
interaction of that version with a specific graphics adapter or other setting). So instead, I'm leaving this
as an example for anyone forced to support Edge 41 who may see the same issue. If that's the case, just
add this selector to your own CSS.

@supports (-ms-ime-align: auto) {
	.cv-day {
		position: relative;
	}
}
_:-ms-lang(x),
.cv-day {
	position: relative;
}
.cv-day-number {
	position: absolute;
	right: 0;
}
*/

.cv-day[draggable],
.cv-item[draggable] {
	user-select: none;
}

.cv-item {
	position: absolute;
	white-space: nowrap;
	overflow: hidden;
	background-color: #f7f7f7;
	border-width: 1px;

	/* Restore user's direction setting (overridden for week) */
	direction: initial;
}

/* Wrap to show entire item title on hover */
.cv-wrapper.wrap-item-title-on-hover .cv-item:hover {
	white-space: normal;
	z-index: 1;
}

/* Colors */

.cv-header-days,
.cv-header-day,
.cv-weeks,
.cv-week,
.cv-day,
.cv-item {
	border-style: solid;
	border-color: #ddd;
}

/* Item Times */
.cv-item .endTime::before {
	content: "-";
}

/* Internal Metrics */
.cv-header-day,
.cv-day-number,
.cv-item {
	padding: 0.2em;
}

/* Allows emoji icons or labels (such as holidays) to be added more easily to specific dates by having the margin set already. */
.cv-day-number::before {
	margin-right: 0.5em;
}

.cv-item.offset0 {
	left: 0;
}

.cv-item.offset1 {
	left: calc((100% / 7));
}

.cv-item.offset2 {
	left: calc((200% / 7));
}

.cv-item.offset3 {
	left: calc((300% / 7));
}

.cv-item.offset4 {
	left: calc((400% / 7));
}

.cv-item.offset5 {
	left: calc((500% / 7));
}

.cv-item.offset6 {
	left: calc((600% / 7));
}

/* Metrics for items spanning dates */

.cv-item.span1 {
	width: calc((100% / 7) - 0.05em);
}

.cv-item.span2 {
	width: calc((200% / 7) - 0.05em);
}

.cv-item.span3 {
	width: calc((300% / 7) - 0.05em);
}

.cv-item.span4 {
	width: calc((400% / 7) - 0.05em);
}

.cv-item.span5 {
	width: calc((500% / 7) - 0.05em);
}

.cv-item.span6 {
	width: calc((600% / 7) - 0.05em);
}

.cv-item.span7 {
	width: calc((700% / 7) - 0.05em);
}

/* Hide scrollbars for the grid and the week */
.cv-weeks::-webkit-scrollbar,
.cv-weekdays::-webkit-scrollbar {
	width: 0; /* remove scrollbar space */
	background: transparent; /* optional: just make scrollbar invisible */
}
</style>
