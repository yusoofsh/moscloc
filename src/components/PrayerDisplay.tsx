import { MapPin, Phone } from "lucide-react"
import type React from "react"
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

	return (
		<div className="relative min-h-screen overflow-x-clip bg-emerald-950">
			<button
				type="button"
				onClick={() => document.getElementById("main-content")?.focus()}
				className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-50 focus:rounded-md focus:bg-white focus:px-4 focus:py-2 focus:font-semibold focus:text-emerald-900 focus:shadow-lg"
			>
				Lewati ke konten utama
			</button>

			<div
				aria-hidden="true"
				className="display-backdrop absolute inset-0"
				data-testid="display-background"
			/>

			{/* Main Content */}
			<main
				id="main-content"
				tabIndex={-1}
				className="relative z-10 flex min-h-screen flex-col"
			>
				{/* Header Section */}
				<header className="p-4 lg:p-6">
					<div className="flex flex-col gap-6 sm:flex-row sm:items-start sm:justify-between">
						{/* Mosque Info */}
						<div className="min-w-0 text-white">
							<div className="mb-4 flex items-center gap-4">
								<svg
									xmlns="http://www.w3.org/2000/svg"
									fill="none"
									stroke="currentColor"
									strokeWidth="16"
									strokeLinecap="round"
									strokeLinejoin="round"
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
								<h1 className="min-w-0 break-words font-bold text-3xl leading-tight lg:text-4xl xl:text-5xl 2xl:text-6xl">
									{mosqueInfo.name}
								</h1>
							</div>
							<div className="mb-2 flex items-center gap-3 text-white">
								<MapPin size={22} />
								<span className="min-w-0 break-words font-medium text-lg lg:text-xl xl:text-2xl 2xl:text-3xl">
									{mosqueInfo.address}
								</span>
							</div>
							<div className="flex items-center gap-3 text-white">
								<Phone size={22} />
								<span className="min-w-0 break-words font-medium text-base lg:text-lg xl:text-xl 2xl:text-2xl">
									{mosqueInfo.contact.replace("Tel: ", "")}
								</span>
							</div>
						</div>

						{/* Current Time & Date */}
						<div className="shrink-0 self-end text-right text-white sm:self-auto">
							<CurrentTime />
							<IslamicCalendar />
						</div>
					</div>
				</header>

				{/* Bottom Content Section - Full Width */}
				<div className="mt-auto px-3 pb-6 sm:px-6 lg:px-8 lg:pb-8">
					<div className="mx-auto w-full max-w-[120rem] space-y-6">
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
			</main>
		</div>
	)
}

export default PrayerDisplay
