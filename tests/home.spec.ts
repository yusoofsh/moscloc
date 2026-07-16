import { expect, test } from "@playwright/test"

test.describe("Home Page", () => {
	test("should load and display prayer times", async ({ page }) => {
		await page.goto("/", { waitUntil: "domcontentloaded" })

		// Check if the main prayer times component is visible
		await expect(page.locator('[data-testid="prayer-times"]')).toBeVisible()

		// Check prayer times contain time format
		await expect(
			page.locator('[data-testid="prayer-times"] .font-mono').first(),
		).toContainText(/\d{2}:\d{2}/)
	})

	test("should display current time", async ({ page }) => {
		await page.goto("/", { waitUntil: "domcontentloaded" })

		// Check if current time component is visible
		await expect(page.locator('[data-testid="current-time"]')).toBeVisible()
	})

	test("should display Quran verse", async ({ page }) => {
		await page.goto("/", { waitUntil: "domcontentloaded" })

		// Check if Quran verse component is visible
		await expect(page.locator('[data-testid="quran-verse"]')).toBeVisible()
	})

	test("should display Islamic calendar", async ({ page }) => {
		await page.goto("/", { waitUntil: "domcontentloaded" })

		// Check if Islamic calendar component is visible
		await expect(page.locator('[data-testid="islamic-calendar"]')).toBeVisible()
	})

	test("should be responsive", async ({ page }) => {
		await page.goto("/", { waitUntil: "domcontentloaded" })

		await page.setViewportSize({ width: 375, height: 667 })
		const prayerGrid = page.locator('[data-testid="prayer-times"] > .grid')
		await expect
			.poll(() =>
				prayerGrid.evaluate(
					(element) =>
						getComputedStyle(element).gridTemplateColumns.split(" ").length,
				),
			)
			.toBe(2)
		expect(
			await page.evaluate(() => document.documentElement.scrollWidth),
		).toBeLessThanOrEqual(375)

		await page.setViewportSize({ width: 1920, height: 1080 })
		await expect
			.poll(() =>
				prayerGrid.evaluate(
					(element) =>
						getComputedStyle(element).gridTemplateColumns.split(" ").length,
				),
			)
			.toBe(6)
		expect(
			await page.evaluate(() => document.documentElement.scrollWidth),
		).toBeLessThanOrEqual(1920)
	})
})
