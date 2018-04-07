- [Introduction](#introduction)
  - [Demo](#demo)
  - [Features](#features)
  - [Browser Compatibility](#browser-compatibility)
  - [Installation and Usage](#installation-and-usage)
  - [Props](#props)
  - [Calendar Event Properties](#calendar-event-properties)
  - [Component Events](#component-events)
  - [Slots](#slots)
    - [header](#header)
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
  - [Build Setup](#build-setup)

## Introduction

**vue-simple-calendar** is a flexible, themeable, lightweight *event calendar* component for Vue. The current version is **2.2.1**.

**This is the branch for version 3.0, currently under development. For version 2.2.1, please see the master branch.**

There are other great calendar components out there, but most are either intended to be used as date pickers, or had way too many features for me. I wanted something that would simply show a month as a grid, and show events (including multi-day events) on that grid. While the component goes beyond that simple use case, that is still the core focus.

## Demo
Here's a live demo page, and the repo for it:
https://www.tallent.us/vue-simple-calendar/
https://github.com/richardtallent/vue-simple-calendar-sample

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
* User events (clicks, drags, etc.) are emitted to the parent component.
* Weeks can start on any day of the week (defaults to Sunday).
* Easy to theme (using CSS) to integrate with your own site
* Slot support for more complex customization

What this component *doesn't* try to do:
* There is no "agenda" view (time-of-day grid). This would require adding too much complexity.
* There is no interface for managing events. This is far too use-specific.
* There is no built-in AJAX mechanism. This is also far too use-specific.
* Only the Gregorian calendar is supported.
* It is not yet possible to drag events in a way that would add or remove days. This may be added in the future.
* There is no ability to drag and select a set of days (only single-day clicks are emitted as events). This may be added in the future.

## Browser compatibility
The *intent* is to maintain compatibility with Chrome, Firefox, IE11, Edge, OS X Safari, iOS Safari, and the Android Silk browser. Note that this component is designed first for desktop web applications, not mobile, so while the component may *operate* on a mobile device, the limited resolution may not allow for much in the way of useful functionality.

### IE11 Support
I will be losing my ability to test in IE11 very soon, so I'll be relying on the community of users who need to support this browser to continue to test and provide feedback.

### Browsers and Localization
Note that `Intl` is not supported for Safari 9.1, iOS 9.3, and Opera Mini. For these browsers, the month names and weekday names will be blank and the calendar will have a `nointl` class. Use CSS content to provide the appropriate month and weekday names for the languages you support. For example:

```CSS
.calendar.nointl.locale-en.m01 .monthName::after { content: 'January' }
```

## Installation and Usage
_(This assumes you already have a web application set up for using Vue. If you're starting a new project, look up the documentation for the Vue CLI, which will allow you to initialize a new project with webpack, etc.)_

Install the component using npm:

```
npm i --save vue-simple-calendar
```

In your application, you'll need to:
* import the component
* import the default theme or any other theme you want to use (CSS)
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
			@show-date-change="setShowDate"
			class="holiday-us-traditional holiday-us-official"
		/>
	</div>
</template>
<script>
	import CalendarView from "vue-simple-calendar"
	// The next two lines are processed by webpack. If you're using the component without webpack compilation,
	// you should just create <link> elements for these as you would normally for CSS files. Both of these
	// CSS files are optional, you can create your own theme if you wish.
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
* `showEventTimes` - If true, shows the start and/or end time of an event beside the event title. Midnight is not shown, a midnight time is assumed to indicate an all-day or indeterminate time. (If you want to show midnight, use `00:00:01` and don't choose to show seconds.) The default is `false`.
* `timeFormatOptions` - This takes an object containing `Intl.DateTimeFormat` options to be used to format the event times. The `locale` setting is automatically used. This option is ignored for browsers that don't support `Intl` (they will see the 24-hour, zero-padded time).
* `displayPeriodUom` - The period type to show. By default this is `month`, *i.e.*, it shows a calendar in month-sized chunks. Other allowed values are `year` and `week`.
* `displayPeriodCount` - The *number* of periods to show within the view. For example, if `displayPeriodUom` is `week` and `displayPeriodCount` is 2, the view will show a two-week period.
* `dateClasses` - Optional object, where the key is a date in ISO form (e.g., "2018-04-15") and the value is a string or array of additional CSS classes that should be applied to the main element for that date. This could be useful for dynamically highlighting selected dates, holidays, blocked-off dates, etc.

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

*Note in the above, `event` refers to the **normalized** version of the calendar "event" involved in the activity. For more information, see the "event" slot below.

## Slots

### header
This optional named slot **replaces** the default `div.header` (which contains the navigation buttons and calendar's current period). For example, this would effectively result in an empty span in place of the header (you could also just use `.calendar-view .header {display: none}` in your CSS to hide the default header):

```HTML
<calendar-view>
	<span slot="header"/>
</calendar-view>
```

### dayHeader
This optional named slot **replaces** the default `div.day` elements that appear in the column headers for each day of the week. If all you need to do is change how the names are shown, it's probably better to override the `locale` and/or `weekdayNameFormat` property. This slot is intended for situations where you need to override the markup within each header cell. For example, if you want each day of the week to be clickable. 

This slot passes two scoped variables: `index`, 0-7, and `label`, the text it would have used in the header based on the current `locale` and `weekdayNameFormat`.

### dayContent
This optional named slot **replaces** the *contents* of the `div.content` within each day's cell. By default, this just contains a `div.date` containing the day of the month, but you can use this to override the cell and show anything you like. Events are drawn *on top* of the cells, no within them, so this content appears underneath the events if there are any on that day. 

This slot passes one scoped variable: `day`, the date associated with the cell.

### event
This optional named slot **replaces** the `div.event` for each event (not just the contents of the event element, the entire element). Use this if you want to override *entirely* how events are rendered. For example, on a small mobile device, you may want to show just a thin stripe, dots, or icons to indicate events, without titles or times. This slot passes three scoped variables:
- `event`: the *normalized* calendar event
- `weekStartDate`: the date of the first day of the week being rendered
- `zIndex`: the `z-index` that you should apply to the style of your event markup so it properly overlaps its own week but not the next

Note that `event` is a version of the calendar event *normalized* to be shown on that week's row, it's not the bare event pulled from the `events` prop. This customized version parses and defaults the `startDate` and `endDate`, defaults missing `id` to a random number, defaults a blank title to "Untitled", and adds a number of `classes` values based on the position and role of the event as shown for that week (whether it continues from the previous week, etc.). The original event is passed back as `event.originalEvent`.

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
* [ ] Material theme (would love help with this)
* [ ] Apple Calendar theme (would love help with this)
* [ ] Outlook Calendar theme (would love help with this)
* [ ] I'm not 100% happy with the Intl time format options, especially to show time ranges compactly. Considering a custom formatter or the ability to pass a formatter function as a property.
* [ ] Rename the primary CSS classes (calendar-view, day, week, etc.) to depend far less on cascades, making it easier to customize the theme (breaking change for themes, targeted for 3.0.0).

PRs and issues are welcome! For pull requests, please use the same code style -- there are linter configs included for styles, plain JavaScript, and Vue components. Use of Prettier is recommended.

## Inspiration
This project was inspired by Monthly.js, a JQuery-based control I've contributed to. Unfortunately, I wasn't able to port the code and still do things the Vue / Vanilla JS way, but I did borrow some of the concepts from that component.

# FAQ
(Ok, not really frequently-asked, but just random stuff.)

#### Why Vue?
Because Vue is awesome. I've been using it a few months in production, and I've slowly migrated my applications from ExtJS, JQuery, and Riot to Vue components. If you prefer React or Angular, it should be reasonably easy to port it. If you do, please let me know, maybe we can coordinate on feature upgrades!

#### Can you add "X" feature?
Maybe. Depends if it fits the core functionality of viewing a calendar grid. I don't want to create something that replicates all possible calendar views, and definitely don't want to add functionality for creating or editing events (that should be handled by the application/component hosting the view).

#### Why not use moment.js?
Moment.js is great, but I would only need a tiny fraction of its capabilities, and for simplicity, I wanted to not have any dependencies (other than Vue of course).

#### Why is the style so "plain"?
The **baseline** style (what you get with no external CSS files imported) is intended to be as bare as possible while still providing full functionality and legibility. The hope here is to minimize the effort of overriding my styles if you decide to create your own theme. (Changes are coming in 3.0 to make this even easier.)

The **default** stylesheet builds on this to provide a restrained, clean, and simple set of default styles for the calendar, and is useful if you don't intend to create your own theme. You can include it from `static/css/default.css`. The sample app uses this stylesheet.

A third stylesheet, `static/css/holidays-us.css`, shows how simple it is to use CSS to style specific days using CSS selectors (it adds emoji characters beside various holidays).

#### What styles can I _not_ override?
* If you change the event's `font-size` (defaults to `1em`), `padding`, or `border-width`, you'll have to change the `slotX` classes as well to position the events vertically in the right place. (You _can_ change the overall font size, the entire calendar uses the same `1em` font size and will scale everything accordingly.)
* The `z-index` of the weeks and events are managed using `style` declarations, they ensure that events for one week don't overlap the next week.

## Build Setup
```bash
# install dependencies
npm install

# build for production with minification
npm run build
```
