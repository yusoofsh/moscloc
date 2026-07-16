import { expect, test } from "@playwright/test"

test.describe("Navigation", () => {
	test("should navigate between pages", async ({ page }) => {
		// Start at home page
		await page.goto("/", { waitUntil: "domcontentloaded" })
		await expect(page.locator('[data-testid="prayer-times"]')).toBeVisible()

		// Navigate to admin page
		await page.goto("/admin", { waitUntil: "domcontentloaded" })
		await expect(page).toHaveURL(/.*admin.*/)
		await expect(page.locator('[data-testid="admin-panel"]')).toBeVisible()

		// Navigate to iqamah page (may redirect to home if not in prayer window)
		await page.goto("/iqamah", { waitUntil: "domcontentloaded" })
		await Promise.race([
			page
				.locator('[data-testid="iqamah-countdown"]')
				.waitFor({ state: "visible" }),
			page
				.locator('[data-testid="prayer-times"]')
				.waitFor({ state: "visible" }),
		])
		// Either stays on iqamah or redirects to home
		const currentUrl = page.url()
		expect(
			currentUrl.includes("/iqamah") || currentUrl.endsWith("/"),
		).toBeTruthy()

		// Navigate back to home
		await page.goto("/", { waitUntil: "domcontentloaded" })
		await expect(page.locator('[data-testid="prayer-times"]')).toBeVisible()
	})

	test("should handle 404 pages gracefully", async ({ page }) => {
		await page.goto("/non-existent-page", { waitUntil: "domcontentloaded" })

		await expect(page).toHaveURL(/\/non-existent-page$/)
		await expect(page.getByText("Not Found", { exact: true })).toBeVisible()
		await expect(page.locator('[data-testid="prayer-times"]')).toHaveCount(0)
	})

	test("should load a split route chunk on direct admin navigation", async ({
		page,
	}) => {
		await page.goto("/admin", { waitUntil: "networkidle" })

		await expect(page.locator('[data-testid="admin-panel"]')).toBeVisible()
		const resources = await page.evaluate(() =>
			performance.getEntriesByType("resource").map((entry) => entry.name),
		)
		expect(resources).toEqual(
			expect.arrayContaining([
				expect.stringMatching(/\/assets\/admin-[^/]+\.js$/),
			]),
		)
	})
})
