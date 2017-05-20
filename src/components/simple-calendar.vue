<template>
	<div class="calendar" :class="[
				'locale-' + languageCode,
				'locale-' + locale
			]">
		<div class="header">
			<div class="previousMonth"><button @click="onClickPreviousMonth" :disabled="disablePast && (today > endOfPreviousMonth(showDate))"></button></div>
			<div class="thisMonth">
				<div class="monthLabel">
					<span class="monthname">{{monthName(showDate)}}</span>
					<span class="yearnumber">{{showDate.getFullYear()}}</span>
				</div>
				<div class="currentMonth" v-if="!isSameMonth(today, showDate)"><button @click="onClickCurrentMonth"></button></div>
			</div>
			<div class="nextMonth"><button @click="onClickNextMonth" :disabled="disableFuture && (today < beginningOfNextMonth(showDate))"></button></div>
		</div>
		<div class="daylist">
			<div class="day" v-for="(w, index) in weekdayNames" :class="'dow'+index">{{w}}</div>
		</div>
		<div class="month">
			<div v-for="(weekStart, weekIndex) in weeks" class="week" :class="['week' + (weekIndex+1), 'ws' + isoYearMonthDay(weekStart)]">
				<div v-for="day in daysOfWeek(weekStart)" class="day" 
					@drop="onDrop($event, day)"
					@dragover="onDragOver($event)"
					@dragenter="onDragEnter($event, day)"
					@dragleave="onDragLeave($event, day)"
					:class="[
						'dow' + day.getDay(),
						'd' + isoYearMonthDay(day),
						'd' + isoMonthDay(day),
						{
							outsideOfMonth : day.getMonth() != showDate.getMonth(),
							today : isSameDate(day, today),
							past : isInPast(day)
						}
					]" @click="onClickDay(day)">
					<div class="content">
						<div class="date">{{day.getDate()}}</div>
					</div>
				</div>
				<div v-for="e in getWeekEvents(weekStart)"
					class="event"
					:draggable="enableDragDrop"
					@dragstart="onDragStart($event, e)"
					@click.stop="onClickEvent(e)"
					:class="e.classes"
					:title="e.details.title"
					v-html="e.details.title"></div>
				</div>
		</div>
	</div>
</template>

<script>

