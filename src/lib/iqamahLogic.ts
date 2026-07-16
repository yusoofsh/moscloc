import {
	defaultPrayerSettings,
	type IqamahIntervals,
	type PrayerTimes,
} from "./prayerDomain"
import {
	addZonedCalendarDays,
	formatZonedClock,
	getZonedDateParts,
	prayerTimeEpochForDate,
} from "./zonedTime"

export type IqamahPrayerKey = keyof IqamahIntervals

type PrayerScheduleItem = {
	key: IqamahPrayerKey
	name: string
	time: string
	adhanEpochMs: number
	iqamahEpochMs: number
	iqamahTime: string
	iqamahIntervalSeconds: number
}

export type IqamahCountdownState =
	| { status: "inactive" }
	| {
			status: "countdown" | "iqamah"
			prayerKey: IqamahPrayerKey
			prayerName: string
			adhanTime: string
			iqamahTime: string
			iqamahIntervalSeconds: number
			timeLeftSeconds: number
	  }

export type IqamahRedirectState =
	| { status: "inactive" }
	| {
			status: "prompt"
			countdownSeconds: number
			prayerKey: IqamahPrayerKey
			prayerName: string
			deadlineEpochMs: number
	  }

export interface IqamahRedirectEvent {
	id: string
	prayerKey: IqamahPrayerKey
	prayerName: string
	promptStartsAtEpochMs: number
	deadlineEpochMs: number
}

const prayerLabels: Record<IqamahPrayerKey, string> = {
	fajr: "Subuh",
	dhuhr: "Dzuhur",
	asr: "Ashar",
	maghrib: "Maghrib",
	isha: "Isya",
}

const prayerAliases: Record<string, IqamahPrayerKey> = {
	subuh: "fajr",
	fajr: "fajr",
	dzuhur: "dhuhr",
	dhuhr: "dhuhr",
	ashar: "asr",
	asr: "asr",
	maghrib: "maghrib",
	isya: "isha",
	isha: "isha",
}

function buildIqamahSchedule(
	prayerTimes: PrayerTimes,
	iqamahIntervals: IqamahIntervals,
	now: Date,
	timeZone: string,
	dayOffset = 0,
): PrayerScheduleItem[] {
	const currentDate = getZonedDateParts(now, timeZone)
	const date = addZonedCalendarDays(currentDate, dayOffset)
	const items: Array<{ key: IqamahPrayerKey; time: string }> = [
		{ key: "fajr", time: prayerTimes.fajr },
		{ key: "dhuhr", time: prayerTimes.dhuhr },
		{ key: "asr", time: prayerTimes.asr },
		{ key: "maghrib", time: prayerTimes.maghrib },
		{ key: "isha", time: prayerTimes.isha },
	]

	return items.map((item) => {
		const adhanEpochMs = prayerTimeEpochForDate(item.time, date, timeZone)
		const iqamahIntervalSeconds = iqamahIntervals[item.key] * 60
		const iqamahEpochMs = adhanEpochMs + iqamahIntervalSeconds * 1000
		return {
			key: item.key,
			name: prayerLabels[item.key],
			time: item.time,
			adhanEpochMs,
			iqamahEpochMs,
			iqamahTime: formatZonedClock(new Date(iqamahEpochMs), timeZone),
			iqamahIntervalSeconds,
		}
	})
}

function normalizePrayerKey(prayerName: string) {
	return prayerAliases[prayerName.trim().toLowerCase()]
}

function toCountdownState(
	item: PrayerScheduleItem,
	nowEpochMs: number,
): IqamahCountdownState {
	const timeLeftSeconds = Math.max(
		0,
		Math.ceil((item.iqamahEpochMs - nowEpochMs) / 1000),
	)
	return {
		status: timeLeftSeconds === 0 ? "iqamah" : "countdown",
		prayerKey: item.key,
		prayerName: item.name,
		adhanTime: item.time,
		iqamahTime: item.iqamahTime,
		iqamahIntervalSeconds: item.iqamahIntervalSeconds,
		timeLeftSeconds,
	}
}

export function getIqamahCountdownState({
	prayerTimes,
	iqamahIntervals,
	now = new Date(),
	prayerName,
	timeZone = defaultPrayerSettings.timezonestring,
}: {
	prayerTimes: PrayerTimes
	iqamahIntervals: IqamahIntervals
	now?: Date
	prayerName?: string
	timeZone?: string
}): IqamahCountdownState {
	const schedule = buildIqamahSchedule(
		prayerTimes,
		iqamahIntervals,
		now,
		timeZone,
	)
	const nowEpochMs = now.getTime()

	if (prayerName) {
		const prayerKey = normalizePrayerKey(prayerName)
		const item = schedule.find((prayer) => prayer.key === prayerKey)
		if (
			!item ||
			nowEpochMs < item.adhanEpochMs ||
			nowEpochMs > item.iqamahEpochMs
		) {
			return { status: "inactive" }
		}
		return toCountdownState(item, nowEpochMs)
	}

	const activePrayer = schedule.find(
		(prayer) =>
			nowEpochMs >= prayer.adhanEpochMs && nowEpochMs <= prayer.iqamahEpochMs,
	)
	return activePrayer
		? toCountdownState(activePrayer, nowEpochMs)
		: { status: "inactive" }
}

export function getNextIqamahRedirectEvent({
	prayerTimes,
	iqamahIntervals,
	now = new Date(),
	redirectDelaySeconds,
	timeZone = defaultPrayerSettings.timezonestring,
}: {
	prayerTimes: PrayerTimes
	iqamahIntervals: IqamahIntervals
	now?: Date
	redirectDelaySeconds: number
	timeZone?: string
}): IqamahRedirectEvent {
	const schedule = [
		...buildIqamahSchedule(prayerTimes, iqamahIntervals, now, timeZone),
		...buildIqamahSchedule(prayerTimes, iqamahIntervals, now, timeZone, 1),
	]
	const prayer = schedule.find((item) => item.iqamahEpochMs > now.getTime())
	if (!prayer) {
		throw new Error("Unable to calculate the next iqamah event")
	}
	return {
		id: `${prayer.key}:${prayer.iqamahEpochMs}`,
		prayerKey: prayer.key,
		prayerName: prayer.name,
		promptStartsAtEpochMs:
			prayer.iqamahEpochMs - Math.max(0, redirectDelaySeconds) * 1000,
		deadlineEpochMs: prayer.iqamahEpochMs,
	}
}

export function getIqamahRedirectState({
	prayerTimes,
	iqamahIntervals,
	now = new Date(),
	redirectDelaySeconds,
	timeZone = defaultPrayerSettings.timezonestring,
}: {
	prayerTimes: PrayerTimes
	iqamahIntervals: IqamahIntervals
	now?: Date
	redirectDelaySeconds: number
	timeZone?: string
}): IqamahRedirectState {
	const event = getNextIqamahRedirectEvent({
		prayerTimes,
		iqamahIntervals,
		now,
		redirectDelaySeconds,
		timeZone,
	})
	if (now.getTime() < event.promptStartsAtEpochMs) return { status: "inactive" }
	return {
		status: "prompt",
		countdownSeconds: Math.ceil((event.deadlineEpochMs - now.getTime()) / 1000),
		prayerKey: event.prayerKey,
		prayerName: event.prayerName,
		deadlineEpochMs: event.deadlineEpochMs,
	}
}
