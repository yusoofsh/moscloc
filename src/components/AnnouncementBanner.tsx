import { ChevronLeft, ChevronRight, Pause, Play, Volume2 } from "lucide-react"
import type React from "react"
import { useRotatingContent } from "../hooks/useRotatingContent"

interface AnnouncementBannerProps {
	announcements: string[]
}

const AnnouncementBanner: React.FC<AnnouncementBannerProps> = ({
	announcements,
}) => {
	const { currentIndex, isPaused, next, previous, togglePaused } =
		useRotatingContent({ itemCount: announcements.length, intervalMs: 10_000 })

	if (!announcements.length) return null

	return (
		<section
			aria-label="Pengumuman masjid"
			className="rounded-3xl border border-white/20 bg-white/15 p-4 text-white backdrop-blur-md lg:p-6"
		>
			<div className="flex flex-col gap-4 sm:flex-row sm:items-center">
				<div className="flex min-w-0 flex-1 items-start gap-4 sm:items-center">
					<div className="flex size-12 shrink-0 items-center justify-center rounded-2xl border border-red-400/30 bg-red-500/30">
						<Volume2 aria-hidden="true" className="size-7 text-red-200" />
					</div>
					<p
						aria-atomic="true"
						aria-live="polite"
						className="min-w-0 whitespace-normal break-words font-bold text-lg leading-relaxed lg:text-xl xl:text-2xl"
						role="status"
					>
						{announcements[currentIndex]}
					</p>
				</div>

				{announcements.length > 1 && (
					<div
						aria-label="Kontrol pengumuman"
						className="flex shrink-0 items-center justify-end gap-1"
						role="group"
					>
						<button
							aria-label="Pengumuman sebelumnya"
							className="display-control"
							onClick={previous}
							type="button"
						>
							<ChevronLeft aria-hidden="true" />
						</button>
						<span
							aria-live="off"
							className="min-w-12 text-center font-semibold text-sm"
						>
							{currentIndex + 1} / {announcements.length}
						</span>
						<button
							aria-label="Pengumuman berikutnya"
							className="display-control"
							onClick={next}
							type="button"
						>
							<ChevronRight aria-hidden="true" />
						</button>
						<button
							aria-label={
								isPaused
									? "Lanjutkan pengumuman otomatis"
									: "Jeda pengumuman otomatis"
							}
							aria-pressed={isPaused}
							className="display-control"
							onClick={togglePaused}
							type="button"
						>
							{isPaused ? (
								<Play aria-hidden="true" />
							) : (
								<Pause aria-hidden="true" />
							)}
						</button>
					</div>
				)}
			</div>
		</section>
	)
}

export default AnnouncementBanner
