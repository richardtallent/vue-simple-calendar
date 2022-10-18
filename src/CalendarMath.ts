import type { ICalendarItem, INormalizedCalendarItem, DateTimeFormatOption } from "./ICalendarItem"

// ***********************************************************
// This includes methods that are useful in displaying a
// calendar. It has no state.
// ***********************************************************

// ******************************
// Series
// ******************************

const today = (): Date => dateOnly(new Date())

const beginningOfPeriod = (d: Date, periodUom: string, startDow: number): Date => {
	switch (periodUom) {
		case "year":
			return new Date(d.getFullYear(), 0)
		case "month":
			return new Date(d.getFullYear(), d.getMonth())
		case "week":
			return beginningOfWeek(d, startDow)
		default:
			return d
	}
}

const daysOfWeek = (weekStart: Date): Date[] => [...Array(7)].map((_, i) => addDays(weekStart, i))

// ********************************************
// Date transforms that retain time of day
// ********************************************
const addDays = (d: Date, days: number): Date => new Date(d.getFullYear(), d.getMonth(), d.getDate() + days, d.getHours(), d.getMinutes(), d.getSeconds())
const beginningOfWeek = (d: Date, startDow: number): Date => addDays(d, (startDow - d.getDay() - 7) % -7)
const endOfWeek = (d: Date, startDow: number): Date => addDays(beginningOfWeek(d, startDow), 7)

// ********************************************
// Date transforms that ignore/wipe time of day
// ********************************************
const beginningOfMonth = (d: Date): Date => new Date(d.getFullYear(), d.getMonth())
const instanceOfMonth = (d: Date): number => Math.ceil(d.getDate() / 7)

// This function increments a date by a given number of date units. Accepted units are: year, month, week. For year and month,
// the day of the month is unchanged. This could cause an unexpected result if the units are "month" and the starting day is
// higher than the number of days in the destination month. The count can be positive or negative.
const incrementPeriod = (d: Date, uom: string, count: number) =>
	new Date(d.getFullYear() + (uom == "year" ? count : 0), d.getMonth() + (uom == "month" ? count : 0), d.getDate() + (uom == "week" ? count * 7 : 0))

// ******************************
// Date formatting
// ******************************

const paddedMonth = (d: Date): string => ("0" + String(d.getMonth() + 1)).slice(-2)
const paddedDay = (d: Date): string => ("0" + String(d.getDate())).slice(-2)

const isoYearMonth = (d: Date): string => d.getFullYear() + "-" + paddedMonth(d)
const isoYearMonthDay = (d: Date): string => isoYearMonth(d) + "-" + paddedDay(d)
const isoMonthDay = (d: Date): string => paddedMonth(d) + "-" + paddedDay(d)

const formattedTime = (d: Date, locale: string, options?: Intl.DateTimeFormatOptions | undefined): string => {
	// Assume midnight = "all day" or indeterminate time
	if (d.getHours() === 0 && d.getMinutes() === 0 && d.getSeconds() === 0) return ""
	// If Intl is not supported, send back the 24-hour, zero-padded
	// hours and minutes, expressed as local time.
	if (!supportsIntl()) {
		var ms = new Date().getTimezoneOffset() * 60000 // TZ offset in milliseconds
		return new Date(d.getTime() - ms).toISOString().slice(11, 16)
	}
	return d.toLocaleTimeString(locale, options)
}

// Formats a date period in long English style. Examples supported:
// May 2018
// May – June 2018
// December 2018 – January 2019
// May 6 – 26, 2018
// May 13 – June 2, 2018
// December 16, 2018 – January 5, 2019
const formattedPeriod = (startDate: Date, endDate: Date, periodUom: string, monthNames: string[]) => {
	const singleYear = startDate.getFullYear() === endDate.getFullYear()
	const singleMonth = isSameMonth(startDate, endDate)
	const isYear = periodUom === "year"
	const isMonth = periodUom === "month"
	const isWeek = !isYear && !isMonth

	let s = []
	s.push(monthNames[startDate.getMonth()])
	if (isWeek) {
		s.push(" ")
		s.push(startDate.getDate())
	}
	if (!singleYear) {
		s.push(isWeek ? ", " : " ")
		s.push(startDate.getFullYear())
	}
	if (!singleMonth || !singleYear) {
		s.push(" \u2013 ")
		if (!singleMonth) {
			s.push(monthNames[endDate.getMonth()])
		}
		if (isWeek) s.push(" ")
	} else if (isWeek) {
		s.push(" \u2013 ")
	}
	if (isWeek) {
		s.push(endDate.getDate())
		s.push(", ")
	} else {
		s.push(" ")
	}
	s.push(endDate.getFullYear())
	return s.join("")
}

// ******************************
// Date comparisons
// ******************************

// Number of whole days between two dates. If present, time of day is ignored.
// Treats dates as UTC to avoid DST changes within the perioud leading to incorrect
// answers (#150).
const dayDiff = (d1: Date, d2: Date): number => {
	const endDate = Date.UTC(d2.getFullYear(), d2.getMonth(), d2.getDate()),
		startDate = Date.UTC(d1.getFullYear(), d1.getMonth(), d1.getDate())
	return (endDate - startDate) / 86400000
}

