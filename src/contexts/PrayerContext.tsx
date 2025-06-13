import type React from "react";
import {
	createContext,
	type ReactNode,
	useCallback,
	useContext,
	useEffect,
	useRef,
	useState,
} from "react";
import { getPrayerTimes } from "../services/prayerService";

interface MosqueInfo {
	name: string;
	address: string;
	contact: string;
	latitude: number;
	longitude: number;
}

interface PrayerTimes {
	imsak: string;
	fajr: string;
	sunrise: string;
	dhuhr: string;
	asr: string;
	maghrib: string;
	isha: string;
}

interface PrayerContextType {
	mosqueInfo: MosqueInfo;
	prayerTimes: PrayerTimes;
	announcements: string[];
	currentPrayer: string | null;
	nextPrayer: string | null;
	updateMosqueInfo: (info: MosqueInfo) => void;
	updateAnnouncements: (announcements: string[]) => void;
}

const PrayerContext = createContext<PrayerContextType | undefined>(undefined);

const defaultMosqueInfo: MosqueInfo = {
	name: "Masjid Al-Hidayah",
	address: "Jl. Kemanggisan Raya No. 123, Jakarta Barat",
	contact: "Tel: +62 21 123456 | Website: www.masjid-alhidayah.org",
	latitude: -6.2088,
	longitude: 106.8456,
};

const defaultPrayerTimes: PrayerTimes = {
	imsak: "04:16",
	fajr: "04:26",
	sunrise: "05:50",
	dhuhr: "12:03",
	asr: "15:03",
	maghrib: "17:58",
	isha: "18:59",
};

export const PrayerProvider: React.FC<{ children: ReactNode }> = ({
	children,
}) => {
	const [mosqueInfo, setMosqueInfo] = useState<MosqueInfo>(defaultMosqueInfo);
	const [prayerTimes, setPrayerTimes] =
		useState<PrayerTimes>(defaultPrayerTimes);
	const prayerTimesRef = useRef<PrayerTimes>(defaultPrayerTimes);
	const [announcements, setAnnouncements] = useState<string[]>([
		"Pengajian rutin setiap Kamis malam ba'da Isya bersama Ustadz Ahmad",
		"Kerja bakti setiap Sabtu pagi pukul 07:00 WIB",
		"Pendaftaran kelas Tahfidz untuk anak-anak dibuka mulai hari ini",
		"Shalat Tarawih berjamaah setiap malam selama bulan Ramadhan",
	]);
	const [currentPrayer, setCurrentPrayer] = useState<string | null>(null);
	const [nextPrayer, setNextPrayer] = useState<string | null>(null);

	const getCurrentAndNextPrayer = useCallback((times: PrayerTimes) => {
		const now = new Date();
		const currentTime = now.getHours() * 60 + now.getMinutes();

		const prayerSchedule = [
			{ name: "Subuh", time: times.fajr },
			{ name: "Syuruq", time: times.sunrise },
			{ name: "Dzuhur", time: times.dhuhr },
			{ name: "Ashar", time: times.asr },
			{ name: "Maghrib", time: times.maghrib },
			{ name: "Isya", time: times.isha },
		];

		const prayerMinutes = prayerSchedule.map((prayer) => {
			const [hours, minutes] = prayer.time.split(":").map(Number);
			return {
				name: prayer.name,
				minutes: hours * 60 + minutes,
			};
		});

		// Find current and next prayer
		let current = null;
		let next = null;

		for (let i = 0; i < prayerMinutes.length; i++) {
			const prayer = prayerMinutes[i];
			const nextPrayerIndex = (i + 1) % prayerMinutes.length;

			if (
				currentTime >= prayer.minutes &&
				currentTime < prayerMinutes[nextPrayerIndex].minutes
			) {
				current = prayer.name;
				next = prayerMinutes[nextPrayerIndex].name;
				break;
			}
		}

		// If no current prayer found, we're after Isha
		if (!current) {
			current = "Isya";
			next = "Subuh";
		}

		setCurrentPrayer(current);
		setNextPrayer(next);
	}, []);

	useEffect(() => {
		const fetchPrayerTimes = async () => {
			try {
				const times = await getPrayerTimes(
					mosqueInfo.latitude,
					mosqueInfo.longitude,
				);
				setPrayerTimes(times);
				prayerTimesRef.current = times;
				getCurrentAndNextPrayer(times);
			} catch (error) {
				console.error("Failed to fetch prayer times:", error);
				getCurrentAndNextPrayer(prayerTimesRef.current);
			}
		};

		fetchPrayerTimes();

		// Update prayer times daily at midnight
		const now = new Date();
		const tomorrow = new Date(now);
		tomorrow.setDate(tomorrow.getDate() + 1);
		tomorrow.setHours(0, 0, 0, 0);

		const msUntilMidnight = tomorrow.getTime() - now.getTime();

		const timeoutId = setTimeout(() => {
			fetchPrayerTimes();

			// Set up daily interval
			const intervalId = setInterval(fetchPrayerTimes, 24 * 60 * 60 * 1000);

			return () => clearInterval(intervalId);
		}, msUntilMidnight);

		// Update current/next prayer every minute
		const prayerUpdateInterval = setInterval(() => {
			getCurrentAndNextPrayer(prayerTimesRef.current);
		}, 60000);

		return () => {
			clearTimeout(timeoutId);
			clearInterval(prayerUpdateInterval);
		};
	}, [mosqueInfo.latitude, mosqueInfo.longitude, getCurrentAndNextPrayer]);

	const updateMosqueInfo = (info: MosqueInfo) => {
		setMosqueInfo(info);
		localStorage.setItem("mosqueInfo", JSON.stringify(info));
	};

	const updateAnnouncements = (newAnnouncements: string[]) => {
		setAnnouncements(newAnnouncements);
		localStorage.setItem("announcements", JSON.stringify(newAnnouncements));
	};

	// Load saved data from localStorage
	useEffect(() => {
		const savedMosqueInfo = localStorage.getItem("mosqueInfo");
		const savedAnnouncements = localStorage.getItem("announcements");

		if (savedMosqueInfo) {
			setMosqueInfo(JSON.parse(savedMosqueInfo));
		}

		if (savedAnnouncements) {
			setAnnouncements(JSON.parse(savedAnnouncements));
		}
	}, []);

	const value: PrayerContextType = {
		mosqueInfo,
		prayerTimes,
		announcements,
		currentPrayer,
		nextPrayer,
		updateMosqueInfo,
		updateAnnouncements,
	};

	return (
		<PrayerContext.Provider value={value}>{children}</PrayerContext.Provider>
	);
};

export const usePrayerContext = () => {
	const context = useContext(PrayerContext);
	if (context === undefined) {
		throw new Error("usePrayerContext must be used within a PrayerProvider");
	}
	return context;
};
