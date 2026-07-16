import { useNavigate } from "@tanstack/react-router"
import { useEffect, useRef, useState } from "react"
import { Button } from "~/components/ui/button"
import { usePrayerContext } from "../contexts/PrayerContext"
import {
	getNextIqamahRedirectEvent,
	type IqamahRedirectEvent,
} from "../lib/iqamahLogic"

interface IqamahRedirectProps {
	autoRedirect?: boolean
	redirectDelaySeconds?: number
}

interface VisiblePrompt {
	event: IqamahRedirectEvent
	countdownSeconds: number
}

const IqamahRedirect: React.FC<IqamahRedirectProps> = ({
	autoRedirect = true,
	redirectDelaySeconds = 5,
}) => {
	const { prayerTimes, iqamahIntervals, prayerSettings } = usePrayerContext()
	const navigate = useNavigate()
	const [prompt, setPrompt] = useState<VisiblePrompt | null>(null)
	const dismissedEventIdRef = useRef<string | null>(null)

	useEffect(() => {
		if (!autoRedirect) {
			setPrompt(null)
			return
		}

		let disposed = false
		let timer: ReturnType<typeof setTimeout> | undefined

		const schedule = (activeEvent?: IqamahRedirectEvent) => {
			if (disposed) return
			const nowEpochMs = Date.now()
			const event =
				activeEvent ??
				getNextIqamahRedirectEvent({
					prayerTimes,
					iqamahIntervals,
					redirectDelaySeconds,
					timeZone: prayerSettings.timezonestring,
					now: new Date(nowEpochMs),
				})

			if (dismissedEventIdRef.current === event.id) {
				setPrompt(null)
				const delay = Math.max(1, event.deadlineEpochMs - nowEpochMs + 1)
				timer = setTimeout(() => schedule(), delay)
				return
			}

			if (nowEpochMs < event.promptStartsAtEpochMs) {
				setPrompt(null)
				timer = setTimeout(
					() => schedule(event),
					Math.max(1, event.promptStartsAtEpochMs - nowEpochMs),
				)
				return
			}

			if (nowEpochMs >= event.deadlineEpochMs) {
				void navigate({ to: "/iqamah" })
				return
			}

			setPrompt({
				event,
				countdownSeconds: Math.ceil(
					(event.deadlineEpochMs - nowEpochMs) / 1000,
				),
			})
			timer = setTimeout(
				() => schedule(event),
				Math.min(1000, Math.max(1, event.deadlineEpochMs - nowEpochMs)),
			)
		}

		schedule()
		return () => {
			disposed = true
			if (timer) clearTimeout(timer)
		}
	}, [
		prayerTimes,
		iqamahIntervals,
		prayerSettings.timezonestring,
		autoRedirect,
		redirectDelaySeconds,
		navigate,
	])

	if (!prompt) return null

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
					{prompt.countdownSeconds}
				</div>
				<Button type="button" onClick={() => navigate({ to: "/iqamah" })}>
					Pergi Sekarang
				</Button>
				<Button
					type="button"
					variant="secondary"
					onClick={() => {
						dismissedEventIdRef.current = prompt.event.id
						setPrompt(null)
					}}
					className="ml-4"
				>
					Batal
				</Button>
			</div>
		</div>
	)
}

export default IqamahRedirect
