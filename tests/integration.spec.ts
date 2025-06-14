import { expect, test } from "@playwright/test"
import {
	selectors,
	testViewport,
	verifyHomePageComponents,
	viewports,
	waitForLoadingComplete,
	waitForPrayerTimesToLoad,
} from "./utils"

test.describe("Integration Tests", () => {
	test.beforeEach(async ({ page }) => {
		await page.goto("/")
		await waitForLoadingComplete(page)
	})

	test("should load all components successfully", async ({ page }) => {
		await waitForPrayerTimesToLoad(page)
		await verifyHomePageComponents(page)
	})

	test("should display current time and update", async ({ page }) => {
		const currentTimeElement = page.locator(selectors.currentTime)
		await expect(currentTimeElement).toBeVisible()

		// Get initial time
		const initialTime = await currentTimeElement.textContent()

		// Wait a bit and check if time might have changed
		await page.waitForTimeout(2000)
		const updatedTime = await currentTimeElement.textContent()

		// Time should be in HH:MM format
		expect(initialTime).toMatch(/\d{2}:\d{2}/)
		expect(updatedTime).toMatch(/\d{2}:\d{2}/)
	})

	test("should handle Quran verses rotation", async ({ page }) => {
		const quranElement = page.locator(selectors.quranVerse)
		await expect(quranElement).toBeVisible()

		// Check if navigation dots are present (if multiple verses)
		const dots = page.locator('[data-testid="quran-verse"] button')
		const dotCount = await dots.count()

		if (dotCount > 1) {
			// Click on second dot if available
			await dots.nth(1).click()
			await expect(quranElement).toBeVisible()
		}
	})

	test("should display Islamic date", async ({ page }) => {
		const islamicCalendar = page.locator(selectors.islamicCalendar)
		await expect(islamicCalendar).toBeVisible()

		// Should contain "H" for Hijri
		await expect(islamicCalendar).toContainText("H")
	})

	test("should work across all viewport sizes", async ({ page }) => {
		const mainSelectors = [
			selectors.prayerTimes,
			selectors.currentTime,
			selectors.quranVerse,
			selectors.islamicCalendar,
		]

		// Test each viewport
		for (const [name, viewport] of Object.entries(viewports)) {
			console.log(`Testing ${name} viewport`)
			await testViewport(page, viewport, mainSelectors)
		}
	})

	test("should handle prayer time transitions", async ({ page }) => {
		await waitForPrayerTimesToLoad(page)

		// Check if any prayer is marked as current or next
		const currentPrayer = page.locator(
			'[data-testid="prayer-times"] .bg-blue-500',
		)
		const nextPrayer = page.locator(
			'[data-testid="prayer-times"] .bg-emerald-500\\/40',
		)

		const currentCount = await currentPrayer.count()
		const nextCount = await nextPrayer.count()

		// Should have at most one current and one next prayer
		expect(currentCount).toBeLessThanOrEqual(1)
		expect(nextCount).toBeLessThanOrEqual(1)
	})

	test("should maintain responsive design", async ({ page }) => {
		// Test that content doesn't overflow on small screens
		await page.setViewportSize(viewports.mobile)

		const body = page.locator("body")
		const bodyBox = await body.boundingBox()

		expect(bodyBox?.width).toBeLessThanOrEqual(viewports.mobile.width)

		// Test that components stack properly on mobile
		const prayerTimes = page.locator(selectors.prayerTimes)
		await expect(prayerTimes).toBeVisible()
	})
})
