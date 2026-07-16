import type { PrayerTimes } from "./prayerDomain"

export interface ZonedDateParts {
	year: number
	month: number
	day: number
	hour: number
	minute: number
	second: number
}

export function getZonedDateParts(now: Date, timeZone: string): ZonedDateParts {
	const parts = new Intl.DateTimeFormat("en-CA", {
		timeZone,
		year: "numeric",
		month: "2-digit",
		day: "2-digit",
		hour: "2-digit",
		minute: "2-digit",
		second: "2-digit",
		hourCycle: "h23",
	}).formatToParts(now)
	const get = (type: Intl.DateTimeFormatPartTypes) =>
		Number(parts.find((part) => part.type === type)?.value)
	return {
		year: get("year"),
		month: get("month"),
		day: get("day"),
		hour: get("hour"),
		minute: get("minute"),
		second: get("second"),
	}
}

export function formatApiDate(now: Date, timeZone: string) {
	const { year, month, day } = getZonedDateParts(now, timeZone)
	return `${day.toString().padStart(2, "0")}-${month
		.toString()
		.padStart(2, "0")}-${year}`
}

export const formatZonedClock = (now: Date, timeZone: string) => {
	const parts = new Intl.DateTimeFormat("en-GB", {
		timeZone,
		hour: "2-digit",
		minute: "2-digit",
		hourCycle: "h23",
	}).formatToParts(now)
	const hour = parts.find((part) => part.type === "hour")?.value ?? "00"
	const minute = parts.find((part) => part.type === "minute")?.value ?? "00"
	return `${hour}:${minute}`
}

export const formatZonedLongDate = (now: Date, timeZone: string) =>
	new Intl.DateTimeFormat("id-ID", {
		timeZone,
		weekday: "long",
		day: "2-digit",
		month: "long",
		year: "numeric",
	}).format(now)

function partsAsUtc(parts: ZonedDateParts) {
	return Date.UTC(
		parts.year,
		parts.month - 1,
		parts.day,
		parts.hour,
		parts.minute,
		parts.second,
	)
}

export function zonedDateTimeToEpoch(parts: ZonedDateParts, timeZone: string) {
	let epoch = partsAsUtc(parts)
	for (let iteration = 0; iteration < 4; iteration += 1) {
		const difference =
			partsAsUtc(parts) -
			partsAsUtc(getZonedDateParts(new Date(epoch), timeZone))
		if (difference === 0) break
		epoch += difference
	}
	return epoch
}

export function addZonedCalendarDays(
	parts: Pick<ZonedDateParts, "year" | "month" | "day">,
	days: number,
) {
	const date = new Date(Date.UTC(parts.year, parts.month - 1, parts.day + days))
	return {
		year: date.getUTCFullYear(),
		month: date.getUTCMonth() + 1,
		day: date.getUTCDate(),
	}
}

export function prayerTimeEpochForDate(
	time: string,
	date: Pick<ZonedDateParts, "year" | "month" | "day">,
	timeZone: string,
) {
	const [hour, minute] = time.split(":").map(Number)
	return zonedDateTimeToEpoch({ ...date, hour, minute, second: 0 }, timeZone)
}

export function getPrayerCountdownSeconds(
	prayerTime: string,
	now: Date,
	timeZone: string,
) {
	const currentDate = getZonedDateParts(now, timeZone)
	let target = prayerTimeEpochForDate(prayerTime, currentDate, timeZone)
	if (target <= now.getTime()) {
		target = prayerTimeEpochForDate(
			prayerTime,
			addZonedCalendarDays(currentDate, 1),
			timeZone,
		)
	}
	return Math.max(0, Math.floor((target - now.getTime()) / 1000))
}

export function millisecondsUntilNextZonedMidnight(
	now: Date,
	timeZone: string,
) {
	const currentDate = getZonedDateParts(now, timeZone)
	const tomorrow = addZonedCalendarDays(currentDate, 1)
	const midnight = zonedDateTimeToEpoch(
		{ ...tomorrow, hour: 0, minute: 0, second: 0 },
		timeZone,
	)
	return Math.max(1, midnight - now.getTime())
}

export function getCurrentAndNextPrayerForTime(
	times: PrayerTimes,
	now: Date,
	timeZone: string,
) {
	const parts = getZonedDateParts(now, timeZone)
	const currentMinutes = parts.hour * 60 + parts.minute
	const schedule = [
		{ name: "Subuh", time: times.fajr },
		{ name: "Syuruq", time: times.sunrise },
		{ name: "Dzuhur", time: times.dhuhr },
		{ name: "Ashar", time: times.asr },
		{ name: "Maghrib", time: times.maghrib },
		{ name: "Isya", time: times.isha },
	].map((prayer) => {
		const [hours, minutes] = prayer.time.split(":").map(Number)
		return { ...prayer, minutes: hours * 60 + minutes }
	})
	for (let index = 0; index < schedule.length - 1; index += 1) {
		if (
			currentMinutes >= schedule[index].minutes &&
			currentMinutes < schedule[index + 1].minutes
		) {
			return {
				currentPrayer: schedule[index].name,
				nextPrayer: schedule[index + 1].name,
			}
		}
	}
	return { currentPrayer: "Isya", nextPrayer: "Subuh" }
}
