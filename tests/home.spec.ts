import { expect, test } from "@playwright/test"

test.describe("Home Page", () => {
	test("should load and display prayer times", async ({ page }) => {
		await page.goto("/")

		// Check if the main prayer times component is visible
		await expect(page.locator('[data-testid="prayer-times"]')).toBeVisible()

		// Check prayer times contain time format
		await expect(
			page.locator('[data-testid="prayer-times"] .font-mono').first(),
		).toContainText(/\d{2}:\d{2}/)
	})

	test("should display current time", async ({ page }) => {
		await page.goto("/")

		// Check if current time component is visible
		await expect(page.locator('[data-testid="current-time"]')).toBeVisible()
	})

	test("should display Quran verse", async ({ page }) => {
		await page.goto("/")

		// Check if Quran verse component is visible
		await expect(page.locator('[data-testid="quran-verse"]')).toBeVisible()
	})

	test("should display Islamic calendar", async ({ page }) => {
		await page.goto("/")

		// Check if Islamic calendar component is visible
		await expect(page.locator('[data-testid="islamic-calendar"]')).toBeVisible()
	})

	test("should be responsive", async ({ page }) => {
		await page.goto("/")

		// Test mobile viewport
		await page.setViewportSize({ width: 375, height: 667 })
		await expect(page.locator("body")).toBeVisible()

		// Test tablet viewport
		await page.setViewportSize({ width: 768, height: 1024 })
		await expect(page.locator("body")).toBeVisible()

		// Test desktop viewport
		await page.setViewportSize({ width: 1920, height: 1080 })
		await expect(page.locator("body")).toBeVisible()
	})
})
