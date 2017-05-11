<template>
	<div id="app">
		<h2>{{message}}</h2>
		<calendar
			:show-date="showDate"
			@clickDay="onClickDay"
			@clickEvent="onClickEvent"
			@setShowDate="setShowDate"
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
			showDate: new Date(2017, 4, 1),
			message: 'Click a date or event...',
			events: [
				{ id: 'e1', startDate: new Date(2017, 4, 12), endDate: new Date(2017, 4, 12), title: 'Single-day event with a long title' },
				{ id: 'e2', startDate: new Date(2017, 4, 19), endDate: new Date(2017, 4, 25), title: 'Multi-day event with a long title' },
				{ id: 'e3', startDate: new Date(2017, 4, 20), endDate: new Date(2017, 4, 20), title: '\uD83C\uDF82&nbsp;&nbsp;Birthday!' },
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
	},
};
</script>

<style>
#app {
	font-family: Calibri;
	font-size: 0.9rem;
}
</style>
