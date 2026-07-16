import { act, renderHook } from "@testing-library/react"
import { beforeEach, describe, expect, it, vi } from "vitest"
import { useRotatingContent } from "./useRotatingContent"

describe("useRotatingContent", () => {
	beforeEach(() => {
		vi.useFakeTimers()
		Object.defineProperty(window, "matchMedia", {
			configurable: true,
			value: vi.fn().mockReturnValue({
				matches: false,
				addEventListener: vi.fn(),
				removeEventListener: vi.fn(),
			}),
		})
	})

	it("rotates through content at the requested cadence", () => {
		const { result } = renderHook(() =>
			useRotatingContent({ itemCount: 3, intervalMs: 10_000 }),
		)

		act(() => vi.advanceTimersByTime(10_000))

		expect(result.current.currentIndex).toBe(1)
	})

	it("clamps the current page when content shrinks", () => {
		const { result, rerender } = renderHook(
			({ itemCount }) => useRotatingContent({ itemCount, intervalMs: 10_000 }),
			{ initialProps: { itemCount: 3 } },
		)

		act(() => result.current.goTo(2))
		rerender({ itemCount: 1 })

		expect(result.current.currentIndex).toBe(0)
	})

	it("does not auto-rotate while paused", () => {
		const { result } = renderHook(() =>
			useRotatingContent({ itemCount: 3, intervalMs: 10_000 }),
		)

		act(() => result.current.togglePaused())
		act(() => vi.advanceTimersByTime(20_000))

		expect(result.current.currentIndex).toBe(0)
		expect(result.current.isPaused).toBe(true)
	})

	it("starts paused when reduced motion is preferred", () => {
		vi.mocked(window.matchMedia).mockReturnValue({
			matches: true,
			addEventListener: vi.fn(),
			removeEventListener: vi.fn(),
		} as unknown as MediaQueryList)

		const { result } = renderHook(() =>
			useRotatingContent({ itemCount: 3, intervalMs: 10_000 }),
		)

		expect(result.current.isPaused).toBe(true)
	})
})
