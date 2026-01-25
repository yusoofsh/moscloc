import { HttpResponse, http } from "msw"
import { describe, expect, it } from "vitest"
import { mockPrayerSettings } from "~/__tests__/fixtures/prayerTimes"
import { server } from "~/__tests__/mocks/server"
import { getPrayerTimes } from "./prayerService"

describe("prayerService", () => {
	describe("getPrayerTimes", () => {
		it("fetches prayer times from Aladhan API", async () => {
			const result = await getPrayerTimes(
				-8.0679373,
				112.5988417,
				mockPrayerSettings,
			)

			expect(result).toEqual({
				fajr: "04:26",
				sunrise: "05:50",
				dhuhr: "12:03",
				asr: "15:03",
				maghrib: "17:58",
				isha: "18:59",
			})
		})

		it("returns default times when API fails", async () => {
			server.use(
				http.get("https://api.aladhan.com/v1/timings/*", () => {
					return new HttpResponse(null, { status: 500 })
				}),
			)

			const result = await getPrayerTimes(
				-8.0679373,
				112.5988417,
				mockPrayerSettings,
			)
			expect(result).toBeDefined()
			expect(result.fajr).toBeDefined()
		})

		it("handles network errors gracefully", async () => {
			server.use(
				http.get("https://api.aladhan.com/v1/timings/*", () => {
					return HttpResponse.error()
				}),
			)

			const result = await getPrayerTimes(
				-8.0679373,
				112.5988417,
				mockPrayerSettings,
			)
			expect(result).toBeDefined()
			expect(result.fajr).toBeDefined()
		})

		it("uses default settings when none provided", async () => {
			const result = await getPrayerTimes(-8.0679373, 112.5988417)

			expect(result).toBeDefined()
			expect(result.fajr).toBeDefined()
		})
	})
})
