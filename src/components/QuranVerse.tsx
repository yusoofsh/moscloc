import type React from "react";
import { useEffect, useState } from "react";
import { usePrayerContext } from "../contexts/PrayerContext";

const QuranVerseCard: React.FC = () => {
	const { verses } = usePrayerContext();
	const [currentIndex, setCurrentIndex] = useState(0);

	useEffect(() => {
		if (verses.length === 0) return;

		const interval = setInterval(() => {
			setCurrentIndex((prevIndex) =>
				prevIndex === verses.length - 1 ? 0 : prevIndex + 1,
			);
		}, 8000);

		return () => clearInterval(interval);
	}, [verses.length]);

	// If no verses, show a placeholder
	if (verses.length === 0) {
		return (
			<div className="h-full overflow-hidden rounded-3xl border border-white/20 bg-white/15 p-8 text-white backdrop-blur-md lg:p-12">
				<div className="flex h-[240px] items-center justify-center">
					<div className="text-center">
						<h4 className="mb-4 font-bold text-xl lg:text-2xl xl:text-3xl 2xl:text-4xl">
							Belum Ada Ayat
						</h4>
						<p className="font-bold text-base text-white/80 leading-relaxed lg:text-lg xl:text-xl 2xl:text-2xl">
							Tambahkan ayat Al-Quran melalui panel admin
						</p>
					</div>
				</div>
			</div>
		);
	}

	return (
		<div className="h-full overflow-hidden rounded-3xl border border-white/20 bg-white/15 p-8 text-white backdrop-blur-md lg:p-12">
			{/* Verse Content Container with Fixed Height */}
			<div className="relative h-[240px] overflow-hidden">
				<div
					className="flex h-full transition-transform duration-500 ease-in-out"
					style={{ transform: `translateX(-${currentIndex * 100}%)` }}
				>
					{verses.map((verse, _index) => (
						<div
							key={verse.id}
							className="flex h-full w-full flex-shrink-0 flex-col justify-center px-4"
						>
							{/* Arabic Text */}
							<div className="arabic-text mb-6 overflow-hidden text-right font-light text-xl leading-relaxed lg:text-2xl xl:text-3xl 2xl:text-4xl">
								{verse.arabic}
							</div>

							{/* Translation */}
							<div className="mb-4 overflow-hidden font-bold text-base text-white italic leading-relaxed lg:text-lg xl:text-xl 2xl:text-2xl">
								"{verse.translation}"
							</div>

							{/* Reference */}
							<div className="font-bold text-base text-emerald-300 lg:text-lg xl:text-xl 2xl:text-2xl">
								— {verse.reference}
							</div>
						</div>
					))}
				</div>
			</div>

			{/* Navigation Dots */}
			<div className="mt-6 flex justify-center">
				<div className="flex gap-3">
					{verses.map((verse, index) => (
						<button
							type="button"
							key={verse.id}
							onClick={() => setCurrentIndex(index)}
							className={`h-3 w-3 rounded-full transition-colors ${
								index === currentIndex ? "bg-emerald-300" : "bg-white/40"
							}`}
						/>
					))}
				</div>
			</div>
		</div>
	);
};

export default QuranVerseCard;
