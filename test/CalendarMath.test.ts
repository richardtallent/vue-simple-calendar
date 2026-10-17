import { describe, it, expect, vi, afterEach } from "vitest"
import CalendarMath from "../src/CalendarMath"

const d = (y: number, m: number, day: number, h = 0, min = 0, s = 0) => new Date(y, m - 1, day, h, min, s)

afterEach(() => vi.useRealTimers())

describe("addDays", () => {
	it("adds and subtracts days across month and year boundaries", () => {
		expect(CalendarMath.addDays(d(2024, 1, 31), 1)).toEqual(d(2024, 2, 1))
		expect(CalendarMath.addDays(d(2024, 1, 1), -1)).toEqual(d(2023, 12, 31))
	})
	it("handles leap days", () => {
		expect(CalendarMath.addDays(d(2024, 2, 28), 1)).toEqual(d(2024, 2, 29))
		expect(CalendarMath.addDays(d(2023, 2, 28), 1)).toEqual(d(2023, 3, 1))
	})
	it("preserves wall-clock time across DST transitions", () => {
		// US spring-forward 2024-03-10, fall-back 2024-11-03 (no-ops in zones without DST)
		expect(CalendarMath.addDays(d(2024, 3, 9, 12, 30), 2)).toEqual(d(2024, 3, 11, 12, 30))
		expect(CalendarMath.addDays(d(2024, 11, 2, 8, 15), 2)).toEqual(d(2024, 11, 4, 8, 15))
	})
})

describe("beginningOfWeek / endOfWeek / daysOfWeek", () => {
	// 2024-05-15 is a Wednesday
	it("finds the week start for each starting day of week", () => {
		const wed = d(2024, 5, 15)
		expect(CalendarMath.beginningOfWeek(wed, 0)).toEqual(d(2024, 5, 12)) // Sun
		expect(CalendarMath.beginningOfWeek(wed, 1)).toEqual(d(2024, 5, 13)) // Mon
		expect(CalendarMath.beginningOfWeek(wed, 3)).toEqual(d(2024, 5, 15)) // Wed (same day)
		expect(CalendarMath.beginningOfWeek(wed, 4)).toEqual(d(2024, 5, 9)) // Thu (previous)
		expect(CalendarMath.beginningOfWeek(wed, 6)).toEqual(d(2024, 5, 11)) // Sat
	})
	it("returns the day itself when it is the week start", () => {
		expect(CalendarMath.beginningOfWeek(d(2024, 5, 12), 0)).toEqual(d(2024, 5, 12))
	})
	it("crosses month and year boundaries", () => {
		expect(CalendarMath.beginningOfWeek(d(2024, 1, 1), 0)).toEqual(d(2023, 12, 31))
	})
	it("endOfWeek is exactly 7 days after the week start", () => {
		expect(CalendarMath.endOfWeek(d(2024, 5, 15), 0)).toEqual(d(2024, 5, 19))
	})
	it("daysOfWeek returns 7 consecutive days", () => {
		const days = CalendarMath.daysOfWeek(d(2024, 12, 29))
		expect(days).toHaveLength(7)
		expect(days[0]).toEqual(d(2024, 12, 29))
		expect(days[6]).toEqual(d(2025, 1, 4))
	})
})

describe("beginningOfPeriod", () => {
	const x = d(2024, 5, 15, 13, 45)
	it("handles each unit", () => {
		expect(CalendarMath.beginningOfPeriod(x, "year", 0)).toEqual(d(2024, 1, 1))
		expect(CalendarMath.beginningOfPeriod(x, "month", 0)).toEqual(d(2024, 5, 1))
		expect(CalendarMath.beginningOfPeriod(x, "week", 1).getDate()).toBe(13)
	})
	it("returns the date unchanged for unknown units", () => {
		expect(CalendarMath.beginningOfPeriod(x, "bogus", 0)).toBe(x)
	})
})

