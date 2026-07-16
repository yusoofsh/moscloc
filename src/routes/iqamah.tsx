import { createFileRoute } from "@tanstack/react-router"
import IqamahCountdown from "~/components/IqamahCountdown"

export const Route = createFileRoute("/iqamah")({
	component: RouteComponent,
	head: () => ({
		meta: [
			{
				title: "Hitung Mundur Iqamah | Moscloc",
			},
			{
				name: "description",
				content:
					"Hitung mundur dari waktu azan menuju iqamah untuk salat yang sedang aktif.",
			},
		],
	}),
})

function RouteComponent() {
	return <IqamahCountdown />
}
