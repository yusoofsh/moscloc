import { MapPin, Phone } from "lucide-react"
import type React from "react"
import { useEffect, useState } from "react"
import { usePrayerContext } from "../contexts/PrayerContext"
import AnnouncementBanner from "./AnnouncementBanner"
import CommunityEventsCard from "./CommunityEvents"
import CurrentTime from "./CurrentTime"
import IqamahRedirect from "./IqamahRedirect"
import IslamicCalendar from "./IslamicCalendar"
import PrayerTimes from "./PrayerTimes"
import QuranVerseCard from "./QuranVerse"

const PrayerDisplay: React.FC = () => {
	const { mosqueInfo, announcements } = usePrayerContext()
	const [_currentTime, setCurrentTime] = useState(new Date())

	useEffect(() => {
		const timer = setInterval(() => {
			setCurrentTime(new Date())
		}, 1000)

		return () => clearInterval(timer)
	}, [])

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
									fill="none"
									stroke="currentColor"
									stroke-width="16"
									stroke-linecap="round"
									stroke-linejoin="round"
									width="52"
									height="52"
									viewBox="0 0 256 256"
									role="img"
									aria-label="Mosque icon"
								>
									<line x1="208" y1="128" x2="48" y2="128" />
									<path d="M208,152a16,16,0,0,1,16-16h0a16,16,0,0,1,16,16v56H208" />
									<path d="M48,208H16V152a16,16,0,0,1,16-16h0a16,16,0,0,1,16,16" />
									<path d="M48,208V128c0-64,80-72,80-104,0,32,80,40,80,104v80H176V176a16,16,0,0,0-16-16h0a16,16,0,0,0-16,16v32H112V176a16,16,0,0,0-16-16h0a16,16,0,0,0-16,16v32Z" />
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
							<div className="flex items-center gap-3 text-white">
								<Phone size={22} />
								<span className="font-medium text-base lg:text-lg xl:text-xl 2xl:text-2xl">
									{mosqueInfo.contact.replace("Tel: ", "")}
								</span>
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

						{/* Iqamah Redirect - Full Screen Width */}
						<div className="w-full">
							<IqamahRedirect />
						</div>
					</div>
				</div>
			</div>
		</div>
	)
}

export default PrayerDisplay