// http://stackoverflow.com/questions/492994/compare-two-dates-with-javascript
const isSameDate = (d1?: Date, d2?: Date): boolean => !!d1 && !!d2 && dayDiff(d1, d2) === 0

const isSameDateTime = (d1?: Date, d2?: Date): boolean => !!d1 && !!d2 && d1.getTime() === d2.getTime()
const isSameMonth = (d1?: Date, d2?: Date): boolean => !!d1 && !!d2 && d1.getFullYear() === d2.getFullYear() && d1.getMonth() === d2.getMonth()
const isPastMonth = (d: Date): boolean => beginningOfMonth(d) < beginningOfMonth(today())
const isFutureMonth = (d: Date): boolean => beginningOfMonth(d) > beginningOfMonth(today())
const isInFuture = (d: Date): boolean => dateOnly(d) > today()
const isInPast = (d: Date): boolean => dateOnly(d) < today()
const isLastInstanceOfMonth = (d: Date): boolean => d.getMonth() !== addDays(d, 7).getMonth()
const isLastDayOfMonth = (d: Date): boolean => d.getMonth() !== addDays(d, 1).getMonth()

const fromIsoStringToLocalDate = (s: string): Date => {
	let d = [...Array(7)].map((_) => 0)
	s.split(/\D/, 7).forEach((s, i) => (d[i] = Number(s)))
	d[1]-- // adjust month
	return new Date(d[0], d[1], d[2], d[3], d[4], d[5], d[6])
}

const toLocalDate = (d: any): Date => (typeof d === "string" ? fromIsoStringToLocalDate(d) : new Date(d))

const dateOnly = (d: Date | string): Date => {
	// Always use a copy, setHours mutates argument
	const d2 = new Date(d as unknown as VarDate)
	d2.setHours(0, 0, 0, 0)
	return d2
}

// ******************************
// Localization
// ******************************

const languageCode = (l: string): string => l.substring(0, 2)
const supportsIntl = (): boolean => typeof Intl !== "undefined"

const getFormattedMonthNames = (locale: string, format: DateTimeFormatOption): string[] => {
	// Use the provided locale and format if possible to obtain the name of the month
	if (!supportsIntl()) return [...Array(12)].map((_) => "")
	const formatter = new Intl.DateTimeFormat(locale, { month: format })
	// The year doesn't matter, using 2017 for convenience
	return [...Array(12)].map((_, i) => formatter.format(new Date(2017, i, 1)))
}

const getFormattedWeekdayNames = (locale: string, format: DateTimeFormatOption, startingDayOfWeek: number): string[] => {
	// Use the provided locale and format if possible to obtain the name of the days of the week
	if (!supportsIntl()) return [...Array(7)].map((_) => "")
	const formatter = new Intl.DateTimeFormat(locale, { weekday: format })
	// 2017 starts on Sunday, so use it as the baseline date
	return [...Array(7)].map((_, i) => formatter.format(new Date(2017, 0, (i + 1 + startingDayOfWeek) % 7)))
}

const getDefaultBrowserLocale = (): string => {
	// If not running in the browser, cannot determine a default, return the code for unknown (blank is invalid)
	if (typeof navigator === "undefined") return "unk"
	// Return the browser's language setting, implementation is browser-specific
	return (navigator.languages && navigator.languages.length ? navigator.languages[0] : navigator.language).toLowerCase()
}

// ******************************
// Calendar Items
// ******************************
const normalizeItem = (item: ICalendarItem, isHovered: boolean): INormalizedCalendarItem => {
	// Starting in version 6, classes must be an array of string
	// Classes may be a string, an array, or null. Normalize to an array
	const itemClasses = item.classes ? [...item.classes] : []
	// Provides support for pseudo-hover of entire item when one part of it is hovered
	if (isHovered) itemClasses.push("isHovered")
	return {
		originalItem: item,
		startDate: toLocalDate(item.startDate),
		// For an item without an end date, the end date is the start date
		endDate: toLocalDate(item.endDate || item.startDate),
		classes: itemClasses,
		// Items without a title are untitled
		title: item.title || "Untitled",
		// An ID is *required*. Auto-generating leads to weird bugs because these are used as keys and passed in items
		id: item.id,
		// Pass the URL along
		url: item.url,
		// Use the item's title as the tooltip if the tooltip is undefined or null (but not if it is blank -- use blank to essentially disable tooltips)
		tooltip: item.tooltip ?? item.title,
	}
}

export default {
	addDays,
	beginningOfMonth,
	beginningOfPeriod,
	beginningOfWeek,
	dateOnly,
	dayDiff,
	daysOfWeek,
	endOfWeek,
	formattedPeriod,
	formattedTime,
	fromIsoStringToLocalDate,
	getDefaultBrowserLocale,
	getFormattedMonthNames,
	getFormattedWeekdayNames,
	incrementPeriod,
	instanceOfMonth,
	isFutureMonth,
	isInFuture,
	isInPast,
	isLastDayOfMonth,
	isLastInstanceOfMonth,
	isoMonthDay,
	isoYearMonth,
	isoYearMonthDay,
	isPastMonth,
	isSameDate,
	isSameDateTime,
	isSameMonth,
	languageCode,
	normalizeItem,
	paddedDay,
	paddedMonth,
	supportsIntl,
	today,
	toLocalDate,
}
