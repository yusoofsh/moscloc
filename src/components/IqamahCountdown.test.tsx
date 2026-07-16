import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"
import { page } from "vitest/browser"
import { render } from "vitest-browser-react"
import { PrayerProvider } from "~/contexts/PrayerContext"
import IqamahCountdown from "./IqamahCountdown"

vi.mock("@tanstack/react-router", () => ({
	Navigate: () => null,
}))

describe("IqamahCountdown", () => {
	beforeEach(() => {
		localStorage.clear()
		vi.useFakeTimers()
		vi.setSystemTime(new Date("2024-01-15T05:05:00.000Z"))
	})

	afterEach(() => {
		vi.useRealTimers()
	})

	it("shows the active prayer countdown with adhan and iqamah times", async () => {
		await render(
			<PrayerProvider>
				<IqamahCountdown prayerName="dhuhr" />
			</PrayerProvider>,
		)

		await expect.element(page.getByTestId("iqamah-countdown")).toBeVisible()
		await expect.element(page.getByText("Menuju Iqamah Dzuhur")).toBeVisible()
		await expect
			.element(page.getByText("Iqamah pada pukul 12:13"))
			.toBeVisible()
		await expect.element(page.getByText("08:00")).toBeVisible()
		await expect.element(page.getByText(/Adzan:\s*12:03/)).toBeVisible()
	})
})
