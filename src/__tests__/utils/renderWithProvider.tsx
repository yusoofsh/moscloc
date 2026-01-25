import { type RenderOptions, render } from "@testing-library/react"
import type { ReactElement, ReactNode } from "react"
import { PrayerProvider } from "~/contexts/PrayerContext"

interface WrapperProps {
	children: ReactNode
}

function AllProviders({ children }: WrapperProps) {
	return <PrayerProvider>{children}</PrayerProvider>
}

function customRender(
	ui: ReactElement,
	options?: Omit<RenderOptions, "wrapper">,
) {
	return render(ui, { wrapper: AllProviders, ...options })
}

export * from "@testing-library/react"
export { customRender as render }
