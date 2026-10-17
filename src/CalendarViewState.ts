import { ICalendarItem, INormalizedCalendarItem } from "./ICalendarItem"
import CalendarMath from "./CalendarMath"

class CalendarViewState<T extends ICalendarItem = ICalendarItem> {
	currentDragItem?: INormalizedCalendarItem<T> = undefined
	dateSelectionOrigin?: Date = undefined
	currentHoveredItemId: string = ""
	CalendarMath: object = CalendarMath
}

export default CalendarViewState
