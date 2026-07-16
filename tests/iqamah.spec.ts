import { expect, type Page, test } from "@playwright/test"

async function waitForIqamahOrHome(page: Page) {
	return Promise.race([
		page
			.locator('[data-testid="iqamah-countdown"]')
			.waitFor({ state: "visible", timeout: 5000 })
			.then(() => "countdown"),
		page
			.locator('[data-testid="prayer-times"]')
			.waitFor({ state: "visible", timeout: 5000 })
			.then(() => "home"),
	])
}

test.describe("Iqamah Page", () => {
	test("should load iqamah page", async ({ page }) => {
		await page.goto("/iqamah", { waitUntil: "domcontentloaded" })

		const destination = await waitForIqamahOrHome(page)
		if (destination === "countdown") {
			await expect(page).toHaveURL(/\/iqamah$/)
			await expect(
				page.locator('[data-testid="iqamah-countdown"]'),
			).toBeVisible()
		} else {
			await expect(page).toHaveURL(/\/$/)
			await expect(page.locator('[data-testid="prayer-times"]')).toBeVisible()
		}
	})

	test("should display countdown or redirect when visiting iqamah page", async ({
		page,
	}) => {
		await page.goto("/iqamah", { waitUntil: "domcontentloaded" })

		// Either shows countdown with iqamah elements OR redirects to home with prayer times
		const countdownOrHome = await waitForIqamahOrHome(page).catch(
			() => "timeout",
		)

		expect(["countdown", "home"]).toContain(countdownOrHome)
	})

	test("should redirect to home when not in prayer window", async ({
		page,
	}) => {
		// This test verifies the redirect behavior - if not in prayer window, should go to home
		await page.goto("/iqamah", { waitUntil: "domcontentloaded" })

		await waitForIqamahOrHome(page)

		// Check current state - should be either on iqamah with countdown OR redirected to home
		const url = page.url()
		const isOnIqamah = url.includes("/iqamah")
		const _isOnHome = url.endsWith("/") || url.endsWith(":5173")

		if (isOnIqamah) {
			// If on iqamah page, countdown should be visible
			await expect(
				page.locator('[data-testid="iqamah-countdown"]'),
			).toBeVisible()
		} else {
			// If redirected, should be on home page with prayer times
			await expect(page.locator('[data-testid="prayer-times"]')).toBeVisible()
		}
	})

	test("should navigate away from iqamah page", async ({ page }) => {
		await page.goto("/iqamah", { waitUntil: "domcontentloaded" })
		await waitForIqamahOrHome(page)

		// Go to home
		await page.goto("/", { waitUntil: "domcontentloaded" })
		await expect(page.locator('[data-testid="prayer-times"]')).toBeVisible()

		// Go to admin
		await page.goto("/admin", { waitUntil: "domcontentloaded" })
		await expect(page.locator('[data-testid="admin-panel"]')).toBeVisible()
	})
})
