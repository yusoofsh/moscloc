import { describe, expect, it } from "vitest"
import {
	defaultIqamahIntervals,
	defaultPrayerTimes,
} from "~/contexts/PrayerContext"
import { getIqamahCountdownState, getIqamahRedirectState } from "./iqamahLogic"

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
		})
	})
})
