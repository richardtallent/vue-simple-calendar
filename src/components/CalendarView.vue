<template>
	<div
		aria-label="Calendar"
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
			<div v-if="displayWeekNumbers" class="cv-weeknumber" />
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
		<div :aria-multiselectable="enableDateSelection" class="cv-weeks">
			<div
				v-for="(weekStart, weekIndex) in weeksOfPeriod"
				:key="`${weekIndex}-week`"
				:class="[
					'cv-week',
					'week' + (weekIndex + 1),
					'ws' + isoYearMonthDay(weekStart),
				]"
			>
				<div v-if="displayWeekNumbers" class="cv-weeknumber">
					<slot
						name="weekNumber"
						:date="weekStart"
						:numberInYear="periodStartCalendarWeek + weekIndex"
						:numberInPeriod="weekIndex + 1"
						><span>{{ periodStartCalendarWeek + weekIndex }}</span></slot
					>
				</div>
				<div class="cv-weekdays">
					<div
						v-for="(day, dayIndex) in daysOfWeek(weekStart)"
						:key="getColumnDOWClass(dayIndex)"
						:draggable="enableDateSelection"
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
								hasItems: dayHasItems(day),
								selectionStart: isSameDate(day, selectionStart),
								selectionEnd: isSameDate(day, selectionEnd),
							},
							...((dateClasses && dateClasses[isoYearMonthDay(day)]) || null),
						]"
						:aria-grabbed="
							enableDateSelection ? dayIsSelected(day) : 'undefined'
						"
						:aria-label="day.getDate()"
						:aria-selected="dayIsSelected(day)"
						:aria-dropeffect="
							enableDragDrop && currentDragItem
								? 'move'
								: enableDateSelection && dateSelectionOrigin
								? 'execute'
								: 'none'
						"
						@click="onClickDay(day, $event)"
						@dragstart="onDragDateStart(day, $event)"
						@drop.prevent="onDrop(day, $event)"
						@dragover.prevent="onDragOver(day, $event)"
						@dragenter.prevent="onDragEnter(day, $event)"
						@dragleave.prevent="onDragLeave(day, $event)"
					>
						<div class="cv-day-number">{{ day.getDate() }}</div>
						<slot :day="day" name="dayContent" />
					</div>
					<template v-for="i in getWeekItems(weekStart)">
						<slot
							:value="i"
							:weekStartDate="weekStart"
							:top="getItemTop(i)"
							name="item"
						>
							<div
								:key="i.id"
								:draggable="enableDragDrop"
								:aria-grabbed="
									enableDragDrop ? i == currentDragItem : 'undefined'
								"
								:class="i.classes"
								:title="i.title"
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
				</div>
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
		showDate: { type: Date, default: undefined },
		displayPeriodUom: { type: String, default: "month" },
		displayPeriodCount: { type: Number, default: 1 },
		displayWeekNumbers: { type: Boolean, default: false },
		locale: { type: String, default: undefined },
		monthNameFormat: { type: String, default: "long" },
		weekdayNameFormat: { type: String, default: "short" },
		showTimes: { type: Boolean, default: false },
		timeFormatOptions: { type: Object, default: () => {} },
		disablePast: { type: Boolean, default: false },
		disableFuture: { type: Boolean, default: false },
		enableDateSelection: { type: Boolean, default: false },
		selectionStart: { type: Date, default: null },
		selectionEnd: { type: Date, default: null },
		enableDragDrop: { type: Boolean, default: false },
		startingDayOfWeek: { type: Number, default: 0 },
		items: { type: Array, default: () => [] },
		dateClasses: { type: Object, default: () => {} },
		itemTop: { type: String, default: "1.4em" },
		itemContentHeight: { type: String, default: "1.4em" },
		itemBorderHeight: { type: String, default: "2px" },
		periodChangedCallback: { type: Function, default: undefined },
		currentPeriodLabel: { type: String, default: "" },
		currentPeriodLabelIcons: { type: String, default: "⇤-⇥" },
		doEmitItemMouseEvents: { type: Boolean, default: false },
	},

	data: () => ({
		currentDragItem: null,
		dateSelectionOrigin: null,
		currentHoveredItemId: undefined,
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

		periodStartCalendarWeek() {
			const firstWeekStarts = this.beginningOfWeek(
				this.beginningOfPeriod(this.periodStart, "year"),
				this.startingDayOfWeek
			)
			const periodWeekStarts = this.beginningOfWeek(
				this.periodStart,
				this.startingDayOfWeek
			)
			return 1 + Math.floor(this.dayDiff(firstWeekStarts, periodWeekStarts) / 7)
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

		// Ensure all item properties have suitable default
		fixedItems() {
			const self = this
			if (!this.items) return []
			return this.items.map((e) =>
				self.normalizeItem(
					e,
					self.currentHoveredItemId && e.id === self.currentHoveredItemId
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
				fixedItems: this.fixedItems,
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

		onClickDay(day, windowEvent) {
			if (this.disablePast && this.isInPast(day)) return
			if (this.disableFuture && this.isInFuture(day)) return
			this.$emit(
				"click-date",
				day,
				this.findAndSortItemsInDateRange(day, day),
				windowEvent
			)
		},

		onClickItem(calendarItem, windowEvent) {
			this.$emit("click-item", calendarItem, windowEvent)
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
		// Hover items (#95, #136)
		// ******************************

		onMouseEnterItem(calendarItem, windowEvent) {
			this.currentHoveredItemId = calendarItem.id
			if (this.doEmitItemMouseEvents) {
				this.$emit("item-mouseenter", calendarItem, windowEvent)
			}
		},

		onMouseLeaveItem(calendarItem, windowEvent) {
			this.currentHoveredItemId = undefined
			if (this.doEmitItemMouseEvents) {
				this.$emit("item-mouseleave", calendarItem, windowEvent)
			}
		},

		// ******************************
		// Dragging across days (selection)
		// ******************************

		onDragDateStart(day, windowEvent) {
			if (!this.enableDateSelection) return false
			// Push the date where the selection started into dataTransfer. This is not used by this component, but
			// a value required in Firefox and possibly other browsers.
			windowEvent.dataTransfer.setData("text", day.toString())
			let img = new Image()
			img.src =
				"data:image/gif;base64,R0lGODlhAQABAIAAAP///wAAACH5BAEAAAAALAAAAAABAAEAAAICRAEAOw=="
			windowEvent.dataTransfer.setDragImage(img, 10, 10)
			this.dateSelectionOrigin = day
			this.emitDateSelection("date-selection-start", day, windowEvent)
			return true
		},

		// ******************************
		// Drag and drop items
		// ******************************

		onDragItemStart(calendarItem, windowEvent) {
			if (!this.enableDragDrop) return false
			// Firefox and possibly other browsers require dataTransfer to be set, even if the value is not used. IE11
			// requires that the first argument be exactly "text" (not "text/plain", etc.). The calendar item's ID is
			// passed, allowing calling applications to receive items dragged outside the component.
			windowEvent.dataTransfer.setData("text", calendarItem.id.toString())
			// However, we don't use dataTransfer within the component. Instead, we just keep a handled on the item
			// currently being dragged. This avoids having to look it up later.
			this.currentDragItem = calendarItem
			// Reset date selection origin so the onenter events aren't confused
			this.dateSelectionOrigin = null
			// Allow the calling application to add additional functionality.
			this.$emit("drag-start", calendarItem, windowEvent)
			return true
		},

		handleDragEvent(bubbleEventName, bubbleParam, windowEvent) {
			if (!this.enableDragDrop) return false
			// If the user drags an item FROM this calendar TO this calendar, currentDragItem will be initialized to the
			// most recent item with a dragStart event. If not, we still emit the event, and the caller will need to
			// determine what to do based on the third argument (windowEvent, which gives them access to `dataTransfer`).
			// This allows developers to create custom calendars where things can be dragged in from the outside. This
			// also allows developers using scoped slots for items to handle the drag and drop themselves.
			this.$emit(
				bubbleEventName,
				this.currentDragItem,
				bubbleParam,
				windowEvent
			)
			return true
		},

		onDragOver(day, windowEvent) {
			this.handleDragEvent("drag-over-date", day, windowEvent)
		},

		onDragEnter(day, windowEvent) {
			if (this.enableDateSelection && this.dateSelectionOrigin) {
				// User is selecting dates, not items.
				this.emitDateSelection("date-selection", day, windowEvent)
				return
			}
			if (!this.handleDragEvent("drag-enter-date", day, windowEvent)) return
			windowEvent.target.classList.add("draghover")
		},

		onDragLeave(day, windowEvent) {
			// User is selecting dates, not items. No emit.
			if (this.enableDateSelection && this.currentSelectionStartDate) return
			if (!this.handleDragEvent("drag-leave-date", day, windowEvent)) return
			windowEvent.target.classList.remove("draghover")
		},

		onDrop(day, windowEvent) {
			if (this.enableDateSelection && this.dateSelectionOrigin) {
				// User is selecting dates, not items.
				this.emitDateSelection("date-selection-finish", day, windowEvent)
				return
			}
			if (!this.handleDragEvent("drop-on-date", day, windowEvent)) return
			windowEvent.target.classList.remove("draghover")
		},

		emitDateSelection(eventName, toDate, windowEvent) {
			this.$emit(
				eventName,
				toDate <= this.dateSelectionOrigin
					? [toDate, this.dateSelectionOrigin, windowEvent]
					: [this.dateSelectionOrigin, toDate, windowEvent]
			)
		},

		// ******************************
		// Calendar Items
		// ******************************

		itemComparer(a, b) {
			if (a.startDate < b.startDate) return -1
			if (b.startDate < a.startDate) return 1
			if (a.endDate > b.endDate) return -1
			if (b.endDate > a.endDate) return 1
			return a.id < b.id ? -1 : 1
		},

		findAndSortItemsInWeek(weekStart) {
			// Return a list of items that INCLUDE any portion of a given week.
			return this.findAndSortItemsInDateRange(
				weekStart,
				this.addDays(weekStart, 6)
			)
		},

		findAndSortItemsInDateRange(startDate, endDate) {
			// Return a list of items that INCLUDE any day within the date range,
			// inclusive, sorted so items that start earlier are returned first.
			return this.fixedItems
				.filter(
					(item) =>
						item.endDate >= startDate &&
						this.dateOnly(item.startDate) <= endDate,
					this
				)
				.sort(this.itemComparer)
		},

		dayHasItems(day) {
			return this.fixedItems.find(
				(d) => d.endDate >= day && this.dateOnly(d.startDate) <= day
			)
		},

		dayIsSelected(day) {
			if (!this.selectionStart || day < this.selectionStart) return false
			if (!this.selectionEnd || day > this.selectionEnd) return false
			return true
		},

		getWeekItems(weekStart) {
			// Return a list of items that CONTAIN the week starting on a day.
			// Sorted so the items that start earlier are always shown first.
			const items = this.findAndSortItemsInWeek(weekStart)
			const results = []
			const itemRows = [[], [], [], [], [], [], []]
			for (let i = 0; i < items.length; i++) {
				const ep = Object.assign({}, items[i], {
					classes: [...items[i].classes],
					itemRow: 0,
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
		},

		/*
		Creates the HTML to prefix the item title showing the item's start and/or
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

		getItemTitle(e) {
			if (!this.showTimes) return e.title
			return this.getFormattedTimeRange(e) + " " + e.title
		},

		getItemTop(e) {
			// Compute the top position of the item based on its assigned row within the given week.
			const r = e.itemRow
			const h = this.itemContentHeight
			const b = this.itemBorderHeight
			return `calc(${this.itemTop} + ${r}*${h} + ${r}*${b})`
		},
	},
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
	align-self: flex-start;
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
}*/

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
.cv-week::-webkit-scrollbar {
	width: 0; /* remove scrollbar space */
	background: transparent; /* optional: just make scrollbar invisible */
}
</style>
