import {
	defaultPrayerSettings,
	normalizePrayerSettings,
	normalizePrayerTimes,
	type PrayerSettings,
	type PrayerTimes,
} from "~/lib/prayerDomain"
import { formatApiDate } from "~/lib/zonedTime"

interface AladhanResponse {
	data?: { timings?: Record<string, unknown> }
}

interface PrayerRequestOptions {
	now?: Date
	signal?: AbortSignal
}

export const getPrayerTimes = async (
	latitude: number,
	longitude: number,
	settings: PrayerSettings = defaultPrayerSettings,
	options: PrayerRequestOptions = {},
): Promise<PrayerTimes> => {
	if (
		!Number.isFinite(latitude) ||
		latitude < -90 ||
		latitude > 90 ||
		!Number.isFinite(longitude) ||
		longitude < -180 ||
		longitude > 180
	) {
		throw new Error("Invalid mosque coordinates")
	}

	const config = normalizePrayerSettings(settings)
	const date = formatApiDate(options.now ?? new Date(), config.timezonestring)
	const params = new URLSearchParams({
		latitude: latitude.toString(),
		longitude: longitude.toString(),
		method: config.method.toString(),
		shafaq: config.shafaq,
		tune: config.tune,
		school: config.school.toString(),
		midnightMode: config.midnightMode.toString(),
		timezonestring: config.timezonestring,
	})
	const response = await fetch(
		`https://api.aladhan.com/v1/timings/${date}?${params.toString()}`,
		{ signal: options.signal },
	)

	if (!response.ok) {
		throw new Error("Failed to fetch prayer times")
	}

	const data = (await response.json()) as AladhanResponse
	const timings = normalizePrayerTimes(data.data?.timings)
	if (!timings) {
		throw new Error("Prayer times response was invalid")
	}

	return timings
}
