<template>
	<div
		:class="[
			'cv-wrapper',
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
			},
		]"
	>
		<slot :header-props="headerProps" name="header" />
		<div class="cv-header-days">
			<template v-for="(label, index) in weekdayNames">
				<slot :index="getColumnDOWClass(index)" :label="label" name="dayHeader">
					<div
						:key="getColumnDOWClass(index)"
						:class="getColumnDOWClass(index)"
						class="cv-header-day"
					>
						{{ label }}
					</div>
				</slot>
			</template>
		</div>
		<div class="cv-weeks">
			<div
				v-for="(weekStart, weekIndex) in weeksOfPeriod"
				:key="`${weekIndex}-week`"
				:class="[
					'cv-week',
					'week' + (weekIndex + 1),
					'ws' + isoYearMonthDay(weekStart),
				]"
			>
				<div
					v-for="(day, dayIndex) in daysOfWeek(weekStart)"
					:key="getColumnDOWClass(dayIndex)"
					:class="[
						'cv-day',
						getColumnDOWClass(dayIndex),
						'd' + isoYearMonthDay(day),
						'd' + isoMonthDay(day),
						'd' + paddedDay(day),
						'instance' + instanceOfMonth(day),
						{
							today: isSameDate(day, today()),
							outsideOfMonth: !isSameMonth(day, defaultedShowDate),
							past: isInPast(day),
							future: isInFuture(day),
							last: isLastDayOfMonth(day),
							lastInstance: isLastInstanceOfMonth(day),
						},
						...((dateClasses && dateClasses[isoYearMonthDay(day)]) || null),
					]"
					@click="onClickDay(day)"
					@drop.prevent="onDrop(day, $event)"
					@dragover.prevent="onDragOver(day)"
					@dragenter.prevent="onDragEnter(day, $event)"
					@dragleave.prevent="onDragLeave(day, $event)"
				>
					<div class="cv-day-number">{{ day.getDate() }}</div>
					<slot :day="day" name="dayContent" />
				</div>
				<template v-for="e in getWeekEvents(weekStart)">
					<slot
						:event="e"
						:weekStartDate="weekStart"
						:top="getEventTop(e)"
						name="event"
					>
						<div
							:key="e.id"
							:draggable="enableDragDrop"
							:class="e.classes"
							:title="e.title"
							:style="`top:${getEventTop(e)};${e.originalEvent.style}`"
							class="cv-event"
							@dragstart="onDragStart(e, $event)"
							@mouseenter="onMouseEnter(e)"
							@mouseleave="onMouseLeave"
							@click.stop="onClickEvent(e)"
							v-html="getEventTitle(e)"
						/>
					</slot>
				</template>
			</div>
		</div>
	</div>
</template>

<script>
import CalendarMathMixin from "./CalendarMathMixin"
import CalendarViewHeader from "./CalendarViewHeader.vue"

