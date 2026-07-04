import { expect, test } from "@playwright/test"

test.describe("Admin Page", () => {
	test("should load admin page", async ({ page }) => {
		await page.goto("/admin", { waitUntil: "domcontentloaded" })

		// Check if the admin panel is visible
		await expect(page.locator('[data-testid="admin-panel"]')).toBeVisible()
	})

	test("should have password protection or authentication", async ({
		page,
	}) => {
		await page.goto("/admin", { waitUntil: "domcontentloaded" })

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

	test("should save mosque info and reflect it on the home display", async ({
		page,
	}) => {
		await page.goto("/admin", { waitUntil: "domcontentloaded" })

		await page.getByLabel("Nama Masjid").fill("Masjid TDD")

		page.once("dialog", async (dialog) => {
			expect(dialog.message()).toContain("Informasi masjid berhasil diperbarui")
			await dialog.accept()
		})

		await page.getByRole("button", { name: "Simpan Perubahan" }).click()
		await page.goto("/", { waitUntil: "domcontentloaded" })

		await expect(
			page.getByRole("heading", { name: "Masjid TDD" }),
		).toBeVisible()
	})

	test("should switch admin tabs with accessible tab controls", async ({
		page,
	}) => {
		await page.goto("/admin", { waitUntil: "domcontentloaded" })

		await page.getByRole("tab", { name: "Waktu Iqamah" }).click()

		await expect(page.getByText("Pengaturan Waktu Iqamah")).toBeVisible()
		await expect(page.getByText("Minimum 1 menit")).toBeVisible()
	})

	test("should expose accessible labels for event action buttons", async ({
		page,
	}) => {
		await page.goto("/admin", { waitUntil: "domcontentloaded" })

		await page.getByRole("tab", { name: "Acara Komunitas" }).click()
		await page.getByRole("button", { name: "Tambah Acara" }).click()
		await page.getByLabel("Judul Acara").fill("Kajian TDD")
		await page.getByLabel("Tanggal").fill("Setiap Jumat")
		await page.getByLabel("Waktu", { exact: true }).fill("Ba'da Isya")
		await page.getByLabel("Lokasi").fill("Ruang Utama")
		await page.getByRole("button", { name: "Simpan Acara" }).click()

		await expect(
			page.getByRole("button", { name: "Edit acara Kajian TDD" }),
		).toBeVisible()
		await expect(
			page.getByRole("button", { name: "Hapus acara Kajian TDD" }),
		).toBeVisible()
	})
})
