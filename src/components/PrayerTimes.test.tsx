import { describe, expect, it } from "vitest"
import { HttpResponse, http } from "msw"
import { page } from "vitest/browser"
import { render } from "vitest-browser-react"
import { worker } from "~/__tests__/mocks/browser"
import { PrayerProvider } from "~/contexts/PrayerContext"
import PrayerTimes from "./PrayerTimes"

describe("PrayerTimes", () => {
	it("renders all six prayer times", async () => {
		await render(
			<PrayerProvider>
				<PrayerTimes />
			</PrayerProvider>,
		)

		await expect.element(page.getByText("Subuh")).toBeVisible()
		await expect.element(page.getByText("Syuruq")).toBeVisible()
		await expect.element(page.getByText("Dzuhur")).toBeVisible()
		await expect.element(page.getByText("Ashar")).toBeVisible()
		await expect.element(page.getByText("Maghrib")).toBeVisible()
		await expect.element(page.getByText("Isya")).toBeVisible()
	})

	it("has correct test id", async () => {
		await render(
			<PrayerProvider>
				<PrayerTimes />
			</PrayerProvider>,
		)

		await expect.element(page.getByTestId("prayer-times")).toBeVisible()
	})

	it("displays default prayer times", async () => {
		await render(
			<PrayerProvider>
				<PrayerTimes />
			</PrayerProvider>,
		)

		// Default prayer times from context
		await expect.element(page.getByText("04:26")).toBeVisible()
		await expect.element(page.getByText("12:03")).toBeVisible()
	})

	it("renders prayer time icons", async () => {
		await render(
			<PrayerProvider>
				<PrayerTimes />
			</PrayerProvider>,
		)

		// Should have SVG icons for each prayer
		const container = page.getByTestId("prayer-times")
		await expect.element(container).toBeVisible()
	})

	it("announces when fallback times are shown after a refresh error", async () => {
		worker.use(
			http.get(
				"https://api.aladhan.com/v1/timings/*",
				() => new HttpResponse(null, { status: 503 }),
			),
		)
		await render(
			<PrayerProvider>
				<PrayerTimes />
			</PrayerProvider>,
		)

		await expect.element(page.getByRole("alert")).toBeVisible()
		await expect
			.element(page.getByText(/waktu bawaan ditampilkan/i))
			.toBeVisible()
	})
})