export default {
	name: "CalendarView",

	components: { CalendarViewHeader },

	mixins: [CalendarMathMixin],

	props: {
		showDate: { type: Date, default: undefined },
		displayPeriodUom: { type: String, default: "month" },
		displayPeriodCount: { type: Number, default: 1 },
		locale: { type: String, default: undefined },
		monthNameFormat: { type: String, default: "long" },
		weekdayNameFormat: { type: String, default: "short" },
		showEventTimes: { type: Boolean, default: false },
		timeFormatOptions: { type: Object, default: () => {} },
		disablePast: { type: Boolean, default: false },
		disableFuture: { type: Boolean, default: false },
		enableDragDrop: { type: Boolean, default: false },
		startingDayOfWeek: { type: Number, default: 0 },
		events: { type: Array, default: () => [] },
		dateClasses: { type: Object, default: () => {} },
		eventTop: { type: String, default: "1.4em" },
		eventContentHeight: { type: String, default: "1.4em" },
		eventBorderHeight: { type: String, default: "2px" },
		periodChangedCallback: { type: Function, default: undefined },
		currentPeriodLabel: { type: String, default: "" },
		currentPeriodLabelIcons: { type: String, default: "⇤-⇥" },
	},

	data: () => ({
		currentDragEvent: null,
		currentHoveredEventId: undefined,
	}),

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
		"outside of month" class. Any time component passed as part of showDate is discarded.
		*/
		defaultedShowDate() {
			if (this.showDate) return this.dateOnly(this.showDate)
			return this.today()
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

		// Cache the names based on current locale and format settings
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

		// Ensure all event properties have suitable default
		fixedEvents() {
			const self = this
			return this.events.map(e =>
				self.normalizeEvent(
					e,
					self.currentHoveredEventId && e.id === self.currentHoveredEventId
				)
			)
		},

		// Creates the HTML to render the date range for the calendar header.
		periodLabel() {
			return this.formattedPeriod(
				this.periodStart,
				this.periodEnd,
				this.displayPeriodUom,
				this.monthNames
			)
		},
		// Period that today's date sits within
		currentPeriodStart() {
			return this.beginningOfPeriod(
				this.today(),
				this.displayPeriodUom,
				this.startingDayOfWeek
			)
		},
		currentPeriodEnd() {
			return this.addDays(
				this.incrementPeriod(
					this.currentPeriodStart,
					this.displayPeriodUom,
					this.displayPeriodCount
				),
				-1
			)
		},
		currentPeriodLabelFinal() {
			const c = this.currentPeriodStart
			const s = this.periodStart
			if (!this.currentPeriodLabel)
				return this.formattedPeriod(
					c,
					this.currentPeriodEnd,
					this.displayPeriodUom,
					this.monthNames
				)
			if (this.currentPeriodLabel === "icons")
				return this.currentPeriodLabelIcons[Math.sign(c - s) + 1]
			return this.currentPeriodLabel
		},
		headerProps() {
			return {
				// Dates for UI navigation
				previousYear: this.getIncrementedPeriod(-12),
				previousPeriod: this.getIncrementedPeriod(-1),
				nextPeriod: this.getIncrementedPeriod(1),
				previousFullPeriod: this.getIncrementedPeriod(-this.displayPeriodCount),
				nextFullPeriod: this.getIncrementedPeriod(this.displayPeriodCount),
				nextYear: this.getIncrementedPeriod(12),
				currentPeriod: this.currentPeriodStart,
				currentPeriodLabel: this.currentPeriodLabelFinal,
				// Dates for header display
				periodStart: this.periodStart,
				periodEnd: this.periodEnd,
				// Extra information that could be useful to a custom header
				displayLocale: this.displayLocale,
				displayFirstDate: this.displayFirstDate,
				displayLastDate: this.displayLastDate,
				monthNames: this.monthNames,
				fixedEvents: this.fixedEvents,
				periodLabel: this.periodLabel,
			}
		},
		periodRange() {
			return {
				periodStart: this.periodStart,
				periodEnd: this.periodEnd,
				displayFirstDate: this.displayFirstDate,
				displayLastDate: this.displayLastDate,
			}
		},
	},

	watch: {
		periodRange: {
			immediate: true,
			handler(newVal) {
				if (this.periodChangedCallback) {
					this.$emit("period-changed")
					this.periodChangedCallback(newVal, "watch")
				}
			},
		},
	},

	methods: {
		// ******************************
		// UI Events
		// ******************************

		onClickDay(day) {
			if (this.disablePast && this.isInPast(day)) return
			if (this.disableFuture && this.isInFuture(day)) return
			this.$emit("click-date", day)
		},

		onClickEvent(e) {
			this.$emit("click-event", e)
		},

		/*
		The day name header needs to know the dow for class assignment, and this value should
		not change based on startingDayOfWeek (i.e., Sunday is always 0). This function
		computes the dow for a given day index.
		*/
		getColumnDOWClass(dayIndex) {
			return "dow" + ((dayIndex + this.startingDayOfWeek) % 7)
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

		// ******************************
		// Hover events (#95)
		// ******************************
		onMouseEnter(calendarEvent) {
			this.currentHoveredEventId = calendarEvent.id
		},
		onMouseLeave() {
			this.currentHoveredEventId = undefined
		},

		// ******************************
		// Drag and drop events
		// ******************************

		onDragStart(calendarEvent, windowEvent) {
			if (!this.enableDragDrop) return false
			// Not using dataTransfer.setData to store the event ID because it (a) doesn't allow access to the data being
			// dragged during dragover, dragenter, and dragleave events, and because storing an ID requires an unnecessary
			// lookup. This does limit the drop zones to areas within this instance of this component.
			this.currentDragEvent = calendarEvent
			// Firefox and possibly other browsers require dataTransfer to be set, even if the value is not used. IE11
			// requires that the first argument be exactly "text" (not "text/plain", etc.).
			windowEvent.dataTransfer.setData("text", "foo")
			this.$emit("drag-start", calendarEvent)
			return true
		},

		handleDragEvent(bubbleEventName, bubbleParam) {
			if (!this.enableDragDrop) return false
			if (!this.currentDragEvent) {
				// shouldn't happen
				// If current drag event is not set, check if user has set its own slot for events
				if (!this.$scopedSlots["event"]) return false
			}
			this.$emit(bubbleEventName, this.currentDragEvent, bubbleParam)
			return true
		},

		onDragOver(day) {
			this.handleDragEvent("drag-over-date", day)
		},

		onDragEnter(day, windowEvent) {
			if (!this.handleDragEvent("drag-enter-date", day)) return
			windowEvent.target.classList.add("draghover")
		},

		onDragLeave(day, windowEvent) {
			if (!this.handleDragEvent("drag-leave-date", day)) return
			windowEvent.target.classList.remove("draghover")
		},

		onDrop(day, windowEvent) {
			if (!this.handleDragEvent("drop-on-date", day)) return
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
			const eventRows = [[], [], [], [], [], [], []]
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
				if (this.isInPast(ep.endDate)) ep.classes.push("past")
				if (ep.originalEvent.url) ep.classes.push("hasUrl")
				for (let d = 0; d < 7; d++) {
					if (d === startOffset) {
						let s = 0
						while (eventRows[d][s]) s++
						ep.eventRow = s
						eventRows[d][s] = true
					} else if (d < startOffset + span) {
						eventRows[d][ep.eventRow] = true
					}
				}
				ep.classes.push(`offset${startOffset}`)
				ep.classes.push(`span${span}`)
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
			let endTime = ""
			if (!this.isSameDateTime(e.startDate, e.endDate)) {
				endTime = this.formattedTime(
					e.endDate,
					this.displayLocale,
					this.timeFormatOptions
				)
			}
			return (
				(startTime !== ""
					? `<span class="startTime">${startTime}</span>`
					: "") +
				(endTime !== "" ? `<span class="endTime">${endTime}</span>` : "")
			)
		},

		getEventTitle(e) {
			if (!this.showEventTimes) return e.title
			return this.getFormattedTimeRange(e) + " " + e.title
		},

		getEventTop(e) {
			// Compute the top position of the event based on its assigned row within the given week.
			const r = e.eventRow
			const h = this.eventContentHeight
			const b = this.eventBorderHeight
			return `calc(${this.eventTop} + ${r}*${h} + ${r}*${b})`
		},
	},
}
</script>
<!--

The CSS below represents only the CSS required for proper rendering (positioning, etc.) and
minimalist default borders and colors. Special-day colors, holiday emoji, event colors,
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
}

