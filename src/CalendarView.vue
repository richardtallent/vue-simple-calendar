<!--

	Note on Internationalization:

	Intl is not supported for Safari 9.1, iOS 9.3, and Opera Mini. For these browsers, the month
	names and weekday names will be blank and the calendar will have a `nointl` class. Use CSS
	content to provide the appropriate month and weekday names for the languages you support.

	E.g.:
		.calendar.nointl.locale-en.m01 .monthName::after { content: 'January' }

-->
<template>
	<div class="calendar-view" :class="[
			'locale-' + languageCode(displayLocale),
			'locale-' + displayLocale,
			'y' + periodStart.getFullYear(),
			'm' + paddedMonth(periodStart),
			'period-' + displayPeriodUom,
			'periodCount-' + displayPeriodCount,
			{
				past: isPastMonth(periodStart),
				future: isFutureMonth(periodStart),
				noIntl: !supportsIntl,
			}]">
		<slot name="header">
			<div class="header">
				<div class="nav">
					<button class="previousYear" @click="onIncrementPeriod(-12)" :disabled="!isPeriodIncrementAllowed(-12)"/>
					<button class="previousPeriod" @click="onIncrementPeriod(-displayPeriodCount)" :disabled="!isPeriodIncrementAllowed(-displayPeriodCount)"/>
					<button class="nextPeriod" @click="onIncrementPeriod(displayPeriodCount)" :disabled="!isPeriodIncrementAllowed(displayPeriodCount)"/>
					<button class="nextYear" @click="onIncrementPeriod(12)" :disabled="!isPeriodIncrementAllowed(12)"/>
					<button class="currentPeriod" @click="onClickCurrentPeriod"/>
				</div>
				<div class="periodLabel"
					:class="{ 
						singleYear: periodStart.getFullYear() === periodEnd.getFullYear(), 
						singleMonth: isSameMonth(periodStart, periodEnd) }">
					<div class="startMonth">{{ monthNames[periodStart.getMonth()] }}</div>
					<div class="startDay">{{ periodStart.getDate() }}</div>
					<div class="startYear">{{ periodStart.getFullYear() }}</div>
					<div class="endMonth">{{ monthNames[periodEnd.getMonth()] }}</div>
					<div class="endDay">{{ periodEnd.getDate() }}</div>
					<div class="endYear">{{ periodEnd.getFullYear() }}</div>
				</div>
			</div>
		</slot>
		<div class="dayList">
			<template v-for="(label, index) in weekdayNames">
				<slot name="dayHeader" :index="index" :label="label">
					<div class="day" :key="index" :class="'dow'+index">{{ label }}</div>
				</slot>
			</template>
		</div>
		<div class="weeks">
			<div v-for="(weekStart, weekIndex) in weeksOfPeriod"
				:key="weekIndex"
				class="week"
				:class="['week' + (weekIndex+1), 'ws' + isoYearMonthDay(weekStart)]"
				:style="'z-index:' + ((weekIndex + 1) * 2)">
				<div v-for="(day, dayIndex) in daysOfWeek(weekStart)" class="day" 
					:key="dayIndex"
					:class="[
						'dow' + day.getDay(),
						'd' + isoYearMonthDay(day),
						'd' + isoMonthDay(day),
						'd' + paddedDay(day),
						'instance' + instanceOfMonth(day),
						{
							outsideOfMonth: !isSameMonth(day, defaultedShowDate),
							today: isSameDate(day, today()),
							past: isInPast(day),
							future: isInFuture(day),
							last: isLastDayOfMonth(day),
							lastInstance: isLastInstanceOfMonth(day),
						}
					]"
					@click="onClickDay(day)"
					@drop.prevent="onDrop(day, $event)"
					@dragover.prevent="onDragOver(day)"
					@dragenter.prevent="onDragEnter(day, $event)"
					@dragleave.prevent="onDragLeave(day, $event)">
					<div class="content">
						<slot name="dayContent" :day="day">
							<div class="date">{{ day.getDate() }}</div>
						</slot>
					</div>
				</div>
				<template v-for="e in getWeekEvents(weekStart)">
					<slot name="event" :event="e.originalEvent" :weekStartDate="weekStart">
						<div
							class="event"
							:key="e.id"
							:draggable="enableDragDrop"
							:class="e.classes"
							:title="e.title"
							:style="'z-index:' + ((weekIndex + 1) * 2 + 1)"
							@dragstart="onDragStart(e)"
							@click.stop="onClickEvent(e)"
							v-html="getEventTitle(e)"/>
					</slot>
				</template>
			</div>
		</div>
	</div>
