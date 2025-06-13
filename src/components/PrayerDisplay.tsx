import { MapPin, Settings } from "lucide-react";
import type React from "react";
import { useEffect, useState } from "react";
import { usePrayerContext } from "../contexts/PrayerContext";
import AnnouncementBanner from "./AnnouncementBanner";
import CommunityEventsCard from "./CommunityEventsCard";
import CurrentTime from "./CurrentTime";
import IslamicCalendar from "./IslamicCalendar";
import PrayerTimes from "./PrayerTimes";
import QuranVerseCard from "./QuranVerseCard";

const PrayerDisplay: React.FC = () => {
	const { mosqueInfo, announcements } = usePrayerContext();
	const [_currentTime, setCurrentTime] = useState(new Date());

	useEffect(() => {
		const timer = setInterval(() => {
			setCurrentTime(new Date());
		}, 1000);

		return () => clearInterval(timer);
	}, []);

	return (
		<div className="relative min-h-screen overflow-hidden">
			{/* Background Image with Reduced Overlay */}
			<div
				className="absolute inset-0 bg-center bg-cover"
				style={{
					backgroundImage:
						'url("https://i.postimg.cc/P5YhQ57V/Whats-App-Image-2025-06-13-at-2-28-54-PM.jpg")',
				}}
			>
				<div className="absolute inset-0 bg-gradient-to-br from-emerald-900/60 via-slate-900/65 to-emerald-800/60" />
			</div>

			{/* Admin Access Button */}
			<div className="absolute top-6 right-6 z-50">
				<button
					type="button"
					onClick={() => {
						window.location.href = "/admin";
					}}
					className="rounded-xl bg-white/15 p-3 text-white backdrop-blur-sm transition-colors hover:bg-white/25"
				>
					<Settings size={26} />
				</button>
			</div>

			{/* Main Content */}
			<div className="relative z-10 flex min-h-screen flex-col">
				{/* Header Section */}
				<div className="flex-shrink-0 p-8 lg:p-12">
					<div className="flex items-start justify-between">
						{/* Mosque Info */}
						<div className="text-white">
							<div className="mb-4 flex items-center gap-4">
								<svg
									xmlns="http://www.w3.org/2000/svg"
									width="52"
									height="52"
									viewBox="0 0 24 24"
									fill="none"
									stroke="currentColor"
									strokeWidth="2"
									strokeLinecap="round"
									strokeLinejoin="round"
									className="lucide lucide-fuel text-amber-400"
									role="img"
									aria-label="Mosque icon"
								>
									<title>Mosque</title>
									<line x1="3" x2="15" y1="22" y2="22" />
									<line x1="4" x2="14" y1="9" y2="9" />
									<path d="M14 22V4a2 2 0 0 0-2-2H6a2 2 0 0 0-2 2v18" />
									<path d="M14 13h2a2 2 0 0 1 2 2v2a2 2 0 0 0 2 2h0a2 2 0 0 0 2-2V9.83a2 2 0 0 0-.59-1.42L18 5" />
								</svg>
								<h1 className="font-bold text-3xl lg:text-4xl xl:text-5xl 2xl:text-6xl">
									{mosqueInfo.name}
								</h1>
							</div>
							<div className="mb-2 flex items-center gap-3 text-white">
								<MapPin size={22} />
								<span className="font-medium text-lg lg:text-xl xl:text-2xl 2xl:text-3xl">
									{mosqueInfo.address}
								</span>
							</div>
							<div className="font-medium text-base text-white lg:text-lg xl:text-xl 2xl:text-2xl">
								{mosqueInfo.contact}
							</div>
						</div>

						{/* Current Time & Date */}
						<div className="text-right text-white">
							<CurrentTime />
							<IslamicCalendar />
						</div>
					</div>
				</div>

				{/* Spacer to push content to bottom */}
				<div className="flex-1" />

				{/* Bottom Content Section - Full Width */}
				<div className="flex min-h-[60vh] flex-shrink-0 items-center justify-center px-6 pb-8 lg:px-8">
					<div className="w-full space-y-6">
						{/* Horizontal Card Layout - Full Screen Width */}
						<div className="w-full">
							<div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
								<QuranVerseCard />
								<CommunityEventsCard />
							</div>
						</div>

						{/* Prayer Times - Full Screen Width */}
						<div className="w-full">
							<PrayerTimes />
						</div>

						{/* Announcements - Full Screen Width */}
						<div className="w-full">
							<AnnouncementBanner announcements={announcements} />
						</div>
					</div>
				</div>
			</div>
		</div>
	);
};

export default PrayerDisplay;
