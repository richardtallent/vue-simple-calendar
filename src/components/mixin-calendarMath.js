/*
***********************************************************
This mix-in includes a computed properties and methods that
are useful in displaying a calendar. It has no state, other
than the caching of the computed properties.
***********************************************************
*/
export default {

	computed: {

		supportsIntl() {
			return typeof Intl !== 'undefined';
		},

	},

	methods: {

		// ******************************
		// Series
		// ******************************

		today() {
			return this.dateOnly(new Date());
		},

		weeksOfMonth(d) {
			// Returns an array of object representing the date of the beginning of each week
			// included in the view (which, by default, consists of an entire month).
			const firstDate = this.beginningOfCalendar(d);
			const lastDate = this.endOfCalendar(d);
			const numWeeks = Math.floor((this.dayDiff(firstDate, lastDate) + 1) / 7);
			return Array(numWeeks).fill().map((_, i) => this.addDays(firstDate, i * 7));
		},

		daysOfWeek(weekStart) {
			return Array(7).fill().map((_, i) => this.addDays(weekStart, i));
		},

		// ******************************
		// Date transforms (all ignore/wipe time of day)
		// ******************************

		addDays(d, days)			{ return new Date(d.getFullYear(), d.getMonth(), d.getDate() + days); },

		endOfMonth(d)				{ return new Date(d.getFullYear(), d.getMonth() + 1, 0); },
		endOfPreviousMonth(d)		{ return new Date(d.getFullYear(), d.getMonth(), 0); },

		aYearBefore(d)				{ return new Date(d.getFullYear() - 1, d.getMonth()); },
		aYearAfter(d)				{ return new Date(d.getFullYear() + 1, d.getMonth()); },

		monthBefore(d)				{ return new Date(d.getFullYear(), d.getMonth() - 1); },
		monthAfter(d)				{ return new Date(d.getFullYear(), d.getMonth() + 1); },

		beginningOfWeek(d)			{ return this.addDays(d, 0 - d.getDay()); },
		endOfWeek(d)				{ return this.addDays(d, 7 - d.getDay()); },

		beginningOfCalendar(d)		{ return this.beginningOfWeek(this.beginningOfMonth(d)); },
		endOfCalendar(d)			{ return this.endOfWeek(this.endOfMonth(d)); },

		beginningOfMonth(d)			{ return new Date(d.getFullYear(), d.getMonth()); },
		instanceOfMonth(d)			{ return Math.ceil(d.getDate() / 7); },

		// ******************************
		// Date formatting
		// ******************************

		paddedMonth(d)				{ return ('0' + String(d.getMonth() + 1)).slice(-2); },
		paddedDay(d)				{ return ('0' + String(d.getDate())).slice(-2); },

		isoYearMonth(d)				{ return d.getFullYear() + '-' + this.paddedMonth(d); },
		isoYearMonthDay(d)			{ return this.isoYearMonth(d) + '-' + this.paddedDay(d); },
		isoMonthDay(d)				{ return this.paddedMonth(d) + '-' + this.paddedDay(d); },

		// ******************************
		// Date comparisons
		// ******************************

		// Number of whole days between two dates. If present, time of day is ignored.
		// Cannot use setHours / dateOnly(), as this would not properly ranges including a DST changeover. 
		// setHours mutates, so must create a copy.
		dayDiff(d1, d2)				{
			const endDate = new Date(d2), startDate = new Date(d1);
			endDate.setUTCHours(0,0,0,0);
			startDate.setUTCHours(0,0,0,0);
			return (endDate - startDate) / 86400000;
		},

		// http://stackoverflow.com/questions/492994/compare-two-dates-with-javascript
		isSameDate(d1, d2)			{ return this.dayDiff(d1, d2) === 0; },
		isSameMonth(d1, d2)			{ return d1.getFullYear() === d2.getFullYear() && d1.getMonth() === d2.getMonth(); },

		isPastMonth(d)				{ return this.beginningOfMonth(d) < this.beginningOfMonth(this.today()); },
		isFutureMonth(d)			{ return this.beginningOfMonth(d) > this.beginningOfMonth(this.today()); },

		isInFuture(d)				{ return this.dateOnly(d) > this.today(); },
		isInPast(d)					{ return this.dateOnly(d) < this.today(); },
		isLastInstanceOfMonth(d)	{ return d.getMonth() !== this.addDays(d, 7).getMonth(); },
		isLastDayOfMonth(d)			{ return d.getMonth() !== this.addDays(d, 1).getMonth(); },

		dateOnly(d)					{
			// setHours mutates argument, work on a copy.
			const d2 = new Date(d);
			d2.setHours(0,0,0,0);
			return d2;
		},

		// ******************************
		// Localization
		// ******************************

		languageCode(l) {
			return l.substring(0, 2);
		},

		getFormattedMonthNames(locale, format) {
			// Use the provided locale and format if possible to obtain the name of the month
			if (!this.supportsIntl) return Array(12).fill('');
			const formatter = new Intl.DateTimeFormat(locale, { month: format });
			// The year doesn't matter, using 2017 for convenience
			return Array(12).fill().map((_, i) => formatter.format(new Date(2017, i, 1)));
		},

		getFormattedWeekdayNames(locale, format) {
			// Use the provided locale and format if possible to obtain the name of the days of the week
			if (!this.supportsIntl) return Array(7).fill('');
			const formatter = new Intl.DateTimeFormat(locale, { weekday: format });
			// 2017 starts on Sunday, so use it as the baseline date
			return Array(7).fill().map((_, i) => formatter.format(new Date(2017, 0, i + 1)));
		},

		getDefaultBrowserLocale() {
			// If not running in the browser, cannot determine a default, return the code for unknown (blank is invalid)
			if (typeof navigator === 'undefined') return 'unk';
			// Return the browser's language setting, implementation is browser-specific
			return (
				(navigator.languages && navigator.languages.length) ?
					navigator.languages[0]
					: navigator.language || navigator.browserLanguage
			).toLowerCase();
		},

	},

};
