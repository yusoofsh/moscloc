import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"
import { page } from "vitest/browser"
import { render } from "vitest-browser-react"
import CurrentTime from "./CurrentTime"

describe("CurrentTime", () => {
	beforeEach(() => {
		vi.useFakeTimers()
		vi.setSystemTime(new Date("2024-01-15T14:30:00"))
	})

	afterEach(() => {
		vi.useRealTimers()
	})

	it("renders current time in HH:mm format", async () => {
		await render(<CurrentTime />)

		await expect.element(page.getByText("14:30")).toBeVisible()
	})

	it("has correct test id", async () => {
		await render(<CurrentTime />)

		await expect.element(page.getByTestId("current-time")).toBeVisible()
	})

	it("displays date in Indonesian locale", async () => {
		await render(<CurrentTime />)

		await expect.element(page.getByText(/Senin/i)).toBeVisible()
	})

	it("displays month and year", async () => {
		await render(<CurrentTime />)

		await expect.element(page.getByText(/Januari/i)).toBeVisible()
		await expect.element(page.getByText(/2024/i)).toBeVisible()
	})
})
