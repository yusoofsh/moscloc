import { act, renderHook, waitFor } from "@testing-library/react"
import type { ReactNode } from "react"
import { beforeEach, describe, expect, it } from "vitest"
import { PrayerProvider, usePrayerContext } from "./PrayerContext"

const wrapper = ({ children }: { children: ReactNode }) => (
	<PrayerProvider>{children}</PrayerProvider>
)

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
		expect(localStorage.setItem).toHaveBeenCalled()
	})

	it("updates announcements and persists to localStorage", () => {
		const { result } = renderHook(() => usePrayerContext(), { wrapper })

		const newAnnouncements = ["Announcement 1", "Announcement 2"]

		act(() => {
			result.current.updateAnnouncements(newAnnouncements)
		})

		expect(result.current.announcements).toEqual(newAnnouncements)
		expect(localStorage.setItem).toHaveBeenCalled()
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
		expect(localStorage.setItem).toHaveBeenCalled()
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
		expect(localStorage.setItem).toHaveBeenCalled()
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
		expect(localStorage.setItem).toHaveBeenCalled()
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
		expect(localStorage.setItem).toHaveBeenCalled()
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
})
