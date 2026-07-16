import { useCallback, useEffect, useState } from "react"

interface UseRotatingContentOptions {
	itemCount: number
	intervalMs: number
}

export function useRotatingContent({
	itemCount,
	intervalMs,
}: UseRotatingContentOptions) {
	const [currentIndex, setCurrentIndex] = useState(0)
	const [isPaused, setIsPaused] = useState(false)

	useEffect(() => {
		if (typeof window === "undefined" || !window.matchMedia) return

		const motionPreference = window.matchMedia(
			"(prefers-reduced-motion: reduce)",
		)
		if (motionPreference.matches) setIsPaused(true)

		const pauseForReducedMotion = (event: MediaQueryListEvent) => {
			if (event.matches) setIsPaused(true)
		}

		motionPreference.addEventListener("change", pauseForReducedMotion)
		return () =>
			motionPreference.removeEventListener("change", pauseForReducedMotion)
	}, [])

	useEffect(() => {
		setCurrentIndex((index) => Math.min(index, Math.max(0, itemCount - 1)))
	}, [itemCount])

	useEffect(() => {
		if (isPaused || itemCount <= 1) return

		const timer = window.setInterval(() => {
			setCurrentIndex((index) => (index + 1) % itemCount)
		}, intervalMs)

		return () => window.clearInterval(timer)
	}, [intervalMs, isPaused, itemCount])

	const goTo = useCallback(
		(index: number) => {
			setCurrentIndex(Math.min(Math.max(index, 0), Math.max(0, itemCount - 1)))
		},
		[itemCount],
	)

	const previous = useCallback(() => {
		setCurrentIndex((index) =>
			itemCount > 0 ? (index - 1 + itemCount) % itemCount : 0,
		)
	}, [itemCount])

	const next = useCallback(() => {
		setCurrentIndex((index) => (itemCount > 0 ? (index + 1) % itemCount : 0))
	}, [itemCount])

	const togglePaused = useCallback(() => setIsPaused((paused) => !paused), [])

	return { currentIndex, goTo, isPaused, next, previous, togglePaused }
}
