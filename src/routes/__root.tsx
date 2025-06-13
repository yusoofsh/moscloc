import {
	createRootRouteWithContext,
	Outlet,
	useRouterState,
} from "@tanstack/react-router";
import { TanStackRouterDevtools } from "@tanstack/react-router-devtools";
import Loader from "~/components/Loader";
import { PrayerProvider } from "~/contexts/PrayerContext";
import "../index.css";

export const Route = createRootRouteWithContext()({
	component: RootComponent,
	head: () => ({
		meta: [
			{
				title: "My App",
			},
			{
				name: "description",
				content: "My App is a web application",
			},
		],
		links: [
			{
				rel: "icon",
				href: "/favicon.ico",
			},
		],
	}),
});

function RootComponent() {
	const isFetching = useRouterState({
		select: (s) => s.isLoading,
	});

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
	);
}
