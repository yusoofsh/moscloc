import type React from "react"
import {
	createContext,
	type ReactNode,
	useCallback,
	useContext,
	useEffect,
	useMemo,
	useRef,
	useState,
} from "react"
import {
	defaultPrayerSettings,
	defaultPrayerTimes,
	normalizeAnnouncements,
	normalizeEvents,
	normalizeIqamahIntervals,
	normalizeMosqueInfo,
	normalizePrayerSettings,
	normalizeVerses,
	type Event,
	type IqamahIntervals,
	type MosqueInfo,
	type PrayerSettings,
	type PrayerTimes,
	type Verse,
} from "../lib/prayerDomain"
import {
	getBrowserStorage,
	hydratePrayerStorage,
	persistPrayerStorageValue,
} from "../lib/prayerStorage"
import {
	getCurrentAndNextPrayerForTime as calculateCurrentAndNextPrayer,
	millisecondsUntilNextZonedMidnight,
} from "../lib/zonedTime"
import { getPrayerTimes } from "../services/prayerService"

export type {
	Event,
	IqamahIntervals,
	MosqueInfo,
	PrayerSettings,
	PrayerTimes,
	Verse,
} from "../lib/prayerDomain"
export {
	defaultAnnouncements,
	defaultEvents,
	defaultIqamahIntervals,
	defaultMosqueInfo,
	defaultPrayerSettings,
	defaultPrayerTimes,
	defaultVerses,
} from "../lib/prayerDomain"

export type PrayerTimesStatus = "loading" | "fresh" | "stale" | "error"

export interface PrayerContextType {
	mosqueInfo: MosqueInfo
	prayerTimes: PrayerTimes
	prayerTimesStatus: PrayerTimesStatus
	prayerTimesError: string | null
	prayerTimesUpdatedAt: string | null
	announcements: string[]
	events: Event[]
	verses: Verse[]
	prayerSettings: PrayerSettings
	iqamahIntervals: IqamahIntervals
	currentPrayer: string | null
	nextPrayer: string | null
	updateMosqueInfo: (info: MosqueInfo) => void
	updateAnnouncements: (announcements: string[]) => void
	updateEvents: (events: Event[]) => void
	updateVerses: (verses: Verse[]) => void
	updatePrayerSettings: (settings: PrayerSettings) => void
	updateIqamahIntervals: (intervals: IqamahIntervals) => void
}

const PrayerContext = createContext<PrayerContextType | undefined>(undefined)

export type MosqueContentContextType = Pick<
	PrayerContextType,
	| "mosqueInfo"
	| "announcements"
	| "events"
	| "verses"
	| "updateMosqueInfo"
	| "updateAnnouncements"
	| "updateEvents"
	| "updateVerses"
>

export type PrayerScheduleContextType = Pick<
	PrayerContextType,
	| "prayerTimes"
	| "prayerTimesStatus"
	| "prayerTimesError"
	| "prayerTimesUpdatedAt"
	| "prayerSettings"
	| "iqamahIntervals"
	| "currentPrayer"
	| "nextPrayer"
	| "updatePrayerSettings"
	| "updateIqamahIntervals"
>

const MosqueContentContext = createContext<
	MosqueContentContextType | undefined
>(undefined)
const PrayerScheduleContext = createContext<
	PrayerScheduleContextType | undefined
>(undefined)

export const getCurrentAndNextPrayerForTime = (
	times: PrayerTimes,
	now = new Date(),
	timeZone = defaultPrayerSettings.timezonestring,
) => calculateCurrentAndNextPrayer(times, now, timeZone)

