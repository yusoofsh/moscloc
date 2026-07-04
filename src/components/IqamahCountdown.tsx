import { Navigate } from "@tanstack/react-router"
import { useEffect, useState } from "react"
import { usePrayerContext } from "../contexts/PrayerContext"
import {
	getIqamahCountdownState,
	type IqamahCountdownState,
} from "../lib/iqamahLogic"

interface IqamahCountdownProps {
	prayerName?: string
	onComplete?: () => void
}

const IqamahCountdown: React.FC<IqamahCountdownProps> = ({
	prayerName,
	onComplete,
}) => {
	const { prayerTimes, iqamahIntervals, mosqueInfo } = usePrayerContext()
	const [iqamahState, setIqamahState] = useState<IqamahCountdownState>({
		status: "inactive",
	})
	const [hasCalculated, setHasCalculated] = useState(false)

	useEffect(() => {
		setHasCalculated(false)

		const calculateTimeLeft = () => {
			const state = getIqamahCountdownState({
				prayerTimes,
				iqamahIntervals,
				prayerName,
			})

			setIqamahState(state)

			if (state.status === "iqamah") {
				onComplete?.()
			}

			setHasCalculated(true)
		}

		calculateTimeLeft()
		const interval = setInterval(calculateTimeLeft, 1000)

		return () => clearInterval(interval)
	}, [prayerTimes, iqamahIntervals, prayerName, onComplete])

	const formatTime = (seconds: number) => {
		const mins = Math.floor(seconds / 60)
		const secs = seconds % 60
		return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`
	}

	if (!hasCalculated) {
		return null
	}

	if (iqamahState.status === "inactive") {
		return <Navigate to="/" />
	}

	if (iqamahState.status === "iqamah") {
		return (
			<div
				className="flex min-h-screen items-center justify-center bg-gradient-to-br from-green-900 via-emerald-900 to-green-800"
				data-testid="iqamah-countdown"
			>
				<div className="text-center text-white">
					<h1 className="mb-4 animate-pulse font-bold text-6xl">IQAMAH</h1>
					<p className="mb-2 text-3xl">{iqamahState.prayerName}</p>
					<p className="text-xl opacity-80">{mosqueInfo.name}</p>
				</div>
			</div>
		)
	}

	return (
		<div
			className="flex min-h-screen items-center justify-center bg-gradient-to-br from-blue-900 via-purple-900 to-blue-800 p-4"
			data-testid="iqamah-countdown"
		>
			<div className="w-full max-w-4xl text-center text-white">
				{/* Mosque Info */}
				<div className="mb-8">
					<h2 className="mb-2 font-semibold text-2xl">{mosqueInfo.name}</h2>
					<p className="text-lg opacity-80">{mosqueInfo.address}</p>
				</div>

				{/* Prayer Name */}
				<div className="mb-8">
					<h1 className="mb-4 font-bold text-4xl md:text-5xl">
						Menuju Iqamah {iqamahState.prayerName}
					</h1>
					<p className="text-xl opacity-90">
						Iqamah pada pukul {iqamahState.iqamahTime}
					</p>
				</div>

				{/* Countdown Display */}
				<div className="mb-8">
					<div className="rounded-3xl bg-white/10 p-4 shadow-2xl backdrop-blur-sm lg:p-6">
						<div className="mb-4 font-bold font-mono text-8xl text-yellow-300 md:text-9xl">
							{formatTime(iqamahState.timeLeftSeconds)}
						</div>
						<p className="font-semibold text-2xl md:text-3xl">
							{Math.floor(iqamahState.timeLeftSeconds / 60) === 0
								? "Detik"
								: "Menit:Detik"}
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
							<p className="font-semibold">Adzan: {iqamahState.adhanTime}</p>
						</div>
						<div>
							<p className="font-semibold">Iqamah: {iqamahState.iqamahTime}</p>
						</div>
					</div>
				</div>

				{/* Progress Bar */}
				<div className="mx-auto mt-8 max-w-2xl">
					<div className="h-2 rounded-full bg-white/20">
						<div
							className="h-2 rounded-full bg-yellow-300 transition-all duration-1000"
							style={{
								width: `${Math.max(0, 100 - (iqamahState.timeLeftSeconds / iqamahState.iqamahIntervalSeconds) * 100)}%`,
							}}
						/>
					</div>
				</div>
			</div>
		</div>
	)
}

export default IqamahCountdown
