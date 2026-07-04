import type { IqamahIntervals, MosqueInfo } from "~/contexts/PrayerContext"

type ValidationResult<T> =
	| { ok: true; value: T }
	| { ok: false; errors: string[] }

const iqamahLabels: Record<keyof IqamahIntervals, string> = {
	fajr: "Subuh",
	dhuhr: "Dzuhur",
	asr: "Ashar",
	maghrib: "Maghrib",
	isha: "Isya",
}

export function normalizeAnnouncementInput(input: string) {
	const trimmed = input.trim()
	return trimmed.length > 0 ? trimmed : null
}

export function validateMosqueInfo(
	info: MosqueInfo,
): ValidationResult<MosqueInfo> {
	const errors: string[] = []

	if (!Number.isFinite(info.latitude)) {
		errors.push("Lintang harus berupa angka yang valid.")
	}

	if (!Number.isFinite(info.longitude)) {
		errors.push("Bujur harus berupa angka yang valid.")
	}

	if (errors.length > 0) {
		return { ok: false, errors }
	}

	return { ok: true, value: info }
}

export function validateIqamahIntervals(
	intervals: IqamahIntervals,
): ValidationResult<IqamahIntervals> {
	const errors = Object.entries(intervals).flatMap(([key, value]) => {
		if (Number.isInteger(value) && value >= 1 && value <= 60) {
			return []
		}

		return [
			`${iqamahLabels[key as keyof IqamahIntervals]} harus berupa menit bulat antara 1 dan 60.`,
		]
	})

	if (errors.length > 0) {
		return { ok: false, errors }
	}

	return { ok: true, value: intervals }
}