</template>

<script>
import CalendarMathMixin from "./CalendarMathMixin"

export default {
	name: "CalendarView",

	mixins: [CalendarMathMixin],

	props: {
		showDate: {
			type: Date,
			default() {
				return undefined
			},
		},
		displayPeriodUom: {
			type: String,
			default() {
				return "month"
			},
		},
		displayPeriodCount: {
			type: Number,
			default() {
				return 1
			},
		},
		locale: {
			type: String,
			default() {
				return undefined
			},
		},
		monthNameFormat: {
			type: String,
			default() {
				return "long"
			},
		},
		weekdayNameFormat: {
			type: String,
			default() {
				return "short"
			},
		},
		showEventTimes: {
			type: Boolean,
			default() {
				return false
			},
		},
		timeFormatOptions: {
			type: Object,
			default() {
				return {}
			},
		},
		disablePast: {
			type: Boolean,
			default() {
				return false
			},
		},
		disableFuture: {
			type: Boolean,
			default() {
				return false
			},
		},
		enableDragDrop: {
			type: Boolean,
			default() {
				return false
			},
		},
		startingDayOfWeek: {
			type: Number,
			default() {
				return 0
			},
		},
		events: {
			type: Array,
			default() {
				return []
			},
		},
	},

	data: function() {
		return {
			currentDragEvent: null,
		}
	},

	computed: {
		/*
		Props cannot default to computed/method returns, so create defaulted version of this
		property and use it rather than the bare prop (Vue Issue #6013).
		*/
		displayLocale() {
			return this.locale || this.getDefaultBrowserLocale()
		},

		/*
		ShowDate, but defaulted to today. Needed both for periodStart below and for the
		"outside of month" class.
		*/
		defaultedShowDate() {
			return this.showDate || this.today()
		},

		/*
		Given the showDate, defaulted to today, computes the beginning and end of the period
		that the date falls within.
		*/
		periodStart() {
			return this.beginningOfPeriod(
				this.defaultedShowDate,
				this.displayPeriodUom,
				this.startingDayOfWeek
			)
		},

		periodEnd() {
			return this.addDays(
				this.incrementPeriod(
					this.periodStart,
					this.displayPeriodUom,
					this.displayPeriodCount
				),
				-1
			)
		},

		/*
		For month and year views, the first and last dates displayed in the grid may not
		be the same as the intended period, since the period may not start and stop evenly
		on the starting day of the week.
		*/
		displayFirstDate() {
			return this.beginningOfWeek(this.periodStart, this.startingDayOfWeek)
		},

		displayLastDate() {
			return this.endOfWeek(this.periodEnd, this.startingDayOfWeek)
		},

		/*
		Create an array of dates, where each date represents the beginning of a week that
		should be rendered in the view for the current period.
		*/
		weeksOfPeriod() {
			// Returns an array of object representing the date of the beginning of each week
			// included in the view.
			const numWeeks = Math.floor(
				(this.dayDiff(this.displayFirstDate, this.displayLastDate) + 1) / 7
			)
			return Array(numWeeks)
				.fill()
				.map((_, i) => this.addDays(this.displayFirstDate, i * 7))
		},

		/* Cache the names based on current locale and format settings */
		monthNames() {
			return this.getFormattedMonthNames(
				this.displayLocale,
				this.monthNameFormat
			)
		},
		weekdayNames() {
			return this.getFormattedWeekdayNames(
				this.displayLocale,
				this.weekdayNameFormat,
				this.startingDayOfWeek
			)
		},

		/*
		Before doing with with events, we need a normalized version of each event that has a
		parsed startDate, a parsed or defaulted endDate, and a defaulted title and id. We
		also need a guarantee that the `classes` attribute is an array, not a single class
		string or null. A reference to the original event is kept.
		*/
		fixedEvents() {
			var vm = this
			return this.events.map(function(event) {
				// Classes may be a string, an array, or null. Coalesce to an array
				let fixedClasses = []
				if (event.classes) {
					if (Array.isArray(event.classes)) {
						fixedClasses = [...event.classes]
					} else {
						fixedClasses = [event.classes]
					}
				}
				return {
					originalEvent: event,
					startDate: vm.toLocalDate(event.startDate),
					endDate: vm.toLocalDate(event.endDate || event.startDate),
					classes: fixedClasses,
					title: event.title || "Untitled",
					id:
						event.id ||
						"e" +
							Math.random()
								.toString(36)
								.substr(2, 10),
				}
			})
		},
	},

	methods: {
		// ******************************
		// UI Events
		// ******************************

		onClickDay(day) {
			if (this.disablePast && this.isInPast(day)) return
			this.$emit("clickDay", day) // Deprecated
			this.$emit("click-date", day)
		},

		onClickEvent(e, day) {
			this.$emit("clickEvent", e.originalEvent, day) // Deprecated
			this.$emit("click-event", e.originalEvent, day)
		},

		onClickCurrentPeriod() {
			const newValue = this.beginningOfPeriod(
				this.today(),
				this.displayPeriodUom,
				this.startingDayOfWeek
			)
			this.$emit("setShowDate", newValue) // Deprecated
			this.$emit("show-date-change", newValue)
		},

		// ******************************
		// Date Periods
		// ******************************

		/*
		Returns a date for the current display date moved forward or backward by a given
		number of the current display units. Returns null if said move would result in a
		disallowed display period.
		*/
		getIncrementedPeriod(count) {
			const newStartDate = this.incrementPeriod(
				this.periodStart,
				this.displayPeriodUom,
				count
			)
			const newEndDate = this.incrementPeriod(
				newStartDate,
				this.displayPeriodUom,
				this.displayPeriodCount
			)
			if (this.disablePast && newEndDate <= this.today()) return null
			if (this.disableFuture && newStartDate > this.today()) return null
			return newStartDate
		},

		isPeriodIncrementAllowed(count) {
			return this.getIncrementedPeriod(count) !== null
		},

		onIncrementPeriod(count) {
			const d = this.getIncrementedPeriod(count)
			if (d != null) {
				this.$emit("setShowDate", d) // Deprecated
				this.$emit("show-date-change", d)
			}
		},

		// ******************************
		// Drag and drop events
		// ******************************

		onDragStart(calendarEvent) {
			if (!this.enableDragDrop) return false
			// Not using dataTransfer.setData to store the event ID because it (a) doesn't allow access to the data being
			// dragged during dragover, dragenter, and dragleave events, and because storing an ID requires an unnecessary
			// lookup. This does limit the drop zones to areas within this instance of this component.
			this.currentDragEvent = calendarEvent
			this.$emit("dragEventStart", calendarEvent.originalEvent, calendarEvent) // Deprecated
			this.$emit("drag-start", calendarEvent.originalEvent, calendarEvent)
			return true
		},

		handleEvent(bubbleEventName, bubbleParam) {
			if (!this.enableDragDrop) return false
			if (!this.currentDragEvent) return false // shouldn't happen
			this.$emit(
				bubbleEventName,
				this.currentDragEvent.originalEvent,
				bubbleParam
			)
			return true
		},

		onDragOver(day) {
			this.handleEvent("dragEventOverDate", day) // Deprecated
			this.handleEvent("drag-over-date", day)
		},

		onDragEnter(day, windowEvent) {
			if (!this.handleEvent("dragEventEnterDate", day)) return // Deprecated
			if (!this.handleEvent("drag-enter-date", day)) return
			windowEvent.target.classList.add("draghover")
		},

		onDragLeave(day, windowEvent) {
			if (!this.handleEvent("dragEventLeaveDate", day)) return // Deprecated
			if (!this.handleEvent("drag-leave-date", day)) return
			windowEvent.target.classList.remove("draghover")
		},

		onDrop(day, windowEvent) {
			if (!this.handleEvent("dropEventOnDate", day)) return // Deprecated
			if (!this.handleEvent("drop-on-date", day)) return
			windowEvent.target.classList.remove("draghover")
		},

		// ******************************
		// Calendar Events
		// ******************************

		findAndSortEventsInWeek(weekStart) {
			// Return a list of events that INCLUDE any day of a week starting on a
			// particular day. Sorted so the events that start earlier are always
			// shown first.
			const events = this.fixedEvents
				.filter(
					event =>
						event.startDate < this.addDays(weekStart, 7) &&
						event.endDate >= weekStart,
					this
				)
				.sort((a, b) => {
					if (a.startDate < b.startDate) return -1
					if (b.startDate < a.startDate) return 1
					if (a.endDate > b.endDate) return -1
					if (b.endDate > a.endDate) return 1
					return a.id < b.id ? -1 : 1
				})
			return events
		},

		getWeekEvents(weekStart) {
			// Return a list of events that CONTAIN the week starting on a day.
			// Sorted so the events that start earlier are always shown first.
			const events = this.findAndSortEventsInWeek(weekStart)
			const results = []
			// Surely there's a better way, Prettier?
			const eventRows = [
				[],
				[],
				[],
				[],
				[],
				[],
				[],
				[],
				[],
				[],
				[],
				[],
				[],
				[],
				[],
				[],
				[],
				[],
				[],
				[],
			]
			for (let i = 0; i < events.length; i++) {
				const ep = Object.assign({}, events[i], {
					classes: [...events[i].classes],
					eventRow: 0,
				})
				const continued = ep.startDate < weekStart
				const startOffset = continued
					? 0
					: this.dayDiff(weekStart, ep.startDate)
				const span = Math.min(
					7 - startOffset,
					this.dayDiff(this.addDays(weekStart, startOffset), ep.endDate) + 1
				)
				if (continued) ep.classes.push("continued")
				if (this.dayDiff(weekStart, ep.endDate) > 6)
					ep.classes.push("toBeContinued")
				if (ep.originalEvent.url) ep.classes.push("hasUrl")
				for (let d = 0; d < 7; d++) {
					if (d === startOffset) {
						for (let s = 0; s < 20; s++) {
							if (!eventRows[d][s]) {
								ep.eventRow = s
								eventRows[d][s] = true
								break
							}
						}
					} else if (d < startOffset + span) {
						eventRows[d][ep.eventRow] = true
					}
				}
				ep.classes.push(`offset${startOffset}`)
				ep.classes.push(`span${span}`)
				ep.classes.push(`eventRow${ep.eventRow + 1}`)
				results.push(ep)
			}
			return results
		},

		/*
		Creates the HTML to prefix the event title showing the event's start and/or
		end time. Midnight is not displayed.
		*/
		getFormattedTimeRange(e) {
			const startTime = this.formattedTime(
				e.startDate,
				this.displayLocale,
				this.timeFormatOptions
			)
			const endTime = this.isSameDateTime(e.startDate, e.endDate)
				? ""
				: this.formattedTime(
						e.endDate,
						this.displayLocale,
						this.timeFormatOptions
					)
			const hasStart = startTime !== ""
			const hasEnd = endTime !== ""
			return (
				(hasStart
					? `<span class="startTime${
							hasEnd ? " hasEndTime" : ""
						}">${startTime}</span>`
					: "") +
				(hasEnd
					? `<span class="endTime${
							hasStart ? " hasStartTime" : ""
						}">${endTime}</span>`
					: "")
			)
		},

		getEventTitle(e) {
			if (!this.showEventTimes) return e.title
			return this.getFormattedTimeRange(e) + e.title
		},
	},
}
</script>
<!--

