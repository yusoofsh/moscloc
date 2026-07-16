import { beforeEach, describe, expect, it } from "vitest"
import { page } from "vitest/browser"
import { render } from "vitest-browser-react"
import { PrayerProvider } from "../contexts/PrayerContext"
import "../index.css"
import CommunityEventsCard from "./CommunityEvents"

describe("CommunityEventsCard", () => {
	beforeEach(() => localStorage.clear())

	it("uses the full card for event details when no image is configured", async () => {
		localStorage.setItem(
			"events",
			JSON.stringify([
				{
					id: "without-image",
					title: "Kajian Ahad",
					date: "Setiap Ahad",
					time: "08.00",
					location: "Aula utama",
					image: "",
					description: "Terbuka untuk seluruh jamaah dan keluarga.",
				},
			]),
		)

		await render(
			<PrayerProvider>
				<CommunityEventsCard />
			</PrayerProvider>,
		)

		const eventCard = page.getByRole("region", { name: "Acara komunitas" })
		await expect.element(page.getByText("Kajian Ahad")).toBeVisible()
		expect((await eventCard.element()).querySelector("img")).toBeNull()
	})
})
