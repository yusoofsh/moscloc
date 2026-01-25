import { vi } from "vitest"

export function mockDate(date: Date | string) {
	vi.useFakeTimers()
	vi.setSystemTime(new Date(date))
}

export function restoreDate() {
	vi.useRealTimers()
}

export function waitForTimeout(ms: number) {
	return new Promise((resolve) => setTimeout(resolve, ms))
}

export function createMockLocalStorage() {
	let store: Record<string, string> = {}
	return {
		getItem: vi.fn((key: string) => store[key] ?? null),
		setItem: vi.fn((key: string, value: string) => {
			store[key] = value
		}),
		removeItem: vi.fn((key: string) => {
			delete store[key]
		}),
		clear: vi.fn(() => {
			store = {}
		}),
		get length() {
			return Object.keys(store).length
		},
		key: vi.fn((i: number) => Object.keys(store)[i] ?? null),
	}
}