The CSS below represents only the CSS required for proper rendering (positioning, etc.) and
minimalist default borders and colors. Special-day colors, holiday emoji, event colors,
and decorations like border-radius should be part of a theme.

-->
<style type="text/css">
/* Position/Flex */

/* Make the calendar flex vertically */
.calendar-view {
	display: flex;
	flex-direction: column;
}

.calendar-view .header {
	display: flex;
	flex: 0 1 auto;
	flex-flow: row nowrap;
	align-items: center;
	min-height: 2.5em;
}

.calendar-view .header .periodLabel {
	display: flex;
	flex: 1 1 auto;
	flex-flow: row nowrap;
	min-height: 1.2em;
}

.calendar-view .dayList {
	display: flex;
	flex: 0 0 auto;
	flex-flow: row nowrap;
}

.calendar-view .dayList .day {
	display: flex;
	flex: 1 1 0;
	flex-flow: row nowrap;
	align-items: center;
	justify-content: center;
}

/* The calendar grid should take up the remaining vertical space */
.calendar-view .weeks {
	display: flex;
	flex: 1 1 auto;
	flex-flow: column nowrap;
	/* Allow grid to scroll if there are too may weeks to fit in the view */
	overflow-y: scroll;
	-ms-overflow-style: none;
}

/* Use flex basis of 0 on week row so all weeks will be same height regardless of content */
.calendar-view .week {
	display: flex;
	flex: 1 1 0;
	flex-flow: row nowrap;
	min-height: 3em;
	/* Allow week events to scroll if they are too tall */
	position: relative;
	width: 100%;
	overflow-y: scroll;
	-ms-overflow-style: none;
}

