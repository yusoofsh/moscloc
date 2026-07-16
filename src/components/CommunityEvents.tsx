import {
	Calendar,
	ChevronLeft,
	ChevronRight,
	Clock,
	MapPin,
	Pause,
	Play,
} from "lucide-react"
import type React from "react"
import { useMosqueContentContext } from "../contexts/PrayerContext"
import { useRotatingContent } from "../hooks/useRotatingContent"

const CommunityEventsCard: React.FC = () => {
	const { events } = useMosqueContentContext()
	const { currentIndex, isPaused, next, previous, togglePaused } =
		useRotatingContent({ itemCount: events.length, intervalMs: 12_000 })
	const event = events[currentIndex]

	if (!event) {
		return (
			<section
				aria-label="Acara komunitas"
				className="rounded-3xl border border-white/20 bg-white/15 p-6 text-white backdrop-blur-md"
			>
				<div className="flex min-h-48 items-center justify-center text-center">
					<div>
						<h2 className="font-bold text-xl lg:text-2xl">Belum Ada Acara</h2>
						<p className="mt-2 text-base text-white/80 leading-relaxed lg:text-lg">
							Tambahkan acara komunitas melalui panel admin
						</p>
					</div>
				</div>
			</section>
		)
	}

	return (
		<section
			aria-label="Acara komunitas"
			className="rounded-3xl border border-white/20 bg-white/15 p-4 text-white backdrop-blur-md lg:p-6"
		>
			<article
				aria-atomic="true"
				aria-live="polite"
				className={`grid min-h-48 gap-5 ${event.image ? "sm:grid-cols-[minmax(10rem,1fr)_2fr]" : "grid-cols-1"}`}
				role="status"
			>
				{event.image && (
					<img
						alt=""
						className="h-48 w-full rounded-2xl object-cover sm:h-full sm:min-h-56"
						src={event.image}
					/>
				)}
				<div className="min-w-0 self-center">
					<h2 className="break-words font-bold text-xl leading-tight lg:text-2xl xl:text-3xl">
						{event.title}
					</h2>
					<dl className="mt-4 grid gap-3 text-base lg:text-lg">
						<div className="flex min-w-0 items-start gap-3">
							<Calendar aria-hidden="true" className="mt-0.5 size-5 shrink-0" />
							<dt className="sr-only">Tanggal</dt>
							<dd className="min-w-0 break-words">{event.date}</dd>
						</div>
						<div className="flex min-w-0 items-start gap-3">
							<Clock aria-hidden="true" className="mt-0.5 size-5 shrink-0" />
							<dt className="sr-only">Waktu</dt>
							<dd className="min-w-0 break-words">{event.time}</dd>
						</div>
						<div className="flex min-w-0 items-start gap-3">
							<MapPin aria-hidden="true" className="mt-0.5 size-5 shrink-0" />
							<dt className="sr-only">Lokasi</dt>
							<dd className="min-w-0 break-words">{event.location}</dd>
						</div>
					</dl>
					{event.description && (
						<p className="mt-4 whitespace-pre-wrap break-words text-base leading-relaxed lg:text-lg">
							{event.description}
						</p>
					)}
				</div>
			</article>

			{events.length > 1 && (
				<div
					className="mt-4 flex items-center justify-end gap-1"
					role="group"
					aria-label="Kontrol acara"
				>
					<button
						aria-label="Acara sebelumnya"
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
						{currentIndex + 1} / {events.length}
					</span>
					<button
						aria-label="Acara berikutnya"
						className="display-control"
						onClick={next}
						type="button"
					>
						<ChevronRight aria-hidden="true" />
					</button>
					<button
						aria-label={
							isPaused ? "Lanjutkan acara otomatis" : "Jeda acara otomatis"
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
		</section>
	)
}

export default CommunityEventsCard