describe("beginningOfMonth / instanceOfMonth", () => {
	it("beginningOfMonth", () => {
		expect(CalendarMath.beginningOfMonth(d(2024, 5, 15, 10))).toEqual(d(2024, 5, 1))
	})
	it("instanceOfMonth counts weekday occurrences", () => {
		expect(CalendarMath.instanceOfMonth(d(2024, 5, 1))).toBe(1)
		expect(CalendarMath.instanceOfMonth(d(2024, 5, 7))).toBe(1)
		expect(CalendarMath.instanceOfMonth(d(2024, 5, 8))).toBe(2)
		expect(CalendarMath.instanceOfMonth(d(2024, 5, 29))).toBe(5)
	})
})

describe("incrementPeriod", () => {
	it("increments years, months and weeks, forwards and backwards", () => {
		expect(CalendarMath.incrementPeriod(d(2024, 5, 15), "year", 1)).toEqual(d(2025, 5, 15))
		expect(CalendarMath.incrementPeriod(d(2024, 5, 15), "month", -5)).toEqual(d(2023, 12, 15))
		expect(CalendarMath.incrementPeriod(d(2024, 5, 15), "week", 2)).toEqual(d(2024, 5, 29))
		expect(CalendarMath.incrementPeriod(d(2024, 12, 30), "week", 1)).toEqual(d(2025, 1, 6))
	})
	it("ignores unknown units", () => {
		expect(CalendarMath.incrementPeriod(d(2024, 5, 15), "day", 3)).toEqual(d(2024, 5, 15))
	})
})

describe("ISO formatting", () => {
	it("pads month and day", () => {
		expect(CalendarMath.paddedMonth(d(2024, 3, 5))).toBe("03")
		expect(CalendarMath.paddedDay(d(2024, 3, 5))).toBe("05")
		expect(CalendarMath.paddedMonth(d(2024, 12, 25))).toBe("12")
	})
	it("builds iso strings", () => {
		const x = d(2024, 3, 5)
		expect(CalendarMath.isoYearMonth(x)).toBe("2024-03")
		expect(CalendarMath.isoYearMonthDay(x)).toBe("2024-03-05")
		expect(CalendarMath.isoMonthDay(x)).toBe("03-05")
	})
})

describe("dayDiff and comparisons", () => {
	it("dayDiff counts calendar days regardless of time", () => {
		expect(CalendarMath.dayDiff(d(2024, 5, 1, 23, 59), d(2024, 5, 2, 0, 1))).toBe(1)
		expect(CalendarMath.dayDiff(d(2024, 5, 2), d(2024, 5, 1))).toBe(-1)
		expect(CalendarMath.dayDiff(d(2023, 12, 31), d(2024, 1, 1))).toBe(1)
	})
	it("dayDiff is an exact integer across DST changes", () => {
		expect(CalendarMath.dayDiff(d(2024, 3, 9), d(2024, 3, 11))).toBe(2)
		expect(CalendarMath.dayDiff(d(2024, 11, 2), d(2024, 11, 4))).toBe(2)
	})
	it("dayDiff spans leap years", () => {
		expect(CalendarMath.dayDiff(d(2024, 1, 1), d(2025, 1, 1))).toBe(366)
		expect(CalendarMath.dayDiff(d(2023, 1, 1), d(2024, 1, 1))).toBe(365)
	})
	it("isSameDate ignores time and rejects missing values", () => {
		expect(CalendarMath.isSameDate(d(2024, 5, 1, 1), d(2024, 5, 1, 23))).toBe(true)
		expect(CalendarMath.isSameDate(d(2024, 5, 1), d(2024, 5, 2))).toBe(false)
		expect(CalendarMath.isSameDate(undefined, d(2024, 5, 1))).toBe(false)
	})
	it("isSameDateTime compares exact instants", () => {
		expect(CalendarMath.isSameDateTime(d(2024, 5, 1, 1), d(2024, 5, 1, 1))).toBe(true)
		expect(CalendarMath.isSameDateTime(d(2024, 5, 1, 1), d(2024, 5, 1, 2))).toBe(false)
		expect(CalendarMath.isSameDateTime(d(2024, 5, 1), undefined)).toBe(false)
	})
	it("isSameMonth requires same year too", () => {
		expect(CalendarMath.isSameMonth(d(2024, 5, 1), d(2024, 5, 31))).toBe(true)
		expect(CalendarMath.isSameMonth(d(2024, 5, 1), d(2025, 5, 1))).toBe(false)
		expect(CalendarMath.isSameMonth(undefined, d(2024, 5, 1))).toBe(false)
	})
	it("isLastDayOfMonth", () => {
		expect(CalendarMath.isLastDayOfMonth(d(2024, 2, 29))).toBe(true)
		expect(CalendarMath.isLastDayOfMonth(d(2023, 2, 28))).toBe(true)
		expect(CalendarMath.isLastDayOfMonth(d(2024, 2, 28))).toBe(false)
		expect(CalendarMath.isLastDayOfMonth(d(2024, 12, 31))).toBe(true)
	})
	it("isLastInstanceOfMonth", () => {
		expect(CalendarMath.isLastInstanceOfMonth(d(2024, 5, 25))).toBe(true)
		expect(CalendarMath.isLastInstanceOfMonth(d(2024, 5, 24))).toBe(false)
	})
})