.calendar-view .weeks::-webkit-scrollbar,
.calendar-view .week::-webkit-scrollbar {
	width: 0px; /* remove scrollbar space */
	background: transparent; /* optional: just make scrollbar invisible */
}

.calendar-view .week .day {
	display: flex;
	flex: 1 1 0;
	/* When week's events are scrolled, keep the day content fixed */
	position: sticky;
	top: 0;
}

.calendar-view .week .day .content {
	position: absolute;
	left: 0;
	top: 0;
	bottom: 0;
	right: 0;
}

.calendar-view .week .day .date {
	float: right;
	clear: both;
}

.calendar-view .week .event {
	position: absolute;
	text-overflow: ellipsis;
	white-space: nowrap;
	overflow: hidden;
}

/* Header */

.calendar-view .periodLabel .startDay::before,
.calendar-view .periodLabel .endDay::before,
.calendar-view.period-month .periodLabel .startYear::before,
.calendar-view.period-month .periodLabel .endYear::before,
.calendar-view.period-year .periodLabel .endYear::before {
	content: "\00A0";
}

.calendar-view .periodLabel .endMonth::before,
.calendar-view.period-year:not(.periodCount-1) .periodLabel .endYear::before,
.calendar-view.period-week .periodLabel.singleMonth .endDay::before {
	content: "\00A0\2013\00A0";
}

