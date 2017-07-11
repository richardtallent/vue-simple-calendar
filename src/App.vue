<template>
	<div id="app">

		<h1>vue-calendar-month 1.5</h1>

		<p>Below is an example of vue-calendar-month. You can drag and drop events to change the start date (this
			functionality is optional and controlled by the calling app).</p>

		<p>Note that this demo page has some examples of custom styles -- the holiday icons. As you can see from the source,
			it's easy to customize the style to meet your needs. I've purposefully tried to choose defaults that are modern
			and clean without getting so complicated that they would be difficult to override.</p>

		<h3>{{message}}</h3>

		<calendar-month
			class="holiday-us-traditional holiday-us-official"
			:show-date="showDate"
			@clickDay="onClickDay"
			@clickEvent="onClickEvent"
			@setShowDate="setShowDate"
			enable-drag-drop=true
			@dropEventOnDate="onDrop"
			:events="events">
		</calendar-month>

	</div>
</template>

<script>
import CalendarMonth from './components/calendar-month';
import CalendarMath from './mixins/mixin-calendarMath';

export default {
	name: 'app',
	components: {
		CalendarMonth,
	},
	data() {
		return {
			/* Show the current month, and give it some fake events to show */
			showDate: this.thisMonth(1),
			message: 'Click a date or event...',
			events: [
				{ id: 'e1', startDate: this.thisMonth(15), endDate: this.thisMonth(15), title: 'Single-day event with a long title' },
				{ id: 'e2', startDate: this.thisMonth(7), endDate: this.thisMonth(10), title: 'Multi-day event with a long title' },
				{ id: 'e3', startDate: this.thisMonth(20), endDate: this.thisMonth(20), title: 'My Birthday!', classes: 'birthday', url: 'https://en.wikipedia.org/wiki/Birthday' },
				{ id: 'e4', startDate: this.thisMonth(5), endDate: this.thisMonth(12), title: 'Multi-day event', classes: 'purple' },
				{ id: 'e5', startDate: this.thisMonth(29), endDate: this.thisMonth(29), title: 'Same day 1' },
				{ id: 'e6', startDate: this.thisMonth(29), endDate: this.thisMonth(29), title: 'Same day 2', classes: 'orange' },
				{ id: 'e7', startDate: this.thisMonth(29), endDate: this.thisMonth(29), title: 'Same day 3' },
				{ id: 'e8', startDate: this.thisMonth(29), endDate: this.thisMonth(29), title: 'Same day 4', classes: 'orange' },
				{ id: 'e9', startDate: this.thisMonth(29), endDate: this.thisMonth(29), title: 'Same day 5' },
				{ id: 'e10', startDate: this.thisMonth(29), endDate: this.thisMonth(29), title: 'Same day 6', classes: 'orange' },
				{ id: 'e11', startDate: this.thisMonth(29), endDate: this.thisMonth(29), title: 'Same day 7' },
			],
		};
	},
	methods: {
		thisMonth: (d) => { const t = new Date(); return new Date(t.getFullYear(), t.getMonth(), d); },
		onClickDay(d) { this.message = `You clicked: ${d.toLocaleDateString()}`; },
		onClickEvent(e) { this.message = `You clicked: ${e.title}`; },
		setShowDate(d) {
			this.message = `Changing calendar view to ${d.toLocaleDateString()}`;
			this.showDate = d;
		},
		onDrop(event, date) {
			this.message = `You dropped ${event} on ${date.toLocaleDateString()}`;
			const e = this.events.filter(ev => ev.id === event)[0];
			const eLength = CalendarMath.methods.dayDiff(e.startDate, e.endDate);
			e.startDate = date;
			e.endDate = CalendarMath.methods.addDays(date, eLength);
		},
	},
};
</script>

<style>

	#app {
		font-family: Calibri;
		width: 80vw;
		min-width: 40em;
		max-width: 100em;
		margin-left: auto;
		margin-right: auto;
	}

	/*
	These styles are optional, added for the demo only, to illustrate the flexbility
	of styling the calendar purely with CSS.
	*/

	/* Add some emoji for Canada and France... */
	.calendar .d07-01 .date::before { content: '\1F1E8\1F1E6'; margin-right: 0.5em; }
	.calendar .d07-14 .date::before { content: '\1F1EB\1F1F7'; margin-right: 0.5em; }

	/* Add some styling for events tagged with the "birthday" class */
	.calendar .event.birthday { background-color: #e0f0e0; border-color: #d7e7d7; }
	.calendar .event.birthday::before { content: '\1F382'; margin-right: 0.5em; }

</style>
