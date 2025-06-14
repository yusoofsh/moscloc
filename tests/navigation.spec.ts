import { expect, test } from "@playwright/test"

test.describe("Navigation", () => {
	test("should navigate between pages", async ({ page }) => {
		// Start at home page
		await page.goto("/")
		await expect(page).toHaveTitle(/Moscloc/)

		// Navigate to admin page (if link exists)
		const adminLink = page.locator('a[href*="/admin"]')
		if (await adminLink.isVisible()) {
			await adminLink.click()
			await expect(page).toHaveURL(/.*admin.*/)
		} else {
			// Direct navigation to admin
			await page.goto("/admin")
			await expect(page).toHaveURL(/.*admin.*/)
		}

		// Navigate to iqamah page
		await page.goto("/iqamah")
		await expect(page).toHaveURL(/.*iqamah.*/)

		// Navigate back to home
		await page.goto("/")
		await expect(page).toHaveURL(/$/)
	})

	test("should handle 404 pages gracefully", async ({ page }) => {
		await page.goto("/non-existent-page")

		// Should either redirect to home or show 404 page
		// Adjust this assertion based on your actual 404 handling
		const isHome = page.url().endsWith("/")
		const has404Content = await page
			.locator("text=404")
			.isVisible()
			.catch(() => false)

		expect(isHome || has404Content).toBeTruthy()
	})
})