.calendar-view.period-week .periodLabel .startYear::before,
.calendar-view.period-week .periodLabel .endYear::before {
	content: ",\00A0";
}

.calendar-view .periodLabel.singleYear .startYear,
.calendar-view .periodLabel.singleMonth .endMonth,
.calendar-view.period-month .periodLabel .startDay,
.calendar-view.period-month .periodLabel .endDay,
.calendar-view.period-year .periodLabel .startDay,
.calendar-view.period-year .periodLabel .endDay,
.calendar-view.period-year .periodLabel .startMonth,
.calendar-view.period-year .periodLabel .endMonth,
.calendar-view.period-month.periodCount-1 .periodLabel .endMonth,
.calendar-view.period-month.periodCount-1 .periodLabel .startYear,
.calendar-view.period-year.periodCount-1 .periodLabel .startYear {
	display: none;
}

/* Header navigation buttons */

.calendar-view .header .nav .previousPeriod::after {
	content: "<";
}

.calendar-view .header .nav .nextPeriod::after {
	content: ">";
}

.calendar-view .header .nav .previousYear::after {
	content: "<<";
}

.calendar-view .header .nav .nextYear::after {
	content: ">>";
}

.calendar-view .header .nav .currentPeriod {
	display: none;
}

.calendar-view.past .header .nav .currentPeriod,
.calendar-view.future .header .nav .currentPeriod {
	display: inline-block;
}

.calendar-view.past .header .nav .currentPeriod::after {
	content: "\21BB";
}

.calendar-view.future .header .nav .currentPeriod::after {
	content: "\21BA";
}

/* Colors */

.calendar-view .period .day,
.calendar-view .header button {
	background-color: #fff;
}

.calendar-view .header,
.calendar-view .dayList .day {
	background-color: #f0f0f0;
}

.calendar-view .event {
	background-color: #f7f7f7;
}

.calendar-view .header,
.calendar-view .header button,
.calendar-view .dayList,
.calendar-view .weeks,
.calendar-view .week,
.calendar-view .day,
.calendar-view .event {
	border-color: #ddd;
}

/* Event Times */

.calendar-view .event .startTime,
.calendar-view .event .endTime {
	font-weight: bold;
	color: #666;
}

.calendar-view .event .startTime:not(.hasEndTime),
.calendar-view .event .endTime {
	margin-right: 0.4em;
}

.calendar-view .event .endTime::before {
	content: "-";
}

/* Internal Metrics */

.calendar-view,
.calendar-view div,
.calendar-view button {
	box-sizing: border-box;
	line-height: 1em;
	font-size: 1em;
}

.calendar-view .dayList div,
.calendar-view .date,
.calendar-view .event {
	padding: 0.2em;
}

.calendar-view .header .nav,
.calendar-view .header .periodLabel {
	margin: 0.4em 0.6em;
}

.calendar-view .header .nav button,
.calendar-view .header .periodLabel {
	padding: 0.4em 0.6em;
}

/* Allows emoji icons or labels (such as holidays) to be added more easily to specific dates by having the margin set already. */
.calendar-view .day .date::before {
	margin-right: 0.5em;
}

