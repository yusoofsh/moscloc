export interface MosqueInfo {
	name: string
	address: string
	contact: string
	latitude: number
	longitude: number
}

export interface Event {
	id: string
	title: string
	date: string
	time: string
	location: string
	image: string
	description: string
}

export interface Verse {
	id: string
	arabic: string
	translation: string
	reference: string
}

export interface PrayerSettings {
	method: number
	shafaq: string
	tune: string
	school: number
	midnightMode: number
	timezonestring: string
}

export interface IqamahIntervals {
	fajr: number
	dhuhr: number
	asr: number
	maghrib: number
	isha: number
}

export interface PrayerTimes {
	fajr: string
	sunrise: string
	dhuhr: string
	asr: string
	maghrib: string
	isha: string
}

export const defaultMosqueInfo: MosqueInfo = {
	name: "Masjid Darul Arqom",
	address: "Jalan Kramatan, Kecamatan Pakisaji, Kabupaten Malang",
	contact: "Tel: +62 21 123456",
	latitude: -8.0679373,
	longitude: 112.5988417,
}

export const defaultPrayerTimes: PrayerTimes = {
	fajr: "04:26",
	sunrise: "05:50",
	dhuhr: "12:03",
	asr: "15:03",
	maghrib: "17:58",
	isha: "18:59",
}

export const defaultPrayerSettings: PrayerSettings = {
	method: 20,
	shafaq: "general",
	tune: "10,10,-1,1,2,3,3,2,0",
	school: 0,
	midnightMode: 0,
	timezonestring: "Asia/Jakarta",
}

export const defaultIqamahIntervals: IqamahIntervals = {
	fajr: 15,
	dhuhr: 10,
	asr: 10,
	maghrib: 5,
	isha: 10,
}

export const defaultAnnouncements = [
	"Shalat Tarawih berjamaah setiap malam selama bulan Ramadhan",
]

export const defaultEvents: Event[] = []

export const defaultVerses: Verse[] = [
	{
		id: "1",
		arabic: "وَأَقِيمُوا الصَّلَاةَ وَآتُوا الزَّكَاةَ وَارْكَعُوا مَعَ الرَّاكِعِينَ",
		translation:
			"Dan dirikanlah shalat, tunaikanlah zakat dan ruku'lah beserta orang-orang yang ruku'.",
		reference: "Al-Baqarah 2:43",
	},
	{
		id: "2",
		arabic: "يَا أَيُّهَا الَّذِينَ آمَنُوا اسْتَعِينُوا بِالصَّبْرِ وَالصَّلَاةِ",
		translation:
			"Hai orang-orang yang beriman, jadikanlah sabar dan shalat sebagai penolongmu.",
		reference: "Al-Baqarah 2:153",
	},
	{
		id: "3",
		arabic: "وَمَا خَلَقْتُ الْجِنَّ وَالْإِنسَ إِلَّا لِيَعْبُدُونِ",
		translation:
			"Dan Aku tidak menciptakan jin dan manusia melainkan supaya mereka menyembah-Ku.",
		reference: "Adh-Dhariyat 51:56",
	},
	{
		id: "4",
		arabic: "وَبَشِّرِ الصَّابِرِينَ",
		translation: "Dan berikanlah berita gembira kepada orang-orang yang sabar.",
		reference: "Al-Baqarah 2:155",
	},
	{
		id: "5",
		arabic: "إِنَّ مَعَ الْعُسْرِ يُسْرًا",
		translation: "Sesungguhnya sesudah kesulitan itu ada kemudahan.",
		reference: "Ash-Sharh 94:6",
	},
]

function isRecord(value: unknown): value is Record<string, unknown> {
	return typeof value === "object" && value !== null && !Array.isArray(value)
}

function finiteNumber(
	value: unknown,
	fallback: number,
	min: number,
	max: number,
) {
	return typeof value === "number" &&
		Number.isFinite(value) &&
		value >= min &&
		value <= max
		? value
		: fallback
}

function integerNumber(
	value: unknown,
	fallback: number,
	min: number,
	max: number,
) {
	return typeof value === "number" &&
		Number.isInteger(value) &&
		value >= min &&
		value <= max
		? value
		: fallback
}

function stringValue(value: unknown, fallback: string, maxLength = 5000) {
	return typeof value === "string" && value.length <= maxLength
		? value
		: fallback
}

export function isValidTimeZone(value: unknown): value is string {
	if (typeof value !== "string" || value.length > 100) return false
	try {
		new Intl.DateTimeFormat("en", { timeZone: value }).format()
		return true
	} catch {
		return false
	}
}

