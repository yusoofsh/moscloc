import { test as testBase } from "vitest"
import { worker } from "./mocks/browser"

export const test = testBase.extend({
	worker: [
		async (_, use) => {
			await worker.start({ onUnhandledRequest: "error" })
			await use(worker)
			worker.resetHandlers()
			worker.stop()
		},
		{ auto: true },
	],
})

export { expect } from "vitest"
