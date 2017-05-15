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
			<div v-for="day in days" class="day" 
				@drop="onDrop($event, day)"
				@dragover="onDragOver($event, day)"
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
					<div v-for="e in getEvents(day)" 
						class="event"
						:draggable="enableDragDrop && !isPlaceholder(e, day)"
						@dragstart="onDragStart($event, e)"
						@click.stop="onClickEvent(e, day)"
						:class="[
							getSpan(e, day),
							e.classes,
							{
								placeholder: isPlaceholder(e, day),
								continued: !isPlaceholder(e, day) && (e.startDate < day),
								toBeContinued: !isPlaceholder(e, day) && (dayDiff(day, e.endDate) > (6 - day.getDay())),
								hasUrl: e.url
							}
						]"
						:title="e.title"
						v-html="e.title"></div>
				</div>
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
		days() {
			// Returns an array of object representing each day in the view, whether or not
			// it is part of the visible month.
			const firstDate = this.beginningOfCalendar(this.showDate);
			const lastDate = this.endOfCalendar(this.showDate);
			const numDays = this.dayDiff(firstDate, lastDate);
			const result = [];
			for (let x = 0; x < numDays; x++) {
				result.push(this.addDays(firstDate, x));
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

		isInPast(d) {
			const currentYear = this.today.getFullYear();
			const yr = d.getFullYear();
			const currentMonth = this.today.getMonth();
			const month = d.getMonth();
			const dayNumber = d.getDate();
			const currentDay = this.today.getDate();
			return yr < currentYear
				|| (yr === currentYear && (
					month < currentMonth
					|| (month === currentMonth && dayNumber < currentDay)
				));
		},

		isPlaceholder(event, d) {
			// True if the event should be a placeholder for this date
			return (event.startDate < d) && (d.getDay() > 0);
		},

		getSpan(event, d) {
			// Returns the span class of the event, from 1-7, representing
			// the number of days this event takes up on the week.
			if (this.isPlaceholder(event, d)) return '';
			return `span${Math.min(7 - d.getDay(), this.dayDiff(d, event.endDate) + 1)}`;
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

		onClickDay(day) {
			if (this.disablePast && this.isInPast(day)) return;
			this.$emit('clickDay', day);
		},

		onClickEvent(e, day) {
			this.$emit('clickEvent', e, day);
		},

		onClickPreviousMonth() {
			this.$emit('setShowDate', this.beginningOfPreviousMonth(this.showDate));
		},

		onClickNextMonth() {
			this.$emit('setShowDate', this.beginningOfNextMonth(this.showDate));
		},

		onClickCurrentMonth() {
			this.$emit('setShowDate', this.bom(this.today));
		},

		getEvents(d) {
			// Return a list of events that CONTAIN the day.
			// Sorted so the events that start earlier are always shown first.
			return this.events.filter(event =>
				event.startDate <= d
				&& event.endDate >= d
			, this).sort((a, b) => {
				if (a.startDate < b.startDate) return -1;
				if (b.startDate < a.startDate) return 1;
				if (a.endDate > b.endDate) return -1;
				if (b.endDate > a.endDate) return 1;
				return a.id < b.id ? -1 : 1;
			});
		},

		onDragStart(ev, calendarEvent) {
			if (!this.enableDragDrop) return;
			ev.dataTransfer.setData('calendarEventId', calendarEvent.id);
		},

		onDragOver(ev, day) {
			if (!this.enableDragDrop) return;
			ev.preventDefault();
			const calendarEventId = ev.dataTransfer.getData('calendarEventId');
			this.$emit('dragEventOverDate', calendarEventId, day);
		},

		onDrop(ev, day) {
			if (!this.enableDragDrop) return;
			ev.preventDefault();
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
}

.day {
	position: relative;
	border-style: solid;
	border-color: #DDD;
	border-width: 0.05em 0.05em 0 0;
	width: 14.285714%;
}

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
}

.event {
	position: relative;
	clear: right;
	border: 1px solid #e7e7ff;
	border-radius: 0.5em;
	background-color: #f0f0ff;
	z-index: 1;
	padding: 0.3em 0.3em;
	line-height: 1em;
	text-overflow: ellipsis;
	white-space: nowrap;
	overflow: hidden;
}

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

.event.span1 { width: 100%; }
.event.span2 { width: calc(0.05em + 200%); text-align: center; }
.event.span3 { width: calc(0.10em + 300%); text-align: center;  }
.event.span4 { width: calc(0.15em + 400%); text-align: center;  }
.event.span5 { width: calc(0.20em + 500%); text-align: center;  }
.event.span6 { width: calc(0.25em + 600%); text-align: center;  }
.event.span7 { width: calc(0.30em + 700%); text-align: center;  }

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
