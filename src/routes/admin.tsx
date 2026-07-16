import { createFileRoute } from "@tanstack/react-router"
import AdminPanel from "~/components/AdminPanel"

export const Route = createFileRoute("/admin")({
	component: RouteComponent,
	head: () => ({
		meta: [
			{
				title: "Administrasi Masjid | Moscloc",
			},
			{
				name: "description",
				content:
					"Atur informasi masjid, jadwal salat, konten, dan waktu iqamah pada perangkat ini.",
			},
		],
	}),
})

function RouteComponent() {
	return <AdminPanel />
}
