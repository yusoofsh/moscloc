import { describe, expect, it } from "vitest"
import { page } from "vitest/browser"
import { render } from "vitest-browser-react"
import "../index.css"
import AnnouncementBanner from "./AnnouncementBanner"

describe("AnnouncementBanner", () => {
	it("provides labelled manual and pause controls with touch-sized targets", async () => {
		await render(<AnnouncementBanner announcements={["Pertama", "Kedua"]} />)

		const next = page.getByRole("button", { name: "Pengumuman berikutnya" })
		const pause = page.getByRole("button", { name: "Jeda pengumuman otomatis" })
		await expect.element(next).toBeVisible()
		await expect.element(pause).toBeVisible()
		expect(
			(await next.element()).getBoundingClientRect().height,
		).toBeGreaterThanOrEqual(44)

		await next.click()
		await expect.element(page.getByText("Kedua")).toBeVisible()
	})

	it("exposes the visible announcement as a polite status update", async () => {
		await render(<AnnouncementBanner announcements={["Pertama", "Kedua"]} />)

		const status = page.getByRole("status")
		await expect.element(status).toHaveAttribute("aria-live", "polite")
		await expect.element(status).toHaveTextContent("Pertama")
	})
})
