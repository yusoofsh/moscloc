import { expect, test } from "@playwright/test"

test.describe("Iqamah Page", () => {
	test("should load iqamah page", async ({ page }) => {
		await page.goto("/iqamah")

		// Check if the iqamah countdown is visible OR if redirected to home
		// (depends on whether we're in a prayer window)
		const isCountdownVisible = await page
			.locator('[data-testid="iqamah-countdown"]')
			.isVisible()
			.catch(() => false)
		const isRedirectedToHome = await page
			.locator('[data-testid="prayer-times"]')
			.isVisible()
			.catch(() => false)

		// Should either show countdown or redirect to home if not prayer time
		expect(isCountdownVisible || isRedirectedToHome).toBeTruthy()
	})

	test("should display countdown or redirect when visiting iqamah page", async ({
		page,
	}) => {
		await page.goto("/iqamah")

		// Wait for navigation to complete
		await page.waitForLoadState("networkidle")

		// Either shows countdown with iqamah elements OR redirects to home with prayer times
		const countdownOrHome = await Promise.race([
			page
				.locator('[data-testid="iqamah-countdown"]')
				.waitFor({ state: "visible", timeout: 5000 })
				.then(() => "countdown"),
			page
				.locator('[data-testid="prayer-times"]')
				.waitFor({ state: "visible", timeout: 5000 })
				.then(() => "home"),
		]).catch(() => "timeout")

		expect(["countdown", "home"]).toContain(countdownOrHome)
	})

	test("should redirect to home when not in prayer window", async ({
		page,
	}) => {
		// This test verifies the redirect behavior - if not in prayer window, should go to home
		await page.goto("/iqamah")

		// Wait for any navigation/redirect to complete
		await page.waitForLoadState("networkidle")

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
		await page.goto("/iqamah")
		await page.waitForLoadState("networkidle")

		// Go to home
		await page.goto("/")
		await expect(page.locator('[data-testid="prayer-times"]')).toBeVisible()

		// Go to admin
		await page.goto("/admin")
		await expect(page.locator('[data-testid="admin-panel"]')).toBeVisible()
	})
})
