import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"
import { page } from "vitest/browser"
import { render } from "vitest-browser-react"
import { PrayerProvider } from "~/contexts/PrayerContext"
import AdminPanel from "./AdminPanel"

const localStorageSetItemCalls = () =>
	(
		localStorage.setItem as unknown as {
			mock: { calls: Array<[string, string]> }
		}
	).mock.calls

describe("AdminPanel", () => {
	beforeEach(() => {
		localStorage.clear()
		window.history.replaceState({}, "", "/admin")
	})

	afterEach(() => {
		vi.restoreAllMocks()
	})

	it("saves mosque information through context persistence", async () => {
		await render(
			<PrayerProvider>
				<AdminPanel />
			</PrayerProvider>,
		)

		await page
			.getByRole("textbox", { name: "Nama Masjid" })
			.fill("Masjid Browser")
		await page.getByRole("button", { name: "Simpan Perubahan" }).click()

		await expect
			.element(page.getByRole("status"))
			.toHaveTextContent("Informasi masjid berhasil diperbarui")
		expect(localStorageSetItemCalls()).toContainEqual([
			"mosqueInfo",
			expect.stringContaining("Masjid Browser"),
		])
	})

	it("saves valid iqamah intervals", async () => {
		await render(
			<PrayerProvider>
				<AdminPanel />
			</PrayerProvider>,
		)

		await page.getByRole("tab", { name: "Waktu Iqamah" }).click()
		await page.getByRole("spinbutton", { name: "Dzuhur (Dhuhr)" }).fill("12")
		await page.getByRole("button", { name: "Simpan Waktu Iqamah" }).click()

		await expect
			.element(page.getByRole("status"))
			.toHaveTextContent("Pengaturan iqamah berhasil diperbarui")
		expect(localStorageSetItemCalls()).toContainEqual([
			"iqamahIntervals",
			expect.stringContaining('"dhuhr":12'),
		])
	})

	it("rejects invalid iqamah intervals before persistence", async () => {
		await render(
			<PrayerProvider>
				<AdminPanel />
			</PrayerProvider>,
		)

		await page.getByRole("tab", { name: "Waktu Iqamah" }).click()
		await page.getByRole("spinbutton", { name: "Dzuhur (Dhuhr)" }).fill("0")
		await page.getByRole("button", { name: "Simpan Waktu Iqamah" }).click()

		await expect
			.element(
				page.getByText("Dzuhur harus berupa menit bulat antara 1 dan 60."),
			)
			.toBeVisible()
		expect(
			await page.getByRole("spinbutton", { name: "Dzuhur (Dhuhr)" }).element(),
		).toBe(document.activeElement)
		expect(
			localStorageSetItemCalls().some(([key]) => key === "iqamahIntervals"),
		).toBe(false)
	})

	it("switches tabs with accessible tab controls", async () => {
		await render(
			<PrayerProvider>
				<AdminPanel />
			</PrayerProvider>,
		)

		await page.getByRole("tab", { name: "Pengaturan Shalat" }).click()

		await expect
			.element(page.getByText("Konfigurasi metode perhitungan waktu shalat"))
			.toBeVisible()
		expect(window.location.search).toBe("?tab=prayer-settings")
	})

	it("opens the tab selected in the URL", async () => {
		window.history.replaceState({}, "", "/admin?tab=events")

		await render(
			<PrayerProvider>
				<AdminPanel />
			</PrayerProvider>,
		)

		await expect.element(page.getByText("Kelola Acara Komunitas")).toBeVisible()
	})

	it("shows an inline error and focuses an invalid event image URL", async () => {
		await render(
			<PrayerProvider>
				<AdminPanel />
			</PrayerProvider>,
		)

		await page.getByRole("tab", { name: "Acara Komunitas" }).click()
		await page.getByRole("button", { name: "Tambah Acara" }).click()
		await page.getByRole("textbox", { name: "Judul Acara" }).fill("Kajian TDD")
		await page.getByRole("textbox", { name: "Tanggal" }).fill("Setiap Jumat")
		await page
			.getByRole("textbox", { name: "Waktu", exact: true })
			.fill("Ba'da Isya")
		await page.getByRole("textbox", { name: "Lokasi" }).fill("Ruang Utama")
		await page
			.getByRole("textbox", { name: "URL Gambar" })
			.fill("http://example.com/kajian.jpg")
		await page.getByRole("button", { name: "Simpan Acara" }).click()

		await expect
			.element(page.getByText("URL gambar harus menggunakan HTTPS."))
			.toBeVisible()
		expect(
			await page.getByRole("textbox", { name: "URL Gambar" }).element(),
		).toBe(document.activeElement)
	})

	it("allows an operator to undo a deletion", async () => {
		await render(
			<PrayerProvider>
				<AdminPanel />
			</PrayerProvider>,
		)

		await page.getByRole("tab", { name: "Pengumuman" }).click()
		await page
			.getByRole("textbox", { name: "Pengumuman Baru" })
			.fill("Kajian malam ini")
		await page.getByRole("button", { name: "Tambah" }).click()
		await page.getByRole("button", { name: "Hapus pengumuman 1" }).click()
		await page.getByRole("button", { name: "Urungkan" }).click()

		await expect.element(page.getByText("Kajian malam ini")).toBeVisible()
	})

	it("warns before leaving with an unsaved draft", async () => {
		const confirm = vi.spyOn(window, "confirm").mockReturnValue(false)
		await render(
			<PrayerProvider>
				<AdminPanel />
			</PrayerProvider>,
		)

		await page
			.getByRole("textbox", { name: "Nama Masjid" })
			.fill("Masjid Belum Disimpan")
		await page.getByRole("link", { name: "Kembali ke tampilan utama" }).click()

		expect(confirm).toHaveBeenCalledWith(
			"Perubahan yang belum disimpan akan hilang. Tetap keluar?",
		)
		expect(window.location.pathname).toBe("/admin")
	})

	it("resets admin-managed settings to defaults", async () => {
		vi.spyOn(window, "confirm").mockReturnValue(true)
		await render(
			<PrayerProvider>
				<AdminPanel />
			</PrayerProvider>,
		)

		await page
			.getByRole("textbox", { name: "Nama Masjid" })
			.fill("Masjid Custom")
		await page.getByRole("button", { name: "Simpan Perubahan" }).click()
		await page.getByRole("tab", { name: "Pengaturan", exact: true }).click()
		await page
			.getByRole("button", { name: "Pulihkan Pengaturan Default" })
			.click()

		expect(window.confirm).toHaveBeenCalledWith(
			"Pulihkan seluruh pengaturan ke nilai default? Tindakan ini tidak dapat diurungkan.",
		)
		await expect
			.element(page.getByRole("status"))
			.toHaveTextContent("Pengaturan berhasil dikembalikan ke default")
		expect(localStorageSetItemCalls()).toContainEqual([
			"mosqueInfo",
			expect.stringContaining("Masjid Darul Arqom"),
		])
	})
})
