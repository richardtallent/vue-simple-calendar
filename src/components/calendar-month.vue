<!--

	Note on Internationalization:

	Intl is not supported for Safari 9.1, iOS 9.3, and Opera Mini. For these browsers, the month
	names and weekday names will be blank and the calendar will have a `nointl` class. Use CSS
	content to provide the appropriate month and weekday names for the languages you support.

	E.g.:
		.calendar.nointl.locale-en.m01 .monthName::after { content: 'January' }


-->
<template>
	<div class="calendar-month" :class="[
			'locale-' + languageCode(displayLocale),
			'locale-' + displayLocale,
			'y' + displayDate.getFullYear(),
			'm' + paddedMonth(displayDate),
			{
				past:		isPastMonth(displayDate),
				future:		isFutureMonth(displayDate),
				noIntl:		!supportsIntl,
			}]">
		<div class="header">
			<div class="previousYear"><button @click="onClickPreviousYear" :disabled="!allowLastYearClick"></button></div>
			<div class="previousMonth"><button @click="onClickPreviousMonth" :disabled="!allowLastMonthClick"></button></div>
			<div class="thisMonth">
				<div class="monthLabel">
					<span class="monthName">{{ monthNames[displayDate.getMonth()] }}</span>
					<span class="yearNumber">{{ displayDate.getFullYear() }}</span>
				</div>
				<div v-if="!isSameMonth(today, displayDate)" class="currentMonth"><button @click="onClickCurrentMonth"></button></div>
			</div>
			<div class="nextMonth"><button @click="onClickNextMonth" :disabled="!allowNextMonthClick"></button></div>
			<div class="nextYear"><button @click="onClickNextYear" :disabled="!allowNextYearClick"></button></div>
		</div>
		<div class="dayList">
			<div v-for="(w, index) in weekdayNames" class="day" :key="index" :class="'dow'+index">{{ w }}</div>
		</div>
		<div class="month">
			<div v-for="(weekStart, weekIndex) in weeksOfMonth(displayDate)"
				class="week"
				:key="weekIndex"
				:class="['week' + (weekIndex+1), 'ws' + isoYearMonthDay(weekStart)]">
				<div v-for="(day, dayIndex) in daysOfWeek(weekStart)" class="day" 
					:key="dayIndex"
					:class="[
						'dow' + day.getDay(),
						'd' + isoYearMonthDay(day),
						'd' + isoMonthDay(day),
						'd' + paddedDay(day),
						'instance' + instanceOfMonth(day),
						{
							outsideOfMonth	: day.getMonth() != displayDate.getMonth(),
							today			: isSameDate(day, today),
							past			: isInPast(day),
							future			: isInFuture(day),
							last			: isLastDayOfMonth(day),
							lastInstance	: isLastInstanceOfMonth(day),
						}
					]"
					@click="onClickDay(day)"
					@drop.prevent="onDrop(day, $event)"
					@dragover.prevent="onDragOver(day, $event)"
					@dragenter.prevent="onDragEnter(day, $event)"
					@dragleave.prevent="onDragLeave(day, $event)">
					<div class="content">
						<div class="date">{{ day.getDate() }}</div>
					</div>
				</div>
				<div v-for="e in getWeekEvents(weekStart)"
					class="event"
					:key="e.id"
					:draggable="enableDragDrop"
					:class="e.classes"
					:title="e.details.title"
					@dragstart="onDragStart(e, $event)"
					@click.stop="onClickEvent(e)"
					v-html="e.details.title"></div>
				</div>
		</div>
	</div>
</template>

<script>

import mixinCalendarMath from '../components/mixin-calendarMath';

