import type {
	Event,
	IqamahIntervals,
	MosqueInfo,
	Verse,
} from "~/contexts/PrayerContext"

type ValidationResult<T> =
	| { ok: true; value: T }
	| { ok: false; errors: string[] }

type FieldValidationResult<T, K extends string> =
	| { ok: true; value: T }
	| { ok: false; errors: Partial<Record<K, string>> }

export const ADMIN_CONTENT_LIMITS = {
	mosqueName: 120,
	mosqueAddress: 300,
	mosqueContact: 120,
	announcement: 280,
	eventTitle: 120,
	eventSchedule: 80,
	eventLocation: 160,
	eventImage: 500,
	eventDescription: 1000,
	verseArabic: 1000,
	verseTranslation: 1500,
	verseReference: 120,
} as const

const iqamahLabels: Record<keyof IqamahIntervals, string> = {
	fajr: "Subuh",
	dhuhr: "Dzuhur",
	asr: "Ashar",
	maghrib: "Maghrib",
	isha: "Isya",
}

export function normalizeAnnouncementInput(input: string) {
	const trimmed = input.trim()
	return trimmed.length > 0 &&
		trimmed.length <= ADMIN_CONTENT_LIMITS.announcement
		? trimmed
		: null
}

export function validateMosqueInfo(
	info: MosqueInfo,
): ValidationResult<MosqueInfo> {
	const errors: string[] = []
	const name = info.name.trim()
	const address = info.address.trim()
	const contact = info.contact.trim()

	if (!name) errors.push("Nama masjid wajib diisi.")
	if (name.length > ADMIN_CONTENT_LIMITS.mosqueName) {
		errors.push("Nama masjid terlalu panjang.")
	}
	if (!address) errors.push("Alamat wajib diisi.")
	if (address.length > ADMIN_CONTENT_LIMITS.mosqueAddress) {
		errors.push("Alamat terlalu panjang.")
	}
	if (contact.length > ADMIN_CONTENT_LIMITS.mosqueContact) {
		errors.push("Informasi kontak terlalu panjang.")
	}

	if (!Number.isFinite(info.latitude)) {
		errors.push("Lintang harus berupa angka yang valid.")
	} else if (info.latitude < -90 || info.latitude > 90) {
		errors.push("Lintang harus berada di antara -90 dan 90.")
	}

	if (!Number.isFinite(info.longitude)) {
		errors.push("Bujur harus berupa angka yang valid.")
	} else if (info.longitude < -180 || info.longitude > 180) {
		errors.push("Bujur harus berada di antara -180 dan 180.")
	}

	if (errors.length > 0) {
		return { ok: false, errors }
	}

	return { ok: true, value: { ...info, name, address, contact } }
}

type EventDraft = Omit<Event, "id">
type EventField = keyof EventDraft

export function validateEvent(
	event: EventDraft,
): FieldValidationResult<EventDraft, EventField> {
	const value = Object.fromEntries(
		Object.entries(event).map(([key, fieldValue]) => [key, fieldValue.trim()]),
	) as EventDraft
	const errors: Partial<Record<EventField, string>> = {}

	if (!value.title) errors.title = "Judul acara wajib diisi."
	else if (value.title.length > ADMIN_CONTENT_LIMITS.eventTitle)
		errors.title = "Judul acara terlalu panjang."
	if (!value.date) errors.date = "Tanggal acara wajib diisi."
	else if (value.date.length > ADMIN_CONTENT_LIMITS.eventSchedule)
		errors.date = "Tanggal acara terlalu panjang."
	if (!value.time) errors.time = "Waktu acara wajib diisi."
	else if (value.time.length > ADMIN_CONTENT_LIMITS.eventSchedule)
		errors.time = "Waktu acara terlalu panjang."
	if (!value.location) errors.location = "Lokasi acara wajib diisi."
	else if (value.location.length > ADMIN_CONTENT_LIMITS.eventLocation)
		errors.location = "Lokasi acara terlalu panjang."
	if (value.image.length > ADMIN_CONTENT_LIMITS.eventImage) {
		errors.image = "URL gambar terlalu panjang."
	} else if (value.image) {
		try {
			if (new URL(value.image).protocol !== "https:") {
				errors.image = "URL gambar harus menggunakan HTTPS."
			}
		} catch {
			errors.image = "Masukkan URL gambar HTTPS yang valid."
		}
	}
	if (value.description.length > ADMIN_CONTENT_LIMITS.eventDescription)
		errors.description = "Deskripsi acara terlalu panjang."

	return Object.keys(errors).length > 0
		? { ok: false, errors }
		: { ok: true, value }
}

type VerseDraft = Omit<Verse, "id">
type VerseField = keyof VerseDraft

export function validateVerse(
	verse: VerseDraft,
): FieldValidationResult<VerseDraft, VerseField> {
	const value = Object.fromEntries(
		Object.entries(verse).map(([key, fieldValue]) => [key, fieldValue.trim()]),
	) as VerseDraft
	const errors: Partial<Record<VerseField, string>> = {}

	if (!value.arabic) errors.arabic = "Teks Arab wajib diisi."
	else if (value.arabic.length > ADMIN_CONTENT_LIMITS.verseArabic)
		errors.arabic = "Teks Arab terlalu panjang."
	if (!value.translation) errors.translation = "Terjemahan wajib diisi."
	else if (value.translation.length > ADMIN_CONTENT_LIMITS.verseTranslation)
		errors.translation = "Terjemahan terlalu panjang."
	if (!value.reference) errors.reference = "Referensi wajib diisi."
	else if (value.reference.length > ADMIN_CONTENT_LIMITS.verseReference)
		errors.reference = "Referensi terlalu panjang."

	return Object.keys(errors).length > 0
		? { ok: false, errors }
		: { ok: true, value }
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
