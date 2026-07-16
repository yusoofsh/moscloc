import {
	defaultPrayerTimes,
	normalizeAnnouncements,
	normalizeEvents,
	normalizeIqamahIntervals,
	normalizeMosqueInfo,
	normalizePrayerSettings,
	normalizePrayerTimes,
	normalizeVerses,
	type PrayerTimes,
} from "./prayerDomain"

export interface PrayerTimesSnapshot {
	times: PrayerTimes
	updatedAt: string
}

export interface StorageLike {
	getItem(key: string): string | null
	setItem(key: string, value: string): unknown
}

export type PrayerStorageKey =
	| "mosqueInfo"
	| "announcements"
	| "events"
	| "verses"
	| "prayerSettings"
	| "iqamahIntervals"
	| "prayerTimesSnapshot"

function read(storage: StorageLike | undefined, key: PrayerStorageKey) {
	if (!storage) return undefined
	try {
		const value = storage.getItem(key)
		return value === null ? undefined : JSON.parse(value)
	} catch {
		return undefined
	}
}

function normalizeSnapshot(value: unknown): PrayerTimesSnapshot | null {
	if (typeof value !== "object" || value === null) return null
	const record = value as Record<string, unknown>
	const times = normalizePrayerTimes(record.times)
	if (
		!times ||
		typeof record.updatedAt !== "string" ||
		Number.isNaN(Date.parse(record.updatedAt))
	) {
		return null
	}
	return { times, updatedAt: record.updatedAt }
}

export function getBrowserStorage(): StorageLike | undefined {
	try {
		return typeof localStorage === "undefined" ? undefined : localStorage
	} catch {
		return undefined
	}
}

export function hydratePrayerStorage(storage = getBrowserStorage()) {
	return {
		mosqueInfo: normalizeMosqueInfo(read(storage, "mosqueInfo")),
		announcements: normalizeAnnouncements(read(storage, "announcements")),
		events: normalizeEvents(read(storage, "events")),
		verses: normalizeVerses(read(storage, "verses")),
		prayerSettings: normalizePrayerSettings(read(storage, "prayerSettings")),
		iqamahIntervals: normalizeIqamahIntervals(read(storage, "iqamahIntervals")),
		prayerTimesSnapshot: normalizeSnapshot(
			read(storage, "prayerTimesSnapshot"),
		),
	}
}

export function persistPrayerStorageValue(
	storage: StorageLike | undefined,
	key: PrayerStorageKey,
	value: unknown,
) {
	try {
		storage?.setItem(key, JSON.stringify(value))
	} catch {
		// Storage can be disabled, full, or unavailable in privacy contexts.
	}
}

export const fallbackPrayerTimes = defaultPrayerTimes
