interface AladhanResponse {
	data: {
		timings: {
			Imsak: string;
			Fajr: string;
			Sunrise: string;
			Dhuhr: string;
			Asr: string;
			Maghrib: string;
			Isha: string;
		};
	};
}

export const getPrayerTimes = async (latitude: number, longitude: number) => {
	try {
		const response = await fetch(
			`https://api.aladhan.com/v1/timings?latitude=${latitude}&longitude=${longitude}&method=20&timezonestring=Asia%2FJakarta`,
		);

		if (!response.ok) {
			throw new Error("Failed to fetch prayer times");
		}

		const data: AladhanResponse = await response.json();
		const timings = data.data.timings;

		return {
			imsak: formatTime(timings.Imsak),
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
		return {
			imsak: "04:16",
			fajr: "04:26",
			sunrise: "05:50",
			dhuhr: "12:03",
			asr: "15:03",
			maghrib: "17:58",
			isha: "18:59",
		};
	}
};

const formatTime = (time: string): string => {
	// Convert from 24-hour format if needed
	const [hours, minutes] = time.split(":");
	return `${hours.padStart(2, "0")}:${minutes.padStart(2, "0")}`;
};
