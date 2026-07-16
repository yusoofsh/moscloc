import { describe, expect, it } from "vitest"
import type { IqamahIntervals, MosqueInfo } from "~/contexts/PrayerContext"
import {
	ADMIN_CONTENT_LIMITS,
	normalizeAnnouncementInput,
	validateEvent,
	validateIqamahIntervals,
	validateMosqueInfo,
	validateVerse,
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

	it("rejects announcements that exceed the operator content limit", () => {
		expect(
			normalizeAnnouncementInput(
				"a".repeat(ADMIN_CONTENT_LIMITS.announcement + 1),
			),
		).toBeNull()
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

	it("accepts a bounded event with an HTTPS image URL", () => {
		expect(
			validateEvent({
				title: "Kajian Jumat",
				date: "Setiap Jumat",
				time: "Ba'da Isya",
				location: "Ruang Utama",
				image: "https://example.com/kajian.jpg",
				description: "Kajian rutin pekanan.",
			}),
		).toMatchObject({ ok: true })
	})

	it("rejects non-HTTPS event images and reports the image field", () => {
		expect(
			validateEvent({
				title: "Kajian Jumat",
				date: "Setiap Jumat",
				time: "Ba'da Isya",
				location: "Ruang Utama",
				image: "http://example.com/kajian.jpg",
				description: "",
			}),
		).toEqual({
			ok: false,
			errors: { image: "URL gambar harus menggunakan HTTPS." },
		})
	})

	it("rejects verse fields that exceed their content limits", () => {
		const result = validateVerse({
			arabic: "ا".repeat(ADMIN_CONTENT_LIMITS.verseArabic + 1),
			translation: "Terjemahan",
			reference: "Al-Baqarah 2:43",
		})

		expect(result).toEqual({
			ok: false,
			errors: { arabic: "Teks Arab terlalu panjang." },
		})
	})
})
