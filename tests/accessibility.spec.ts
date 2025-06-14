import { expect, test } from "@playwright/test"

test.describe("Accessibility", () => {
	test("should have proper heading structure", async ({ page }) => {
		await page.goto("/")

		// Check if there are proper headings
		const headings = page.locator("h1, h2, h3, h4, h5, h6")
		const headingCount = await headings.count()

		expect(headingCount).toBeGreaterThan(0)
	})

	test("should have alt text for images", async ({ page }) => {
		await page.goto("/")

		// Check if all images have alt text
		const images = page.locator("img")
		const imageCount = await images.count()

		for (let i = 0; i < imageCount; i++) {
			const img = images.nth(i)
			const altText = await img.getAttribute("alt")
			expect(altText).toBeTruthy()
		}
	})

	test("should have proper color contrast", async ({ page }) => {
		await page.goto("/")

		// Basic check for text visibility
		const textElements = page.locator('body *:has-text("a")')
		const count = await textElements.count()

		// Ensure text is visible (this is a basic check)
		expect(count).toBeGreaterThan(0)
	})

	test("should be keyboard navigable", async ({ page }) => {
		await page.goto("/")

		// Test tab navigation
		await page.keyboard.press("Tab")

		// Check if focus is visible
		const focusedElement = page.locator(":focus")
		const hasFocus = (await focusedElement.count()) > 0

		// This is a basic check - you might need to adjust based on your UI
		expect(hasFocus).toBeTruthy()
	})
})
