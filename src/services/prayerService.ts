import { defaultPrayerTimes } from "~/contexts/PrayerContext";

interface AladhanResponse {
	data: {
		timings: {
			Fajr: string;
			Sunrise: string;
			Dhuhr: string;
			Asr: string;
			Maghrib: string;
			Isha: string;
		};
	};
}

interface PrayerSettings {
	method: number;
	shafaq: string;
	tune: string;
	school: number;
	midnightMode: number;
	timezonestring: string;
}

export const getPrayerTimes = async (
	latitude: number,
	longitude: number,
	settings?: PrayerSettings,
) => {
	try {
		// Use provided settings or defaults
		const config = settings || {
			method: 20,
			shafaq: "general",
			tune: "10,10,-1,1,2,3,3,2,0",
			school: 0,
			midnightMode: 0,
			timezonestring: "Asia/Jakarta",
		};

		// Get current date for the API call
		const now = new Date();
		const dateStr = now.toISOString().split("T")[0]; // YYYY-MM-DD format

		// Build URL with all configurable parameters
		const params = new URLSearchParams({
			latitude: latitude.toString(),
			longitude: longitude.toString(),
			method: config.method.toString(),
			shafaq: config.shafaq,
			tune: config.tune,
			school: config.school.toString(),
			midnightMode: config.midnightMode.toString(),
			timezonestring: config.timezonestring,
		});

		const url = `https://api.aladhan.com/v1/timings/${dateStr}?${params.toString()}`;

		const response = await fetch(url);

		if (!response.ok) {
			throw new Error("Failed to fetch prayer times");
		}

		const data: AladhanResponse = await response.json();
		const timings = data.data.timings;

		return {
			fajr: formatTime(timings.Fajr),
			sunrise: formatTime(timings.Sunrise),
			dhuhr: formatTime(timings.Dhuhr),
			asr: formatTime(timings.Asr),
			maghrib: formatTime(timings.Maghrib),
			isha: formatTime(timings.Isha),
		};
	} catch (error) {
		console.error("Error fetching prayer times:", error);

		// Return default times if API fails
		return defaultPrayerTimes;
	}
};

const formatTime = (time: string): string => {
	// Convert from 24-hour format if needed
	const [hours, minutes] = time.split(":");
	return `${hours.padStart(2, "0")}:${minutes.padStart(2, "0")}`;
};
