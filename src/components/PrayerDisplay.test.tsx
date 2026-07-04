import {
	createMemoryHistory,
	createRouter,
	RouterProvider,
} from "@tanstack/react-router"
import { describe, expect, it } from "vitest"
import { page } from "vitest/browser"
import { render } from "vitest-browser-react"
import { routeTree } from "~/routeTree.gen"

function renderHomeRoute() {
	const router = createRouter({
		routeTree,
		history: createMemoryHistory({ initialEntries: ["/"] }),
		context: {},
	})

	return render(<RouterProvider router={router} />)
}

describe("PrayerDisplay", () => {
	it("renders the main home display composition", async () => {
		await renderHomeRoute()

		await expect.element(page.getByRole("main")).toBeVisible()
		await expect.element(page.getByText("Masjid Darul Arqom")).toBeVisible()
		await expect
			.element(
				page.getByText("Jalan Kramatan, Kecamatan Pakisaji, Kabupaten Malang"),
			)
			.toBeVisible()
		await expect.element(page.getByTestId("current-time")).toBeVisible()
		await expect.element(page.getByTestId("islamic-calendar")).toBeVisible()
		await expect.element(page.getByTestId("quran-verse")).toBeVisible()
		await expect.element(page.getByTestId("prayer-times")).toBeVisible()
		await expect
			.element(
				page.getByText(
					"Shalat Tarawih berjamaah setiap malam selama bulan Ramadhan",
				),
			)
			.toBeVisible()
	})
})
