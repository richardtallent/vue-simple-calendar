# vue-simple-calendar

This is a calendar component for Vue.

There are other Vue calendar components, but they were either focused on date-picking, or the events (such as clicking an event or a date) were too tightly bound to specific views (such as linking to an agenda). The closest I probably found was FullCalendar, but it had *too many* features.

My use case is far simpler--I just wanted a traditional month-grid calendar, with events listed (including multi-day events), that would raise events when the calendar month is changed or the user clicks/taps a date or event.

PRs, ideas, and issues are welcome.

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

## Component parameters

The following attributes can be provided:

- events: array containing the events to show on the calendar (optional)
- show-date: the month/year to start the calendar on (the day of the month is ignored). (Optional, defaults to the current month.)
- enable-drag-drop: whether to enable dragging and dropping of events. (Optional, defaults fo false.)

## Events

- clickDay(date): fired when user clicks a date
- clickEvent(event): fired when user clicks on an event
- setShowDate(date): fired when user goes to a different month. The date passed is the first of the month in view (days before and after the month may also be visible).
- dragEventEnterDate(event): fires when an event is dragged over a date
- dragEventLeaveDate(event): fires when an event is dragged out of a date without dropping it there
- dropEventOnDate(event, date): fired when an event is dropped on a date

## Customizing the Look and Feel

Here's the main markup structure, with classes. Each line represents a `div`, the indentation represents the markup hierarchy, and each word on the line represents a class assigned. Classes in parenthesis are conditional. Repetition is shown in brackets.

Note that the events are *not* child nodes of the days, they are children of the week and positioned above the days. This allows events to span multiple days without impacting the ability to change the background color of the days.

The only markup not listed here are the buttons within the header (within `previousYear`, `previousMonth`, `currentMonth`, `nextMonth`, and `nextYar`).

```
calendar-month locale-X yYYYY mMM (past|future)
	header
		previousYear
		previousMonth
		thisMonth
			monthLabel
				monthName
				yearNumber
			currentMonth
		nextMonth
		nextYear
	dayList
		day dowX [x7]
	month
		week weekX wsYYYY-MM-DD [x # weeks in month]
			day dowX dYYYY-MM-DD dMM-DD dDD wmX (past|today|future|last|outsideOfMonth|lastInstance) [x 7]
				content
					date
			event offsetX spanX slotX (continued|toBeContinued|hasUrl) [x # of events]

```

where:

### Calendar classes

#### locale-<i>X</i>

Two locale classes are added--one for the user's full locale, the other for just the first two letters (the language),
both in lowercase. You could use this information to hide or show specific holidays, or to localize text using CSS `content`.
Example:

> locale-en locale-en-us

#### y<i>YYYY</i>
The full year of the current view.

#### m<i>MM</i>
The month (01-12) of the current view.

#### (future|past)
When the calendar shown is not the current month (local time), one of these classes is added. By default, this shows and hides and determines the label for the button that returns the view to the current month.

### Week classes

#### week<i>X</i>
Each week is numbered from 1-6, starting with the first week of the month. This controls the z-index that ensures that
the events from one week don't overlap the following week, but could be used for other purposes as well.

#### ws<i>YYYY-MM-DD</i>
Each week also has a class representing the date of the Sunday starting that week. This could be used to style entire
weeks that have some special importance.

### Day classes

#### dow<i>X</i>
This class is for the day of the week, ranging from 0 to 6. This allows you to easily style certain days of the week (say, weekend days) differently from other days. The same class is also added to the weekday headers.

#### d<i>YYYY-MM-DD</i> / d<i>MM-DD</i> / d<i>DD</i>
Each day in the grid is given three special classes -- one for the month and day (01/01-12/31), one for the day (01-31), and one for the entire ISO 8601 date. This allows easy styling of holidays and other special days using CSS alone (rather than using events).

The demo calendar has some examples of using these to add holiday emoji beside the day numbers. Example:

> d2017-05-23 d05-23 d23

#### instance<i>X</i>
The instance of the weekday within *the day's* month. For example, the class `instance1` is added to the *first* Sunday, Monday, etc. of the month. Note that since this is relative to the day, not the "main" month being shown, days visible from the previous or next month will also have these classes, relative to their own month.

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
This class is added to the last day of the month. Note that if a portion of the previous month is also showing, *its last day will also have this class*. If you want to style *only* the last day of the main month in view, use the rule `.calendar-month .last:not(.outsideOfMonth)`.

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

I'm open to other suggestions, provided they are easily calculated and there's some reasonable use case for having them.

## Future plans
[x] Keep it simple, not a kitchen-sink control.
[x] Better docs.
[x] Add optional external stylesheets (keep scoped styling to the basics).
[] Add a "starts-on-Monday" mode.
[] Possibly add a "week" view (no time of day, just 7 taller boxes).
[] Possibly add modes for a set number of weeks, multiple months, or even a full year.
[] Handle events with times.
[x] Extract date manipulation methods to a separate plugin.

PRs and issues are welcome! Please use the same code style. Use of "Prettier" is encouraged.

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

#### Why is the style so "basic"?
I purposefully chose a very restrained, clean, and simple set of default styles for the calendar. The fanciest formatting is probably the rounded corners on the events.
Also, any styles not critical to the display are in a static CSS file (`static/css/default.css`) rather than in the Vue component, making it easier for you to completely override my theme with your own. I also use CSS `content` where possible, so you can override static text in the buttons, etc. using CSS rather than having to modify the component's source or pass more props or slots.

#### What styles can I *not* override?
- You can't add a background-image to the entire calendar. Each day block needs a background color so it "hides" events spilling over from the day above it in the previous week. I'm considering some possible solutions. You *could* put background images on individual days, or weeks, or the header.
- If you change the event's `font-size` (defaults to `1em`), padding, or border size, the events you'll have to change the `slotX` classes as well to position the events vertically in the right place. (You *can* change the overall font size, the entire calendar uses the same `1em` font size and will scale everything accordingly.)

## Release History
| Date | Version | Notes |
| --- | --- | --- |
| 2017.05.11 | 1.0.0 | First version |
| 2017.05.15 | 1.1.0 | Better demo styling; refactor code; add basic drag/drop capability; fix display issue when events not sorted by start date |
| 2017.05.20 | 1.2.0 | Redesigned to work around z-index context issue with multi-day events (events now positioned above days, weeks rendered individually). Significant improvements to handling of event slots and clipping when event content exceeds height/width. |
| 2017.05.21 | 1.3.0 | Fixed IE. Bad IE. Fixed CSS references to emoji. Default style adjustments. Clean up some old code. Add previous/next year buttons. |
| 2017.05.22 | 1.3.1 | Improved demo, first published to npm. |
| 2017.05.27 | 1.4.0 | Add new classes, move a few classes up to `calendar` node, rename a few classes to pascalCase for consistency. |
| 2017.07.16 | 1.5.0 | Clean up code, move date math to a mixin; allow `endDate`, `title`, and `id` to be optional; change so only core CSS (mostly position / metrics) is in the component, a separate CSS file contains the default theme. Reorganized and updated optional US holiday theme CSS file. Tweaked default theme and metrics for consistency and cleaner look. NOTE: the default component name is now `calendar-month`, as is the primary container's CSS class. This was done for possible future expansion to support other views (such as a week view) and to give the CSS a slightly more unique name without resorting to scoped CSS. The name of the npm package, repository, etc. remains vue-simple-calendar.
| 2017.10.03 | 1.5.1 | Fix issue where months ending in Saturday did not show their last week. Moved mixin to component folder.

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