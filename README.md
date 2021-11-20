# VueSimpleCalendar

## Introduction

**vue-simple-calendar** is a flexible, themeable, lightweight calendar component for Vue that supports multi-day scheduled items.

**Important:** Version 6.0, released 2021-03-27, drops IE11 support and has been migrated to Vue 3 and Vite.
Version 5 is still is available via npm if you need Vue 2 or IE11 support, but it will not be maintained going forward.

## Demo

Here is a live demo page and the repo for it:
https://www.tallent.us/vue-simple-calendar/
https://github.com/richardtallent/vue-simple-calendar-sample

## Table of Contents

- [Features](#features)
- [Browser Compatibility](#browser-compatibility)
- [Installation and Usage](#installation-and-usage)
- [Props](#props)
- [Calendar Item Properties](#calendar-item-properties)
- [Events](#events)
- [Slots](#slots)
  - [header](#header)
  - [dayHeader](#dayHeader)
  - [dayContent](#dayContent)
  - [item](#item)
  - [weekNumber](#item)
- [Customizing the Look and Feel](#customizing-the-look-and-feel)
  - [Calendar classes](#calendar-classes)
  - [Week classes](#week-classes)
  - [Day classes](#day-classes)
  - [Calendar Item classes](#calendar-item-classes)
- [Future plans](#future-plans)
- [Day classes](#day-classes)
- [FAQ](#faq)
- [Build Setup](#build-setup)

## Features

There are other great calendar components out there, but most are either intended to be used as date pickers or had way too many features for me. I wanted something that would simply show a month as a grid and show scheduled activities (including multi-day items) on that grid. While the component goes beyond that simple use case, that is still the core focus.

- Shows a traditional month-grid calendar. Also supports weeks, years, or _multiple_ weeks, months, or years.
- Can show scheduled "items," including multi-day items, with an optional time of day.
- If there are too many items to see in a week, you can scroll to see the others.
- If there are too many weeks to see in the calendar component, you can scroll to see the others.
- Optional support for dragging and dropping items between dates.
- Automatic localization / internationalization (can be overridden).
- Lightweight!
- Flexbox layout (look ma, no tables!).
- No external dependencies (Moment, JQuery, etc.).
- Various user events (clicks, drags, etc.) are emitted by the calendar component.
- Weeks can start on any day of the week (defaults to Sunday).
- Easy to customize the theme (using CSS) to integrate with your own site
- Easy to customize using Vue slots
- Date range selection (programmatic or via user drag-select)

What this component _does not_ try to do:

- There will be no "agenda" view (time-of-day grid). Adding this view would require too much additional complexity.
- There is no interface for managing calendar items. This is far too use-specific.
- There is no built-in AJAX mechanism. This is also far too use-specific.
- Only the Gregorian calendar is supported (7-day weeks, etc.).
- It is not yet possible to "resize" items to cover more or fewer days. This may be added in the future.

## Browser compatibility

This component is compatible with relatively modern browsers (_i.e._, not IE11). Please note that this component is designed first for desktop web applications, not mobile, so while the component may _operate_ on a mobile device, the limited resolution may not allow for much in the way of useful functionality. Also, drag and drop only works on desktop browsers -- the drag events on touch devices are very different, I haven't had time to dig into them yet.

## TypeScript Support

For some reason, it seems to be nearly impossible to get Vite to be configured to both emit `.d.ts`
files on build and to allow use of `npm run dev`. The `typescript2` plugin (recommended by some Vue
experts) just seems to break HMR. So I've given up for now, until the Vite powers that be decide to
make a functional template for libraries that builds typescript declarations. This has been the only
real fly in the ointment for me migrating to Vite. If you have ideas, I'm all ears! In the meantime,
I've decided I can no longer allow this issue to prevent me from releasing the new version.

## Installation and Usage

_(This assumes you already have a web application set up for using Vue. If you're starting a new project,
look up the documentation for the Vue CLI, which will allow you to initialize a new project with webpack,
etc.)_

Install the component using npm:

```JavaScript
npm i --save vue-simple-calendar
```

In your application, you will need to:

- import the component and register it with Vue
- import the default theme or any other theme you want to use (CSS)
- create the `calendar-view` component
- create the `calendar-view-header` component as a child of the `calendar-view` if you want a header for the calendar
- wire up the properties and events

Tips:

- The component will fill its parent's height and width, so be sure the parent has a minimum height that is appropriate for the number of weeks and average items per week being shown.
- The default calendar header emits an `input` event when a user clicks a button in the header to move the calendar backward or forward through time. The event's argument is the new date to be shown. You have to handle this event and pass the date back to the calendar to change the view.
- To minimize the impact of an ancestor element's layout on the calendar's functionality, it is **recommended** that the parent of the `<calendar-view>` component _only_ contain the component, and that the parent have the following styles (#71):

```CSS
display: flex;
flex-direction: column;
flex-grow: 1;
```

Here's a minimal application example for an empty calendar, styled with the default theme and the US holidays theme:

```HTML
<template>
	<div id="app">
		<h1>My Calendar</h1>
		<calendar-view
			:show-date="showDate"
			class="theme-default holiday-us-traditional holiday-us-official">
			<template #header="{ headerProps }">
				<calendar-view-header
					:header-props="headerProps"
					@input="setShowDate" />
			</template>
		</calendar-view>
	</div>
</template>
<script>
	import { CalendarView, CalendarViewHeader } from "vue-simple-calendar"
	
	import "..relative-path-to-node_modules/vue-simple-calendar/dist/style.css"
	// The next two lines are optional themes
	import "..relative-path-to-node_modules/vue-simple-calendar/static/css/default.css"
	import "..relative-path-to-node_modules/vue-simple-calendar/static/css/holidays-us.css"

	export default {
		name: 'app',
		data: function() {
			return { showDate: new Date() }
		},
		components: {
			CalendarView,
			CalendarViewHeader,
		},
		methods: {
			setShowDate(d) {
				this.showDate = d;
			},
		}
	}
</script>
<style>
	#app {
		font-family: 'Avenir', Helvetica, Arial, sans-serif;
		color: #2c3e50;
		height: 67vh;
		width: 90vw;
		margin-left: auto;
		margin-right: auto;
	}
</style>
```

## Props

The following properties are supported, by functional area:

### Grid Display

- `showDate` - The period to show by default. Defaults to today's date (user local time). Any time component is ignored.
- `displayPeriodUom` - The period type to show. By default this is `month`, _i.e._, it shows a calendar in month-sized chunks. Other allowed values are `year` and `week`.
- `displayPeriodCount` - The _number_ of periods to show within the view. For example, if `displayPeriodUom` is `week` and `displayPeriodCount` is 2, the view will show a two-week period.
- `startingDayOfWeek` - The day of the week that starts each week. Defaults to `0` (Sunday), valid range is 0-6. Common non-default values would be
  `1` (Monday) for Europe or `6` (Saturday) for much of the Middle East.
- `dateClasses` - Optional object, where the key is a date in ISO form (e.g., "2018-04-15") and the value is a string or array of additional CSS classes that should be applied to the main element for that date. This could be useful for dynamically highlighting selected dates, holidays, blocked-off dates, etc. **NOTE:** For an example of how to use this property and associated styling, please refer to the [demo app](https://github.com/richardtallent/vue-simple-calendar-sample), which uses this prop to put a dagger emoji on the "ides" of the current month (the 13th or 15th, depending on the month) and some other icons on the 21st.
- `periodChangedCallback` - Optional **function** to be called calendar updates initially and any time thereafter where the date range shown on the calendar changes. This is intended to allow your application to, say, query a back-end server to update the `items` property based on the date range visible in the calendar. When your function is called, it is passed an object as the argument, with four keys: `periodStart` / `periodEnd` (the dates that fall within the range of the months being shown) and `displayFirstDate` / `displayLastDate` (the dates shown on the calendar, including those that fall outside the period). See CHANGELOG for details on why I'm using a functional property rather than emitting an event.
- `displayWeekNumbers`: Adds a column for each week to show the "week number." By default, this appears to the left of the days and contains the calendar week number. The position can moved to the right using CSS. See the `weekNumber` slot for more details.

### Grid Selection

- `enableDateSelection` - If true, the user can "drag" their cursor across dates to select a date range. When the user starts dragging, a `date-selection-start` is emitted. As the user drags into other dates, `date-selection` events are emitted. When the user stop dragging, a `date-selection-finish` event is emitted. All of these events sent a **three-element array** payload. The first two elements are the new date range selected, the third is the original DOM drag event. Note that this represents what the _user selected_ -- if you want to highlight those dates, you'll need to pass the dates back as `selectionStart` and `selectionEnd` props. This allows you to modify the selection highlights as needed (for example, performing some action (such as adding a new event, like Google Calendar) and clearing it when that action is complete).
- `selectionStart` - the start of the date range you want to select. This date is decorated with the `selectionStart` class.
- `selectionEnd` - the end of the date range you want to select. This date is decorated with the `selectionEnd` class.

Note: Each date between `selectionStart` and `selectionEnd` (including them) has the `aria-selected` attribute. This is used in the default CSS theme to highlight these in yellow).

### Header Display

- `locale` - The BCP 47 language tag used to determine the month and day names. Defaults to the user's browser language setting.
- `monthNameFormat` - The format to use for the month names. Possible values are `numeric`, `2-digit`, `narrow`, `short`, or `long`, and the default is `long`.
- `weekdayNameFormat` - The format to use for the names of the days of the week. Possible values are `narrow`, `short`, or `long`, and the default is `short`.
- `disablePast` - If true, prevents the user from navigating to previous periods. Default is `false`. (Note: since this is a Boolean value, you should use `v-bind` on the attribute.)
- `disableFuture` - If true, prevents the user from navigating to future periods. Default is `false`. (Note: since this is a Boolean value, you should use `v-bind` on the attribute.)
- `currentPeriodLabel` - Optional label for the "Today" button (the button in the header to return to the current period). If blank, this will show the current date period (_i.e._, the period where today's date would fall). If this has the special value `icons`, it will display an icon, where the icon depends on whether the current date period is in the past, is the displayed period, or is in the future. The default icons for this are `⇤`, `-`, and `⇥`, respectively. If you use any other string, the button will show the literal value you provide.
- `currentPeriodLabelIcons` - Optional replacement for the above three icons. Pass this as a three-character string.

### Items (Scheduled events to show on the calendar)

- `items` - An array of items to show on the calendar. See _Calendar Item Properties_ below for more details.
- `enableDragDrop` - If true, items are draggable, and dragging and dropping them emits events you can catch and respond to. Default is `false`. (Note: since this is a Boolean value, you should use `v-bind` on the attribute.)
- `showTimes` - If true, shows the start and/or end time of an item beside the item title. Midnight is not shown, a midnight time is assumed to indicate an all-day or indeterminate time. (If you want to show midnight, use `00:00:01` and don't choose to show seconds.) The default is `false`.
- `timeFormatOptions` - This takes an object containing `Intl.DateTimeFormat` options to be used to format the item times. The `locale` setting is automatically used. This option is ignored for browsers that don't support `Intl` (they will see the 24-hour, zero-padded time).
- `doEmitItemMouseEvents` - Optional, default is false. If true, emits `item-mouseenter` and `item-mouseleave` events when the mouse hovers over a calendar item. In most cases, styling the `isHovered` class is enough to handle hover interactions with a calendar item. However, if you want to, say, show a tooltip or menu when a user hovers over a calendar item, you may need access to the real-time mouse DOM events. Be sure that your use of these events doesn't conflict with the user's ability to click, drag, read, or otherwise interact with the calendar items. NOTE: if you use slots for your calendar items, this property is ignored. (#136)
- `itemTop` - Optional string of a CSS height to be used as the baseline for where items are positioned relative the top of the week. By default, this is `1.4em`, the height of the standard `cv-day-number` element.
- `itemContentHeight` - Optional CSS string of the total height of your items, _not including_ borders. The default is `1.4em` (1.0 from the font, 0.2 \* 2 from the padding.). You would only set this if you're overriding the item height. This doesn't actually change the item height, it is only used to position the items below one another.
- `itemBorderHeight` - Optional CSS string of the sum of your items' top and bottom borders. The default is `2px`. You would only set this if you're overriding the item's top and/or bottom border width. This doesn't change the borders, it is only used to position the items below one another.

Tips for Vue component properties:

- Remember to use _kebab-case_ when specifying these properties using attributes on the `calendar-view` element (_e.g._, `<calendar-view month-name-format="long">`:
- Remember to use _binding_ (`:` prefix) for properties that should be a Boolean, number, array, or otherwise interpreted with JavaScript (_e.g._, `<calendar-view :show-times="true">`). You can omit the `:` for string properties with literal values.

## Calendar Item Properties

Each item shown on the calendar can have the following properties. `id` and `startDate` are required, and `title` is strongly recommended.

- `id` - A unique identifier for the item. This is required and must be unique.
- `startDate` - The date the item starts on the calendar. This must be either passed as a JavaScript date object or as a string following an ISO-like form of "yyyy-mm-dd HH:MM:SS" (time is optional, and within time, minutes and seconds are both optional).
- `endDate` - The date the item ends on the calendar. Defaults to the same date as `startDate`. This must be either passed as a JavaScript date object, or as a string following an ISO-like form of `yyyy-mm-dd HH:MM:SS` (time is optional, and within time, minutes and seconds are both optional).
- `title` - The name of the item shown on the calendar. Defaults to "Untitled".
- `url` - The URL associated with the item. The component has no built-in action associated with this, but it does add a "hasUrl" class to the item. To "follow" the URL, you'll need to listen for the `click-item` event and take the appropriate action.
- `classes` - An array of strings with any additional CSS classes you wish to assign to the item.
- `style` - A string with any additional CSS styles you wish to apply to the item.

## Events

(Note: below, `calendarItem` refers to the **normalized** version of the calendar item involved in the activity. For more information, see the "item" slot below.)

You can create handlers for the following Vue events to add custom functionality (with their payload array):

### Clicks

- `@click-date([date, calendarItems, windowEvent])`: fires when the user clicks a date
- `@click-item([calendarItem, windowEvent])`: fires when the user clicks a calendar item

### Date selection (day drag and drop)

- `@date-selection-start([startDate, endDate, windowEvent])`: fires when the user starts drag-selecting dates.
- `@date-selection([startDate, endDate, windowEvent])`: fires as the user moves across dates while drag-selecting.
- `@date-selection-finish([startDate, endDate, windowEvent])`: fires when the user stops drag-selecting dates (_i.e._, they release the mouse button)

### Calendar Item Hover

- `@item-mouseenter([calendarItem, windowEvent])`: optional (controlled by doEmitItemMouseEvents prop), fires when the user's pointer hovers over a calendar item.
- `@item-mouseleave([calendarItem, windowEvent])`: optional (controlled by doEmitItemMouseEvents prop), fires when the user's pointer leaves a calendar item.

### Calendar Item Drag and Drop

- `@drag-start([calendarItem, windowEvent])`: fires when the user starts dragging a calendar item
- `@drag-enter-date([calendarItem, date, windowEvent])`: fires when a calendar item is dragged over a date
- `@drag-leave-date([calendarItem, date, windowEvent])`: fires when a calendar item is dragged out of a date without dropping it there
- `@drag-over-date([calendarItem, date, windowEvent])`: fires multiple times as a calendar item is hovered over a date
- `@drop-on-date([calendarItem, date, windowEvent])`: fires when a calendar item is dropped on a date

## Slots

### header

This named slot contains the component you want to use as the calendar's header. Generally, this would show the current date range, and allow the user to navigate back and forth through time. If you don't provide a component for this slot, there will be no header, just the calendar grid. This component comes with a nice default header component, `CalendarViewHeader`, which you can either use directly, or use as a template for creating your own. (Prior to 4.0, if you didn't provide a component, a default header would be shown. That is no longer the case for reasons explained in the CHANGELOG.)

```HTML
<calendar-view :show-date="myShowDate">
	<calendar-view-header slot="header" slot-scope="{ headerProps }" :header-props="headerProps" @input="setMyShowDate" />
</calendar-view>
```

The parent `calendar-view` passes a property called `headerProps` to the header component. This property includes all of these values (basically, anything you would normally need to render a calendar header):

- `periodStart`: the first date of the `displayPeriodUom` containing `showDate`
- `periodEnd`: the last date of the `displayPeriodUom` containing `showDate` (the `displayPeriodCount` setting impacts this)
- `previousYear`: one year before `periodStart`
- `previousPeriod`: one `displayPeriodUom` before `periodStart` (_regardless_ of the `displayPeriodCount` setting)
- `nextPeriod`: one `displayPeriodUom` after `periodStart` (_regardless_ of the `displayPeriodCount` setting)
- `previousFullPeriod`: one `displayPeriodUom` before `periodStart` (takes the `displayPeriodCount` setting into consideration)
- `nextFullPeriod`: one `displayPeriodUom` after `periodStart` (takes the `displayPeriodCount` setting into consideration)
- `nextYear`: one year after `periodStart`
- `currentPeriod`: the date at the beginning of the `displayPeriodUom` containing today's date (user local time)
- `currentPeriodLabel`: the _computed_ label (using the logic described for the property of the same name on the calendar component above) of the period containing today's date.
- `displayLocale`: the user's locale setting
- `displayFirstDate`: the first date shown in the calendar (may differ from `periodStart`--_e.g._, if periodStart is June 1, 2018, displayFirstDate will be May 27, 2018)
- `displayLastDate`: the last date shown in the calendar (ditto)
- `monthNames`: an array of the formatted names of the months to use based on the locale and month format settings
- `fixedItems`: a copy of the calendar items, normalized to all have start/end dates, "Untitled" if there is no title, etc.

Since `CalendarView` has some logic around whether the user should be able to navigate to the past or the future, some of these dates will be null if the corresponding action is disabled.

The developer implementing her own header simply needs to create a header component that, like the default header component:

- Receives this information and displays it with appropriate UI elements (suggested property name: `headerProps`)
- Emits an event when the user wants to change the calendar period (suggested event name: `input`)

Note above that both `previousPeriod` and `previousFullPeriod` are provided, as well as `nextPeriod` and `nextFullPeriod`. The reason for this distinction is to allow the developer to decide how the calendar's Previous and Next buttons should move through time if `displayPeriodCount` is greater than 1. My personal preference is to move forward and backward by one week / month, allowing the user to pinpoint the exact date window they wish to see. But in some applications (a "quarterly" calendar, for example, or a calendar with set two-week periods), it may be better for the buttons to jump backward and forward based on the `displayPeriodCount` setting. This gives the developer both options -- just choose which interaction you want to use, and use those dates to set the new `showDate`.

### dayHeader

This optional named slot **replaces** the default `div.day` elements that appear in the column headers for each day of the week. If all you need to do is change how the names are shown, it's probably better to override the `locale` and/or `weekdayNameFormat` property. This slot is intended for situations where you need to override the markup within each header cell. For example, if you want each day of the week to be clickable.

This slot passes two scoped variables: `index`, 0-7, and `label`, the text it would have used in the header based on the current `locale` and `weekdayNameFormat`.

### dayContent

This optional named slot allows you to provide your own contents within the date cell. The day of the month is rendered in a separate (sibling) element with the class `cv-day-number`, so you should use CSS to hide this class if you want your slot to be the only content in the cell. Note that items are rendered _above_ the individual date cells, so your slot content will appear below any items on that day.

This slot passes one scoped variable: `day`, the date associated with the cell.

### item

This optional named slot **replaces** the `div.item` for each item (not just the contents of the items element, the entire element). Use this if you want to override _entirely_ how items are rendered. For example, on a small mobile device, you may want to show just a thin stripe, dots, or icons to indicate items, without titles or times. This slot passes three scoped variables:

- `value`: the _normalized_ calendar item
- `weekStartDate`: the date of the first day of the week being rendered
- `top`: the CSS `top` value that you should apply to the style of your item element so it appears in the proper place. Assumes standard metrics for items, so if you have your own metrics, you'll need to compute and apply the top position yourself using the `itemow` value passed in the item.

Note that `item` is a version of the calendar item _normalized_ to be shown on that week's row, it's not the bare item pulled from the `items` prop. This customized version parses and defaults the `startDate` and `endDate`, defaults missing `id` to a random number, defaults a blank title to "Untitled", and adds a number of `classes` values based on the position and role of the item as shown for that week (whether it continues from the previous week, etc.). The original item is passed back as `item.originalItem`.

### weekNumber

This optional named slot **replaces** the content shown in the "week number" column. By default, this shows the week number of that week within its year (given your chosen startingDayOfWeek, and where week "1" is the week that contains January 1). However, using the `weekNumber` slot, you can use this column to display anything -- a number, icons, text, etc. This slow passes three scoped variables:

- `weekStart`: The date that begins the week
- `numberInYear`: The calendar week number (_i.e._, the number that would have been displayed by default)
- `numberInPeriod`: The number of the week within the period (the month, unless you've overridden the period shown)

Using CSS, you can define your own width, colors, etc., and you can move the column to display after the days rather than before.

Note that this column "belongs" to the week, so if the week scrolls due to the number of items that week, so will the contents of this column.

## Customizing the Look and Feel

In addition to slots, this component is designed to allow for significant customization of the look and feel solely through CSS. Here's the structure of the markup generated by the component (combined with the default header component). Each line represents a Vue SLOT (all caps) or an HTML element (first word on the line). Indentation represents the hierarchy. Each word _after_ the first word is a class applied to the element. Elements or classes in (parenthesis) are conditional. Loops (_i.e._, `v-for`) are shown in [brackets].

Note that the items are _not_ child nodes of the days, they are children of the week and positioned above the days. This allows items to span multiple days.

```text
div cv-wrapper locale-X yYYYY mMM (past|future) period-X periodCount-X wrap-item-title-on-hover
	HEADER
		div cv-header
			div cv-header-nav
				button previousYear
				button previousPeriod
				button nextPeriod
				button nextYear
				button currentPeriod
			div periodLabel
				div startMonth
				div startDay
				div startYear
				div endMonth
				div endDay
				div endYear
	div cv-header-days
		div cv-header-day dowX [x7]
	div cv-weeks
		div cv-week weekX wsYYYY-MM-DD [x # weeks in visible period]
			(div cv-weeknumber)
				span
			dv-weekdays
				div cv-day dowX dYYYY-MM-DD dMM-DD dDD wmX (past|today|future|last|outsideOfMonth|lastInstance|selectionStart|selectionEnd) [x 7]
					div cv-day-number
					DAYCONTENT
				ITEM
					div cv-item offsetX spanX (continued|toBeContinued|hasUrl|hasItems) [x # of items]
						span startTime (hasEndTime)
						span endTime (hasStartTime)
```

where:

### Calendar classes

#### locale-_X_

Two locale classes are added--one for the user's full locale, the other for just the first two letters (the language),
both in lowercase. You could use this information to hide or show specific holidays, or to localize text using CSS `content`.
Example:

> locale-en locale-en-us

#### y*YYYY*

The full year of the starting period of the current view.

#### m*MM*

The month (01-12) of the starting period of the current view.

#### (future|past)

When the period shown does not include today's date (local time), one of these classes is added. By default, this shows and hides and determines the label for the button that returns the view to the current period.

#### period-X

The current `displayPeriodUom` value (`year`, `month`, or `week`).

#### periodCount-X

The current `displayPeriodCount` value (a number, usually `1`).

### Week classes

#### week*X*

Each week is numbered, starting with the first week of the visible period. (This is not the same as the value in the optional "week number" column.)

#### ws*YYYY-MM-DD*

Each week also has a class representing the date of the Sunday starting that week. This could be used to style entire weeks that have some special importance.

#### wrap-item-title-on-hover

If an item title is truncated, this enables an _optional_ behavior that will wrap the item to show the entire title when the user hovers over it.

### Day classes

#### dow*X*

This class is for the day of the week, ranging from 0 to 6. This allows you to easily style certain days of the week (say, weekend days) differently from other days. The same class is also added to the weekday headers.

#### d*YYYY-MM-DD* / d*MM-DD* / d*DD*

Each day in the grid is given three special classes -- one for the month and day (01/01-12/31), one for the day (01-31), and one for the entire ISO 8601 date. This allows easy styling of holidays and other special days using CSS alone (rather than using calendar items).

The demo calendar has some examples of using these to add holiday emoji beside the day numbers. Example:

> d2017-05-23 d05-23 d23

#### instance*X*

The instance of the weekday within _the day's_ month. For example, the class `instance1` is added to the _first_ Sunday, Monday, etc. of the month. Note that since this is relative to the day, not the "main" month being shown, days visible from the previous or next month will also have these classes, relative to their own month.

This makes it easy to style, say, the first and third Friday of each month. The demo app has some custom styles using this feature to add emoji to Labor Day and Thanksgiving.

#### lastInstance

Added to the last instance of a particular day of the week within its month (as above, relative to the day in question, which means the last day of the month previous, if in view, will also have this class. The example application uses this to show an emoji for Memorial Day (the last Monday of May in the US).

#### outsideOfMonth

This class is added to each day falling outside of the month being shown. By default, these days are greyed out.

#### past

This class is added to days before the current date (local time).

#### today

This class is added to the current date (local time), if visible on the current view.

#### future

This class is added to days after the current date (local time).

#### last

This class is added to the last day of its month.

#### selectionStart

This class is added to the day specified by the `selectionStart` prop.

#### selectionEnd

This class is added to the day specified by the `selectionEnd` prop.

### Calendar Item classes

#### offset*X*

This class on an item represents the day of the week when the item starts _on this week_. If an item spans more than one week, the offset for the second week, etc. would be `offset0` (Sunday).

#### span*X*

This class on an item represents the width of the item display _that week_, in days. For example, if an item spans from a Thursday to the next Wednesday, it would have `span3` on the first week and `span4` on the second week.

#### continued

This is added to an item when it is continuing from a previous week. By default, this turns off the rounded corners on the left side of the item box and adds a grey right-arrow before the title.

#### toBeContinued

This is added to an item when it is spills over into the following week. By default, this turns off the rounded corners on the right side of the item box and adds a grey right-arrow after the title.

#### hasUrl

This is added to an item when it has a `url` attribute (i.e., it is a hyperlink). By default, this is used to add a hovering underscore to item titles that are hyperlinked.

#### isHovered

This is added for all item elements whose `id` matches the `id` of the item being hovered. (This allows proper hover styling--when items wrap to more than one week, they are represented by more than one element, so a standard `:hover` selector will only select the element being hovered, not the entire item.) Note that there is no default styling for this, it is solely provided so you can choose to style hovered items if you wish.

I'm open to other suggestions, provided they are easily calculated and there's some reasonable use case for having them.

#### startTime / endTime

These classes are applied to the start and end time of an item, respectively.

## Plans

- [x] Keep it simple, not a kitchen-sink control.
- [x] Better docs.
- [x] Add optional external stylesheets (keep scoped styling to the basics).
- [x] Add a "starts-on-Monday" mode.
- [x] Add support for showing item times
- [x] Possibly add a "week" view (no time of day scaling, just 7 taller boxes).
- [x] Possibly add modes for a set number of weeks, multiple months, or even a full year.
- [x] Extract date manipulation methods to a separate plugin.
- [ ] Material theme (would love help with this)
- [ ] Apple Calendar theme (would love help with this)
- [ ] Outlook Calendar theme (would love help with this)
- [ ] I'm not 100% happy with the Intl time format options, especially to show time ranges compactly. Considering a custom formatter or the ability to pass a formatter function as a property.
- [x] Rename the primary CSS classes (`calendar-view`, `day`, `week`, etc.) to depend far less on cascades, making it easier to customize the theme (breaking change for themes, targeted for 3.0.0).

## Contributions

- PRs and issues are welcome!
- Please use the same code style -- there are linter configs included for styles, plain JavaScript, and Vue components.
- Use of Prettier is recommended.
- Please keep each PR related to a single fix or feature, and ideally start an Issue so we can discuss the details rather than just lobbing a PR over the fence with no prior communication. :)
- Please play nice with others.
- Any PRs will be accepted as having been released under the same license (MIT) as this component.

## Inspiration

This project was inspired by Monthly.js, a JQuery-based control I've contributed to. Unfortunately, I wasn't able to port the code and still do things the Vue / Vanilla JS way, but I did borrow some of the concepts from that component.

## FAQ

(Ok, not really frequently-asked, but just random stuff.)

### Why Vue?

Because Vue is awesome. I've been using it since early 2017 in production, and I've migrated my applications from ExtJS, JQuery, and Riot to Vue components. If you prefer React or Angular, it should be reasonably easy to port it. If you do, please let me know, maybe we can coordinate on feature upgrades!

### Can you add feature "X"?

Maybe. Depends if it fits the core functionality of viewing a calendar grid. I don't want to create something that replicates all possible calendar views, and definitely don't want to add functionality for creating or editing calendar items (that should be handled by the application/component hosting the view).

### Why not use moment.js?

Moment.js is great, but I would only need a tiny fraction of its capabilities, and for simplicity, I wanted to not have any dependencies (other than Vue of course).

### Why is the style so "plain"?

The **baseline** style (what you get with no external CSS files imported) is intended to be as bare as possible while still providing full functionality and legibility. The idea here is to make integrating this component into your own theme as easy as possible by inheriting what it can from your parent application and minimizing the places where you may need to override its choices.

The **default theme** stylesheet builds on this baseline to provide a restrained, clean, simple theme for the calendar, and is useful if you don't intend to create your own theme. You can include it from `static/css/default.css`. The sample app uses this stylesheet.

A third stylesheet, `static/css/holidays-us.css`, shows how simple it is to use CSS to style specific days using CSS selectors (it adds emoji icons for various holidays).

### What styles can I _not_ override?

- If you change the `cv-day-number` height, you'll need to set the `itemTop` property so the first item is positioned below the day numbers.
- If you change the `cv-item` height, you'll need to set the `itemContentHeight` and/or `itemBorderHeight` properties, so each item is positioned below the previous item. Every item must still have the same height.
- The calendar bases all metrics other than borders (which are in pixels for Reasons) on `em` units, so if you find the font size is not ideal, it's better to change the calendar's parent font size and let the calendar scale accordingly than to try to manually adjust each element within the calendar. It's generally a good web design practice to limit the number of font sizes in use, which is why everything in the calendar (other than the default header label) uses the same relative font size by default (`1.0em`).
- The `z-index` of the weeks and items are managed using `style` declarations, they ensure that items for one week don't overlap the next week.

## Build Setup

```bash
# install dependencies
npm install

# build for production with minification
npm run bundle
```
