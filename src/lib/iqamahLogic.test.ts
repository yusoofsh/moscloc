import { describe, expect, it } from "vitest"
import { defaultIqamahIntervals, defaultPrayerTimes } from "./prayerDomain"
import {
	getIqamahCountdownState,
	getIqamahRedirectState,
	getNextIqamahRedirectEvent,
} from "./iqamahLogic"

describe("iqamahLogic", () => {
	it("returns inactive before a prayer window starts", () => {
		expect(
			getIqamahCountdownState({
				prayerTimes: defaultPrayerTimes,
				iqamahIntervals: defaultIqamahIntervals,
				now: new Date("2024-01-15T12:02:59"),
			}),
		).toEqual({ status: "inactive" })
	})

	it("returns countdown state during an active prayer window", () => {
		expect(
			getIqamahCountdownState({
				prayerTimes: defaultPrayerTimes,
				iqamahIntervals: defaultIqamahIntervals,
				now: new Date("2024-01-15T12:05:00"),
			}),
		).toEqual({
			status: "countdown",
			prayerKey: "dhuhr",
			prayerName: "Dzuhur",
			adhanTime: "12:03",
			iqamahTime: "12:13",
			iqamahIntervalSeconds: 600,
			timeLeftSeconds: 480,
		})
	})

	it("maps route prayer keys to display names", () => {
		expect(
			getIqamahCountdownState({
				prayerTimes: defaultPrayerTimes,
				iqamahIntervals: defaultIqamahIntervals,
				prayerName: "dhuhr",
				now: new Date("2024-01-15T12:05:00"),
			}),
		).toMatchObject({
			status: "countdown",
			prayerKey: "dhuhr",
			prayerName: "Dzuhur",
		})
	})

	it("returns iqamah state exactly at iqamah time", () => {
		expect(
			getIqamahCountdownState({
				prayerTimes: defaultPrayerTimes,
				iqamahIntervals: defaultIqamahIntervals,
				now: new Date("2024-01-15T12:13:00"),
			}),
		).toMatchObject({
			status: "iqamah",
			prayerKey: "dhuhr",
			prayerName: "Dzuhur",
			timeLeftSeconds: 0,
		})
	})

	it("returns inactive after a prayer window ends", () => {
		expect(
			getIqamahCountdownState({
				prayerTimes: defaultPrayerTimes,
				iqamahIntervals: defaultIqamahIntervals,
				now: new Date("2024-01-15T12:13:01"),
			}),
		).toEqual({ status: "inactive" })
	})

	it("returns inactive for invalid route prayer names", () => {
		expect(
			getIqamahCountdownState({
				prayerTimes: defaultPrayerTimes,
				iqamahIntervals: defaultIqamahIntervals,
				prayerName: "not-a-prayer",
				now: new Date("2024-01-15T12:05:00"),
			}),
		).toEqual({ status: "inactive" })
	})

	it("returns inactive after midnight before Subuh adhan", () => {
		expect(
			getIqamahCountdownState({
				prayerTimes: defaultPrayerTimes,
				iqamahIntervals: defaultIqamahIntervals,
				now: new Date("2024-01-15T03:30:00"),
			}),
		).toEqual({ status: "inactive" })
	})

	it("returns redirect prompt state inside the redirect window", () => {
		expect(
			getIqamahRedirectState({
				prayerTimes: defaultPrayerTimes,
				iqamahIntervals: defaultIqamahIntervals,
				redirectDelaySeconds: 5,
				now: new Date("2024-01-15T12:12:56"),
			}),
		).toEqual({
			status: "prompt",
			countdownSeconds: 4,
			prayerKey: "dhuhr",
			prayerName: "Dzuhur",
			deadlineEpochMs: new Date("2024-01-15T12:13:00").getTime(),
		})
	})

	it("uses configured timezone wall time instead of the device timezone", () => {
		expect(
			getIqamahCountdownState({
				prayerTimes: defaultPrayerTimes,
				iqamahIntervals: defaultIqamahIntervals,
				now: new Date("2024-01-15T05:05:00.000Z"),
				timeZone: "Asia/Jakarta",
			}),
		).toMatchObject({
			status: "countdown",
			prayerKey: "dhuhr",
			timeLeftSeconds: 480,
		})
	})

	it("does not show a named-prayer countdown before its adhan", () => {
		expect(
			getIqamahCountdownState({
				prayerTimes: defaultPrayerTimes,
				iqamahIntervals: defaultIqamahIntervals,
				prayerName: "dhuhr",
				now: new Date("2024-01-15T11:00:00"),
			}),
		).toEqual({ status: "inactive" })
	})

	it("wraps an iqamah time that crosses midnight", () => {
		expect(
			getIqamahCountdownState({
				prayerTimes: { ...defaultPrayerTimes, isha: "23:58" },
				iqamahIntervals: { ...defaultIqamahIntervals, isha: 5 },
				prayerName: "isha",
				now: new Date("2024-01-15T23:59:00"),
			}),
		).toMatchObject({ status: "countdown", iqamahTime: "00:03" })
	})

	it("returns one absolute next redirect event for timer scheduling", () => {
		expect(
			getNextIqamahRedirectEvent({
				prayerTimes: defaultPrayerTimes,
				iqamahIntervals: defaultIqamahIntervals,
				redirectDelaySeconds: 5,
				now: new Date("2024-01-15T12:00:00"),
			}),
		).toMatchObject({
			prayerKey: "dhuhr",
			promptStartsAtEpochMs: new Date("2024-01-15T12:12:55").getTime(),
			deadlineEpochMs: new Date("2024-01-15T12:13:00").getTime(),
		})
	})
})
