import {
	HeadContent,
	Outlet,
	createRootRouteWithContext,
	useRouterState,
} from "@tanstack/react-router";
import { TanStackRouterDevtools } from "@tanstack/react-router-devtools";
import Loader from "~/components/loader";
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
			<HeadContent />
			<div className="grid h-svh grid-rows-[auto_1fr]">
				{isFetching ? <Loader /> : <Outlet />}
			</div>
			<TanStackRouterDevtools position="bottom-left" />
		</>
	);
}
