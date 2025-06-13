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

export interface Event {
	id: string;
	title: string;
	date: string;
	time: string;
	location: string;
	image: string;
	description: string;
}

export interface Verse {
	id: string;
	arabic: string;
	translation: string;
	reference: string;
}

export interface PrayerSettings {
	method: number; // Calculation method (e.g., 20 for custom)
	shafaq: string; // Shafaq parameter (general, red, white)
	tune: string; // Minute adjustments (comma-separated values)
	school: number; // Juristic school (0 = Shafi, 1 = Hanafi)
	midnightMode: number; // Midnight calculation mode
	timezonestring: string; // Timezone string
}

interface PrayerTimes {
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
	events: Event[];
	verses: Verse[];
	prayerSettings: PrayerSettings;
	currentPrayer: string | null;
	nextPrayer: string | null;
	updateMosqueInfo: (info: MosqueInfo) => void;
	updateAnnouncements: (announcements: string[]) => void;
	updateEvents: (events: Event[]) => void;
	updateVerses: (verses: Verse[]) => void;
	updatePrayerSettings: (settings: PrayerSettings) => void;
}

const PrayerContext = createContext<PrayerContextType | undefined>(undefined);

export const defaultMosqueInfo: MosqueInfo = {
	name: "Masjid Darul Arqom",
	address: "Jalan Kramatan, Kecamatan Pakisaji, Kabupaten Malang",
	contact: "Tel: +62 21 123456",
	latitude: -8.0679373,
	longitude: 112.5988417,
};

export const defaultPrayerTimes: PrayerTimes = {
	fajr: "04:26",
	sunrise: "05:50",
	dhuhr: "12:03",
	asr: "15:03",
	maghrib: "17:58",
	isha: "18:59",
};

export const defaultPrayerSettings: PrayerSettings = {
	method: 20,
	shafaq: "general",
	tune: "10,10,-1,1,2,3,3,2,0",
	school: 0,
	midnightMode: 0,
	timezonestring: "Asia/Jakarta",
};

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
];

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
	const [events, setEvents] = useState<Event[]>([]);
	const [verses, setVerses] = useState<Verse[]>(defaultVerses);
	const [prayerSettings, setPrayerSettings] = useState<PrayerSettings>(
		defaultPrayerSettings,
	);
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
					prayerSettings,
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
	}, [
		mosqueInfo.latitude,
		mosqueInfo.longitude,
		prayerSettings,
		getCurrentAndNextPrayer,
	]);

	const updateMosqueInfo = (info: MosqueInfo) => {
		setMosqueInfo(info);
		localStorage.setItem("mosqueInfo", JSON.stringify(info));
	};

	const updateAnnouncements = (newAnnouncements: string[]) => {
		setAnnouncements(newAnnouncements);
		localStorage.setItem("announcements", JSON.stringify(newAnnouncements));
	};

	const updateEvents = (newEvents: Event[]) => {
		setEvents(newEvents);
		localStorage.setItem("events", JSON.stringify(newEvents));
	};

	const updateVerses = (newVerses: Verse[]) => {
		setVerses(newVerses);
		localStorage.setItem("verses", JSON.stringify(newVerses));
	};

	const updatePrayerSettings = (newSettings: PrayerSettings) => {
		setPrayerSettings(newSettings);
		localStorage.setItem("prayerSettings", JSON.stringify(newSettings));
	};

	// Load saved data from localStorage
	useEffect(() => {
		const savedMosqueInfo = localStorage.getItem("mosqueInfo");
		const savedAnnouncements = localStorage.getItem("announcements");
		const savedEvents = localStorage.getItem("events");
		const savedVerses = localStorage.getItem("verses");
		const savedPrayerSettings = localStorage.getItem("prayerSettings");

		if (savedMosqueInfo) {
			setMosqueInfo(JSON.parse(savedMosqueInfo));
		}

		if (savedAnnouncements) {
			setAnnouncements(JSON.parse(savedAnnouncements));
		}

		if (savedEvents) {
			setEvents(JSON.parse(savedEvents));
		}

		if (savedVerses) {
			setVerses(JSON.parse(savedVerses));
		}

		if (savedPrayerSettings) {
			setPrayerSettings(JSON.parse(savedPrayerSettings));
		}
	}, []);

	const value: PrayerContextType = {
		mosqueInfo,
		prayerTimes,
		announcements,
		events,
		verses,
		prayerSettings,
		currentPrayer,
		nextPrayer,
		updateMosqueInfo,
		updateAnnouncements,
		updateEvents,
		updateVerses,
		updatePrayerSettings,
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
