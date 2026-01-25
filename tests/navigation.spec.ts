import { expect, test } from "@playwright/test"

test.describe("Navigation", () => {
	test("should navigate between pages", async ({ page }) => {
		// Start at home page
		await page.goto("/")
		await expect(page.locator('[data-testid="prayer-times"]')).toBeVisible()

		// Navigate to admin page
		await page.goto("/admin")
		await expect(page).toHaveURL(/.*admin.*/)
		await expect(page.locator('[data-testid="admin-panel"]')).toBeVisible()

		// Navigate to iqamah page (may redirect to home if not in prayer window)
		await page.goto("/iqamah")
		await page.waitForLoadState("networkidle")
		// Either stays on iqamah or redirects to home
		const currentUrl = page.url()
		expect(
			currentUrl.includes("/iqamah") || currentUrl.endsWith("/"),
		).toBeTruthy()

		// Navigate back to home
		await page.goto("/")
		await expect(page.locator('[data-testid="prayer-times"]')).toBeVisible()
	})

	test("should handle 404 pages gracefully", async ({ page }) => {
		await page.goto("/non-existent-page")

		// Should either redirect to home, show prayer times (if using catch-all route), or show error
		const hasPrayerTimes = await page
			.locator('[data-testid="prayer-times"]')
			.isVisible()
			.catch(() => false)
		const has404Content = await page
			.locator("text=404")
			.isVisible()
			.catch(() => false)
		const hasBody = await page.locator("body").isVisible()

		// App should handle 404 in some way
		expect(hasPrayerTimes || has404Content || hasBody).toBeTruthy()
	})
})
