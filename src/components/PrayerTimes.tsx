import { Moon, Sun, Sunrise, Sunset } from "lucide-react"
import type React from "react"
import { useEffect, useState } from "react"
import { usePrayerContext } from "../contexts/PrayerContext"

interface PrayerTime {
	name: string
	time: string
	icon: React.ReactNode
}

const PrayerTimes: React.FC = () => {
	const { prayerTimes, currentPrayer, nextPrayer } = usePrayerContext()
	const [_currentTime, setCurrentTime] = useState(new Date())
	const [timeLeft, setTimeLeft] = useState("")

	useEffect(() => {
		const timer = setInterval(() => {
			setCurrentTime(new Date())
		}, 1000)

		return () => clearInterval(timer)
	}, [])

	useEffect(() => {
		const calculateTimeLeft = () => {
			if (!nextPrayer) return ""

			const now = new Date()
			const prayerTimeMap: { [key: string]: string } = {
				subuh: prayerTimes.fajr,
				syuruq: prayerTimes.sunrise,
				dzuhur: prayerTimes.dhuhr,
				ashar: prayerTimes.asr,
				maghrib: prayerTimes.maghrib,
				isya: prayerTimes.isha,
			}

			const nextPrayerTime = prayerTimeMap[nextPrayer.toLowerCase()]
			if (!nextPrayerTime) return ""

			const [hours, minutes] = nextPrayerTime.split(":").map(Number)
			const nextPrayerDate = new Date()
			nextPrayerDate.setHours(hours, minutes, 0, 0)

			// If prayer time has passed today, set it for tomorrow
			if (nextPrayerDate <= now) {
				nextPrayerDate.setDate(nextPrayerDate.getDate() + 1)
			}

			const timeDiff = nextPrayerDate.getTime() - now.getTime()
			const hoursLeft = Math.floor(timeDiff / (1000 * 60 * 60))
			const minutesLeft = Math.floor(
				(timeDiff % (1000 * 60 * 60)) / (1000 * 60),
			)
			const secondsLeft = Math.floor((timeDiff % (1000 * 60)) / 1000)

			return `${hoursLeft.toString().padStart(2, "0")}:${minutesLeft.toString().padStart(2, "0")}:${secondsLeft.toString().padStart(2, "0")}`
		}

		// Initialize immediately
		setTimeLeft(calculateTimeLeft())

		const timer = setInterval(() => {
			setTimeLeft(calculateTimeLeft())
		}, 1000)

		return () => clearInterval(timer)
	}, [nextPrayer, prayerTimes])

	const prayers: PrayerTime[] = [
		{
			name: "Subuh",
			time: prayerTimes.fajr,
			icon: <Sunrise size={38} />,
		},
		{
			name: "Syuruq",
			time: prayerTimes.sunrise,
			icon: <Sun size={38} />,
		},
		{
			name: "Dzuhur",
			time: prayerTimes.dhuhr,
			icon: <Sun size={38} />,
		},
		{
			name: "Ashar",
			time: prayerTimes.asr,
			icon: <Sun size={38} />,
		},
		{
			name: "Maghrib",
			time: prayerTimes.maghrib,
			icon: <Sunset size={38} />,
		},
		{
			name: "Isya",
			time: prayerTimes.isha,
			icon: <Moon size={38} />,
		},
	]

	const isCurrentPrayer = (prayerName: string) => {
		// Disable current prayer highlighting for Syuruq
		if (currentPrayer?.toLowerCase() === "syuruq") {
			return false
		}
		return currentPrayer?.toLowerCase() === prayerName.toLowerCase()
	}

	const isNextPrayer = (prayerName: string) => {
		return nextPrayer?.toLowerCase() === prayerName.toLowerCase()
	}

	return (
		<div
			className="rounded-3xl border border-white/20 bg-white/15 p-4 backdrop-blur-md lg:p-6"
			data-testid="prayer-times"
		>
			<div className="grid grid-cols-2 gap-6 lg:grid-cols-6">
				{prayers.map((prayer) => (
					<div
						key={prayer.name}
						className={`relative rounded-2xl p-6 text-center transition-all duration-500 lg:p-4 ${
							isCurrentPrayer(prayer.name)
								? "scale-110 border-4 border-blue-300 bg-blue-500 text-white"
								: isNextPrayer(prayer.name)
									? "border-2 border-emerald-300 bg-emerald-500/40 text-white"
									: "border border-white/30 bg-white/25 text-white"
						} `}
					>
						{isCurrentPrayer(prayer.name) && (
							<div className="-top-3 -right-3 absolute animate-pulse rounded-full bg-red-400 px-3 py-2 font-bold text-sm text-white">
								SEKARANG
							</div>
						)}

						{isNextPrayer(prayer.name) && timeLeft && (
							<div className="-right-3 -top-3 absolute rounded-full bg-emerald-600 px-3 py-2 font-bold font-mono text-sm text-white lg:text-lg">
								{timeLeft}
							</div>
						)}

						{/* Icon */}
						<div className="mb-2 flex justify-center">{prayer.icon}</div>

						{/* Main time display */}
						<div className="mb-2 font-bold font-mono text-2xl lg:text-3xl xl:text-4xl 2xl:text-5xl">
							{prayer.time}
						</div>

						{/* Prayer name and Arabic text as subtitle */}
						<div className="flex flex-col items-center gap-2 text-base lg:text-lg xl:text-xl 2xl:text-2xl">
							<div className="font-bold">{prayer.name}</div>
						</div>
					</div>
				))}
			</div>
		</div>
	)
}

export default PrayerTimes
