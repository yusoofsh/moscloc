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
		vi.spyOn(window, "alert").mockImplementation(() => {})
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

		expect(window.alert).toHaveBeenCalledWith(
			"Informasi masjid berhasil diperbarui!",
		)
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

		expect(window.alert).toHaveBeenCalledWith(
			"Pengaturan iqamah berhasil diperbarui!",
		)
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

		expect(window.alert).toHaveBeenCalledWith(
			"Dzuhur harus berupa menit bulat antara 1 dan 60.",
		)
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
	})

	it("resets admin-managed settings to defaults", async () => {
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

		expect(window.alert).toHaveBeenCalledWith(
			"Pengaturan berhasil dikembalikan ke default!",
		)
		expect(localStorageSetItemCalls()).toContainEqual([
			"mosqueInfo",
			expect.stringContaining("Masjid Darul Arqom"),
		])
	})
})
