<template>
	<div id="app">
		<h2>{{message}}</h2>
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
				{ id: 'e1', startDate: new Date(2017, 4, 12), endDate: new Date(2017, 4, 12), title: 'Single-day event with a long title' },
				{ id: 'e2', startDate: new Date(2017, 4, 19), endDate: new Date(2017, 4, 25), title: 'Multi-day event with a long title' },
				{ id: 'e3', startDate: new Date(2017, 4, 20), endDate: new Date(2017, 4, 20), title: 'My Birthday!', classes: 'birthday', url: 'https://en.wikipedia.org/wiki/Birthday' },
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
</style>
