import { createFileRoute } from "@tanstack/react-router";
import IqamahCountdown from "~/components/IqamahCountdown";

export const Route = createFileRoute("/iqamah")({
	component: RouteComponent,
	head: () => ({
		meta: [
			{
				title: "Iqamah Countdown - Moscloc",
			},
			{
				name: "description",
				content: "Countdown timer for Iqamah prayer time",
			},
		],
	}),
});

function RouteComponent() {
	return <IqamahCountdown />;
}
