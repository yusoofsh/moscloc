import {
	createRootRouteWithContext,
	Outlet,
	useRouterState,
} from "@tanstack/react-router"
import { TanStackRouterDevtools } from "@tanstack/react-router-devtools"
import Loader from "~/components/loader"
import { PrayerProvider } from "~/contexts/PrayerContext"
import "../index.css"

export const Route = createRootRouteWithContext()({
	component: RootComponent,
	head: () => ({
		meta: [
			{
				title: "Moscloc | Layar Informasi Masjid",
			},
			{
				name: "description",
				content:
					"Layar informasi masjid untuk jadwal salat, pengumuman, acara, dan hitung mundur iqamah.",
			},
		],
		links: [
			{
				rel: "icon",
				type: "image/png",
				href: "/logo.png",
			},
		],
	}),
})

function RootComponent() {
	const isFetching = useRouterState({
		select: (s) => s.isLoading,
	})

	return (
		<>
			<div className="min-h-screen bg-gray-900">
				{isFetching ? (
					<Loader />
				) : (
					<PrayerProvider>
						<Outlet />
					</PrayerProvider>
				)}
			</div>
			<TanStackRouterDevtools position="bottom-left" />
		</>
	)
}
