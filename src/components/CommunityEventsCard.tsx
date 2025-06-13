import { Calendar, Clock, MapPin } from "lucide-react";
import type React from "react";
import { useEffect, useState } from "react";

interface Event {
	title: string;
	date: string;
	time: string;
	location: string;
	image: string;
	description: string;
}

const CommunityEventsCard: React.FC = () => {
	const [currentIndex, setCurrentIndex] = useState(0);

	const events: Event[] = [
		{
			title: "Kajian Rutin Mingguan",
			date: "Setiap Kamis",
			time: "Ba'da Maghrib",
			location: "Ruang Utama Masjid",
			image:
				"https://images.pexels.com/photos/8111357/pexels-photo-8111357.jpeg?auto=compress&cs=tinysrgb&w=800",
			description: "Mari bergabung dalam kajian Al-Quran dan diskusi keislaman",
		},
		{
			title: "Buka Puasa Bersama",
			date: "Selama Ramadhan",
			time: "Waktu Maghrib",
			location: "Aula Masjid",
			image:
				"https://images.pexels.com/photos/6210959/pexels-photo-6210959.jpeg?auto=compress&cs=tinysrgb&w=800",
			description: "Berbuka puasa bersama sebagai satu keluarga besar",
		},
		{
			title: "Kelas Tahfidz Anak",
			date: "Setiap Sabtu",
			time: "14:00 - 16:00",
			location: "Ruang Belajar",
			image:
				"https://images.pexels.com/photos/8111358/pexels-photo-8111358.jpeg?auto=compress&cs=tinysrgb&w=800",
			description: "Program menghafal Al-Quran untuk anak-anak",
		},
		{
			title: "Shalat Jumat",
			date: "Setiap Jumat",
			time: "12:30",
			location: "Ruang Utama Masjid",
			image:
				"https://images.pexels.com/photos/8111359/pexels-photo-8111359.jpeg?auto=compress&cs=tinysrgb&w=800",
			description: "Khutbah Jumat dan shalat berjamaah",
		},
	];

	useEffect(() => {
		const interval = setInterval(() => {
			setCurrentIndex((prevIndex) =>
				prevIndex === events.length - 1 ? 0 : prevIndex + 1,
			);
		}, 6000);

		return () => clearInterval(interval);
	}, []);

	return (
		<div className="h-full overflow-hidden rounded-3xl border border-white/20 bg-white/15 p-8 text-white backdrop-blur-md lg:p-12">
			{/* Event Content */}
			<div className="relative h-[240px] overflow-hidden">
				<div
					className="flex h-full transition-transform duration-500 ease-in-out"
					style={{ transform: `translateX(-${currentIndex * 100}%)` }}
				>
					{events.map((event, index) => (
						<div
							key={`event-${event.title.slice(0, 20)}-${index}`}
							className="flex h-full w-full flex-shrink-0"
						>
							{/* Event Image */}
							<div className="relative w-1/3">
								<img
									src={event.image}
									alt={event.title}
									className="h-full w-full rounded-2xl object-cover"
								/>
								<div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-transparent to-blue-900/50" />
							</div>

							{/* Event Details */}
							<div className="flex w-2/3 flex-col justify-center pl-8">
								<h4 className="mb-6 font-bold text-xl lg:text-2xl xl:text-3xl 2xl:text-4xl">
									{event.title}
								</h4>

								<div className="mb-6 space-y-3">
									<div className="flex items-center gap-3 font-bold text-base text-white lg:text-lg xl:text-xl 2xl:text-2xl">
										<Calendar size={22} />
										<span>{event.date}</span>
									</div>
									<div className="flex items-center gap-3 font-bold text-base text-white lg:text-lg xl:text-xl 2xl:text-2xl">
										<Clock size={22} />
										<span>{event.time}</span>
									</div>
									<div className="flex items-center gap-3 font-bold text-base text-white lg:text-lg xl:text-xl 2xl:text-2xl">
										<MapPin size={22} />
										<span>{event.location}</span>
									</div>
								</div>

								<p className="font-bold text-base text-white leading-relaxed lg:text-lg xl:text-xl 2xl:text-2xl">
									{event.description}
								</p>
							</div>
						</div>
					))}
				</div>
			</div>

			{/* Navigation Dots */}
			<div className="mt-6 flex justify-center">
				<div className="flex gap-3">
					{events.map((event, index) => (
						<button
							type="button"
							key={`nav-${event.title.slice(0, 10)}-${index}`}
							onClick={() => setCurrentIndex(index)}
							className={`h-3 w-3 rounded-full transition-colors ${
								index === currentIndex ? "bg-blue-300" : "bg-white/30"
							}`}
						/>
					))}
				</div>
			</div>
		</div>
	);
};

export default CommunityEventsCard;
