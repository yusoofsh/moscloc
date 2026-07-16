import { describe, expect, it } from "vitest"
import { defaultPrayerTimes } from "./prayerDomain"
import {
	formatApiDate,
	formatZonedClock,
	formatZonedLongDate,
	getCurrentAndNextPrayerForTime,
	getPrayerCountdownSeconds,
	millisecondsUntilNextZonedMidnight,
} from "./zonedTime"

describe("zonedTime", () => {
	const instant = new Date("2024-01-15T17:30:00.000Z")

	it("formats the configured timezone calendar date for Aladhan as DD-MM-YYYY", () => {
		expect(formatApiDate(instant, "Asia/Jakarta")).toBe("16-01-2024")
		expect(formatApiDate(instant, "America/New_York")).toBe("15-01-2024")
	})

	it("formats the displayed clock and Indonesian date in the configured timezone", () => {
		expect(formatZonedClock(instant, "Asia/Jakarta")).toBe("00:30")
		expect(formatZonedLongDate(instant, "Asia/Jakarta")).toBe(
			"Selasa, 16 Januari 2024",
		)
	})

	it("calculates current and next prayer from configured timezone wall time", () => {
		expect(
			getCurrentAndNextPrayerForTime(
				defaultPrayerTimes,
				instant,
				"Asia/Jakarta",
			),
		).toEqual({ currentPrayer: "Isya", nextPrayer: "Subuh" })

		expect(
			getCurrentAndNextPrayerForTime(
				defaultPrayerTimes,
				instant,
				"America/New_York",
			),
		).toEqual({ currentPrayer: "Dzuhur", nextPrayer: "Ashar" })
	})

	it("counts down to the next configured-timezone prayer occurrence", () => {
		expect(
			getPrayerCountdownSeconds(
				defaultPrayerTimes.fajr,
				new Date("2024-01-15T17:00:00.000Z"),
				"Asia/Jakarta",
			),
		).toBe(4 * 60 * 60 + 26 * 60)
	})

	it("schedules refresh at midnight in the configured timezone", () => {
		expect(
			millisecondsUntilNextZonedMidnight(
				new Date("2024-01-15T16:59:59.500Z"),
				"Asia/Jakarta",
			),
		).toBe(500)
	})
})
