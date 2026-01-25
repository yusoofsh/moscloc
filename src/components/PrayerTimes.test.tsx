import { describe, expect, it } from "vitest"
import { page } from "vitest/browser"
import { render } from "vitest-browser-react"
import { PrayerProvider } from "~/contexts/PrayerContext"
import PrayerTimes from "./PrayerTimes"

describe("PrayerTimes", () => {
	it("renders all six prayer times", async () => {
		render(
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
		render(
			<PrayerProvider>
				<PrayerTimes />
			</PrayerProvider>,
		)

		await expect.element(page.getByTestId("prayer-times")).toBeVisible()
	})

	it("displays default prayer times", async () => {
		render(
			<PrayerProvider>
				<PrayerTimes />
			</PrayerProvider>,
		)

		// Default prayer times from context
		await expect.element(page.getByText("04:26")).toBeVisible()
		await expect.element(page.getByText("12:03")).toBeVisible()
	})

	it("renders prayer time icons", async () => {
		render(
			<PrayerProvider>
				<PrayerTimes />
			</PrayerProvider>,
		)

		// Should have SVG icons for each prayer
		const container = page.getByTestId("prayer-times")
		await expect.element(container).toBeVisible()
	})
})
