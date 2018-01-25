- [Introduction](#vue-simple-calendar)
  - [Demo](#demo)
  - [Version 2.0](#version-2.0-new-features-and-breaking-changes)
  - [Features](#features)
  - [Installation and Usage](#installation-and-usage)
  - [Props](#props)
    - [In 2.0](#props-new-in-2.0)
  - [Calendar Event Properties](#calendar-event-properties)
  - [Component Events](#component-events)
    - [In 2.0](#component-events-breaking-change-in-2.0)
  - [Slots](#slots)
    - [header](#header)
      - [2.0](#header-new-to-2.0)
    - [dayHeader](#dayHeader)
    - [dayContent](#dayContent)
    - [event](#event)
  - [Customizing the Look and Feel](#customizing-the-look-and-feel)
  - [Calendar classes](#calendar-classes)
  - [Week classes](#week-classes)
  - [Day classes](#day-classes)
  - [Classes for Events](#classes-for-events)
  - [Future plans](#future-plans)
  - [Day classes](#day-classes)
  - [FAQ](#faq)
  - [Release History](#release-history)
  - [Build Setup](#build-setup)
    

# vue-simple-calendar

This is a calendar component for Vue.

There are other Vue calendar components, but they were either focused on date-picking, or the events (such as clicking an event or a date) were too tightly bound to specific views (such as linking to an agenda). The closest I probably found was FullCalendar, but it had _too many_ features.

My use case is far simpler--I just wanted a traditional month-grid calendar, with events listed (including multi-day events), that would raise events when the calendar month is changed or the user clicks/taps a date or event. (This has evolved, and now the component supports week, year, multi-week, multi-month, and multi-year grids.)

PRs, ideas, and issues are welcome.

## Demo

Here's a live demo page:
https://www.tallent.us/vue-simple-calendar/

The repository for the demo page is here, you can pull and run it on your own to learn the ropes and test ideas:
https://github.com/richardtallent/vue-simple-calendar-sample

## Version 2.0 New Features and Breaking Changes

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
- The `dragEventDragOverDate` event (undocumented) has been renmaed as `dragEventOverDate`.
- The `dayList` slot has been replaced with `dayHeader`, and slot `day` has been renamed as `dayContent`.
- The word `slot` in the sense of an event display row has been renamed as `eventRow` in the code and CSS to avoid confusion with Vue slots.
- Up to 20 events per day are now supported (up from 10).
- Some basic colors, borders, etc. have been moved from the default theme into the component's core CSS, allowing the component to have a more appealing look with no theme in place and a better starting point for custom themes.
- Reversed the circle-arrow labels to return to the current period. These are now clockwise to "go forward" to return to the current period, counter-clockwise to "go back" to return to the current period.

## Features

* Shows a traditional month-grid calendar--or week, or year, or multiples of those.
* Can show "events," including multi-day events, with optional times.
* If there are too many events to see in a week, you can scroll to see the others.
* If there are too many weeks to see in the calendar component, you can scroll to see the others.
* Optional support for dragging and dropping events between dates.
* Localized automatically (overridable).
* Lightweight!
* Flexbox layout (look ma, no tables!).
* No external dependencies (Moment, JQuery, etc.).
* Emphasizes customization via CSS or scoped/named slots.
* User events (clicks, drags, etc.) are emitted to the parent component.
* Weeks can start on any day of the week (defaults to Sunday).

## Installation and Usage

_(This assumes you already have a web application set up for using Vue. If you're starting a new project, look up the documentation for the Vue CLI, which will allow you to initialize a new project with webpack, etc.)_

Install the component using npm:

```
npm i --save vue-simple-calendar
```

In your application, you'll need to:

* import the component
* import the default theme and any additional themes you want to apply
* create the `calendar-view` custom element
* wire up the element's properties and events

Tips:

* The component will fill its parent's height and width, so be sure the parent has a minimum height that looks good.
* This is a pure component, it doesn't change its own state, so clicking the previous/next buttons don't do anything unless you provide a `show-date` attribute and update that attribute when the component fires the `show-date-changed` event.

Here's a minimal application example for a calendar with no events, but styled with the default theme and the US holidays theme:

```HTML
<template>
	<div id="app">
		<h1>My Calendar</h1>
		<calendar-view
			:show-date="showDate"
			@setShowDate="setShowDate"
			class="holiday-us-traditional holiday-us-official"
		/>
	</div>
</template>
<script>
	import CalendarView from "vue-simple-calendar"
	require("vue-simple-calendar/dist/static/css/default.css")
	require("vue-simple-calendar/dist/static/css/holidays-us.css")

	export default {
		name: 'app',
		data: function() {
			return { showDate: new Date() }
		},
		components: {
			CalendarView
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

The following properties are supported. Remember to use _kebab-case_ when specifying these properties using attributes on the `calendar-view` element (_e.g._, `<calendar-view month-name-format="long">`:

* `events` - An array of events to show on the calendar. See _Calendar Event Properties_ below for more details.
* `disablePast` - If true, prevents the user from navigating to previous periods. Default is `false`. (Note: since this is a Boolean value, you should use `v-bind` on the attribute.)
* `disableFuture` - If true, prevents the user from navigating to future periods. Default is `false`. (Note: since this is a Boolean value, you should use `v-bind` on the attribute.)
* `enableDragDrop` - If true, events are draggable, and dragging and dropping them emits events you can catch and respond to. Default is `false`. (Note: since this is a Boolean value, you should use `v-bind` on the attribute.)
* `locale` - The BCP 47 language tag used to determine the month and day names. Defaults to the user's browser language setting.
* `showDate` - The period to show by default. Defaults to today's date (user local time).
* `startingDayOfWeek` - The day of the week that starts each week. Defaults to `0` (Sunday), valid range is 0-6. Common non-default values would be
  `1` (Monday) for Europe or `6` (Saturday) for much of the Middle East.
* `monthNameFormat` - The format to use for the month names. Possible values are `numeric`, `2-digit`, `narrow`, `short`, or `long`, and the default is `long`.
* `weekdayNameFormat` - The format to use for the names of the days of the week. Possible values are `narrow`, `short`, or `long`, and the default is `short`.

### Props New in 2.0 

* `showEventTimes` - If true, shows the start and/or end time of an event beside the event title. Midnight is not shown, a midnight time is assumed to indicate an all-day or indeterminate time. (If you want to show midnight, use `00:00:01` and don't choose to show seconds.) The default is `false`.
* `timeFormatOptions` - This takes an object containing `Intl.DateTimeFormat` options to be used to format the event times. The `locale` setting is automatically used. This option is ignored for browsers that don't support `Intl` (they will see the 24-hour, zero-padded time).
* `displayPeriodUom` - The period type to show. By default this is `month`, *i.e.*, it shows a calendar in month-sized chunks. Other allowed values are `year` and `week`.
* `displayPeriodCount` - The *number* of periods to show within the view. For example, if `displayPeriodUom` is `week` and `displayPeriodCount` is 2, the view will show a two-week period.

## Calendar Event Properties

Each event shown on the calendar can have the following properties. `startDate` is required, and `title` and `id` are strongly recommended.

* `startDate` - The date the event starts on the calendar. This must be either passed as a JavaScript date object, or as a string following an ISO-like form of "yyyy-mm-dd HH:MM:SS" (time is optional, and within time, minutes and seconds are both optional).
* `endDate` - The date the event ends on the calendar. Defaults to the same date as `startDate`. This must be either passed as a JavaScript date object, or as a string following an ISO-like form of "yyyy-mm-dd HH:MM:SS" (time is optional, and within time, minutes and seconds are both optional).
* `title` - The name of the event shown on the calendar. Defaults to "Untitled".
* `id` - A unique identifier for the event. Defaults to a randomly-generated string.
* `url` - The URL associated with the event. If provided, clicking the event opens the URL. If not provided, the event is unlinked.
* `classes` - A String with any additional CSS classes you wish to use for the event.

## Component Events

The following Vue events are raised by the component, which you can catch in your calling application to respond to user actions:

* `click-date(date)`: fired when user clicks a date
* `click-event(event)`: fired when user clicks on an event
* `show-date-change(date)`: fired when user goes to a different period. The date passed is the first of the period in view (days before and after the period may also be visible).
* `drag-start(event)`: fires when user starts dragging an event
* `drag-enter-date(event, date)`: fires when an event is dragged over a date
* `drag-leave-date(event, date)`: fires when an event is dragged out of a date without dropping it there
* `drag-over-date(event, date)`: fires multiple times as an event is hovered over a date
* `drop-on-date(event, date)`: fired when an event is dropped on a date

*Note in the above, `event` refers to the calendar "event" involved in the activity, not the DOM "event". The word "event" here is a bit overloaded.*

### Component Events Breaking change in 2.0

Prior to 2.0, `dragEventOverDate` was undocumented and called `dragEventDragOverDate`, and all dragging-related user events emitted the calendar event's *id* as the first argument rather than the calendar event itself. Since not all calendar events will have an ID and the parent will probably want access to the actual calendar event, I changed these Vue events to emit the original calendar event, not just its id.

## Changes in 2.1

In 2.1, the events above were renamed to make them kebab-case (for DOM template compatibility) and to refine the wording. The old event names, shown here respectively, have been deprecated and will be removed in 3.0 (until then, the component issues events under both names, for compatibility):
* `clickDay`
* `clickEvent`
* `setShowDate`
* `dragEventStart`
* `dragEventEnterDate`
* `dragEventLeaveDate`
* `dragEventOverDate`
* `dropEventOnDate`

## Slots

### header

This optional named slot **replaces** the default `div.header` (which contains the navigation buttons and calendar's current period). For example, this would effectively result in an empty span in place of the header (you could also just use `.calendar-view .header {display: none}` in your CSS to hide the default header):

```HTML
<calendar-view>
	<span slot="header"/>
</calendar-view>
```

### header New to 2.0

### dayHeader

This optional named slot **replaces** the default `div.day` elements that appear in the column headers for each day of the week. If all you need to do is change how the names are shown, it's probably better to override the `locale` and/or `weekdayNameFormat` property. This slot is intended for situations where you need to override the markup within each header cell. For example, if you want each day of the week to be clickable. 

This slot passes two scoped variables: `index`, 0-7, and `label`, the text it would have used in the header based on the current `locale` and `weekdayNameFormat`.

*In 1.8.2, a `dayList` slot was introduced. That slot was removed in 2.0 and replaced with this one.*

### dayContent

This optional named slot **replaces** the *contents* of the `div.content` within each day's cell. By default, this just contains a `div.date` containing the day of the month, but you can use this to override the cell and show anything you like. Events are drawn *on top* of the cells, no within them, so this content appears underneath the events if there are any on that day.

This slot passes one scoped variable: `day`, the date associated with the cell.

*In 1.8.2, this was introduced with the name `day`, and was renamed in 2.0 to be more precise.*

### event

This optional named slot **replaces** the `div.event` for each event (not just the contents of the event element, the entire element). Use this if you want to override entirely how events are rendered. For example, on a small mobile device, you may want to show just a thin stripe, dots, or icons to indicate events, without titles or times.

This slot passes two scoped variables: `event`, the calendar event, and `weekStartDate`, the date of the first day of the week being rendered. Note that `event` is a version of the calendar event **customized** to be shown on that week's row, it's not the bare event pulled from the `events` prop. This customized version parses and defaults the `startDate` and `endDate`, defaults missing `id` to a random number, defaults a blank title to "Untitled", and adds a number of `classes` values based on the position and role of the event as shown for that week (whether it continues from the previous week, etc.). The original event is passed back as `event.originalEvent`.

## Customizing the Look and Feel

In addition to slots, this component is designed to allow for significant customization of the look and feel solely through CSS. Here's the structure of the markup generated by the component. Each line represents a Vue SLOT (all caps) or an HTML element (first word on the line). Indentation represents the hierarchy. Each word *after* the first word is a class applied to the element. Classes in (parenthesis) are conditional. Loops (*i.e.*, `v-for`) are shown in [brackets].

Note that the events are _not_ child nodes of the days, they are children of the week and positioned above the days. This allows events to span multiple days.

```
div calendar-view locale-X yYYYY mMM (past|future) period-X periodCount-X
	HEADER
		div header
			div nav
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
	div dayList
		div day dowX [x7]
	div weeks
		div week weekX wsYYYY-MM-DD [x # weeks in visible period]
			div day dowX dYYYY-MM-DD dMM-DD dDD wmX (past|today|future|last|outsideOfMonth|lastInstance) [x 7]
				DAY
					div content
						div date
			EVENT
				div event offsetX spanX eventRowX (continued|toBeContinued|hasUrl) [x # of events]
					span startTime (hasEndTime)
					span endTime (hasStartTime)
```

where:

### Calendar classes

#### locale-<i>X</i>

Two locale classes are added--one for the user's full locale, the other for just the first two letters (the language),
both in lowercase. You could use this information to hide or show specific holidays, or to localize text using CSS `content`.
Example:

> locale-en locale-en-us

#### y<i>YYYY</i>

The full year of the starting period of the current view.

#### m<i>MM</i>

The month (01-12) of the starting period of the current view.

#### (future|past)

When the period shown does not include today's date (local time), one of these classes is added. By default, this shows and hides and determines the label for the button that returns the view to the current period.

#### period-X

The current `displayPeriodUom` value (`year`, `month`, or `week`).

#### periodCount-X

The current `displayPeriodCount` value (a number, usually `1`).

### Week classes

#### week<i>X</i>

Each week is numbered, starting with the first week of the visible period.

#### ws<i>YYYY-MM-DD</i>

Each week also has a class representing the date of the Sunday starting that week. This could be used to style entire weeks that have some special importance.

### Day classes

#### dow<i>X</i>

This class is for the day of the week, ranging from 0 to 6. This allows you to easily style certain days of the week (say, weekend days) differently from other days. The same class is also added to the weekday headers.

#### d<i>YYYY-MM-DD</i> / d<i>MM-DD</i> / d<i>DD</i>

Each day in the grid is given three special classes -- one for the month and day (01/01-12/31), one for the day (01-31), and one for the entire ISO 8601 date. This allows easy styling of holidays and other special days using CSS alone (rather than using events).

The demo calendar has some examples of using these to add holiday emoji beside the day numbers. Example:

> d2017-05-23 d05-23 d23

#### instance<i>X</i>

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

This class is added to the last day of the its month.

### Classes for Events

#### offset<i>X</i>

This class on an event represents the day of the week when the event starts _on this week_. If an event spans more than one week, the offset for the second week, etc. would be `offset0` (Sunday).

#### span<i>X</i>

This class on an event represents the width of the event display _that week_, in days. For example, if an event spans from a Thursday to the next Wednesday, it would have `span3` on the first week and `span4` on the second week.

#### eventRow<i>X</i>

This class on an event represents the "row" where the event is drawn that week, starting at `1`. Up to 20 rows are available for display, content is scrollable if thre are too many to see within the week's row. *Prior to 2.0, this was called `slotX`.*

#### continued

This is added to an event when it is continuing from a previous week. By default, this turns off the rounded corners on the left side of the event box and adds a grey right-arrow before the title.

#### toBeContinued

This is added to an event when it is spills over into the following week. By default, this turns off the rounded corners on the right side of the event box and adds a grey right-arrow after the title.

#### hasUrl

This is added to an event when it has a `url` attribute (i.e., it is a hyperlink). By default, this is used to add a hovering underscore to event titles that are hyperlinked.

I'm open to other suggestions, provided they are easily calculated and there's some reasonable use case for having them.

#### startTime / endTime

These classes are applied to the start and end time of an event, respectively.

## Future plans

* [x] Keep it simple, not a kitchen-sink control.
* [x] Better docs.
* [x] Add optional external stylesheets (keep scoped styling to the basics).
* [x] Add a "starts-on-Monday" mode.
* [x] Add support for showing event times (New in 2.0!)
* [x] Possibly add a "week" view (no time of day scaling, just 7 taller boxes).
* [x] Possibly add modes for a set number of weeks, multiple months, or even a full year.
* [x] Extract date manipulation methods to a separate plugin.
* [ ] Material theme
* [ ] Apple Calendar theme
* [ ] I'm not 100% happy with the Intl time format options, especially to show time ranges compactly. Considering a custom formatter or the ability to pass a formatter function as a property.

PRs and issues are welcome! For pull requests, please use the same code style -- there are linter configs included for styles, plain JavaScript, and Vue components. Use of Prettier is recommended.

## Inspiration

This project was inspired by Monthly.js, a JQuery-based control I've contributed to. Unfortunately, I wasn't able to port the code and still do things the Vue / Vanilla JS way, but I did borrow some of the concepts from that component.

# FAQ

(Ok, not really frequently-asked, but just random stuff.)

#### Why Vue?

Because Vue is awesome. I've been using it a few months in production, and I've slowly migrated my applications from ExtJS, JQuery, and Riot to Vue components. If you prefer React or Angular, it should be reasonably easy to port it. If you do, please let me know, maybe we can coordinate on feature upgrades!

#### Can you add "X" feature?

Maybe. Depends if it fits the core functionality of viewing a calendar grid. I don't want to create something that replicates all possible calendar views, and definitely don't want to add functionality for creating or editing events (that should be handled by the application/component hosting the view).

But I do have some ideas in mind, such as adding handles to be able to change an event's width, but I don't have a timetable for any particular new features.

#### Why not use moment.js?

Moment.js is great, but I would only need a tiny fraction of its capabilities, and for simplicity, I wanted to not have any dependencies (other than Vue of course).

#### Why is the style so "plain"?

I purposefully chose a very restrained, clean, and simple set of default styles for the calendar. The fanciest formatting is probably the rounded corners on the events.
Also, any styles not critical to the display are in a static CSS file (`static/css/default.css`) rather than in the Vue component, making it easier for you to completely override my theme with your own. I also use CSS `content` where possible, so you can override static text in the buttons, etc. using CSS rather than having to modify the component's source or pass more props or slots.

#### What styles can I _not_ override?

* You can't add a background-image to the entire calendar. Each day block needs a background color so it "hides" events spilling over from the day above it in the previous week. I'm considering some possible solutions. You _could_ put background images on individual days, or weeks, or the header.
* If you change the event's `font-size` (defaults to `1em`), padding, or border size, the events you'll have to change the `slotX` classes as well to position the events vertically in the right place. (You _can_ change the overall font size, the entire calendar uses the same `1em` font size and will scale everything accordingly.)
* The `z-index` of the weeks and events are managed using `style` declarations, they ensure that events for one week don't overlap the next week.

## Release History

Date       | Version      | Notes
-----------|--------------|--------
2017.05.11 | 1.0.0        | First version
2017.05.15 | 1.1.0        | Better demo styling; refactor code; add basic drag/drop capability; fix display issue when events not sorted by start date
2017.05.20 | 1.2.0        | Redesigned to work around z-index context issue with multi-day events (events now positioned above days, weeks rendered individually). Significant improvements to handling of event slots and clipping when event content exceeds height/width.
2017.05.21 | 1.3.0        | Fixed IE. Bad IE. Fixed CSS references to emoji. Default style adjustments. Clean up some old code. Add previous/next year buttons.
2017.05.22 | 1.3.1        | Improved demo, first published to npm.
2017.05.27 | 1.4.0        | Add new classes, move a few classes up to `calendar` node, rename a few classes to pascalCase for consistency.
2017.07.16 | 1.5.0        | Clean up code, move date math to a mixin; allow `endDate`, `title`, and `id` to be optional; change so only core CSS (mostly position / metrics) is in the component, a separate CSS file contains the default theme. Reorganized and updated optional US holiday theme CSS file. Tweaked default theme and metrics for consistency and cleaner look. NOTE: the default component name is now `calendar-month`, as is the primary container's CSS class. This was done for possible future expansion to support other views (such as a week view) and to give the CSS a slightly more unique name without resorting to scoped CSS. The name of the npm package, repository, etc. remains vue-simple-calendar.
2017.10.03 | 1.5.1        | Fix issue where months ending in Saturday did not show their last week. Moved mixin to component folder.
2017.10.04 | 1.5.2        | Fix webpack issue with mixin import and Vue warning about non-primitive keys.
2017.11.11 | 1.5.3        | Fix date differences over DST and toBeContinued logic (thanks @houseoftech and @sean-atomized!)
2017.11.12 | 1.6.0        | Fix future/past classes. Tweaks to CSS to fix border render issue, simplify. Change height from aspect ratio to the height of the container (the reason for the minor version increment).
2017.11.12 | 1.6.1        | Fix issues when events have a time other than midnight (they should be ignored). Add stylelint and vue lint, clean up package.json, other minor tweaks. Set browser compatibility to a minimum of IE10. Prevent issues from caching "today" value.
2017.12.12 | 1.7.0        | Add `startingDayOfWeek` property to allow the calendar to optionally start on any desired day of the week
2017.12.15 | 1.7.1        | Hopefully resolve reported babel preset error
2017.12.17 | 1.8.0        | Split sample app to another repo, rebuild build/config scripts from scratch
2017.12.17 | 1.8.1        | Add build for mixin
2017.12.30 | 1.8.2        | Add header slot (#32), fix display issue (#33)
2018.01.01 | 2.0.0        | Added week/year and multi-period view options, time of day support, scrolling events overflow, day and event slots, better date string parsing. NOTE: the default component name is now `calendar-view`, 
2018.01.23 | 2.0.1        | Fixed `outsideOfMonth` logic bug, #38
2018.01.24 | 2.1.0        | Renamed events for DOM Vue template compatibility. Old event names deprecated (but will still be emitted as well until 3.0) 
2018.01.25 | 2.1.1        | Forgot to build before publish :(

## Build Setup

```bash
# install dependencies
npm install

# serve with hot reload at localhost:8080
npm run dev

# build for production with minification
npm run build
```
