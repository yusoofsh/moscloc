import { ChevronLeft, ChevronRight, Pause, Play } from "lucide-react"
import type React from "react"
import { useMosqueContentContext } from "../contexts/PrayerContext"
import { useRotatingContent } from "../hooks/useRotatingContent"

const QuranVerseCard: React.FC = () => {
	const { verses } = useMosqueContentContext()
	const { currentIndex, isPaused, next, previous, togglePaused } =
		useRotatingContent({ itemCount: verses.length, intervalMs: 15_000 })
	const verse = verses[currentIndex]

	if (!verse) {
		return (
			<section
				aria-label="Ayat Al-Quran"
				className="rounded-3xl border border-white/20 bg-white/15 p-6 text-white backdrop-blur-md"
				data-testid="quran-verse"
			>
				<div className="flex min-h-48 items-center justify-center text-center">
					<div>
						<h2 className="font-bold text-xl lg:text-2xl">Belum Ada Ayat</h2>
						<p className="mt-2 text-base text-white/80 leading-relaxed lg:text-lg">
							Tambahkan ayat Al-Quran melalui panel admin
						</p>
					</div>
				</div>
			</section>
		)
	}

	return (
		<section
			aria-label="Ayat Al-Quran"
			className="rounded-3xl border border-white/20 bg-white/15 p-4 text-white backdrop-blur-md lg:p-6"
			data-testid="quran-verse"
		>
			<figure
				aria-atomic="true"
				aria-live="polite"
				className="flex min-h-48 flex-col justify-center"
				role="status"
			>
				<p
					className="arabic-text whitespace-normal break-words text-right font-light text-2xl leading-[1.9] lg:text-3xl xl:text-4xl"
					lang="ar"
				>
					{verse.arabic}
				</p>
				<blockquote className="mt-4 whitespace-pre-wrap break-words font-semibold text-base italic leading-relaxed lg:text-lg xl:text-xl">
					“{verse.translation}”
				</blockquote>
				<figcaption className="mt-3 font-bold text-base text-emerald-200 lg:text-lg">
					— {verse.reference}
				</figcaption>
			</figure>

			{verses.length > 1 && (
				<div
					aria-label="Kontrol ayat"
					className="mt-4 flex items-center justify-end gap-1"
					role="group"
				>
					<button
						aria-label="Ayat sebelumnya"
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
						{currentIndex + 1} / {verses.length}
					</span>
					<button
						aria-label="Ayat berikutnya"
						className="display-control"
						onClick={next}
						type="button"
					>
						<ChevronRight aria-hidden="true" />
					</button>
					<button
						aria-label={
							isPaused ? "Lanjutkan ayat otomatis" : "Jeda ayat otomatis"
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

export default QuranVerseCard
