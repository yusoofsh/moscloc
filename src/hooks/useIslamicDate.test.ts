import { renderHook, waitFor } from "@testing-library/react"
import { HttpResponse, http } from "msw"
import { describe, expect, it } from "vitest"
import { server } from "~/__tests__/mocks/server"
import { formatApiDate } from "~/lib/zonedTime"
import { useIslamicDate } from "./useIslamicDate"

describe("useIslamicDate", () => {
	it("returns initial default values", () => {
		const { result } = renderHook(() => useIslamicDate())

		expect(result.current).toHaveProperty("islamicDate")
		expect(result.current).toHaveProperty("islamicMonth")
		expect(result.current).toHaveProperty("islamicYear")
	})

	it("fetches and updates Islamic date from API", async () => {
		const { result } = renderHook(() => useIslamicDate())

		await waitFor(() => {
			expect(result.current.islamicMonth).toBe("Rajab")
		})

		expect(result.current.islamicDate).toBe(15)
		expect(result.current.islamicYear).toBe(1446)
	})

	it("requests the Gregorian date in the configured timezone", async () => {
		let requestedPath = ""
		const timeZone = "Pacific/Kiritimati"
		const expectedDate = formatApiDate(new Date(), timeZone)
		server.use(
			http.get("https://api.aladhan.com/v1/gToH/*", ({ request }) => {
				requestedPath = new URL(request.url).pathname
				return HttpResponse.json({
					data: {
						hijri: {
							day: "15",
							month: { number: 7 },
							year: "1446",
						},
					},
				})
			}),
		)

		renderHook(() => useIslamicDate(timeZone))

		await waitFor(() => expect(requestedPath).toBe(`/v1/gToH/${expectedDate}`))
	})

	it("handles API errors gracefully", async () => {
		server.use(
			http.get("https://api.aladhan.com/v1/gToH/*", () => {
				return new HttpResponse(null, { status: 500 })
			}),
		)

		const { result } = renderHook(() => useIslamicDate())

		// Should keep default values on error
		await waitFor(() => {
			expect(result.current.islamicDate).toBeDefined()
		})

		expect(result.current.islamicMonth).toBeDefined()
	})

	it("keeps default values on network error", async () => {
		server.use(
			http.get("https://api.aladhan.com/v1/gToH/*", () => {
				return HttpResponse.error()
			}),
		)

		const { result } = renderHook(() => useIslamicDate())

		await waitFor(() => {
			expect(result.current.islamicDate).toBe(1)
		})

		expect(result.current.islamicMonth).toBe("Muharram")
		expect(result.current.islamicYear).toBe(1445)
	})
})
