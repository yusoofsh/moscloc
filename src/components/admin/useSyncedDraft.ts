import { useEffect, useState } from "react"

export function useSyncedDraft<T>(source: T) {
	const [draft, setDraftState] = useState(source)
	const [isDirty, setIsDirty] = useState(false)

	useEffect(() => {
		if (!isDirty) setDraftState(source)
	}, [source, isDirty])

	const setDraft = (value: T) => {
		setDraftState(value)
		setIsDirty(true)
	}

	const resetDraft = (value: T = source) => {
		setDraftState(value)
		setIsDirty(false)
	}

	return { draft, setDraft, resetDraft, isDirty }
}
