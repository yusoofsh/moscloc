import { Volume2 } from "lucide-react";
import type React from "react";
import { useEffect, useState } from "react";

interface AnnouncementBannerProps {
	announcements: string[];
}

const AnnouncementBanner: React.FC<AnnouncementBannerProps> = ({
	announcements,
}) => {
	const [currentIndex, setCurrentIndex] = useState(0);

	useEffect(() => {
		if (announcements.length <= 1) return;

		const interval = setInterval(() => {
			setCurrentIndex((prevIndex) =>
				prevIndex === announcements.length - 1 ? 0 : prevIndex + 1,
			);
		}, 5000); // Change announcement every 5 seconds

		return () => clearInterval(interval);
	}, [announcements.length]);

	if (!announcements.length) return null;

	return (
		<div className="rounded-3xl border border-white/20 bg-white/15 p-8 backdrop-blur-md lg:p-12">
			<div className="flex items-center gap-6">
				<div className="flex-shrink-0">
					<div className="rounded-2xl border border-red-400/30 bg-red-500/30 p-4">
						<Volume2 size={30} className="text-red-300" />
					</div>
				</div>

				<div className="relative flex-1 overflow-hidden">
					<div
						className="flex transition-transform duration-500 ease-in-out"
						style={{ transform: `translateX(-${currentIndex * 100}%)` }}
					>
						{announcements.map((announcement, index) => (
							<div
								key={`announcement-${index}-${announcement.slice(0, 20)}`}
								className="w-full flex-shrink-0 font-bold text-lg text-white lg:text-xl xl:text-2xl 2xl:text-3xl"
							>
								{announcement}
							</div>
						))}
					</div>
				</div>

				{announcements.length > 1 && (
					<div className="flex gap-2">
						{announcements.map((announcement, index) => (
							<button
								type="button"
								key={`nav-${announcement.slice(0, 10)}-${index}`}
								onClick={() => setCurrentIndex(index)}
								className={`h-3 w-3 rounded-full transition-colors ${
									index === currentIndex ? "bg-white" : "bg-white/30"
								}`}
							/>
						))}
					</div>
				)}
			</div>
		</div>
	);
};

export default AnnouncementBanner;
