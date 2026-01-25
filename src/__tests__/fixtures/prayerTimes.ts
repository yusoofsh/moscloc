import type {
	Event,
	IqamahIntervals,
	PrayerSettings,
	Verse,
} from "~/contexts/PrayerContext"

export interface PrayerTimes {
	fajr: string
	sunrise: string
	dhuhr: string
	asr: string
	maghrib: string
	isha: string
}

export interface MosqueInfo {
	name: string
	address: string
	contact: string
	latitude: number
	longitude: number
}

export const mockPrayerTimes: PrayerTimes = {
	fajr: "04:26",
	sunrise: "05:50",
	dhuhr: "12:03",
	asr: "15:03",
	maghrib: "17:58",
	isha: "18:59",
}

export const mockPrayerSettings: PrayerSettings = {
	method: 20,
	shafaq: "general",
	tune: "10,10,-1,1,2,3,3,2,0",
	school: 0,
	midnightMode: 0,
	timezonestring: "Asia/Jakarta",
}

export const mockIqamahIntervals: IqamahIntervals = {
	fajr: 15,
	dhuhr: 10,
	asr: 10,
	maghrib: 5,
	isha: 10,
}

export const mockMosqueInfo: MosqueInfo = {
	name: "Masjid Test",
	address: "Jl. Test No. 1, Malang",
	contact: "Tel: +62 341 123456",
	latitude: -8.0679373,
	longitude: 112.5988417,
}

export const mockEvents: Event[] = [
	{
		id: "1",
		title: "Kajian Rutin",
		date: "2024-01-20",
		time: "19:00",
		location: "Masjid Utama",
		image: "",
		description: "Kajian mingguan tentang fiqih",
	},
]

export const mockVerses: Verse[] = [
	{
		id: "1",
		arabic: "وَأَقِيمُوا الصَّلَاةَ وَآتُوا الزَّكَاةَ",
		translation: "Dan dirikanlah shalat, tunaikanlah zakat",
		reference: "Al-Baqarah 2:43",
	},
]
