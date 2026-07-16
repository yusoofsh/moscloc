import { describe, expect, it } from "vitest"
import {
	defaultIqamahIntervals,
	defaultPrayerSettings,
	defaultPrayerTimes,
} from "./prayerDomain"
import {
	hydratePrayerStorage,
	persistPrayerStorageValue,
} from "./prayerStorage"

function createStorage(initial: Record<string, string> = {}) {
	const values = new Map(Object.entries(initial))

	return {
		getItem: (key: string) => values.get(key) ?? null,
		setItem: (key: string, value: string) => values.set(key, value),
	}
}

describe("prayerStorage", () => {
	it("hydrates every key independently when one value contains invalid JSON", () => {
		const storage = createStorage({
			mosqueInfo: "{not-json",
			announcements: JSON.stringify(["Pengumuman tersimpan"]),
			iqamahIntervals: JSON.stringify({ fajr: 20 }),
		})

		const state = hydratePrayerStorage(storage)

		expect(state.mosqueInfo.name).toBe("Masjid Darul Arqom")
		expect(state.announcements).toEqual(["Pengumuman tersimpan"])
		expect(state.iqamahIntervals).toEqual({
			...defaultIqamahIntervals,
			fajr: 20,
		})
	})

	it("migrates partial legacy prayer settings without losing defaults", () => {
		const storage = createStorage({
			prayerSettings: JSON.stringify({
				method: 5,
				timezone: "Pacific/Auckland",
			}),
		})

		expect(hydratePrayerStorage(storage).prayerSettings).toEqual({
			...defaultPrayerSettings,
			method: 5,
			timezonestring: "Pacific/Auckland",
		})
	})

	it("retains a validated last-successful prayer snapshot", () => {
		const storage = createStorage({
			prayerTimesSnapshot: JSON.stringify({
				times: defaultPrayerTimes,
				updatedAt: "2024-01-15T05:03:00.000Z",
			}),
		})

		expect(hydratePrayerStorage(storage).prayerTimesSnapshot).toEqual({
			times: defaultPrayerTimes,
			updatedAt: "2024-01-15T05:03:00.000Z",
		})
	})

	it("falls back when storage access throws and persistence never crashes callers", () => {
		const storage = {
			getItem: () => {
				throw new Error("storage unavailable")
			},
			setItem: () => {
				throw new Error("storage unavailable")
			},
		}

		expect(() => hydratePrayerStorage(storage)).not.toThrow()
		expect(hydratePrayerStorage(storage).prayerSettings).toEqual(
			defaultPrayerSettings,
		)
		expect(() =>
			persistPrayerStorageValue(
				storage,
				"prayerSettings",
				defaultPrayerSettings,
			),
		).not.toThrow()
	})
})
