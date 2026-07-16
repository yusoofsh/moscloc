import { describe, expect, it } from "vitest"
import {
	defaultPrayerSettings,
	normalizePrayerSettings,
	normalizePrayerTimes,
} from "./prayerDomain"

describe("prayerDomain", () => {
	it("normalizes valid prayer times and strips API annotations", () => {
		expect(
			normalizePrayerTimes({
				fajr: "4:26 (WIB)",
				sunrise: "05:50",
				dhuhr: "12:03",
				asr: "15:03",
				maghrib: "17:58",
				isha: "18:59",
			}),
		).toEqual({
			fajr: "04:26",
			sunrise: "05:50",
			dhuhr: "12:03",
			asr: "15:03",
			maghrib: "17:58",
			isha: "18:59",
		})
	})

	it("rejects impossible or incomplete prayer times", () => {
		expect(
			normalizePrayerTimes({
				fajr: "25:00",
				sunrise: "05:50",
				dhuhr: "12:03",
				asr: "15:03",
				maghrib: "17:58",
				isha: "18:59",
			}),
		).toBeNull()
		expect(normalizePrayerTimes({ fajr: "04:26" })).toBeNull()
	})

	it("migrates the legacy timezone field and fills missing settings", () => {
		expect(
			normalizePrayerSettings({
				method: 5,
				timezone: "Pacific/Auckland",
			}),
		).toEqual({
			...defaultPrayerSettings,
			method: 5,
			timezonestring: "Pacific/Auckland",
		})
	})

	it("falls back per field when persisted settings are invalid", () => {
		expect(
			normalizePrayerSettings({
				method: "invalid",
				school: 1,
				timezonestring: "not/a-real-zone",
			}),
		).toEqual({
			...defaultPrayerSettings,
			school: 1,
		})
	})
})
