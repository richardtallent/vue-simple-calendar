# vue-simple-calendar

This is a calendar component using Vue, still early in development.

There are other Vue calendar components, but they were either focused on date-picking, or the events (such as clicking an event or a date) were too tightly bound to specific views (such as linking to an agenda). The closest I probably found was FullCalendar, but it had *too many* features.

My use case is far simpler--I just wanted a traditional month-grid calendar, with events listed (including multi-day events), that would raise events when the calendar month is changed or the user clicks/taps a date or event.

## Demo
A demo page is included, with hot reload, etc. Here's a live demo:

https://www.tallent.us/vue-simple-calendar/

## Features
- Lightweight!
- Flexbox-driven layout.
- No external dependencies (Moment, JQuery, etc.).
- Strong emphasis on CSS-based styling, allowing for a lot of flexibility without modifying the code or passing attributes.
- Classes assigned for past days, today, each day of the week, each date, and days outside the current month view.
- Shows a traditional month-grid calendar, starting on Sunday.
- Month and day names are localized for the current user.
- Can show "events," including multi-day events.
- Events emitted for clicking a day, clicking an event, or changing the view month.
- More responsive

This is still early in development. PRs, ideas, and issues are welcome.

## Component parameters

The following attributes can be provided:

events: array containing the events to show on the calendar
show-date: the month/year to start the calendar on (the day of the month is ignored). Defaults to the current month.
enable-drag-drop: whether to enable dragging and dropping of events. Defaults to false.

## Events

clickDay(date): fired when user clicks a date
clickEvent(event): fired when user clicks on an event
setShowDate(date): fired when user goes to a different month
dropEventOnDate(event, date): fired when user drags an event to a date

## Future plans
- Keep it simple, not a kitchen-sink control.
- Better docs.
- Add optional external stylesheets (keep scoped styling to the basics).
- Add a "starts-on-Monday" mode.
- Possibly add a "week" view (no time of day, just 7 taller boxes).
- Possibly add modes for a set number of weeks, multiple months, or even a full year.
- Handle events with times.
- Make this an NPM package *(I know nothing about this and could use a hand with it!)*.
- Extract date manipulation methods to a separate plugin.
- Fix a display issue that could occur when multi-day events stack and stagger

PRs and issues are welcome! Please use the same code style. Use of "Prettier" is encouraged.

## Inspiration
This project was inspired by Monthly.js, a JQuery-based control I've contributed to. Unfortunately, I wasn't able to port the code and still do things the Vue / Vanilla JS way, but I did borrow some of the concepts from that component.

## Release History
| Date | Version | Notes |
| --- | --- | --- |
| 2017-05-11 | 1.0 | First version |
| 2017-05-15 | 1.1 | Better demo styling; refactor code; add basic drag/drop capability; fix display issue when events not sorted by start date |

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