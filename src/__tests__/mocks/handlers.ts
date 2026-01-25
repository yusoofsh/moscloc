import { HttpResponse, http } from "msw"

const mockPrayerTimesResponse = {
	code: 200,
	status: "OK",
	data: {
		timings: {
			Fajr: "04:26",
			Sunrise: "05:50",
			Dhuhr: "12:03",
			Asr: "15:03",
			Maghrib: "17:58",
			Isha: "18:59",
		},
	},
}

const mockHijriDateResponse = {
	code: 200,
	status: "OK",
	data: {
		hijri: {
			day: "15",
			month: { number: 7, en: "Rajab" },
			year: "1446",
		},
	},
}

export const handlers = [
	http.get("https://api.aladhan.com/v1/timings/*", () => {
		return HttpResponse.json(mockPrayerTimesResponse)
	}),
	http.get("https://api.aladhan.com/v1/gToH/*", () => {
		return HttpResponse.json(mockHijriDateResponse)
	}),
]
