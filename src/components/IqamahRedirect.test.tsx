import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"
import { page } from "vitest/browser"
import { render } from "vitest-browser-react"
import { PrayerProvider } from "~/contexts/PrayerContext"
import IqamahRedirect from "./IqamahRedirect"

const navigate = vi.fn()

vi.mock("@tanstack/react-router", () => ({
	useNavigate: () => navigate,
}))

describe("IqamahRedirect", () => {
	beforeEach(() => {
		localStorage.clear()
		vi.useFakeTimers()
		vi.setSystemTime(new Date("2024-01-15T05:12:56.000Z"))
	})

	afterEach(() => {
		vi.useRealTimers()
	})

	it("keeps one prayer event dismissed for the rest of its redirect window", async () => {
		await render(
			<PrayerProvider>
				<IqamahRedirect redirectDelaySeconds={5} />
			</PrayerProvider>,
		)

		await expect.element(page.getByTestId("iqamah-redirect")).toBeVisible()
		await expect
			.element(page.getByText("Waktu Iqamah Segera Tiba!"))
			.toBeVisible()
		await expect
			.element(page.getByText("Membuka layar iqamah dalam:"))
			.toBeVisible()
		await page.getByRole("button", { name: "Batal" }).click()
		await vi.advanceTimersByTimeAsync(2_000)

		expect(page.getByTestId("iqamah-redirect").query()).toBeNull()
		expect(navigate).not.toHaveBeenCalled()
	})
})
