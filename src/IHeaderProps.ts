import { ICalendarItem } from "./ICalendarItem"

interface IHeaderProps {
	periodStart: Date
	periodEnd: Date
	previousYear: Date | null
	previousPeriod: Date | null
	nextPeriod: Date | null
	previousFullPeriod: Date | null
	nextFullPeriod: Date | null
	nextYear: Date | null
	currentPeriod: Date
	currentPeriodLabel: string
	periodLabel: string
	displayLocale: string
	displayFirstDate: Date
	displayLastDate: Date
	monthNames: string[]
	fixedItems: ICalendarItem[]
}

export { IHeaderProps }