export const PrayerProvider: React.FC<{ children: ReactNode }> = ({
	children,
}) => {
	const storageRef = useRef(getBrowserStorage())
	const hydratedRef = useRef<ReturnType<typeof hydratePrayerStorage> | null>(
		null,
	)
	if (!hydratedRef.current) {
		hydratedRef.current = hydratePrayerStorage(storageRef.current)
	}
	const hydrated = hydratedRef.current
	const initialSnapshot = hydrated.prayerTimesSnapshot
	const [mosqueInfo, setMosqueInfo] = useState(hydrated.mosqueInfo)
	const [prayerTimes, setPrayerTimes] = useState(
		initialSnapshot?.times ?? defaultPrayerTimes,
	)
	const prayerTimesRef = useRef(initialSnapshot?.times ?? defaultPrayerTimes)
	const hasSuccessfulTimesRef = useRef(initialSnapshot !== null)
	const requestVersionRef = useRef(0)
	const [prayerTimesStatus, setPrayerTimesStatus] =
		useState<PrayerTimesStatus>("loading")
	const [prayerTimesError, setPrayerTimesError] = useState<string | null>(null)
	const [prayerTimesUpdatedAt, setPrayerTimesUpdatedAt] = useState<
		string | null
	>(initialSnapshot?.updatedAt ?? null)
	const [announcements, setAnnouncements] = useState(hydrated.announcements)
	const [events, setEvents] = useState(hydrated.events)
	const [verses, setVerses] = useState(hydrated.verses)
	const [prayerSettings, setPrayerSettings] = useState(hydrated.prayerSettings)
	const [iqamahIntervals, setIqamahIntervals] = useState(
		hydrated.iqamahIntervals,
	)
	const [currentPrayer, setCurrentPrayer] = useState<string | null>(null)
	const [nextPrayer, setNextPrayer] = useState<string | null>(null)

	const updateCurrentAndNextPrayer = useCallback(
		(times: PrayerTimes) => {
			const current = calculateCurrentAndNextPrayer(
				times,
				new Date(),
				prayerSettings.timezonestring,
			)
			setCurrentPrayer(current.currentPrayer)
			setNextPrayer(current.nextPrayer)
		},
		[prayerSettings.timezonestring],
	)

	useEffect(() => {
		let disposed = false
		let activeRequest: AbortController | undefined
		let midnightTimeout: ReturnType<typeof setTimeout> | undefined

		const refreshPrayerTimes = async () => {
			activeRequest?.abort()
			activeRequest = new AbortController()
			const requestVersion = ++requestVersionRef.current
			setPrayerTimesStatus("loading")
			setPrayerTimesError(null)

			try {
				const times = await getPrayerTimes(
					mosqueInfo.latitude,
					mosqueInfo.longitude,
					prayerSettings,
					{ signal: activeRequest.signal },
				)
				if (disposed || requestVersion !== requestVersionRef.current) return

				const updatedAt = new Date().toISOString()
				setPrayerTimes(times)
				prayerTimesRef.current = times
				hasSuccessfulTimesRef.current = true
				setPrayerTimesUpdatedAt(updatedAt)
				setPrayerTimesStatus("fresh")
				persistPrayerStorageValue(storageRef.current, "prayerTimesSnapshot", {
					times,
					updatedAt,
				})
				updateCurrentAndNextPrayer(times)
			} catch (error) {
				if (
					disposed ||
					requestVersion !== requestVersionRef.current ||
					(error instanceof DOMException && error.name === "AbortError")
				) {
					return
				}
				setPrayerTimesStatus(hasSuccessfulTimesRef.current ? "stale" : "error")
				setPrayerTimesError("Jadwal salat tidak dapat diperbarui")
				updateCurrentAndNextPrayer(prayerTimesRef.current)
			}
		}

		const scheduleMidnightRefresh = () => {
			midnightTimeout = setTimeout(
				() => {
					void refreshPrayerTimes()
					if (!disposed) scheduleMidnightRefresh()
				},
				millisecondsUntilNextZonedMidnight(
					new Date(),
					prayerSettings.timezonestring,
				),
			)
		}

		updateCurrentAndNextPrayer(prayerTimesRef.current)
		void refreshPrayerTimes()
		scheduleMidnightRefresh()
		const prayerUpdateInterval = setInterval(
			() => updateCurrentAndNextPrayer(prayerTimesRef.current),
			60_000,
		)

		return () => {
			disposed = true
			requestVersionRef.current += 1
			activeRequest?.abort()
			if (midnightTimeout) clearTimeout(midnightTimeout)
			clearInterval(prayerUpdateInterval)
		}
	}, [
		mosqueInfo.latitude,
		mosqueInfo.longitude,
		prayerSettings,
		updateCurrentAndNextPrayer,
	])

	const updateMosqueInfo = useCallback((info: MosqueInfo) => {
		const normalized = normalizeMosqueInfo(info)
		setMosqueInfo(normalized)
		persistPrayerStorageValue(storageRef.current, "mosqueInfo", normalized)
	}, [])
	const updateAnnouncements = useCallback((value: string[]) => {
		const normalized = normalizeAnnouncements(value)
		setAnnouncements(normalized)
		persistPrayerStorageValue(storageRef.current, "announcements", normalized)
	}, [])
	const updateEvents = useCallback((value: Event[]) => {
		const normalized = normalizeEvents(value)
		setEvents(normalized)
		persistPrayerStorageValue(storageRef.current, "events", normalized)
	}, [])
	const updateVerses = useCallback((value: Verse[]) => {
		const normalized = normalizeVerses(value)
		setVerses(normalized)
		persistPrayerStorageValue(storageRef.current, "verses", normalized)
	}, [])
	const updatePrayerSettings = useCallback((value: PrayerSettings) => {
		const normalized = normalizePrayerSettings(value)
		setPrayerSettings(normalized)
		persistPrayerStorageValue(storageRef.current, "prayerSettings", normalized)
	}, [])
	const updateIqamahIntervals = useCallback((value: IqamahIntervals) => {
		const normalized = normalizeIqamahIntervals(value)
		setIqamahIntervals(normalized)
		persistPrayerStorageValue(storageRef.current, "iqamahIntervals", normalized)
	}, [])

	const contentValue = useMemo<MosqueContentContextType>(
		() => ({
			mosqueInfo,
			announcements,
			events,
			verses,
			updateMosqueInfo,
			updateAnnouncements,
			updateEvents,
			updateVerses,
		}),
		[
			mosqueInfo,
			announcements,
			events,
			verses,
			updateMosqueInfo,
			updateAnnouncements,
			updateEvents,
			updateVerses,
		],
	)
	const scheduleValue = useMemo<PrayerScheduleContextType>(
		() => ({
			prayerTimes,
			prayerTimesStatus,
			prayerTimesError,
			prayerTimesUpdatedAt,
			prayerSettings,
			iqamahIntervals,
			currentPrayer,
			nextPrayer,
			updatePrayerSettings,
			updateIqamahIntervals,
		}),
		[
			prayerTimes,
			prayerTimesStatus,
			prayerTimesError,
			prayerTimesUpdatedAt,
			prayerSettings,
			iqamahIntervals,
			currentPrayer,
			nextPrayer,
			updatePrayerSettings,
			updateIqamahIntervals,
		],
	)
	const value = useMemo<PrayerContextType>(
		() => ({ ...contentValue, ...scheduleValue }),
		[contentValue, scheduleValue],
	)

	return (
		<MosqueContentContext.Provider value={contentValue}>
			<PrayerScheduleContext.Provider value={scheduleValue}>
				<PrayerContext.Provider value={value}>
					{children}
				</PrayerContext.Provider>
			</PrayerScheduleContext.Provider>
		</MosqueContentContext.Provider>
	)
}

export const usePrayerContext = () => {
	const context = useContext(PrayerContext)
	if (context === undefined) {
		throw new Error("usePrayerContext must be used within a PrayerProvider")
	}
	return context
}

export const useOptionalPrayerContext = () => useContext(PrayerContext)

export const useMosqueContentContext = () => {
	const context = useContext(MosqueContentContext)
	if (context === undefined) {
		throw new Error(
			"useMosqueContentContext must be used within a PrayerProvider",
		)
	}
	return context
}

export const usePrayerScheduleContext = () => {
	const context = useContext(PrayerScheduleContext)
	if (context === undefined) {
		throw new Error(
			"usePrayerScheduleContext must be used within a PrayerProvider",
		)
	}
	return context
}

export const useOptionalPrayerScheduleContext = () =>
	useContext(PrayerScheduleContext)
