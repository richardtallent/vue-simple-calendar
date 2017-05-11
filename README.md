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

## Future plans
- Keep it simple, not a kitchen-sink control.
- Better docs.
- Add optional external stylesheets (keep scoped styling to the basics).
- Add a "starts-on-Monday" mode.
- Possibly add a "week" view (no of day, just 7 taller boxes).
- Possibly add modes for a set number of weeks, multiple months, or even a full year.
- Handle events with times.
- Make this an NPM package *(I know nothing about this and could use a hand with it!)*

PRs and issues are welcome! Please use the same code style. Use of "Prettier" is encouraged.

## Inspiration
This project was inspired by Monthly.js, a JQuery-based control I've contributed to. Unfortunately, I wasn't able to port the code and still do things the Vue / Vanilla JS way, but I did borrow some of the concepts from that component.

## Release History
| Date | Version | Notes |
| --- | --- | --- |
| 2017-05-11 | 1.0 | First version |

## License

MIT "Expat".

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