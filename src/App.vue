<template>
	<div id="app">

		<h1>vue-simple-calendar 1.4</h1>

		<p>Below is an example of vue-simple-calendar. You can drag and drop events to change the start date (this functionality is optional and controlled by the calling app.</p>

		<p>Note that this demo page has some examples of custom styles -- the holiday icons. As you can see from the source, it's easy to customize the style to meet your needs.
			I've purposefully tried to choose defaults that are aesthetically pleasing without getting so complicated that they would be difficult to override.</p>

		<h3>{{message}}</h3>

		<calendar
			:show-date="showDate"
			@clickDay="onClickDay"
			@clickEvent="onClickEvent"
			@setShowDate="setShowDate"
			enable-drag-drop="true"
			@dropEventOnDate="onDrop"
			:events="events">
		</calendar>

	</div>
</template>

<script>
import Calendar from './components/simple-calendar';

export default {
	name: 'app',
	components: {
		Calendar,
	},
	data() {
		return {
			/* Always start the demo on May 2017 */
			showDate: new Date(2017, 4, 1),
			message: 'Click a date or event...',
			events: [
				{ id: 'e1', startDate: new Date(2017, 4, 15), endDate: new Date(2017, 4, 15), title: 'Single-day event with a long title' },
				{ id: 'e2', startDate: new Date(2017, 4, 7), endDate: new Date(2017, 4, 10), title: 'Multi-day event with a long title' },
				{ id: 'e3', startDate: new Date(2017, 4, 20), endDate: new Date(2017, 4, 20), title: 'My Birthday!', classes: 'birthday', url: 'https://en.wikipedia.org/wiki/Birthday' },
				{ id: 'e4', startDate: new Date(2017, 4, 5), endDate: new Date(2017, 4, 12), title: 'Multi-day event', classes: 'purple' },
				{ id: 'e5', startDate: new Date(2017, 4, 29), endDate: new Date(2017, 4, 29), title: 'Same day 1' },
				{ id: 'e6', startDate: new Date(2017, 4, 29), endDate: new Date(2017, 4, 29), title: 'Same day 2', classes: 'orange' },
				{ id: 'e7', startDate: new Date(2017, 4, 29), endDate: new Date(2017, 4, 29), title: 'Same day 3' },
				{ id: 'e8', startDate: new Date(2017, 4, 29), endDate: new Date(2017, 4, 29), title: 'Same day 4', classes: 'orange' },
				{ id: 'e9', startDate: new Date(2017, 4, 29), endDate: new Date(2017, 4, 29), title: 'Same day 5' },
				{ id: 'e10', startDate: new Date(2017, 4, 29), endDate: new Date(2017, 4, 29), title: 'Same day 6', classes: 'orange' },
				{ id: 'e11', startDate: new Date(2017, 4, 29), endDate: new Date(2017, 4, 29), title: 'Same day 7' },
			],
		};
	},
	methods: {
		onClickDay(d) { this.message = `You clicked: ${d}`; },
		onClickEvent(e) { this.message = `You clicked: ${e.title}`; },
		setShowDate(d) {
			this.message = `Changing calendar view to ${d}`;
			this.showDate = d;
		},
		onDrop(event, date) {
			this.message = `You dropped ${event} on ${date.toISOString()}`;
			const e = this.events.filter(ev => ev.id === event)[0];
			const eLength = Calendar.methods.dayDiff(e.startDate, e.endDate);
			e.startDate = date;
			e.endDate = Calendar.methods.addDays(date, eLength);
		},
	},
};
</script>

<style>

	#app {
		font-family: Calibri;
		width: 80vw;
		max-width: 150em;
		margin-left: auto;
		margin-right: auto;
	}

	/*
	These styles are optional, added for the demo only, to illustrate the flexbility
	of styling the calendar purely with CSS.
	*/

	/* Add some icons beside the day number for traditional holidays */
	.calendar .d10-31 .date::before { content: '\1F383'; margin-right: 0.5em; }
	.calendar .d12-25 .date::before { content: '\1F384'; margin-right: 0.5em; }
	.calendar .d12-31 .date::before { content: '\1F37E'; margin-right: 0.5em; }
	.calendar .d05-05 .date::before { content: '\1F1F2\1F1FD'; margin-right: 0.5em; }
	.calendar .d07-04 .date::before { content: '\1F1FA\1F1F8'; margin-right: 0.5em; }
	.calendar .d07-01 .date::before { content: '\1F1E8\1F1E6'; margin-right: 0.5em; }
	.calendar .d07-14 .date::before { content: '\1F1EB\1F1F7'; margin-right: 0.5em; }

	/* Easter: example of a holiday that changes each year. Easy to pre-populate for a reasonable number of years. */
	.calendar .d2015-04-05 .date::before { content: '\271D'; margin-right: 0.5em; }
	.calendar .d2016-03-27 .date::before { content: '\271D'; margin-right: 0.5em; }
	.calendar .d2017-04-16 .date::before { content: '\271D'; margin-right: 0.5em; }
	.calendar .d2018-04-01 .date::before { content: '\271D'; margin-right: 0.5em; }

	/* Thanksgiving, the 4th Thursday of each year */
	.calendar.m11 .day.dow4.instance4 .date::before { content: '\1F64F'; margin-right: 0.5em; }

	/* Labor Day, the 1st Monday in September of each year */
	.calendar.m09 .day.dow1.instance1 .date::before { content: '\1F4AA'; margin-right: 0.5em; }

	/* Memorial Day, the last Monday in May of each year */
	.calendar.m05 .day.dow1.lastInstance .date::before { content: '\1F1FA\1F1F8'; margin-right: 0.5em; }

	/* Add some styling for events tagged with the "birthday" class */
	.calendar .event.birthday { background-color: #e0f0e0; border-color: #d7e7d7; }
	.calendar .event.birthday::before { content: '\1F382'; margin-right: 0.5em; }

</style>
