import { INormalizedCalendarItem } from "./ICalendarItem"
import CalendarMath from "./components/CalendarMath"

class CalendarViewState {
	currentDragItem: INormalizedCalendarItem | null = null
	dateSelectionOrigin: Date | null = null
	currentHoveredItemId: string = ""
	CalendarMath: object = CalendarMath
}

export default CalendarViewState