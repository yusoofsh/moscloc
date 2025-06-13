import { createFileRoute } from "@tanstack/react-router";
import PrayerDisplay from "~/components/PrayerDisplay";

export const Route = createFileRoute("/")({
	component: PrayerDisplay,
});
