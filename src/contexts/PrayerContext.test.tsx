import { act, renderHook, waitFor } from "@testing-library/react"
import type { ReactNode } from "react"
import { beforeEach, describe, expect, it } from "vitest"
import {
	defaultPrayerTimes,
	getCurrentAndNextPrayerForTime,
	PrayerProvider,
	usePrayerContext,
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
