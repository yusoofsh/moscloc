import type React from "react";
import { useEffect, useState } from "react";

interface Verse {
	arabic: string;
	translation: string;
	reference: string;
}

const QuranVerseCard: React.FC = () => {
	const [currentIndex, setCurrentIndex] = useState(0);

	const verses: Verse[] = [
		{
			arabic: "وَأَقِيمُوا الصَّلَاةَ وَآتُوا الزَّكَاةَ وَارْكَعُوا مَعَ الرَّاكِعِينَ",
			translation:
				"Dan dirikanlah shalat, tunaikanlah zakat dan ruku'lah beserta orang-orang yang ruku'.",
			reference: "Al-Baqarah 2:43",
		},
		{
			arabic: "يَا أَيُّهَا الَّذِينَ آمَنُوا اسْتَعِينُوا بِالصَّبْرِ وَالصَّلَاةِ",
			translation:
				"Hai orang-orang yang beriman, jadikanlah sabar dan shalat sebagai penolongmu.",
			reference: "Al-Baqarah 2:153",
		},
		{
			arabic: "وَمَا خَلَقْتُ الْجِنَّ وَالْإِنسَ إِلَّا لِيَعْبُدُونِ",
			translation:
				"Dan Aku tidak menciptakan jin dan manusia melainkan supaya mereka menyembah-Ku.",
			reference: "Adh-Dhariyat 51:56",
		},
		{
			arabic: "وَبَشِّرِ الصَّابِرِينَ",
			translation:
				"Dan berikanlah berita gembira kepada orang-orang yang sabar.",
			reference: "Al-Baqarah 2:155",
		},
		{
			arabic: "إِنَّ مَعَ الْعُسْرِ يُسْرًا",
			translation: "Sesungguhnya sesudah kesulitan itu ada kemudahan.",
			reference: "Ash-Sharh 94:6",
		},
	];

	useEffect(() => {
		const interval = setInterval(() => {
			setCurrentIndex((prevIndex) =>
				prevIndex === verses.length - 1 ? 0 : prevIndex + 1,
			);
		}, 8000);

		return () => clearInterval(interval);
	}, []);

	return (
		<div className="h-full overflow-hidden rounded-3xl border border-white/20 bg-white/15 p-8 text-white backdrop-blur-md lg:p-12">
			{/* Verse Content Container with Fixed Height */}
			<div className="relative h-[240px] overflow-hidden">
				<div
					className="flex h-full transition-transform duration-500 ease-in-out"
					style={{ transform: `translateX(-${currentIndex * 100}%)` }}
				>
					{verses.map((verse, index) => (
						<div
							key={`verse-${verse.reference}-${index}`}
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
							key={`nav-${verse.reference}-${index}`}
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
