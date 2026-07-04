import type { IqamahIntervals, PrayerTimes } from "~/contexts/PrayerContext"

export type IqamahPrayerKey = keyof IqamahIntervals

type PrayerScheduleItem = {
	key: IqamahPrayerKey
	name: string
	time: string
	adhanSeconds: number
	iqamahSeconds: number
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

function timeToSeconds(time: string) {
	const [hours, minutes] = time.split(":").map(Number)
	return hours * 60 * 60 + minutes * 60
}

function secondsToTime(seconds: number) {
	const hours = Math.floor(seconds / 3600)
	const minutes = Math.floor((seconds % 3600) / 60)
	return `${hours.toString().padStart(2, "0")}:${minutes
		.toString()
		.padStart(2, "0")}`
}

function secondsSinceMidnight(now: Date) {
	return now.getHours() * 60 * 60 + now.getMinutes() * 60 + now.getSeconds()
}

function buildIqamahSchedule(
	prayerTimes: PrayerTimes,
	iqamahIntervals: IqamahIntervals,
): PrayerScheduleItem[] {
	const items: Array<{ key: IqamahPrayerKey; time: string }> = [
		{ key: "fajr", time: prayerTimes.fajr },
		{ key: "dhuhr", time: prayerTimes.dhuhr },
		{ key: "asr", time: prayerTimes.asr },
		{ key: "maghrib", time: prayerTimes.maghrib },
		{ key: "isha", time: prayerTimes.isha },
	]

	return items.map((item) => {
		const adhanSeconds = timeToSeconds(item.time)
		const iqamahIntervalSeconds = iqamahIntervals[item.key] * 60
		const iqamahSeconds = adhanSeconds + iqamahIntervalSeconds

		return {
			key: item.key,
			name: prayerLabels[item.key],
			time: item.time,
			adhanSeconds,
			iqamahSeconds,
			iqamahTime: secondsToTime(iqamahSeconds),
			iqamahIntervalSeconds,
		}
	})
}

function normalizePrayerKey(prayerName: string) {
	return prayerAliases[prayerName.trim().toLowerCase()]
}

function toCountdownState(
	item: PrayerScheduleItem,
	currentSeconds: number,
): IqamahCountdownState {
	const timeLeftSeconds = Math.max(0, item.iqamahSeconds - currentSeconds)

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
}: {
	prayerTimes: PrayerTimes
	iqamahIntervals: IqamahIntervals
	now?: Date
	prayerName?: string
}): IqamahCountdownState {
	const currentSeconds = secondsSinceMidnight(now)
	const schedule = buildIqamahSchedule(prayerTimes, iqamahIntervals)

	if (prayerName) {
		const prayerKey = normalizePrayerKey(prayerName)
		const item = schedule.find((prayer) => prayer.key === prayerKey)

		if (!item) {
			return { status: "inactive" }
		}

		if (currentSeconds > item.iqamahSeconds) {
			return { status: "inactive" }
		}

		return toCountdownState(item, currentSeconds)
	}

	const activePrayer = schedule.find(
		(prayer) =>
			currentSeconds >= prayer.adhanSeconds &&
			currentSeconds <= prayer.iqamahSeconds,
	)

	return activePrayer
		? toCountdownState(activePrayer, currentSeconds)
		: { status: "inactive" }
}

export function getIqamahRedirectState({
	prayerTimes,
	iqamahIntervals,
	now = new Date(),
	redirectDelaySeconds,
}: {
	prayerTimes: PrayerTimes
	iqamahIntervals: IqamahIntervals
	now?: Date
	redirectDelaySeconds: number
}): IqamahRedirectState {
	const currentSeconds = secondsSinceMidnight(now)
	const schedule = buildIqamahSchedule(prayerTimes, iqamahIntervals)

	for (const prayer of schedule) {
		const countdownSeconds = prayer.iqamahSeconds - currentSeconds

		if (countdownSeconds <= redirectDelaySeconds && countdownSeconds > 0) {
			return {
				status: "prompt",
				countdownSeconds,
				prayerKey: prayer.key,
				prayerName: prayer.name,
			}
		}
	}

	return { status: "inactive" }
}