function normalizeTime(value: unknown) {
	if (typeof value !== "string") return null
	const match = value.match(/^(\d{1,2}):(\d{2})/)
	if (!match) return null
	const hours = Number(match[1])
	const minutes = Number(match[2])
	if (hours > 23 || minutes > 59) return null
	return `${hours.toString().padStart(2, "0")}:${minutes
		.toString()
		.padStart(2, "0")}`
}

export function normalizePrayerTimes(value: unknown): PrayerTimes | null {
	if (!isRecord(value)) return null
	const normalized = {
		fajr: normalizeTime(value.fajr ?? value.Fajr),
		sunrise: normalizeTime(value.sunrise ?? value.Sunrise),
		dhuhr: normalizeTime(value.dhuhr ?? value.Dhuhr),
		asr: normalizeTime(value.asr ?? value.Asr),
		maghrib: normalizeTime(value.maghrib ?? value.Maghrib),
		isha: normalizeTime(value.isha ?? value.Isha),
	}
	return Object.values(normalized).every((time) => time !== null)
		? (normalized as PrayerTimes)
		: null
}

export function normalizePrayerSettings(value: unknown): PrayerSettings {
	if (!isRecord(value)) return { ...defaultPrayerSettings }
	const legacyTimeZone = value.timezonestring ?? value.timezone
	return {
		method: integerNumber(value.method, defaultPrayerSettings.method, 0, 99),
		shafaq: stringValue(value.shafaq, defaultPrayerSettings.shafaq, 50),
		tune: stringValue(value.tune, defaultPrayerSettings.tune, 200),
		school: integerNumber(value.school, defaultPrayerSettings.school, 0, 1),
		midnightMode: integerNumber(
			value.midnightMode,
			defaultPrayerSettings.midnightMode,
			0,
			1,
		),
		timezonestring: isValidTimeZone(legacyTimeZone)
			? legacyTimeZone
			: defaultPrayerSettings.timezonestring,
	}
}

export function normalizeMosqueInfo(value: unknown): MosqueInfo {
	if (!isRecord(value)) return { ...defaultMosqueInfo }
	return {
		name: stringValue(value.name, defaultMosqueInfo.name, 200),
		address: stringValue(value.address, defaultMosqueInfo.address, 500),
		contact: stringValue(value.contact, defaultMosqueInfo.contact, 200),
		latitude: finiteNumber(value.latitude, defaultMosqueInfo.latitude, -90, 90),
		longitude: finiteNumber(
			value.longitude,
			defaultMosqueInfo.longitude,
			-180,
			180,
		),
	}
}

export function normalizeIqamahIntervals(value: unknown): IqamahIntervals {
	const source = isRecord(value) ? value : {}
	return {
		fajr: integerNumber(source.fajr, defaultIqamahIntervals.fajr, 1, 60),
		dhuhr: integerNumber(source.dhuhr, defaultIqamahIntervals.dhuhr, 1, 60),
		asr: integerNumber(source.asr, defaultIqamahIntervals.asr, 1, 60),
		maghrib: integerNumber(
			source.maghrib,
			defaultIqamahIntervals.maghrib,
			1,
			60,
		),
		isha: integerNumber(source.isha, defaultIqamahIntervals.isha, 1, 60),
	}
}

function validStringArray(value: unknown): value is string[] {
	return (
		Array.isArray(value) &&
		value.length <= 500 &&
		value.every((item) => typeof item === "string" && item.length <= 5000)
	)
}

function validObjectArray<T>(
	value: unknown,
	keys: readonly string[],
): value is T[] {
	return (
		Array.isArray(value) &&
		value.length <= 500 &&
		value.every(
			(item) =>
				isRecord(item) &&
				keys.every(
					(key) =>
						typeof item[key] === "string" &&
						(item[key] as string).length <= 5000,
				),
		)
	)
}

export const normalizeAnnouncements = (value: unknown) =>
	validStringArray(value) ? value : [...defaultAnnouncements]

export const normalizeEvents = (value: unknown) =>
	validObjectArray<Event>(value, [
		"id",
		"title",
		"date",
		"time",
		"location",
		"image",
		"description",
	])
		? value
		: [...defaultEvents]

export const normalizeVerses = (value: unknown) =>
	validObjectArray<Verse>(value, ["id", "arabic", "translation", "reference"])
		? value
		: [...defaultVerses]
