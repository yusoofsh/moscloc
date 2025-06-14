import { Navigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { usePrayerContext } from "../contexts/PrayerContext";

interface IqamahCountdownProps {
	prayerName?: string;
	onComplete?: () => void;
}

const IqamahCountdown: React.FC<IqamahCountdownProps> = ({
	prayerName,
	onComplete,
}) => {
	const { prayerTimes, iqamahIntervals, mosqueInfo } = usePrayerContext();
	const [timeLeft, setTimeLeft] = useState<number | null>(null);
	const [currentPrayerName, setCurrentPrayerName] = useState<string>("");
	const [iqamahTime, setIqamahTime] = useState<string>("");

	useEffect(() => {
		const calculateTimeLeft = () => {
			const now = new Date();
			const currentTime = now.getHours() * 60 + now.getMinutes();

			const prayerSchedule = [
				{ name: "Subuh", time: prayerTimes.fajr, intervalKey: "fajr" as const },
				{
					name: "Dzuhur",
					time: prayerTimes.dhuhr,
					intervalKey: "dhuhr" as const,
				},
				{ name: "Ashar", time: prayerTimes.asr, intervalKey: "asr" as const },
				{
					name: "Maghrib",
					time: prayerTimes.maghrib,
					intervalKey: "maghrib" as const,
				},
				{ name: "Isya", time: prayerTimes.isha, intervalKey: "isha" as const },
			];

			let targetPrayer = null;

			if (prayerName) {
				// If specific prayer is provided, use it
				const prayer = prayerSchedule.find(
					(p) =>
						p.name.toLowerCase() === prayerName.toLowerCase() ||
						p.intervalKey.toLowerCase() === prayerName.toLowerCase(),
				);
				if (prayer) {
					targetPrayer = prayer;
				}
			} else {
				// Auto-detect current prayer based on time
				for (const prayer of prayerSchedule) {
					const [hours, minutes] = prayer.time.split(":").map(Number);
					const prayerMinutes = hours * 60 + minutes;
					const iqamahMinutes =
						prayerMinutes + iqamahIntervals[prayer.intervalKey];

					// Check if we're in the window between adhan and iqamah
					if (currentTime >= prayerMinutes && currentTime < iqamahMinutes) {
						targetPrayer = prayer;
						break;
					}
				}
			}

			if (targetPrayer) {
				const [hours, minutes] = targetPrayer.time.split(":").map(Number);
				const prayerMinutes = hours * 60 + minutes;
				const interval = iqamahIntervals[targetPrayer.intervalKey];
				const iqamahMinutes = prayerMinutes + interval;

				// Calculate iqamah time string
				const iqamahHours = Math.floor(iqamahMinutes / 60);
				const iqamahMins = iqamahMinutes % 60;
				const iqamahTimeString = `${iqamahHours.toString().padStart(2, "0")}:${iqamahMins.toString().padStart(2, "0")}`;

				setCurrentPrayerName(targetPrayer.name);
				setIqamahTime(iqamahTimeString);

				const remainingSeconds =
					(iqamahMinutes - currentTime) * 60 - now.getSeconds();

				if (remainingSeconds > 0) {
					setTimeLeft(remainingSeconds);
				} else {
					setTimeLeft(0);
					if (onComplete) {
						onComplete();
					}
				}
			} else {
				setTimeLeft(null);
				setCurrentPrayerName("");
				setIqamahTime("");
			}
		};

		calculateTimeLeft();
		const interval = setInterval(calculateTimeLeft, 1000);

		return () => clearInterval(interval);
	}, [prayerTimes, iqamahIntervals, prayerName, onComplete]);

	const formatTime = (seconds: number) => {
		const mins = Math.floor(seconds / 60);
		const secs = seconds % 60;
		return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
	};

	if (timeLeft === null) {
		return <Navigate to="/" />;
	}

	if (timeLeft === 0) {
		return (
			<div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-green-900 via-emerald-900 to-green-800">
				<div className="text-center text-white">
					<h1 className="mb-4 animate-pulse font-bold text-6xl">IQAMAH</h1>
					<p className="mb-2 text-3xl">{currentPrayerName}</p>
					<p className="text-xl opacity-80">{mosqueInfo.name}</p>
				</div>
			</div>
		);
	}

	return (
		<div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-blue-900 via-purple-900 to-blue-800 p-8">
			<div className="w-full max-w-4xl text-center text-white">
				{/* Mosque Info */}
				<div className="mb-8">
					<h2 className="mb-2 font-semibold text-2xl">{mosqueInfo.name}</h2>
					<p className="text-lg opacity-80">{mosqueInfo.address}</p>
				</div>

				{/* Prayer Name */}
				<div className="mb-8">
					<h1 className="mb-4 font-bold text-4xl md:text-5xl">
						Menuju Iqamah {currentPrayerName}
					</h1>
					<p className="text-xl opacity-90">Iqamah pada pukul {iqamahTime}</p>
				</div>

				{/* Countdown Display */}
				<div className="mb-8">
					<div className="rounded-3xl bg-white/10 p-8 shadow-2xl backdrop-blur-sm md:p-12">
						<div className="mb-4 font-bold font-mono text-8xl text-yellow-300 md:text-9xl">
							{formatTime(timeLeft)}
						</div>
						<p className="font-semibold text-2xl md:text-3xl">
							{Math.floor(timeLeft / 60) === 0 ? "Detik" : "Menit:Detik"}
						</p>
					</div>
				</div>

				{/* Instructions */}
				<div className="text-center">
					<p className="mb-4 text-lg opacity-80">
						Mari bersiap untuk shalat berjamaah
					</p>
					<div className="flex justify-center space-x-8 text-sm opacity-60">
						<div>
							<p className="font-semibold">
								Adzan:{" "}
								{prayerTimes[
									currentPrayerName.toLowerCase() as keyof typeof prayerTimes
								] || "N/A"}
							</p>
						</div>
						<div>
							<p className="font-semibold">Iqamah: {iqamahTime}</p>
						</div>
					</div>
				</div>

				{/* Progress Bar */}
				<div className="mx-auto mt-8 max-w-2xl">
					<div className="h-2 rounded-full bg-white/20">
						<div
							className="h-2 rounded-full bg-yellow-300 transition-all duration-1000"
							style={{
								width: `${Math.max(0, 100 - (timeLeft / (iqamahIntervals[currentPrayerName.toLowerCase() as keyof typeof iqamahIntervals] * 60)) * 100)}%`,
							}}
						/>
					</div>
				</div>
			</div>
		</div>
	);
};

export default IqamahCountdown;
