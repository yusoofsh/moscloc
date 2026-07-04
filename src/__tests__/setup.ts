import * as matchers from "@testing-library/jest-dom/matchers"
import { cleanup } from "@testing-library/react"
import { afterEach, expect, vi } from "vitest"

expect.extend(matchers)

// Cleanup after each test
afterEach(() => {
	cleanup()
	vi.clearAllMocks()
})

// Mock localStorage
const localStorageMock = (() => {
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
})()
Object.defineProperty(globalThis, "localStorage", { value: localStorageMock })
