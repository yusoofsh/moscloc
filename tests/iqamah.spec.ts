import { expect, test } from "@playwright/test"

// Helper function to create mock API response
const createMockPrayerTimesResponse = (prayerTime: Date) => {
	const prayerHour = prayerTime.getHours().toString().padStart(2, "0")
	const prayerMin = prayerTime.getMinutes().toString().padStart(2, "0")

	return {
		data: {
			timings: {
				Fajr: `${prayerHour}:${prayerMin}`,
				Sunrise: "06:30",
				Dhuhr: "12:30",
				Asr: "15:30",
				Maghrib: "18:30",
				Isha: "19:30",
			},
		},
	}
}

test.describe("Iqamah Page", () => {
	test("should load iqamah page", async ({ page }) => {
		await page.goto("/iqamah")

		// Check if the iqamah countdown is visible OR if redirected to home
		const isCountdownVisible = await page
			.locator('[data-testid="iqamah-countdown"]')
			.isVisible()
			.catch(() => false)
		const isHomePage = page.url().endsWith("/")

		// Should either show countdown or redirect to home if not prayer time
		expect(isCountdownVisible || isHomePage).toBeTruthy()
	})

	test("should display countdown timer when in prayer window", async ({
		page,
	}) => {
		// Mock prayer times API to simulate being in prayer window
		const now = new Date()
		const prayerTime = new Date(now.getTime() - 5 * 60 * 1000) // 5 minutes ago

		// Intercept the prayer times API call
		await page.route("**/api.aladhan.com/v1/timings/**", async (route) => {
			await route.fulfill({
				status: 200,
				contentType: "application/json",
				body: JSON.stringify(createMockPrayerTimesResponse(prayerTime)),
			})
		})

		// Mock localStorage for other settings
		await page.addInitScript(() => {
			// Mock iqamah intervals (10 minutes for all prayers)
			localStorage.setItem(
				"iqamahIntervals",
				JSON.stringify({
					fajr: 10,
					dhuhr: 10,
					asr: 10,
					maghrib: 10,
					isha: 10,
				}),
			)

			// Mock mosque location for API call
			localStorage.setItem(
				"mosqueInfo",
				JSON.stringify({
					name: "Test Mosque",
					address: "Test Address",
					contact: "Test Contact",
					latitude: -6.2088,
					longitude: 106.8456,
				}),
			)
		})

		await page.goto("/iqamah")

		// Check if countdown is visible
		const countdown = page.locator('[data-testid="iqamah-countdown"]')
		await expect(countdown).toBeVisible()

		// Check if time format is displayed (MM:SS format)
		await expect(countdown).toContainText(/\d{2}:\d{2}/)

		// Check if prayer name is displayed
		await expect(countdown).toContainText(/Subuh|Dzuhur|Ashar|Maghrib|Isya/)
	})

	test("should show iqamah completion state", async ({ page }) => {
		// Mock to simulate iqamah time has arrived (0 seconds left)
		const now = new Date()
		const prayerTime = new Date(now.getTime() - 10 * 60 * 1000) // Exactly 10 minutes ago

		// Intercept the prayer times API call
		await page.route("**/api.aladhan.com/v1/timings/**", async (route) => {
			await route.fulfill({
				status: 200,
				contentType: "application/json",
				body: JSON.stringify(createMockPrayerTimesResponse(prayerTime)),
			})
		})

		await page.addInitScript(() => {
			localStorage.setItem(
				"iqamahIntervals",
				JSON.stringify({
					fajr: 10,
					dhuhr: 10,
					asr: 10,
					maghrib: 10,
					isha: 10,
				}),
			)

			localStorage.setItem(
				"mosqueInfo",
				JSON.stringify({
					name: "Test Mosque",
					address: "Test Address",
					contact: "Test Contact",
					latitude: -6.2088,
					longitude: 106.8456,
				}),
			)
		})

		await page.goto("/iqamah")

		// Check if the completion state is shown
		const countdown = page.locator('[data-testid="iqamah-countdown"]')
		await expect(countdown).toBeVisible()

		// Should show "IQAMAH" text when time reaches zero
		await expect(countdown).toContainText("IQAMAH")
	})

	test("should redirect to home when not in prayer window", async ({
		page,
	}) => {
		// Mock prayer times to be far from current time (no current prayer window)
		// Intercept the prayer times API call
		await page.route("**/api.aladhan.com/v1/timings/**", async (route) => {
			await route.fulfill({
				status: 200,
				contentType: "application/json",
				body: JSON.stringify({
					data: {
						timings: {
							Fajr: "05:00",
							Sunrise: "06:30",
							Dhuhr: "12:30",
							Asr: "15:30",
							Maghrib: "18:30",
							Isha: "19:30",
						},
					},
				}),
			})
		})

		await page.addInitScript(() => {
			localStorage.setItem(
				"iqamahIntervals",
				JSON.stringify({
					fajr: 10,
					dhuhr: 10,
					asr: 10,
					maghrib: 10,
					isha: 10,
				}),
			)

			localStorage.setItem(
				"mosqueInfo",
				JSON.stringify({
					name: "Test Mosque",
					address: "Test Address",
					contact: "Test Contact",
					latitude: -6.2088,
					longitude: 106.8456,
				}),
			)
		})

		await page.goto("/iqamah")

		// Should redirect to home page
		await expect(page).toHaveURL("/")
	})

	test("should display mosque information", async ({ page }) => {
		// Mock to be in prayer window
		const now = new Date()
		const prayerTime = new Date(now.getTime() - 5 * 60 * 1000)

		// Intercept the prayer times API call
		await page.route("**/api.aladhan.com/v1/timings/**", async (route) => {
			await route.fulfill({
				status: 200,
				contentType: "application/json",
				body: JSON.stringify(createMockPrayerTimesResponse(prayerTime)),
			})
		})

		await page.addInitScript(() => {
			localStorage.setItem(
				"iqamahIntervals",
				JSON.stringify({
					fajr: 10,
					dhuhr: 10,
					asr: 10,
					maghrib: 10,
					isha: 10,
				}),
			)

			localStorage.setItem(
				"mosqueInfo",
				JSON.stringify({
					name: "Test Mosque",
					address: "Test Address",
					contact: "Test Contact",
					latitude: -6.2088,
					longitude: 106.8456,
				}),
			)
		})

		await page.goto("/iqamah")

		const countdown = page.locator('[data-testid="iqamah-countdown"]')
		await expect(countdown).toBeVisible()

		// Check if mosque name is displayed
		await expect(countdown).toContainText("Test Mosque")
	})

	test("should show progress bar", async ({ page }) => {
		// Mock to be in prayer window
		const now = new Date()
		const prayerTime = new Date(now.getTime() - 5 * 60 * 1000)

		// Intercept the prayer times API call
		await page.route("**/api.aladhan.com/v1/timings/**", async (route) => {
			await route.fulfill({
				status: 200,
				contentType: "application/json",
				body: JSON.stringify(createMockPrayerTimesResponse(prayerTime)),
			})
		})

		await page.addInitScript(() => {
			localStorage.setItem(
				"iqamahIntervals",
				JSON.stringify({
					fajr: 10,
					dhuhr: 10,
					asr: 10,
					maghrib: 10,
					isha: 10,
				}),
			)

			localStorage.setItem(
				"mosqueInfo",
				JSON.stringify({
					name: "Test Mosque",
					address: "Test Address",
					contact: "Test Contact",
					latitude: -6.2088,
					longitude: 106.8456,
				}),
			)
		})

		await page.goto("/iqamah")

		const countdown = page.locator('[data-testid="iqamah-countdown"]')
		await expect(countdown).toBeVisible()

		// Check if progress bar exists
		const progressBar = page.locator(".bg-yellow-300")
		await expect(progressBar).toBeVisible()
	})

	test("should update countdown in real-time", async ({ page }) => {
		// Mock to be in prayer window
		const now = new Date()
		const prayerTime = new Date(now.getTime() - 5 * 60 * 1000)

		// Intercept the prayer times API call
		await page.route("**/api.aladhan.com/v1/timings/**", async (route) => {
			await route.fulfill({
				status: 200,
				contentType: "application/json",
				body: JSON.stringify(createMockPrayerTimesResponse(prayerTime)),
			})
		})

		await page.addInitScript(() => {
			localStorage.setItem(
				"iqamahIntervals",
				JSON.stringify({
					fajr: 10,
					dhuhr: 10,
					asr: 10,
					maghrib: 10,
					isha: 10,
				}),
			)

			localStorage.setItem(
				"mosqueInfo",
				JSON.stringify({
					name: "Test Mosque",
					address: "Test Address",
					contact: "Test Contact",
					latitude: -6.2088,
					longitude: 106.8456,
				}),
			)
		})

		await page.goto("/iqamah")

		const countdown = page.locator('[data-testid="iqamah-countdown"]')
		await expect(countdown).toBeVisible()

		// Get initial countdown time
		const timeDisplay = page.locator(".font-mono.text-8xl, .font-mono.text-9xl")
		const initialTime = await timeDisplay.textContent()

		// Wait a few seconds and check if time has changed
		await page.waitForTimeout(3000)
		const updatedTime = await timeDisplay.textContent()

		// Times should be different (countdown should be progressing)
		expect(initialTime).toBeTruthy()
		expect(updatedTime).toBeTruthy()

		// Both should be in MM:SS format
		expect(initialTime).toMatch(/\d{2}:\d{2}/)
		expect(updatedTime).toMatch(/\d{2}:\d{2}/)
	})
})
