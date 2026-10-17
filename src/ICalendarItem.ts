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

// T is the caller's own item type (typically `interface MyItem extends ICalendarItem { ... }`), so any extra
// properties on the items passed in are available, fully typed, on `originalItem`.
interface INormalizedCalendarItem<T extends ICalendarItem = ICalendarItem> extends ICalendarItem {
	endDate: Date
	originalItem: T
	classes: string[]
	itemRow?: number
}

type DateTimeFormatOption = "long" | "short" | "narrow" | undefined

export { ICalendarItem, INormalizedCalendarItem, DateTimeFormatOption }
