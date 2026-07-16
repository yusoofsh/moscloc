import type React from "react"
import { useEffect, useState } from "react"
import { useOptionalPrayerScheduleContext } from "../contexts/PrayerContext"
import { defaultPrayerSettings } from "../lib/prayerDomain"
import { formatZonedClock, formatZonedLongDate } from "../lib/zonedTime"

const CurrentTime: React.FC = () => {
	const prayerContext = useOptionalPrayerScheduleContext()
	const timeZone =
		prayerContext?.prayerSettings.timezonestring ??
		defaultPrayerSettings.timezonestring
	const [currentTime, setCurrentTime] = useState(new Date())

	useEffect(() => {
		const timer = setInterval(() => {
			setCurrentTime(new Date())
		}, 1000)

		return () => clearInterval(timer)
	}, [])

	return (
		<div className="text-right" data-testid="current-time">
			<div className="mb-3 font-bold font-mono text-4xl text-white lg:text-5xl xl:text-6xl 2xl:text-7xl">
				{formatZonedClock(currentTime, timeZone)}
			</div>
			<div className="font-bold text-white text-xl lg:text-2xl xl:text-3xl 2xl:text-4xl">
				{formatZonedLongDate(currentTime, timeZone)}
			</div>
		</div>
	)
}

export default CurrentTime
