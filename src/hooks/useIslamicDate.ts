import { useEffect, useState } from "react"

interface IslamicDate {
	islamicDate: number
	islamicMonth: string
	islamicYear: number
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

export const useIslamicDate = (): IslamicDate => {
	const [islamicDate, setIslamicDate] = useState<IslamicDate>({
		islamicDate: 1,
		islamicMonth: "Muharram",
		islamicYear: 1445,
	})

	useEffect(() => {
		const fetchIslamicDate = async () => {
			try {
				const today = new Date()
				const response = await fetch(
					`https://api.aladhan.com/v1/gToH/${today.getDate()}-${today.getMonth() + 1}-${today.getFullYear()}`,
				)

				if (response.ok) {
					const data = await response.json()
					const hijriDate = data.data.hijri

					setIslamicDate({
						islamicDate: Number.parseInt(hijriDate.day, 10),
						islamicMonth:
							islamicMonths[Number.parseInt(hijriDate.month.number, 10) - 1],
						islamicYear: Number.parseInt(hijriDate.year, 10),
					})
				}
			} catch (error) {
				console.error("Failed to fetch Islamic date:", error)
			}
		}

		void fetchIslamicDate()

		// Update daily at midnight
		const now = new Date()
		const tomorrow = new Date(now)
		tomorrow.setDate(tomorrow.getDate() + 1)
		tomorrow.setHours(0, 0, 0, 0)

		const msUntilMidnight = tomorrow.getTime() - now.getTime()

		let dailyUpdateInterval: ReturnType<typeof setInterval> | undefined

		const timeoutId = setTimeout(() => {
			void fetchIslamicDate()
			dailyUpdateInterval = setInterval(
				() => {
					void fetchIslamicDate()
				},
				24 * 60 * 60 * 1000,
			)
		}, msUntilMidnight)

		return () => {
			clearTimeout(timeoutId)
			if (dailyUpdateInterval) {
				clearInterval(dailyUpdateInterval)
			}
		}
	}, [])

	return islamicDate
}
