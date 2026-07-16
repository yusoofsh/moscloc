import { act, render, renderHook, waitFor } from "@testing-library/react"
import { delay, HttpResponse, http } from "msw"
import type { ReactNode } from "react"
import { beforeEach, describe, expect, it } from "vitest"
import { server } from "~/__tests__/mocks/server"
import {
	defaultPrayerTimes,
	getCurrentAndNextPrayerForTime,
	PrayerProvider,
	useMosqueContentContext,
	usePrayerContext,
	usePrayerScheduleContext,
} from "./PrayerContext"

const wrapper = ({ children }: { children: ReactNode }) => (
	<PrayerProvider>{children}</PrayerProvider>
)

type MockedStorageMethod = {
	mock: { calls: unknown[] }
}

const localStorageSetItemCallCount = () =>
	(localStorage.setItem as unknown as MockedStorageMethod).mock.calls.length

describe("PrayerContext", () => {
	beforeEach(() => {
		localStorage.clear()
	})

	it("throws error when used outside provider", () => {
		expect(() => {
			renderHook(() => usePrayerContext())
		}).toThrow("usePrayerContext must be used within a PrayerProvider")
	})

	it("provides default prayer times", () => {
		const { result } = renderHook(() => usePrayerContext(), { wrapper })

		expect(result.current.prayerTimes).toBeDefined()
		expect(result.current.prayerTimes.fajr).toBeDefined()
	})

	it("isolates content consumers from live schedule updates", async () => {
		let contentRenders = 0
		let scheduleRenders = 0
		let contentContext: ReturnType<typeof useMosqueContentContext> | undefined
		let scheduleContext: ReturnType<typeof usePrayerScheduleContext> | undefined

		const ContentProbe = () => {
			contentRenders += 1
			contentContext = useMosqueContentContext()
			return null
		}
		const ScheduleProbe = () => {
			scheduleRenders += 1
			scheduleContext = usePrayerScheduleContext()
			return null
		}

		render(
			<PrayerProvider>
				<ContentProbe />
				<ScheduleProbe />
			</PrayerProvider>,
		)
		await waitFor(() =>
			expect(scheduleContext?.prayerTimesStatus).toBe("fresh"),
		)

		const contentRendersBeforeScheduleUpdate = contentRenders
		act(() => {
			scheduleContext?.updatePrayerSettings({
				...scheduleContext.prayerSettings,
				method: 5,
			})
		})
		await waitFor(() => {
			expect(scheduleContext?.prayerSettings.method).toBe(5)
			expect(scheduleContext?.prayerTimesStatus).toBe("fresh")
		})
		expect(contentRenders).toBe(contentRendersBeforeScheduleUpdate)

		const scheduleRendersBeforeContentUpdate = scheduleRenders
		act(() => contentContext?.updateAnnouncements(["Pengumuman terisolasi"]))
		await waitFor(() =>
			expect(contentContext?.announcements).toEqual(["Pengumuman terisolasi"]),
		)
		expect(scheduleRenders).toBe(scheduleRendersBeforeContentUpdate)
	})

	it("provides default mosque info", () => {
		const { result } = renderHook(() => usePrayerContext(), { wrapper })

		expect(result.current.mosqueInfo).toBeDefined()
		expect(result.current.mosqueInfo.name).toBe("Masjid Darul Arqom")
	})

	it("updates mosque info and persists to localStorage", () => {
		const { result } = renderHook(() => usePrayerContext(), { wrapper })

		const newInfo = {
			name: "New Mosque",
			address: "New Address",
			contact: "123",
			latitude: 0,
			longitude: 0,
		}

		act(() => {
			result.current.updateMosqueInfo(newInfo)
		})

		expect(result.current.mosqueInfo).toEqual(newInfo)
		expect(localStorageSetItemCallCount()).toBeGreaterThan(0)
	})

	it("updates announcements and persists to localStorage", () => {
		const { result } = renderHook(() => usePrayerContext(), { wrapper })

		const newAnnouncements = ["Announcement 1", "Announcement 2"]

		act(() => {
			result.current.updateAnnouncements(newAnnouncements)
		})

		expect(result.current.announcements).toEqual(newAnnouncements)
		expect(localStorageSetItemCallCount()).toBeGreaterThan(0)
	})

	it("updates events and persists to localStorage", () => {
		const { result } = renderHook(() => usePrayerContext(), { wrapper })

		const newEvents = [
			{
				id: "1",
				title: "Event 1",
				date: "2024-01-20",
				time: "19:00",
				location: "Masjid",
				image: "",
				description: "Test event",
			},
		]

		act(() => {
			result.current.updateEvents(newEvents)
		})

		expect(result.current.events).toEqual(newEvents)
		expect(localStorageSetItemCallCount()).toBeGreaterThan(0)
	})

	it("updates verses and persists to localStorage", () => {
		const { result } = renderHook(() => usePrayerContext(), { wrapper })

		const newVerses = [
			{
				id: "1",
				arabic: "Test Arabic",
				translation: "Test Translation",
				reference: "Test 1:1",
			},
		]

		act(() => {
			result.current.updateVerses(newVerses)
		})

		expect(result.current.verses).toEqual(newVerses)
		expect(localStorageSetItemCallCount()).toBeGreaterThan(0)
	})

	it("updates prayer settings and persists to localStorage", () => {
		const { result } = renderHook(() => usePrayerContext(), { wrapper })

		const newSettings = {
			method: 5,
			shafaq: "general",
			tune: "0,0,0,0,0,0,0,0,0",
			school: 1,
			midnightMode: 0,
			timezonestring: "Asia/Jakarta",
		}

		act(() => {
			result.current.updatePrayerSettings(newSettings)
		})

		expect(result.current.prayerSettings).toEqual(newSettings)
		expect(localStorageSetItemCallCount()).toBeGreaterThan(0)
	})

	it("updates iqamah intervals and persists to localStorage", () => {
		const { result } = renderHook(() => usePrayerContext(), { wrapper })

		const newIntervals = {
			fajr: 20,
			dhuhr: 15,
			asr: 15,
			maghrib: 10,
			isha: 15,
		}

		act(() => {
			result.current.updateIqamahIntervals(newIntervals)
		})

		expect(result.current.iqamahIntervals).toEqual(newIntervals)
		expect(localStorageSetItemCallCount()).toBeGreaterThan(0)
	})

	it("calculates current and next prayer", async () => {
		const { result } = renderHook(() => usePrayerContext(), { wrapper })

		await waitFor(
			() => {
				expect(result.current.currentPrayer).toBeDefined()
				expect(result.current.nextPrayer).toBeDefined()
			},
			{ timeout: 3000 },
		)
	})

	it("provides default iqamah intervals", () => {
		const { result } = renderHook(() => usePrayerContext(), { wrapper })

		expect(result.current.iqamahIntervals).toBeDefined()
		expect(result.current.iqamahIntervals.fajr).toBe(15)
		expect(result.current.iqamahIntervals.maghrib).toBe(5)
	})

	it("loads saved mosque info from localStorage", async () => {
		const savedInfo = {
			name: "Masjid Persisten",
			address: "Jalan Persisten",
			contact: "0800000000",
			latitude: -7,
			longitude: 112,
		}

		localStorage.setItem("mosqueInfo", JSON.stringify(savedInfo))

		const { result } = renderHook(() => usePrayerContext(), { wrapper })

		await waitFor(() => {
			expect(result.current.mosqueInfo).toEqual(savedInfo)
		})
	})

	it("loads saved iqamah intervals from localStorage", async () => {
		const savedIntervals = {
			fajr: 11,
			dhuhr: 12,
			asr: 13,
			maghrib: 4,
			isha: 14,
		}

		localStorage.setItem("iqamahIntervals", JSON.stringify(savedIntervals))

		const { result } = renderHook(() => usePrayerContext(), { wrapper })

		await waitFor(() => {
			expect(result.current.iqamahIntervals).toEqual(savedIntervals)
		})
	})

	it("hydrates valid keys even when another stored key is malformed", () => {
		localStorage.setItem("mosqueInfo", "{broken-json")
		localStorage.setItem("announcements", JSON.stringify(["Tetap aman"]))

		const { result } = renderHook(() => usePrayerContext(), { wrapper })

		expect(result.current.mosqueInfo.name).toBe("Masjid Darul Arqom")
		expect(result.current.announcements).toEqual(["Tetap aman"])
	})

	it("hydrates settings before the first prayer request starts", async () => {
		let requestedMethod = ""
		let requestedTimeZone = ""
		localStorage.setItem(
			"prayerSettings",
			JSON.stringify({ method: 5, timezone: "Pacific/Auckland" }),
		)
		server.use(
			http.get("https://api.aladhan.com/v1/timings/*", ({ request }) => {
				const url = new URL(request.url)
				requestedMethod = url.searchParams.get("method") ?? ""
				requestedTimeZone = url.searchParams.get("timezonestring") ?? ""
				return HttpResponse.json({
					data: {
						timings: {
							Fajr: "04:26",
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

		renderHook(() => usePrayerContext(), { wrapper })

		await waitFor(() => expect(requestedMethod).toBe("5"))
		expect(requestedTimeZone).toBe("Pacific/Auckland")
	})

	it("exposes an error state when defaults are shown without a successful fetch", async () => {
		server.use(
			http.get(
				"https://api.aladhan.com/v1/timings/*",
				() => new HttpResponse(null, { status: 503 }),
			),
		)
		const { result } = renderHook(() => usePrayerContext(), { wrapper })

		await waitFor(() => expect(result.current.prayerTimesStatus).toBe("error"))
		expect(result.current.prayerTimesError).toBe(
			"Jadwal salat tidak dapat diperbarui",
		)
	})

	it("retains the last successful times and marks them stale after refresh failure", async () => {
		const { result } = renderHook(() => usePrayerContext(), { wrapper })
		await waitFor(() => expect(result.current.prayerTimesStatus).toBe("fresh"))
		const successfulTimes = result.current.prayerTimes
		server.use(
			http.get(
				"https://api.aladhan.com/v1/timings/*",
				() => new HttpResponse(null, { status: 503 }),
			),
		)

		act(() => {
			result.current.updatePrayerSettings({
				...result.current.prayerSettings,
				method: 5,
			})
		})

		await waitFor(() => expect(result.current.prayerTimesStatus).toBe("stale"))
		expect(result.current.prayerTimes).toEqual(successfulTimes)
	})

	it("prevents an older request from overwriting newer prayer settings", async () => {
		let slowRequestStarted = false
		server.use(
			http.get("https://api.aladhan.com/v1/timings/*", async ({ request }) => {
				const method = new URL(request.url).searchParams.get("method")
				if (method === "5") {
					slowRequestStarted = true
					await delay(150)
				}
				const fajr = method === "3" ? "03:03" : "05:05"
				return HttpResponse.json({
					data: {
						timings: {
							Fajr: fajr,
							Sunrise: "06:00",
							Dhuhr: "12:00",
							Asr: "15:00",
							Maghrib: "18:00",
							Isha: "19:00",
						},
					},
				})
			}),
		)
		const { result } = renderHook(() => usePrayerContext(), { wrapper })
		await waitFor(() => expect(result.current.prayerTimesStatus).toBe("fresh"))

		act(() => {
			result.current.updatePrayerSettings({
				...result.current.prayerSettings,
				method: 5,
			})
		})
		await waitFor(() => expect(slowRequestStarted).toBe(true))
		act(() => {
			result.current.updatePrayerSettings({
				...result.current.prayerSettings,
				method: 3,
			})
		})

		await waitFor(() => expect(result.current.prayerTimes.fajr).toBe("03:03"))
		await delay(200)
		expect(result.current.prayerTimes.fajr).toBe("03:03")
	})

	it("calculates current and next prayer at deterministic boundaries", () => {
		expect(
			getCurrentAndNextPrayerForTime(
				defaultPrayerTimes,
				new Date("2024-01-15T03:30:00"),
			),
		).toEqual({ currentPrayer: "Isya", nextPrayer: "Subuh" })

		expect(
			getCurrentAndNextPrayerForTime(
				defaultPrayerTimes,
				new Date("2024-01-15T04:30:00"),
			),
		).toEqual({ currentPrayer: "Subuh", nextPrayer: "Syuruq" })

		expect(
			getCurrentAndNextPrayerForTime(
				defaultPrayerTimes,
				new Date("2024-01-15T12:30:00"),
			),
		).toEqual({ currentPrayer: "Dzuhur", nextPrayer: "Ashar" })
	})
})
