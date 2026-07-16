import { expect, test } from "@playwright/test"

test.describe("Accessibility", () => {
	test("should have proper heading structure", async ({ page }) => {
		await page.goto("/", { waitUntil: "domcontentloaded" })

		await expect(page.getByRole("heading", { level: 1 })).toHaveText(
			"Masjid Darul Arqom",
		)
	})

	test("should have alt text for images", async ({ page }) => {
		await page.goto("/", { waitUntil: "domcontentloaded" })

		// Check if all images have alt text
		const images = page.locator("img")
		const imageCount = await images.count()

		for (let i = 0; i < imageCount; i++) {
			const img = images.nth(i)
			const altText = await img.getAttribute("alt")
			expect(altText).toBeTruthy()
		}
	})

	test("should render primary text without hiding or transparency", async ({
		page,
	}) => {
		await page.goto("/", { waitUntil: "domcontentloaded" })

		const heading = page.getByRole("heading", { level: 1 })
		await expect(heading).toBeVisible()
		const style = await heading.evaluate((element) => {
			const computed = getComputedStyle(element)
			return { opacity: computed.opacity, visibility: computed.visibility }
		})
		expect(style).toEqual({ opacity: "1", visibility: "visible" })
	})

	test("should be keyboard navigable", async ({ page }) => {
		await page.goto("/", { waitUntil: "domcontentloaded" })

		const skipLink = page.getByRole("button", {
			name: "Lewati ke konten utama",
		})

		await skipLink.focus()
		await expect(skipLink).toBeFocused()

		await page.keyboard.press("Enter")
		await expect(page.locator("#main-content")).toBeFocused()
	})
})
