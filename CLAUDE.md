# CLAUDE.md

Instructions for AI agents working on **vue-simple-calendar**: a small, dependency-free Vue 3 calendar component published to npm. Users depend on its markup, CSS classes, props, events, and slots, so treat all of those as public API.

## Layout

- `src/CalendarView.vue`: the component (`<script setup lang="ts">`, generic over `T extends ICalendarItem`). Most changes land here.
- `src/CalendarViewHeader.vue`: the optional header component.
- `src/CalendarMath.ts`: date math. Pure functions only; this is the code that has tests.
- `src/ICalendarItem.ts`, `src/IHeaderProps.ts`: public types.
- `lib/main.ts`: library entry point. Anything users import must be exported here.
- `public/css/*.css`: bundled themes (`default`, `gcal`, holidays), shipped as `dist/css/*`.
- `src/App.vue`, `src/ExampleSimple.vue`, `src/ExampleFull.vue`: demo app (`npm run dev`). It isn't part of the published package.
- `test/CalendarMath.test.ts`: Vitest tests.
- `dist/` and `*.tgz` are build artifacts and gitignored. Never commit or hand-edit them.

## Commands

- `npm run dev`: demo app, for checking UI changes by hand.
- `npm run build`: library build, which also emits `.d.ts` files. It must succeed.
- `npm test`: runs the suite three times, in `America/New_York`, `Pacific/Auckland`, and `UTC`. Date bugs often show up in only one zone, so never narrow this to a single TZ.

## Code conventions

- Prettier settings are in `package.json`: tabs, no semicolons, double quotes, `es5` trailing commas, 160-char lines. Match the surrounding code.
- No new runtime dependencies. `vue` is the only one, and that's deliberate.
- Dates: work in local time with the `CalendarMath` helpers (`dateOnly`, `addDays`, `isSameDate`, ...). Don't use raw `Date` arithmetic in milliseconds, which breaks across DST. Any new date logic goes in `CalendarMath` with tests covering month/year boundaries, leap days, and DST.
- New user-facing text, such as `aria-label`s, must be overridable with a prop. Don't hard-code English (#257).
- Styling hooks are CSS classes on the elements (see "Customizing the Look and Feel" in the README). Add state as a class, not as an attribute used only for styling.
- Accessibility: only use ARIA attributes that are valid for the element's role. Most calendar elements are plain divs with no role, so most ARIA attributes are invalid on them. Don't use deprecated attributes (`aria-grabbed`, `aria-dropeffect`). Remember that Vue renders `false` as the string `"false"`; use `undefined` to leave an attribute off.

## Compatibility and docs checklist

Any change to props, events, slots, emitted payloads, CSS classes, markup structure, or exported types:

1. Keep it backward compatible if possible. If not, say so explicitly in the CHANGELOG and tell users what to change.
2. Update the README: the props/events/slots sections, the class diagram under "Calendar classes", and the per-class sections.
3. Update the bundled themes in `public/css/` if a selector they use changes.
4. Add a CHANGELOG entry under the next version heading. Use one bullet per change, put user impact first, add issue/PR numbers, and credit outside contributors (`thanks @user`).
5. Run `npm run build` and `npm test`.

Don't bump the `package.json` version or publish unless the maintainer asks.

## Pull requests, issues, and commit messages

The maintainer reviews these by reading them. Write them so the problem and the change can be understood in under a minute.

**Size the description to the diff.** A 10-line fix gets a few sentences, not a report. If the description is longer than the diff, cut it.

**Use this structure, and nothing more:**

```
Fixes #N

**Problem:** One or two sentences. What is broken, for whom, and how to see it.
Quote the exact error, wrong output, or offending markup if that's clearer.

**Change:** A bullet per meaningful change, saying what changed rather than restating the diff.

**Breaking / user impact:** Only if there is any (changed classes, props, markup, defaults).

**Verified:** One line, e.g. "build + tests pass; checked range selection in ExampleFull".
```

**Leave out:**
- Sections arguing why the change is harmless. If there's a real tradeoff, state it in one line under "Breaking / user impact".
- Before/after tables of tool output. Give one number or one example if needed ("axe: 43 violations → 0").
- Copies of the code being changed. The diff already shows it.
- "Not included", "future work", or offers of follow-up PRs. Open a separate issue if it matters.
- Headings for every paragraph, bold sprinkled through sentences, and restating the issue that's already linked.
- Claims you didn't check. If you didn't test something in a browser, don't imply you did.

**Keep the scope tight.** One problem per PR. Still fix every instance of that problem, though: don't fix it in one template and leave the same issue in the next one as "out of scope".

**Issues** follow the same rule: the problem, a minimal repro, expected vs. actual. Propose a fix in a sentence or two if you have one.

**Commit messages:** short imperative subject. Add a body only when the reason isn't obvious from the diff. Existing history uses `Fixes #N` for issue fixes.