describe("relative to today", () => {
	it("uses the current date", () => {
		vi.useFakeTimers()
		vi.setSystemTime(d(2024, 5, 15, 14, 30))
		expect(CalendarMath.today()).toEqual(d(2024, 5, 15))
		expect(CalendarMath.isInPast(d(2024, 5, 14, 23, 59))).toBe(true)
		expect(CalendarMath.isInPast(d(2024, 5, 15, 0, 0))).toBe(false)
		expect(CalendarMath.isInFuture(d(2024, 5, 16, 0, 1))).toBe(true)
		expect(CalendarMath.isInFuture(d(2024, 5, 15, 23, 59))).toBe(false)
		expect(CalendarMath.isPastMonth(d(2024, 4, 30))).toBe(true)
		expect(CalendarMath.isPastMonth(d(2024, 5, 1))).toBe(false)
		expect(CalendarMath.isFutureMonth(d(2024, 6, 1))).toBe(true)
		expect(CalendarMath.isFutureMonth(d(2024, 5, 31))).toBe(false)
	})
})

describe("date parsing", () => {
	it("dateOnly strips time without mutating the input", () => {
		const x = d(2024, 5, 15, 13, 45, 12)
		expect(CalendarMath.dateOnly(x)).toEqual(d(2024, 5, 15))
		expect(x).toEqual(d(2024, 5, 15, 13, 45, 12))
	})
	it("fromIsoStringToLocalDate parses as local time", () => {
		expect(CalendarMath.fromIsoStringToLocalDate("2024-05-15")).toEqual(d(2024, 5, 15))
		expect(CalendarMath.fromIsoStringToLocalDate("2024-05-15T13:45:12")).toEqual(d(2024, 5, 15, 13, 45, 12))
		expect(CalendarMath.fromIsoStringToLocalDate("2024-05-15 13:45")).toEqual(d(2024, 5, 15, 13, 45))
	})
	it("toLocalDate handles strings, Dates and timestamps", () => {
		expect(CalendarMath.toLocalDate("2024-05-15")).toEqual(d(2024, 5, 15))
		const x = d(2024, 5, 15, 9)
		expect(CalendarMath.toLocalDate(x)).toEqual(x)
		expect(CalendarMath.toLocalDate(x.getTime())).toEqual(x)
	})
})

describe("formattedPeriod", () => {
	const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"]
	it("formats a year", () => {
		expect(CalendarMath.formattedPeriod(d(2024, 1, 1), d(2024, 12, 31), "year", months)).toBe("Jan – Dec 2024")
	})
	it("formats a month", () => {
		expect(CalendarMath.formattedPeriod(d(2024, 5, 1), d(2024, 5, 31), "month", months)).toBe("May 2024")
	})
	it("formats weeks within a month, across months, and across years", () => {
		expect(CalendarMath.formattedPeriod(d(2024, 5, 12), d(2024, 5, 18), "week", months)).toBe("May 12 – 18, 2024")
		expect(CalendarMath.formattedPeriod(d(2024, 4, 28), d(2024, 5, 4), "week", months)).toBe("Apr 28 – May 4, 2024")
		expect(CalendarMath.formattedPeriod(d(2024, 12, 29), d(2025, 1, 4), "week", months)).toBe("Dec 29, 2024 – Jan 4, 2025")
	})
})

