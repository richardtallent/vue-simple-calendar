
The basic list of changes for now is in the README file. This is more of a detailed list of changes for migration purposes.

### Coming at some point?
- Mobile-compatible drag and drop
- Handles to drag events to make them longer or shorter

### Coming in 2.3.0
- CSS reorganization to rely less on complex cascading (easier theming)
- More flexible header customization
- IE11 support fix? (I'm losing my ability to test IE11 soon but plan to maintain compatibility for a bit longer, with some help)

### Changes in 2.2.0
- Removed the events deprecated in 2.1.0
- Upgraded to Webpack 4

### Changes in 2.1.0
The events above were renamed to make them kebab-case (for DOM template compatibility) and to refine the wording. The old event names, shown here respectively, were removed in 2.2:
* `clickDay`
* `clickEvent`
* `setShowDate`
* `dragEventStart`
* `dragEventEnterDate`
* `dragEventLeaveDate`
* `dragEventOverDate`
* `dropEventOnDate`

### Changes in 2.0.0
Version 2.0 includes some major upgrades! Here are the new features:

- Dates passed as strings are interpreted using *browser local* time, not UTC, which prevents the event from showing up on an unexpected date.
- Optional display of start and/or end times of events, with options for formatting
- Ability to view more than one month at a time
- Week view (including multi-week)
- Year view (including, but not necessarily sanely, multi-year support)
- New named slot for `event`
- All slots now pass back useful properties the caller can bring into their scope
- The main grid is scrollable if it is too tall for the component
- Each week is scrollable if its events are too tall for the week's row in the component

This means there are some breaking changes:
- The component is now called **calendar-view** rather than **calendar-month**, to better reflect the flexibility of the period shown. (The package is still `vue-simple-calendar`.)
- Because of the above, the CSS class of the root element has also changed to **calendar-view**.
- The CSS class of the element containing the body of the view has changed from **month** to **weeks**, since periods other than a single month can be shown.
- If you pass dates as strings, they MUST be in ISO form ("yyyy-mm-dd hh:mm:ss"). The time portion is optional, and within time, the minutes and seconds are also optional.
- The header has been refactored to take better advantage of flexbox, increase the header text size, and group the buttons. This should make it easier to customize, but if you have a custom theme, it may need some updates.
- If the calendar is too short to view the entire period, the calendar body is scrollable (scroll bars are hidden, use touch or scroll wheel).
- If an individual week is too short to view all events in the week, the week's events are scrollable (scroll bars are hidden, use touch or scroll wheel).
- The minimum cell height is now 3em, to ensure that at least one event shows vertically, and if there are others to scroll to, a small part of the next one is visible.
- Emitted drag and drop events pass the original calendar event, not just its id.
- The `dragEventDragOverDate` event (undocumented) has been renamed as `dragEventOverDate`. Prior to 2.0, user events emitted the calendar event's *id* as the first argument rather than the calendar event itself. Since not all calendar events will have an ID and the parent will probably want access to the actual calendar event, I changed these Vue events to emit the original calendar event, not just its id.
- The `dayList` slot has been replaced with `dayHeader`, and slot `day` has been renamed as `dayContent`.
- The word `slot` in the sense of an event display row has been renamed as `eventRow` in the code and CSS to avoid confusion with Vue slots.
- Up to 20 events per day are now supported (up from 10).
- Some basic colors, borders, etc. have been moved from the default theme into the component's core CSS, allowing the component to have a more appealing look with no theme in place and a better starting point for custom themes.
- Reversed the circle-arrow labels to return to the current period. These are now clockwise to "go forward" to return to the current period, counter-clockwise to "go back" to return to the current period.

#### Props Added in 2.0 
* `showEventTimes` - If true, shows the start and/or end time of an event beside the event title. Midnight is not shown, a midnight time is assumed to indicate an all-day or indeterminate time. (If you want to show midnight, use `00:00:01` and don't choose to show seconds.) The default is `false`.
* `timeFormatOptions` - This takes an object containing `Intl.DateTimeFormat` options to be used to format the event times. The `locale` setting is automatically used. This option is ignored for browsers that don't support `Intl` (they will see the 24-hour, zero-padded time).
* `displayPeriodUom` - The period type to show. By default this is `month`, *i.e.*, it shows a calendar in month-sized chunks. Other allowed values are `year` and `week`.
* `displayPeriodCount` - The *number* of periods to show within the view. For example, if `displayPeriodUom` is `week` and `displayPeriodCount` is 2, the view will show a two-week period.

### Changes in 1.8.2
- A `dayList` slot was added.
- A `day` slot was added.