export default {

	name: 'calendar-month',

	mixins: [mixinCalendarMath],

	props: {

		showDate:			{ type: Date },
		locale:				{ type: String },
		monthNameFormat:	{ type: String, default() { return 'long'; } },
		weekdayNameFormat:	{ type: String, default() { return 'short'; } },

		disablePast:		{ default() { return false; } },
		disableFuture:		{ default() { return false; } },
		enableDragDrop:		{ default() { return false; } },

		events: {
			type: Array,
			default() { return []; },
		},

	},

	computed: {

		/* Props cannot default to computed/method returns, so create defaulted versions of the properties that need specific defaults (Vue Issue #6013) */
		displayLocale()			{ return this.locale || this.getDefaultBrowserLocale(); },
		displayDate()			{ return this.showDate || this.today; },

		/* Cache the names based on current locale and format settings */
		monthNames()			{ return this.getFormattedMonthNames(this.displayLocale, this.monthNameFormat); },
		weekdayNames()			{ return this.getFormattedWeekdayNames(this.displayLocale, this.weekdayNameFormat); },

		allowLastYearClick()	{ return !this.disablePast || (this.aYearBefore(this.displayDate) >= this.today); },
		allowNextYearClick()	{ return !this.disableFuture || (this.aYearAfter(this.displayDate) <= this.today); },
		allowLastMonthClick()	{ return !this.disablePast || (this.beginningOfMonth(this.displayDate) > this.today); },
		allowNextMonthClick()	{ return !this.disableFuture || (this.displayDate < this.beginningOfMonth(this.today)); },

	},

	methods: {

		// ******************************
		// UI Events
		// ******************************

		onClickDay(day) {
			if (this.disablePast && this.isInPast(day)) return;
			this.$emit('clickDay', day);
		},

		onClickEvent(e, day) {
			this.$emit('clickEvent', e.details, day);
		},

		onClickPreviousYear() { this.$emit('setShowDate', this.aYearBefore(this.displayDate)); },
		onClickPreviousMonth() { this.$emit('setShowDate', this.monthBefore(this.displayDate)); },
		onClickNextMonth() { this.$emit('setShowDate', this.monthAfter(this.displayDate)); },
		onClickNextYear() { this.$emit('setShowDate', this.aYearAfter(this.displayDate)); },
		onClickCurrentMonth() { this.$emit('setShowDate', this.beginningOfMonth(this.today)); },

		onDragStart(calendarEvent, windowEvent) {
			if (!this.enableDragDrop) return false;
			// Reason for using "Text":
			// eslint-disable-next-line
			// http://stackoverflow.com/questions/26213011/html5-dragdrop-issue-in-internet-explorer-datatransfer-property-access-not-pos
			windowEvent.dataTransfer.setData('Text', calendarEvent.details.id);
			this.$emit('dragEventStart', calendarEvent.details.id, calendarEvent);
			return true;
		},

		handleEvent(windowEvent, bubbleEventName, bubbleParam) {
			if (!this.enableDragDrop) return false;
			const calendarEventId = windowEvent.dataTransfer.getData('Text');
			this.$emit(bubbleEventName, calendarEventId, bubbleParam);
			return true;
		},

		onDragOver(day, windowEvent) {
			this.handleEvent(windowEvent, 'dragEventDragOverDate', day);
		},

		onDragEnter(day, windowEvent) {
			if (!this.handleEvent(windowEvent, 'dragEventEnterDate', day)) return;
			windowEvent.target.classList.add('draghover');
		},

		onDragLeave(day, windowEvent) {
			if (!this.handleEvent(windowEvent, 'dragEventLeaveDate', day)) return;
			windowEvent.target.classList.remove('draghover');
		},

		onDrop(day, windowEvent) {
			if (!this.handleEvent(windowEvent, 'dropEventOnDate', day)) return;
			windowEvent.target.classList.remove('draghover');
		},

		// ******************************
		// Calendar Events
		// ******************************

		findAndSortEventsInWeek(weekStart) {
			// Return a list of events that CONTAIN the week starting on a day.
			// Sorted so the events that start earlier are always shown first.
			const events = this.events.filter(event =>
				event.startDate < this.addDays(weekStart, 7)
				&& (!event.endDate || event.endDate >= weekStart)
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
				const e = {
					startDate:	events[i].startDate,
					endDate:	events[i].endDate	|| events[i].startDate,
					title:		events[i].title		|| 'Untitled',
					id:			events[i].id		|| ('e' + Math.random().toString(36).substr(2, 10)),
					url:		events[i].url,
					classes:	events[i].classes,
				};
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
						hasUrl: ep.details.url,
					},
				];
				if (e.classes) ep.classes = ep.classes.concat(e.classes);
				results.push(ep);
			}
			return results;
		},

	},

};

</script>
<!--

