# vue-simple-calendar

This is a calendar component using Vue, still early in development.

There are other Vue calendar components, but they were either focused on date-picking, or the events (such as clicking an event or a date) were too tightly bound to specific views (such as linking to an agenda). The closest I probably found was FullCalendar, but it had *too many* features.

My use case is far simpler--I just wanted a traditional month-grid calendar, with events listed (including multi-day events), that would raise events when the calendar month is changed or the user clicks/taps a date or event.

## Demo
A demo page is included, with hot reload, etc. Here's a live demo:

https://www.tallent.us/vue-simple-calendar/

## Features
- Shows a traditional month-grid calendar.
- Can show "events," including multi-day events.
- Optional event drag/drop support.
- Localized automatically (overridable).
- Lightweight!
- Flexbox layout (look ma, no tables!).
- No external dependencies (Moment, JQuery, etc.).
- Emphasizes customization via plain ol' CSS.
- User events (clicks, drags, etc.) are exposed as Vue events.

This is still early in development. PRs, ideas, and issues are welcome.

## Component parameters

The following attributes can be provided:

- events: array containing the events to show on the calendar
- show-date: the month/year to start the calendar on (the day of the month is ignored). Defaults to the current month.
- enable-drag-drop: whether to enable dragging and dropping of events. Defaults to false.

## Events

- clickDay(date): fired when user clicks a date
- clickEvent(event): fired when user clicks on an event
- setShowDate(date): fired when user goes to a different month. The date passed is the first of the month in view (days before and after the month may also be visible).
- dragEventEnterDate(event): fires when an event is dragged over a date
- dragEventLeaveDate(event): fires when an event is dragged out of a date without dropping it there
- dropEventOnDate(event, date): fired when an event is dropped on a date

## Customizing the Look and Feel

Here's the main markup structure by class:

```
.calendar.locale-X
	.header
		.previousYear
		.previousMonth
		.thisMonth
			.monthLabel
				.monthname
				.yearnumber
			.currentMonth.(future|past)
		.nextMonth
		.nextYear
	.daylist
		.day.dowX
	.month
		.week.weekX.wsYYYY-MM-DD
			.day.dowX.dYYYY-MM-DD.dMM-DD.(today|past|outsideOfMonth)
				.content
					.date
			.event.offsetX.spanX.slotX.(continued|toBeContinued|hasUrl)

```

where:

#### locale-<i>X</i>

Two locale classes are added--one for the user's full locale, the other for just the first two letters (the language),
both in lowercase. You could use this information to hide or show specific holidays, or to localize text using CSS `content`.
Example:

> locale-en locale-en-us

#### (future|past)
When the month shown is not the current calendar month (local time), one of these classes is added. By default, this shows and hides and determines the label for the button that returns the view to the current month. <i>(Note: may move this up to the `calendar` level in the future.)</i>

#### dow<i>X</i>
This class, ranging from dow0 to dow6, is added to the day name labels at the top, and to each day in the grid. This
allows you to easily style certain days of the week (say, weekend days) differently from other days.

### Week classes

#### week<i>X</i>
Each week is numbered from 1-6, starting with the first week of the month. This controls the z-index that ensures that
the events from one week don't overlap the following week, but could be used for other purposes as well.

#### ws<i>YYYY-MM-DD</i>
Each week also has a class representing the date of the Sunday starting that week. This could be used to style entire
weeks that have some special importance.

### Day classes

#### d<i>YYYY-MM-DD</i> / d<i>MM-DD</i>
Each day in the grid is given two special classes -- one for the month and day (01/01-12/31), the other for the entire
ISO 8601 date. This allows easy styling of holidays and other special days using CSS alone (rather than using events).
The demo calendar has some examples of using these to add holiday emoji beside the day numbers. Example:

> d2017-05-23 d05-23

#### outsideOfMonth
This class is added to each day falling outside of the month being shown. By default, these days are greyed out.

#### past
This class is added to days before the current date (local time).

#### today
This class is added to the current date (local time), if visible on the current view.

### Event classes

#### offset<i>X</i>
This class on an event represents the day of the week when the event starts *on this week*. If an event spans more than one week, the offset for the second week, etc. would be `offset0` (Sunday).

#### span<i>X</i>
This class on an event represents the width of the event display *that week*, in days. For example, if an event spans from a Thursday to the next Wednesday, it would have `span3` on the first week and `span4` on the second week.

#### slot<i>X</i>
This class on an event represents the "row" where the event is drawn that week, starting at `1`. With the default height, only 5-6 slots are visible.

#### continued
This is added to an event when it is continuing from a previous week. By default, this turns off the rounded corners on the left side of the event box and adds a grey right-arrow before the title.

#### toBeContinued
This is added to an event when it is spills over into the following week. By default, this turns off the rounded corners on the right side of the event box and adds a grey right-arrow after the title.

#### hasUrl
This is added to an event when it has a `url` attribute (i.e., it is a hyperlink). By default, this is used to add a hovering underscore to event titles that are hyperlinked.


I may add a few more of these date-specific classes:

- `mYYYY`, `mYYYY-MM`, and `mMM` to the `.calendar` node, to allow styling of any part of the calendar based on the year and/or month.
- `dDD` to the `.month .day` nodes, to allow styling the nth day of each month.
- `wmX` to the `.month .day` nodes, where X represent the index of weekdays of that type in the month. For example, the first Tuesday of each month would have classes `dow2 wm1`. This isn't necessarily the first *visible* Monday, as the view could include Mondays that are *outside* the month.
- `future` to the `.month .day` nodes. This is really just any day that is *not* either past or today, but adding a class will make styling of these simpler. For example, you may have business rules that don't allow users to add future events, so you might want to grey them out.

I'm open to other suggestions, provided they are easily calculated and there's some reasonable use case for having them.

## Future plans
- Keep it simple, not a kitchen-sink control.
- Better docs.
- Add optional external stylesheets (keep scoped styling to the basics).
- Add a "starts-on-Monday" mode.
- Possibly add a "week" view (no time of day, just 7 taller boxes).
- Possibly add modes for a set number of weeks, multiple months, or even a full year.
- Handle events with times.
- Extract date manipulation methods to a separate plugin.

PRs and issues are welcome! Please use the same code style. Use of "Prettier" is encouraged.

## Inspiration
This project was inspired by Monthly.js, a JQuery-based control I've contributed to. Unfortunately, I wasn't able to port the code and still do things the Vue / Vanilla JS way, but I did borrow some of the concepts from that component.

## Release History
| Date | Version | Notes |
| --- | --- | --- |
| 2017.05.11 | 1.0.0 | First version |
| 2017.05.15 | 1.1.0 | Better demo styling; refactor code; add basic drag/drop capability; fix display issue when events not sorted by start date |
| 2017.05.20 | 1.2.0 | Redesigned to work around z-index context issue with multi-day events (events now positioned above days, weeks rendered individually). Significant improvements to handling of event slots and clipping when event content exceeds height/width. |
| 2017.05.21 | 1.3.0 | Fixed IE. Bad IE. Fixed CSS references to emoji. Default style adjustments. Clean up some old code. Add previous/next year buttons. |
| 2017.05.22 | 1.3.1 | Improved demo, published to npm. |

## License

Copyright 2017 Richard S. Tallent, II

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.

## Build Setup
``` bash
# install dependencies
npm install

# serve with hot reload at localhost:8080
npm run dev

# build for production with minification
npm run build

# build for production and view the bundle analyzer report
npm run build --report
```