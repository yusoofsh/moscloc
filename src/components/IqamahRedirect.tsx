import { useNavigate } from "@tanstack/react-router"
import { useEffect, useState } from "react"
import { Button } from "~/components/ui/button"
import { usePrayerContext } from "../contexts/PrayerContext"
import { getIqamahRedirectState } from "../lib/iqamahLogic"

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
			const state = getIqamahRedirectState({
				prayerTimes,
				iqamahIntervals,
				redirectDelaySeconds,
			})

			if (state.status === "prompt") {
				setShowRedirectCountdown(true)
				setCountdownSeconds(Math.ceil(state.countdownSeconds))
				return
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
					void navigate({ to: "/iqamah" })
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
				<Button type="button" onClick={() => navigate({ to: "/iqamah" })}>
					Pergi Sekarang
				</Button>
				<Button
					type="button"
					variant="secondary"
					onClick={() => setShowRedirectCountdown(false)}
					className="ml-4"
				>
					Batal
				</Button>
			</div>
		</div>
	)
}

export default IqamahRedirect
