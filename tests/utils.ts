import { expect, type Page } from "@playwright/test"

/**
 * Common test utilities for Moscloc Playwright tests
 */

/**
 * Wait for prayer times to load
 */
export async function waitForPrayerTimesToLoad(page: Page) {
	await expect(page.locator('[data-testid="prayer-times"]')).toBeVisible()

	// Wait for actual prayer times to appear (not just loading state)
	await expect(
		page.locator('[data-testid="prayer-times"] .font-mono'),
	).toContainText(/\d{2}:\d{2}/)
}

/**
 * Check if all main components are loaded on home page
 */
export async function verifyHomePageComponents(page: Page) {
	await expect(page.locator('[data-testid="prayer-times"]')).toBeVisible()
	await expect(page.locator('[data-testid="current-time"]')).toBeVisible()
	await expect(page.locator('[data-testid="quran-verse"]')).toBeVisible()
	await expect(page.locator('[data-testid="islamic-calendar"]')).toBeVisible()
}

/**
 * Check if text is readable (basic visibility check)
 */
export async function checkTextReadability(page: Page, selector: string) {
	const element = page.locator(selector)
	await expect(element).toBeVisible()

	const textContent = await element.textContent()
	expect(textContent?.trim()).toBeTruthy()
}

/**
 * Test responsive breakpoints
 */
export const viewports = {
	mobile: { width: 375, height: 667 },
	tablet: { width: 768, height: 1024 },
	desktop: { width: 1920, height: 1080 },
	ultrawide: { width: 2560, height: 1440 },
}

/**
 * Test viewport and verify component visibility
 */
export async function testViewport(
	page: Page,
	viewport: { width: number; height: number },
	testSelectors: string[],
) {
	await page.setViewportSize(viewport)

	for (const selector of testSelectors) {
		await expect(page.locator(selector)).toBeVisible()
	}
}

/**
 * Common prayer time selectors
 */
export const selectors = {
	prayerTimes: '[data-testid="prayer-times"]',
	currentTime: '[data-testid="current-time"]',
	quranVerse: '[data-testid="quran-verse"]',
	islamicCalendar: '[data-testid="islamic-calendar"]',
	adminPanel: '[data-testid="admin-panel"]',
	iqamahCountdown: '[data-testid="iqamah-countdown"]',
	iqamahRedirect: '[data-testid="iqamah-redirect"]',
}

/**
 * Wait for loading states to complete
 */
export async function waitForLoadingComplete(page: Page) {
	// Wait for any loading spinners to disappear
	await page.waitForLoadState("networkidle")

	// Wait for potential loading states to complete
	const loadingElements = page.locator(
		'[data-testid*="loading"], .loading, .spinner',
	)
	if ((await loadingElements.count()) > 0) {
		await expect(loadingElements).toHaveCount(0)
	}
}
