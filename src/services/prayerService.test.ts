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

		it("uses the configured timezone date and documented DD-MM-YYYY path", async () => {
			let requestedPath = ""
			server.use(
				http.get("https://api.aladhan.com/v1/timings/*", ({ request }) => {
					requestedPath = new URL(request.url).pathname
					return HttpResponse.json({
						data: {
							timings: {
								Fajr: "4:26 (WIB)",
								Sunrise: "05:50",
								Dhuhr: "12:03",
								Asr: "15:03",
								Maghrib: "17:58",
								Isha: "18:59",
							},
						},
					})
				}),
			)

			const result = await getPrayerTimes(
				-8.0679373,
				112.5988417,
				mockPrayerSettings,
				{ now: new Date("2024-01-15T17:30:00.000Z") },
			)

			expect(requestedPath).toBe("/v1/timings/16-01-2024")
			expect(result.fajr).toBe("04:26")
		})

		it("rejects when API fails instead of disguising defaults as fresh data", async () => {
			server.use(
				http.get("https://api.aladhan.com/v1/timings/*", () => {
					return new HttpResponse(null, { status: 500 })
				}),
			)

			await expect(
				getPrayerTimes(-8.0679373, 112.5988417, mockPrayerSettings),
			).rejects.toThrow("Failed to fetch prayer times")
		})

		it("rejects network errors so callers can expose stale state", async () => {
			server.use(
				http.get("https://api.aladhan.com/v1/timings/*", () => {
					return HttpResponse.error()
				}),
			)

			await expect(
				getPrayerTimes(-8.0679373, 112.5988417, mockPrayerSettings),
			).rejects.toThrow()
		})

		it("uses default settings when none provided", async () => {
			const result = await getPrayerTimes(-8.0679373, 112.5988417)

			expect(result).toBeDefined()
			expect(result.fajr).toBeDefined()
		})
	})
})