/* Use flex basis of 0 on week row so all weeks will be same height regardless of content */
.cv-week {
	display: flex;
	/* Shorthand flex: 1 1 0 not supported by IE11 */
	flex-grow: 1;
	flex-shrink: 0;
	flex-basis: 0;
	flex-flow: row nowrap;
	min-height: 3em;
	border-width: 0;

	/* Allow week events to scroll if they are too tall */
	position: relative;
	width: 100%;
	overflow-y: auto;
	-ms-overflow-style: none;
}

.cv-day {
	display: flex;
	/* Shorthand flex: 1 1 0 not supported by IE11 */
	flex-grow: 1;
	flex-shrink: 0;
	flex-basis: 0;
	position: relative; /* Fallback for IE11, which doesn't support sticky */
	position: sticky; /* When week's events are scrolled, keep the day content fixed */
	top: 0;
	border-width: 1px 1px 0 0;
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
*/

_:-ms-lang(x),
.cv-day {
	position: relative;
}
*/ .cv-day-number {
	position: absolute;
	right: 0;
}

.cv-event {
	position: absolute;
	white-space: nowrap;
	overflow: hidden;
	background-color: #f7f7f7;
	border-width: 1px;
}

/* Wrap to show entire event title on hover */
.cv-wrapper.wrap-event-title-on-hover .cv-event:hover {
	white-space: normal;
	z-index: 1;
}

/* Colors */

.cv-header-days,
.cv-header-day,
.cv-weeks,
.cv-week,
.cv-day,
.cv-event {
	border-style: solid;
	border-color: #ddd;
}

/* Event Times */
.cv-event .endTime::before {
	content: "-";
}

/* Internal Metrics */
.cv-header-day,
.cv-day-number,
.cv-event {
	padding: 0.2em;
}

/* Allows emoji icons or labels (such as holidays) to be added more easily to specific dates by having the margin set already. */
.cv-day-number::before {
	margin-right: 0.5em;
}

.cv-event.offset0 {
	left: 0;
}

.cv-event.offset1 {
	left: calc((100% / 7));
}

.cv-event.offset2 {
	left: calc((200% / 7));
}

.cv-event.offset3 {
	left: calc((300% / 7));
}

.cv-event.offset4 {
	left: calc((400% / 7));
}

.cv-event.offset5 {
	left: calc((500% / 7));
}

.cv-event.offset6 {
	left: calc((600% / 7));
}

/* Metrics for events spanning dates */

.cv-event.span1 {
	width: calc((100% / 7) - 0.05em);
}

.cv-event.span2 {
	width: calc((200% / 7) - 0.05em);
}

.cv-event.span3 {
	width: calc((300% / 7) - 0.05em);
	text-align: center;
}

.cv-event.span4 {
	width: calc((400% / 7) - 0.05em);
	text-align: center;
}

.cv-event.span5 {
	width: calc((500% / 7) - 0.05em);
	text-align: center;
}

.cv-event.span6 {
	width: calc((600% / 7) - 0.05em);
	text-align: center;
}

.cv-event.span7 {
	width: calc((700% / 7) - 0.05em);
	text-align: center;
}

/* Hide scrollbars for the grid and the week */
.cv-weeks::-webkit-scrollbar,
.cv-week::-webkit-scrollbar {
	width: 0; /* remove scrollbar space */
	background: transparent; /* optional: just make scrollbar invisible */
}
</style>