The CSS below represents only the CSS required for propert rendering (positioning, etc.
All CSS related to colors, border radius, etc. should be part of a theme.

-->
<style type="text/css">

	/* Position/Flex */

	.calendar-month .month,
	.calendar-month .header,
	.calendar-month .week,
	.calendar-month .dayList {
		display: flex;
		width: 100%;
		flex-wrap: wrap;
		flex-direction: row;
		justify-content: flex-start;
		align-items: stretch;
		align-content: flex-start;
	}

	.calendar-month .header {
		justify-content: space-between;
	}

	.calendar-month .header .thisMonth {
		display: flex;
		flex-direction: row;
	}

	.calendar-month .month {
		flex-direction: column;
		overflow: hidden;
	}

	.calendar-month .week {
		position: relative;
		width: 100%;
	}

	.calendar-month .day {
		position: relative;
		width: 14.285714%;
		background-color: #fff;
	}

	/* Set min-height to 85% of width */
	.calendar-month .week .day:before {
		content: "";
		display: block;
		padding-top: 85%;
	}

	.calendar-month .day .content {
		position: absolute;
		left: 0;
		top: 0;
		bottom: 0;
		right: 0;
	}

	.calendar-month .date {
		float: right;
		clear: both;
	}

	.calendar-month .event {
		position: absolute;
		text-overflow: ellipsis;
		white-space: nowrap;
		overflow: hidden;
	}

	/* Internal Metrics */

	.calendar-month,
	.calendar-month div,
	.calendar-month button {
		box-sizing:		border-box;
		line-height:	1em;
		font-size:		1em;
	}

	.calendar-month .header > div,
	.calendar-month .dayList div,
	.calendar-month .header .monthLabel,
	.calendar-month .date,
	.calendar-month .event {
		padding:		0.2em;
	}

	.calendar-month .header button,
	.calendar-month .header .monthLabel {
		padding:		0.4em 0.6em;
	}

	/* Borders */

	.calendar-month .month		{ border-style: solid; border-width: 0		0		0.05em	0.05em; }
	.calendar-month .header		{ border-style: solid; border-width: 0.05em	0.05em	0		0.05em;	}
	.calendar-month .dayList	{ border-style: solid; border-width: 0		0		0		0.05em; }
	.calendar-month .day		{ border-style: solid; border-width: 0.05em	0.05em	0		0; }
	.calendar-month .header button,
	.calendar-month .event		{ border-style: solid; border-width: 0.05em; }

	/* Use z-index to ensure events too tall for the view are clipped vertically */

	.calendar-month .week1 { z-index: 2; }
	.calendar-month .week2 { z-index: 4; }
	.calendar-month .week3 { z-index: 6; }
	.calendar-month .week4 { z-index: 8; }
	.calendar-month .week5 { z-index: 10; }
	.calendar-month .week6 { z-index: 12; }

	.calendar-month .week1 .event { z-index: 3; }
	.calendar-month .week2 .event { z-index: 5; }
	.calendar-month .week2 .event { z-index: 5; }
	.calendar-month .week3 .event { z-index: 7; }
	.calendar-month .week4 .event { z-index: 9; }
	.calendar-month .week5 .event { z-index: 11; }
	.calendar-month .week6 .event { z-index: 13; }

	/* Positioning for event slots */

	.calendar-month .event.slot1 { top: 1.4em; }
	.calendar-month .event.slot2 { top: calc(2 * 1.4em + 0.1em); }
	.calendar-month .event.slot3 { top: calc(3 * 1.4em + 0.1em); }
	.calendar-month .event.slot4 { top: calc(4 * 1.4em + 0.1em); }
	.calendar-month .event.slot5 { top: calc(5 * 1.4em + 0.1em); }
	.calendar-month .event.slot6 { top: calc(6 * 1.4em + 0.1em); }
	.calendar-month .event.slot7 { top: calc(7 * 1.4em + 0.1em); }
	.calendar-month .event.slot8 { top: calc(8 * 1.4em + 0.1em); }
	.calendar-month .event.slot9 { top: calc(9 * 1.4em + 0.1em); }
	.calendar-month .event.slot10 { top: calc(10 * 1.4em + 0.1em); }
	.calendar-month .event.slot0 { display: none; } /* More than 10 slots not currently supported */

	.calendar-month .event.offset0 { left: calc(.05em); }
	.calendar-month .event.offset1 { left: calc(14.28571429% + .05em); }
	.calendar-month .event.offset2 { left: calc(14.28571429% * 2 + .05em); }
	.calendar-month .event.offset3 { left: calc(14.28571429% * 3 + .05em); }
	.calendar-month .event.offset4 { left: calc(14.28571429% * 4 + .05em); }
	.calendar-month .event.offset5 { left: calc(14.28571429% * 5 + .05em); }
	.calendar-month .event.offset6 { left: calc(14.28571429% * 6 + .05em); }

	/* Metrics for events spanning dates */

	.calendar-month .event.span1 { width: calc(14.28571429% - .05em); }
	.calendar-month .event.span2 { width: calc(14.28571429% * 2 - .05em); }
	.calendar-month .event.span3 { width: calc(14.28571429% * 3 - .05em); text-align: center;}
	.calendar-month .event.span4 { width: calc(14.28571429% * 4 - .05em); text-align: center;}
	.calendar-month .event.span5 { width: calc(14.28571429% * 5 - .05em); text-align: center;}
	.calendar-month .event.span6 { width: calc(14.28571429% * 6 - .05em); text-align: center;}
	.calendar-month .event.span7 { width: calc(14.28571429% * 7 - .05em); text-align: center;}

	/* Misc */

	.calendar-month .dayList .day {
		text-align: center;
	}

	.calendar-month .event.hasUrl:hover {
		text-decoration: underline;
	}

	.calendar-month .event.continued { 
		border-left-style: none;
		border-top-left-radius: 0;
		border-bottom-left-radius: 0;
	}

</style>
