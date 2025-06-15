import { useNavigate } from "@tanstack/react-router"
import { useEffect, useState } from "react"
import { usePrayerContext } from "../contexts/PrayerContext"

interface IqamahRedirectProps {
	autoRedirect?: boolean
	redirectDelaySeconds?: number
}

const IqamahRedirect: React.FC<IqamahRedirectProps> = ({
	autoRedirect = true,
	redirectDelaySeconds = 5,
}) => {
	const { prayerTimes, iqamahIntervals } = usePrayerContext()
	const navigate = useNavigate()
	const [showRedirectCountdown, setShowRedirectCountdown] = useState(false)
	const [countdownSeconds, setCountdownSeconds] = useState(redirectDelaySeconds)

	useEffect(() => {
		if (!autoRedirect) return

		const checkForIqamahTime = () => {
			const now = new Date()
			const currentTime = now.getHours() * 60 + now.getMinutes()

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
			]

			for (const prayer of prayerSchedule) {
				const [hours, minutes] = prayer.time.split(":").map(Number)
				const prayerMinutes = hours * 60 + minutes
				const interval = iqamahIntervals[prayer.intervalKey]
				const iqamahMinutes = prayerMinutes + interval

				// Check if we're within 30 seconds before iqamah time
				const secondsUntilIqamah =
					(iqamahMinutes - currentTime) * 60 - now.getSeconds()

				if (
					secondsUntilIqamah <= redirectDelaySeconds &&
					secondsUntilIqamah > 0
				) {
					setShowRedirectCountdown(true)
					setCountdownSeconds(Math.ceil(secondsUntilIqamah))
					return
				}
			}

			setShowRedirectCountdown(false)
		}

		checkForIqamahTime()
		const interval = setInterval(checkForIqamahTime, 1000)

		return () => clearInterval(interval)
	}, [prayerTimes, iqamahIntervals, autoRedirect, redirectDelaySeconds])

	useEffect(() => {
		if (!showRedirectCountdown) return

		const countdownInterval = setInterval(() => {
			setCountdownSeconds((prev) => {
				if (prev <= 1) {
					navigate({ to: "/iqamah" })
					return 0
				}
				return prev - 1
			})
		}, 1000)

		return () => clearInterval(countdownInterval)
	}, [showRedirectCountdown, navigate])

	if (!showRedirectCountdown) return null

	return (
		<div
			className="fixed inset-0 z-50 flex items-center justify-center bg-black/80"
			data-testid="iqamah-redirect"
		>
			<div className="rounded-lg bg-white p-4 text-center shadow-2xl">
				<h2 className="mb-4 font-bold text-2xl text-gray-900">
					Waktu Adzan Tiba!
				</h2>
				<p className="mb-6 text-gray-600">Iqamah dalam:</p>
				<div className="mb-6 font-bold text-6xl text-emerald-600">
					{countdownSeconds}
				</div>
				<button
					type="button"
					onClick={() => navigate({ to: "/iqamah" })}
					className="rounded-md bg-emerald-600 px-6 py-2 text-white transition-colors hover:bg-emerald-700"
				>
					Pergi Sekarang
				</button>
				<button
					type="button"
					onClick={() => setShowRedirectCountdown(false)}
					className="ml-4 rounded-md bg-gray-300 px-6 py-2 text-gray-700 transition-colors hover:bg-gray-400"
				>
					Batal
				</button>
			</div>
		</div>
	)
}

export default IqamahRedirect
