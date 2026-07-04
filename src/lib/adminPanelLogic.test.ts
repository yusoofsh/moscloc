import { describe, expect, it } from "vitest"
import type { IqamahIntervals, MosqueInfo } from "~/contexts/PrayerContext"
import {
	normalizeAnnouncementInput,
	validateIqamahIntervals,
	validateMosqueInfo,
} from "./adminPanelLogic"

const mosqueInfo: MosqueInfo = {
	name: "Masjid TDD",
	address: "Jalan Uji",
	contact: "08123456789",
	latitude: -8.0679373,
	longitude: 112.5988417,
}

const iqamahIntervals: IqamahIntervals = {
	fajr: 15,
	dhuhr: 10,
	asr: 10,
	maghrib: 5,
	isha: 10,
}

describe("adminPanelLogic", () => {
	it("normalizes non-empty announcement input", () => {
		expect(normalizeAnnouncementInput("  Kajian setelah Maghrib  ")).toBe(
			"Kajian setelah Maghrib",
		)
	})

	it("rejects blank announcement input", () => {
		expect(normalizeAnnouncementInput("   ")).toBeNull()
	})

	it("accepts mosque info with finite coordinates", () => {
		expect(validateMosqueInfo(mosqueInfo)).toEqual({
			ok: true,
			value: mosqueInfo,
		})
	})

	it("rejects mosque info with invalid coordinates", () => {
		expect(
			validateMosqueInfo({
				...mosqueInfo,
				latitude: Number.NaN,
			}),
		).toEqual({
			ok: false,
			errors: ["Lintang harus berupa angka yang valid."],
		})
	})

	it("accepts whole-minute iqamah intervals from 1 to 60", () => {
		expect(validateIqamahIntervals(iqamahIntervals)).toEqual({
			ok: true,
			value: iqamahIntervals,
		})
	})

	it("rejects iqamah intervals outside the supported range", () => {
		expect(
			validateIqamahIntervals({
				...iqamahIntervals,
				dhuhr: 0,
				isha: 61,
			}),
		).toEqual({
			ok: false,
			errors: [
				"Dzuhur harus berupa menit bulat antara 1 dan 60.",
				"Isya harus berupa menit bulat antara 1 dan 60.",
			],
		})
	})
})
