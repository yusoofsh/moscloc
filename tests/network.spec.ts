import { expect, type Page, test } from "@playwright/test"

const apiPrayerTimes = ["03:11", "05:22", "11:33", "14:44", "17:55", "19:06"]
const defaultPrayerTimes = [
	"04:26",
	"05:50",
	"12:03",
	"15:03",
	"17:58",
	"18:59",
]

function prayerTimes(page: Page) {
	return page.locator(
		'[data-testid="prayer-times"] > .grid > div > .font-mono.text-2xl',
	)
}

function aladhanResponse() {
	return {
		data: {
			timings: {
				Fajr: apiPrayerTimes[0],
				Sunrise: apiPrayerTimes[1],
				Dhuhr: apiPrayerTimes[2],
				Asr: apiPrayerTimes[3],
				Maghrib: apiPrayerTimes[4],
				Isha: apiPrayerTimes[5],
			},
		},
	}
}

test.describe("API and Service Tests", () => {
	test("should render deterministic fallback times when the API fails", async ({
		page,
	}) => {
		let requestCount = 0
		await page.route("**/api.aladhan.com/**", async (route) => {
			requestCount += 1
			await route.abort("failed")
		})

		await page.goto("/", { waitUntil: "domcontentloaded" })

		await expect(prayerTimes(page)).toHaveText(defaultPrayerTimes)
		expect(requestCount).toBeGreaterThan(0)
	})

	test("should request configured coordinates and render the API response", async ({
		page,
	}) => {
		let requestedUrl: URL | undefined
		await page.route("**/api.aladhan.com/**", async (route) => {
			requestedUrl = new URL(route.request().url())
			await route.fulfill({ json: aladhanResponse() })
		})

		await page.goto("/", { waitUntil: "domcontentloaded" })

		await expect(prayerTimes(page)).toHaveText(apiPrayerTimes)
		expect(requestedUrl?.searchParams.get("latitude")).toBe("-8.0679373")
		expect(requestedUrl?.searchParams.get("longitude")).toBe("112.5988417")
		expect(requestedUrl?.searchParams.get("timezonestring")).toBe(
			"Asia/Jakarta",
		)
	})

	test("should keep the display usable while a slow API response is pending", async ({
		page,
	}) => {
		await page.route("**/api.aladhan.com/**", async (route) => {
			await new Promise((resolve) => setTimeout(resolve, 500))
			await route.fulfill({ json: aladhanResponse() })
		})

		await page.goto("/", { waitUntil: "domcontentloaded" })
		await expect(page.getByRole("heading", { level: 1 })).toHaveText(
			"Masjid Darul Arqom",
		)
		await expect(prayerTimes(page)).toHaveText(apiPrayerTimes)
	})

	test("should refetch prayer times after a browser refresh", async ({
		page,
	}) => {
		let requestCount = 0
		await page.route("**/api.aladhan.com/**", async (route) => {
			requestCount += 1
			await route.fulfill({ json: aladhanResponse() })
		})

		await page.goto("/", { waitUntil: "domcontentloaded" })
		await expect(prayerTimes(page)).toHaveText(apiPrayerTimes)
		const requestsBeforeReload = requestCount
		await page.reload({ waitUntil: "domcontentloaded" })

		await expect(prayerTimes(page)).toHaveText(apiPrayerTimes)
		expect(requestCount).toBeGreaterThan(requestsBeforeReload)
	})
})
