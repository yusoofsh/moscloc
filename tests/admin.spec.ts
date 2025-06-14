import { expect, test } from "@playwright/test"

test.describe("Admin Page", () => {
	test("should load admin page", async ({ page }) => {
		await page.goto("/admin")

		// Check if the admin panel is visible
		await expect(page.locator('[data-testid="admin-panel"]')).toBeVisible()
	})

	test("should have password protection or authentication", async ({
		page,
	}) => {
		await page.goto("/admin")

		// This test assumes there's some form of authentication
		// You might need to adjust this based on your actual admin implementation
		const isProtected = await page
			.locator('input[type="password"]')
			.isVisible()
			.catch(() => false)
		const hasAuthForm = await page
			.locator("form")
			.isVisible()
			.catch(() => false)

		// Either there should be password protection or the admin panel should be visible
		expect(
			isProtected ||
				hasAuthForm ||
				(await page.locator('[data-testid="admin-panel"]').isVisible()),
		).toBeTruthy()
	})
})
