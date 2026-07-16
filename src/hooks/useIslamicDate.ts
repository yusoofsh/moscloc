import { useEffect, useRef, useState } from "react"
import { useOptionalPrayerScheduleContext } from "../contexts/PrayerContext"
import { defaultPrayerSettings } from "../lib/prayerDomain"
import {
	formatApiDate,
	millisecondsUntilNextZonedMidnight,
} from "../lib/zonedTime"

interface IslamicDate {
	islamicDate: number
	islamicMonth: string
	islamicYear: number
}

const defaultIslamicDate: IslamicDate = {
	islamicDate: 1,
	islamicMonth: "Muharram",
	islamicYear: 1445,
}

const islamicMonths = [
	"Muharram",
	"Safar",
	"Rabiul Awal",
	"Rabiul Akhir",
	"Jumadil Awal",
	"Jumadil Akhir",
	"Rajab",
	"Syaban",
	"Ramadhan",
	"Syawal",
	"Dzulqaidah",
	"Dzulhijjah",
]

export const useIslamicDate = (timeZone?: string): IslamicDate => {
	const prayerContext = useOptionalPrayerScheduleContext()
	const configuredTimeZone =
		timeZone ??
		prayerContext?.prayerSettings.timezonestring ??
		defaultPrayerSettings.timezonestring
	const [islamicDate, setIslamicDate] =
		useState<IslamicDate>(defaultIslamicDate)
	const requestVersionRef = useRef(0)

	useEffect(() => {
		let disposed = false
		let activeRequest: AbortController | undefined
		let midnightTimeout: ReturnType<typeof setTimeout> | undefined

		const fetchIslamicDate = async () => {
			activeRequest?.abort()
			activeRequest = new AbortController()
			const requestVersion = ++requestVersionRef.current
			try {
				const date = formatApiDate(new Date(), configuredTimeZone)
				const response = await fetch(
					`https://api.aladhan.com/v1/gToH/${date}`,
					{ signal: activeRequest.signal },
				)
				if (!response.ok) return
				const data = await response.json()
				const hijriDate = data?.data?.hijri
				const day = Number.parseInt(hijriDate?.day, 10)
				const month = Number.parseInt(hijriDate?.month?.number, 10)
				const year = Number.parseInt(hijriDate?.year, 10)
				if (
					disposed ||
					requestVersion !== requestVersionRef.current ||
					!Number.isInteger(day) ||
					month < 1 ||
					month > 12 ||
					!Number.isInteger(year)
				) {
					return
				}
				setIslamicDate({
					islamicDate: day,
					islamicMonth: islamicMonths[month - 1],
					islamicYear: year,
				})
			} catch (error) {
				if (!(error instanceof DOMException && error.name === "AbortError")) {
					// Keep the last successfully rendered date when the network is unavailable.
				}
			}
		}

		const scheduleMidnightRefresh = () => {
			midnightTimeout = setTimeout(
				() => {
					void fetchIslamicDate()
					if (!disposed) scheduleMidnightRefresh()
				},
				millisecondsUntilNextZonedMidnight(new Date(), configuredTimeZone),
			)
		}

		void fetchIslamicDate()
		scheduleMidnightRefresh()
		return () => {
			disposed = true
			requestVersionRef.current += 1
			activeRequest?.abort()
			if (midnightTimeout) clearTimeout(midnightTimeout)
		}
	}, [configuredTimeZone])

	return islamicDate
}