describe("formattedTime", () => {
	it("returns empty string at midnight", () => {
		expect(CalendarMath.formattedTime(d(2024, 5, 15), "en-US")).toBe("")
	})
	it("formats other times via the locale", () => {
		expect(CalendarMath.formattedTime(d(2024, 5, 15, 13, 5), "en-US", { hour: "numeric", minute: "2-digit" })).toMatch(/^1:05\sPM$/)
		expect(CalendarMath.formattedTime(d(2024, 5, 15, 13, 5), "en-GB", { hour: "2-digit", minute: "2-digit", hour12: false })).toBe("13:05")
	})
})

describe("locale names", () => {
	it("month names", () => {
		const names = CalendarMath.getFormattedMonthNames("en-US", "long")
		expect(names).toHaveLength(12)
		expect(names[0]).toBe("January")
		expect(names[11]).toBe("December")
		expect(CalendarMath.getFormattedMonthNames("en-US", "short")[8]).toBe("Sep")
	})
	it("weekday names respect the starting day", () => {
		expect(CalendarMath.getFormattedWeekdayNames("en-US", "short", 0)).toEqual(["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"])
		expect(CalendarMath.getFormattedWeekdayNames("en-US", "short", 1)).toEqual(["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"])
		expect(CalendarMath.getFormattedWeekdayNames("en-US", "short", 6)[0]).toBe("Sat")
	})
	it("languageCode takes the first two characters", () => {
		expect(CalendarMath.languageCode("en-US")).toBe("en")
	})
	it("supportsIntl", () => {
		expect(CalendarMath.supportsIntl()).toBe(true)
	})
})

describe("normalizeItem", () => {
	it("fills defaults", () => {
		const n = CalendarMath.normalizeItem({ id: "a", startDate: "2024-05-15" }, false)
		expect(n.title).toBe("Untitled")
		expect(n.startDate).toEqual(d(2024, 5, 15))
		expect(n.endDate).toEqual(d(2024, 5, 15))
		expect(n.classes).toEqual([])
		expect(n.id).toBe("a")
	})
	it("adds isHovered without mutating the original classes", () => {
		const item = { id: "a", startDate: "2024-05-15", endDate: "2024-05-17", title: "T", classes: ["x"], tooltip: "tip" }
		const n = CalendarMath.normalizeItem(item, true)
		expect(n.classes).toEqual(["x", "isHovered"])
		expect(item.classes).toEqual(["x"])
		expect(n.endDate).toEqual(d(2024, 5, 17))
		expect(n.tooltip).toBe("tip")
		expect(n.originalItem).toBe(item)
	})
	it("falls back to title for tooltip", () => {
		expect(CalendarMath.normalizeItem({ id: "a", startDate: "2024-05-15", title: "Hello" }, false).tooltip).toBe("Hello")
	})
})

describe("getDefaultBrowserLocale", () => {
	it("returns 'unk' without navigator", () => {
		vi.stubGlobal("navigator", undefined)
		expect(CalendarMath.getDefaultBrowserLocale()).toBe("unk")
		vi.unstubAllGlobals()
	})
	it("lowercases the first preferred language", () => {
		vi.stubGlobal("navigator", { languages: ["en-US", "fr"], language: "fr" })
		expect(CalendarMath.getDefaultBrowserLocale()).toBe("en-us")
		vi.unstubAllGlobals()
	})
	it("falls back to navigator.language", () => {
		vi.stubGlobal("navigator", { languages: [], language: "FR-ca" })
		expect(CalendarMath.getDefaultBrowserLocale()).toBe("fr-ca")
		vi.unstubAllGlobals()
	})
})
