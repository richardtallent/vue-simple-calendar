## Future?

- Mobile-compatible drag and drop (#21)
- Handles to drag events to make them longer or shorter
- Add month name to the 1st of the month when viewing multiple months (probably using classes to hide/show)

## 4.3.2 (2019-11-24)

- Fix calendar layout for RTL languages (#138)

## 4.3.1 (2019-11-24)

- Method rename bug

## 4.3.0 (2019-11-24)

- The `click-date` and `click-event` events are emitted with the DOM click event as the second argument
- Added the `doEmitItemMouseEvents` option to emit `item-mouseover` and `item-mouseout` events when the mouse hovers over a calendar item (#136)
- Began renaming calendar "events" to calendar "items" in documentation and code where possible without breaking compatibility. Using the term "event" is confusing when the component also deals with a number of _DOM_ events. In version 5.0, there will be some breaking changes around this, but it'll just be renaming some props, slots, etc.
- Updated to Vue CLI 4, updated all dependencies. Still stuck on ESLint 5 since cli-plugin-eslint isn't caught up yet.

## 4.2.2 (2019-05-01)

- Fix CSS precedence for "today" class over "outsideOfMonth" (#126)
- Update various dependencies

## 4.2.1 (2019-01-25)

- Fix issue with button click event propagation in default header (#117)
- Update dependencies
- Update minimal test app to use the default header
- Changes due to the hell that is Vetur's available HTML template auto-formatters

## 4.2.0 (2018-12-18)

- Updated dependencies
- Removed auto-defaulting of event `id`, was causing update issues (#108)
- Removed auto-registration of the Vue components in the webpack bundle, it was causing issues for people with multiple Vue instances (#106)
- Replaced "Today" button in the default header with a `headerProps.currentPeriodLabel` property (set by the parent calendar) (#101)
- Moved said button between the arrow pairs (if you need to move it back, you can use the CSS flexbox `order` property)
- Added corresponding optional `currentPeriodLabel` property to the calendar component. If undefined, uses the localized date range. If "icons", uses an icon pair (`⇤` or `⇥`). Otherwise uses the literal value (_e.g._, use "Today" to mimic the old functionality).
- Added a `currentPeriodLabelIcons` property for advanced swapping of said icons
- Auto-formatting of HTML in template source code created some diff noise in the repo
- Added sample CSS to disable sticky positioning in Edge (disabled by default) (#109)

## 4.1.0 (2018-10-05)

- Fix where dowX class improperly assigned when startingDayOfWeek != 0 (#93)
- Add pseudo-hover class (isHovered) to all event elements in view whose id matches the event being hovered (#95)
- Renamed prop `onPeriodChange` to `periodChangedCallback` to resolve issue for JSX users (#94) **BREAKING CHANGE**
- Hopefully where initial call of periodChangedCallback was not firing for all users, or was firing duplicates (could not reproduce, #94, #98)

## 4.0.1, 4.0.2 (2018-08-25)

- Fix main setting
- Fix exports

## 4.0.0 (2018-08-25)

### Breaking changes

#### Upgraded to vue-cli 3

This involved some changes to the source folder structure, as well as to the compiled files in the "dist" folder. Webpack-based imports of the components should be unaffected, same with CSS files. However, if you reference files directly in the dist folder (such as working in a non-webpack environment), the filenames have changed. Also, CalendarMathMixin is now part of the exported module, so if you're using webpack, you shouldn't need to reference the distribution file directly anymore. (And due to other changes, you may not need it anyway!)

#### A header component is _REQUIRED_ if you want a header

This is the biggest change. Many users want to heavily customize the header using slots, and to ensure feature parity and minimize edge cases, I decided to make the default header component _opt-in_. This library still includes the same default header component (CalendarViewHeader), but to see it, you should put it in the `header` named slot. Then, if you decide to create your own header, you can swap it out with ease.

Here's a minimal example:

```HTML
<calendar-view :show-date="dt">
	<calendar-view-header slot="header" slot-scope="{ headerProps }" :header-props="headerProps" @input="setShowDate" />
</calendar-view>
```

```JavaScript
import { CalendarView, CalendarViewHeader } from "vue-simple-calendar"

export default {
	name: "App",
	data: () ({ dt: new Date() })
	components: {
		CalendarView,
		CalendarViewHeader,
	},
	methods: {
		setShowDate(newValue) {
			this.dt = newValue
		}
	}
	[...]
}
```

The example above uses ES6 concepts and webpack's `import` statement, so some adjustments are needed if you're instantiating this component in a file that isn't compiled via webpack and babel.

#### The show-date-change event no longer exists

The `show-date-change` event was emitted by `CalendarView` _on behalf of_ the default header. Since `CalendarView` is now decoupled from the default header, the purpose of this event is now moot. If you're using the default header component, put an `@input` listener on it instead. If you are using your own header component, you can decide how it should communicate with your app if the header includes UI components the user can interact with.

#### New property: onPeriodChange (NOTE: renamed in 4.1 to periodChangedCallback)

This property sounds like an event, and it is, _sort of_. It's an optional `prop` that takes a _function_ as its argument. The function is invoked whenever the date range being shown by the calendar has changed (and also when the component is initialized). It passes a single argument to the function, an object with the keys `periodStart` and `periodEnd` (the dates that fall within the range of the months being shown) and `displayFirstDate` / `displayLastDate` (the dates shown on the calendar, including those that fall outside the period). The intent of this property is to let the parent know what is being shown on the calendar, which the parent can then use to, for example, query a back-end database to update the event list, or update another component with information about the same period.

This was the solution I landed on in response to the question I had on issue #69. While `watch` with `immediate` can be used to see when the period changes, a watch handler will _not_ emit an event during initialization (`this.$emit` does nothing). I also tried using `mounted` or `updated` as well, but they have the same problem--you can't emit events during component initialization. `Function` props are an oft-ignored feature of Vue, but in this case I believe it was the right call. It is fired once after the component updates the first time, and anytime thereafter that a change to any of the other props results in a change in the calendar's current date range.

Note: these date ranges are also passed to the header slot as part of `headerProps`, so you don't need to wire them to your header.

#### No default export

The `vue-simple-calendar` main bundle now includes `CalendarView`, `CalendarViewHeader`, and `CalendarViewMixin`. This makes more sense, particularly since the header will need to be imported in any apps that want to use it, but it also means your `import` statements need to specify which module you're importing (there is no default export). In most cases, your import should look like this:

```JavaScript
import { CalendarView, CalendarViewHeader } from "vue-simple-calendar"
```

In short, the curly braces are important.

### Bug fixes and non-breaking changes

- Added `style` property to events to allow pass-through of arbitrary CSS attributes (thanks @apalethorpe!)
- Added optional behavior to wrap to show entire event title on hover (thanks @jiujiuwen!)
- Fixed where if the passed showDate value has a time component, events on the first of the week on a one-week calendar are not shown. #80 (thanks @MrSnoozles!)
- Added `previousFullPeriod`/`nextFullPeriod` to `headerProps` to provide more flexibility to how the previous/next buttons operats. #79 (thanks @lochstar!)
- Added `label` to `headerProps`, as part of the move to get rid of th default header and require use of the header slot.

## 3.0.2 (2018-05-16)

- Added `top` scoped property to the `event` slot (#66, thanks @lochstar!)
- Tweak CSS for scrolling when ancestor uses `flex-direction: column` (#71)
- Ensure keys used internally for weeks and days don't collide with numeric event `id` values (#65)

## 3.0.1 (2018-05-08)

- Added the `eventTop`, `eventContentHeight`, and `eventBorderHeight` props to allow better theming (#66)

## 3.0.0 (2018-05-05)

- Added `dateClasses` prop to allow easy dynamic styling of specific dates (#55, thanks @LTroya!)
- Massive CSS reorganization to rely less on complex cascading for easier theming (#45, #52)
- Removed need for complex z-index on week and event elements (`zIndex` no longer passed in event slot)
- Removed need for eventRowX class. Top position CSS is now computed dynamically based on the row and passed to the event slot as "top".
- Removed limitation of 20 event rows per week
- Default header buttons no longer use CSS content for their labels
- The `dayContent` slot now does **not** contain the `cv-date-number` div, making it easier to provide your own content without having to duplicate the day number.
- The `content` element within each day has been removed, as it is no longer needed. The default theme now uses box-shadow rather than border to highlight the date when dragging an event.
- Fixed drag and drop issue in Firefox (#57)
- Implemented new custom header capability, and refactored the default header as a separate component with the same interface
- Upgraded to webpack 4.7
- Refactored periodLabel from CSS logic into a reusable function
- Transpilation to ES5 appears to be functioning properly
- Activating the default theme now requires a class ("theme-default") (#45)
- Fixed and tested polyfill in the same application in IE11
- Fixed flexbox rendering issue in IE11

### Migration guide for 3.0.0

- IE11 support has been fixed! However, you will need to include `babel-polyfill` in your app's entry point, webpack config, or via a script tag, if you aren't already doing so.
- Any custom themes or other CSS overrides will need to be modified for the upgraded classes and structure.
- If you use the `dayContent` slot, you no longer need to render the day number, it's outside the slot now.
- There was a problem in the default height of the calendar (it wasn't 100% of the parent), that has been resolved.
- Webpack 4 is required to build the component or sample app. If you're just installing and using the component, this won't impact you.
- Creating and slotting a custom header is now very simple.
- To activate the default theme, your `<calendar-view>` element will need the `theme-default` class (in addition to importing the CSS file, of course).

## 2.2.1 (2018.03.19)

- Fix where babel was not transpiling appropriately for IE11 (#46)
- Fix where "sticky" content was causing issues for IE11, which doesn't support sticky
- Never published on npm due to continued IE11 issues

## 2.2.0 (2018.03.18)

- Removed the events deprecated in 2.1.0
- Upgraded to Webpack 4
- Moved version history to this CHANGELOG file
- Moved some opinionated styles from the baseline (SFC) to the default theme.
- Fixed event slot issue reported in #42 and #50 (thanks @lexuzieel!).
- Added `zIndex` prop to event scoped slot properties.
- Formatted to meet newer eslint rules.
- Corrected some minor positioning issues with events (including removing remaining em-based borders)
- The `click-event` and `drag-*` events events now passes the **normalized** event (same as the "event" named slot). You can access your original event (_which is the one you should modify_) using the `originalEvent` attribute. While this is a minor breaking change, I wasn't quite ready to move up to 3.0, and this does make the API more consistent in how it passes events back to the caller.
- **Known issue:** Babel is not currently transpiling correctly to provide IE11 support. Looking for assistance.

## 2.1.2 / 2.1.3 (2018.01.27)

- Prevent click-date events for future dates when disableFuture is true (feature parity with disablePast). Fixes #40.

## 2.1.0 / 2.1.1 (2018.01.25)

The events below were renamed to make them kebab-case (for DOM template compatibility) and to refine the wording. The old event names, shown here, were deprecated in this version and removed in 2.2:

- `clickDay`
- `clickEvent`
- `setShowDate`
- `dragEventStart`
- `dragEventEnterDate`
- `dragEventLeaveDate`
- `dragEventOverDate`
- `dropEventOnDate`

## 2.0.1 (2018.01.23)

- Fixed `outsideOfMonth` logic bug, #38

## 2.0.0 (2018.01.01)

Version 2.0 includes some major upgrades! Here are the new features:

- Dates passed as strings are interpreted using _browser local_ time, not UTC, which prevents the event from showing up on an unexpected date.
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
- The `dragEventDragOverDate` event (undocumented) has been renamed as `dragEventOverDate`. Prior to 2.0, user events emitted the calendar event's _id_ as the first argument rather than the calendar event itself. Since not all calendar events will have an ID and the parent will probably want access to the actual calendar event, I changed these Vue events to emit the original calendar event, not just its id.
- The `dayList` slot has been replaced with `dayHeader`, and slot `day` has been renamed as `dayContent`.
- The word `slot` in the sense of an event display row has been renamed as `eventRow` in the code and CSS to avoid confusion with Vue slots.
- Up to 20 events per day are now supported (up from 10).
- Some basic colors, borders, etc. have been moved from the default theme into the component's core CSS, allowing the component to have a more appealing look with no theme in place and a better starting point for custom themes.
- Reversed the circle-arrow labels to return to the current period. These are now clockwise to "go forward" to return to the current period, counter-clockwise to "go back" to return to the current period.

#### Props Added in 2.0

- `showEventTimes` - If true, shows the start and/or end time of an event beside the event title. Midnight is not shown, a midnight time is assumed to indicate an all-day or indeterminate time. (If you want to show midnight, use `00:00:01` and don't choose to show seconds.) The default is `false`.
- `timeFormatOptions` - This takes an object containing `Intl.DateTimeFormat` options to be used to format the event times. The `locale` setting is automatically used. This option is ignored for browsers that don't support `Intl` (they will see the 24-hour, zero-padded time).
- `displayPeriodUom` - The period type to show. By default this is `month`, _i.e._, it shows a calendar in month-sized chunks. Other allowed values are `year` and `week`.
- `displayPeriodCount` - The _number_ of periods to show within the view. For example, if `displayPeriodUom` is `week` and `displayPeriodCount` is 2, the view will show a two-week period.

## 1.8.2 (2017.12.30)

- A `dayList` slot was added.
- A `day` slot was added.
- A `header` slot was added (#32)
- Fixed display issue (#33)

## Older changes

| Date       | Version | Notes                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                         |
| ---------- | ------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 2017.05.11 | 1.0.0   | First version                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                 |
| 2017.05.15 | 1.1.0   | Better demo styling; refactor code; add basic drag/drop capability; fix display issue when events not sorted by start date                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                    |
| 2017.05.20 | 1.2.0   | Redesigned to work around z-index context issue with multi-day events (events now positioned above days, weeks rendered individually). Significant improvements to handling of event slots and clipping when event content exceeds height/width.                                                                                                                                                                                                                                                                                                                                                                                                                                                              |
| 2017.05.21 | 1.3.0   | Fixed IE. Bad IE. Fixed CSS references to emoji. Default style adjustments. Clean up some old code. Add previous/next year buttons.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                           |
| 2017.05.22 | 1.3.1   | Improved demo, first published to npm.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                        |
| 2017.05.27 | 1.4.0   | Add new classes, move a few classes up to `calendar` node, rename a few classes to pascalCase for consistency.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                |
| 2017.07.16 | 1.5.0   | Clean up code, move date math to a mixin; allow `endDate`, `title`, and `id` to be optional; change so only core CSS (mostly position / metrics) is in the component, a separate CSS file contains the default theme. Reorganized and updated optional US holiday theme CSS file. Tweaked default theme and metrics for consistency and cleaner look. NOTE: the default component name is now `calendar-month`, as is the primary container's CSS class. This was done for possible future expansion to support other views (such as a week view) and to give the CSS a slightly more unique name without resorting to scoped CSS. The name of the npm package, repository, etc. remains vue-simple-calendar. |
| 2017.10.03 | 1.5.1   | Fix issue where months ending in Saturday did not show their last week. Moved mixin to component folder.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                      |
| 2017.10.04 | 1.5.2   | Fix webpack issue with mixin import and Vue warning about non-primitive keys.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                 |
| 2017.11.11 | 1.5.3   | Fix date differences over DST and toBeContinued logic (thanks @houseoftech and @sean-atomized!)                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                               |
| 2017.11.12 | 1.6.0   | Fix future/past classes. Tweaks to CSS to fix border render issue, simplify. Change height from aspect ratio to the height of the container (the reason for the minor version increment).                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                     |
| 2017.11.12 | 1.6.1   | Fix issues when events have a time other than midnight (they should be ignored). Add stylelint and vue lint, clean up package.json, other minor tweaks. Set browser compatibility to a minimum of IE10. Prevent issues from caching "today" value.                                                                                                                                                                                                                                                                                                                                                                                                                                                            |
| 2017.12.12 | 1.7.0   | Add `startingDayOfWeek` property to allow the calendar to optionally start on any desired day of the week                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                     |
| 2017.12.15 | 1.7.1   | Hopefully resolve reported babel preset error                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                 |
| 2017.12.17 | 1.8.0   | Split sample app to another repo, rebuild build/config scripts from scratch                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                   |
| 2017.12.17 | 1.8.1   | Add build for mixin                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                           |