/* Borders */

.calendar-view .weeks {
	border-style: solid;
	border-width: 0 0 1px 1px;
}
.calendar-view .header {
	border-style: solid;
	border-width: 0.05em 0.05em 0 0.05em;
}
.calendar-view .dayList {
	border-style: solid;
	border-width: 0 0 0 1px;
}
.calendar-view .day {
	border-style: solid;
	border-width: 0.05em 0.05em 0 0;
}
.calendar-view .header button,
.calendar-view .event {
	border-style: solid;
	border-width: 0.05em;
}

/* Positioning for event eventRows */

.calendar-view .event.eventRow1 {
	top: 1.4em;
}
.calendar-view .event.eventRow2 {
	top: calc(2 * 1.4em + 0.1em);
}
.calendar-view .event.eventRow3 {
	top: calc(3 * 1.4em + 0.1em);
}
.calendar-view .event.eventRow4 {
	top: calc(4 * 1.4em + 0.1em);
}
.calendar-view .event.eventRow5 {
	top: calc(5 * 1.4em + 0.1em);
}
.calendar-view .event.eventRow6 {
	top: calc(6 * 1.4em + 0.1em);
}
.calendar-view .event.eventRow7 {
	top: calc(7 * 1.4em + 0.1em);
}
.calendar-view .event.eventRow8 {
	top: calc(8 * 1.4em + 0.1em);
}
.calendar-view .event.eventRow9 {
	top: calc(9 * 1.4em + 0.1em);
}
.calendar-view .event.eventRow10 {
	top: calc(10 * 1.4em + 0.1em);
}
.calendar-view .event.eventRow11 {
	top: calc(11 * 1.4em + 0.1em);
}
.calendar-view .event.eventRow12 {
	top: calc(12 * 1.4em + 0.1em);
}
.calendar-view .event.eventRow13 {
	top: calc(13 * 1.4em + 0.1em);
}
.calendar-view .event.eventRow14 {
	top: calc(14 * 1.4em + 0.1em);
}
.calendar-view .event.eventRow15 {
	top: calc(15 * 1.4em + 0.1em);
}
.calendar-view .event.eventRow16 {
	top: calc(16 * 1.4em + 0.1em);
}
.calendar-view .event.eventRow17 {
	top: calc(17 * 1.4em + 0.1em);
}
.calendar-view .event.eventRow18 {
	top: calc(18 * 1.4em + 0.1em);
}
.calendar-view .event.eventRow19 {
	top: calc(19 * 1.4em + 0.1em);
}
.calendar-view .event.eventRow20 {
	top: calc(20 * 1.4em + 0.1em);
}
.calendar-view .event.eventRow0 {
	display: none;
} /* More than 10 eventRows not currently supported */

.calendar-view .event.offset0 {
	left: calc(0.05em);
}
.calendar-view .event.offset1 {
	left: calc((100% / 7) + 0.05em);
}
.calendar-view .event.offset2 {
	left: calc((200% / 7) + 0.05em);
}
.calendar-view .event.offset3 {
	left: calc((300% / 7) + 0.05em);
}
.calendar-view .event.offset4 {
	left: calc((400% / 7) + 0.05em);
}
.calendar-view .event.offset5 {
	left: calc((500% / 7) + 0.05em);
}
.calendar-view .event.offset6 {
	left: calc((600% / 7) + 0.05em);
}

/* Metrics for events spanning dates */

.calendar-view .event.span1 {
	width: calc((100% / 7) - 0.05em);
}
.calendar-view .event.span2 {
	width: calc((200% / 7) - 0.05em);
}
.calendar-view .event.span3 {
	width: calc((300% / 7) - 0.05em);
	text-align: center;
}
.calendar-view .event.span4 {
	width: calc((400% / 7) - 0.05em);
	text-align: center;
}
.calendar-view .event.span5 {
	width: calc((500% / 7) - 0.05em);
	text-align: center;
}
.calendar-view .event.span6 {
	width: calc((600% / 7) - 0.05em);
	text-align: center;
}
.calendar-view .event.span7 {
	width: calc((700% / 7) - 0.05em);
	text-align: center;
}

/* Misc */

.calendar-view .dayList .day {
	text-align: center;
}

.calendar-view .event.hasUrl:hover {
	text-decoration: underline;
}

.calendar-view .event.continued {
	border-left-style: none;
	border-top-left-radius: 0;
	border-bottom-left-radius: 0;
}
</style>