export default {
	name: 'hello',

	data() {
		return {};
	},

	props: {
		events: {
			type: Array,
			default() { return []; },
		},
		showDate: {
			type: Date,
			default() {
				const d = new Date();
				d.setHours(0, 0, 0, 0);
				return d;
			},
		},
		monthNameFormat: {
			type: String,
			default() { return 'short'; },
		},
		weekdayNameFormat: {
			type: String,
			default() { return 'short'; },
		},
		locale: {
			type: String,
			default() {
				return (
					(navigator.languages && navigator.languages.length) ?
						navigator.languages[0]
						: navigator.language || navigator.browserLanguage
				).toLowerCase();
			},
		},
		disablePast: {
			type: Boolean,
			default() { return false; },
		},
		disableFuture: {
			type: Boolean,
			default() { return false; },
		},
		enableDragDrop: {
			default() { return false; },
		},
	},

	computed: {
		today() {
			const d = new Date();
			d.setHours(0, 0, 0, 0);
			return d;
		},
		languageCode() {
			return this.locale.substring(0, 2);
		},
		weeks() {
			// Returns an array of object representing the date of the beginning of each week
			// included in the view (which, by default, consists of an entire month).
			const firstDate = this.beginningOfCalendar(this.showDate);
			const lastDate = this.endOfCalendar(this.showDate);
			const numWeeks = Math.floor(this.dayDiff(firstDate, lastDate) / 7);
			const result = [];
			for (let x = 0; x < numWeeks; x++) {
				result.push(this.addDays(firstDate, x * 7));
			}
			return result;
		},
		weekdayNames() {
			if (typeof Intl === 'undefined') {
				return ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
			}
			const formatter = new Intl.DateTimeFormat(this.locale, { weekday: this.weekdayNameFormat });
			const names = [];
			for (let dayIndex = 0; dayIndex < 7; dayIndex++) {
				// 2017 starts on a Sunday, so use it to capture the locale's weekday names
				const sampleDate = new Date(2017, 0, dayIndex + 1, 0, 0, 0);
				names[dayIndex] = formatter.format(sampleDate);
			}
			return names;
		},
		allowLastMonthClick() {
			if (!this.disablePast) return true;
			const endOfLastMonth = this.addDays(this.beginningOfMonth(this.showDate), -1);
			return endOfLastMonth >= this.today;
		},
		allowNextMonthClick() {
			if (!this.disableFuture) return true;
			const beginningOfNextMonth = this.addDays(this.endOfMonth(this.showDate), 1);
			return beginningOfNextMonth <= this.today;
		},
	},

	methods: {

		addDays(d, days) {
			const d2 = new Date(d);
			d2.setDate(d.getDate() + days);
			return d2;
		},

		isSameDate(d1, d2) {
			// http://stackoverflow.com/questions/492994/compare-two-dates-with-javascript
			return d1.getTime() === d2.getTime();
		},

		isSameMonth(d1, d2) {
			return d1.getFullYear() === d2.getFullYear() && d1.getMonth() === d2.getMonth();
		},

		daysOfWeek(weekStart) {
			const result = [];
			for (let x = 0; x < 7; x++) result.push(this.addDays(weekStart, x));
			return result;
		},

		isInPast(d) {
			// Could be more terse, but gets date parts lazily for performance.
			const currentYear = this.today.getFullYear();
			const yr = d.getFullYear();
			if (yr < currentYear) return true;
			if (yr > currentYear) return false;
			const currentMonth = this.today.getMonth();
			const month = d.getMonth();
			if (month < currentMonth) return true;
			if (month > currentMonth) return false;
			const dayNumber = d.getDate();
			const currentDay = this.today.getDate();
			return dayNumber < currentDay;
		},

		isoYearMonthDay: d => d.toISOString().slice(0, 10),

		isoMonthDay: d => d.toISOString().slice(5, 10),

		beginningOfMonth: d => new Date(d.getFullYear(), d.getMonth(), 1),

		endOfMonth: d => new Date(d.getFullYear(), d.getMonth() + 1, 0),

		endOfPreviousMonth: d => new Date(d.getFullYear(), d.getMonth(), 0),

		beginningOfPreviousMonth: d => new Date(d.getFullYear(), d.getMonth() - 1, 1),

		beginningOfNextMonth: d => new Date(d.getFullYear(), d.getMonth() + 1, 1),

		beginningOfWeek(d) { return this.addDays(d, 0 - d.getDay()); },

		endOfWeek(d) { return this.addDays(d, 7 - d.getDay()); },

		beginningOfCalendar(d) { return this.beginningOfWeek(this.beginningOfMonth(d)); },

		endOfCalendar(d) { return this.endOfWeek(this.endOfMonth(d)); },

		// Number of days between two dates (times must be 0)
		dayDiff(d1, d2) { return (d2 - d1) / 86400000; },

		// Name of the given month (only used once)
		monthName(d) {
			// Use the user's locale if possible to obtain the name of the month
			if (typeof Intl === 'undefined') {
				return ['Jan', 'Feb', 'Mar', 'Apr', 'May',
					'June', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'][d.getMonth()];
			}
			const formatter = new Intl.DateTimeFormat(this.locale, { month: this.monthNameFormat });
			return formatter.format(d);
		},

		monthWeek(d) {
			return 1 + Math.floor(this.dayDiff(this.beginningOfCalendar(this.showDate), d) / 7);
		},

		onClickDay(day) {
			if (this.disablePast && this.isInPast(day)) return;
			this.$emit('clickDay', day);
		},

		onClickEvent(e, day) {
			this.$emit('clickEvent', e.details, day);
		},

		onClickPreviousMonth() {
			this.$emit('setShowDate', this.beginningOfPreviousMonth(this.showDate));
		},

		onClickNextMonth() {
			this.$emit('setShowDate', this.beginningOfNextMonth(this.showDate));
		},

		onClickCurrentMonth() {
			this.$emit('setShowDate', this.beginningOfMonth(this.today));
		},

		findAndSortEventsInWeek(weekStart) {
			// Return a list of events that CONTAIN the week starting on a day.
			// Sorted so the events that start earlier are always shown first.
			const events = this.events.filter(event =>
				event.startDate < this.addDays(weekStart, 7)
				&& event.endDate >= weekStart
			, this).sort((a, b) => {
				if (a.startDate < b.startDate) return -1;
				if (b.startDate < a.startDate) return 1;
				if (a.endDate > b.endDate) return -1;
				if (b.endDate > a.endDate) return 1;
				return a.id < b.id ? -1 : 1;
			});
			return events;
		},

		getWeekEvents(weekStart) {
			// Return a list of events that CONTAIN the week starting on a day.
			// Sorted so the events that start earlier are always shown first.
			const events = this.findAndSortEventsInWeek(weekStart);
			const results = [];
			const slots = [[], [], [], [], [], [], [], [], [], []];
			for (let i = 0; i < events.length; i++) {
				const e = events[i];
				const ep = { details: e, slot: 0 };
				const continued = e.startDate < weekStart;
				const startOffset = continued ? 0 : this.dayDiff(weekStart, e.startDate);
				const toBeContinued = this.dayDiff(weekStart, e.endDate) > 7;
				const span = Math.min(
					7 - startOffset,
					this.dayDiff(this.addDays(weekStart, startOffset), e.endDate) + 1);
				for (let d = 0; d < 7; d++) {
					if (d === startOffset) {
						for (let s = 0; s < 10; s++) {
							if (!slots[d][s]) {
								ep.slot = s;
								slots[d][s] = true;
								break;
							}
						}
					} else if (d < startOffset + span) {
						slots[d][ep.slot] = true;
					}
				}
				ep.classes = [
					`offset${startOffset}`,
					`span${span}`,
					`slot${ep.slot + 1}`,
					{
						continued,
						toBeContinued,
						hasUrl: e.url,
					},
				];
				if (e.classes) ep.classes = ep.classes.concat(e.classes);
				results.push(ep);
			}
			return results;
		},

		onDragStart(ev, calendarEvent) {
			if (!this.enableDragDrop) return;
			ev.dataTransfer.setData('calendarEventId', calendarEvent.details.id);
		},

		onDragOver(ev) {
			if (!this.enableDragDrop) return;
			ev.preventDefault();
		},

		onDragEnter(ev, day) {
			if (!this.enableDragDrop) return;
			ev.target.classList.add('draghover');
			const calendarEventId = ev.dataTransfer.getData('calendarEventId');
			this.$emit('dragEventEnterDate', calendarEventId, day);
		},

		onDragLeave(ev, day) {
			if (!this.enableDragDrop) return;
			ev.preventDefault();
			ev.target.classList.remove('draghover');
			const calendarEventId = ev.dataTransfer.getData('calendarEventId');
			this.$emit('dragEventLeaveDate', calendarEventId, day);
		},

		onDrop(ev, day) {
			if (!this.enableDragDrop) return;
			ev.preventDefault();
			ev.target.classList.remove('draghover');
			const calendarEventId = ev.dataTransfer.getData('calendarEventId');
			this.$emit('dropEventOnDate', calendarEventId, day);
		},

	},

};

/*

It is possible to have the events "float" by having a width set to multiples of 100%.
However, the subsequent days would need to position their own new events to below the
lowest one by tracking the number that have been continued from the previous period
and putting a placeholder at the 0-level z-index to hold the vertical place.
Using v-for is highly inefficient for this--need some sort of two-sided stack instead,
where events are popped from the front as they expire and are tacked on the end as
they continue to the next day.

*/
</script>

<style type="text/css">

.calendar,
.calendar div {
	box-sizing: border-box;
}

.month,
.header,
.week,
.daylist {
	display: flex;
	width: 100%;
	flex-wrap: wrap;
	flex-direction: row;
	justify-content: flex-start;
	align-items: stretch;
	align-content: flex-start;
	border-style: solid;
	border-color: #DDD;
}

.month {
	flex-direction: column;
}

.header {
	border-width: 0.05em 0.05em 0 0.05em;
	justify-content: space-between;
}

.header > div {
	margin: 0.5em;
}

.header .thisMonth {
	display: flex;
	flex-direction: row;
}

.header .currentMonth {
	margin-left: 1em;
}

.week {
	position: relative;
	width: 100%;
	padding: 0;
	margin: 0;
	border: none;
}

.daylist div {
	padding: 0.3em;
}

.header .monthLabel {
	padding: 0.25em;

}

.header button {
	padding: 0.5em 1em;
	background-color: transparent;
	border: 1px solid #ccc;
}

.previousMonth button::after {
	content: "\25C0";
}

.nextMonth button::after {
	content: "\25BA";
}

.currentMonth button::after {
	content: '\21BB';
}

.daylist {
	border-width: 0 0 0 0.05em;
}

.daylist .day {
	text-align: center;
}

.month {
	border-width: 0 0 0.05em 0.05em;
	overflow: hidden;
}

.day {
	position: relative;
	border-style: solid;
	border-color: #DDD;
	border-width: 0.05em 0.05em 0 0;
	width: 14.285714%;
	background-color: #fff;
}

.day .content.draghover {
	border: 3px solid yellow;
}

/* Use z-index to ensure events too tall for the view are clipped vertically */

.month .week1 { z-index: 2; }
.month .week2 { z-index: 4; }
.month .week3 { z-index: 6; }
.month .week4 { z-index: 8; }
.month .week5 { z-index: 10; }
.month .week6 { z-index: 12; }

.month .week1 .event { z-index: 3; }
.month .week2 .event { z-index: 5; }
.month .week3 .event { z-index: 7; }
.month .week4 .event { z-index: 9; }
.month .week5 .event { z-index: 11; }
.month .week6 .event { z-index: 13; }

.day.today {
	background-color: #ffe;
}

.day.past {
	background-color: #eee
}

.day.outsideOfMonth {
	background-color: #ccc;
}

.day .content {
	position: absolute;
	left: 0;
	top: 0;
	bottom: 0;
	right: 0;
}

.date {
	float: right;
	padding: 0.2em;
	clear: both;
	line-height: 1em;
}

.event {
	position: absolute;
	border: 1px solid #e7e7ff;
	border-radius: 0.5em;
	background-color: #f0f0ff;
	padding: 0.3em 0.3em;
	line-height: 1em;
	text-overflow: ellipsis;
	white-space: nowrap;
	overflow: hidden;
}

.event.slot1 { top: 1.5em; }
.event.slot2 { top: calc(1.5em + 1 * 1.6em + 2px); }
.event.slot3 { top: calc(1.5em + 2 * 1.6em + 2px); }
.event.slot4 { top: calc(1.5em + 3 * 1.6em + 2px); }
.event.slot5 { top: calc(1.5em + 4 * 1.6em + 2px); }
.event.slot6 { top: calc(1.5em + 5 * 1.6em + 2px); }
.event.slot7 { top: calc(1.5em + 6 * 1.6em + 2px); }
.event.slot8 { top: calc(1.5em + 7 * 1.6em + 2px); }
.event.slot9 { top: calc(1.5em + 8 * 1.6em + 2px); }
.event.slot10 { top: calc(1.5em + 9 * 1.6em + 2px); }
.event.slot0 { display: none; } /* More than 10 slots not currently supported */

.event.offset0 { left: calc(.05em); }
.event.offset1 { left: calc(14.28571429% + .05em); }
.event.offset2 { left: calc(14.28571429% * 2 + .05em); }
.event.offset3 { left: calc(14.28571429% * 3 + .05em); }
.event.offset4 { left: calc(14.28571429% * 4 + .05em); }
.event.offset5 { left: calc(14.28571429% * 5 + .05em); }
.event.offset6 { left: calc(14.28571429% * 6 + .05em); }

.event.hasUrl:hover {
	text-decoration: underline;
}

/* Used to hold when an event has spilled over to this day */
.event.placeholder {
	z-index: 0;
	visibility: hidden;
}
.event.placeholder::before {
	content: ".";
}

.event.span1 { width: calc(14.28571429% - .05em); }
.event.span2 { width: calc(14.28571429% * 2 - .05em); }
.event.span3 { width: calc(14.28571429% * 3 - .05em); text-align: center;}
.event.span4 { width: calc(14.28571429% * 4 - .05em); text-align: center;}
.event.span5 { width: calc(14.28571429% * 5 - .05em); text-align: center;}
.event.span6 { width: calc(14.28571429% * 6 - .05em); text-align: center;}
.event.span7 { width: calc(14.28571429% * 6 - .05em); text-align: center;}

.event.continued		{ 
	border-left-style: none;
	border-top-left-radius: 0;
	border-bottom-left-radius: 0;
}

.event.continued::before,
.event.toBeContinued::after { 
	content: " \21e2 ";
	color: #999;
}

.event.toBeContinued	{ 
	border-right-style: none; 
	border-top-right-radius: 0;
	border-bottom-right-radius: 0;
}

/* Set min-height to 85% of width */
.month .day:before {
	content: "";
	display: block;
	padding-top: 85%;
}

/* Set min-height to 75% of width (4:3 ratio) */
.aspect43 .month .day:before {
	padding-top: 75%;
}

</style>
