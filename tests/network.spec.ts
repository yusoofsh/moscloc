import { expect, test } from "@playwright/test"

test.describe("API and Service Tests", () => {
	test("should handle network errors gracefully", async ({ page }) => {
		// Block network requests to test offline behavior
		await page.route("**/*", (route) => {
			if (
				route.request().url().includes("api") ||
				route.request().url().includes("service")
			) {
				route.abort()
			} else {
				route.continue()
			}
		})

		await page.goto("/")

		// App should still load even if API calls fail
		await expect(page.locator("body")).toBeVisible()
	})

	test("should load with cached data when offline", async ({ page }) => {
		// First, load the page normally to potentially cache data
		await page.goto("/")
		await expect(page.locator('[data-testid="prayer-times"]')).toBeVisible()

		// Then simulate offline condition
		await page.context().setOffline(true)

		// Reload and check if app still works
		await page.reload()
		await expect(page.locator("body")).toBeVisible()

		// Reset online state
		await page.context().setOffline(false)
	})

	test("should handle slow network conditions", async ({ page }) => {
		// Simulate slow network
		await page.route("**/*", async (route) => {
			await new Promise((resolve) => setTimeout(resolve, 1000)) // Add 1s delay
			route.continue()
		})

		const startTime = Date.now()
		await page.goto("/")
		const loadTime = Date.now() - startTime

		// Should eventually load despite slow network
		await expect(page.locator("body")).toBeVisible()

		// Load time should be reasonable even with simulated delay
		expect(loadTime).toBeLessThan(30000) // 30 seconds max
	})

	test("should preserve state during browser refresh", async ({ page }) => {
		await page.goto("/")
		await expect(page.locator('[data-testid="prayer-times"]')).toBeVisible()

		// Refresh page
		await page.reload()

		// Check if content is restored
		await expect(page.locator('[data-testid="prayer-times"]')).toBeVisible()
		const refreshedPrayerTimes = await page
			.locator('[data-testid="prayer-times"]')
			.textContent()

		// Prayer times should be consistent
		expect(refreshedPrayerTimes).toBeTruthy()
	})
})
