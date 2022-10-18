interface ICalendarItem {
	// Required
	id: string
	startDate: Date
	title: string

	// Optional
	tooltip?: string
	endDate?: Date
	url?: string
	classes?: string[] | null
	style?: string
}

interface INormalizedCalendarItem extends ICalendarItem {
	endDate: Date
	originalItem: ICalendarItem
	classes: string[]
	itemRow?: number
}

type DateTimeFormatOption = "long" | "short" | "narrow" | undefined

export { ICalendarItem, INormalizedCalendarItem, DateTimeFormatOption }
