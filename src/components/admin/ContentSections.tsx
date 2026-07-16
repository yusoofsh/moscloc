import {
	Calendar,
	Clock,
	Edit2,
	MapPin,
	Plus,
	Save,
	Trash2,
} from "lucide-react"
import type React from "react"
import { useEffect, useId, useState } from "react"
import { Button } from "~/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card"
import { Field, FieldLabel } from "~/components/ui/field"
import { Input } from "~/components/ui/input"
import type { Event, Verse } from "~/contexts/PrayerContext"
import {
	ADMIN_CONTENT_LIMITS,
	normalizeAnnouncementInput,
	validateEvent,
	validateVerse,
} from "~/lib/adminPanelLogic"
import { TextareaField, TextInputField } from "./AdminFields"
import { useSyncedDraft } from "./useSyncedDraft"

export interface AdminAnnouncement {
	message: string
	undo?: () => void
}

interface AnnouncementsSectionProps {
	announcements: string[]
	onChange: (announcements: string[]) => void
	onAnnounce: (announcement: AdminAnnouncement) => void
	onDirtyChange: (dirty: boolean) => void
}

export function AnnouncementsSection({
	announcements,
	onChange,
	onAnnounce,
	onDirtyChange,
}: AnnouncementsSectionProps) {
	const inputId = useId()
	const [list, setList] = useState(announcements)
	const [draft, setDraft] = useState("")
	const [error, setError] = useState("")

	useEffect(() => setList(announcements), [announcements])
	useEffect(() => onDirtyChange(draft.length > 0), [draft, onDirtyChange])

	const saveList = (next: string[]) => {
		setList(next)
		onChange(next)
	}

	const handleSubmit = (event: React.FormEvent) => {
		event.preventDefault()
		const normalized = normalizeAnnouncementInput(draft)
		if (!normalized) {
			setError(
				draft.trim()
					? `Pengumuman maksimal ${ADMIN_CONTENT_LIMITS.announcement} karakter.`
					: "Pengumuman wajib diisi.",
			)
			document.getElementById(inputId)?.focus()
			return
		}
		setError("")
		saveList([...list, normalized])
		setDraft("")
		onAnnounce({ message: "Pengumuman berhasil ditambahkan." })
	}

	const handleDelete = (index: number) => {
		const previous = list
		saveList(list.filter((_, itemIndex) => itemIndex !== index))
		onAnnounce({
			message: "Pengumuman dihapus.",
			undo: () => saveList(previous),
		})
	}

	return (
		<Card>
			<CardHeader>
				<CardTitle role="heading" aria-level={2}>
					Kelola Pengumuman
				</CardTitle>
			</CardHeader>
			<CardContent className="space-y-6">
				<form
					className="flex flex-col gap-3 sm:flex-row"
					onSubmit={handleSubmit}
				>
					<Field className="flex-1" data-invalid={Boolean(error)}>
						<FieldLabel htmlFor={inputId}>Pengumuman Baru</FieldLabel>
						<Input
							id={inputId}
							name="announcement"
							autoComplete="off"
							maxLength={ADMIN_CONTENT_LIMITS.announcement}
							value={draft}
							onChange={(event) => setDraft(event.target.value)}
							aria-invalid={Boolean(error)}
							aria-describedby={error ? `${inputId}-error` : undefined}
							placeholder="Masukkan pengumuman baru..."
						/>
						{error && (
							<p id={`${inputId}-error`} className="text-destructive text-sm">
								{error}
							</p>
						)}
					</Field>
					<Button type="submit" className="self-end">
						<Plus /> Tambah
					</Button>
				</form>
				<div className="space-y-3">
					{list.map((announcement, index) => (
						<div
							key={`${announcement}-${index}`}
							className="flex items-center gap-4 rounded-md border bg-muted/50 p-4"
						>
							<div className="flex-1 text-foreground">{announcement}</div>
							<Button
								type="button"
								variant="ghost"
								size="icon"
								aria-label={`Hapus pengumuman ${index + 1}`}
								onClick={() => handleDelete(index)}
								className="text-destructive hover:text-destructive"
							>
								<Trash2 />
							</Button>
						</div>
					))}
					{list.length === 0 && (
						<p className="py-8 text-center text-muted-foreground">
							Belum ada pengumuman. Tambahkan pengumuman di atas.
						</p>
					)}
				</div>
			</CardContent>
		</Card>
	)
}

const emptyEvent: Omit<Event, "id"> = {
	title: "",
	date: "",
	time: "",
	location: "",
	image: "",
	description: "",
}

interface EventsSectionProps {
	events: Event[]
	onChange: (events: Event[]) => void
	onAnnounce: (announcement: AdminAnnouncement) => void
	onDirtyChange: (dirty: boolean) => void
}

export function EventsSection({
	events,
	onChange,
	onAnnounce,
	onDirtyChange,
}: EventsSectionProps) {
	const [list, setList] = useState(events)
	const [showForm, setShowForm] = useState(false)
	const [editing, setEditing] = useState<Event | null>(null)
	const [errors, setErrors] = useState<
		Partial<Record<keyof typeof emptyEvent, string>>
	>({})
	const { draft, setDraft, resetDraft, isDirty } = useSyncedDraft(emptyEvent)
	const ids = {
		title: useId(),
		date: useId(),
		time: useId(),
		location: useId(),
		image: useId(),
		description: useId(),
	}

	useEffect(() => setList(events), [events])
	useEffect(() => onDirtyChange(isDirty), [isDirty, onDirtyChange])

	const saveList = (next: Event[]) => {
		setList(next)
		onChange(next)
	}
	const closeForm = () => {
		setShowForm(false)
		setEditing(null)
		setErrors({})
		resetDraft(emptyEvent)
	}
	const openEdit = (item: Event) => {
		setEditing(item)
		resetDraft({
			title: item.title,
			date: item.date,
			time: item.time,
			location: item.location,
			image: item.image,
			description: item.description,
		})
		setShowForm(true)
	}
	const submit = (submitEvent: React.FormEvent) => {
		submitEvent.preventDefault()
		const result = validateEvent(draft)
		if (!result.ok) {
			setErrors(result.errors)
			const first = Object.keys(result.errors)[0] as
				| keyof typeof ids
				| undefined
			if (first) document.getElementById(ids[first])?.focus()
			return
		}
		const nextItem: Event = {
			...result.value,
			id: editing?.id ?? `${Date.now()}`,
		}
		const next = editing
			? list.map((item) => (item.id === editing.id ? nextItem : item))
			: [...list, nextItem]
		saveList(next)
		onAnnounce({
			message: editing
				? "Acara berhasil diperbarui."
				: "Acara berhasil ditambahkan.",
		})
		closeForm()
	}
	const handleDelete = (id: string) => {
		const previous = list
		saveList(list.filter((item) => item.id !== id))
		onAnnounce({ message: "Acara dihapus.", undo: () => saveList(previous) })
	}

	return (
		<Card>
			<CardHeader className="gap-4 sm:flex-row sm:items-center sm:justify-between">
				<CardTitle role="heading" aria-level={2}>
					Kelola Acara Komunitas
				</CardTitle>
				<Button
					type="button"
					onClick={() => {
						closeForm()
						setShowForm(true)
					}}
				>
					<Plus /> Tambah Acara
				</Button>
			</CardHeader>
			<CardContent className="space-y-6">
				{showForm && (
					<form
						className="rounded-lg border bg-muted/40 p-6"
						onSubmit={submit}
						noValidate
					>
						<h3 className="mb-4 font-medium text-foreground text-lg">
							{editing ? "Edit Acara" : "Tambah Acara Baru"}
						</h3>
						<div className="grid grid-cols-1 gap-4 md:grid-cols-2">
							<TextInputField
								id={ids.title}
								name="eventTitle"
								autoComplete="off"
								maxLength={ADMIN_CONTENT_LIMITS.eventTitle}
								label="Judul Acara"
								value={draft.title}
								error={errors.title}
								onChange={(e) => setDraft({ ...draft, title: e.target.value })}
								placeholder="Masukkan judul acara"
							/>
							<TextInputField
								id={ids.date}
								name="eventDate"
								autoComplete="off"
								maxLength={ADMIN_CONTENT_LIMITS.eventSchedule}
								label="Tanggal"
								value={draft.date}
								error={errors.date}
								onChange={(e) => setDraft({ ...draft, date: e.target.value })}
								placeholder="Contoh: Setiap Kamis"
							/>
							<TextInputField
								id={ids.time}
								name="eventTime"
								autoComplete="off"
								maxLength={ADMIN_CONTENT_LIMITS.eventSchedule}
								label="Waktu"
								value={draft.time}
								error={errors.time}
								onChange={(e) => setDraft({ ...draft, time: e.target.value })}
								placeholder="Contoh: Ba'da Maghrib"
							/>
							<TextInputField
								id={ids.location}
								name="eventLocation"
								autoComplete="off"
								maxLength={ADMIN_CONTENT_LIMITS.eventLocation}
								label="Lokasi"
								value={draft.location}
								error={errors.location}
								onChange={(e) =>
									setDraft({ ...draft, location: e.target.value })
								}
								placeholder="Contoh: Ruang Utama Masjid"
							/>
							<TextInputField
								id={ids.image}
								name="eventImage"
								autoComplete="url"
								maxLength={ADMIN_CONTENT_LIMITS.eventImage}
								label="URL Gambar"
								type="url"
								value={draft.image}
								error={errors.image}
								onChange={(e) => setDraft({ ...draft, image: e.target.value })}
								placeholder="https://example.com/image.jpg"
								fieldClassName="md:col-span-2"
							/>
							<TextareaField
								id={ids.description}
								name="eventDescription"
								autoComplete="off"
								maxLength={ADMIN_CONTENT_LIMITS.eventDescription}
								label="Deskripsi"
								value={draft.description}
								error={errors.description}
								onChange={(e) =>
									setDraft({ ...draft, description: e.target.value })
								}
								rows={3}
								placeholder="Deskripsi singkat tentang acara"
								fieldClassName="md:col-span-2"
							/>
						</div>
						<div className="mt-6 flex gap-3">
							<Button type="submit">
								<Save />
								{editing ? "Update Acara" : "Simpan Acara"}
							</Button>
							<Button type="button" variant="outline" onClick={closeForm}>
								Batal
							</Button>
						</div>
					</form>
				)}
				<div className="space-y-4">
					{list.map((item) => (
						<article
							key={item.id}
							className="flex gap-4 rounded-lg border bg-muted/50 p-4"
						>
							{item.image && (
								<img
									src={item.image}
									alt=""
									className="size-20 rounded-lg object-cover"
								/>
							)}
							<div className="flex-1">
								<h4 className="font-medium text-foreground">{item.title}</h4>
								<div className="mt-2 space-y-1 text-muted-foreground text-sm">
									<div className="flex items-center gap-2">
										<Calendar aria-hidden="true" size={14} />
										<span>{item.date}</span>
									</div>
									<div className="flex items-center gap-2">
										<Clock aria-hidden="true" size={14} />
										<span>{item.time}</span>
									</div>
									<div className="flex items-center gap-2">
										<MapPin aria-hidden="true" size={14} />
										<span>{item.location}</span>
									</div>
								</div>
								{item.description && (
									<p className="mt-2 text-muted-foreground text-sm">
										{item.description}
									</p>
								)}
							</div>
							<div className="flex gap-2">
								<Button
									type="button"
									variant="ghost"
									size="icon"
									aria-label={`Edit acara ${item.title}`}
									onClick={() => openEdit(item)}
								>
									<Edit2 />
								</Button>
								<Button
									type="button"
									variant="ghost"
									size="icon"
									aria-label={`Hapus acara ${item.title}`}
									onClick={() => handleDelete(item.id)}
									className="text-destructive hover:text-destructive"
								>
									<Trash2 />
								</Button>
							</div>
						</article>
					))}
					{list.length === 0 && (
						<p className="py-8 text-center text-muted-foreground">
							Belum ada acara komunitas. Tambahkan acara di atas.
						</p>
					)}
				</div>
			</CardContent>
		</Card>
	)
}

const emptyVerse: Omit<Verse, "id"> = {
	arabic: "",
	translation: "",
	reference: "",
}

interface VersesSectionProps {
	verses: Verse[]
	onChange: (verses: Verse[]) => void
	onAnnounce: (announcement: AdminAnnouncement) => void
	onDirtyChange: (dirty: boolean) => void
}

export function VersesSection({
	verses,
	onChange,
	onAnnounce,
	onDirtyChange,
}: VersesSectionProps) {
	const [list, setList] = useState(verses)
	const [showForm, setShowForm] = useState(false)
	const [editing, setEditing] = useState<Verse | null>(null)
	const [errors, setErrors] = useState<
		Partial<Record<keyof typeof emptyVerse, string>>
	>({})
	const { draft, setDraft, resetDraft, isDirty } = useSyncedDraft(emptyVerse)
	const ids = { arabic: useId(), translation: useId(), reference: useId() }
	useEffect(() => setList(verses), [verses])
	useEffect(() => onDirtyChange(isDirty), [isDirty, onDirtyChange])
	const saveList = (next: Verse[]) => {
		setList(next)
		onChange(next)
	}
	const closeForm = () => {
		setShowForm(false)
		setEditing(null)
		setErrors({})
		resetDraft(emptyVerse)
	}
	const submit = (submitEvent: React.FormEvent) => {
		submitEvent.preventDefault()
		const result = validateVerse(draft)
		if (!result.ok) {
			setErrors(result.errors)
			const first = Object.keys(result.errors)[0] as
				| keyof typeof ids
				| undefined
			if (first) document.getElementById(ids[first])?.focus()
			return
		}
		const nextItem: Verse = {
			...result.value,
			id: editing?.id ?? `${Date.now()}`,
		}
		const next = editing
			? list.map((item) => (item.id === editing.id ? nextItem : item))
			: [...list, nextItem]
		saveList(next)
		onAnnounce({
			message: editing
				? "Ayat berhasil diperbarui."
				: "Ayat berhasil ditambahkan.",
		})
		closeForm()
	}
	const edit = (item: Verse) => {
		setEditing(item)
		resetDraft({
			arabic: item.arabic,
			translation: item.translation,
			reference: item.reference,
		})
		setShowForm(true)
	}
	const remove = (id: string) => {
		const previous = list
		saveList(list.filter((item) => item.id !== id))
		onAnnounce({ message: "Ayat dihapus.", undo: () => saveList(previous) })
	}

	return (
		<Card>
			<CardHeader className="gap-4 sm:flex-row sm:items-center sm:justify-between">
				<CardTitle role="heading" aria-level={2}>
					Kelola Ayat Al-Quran
				</CardTitle>
				<Button
					type="button"
					onClick={() => {
						closeForm()
						setShowForm(true)
					}}
				>
					<Plus /> Tambah Ayat
				</Button>
			</CardHeader>
			<CardContent className="space-y-6">
				{showForm && (
					<form
						className="rounded-lg border bg-muted/40 p-6"
						onSubmit={submit}
						noValidate
					>
						<h3 className="mb-4 font-medium text-foreground text-lg">
							{editing ? "Edit Ayat" : "Tambah Ayat Baru"}
						</h3>
						<div className="space-y-4">
							<TextareaField
								id={ids.arabic}
								name="verseArabic"
								autoComplete="off"
								maxLength={ADMIN_CONTENT_LIMITS.verseArabic}
								label="Teks Arab"
								value={draft.arabic}
								error={errors.arabic}
								onChange={(e) => setDraft({ ...draft, arabic: e.target.value })}
								rows={3}
								className="arabic-text text-right"
								placeholder="النص العربي للآية"
								dir="rtl"
							/>
							<TextareaField
								id={ids.translation}
								name="verseTranslation"
								autoComplete="off"
								maxLength={ADMIN_CONTENT_LIMITS.verseTranslation}
								label="Terjemahan"
								value={draft.translation}
								error={errors.translation}
								onChange={(e) =>
									setDraft({ ...draft, translation: e.target.value })
								}
								rows={3}
								placeholder="Terjemahan ayat dalam bahasa Indonesia"
							/>
							<TextInputField
								id={ids.reference}
								name="verseReference"
								autoComplete="off"
								maxLength={ADMIN_CONTENT_LIMITS.verseReference}
								label="Referensi"
								value={draft.reference}
								error={errors.reference}
								onChange={(e) =>
									setDraft({ ...draft, reference: e.target.value })
								}
								placeholder="Contoh: Al-Baqarah 2:43"
							/>
						</div>
						<div className="mt-6 flex gap-3">
							<Button type="submit">
								<Save />
								{editing ? "Update Ayat" : "Simpan Ayat"}
							</Button>
							<Button type="button" variant="outline" onClick={closeForm}>
								Batal
							</Button>
						</div>
					</form>
				)}
				<div className="space-y-4">
					{list.map((item) => (
						<article
							key={item.id}
							className="rounded-lg border bg-muted/50 p-6"
						>
							<div className="mb-4">
								<div className="arabic-text mb-3 text-right font-light text-foreground text-lg leading-relaxed">
									{item.arabic}
								</div>
								<div className="mb-2 text-muted-foreground italic">
									“{item.translation}”
								</div>
								<div className="font-medium text-primary text-sm">
									— {item.reference}
								</div>
							</div>
							<div className="flex justify-end gap-2">
								<Button
									type="button"
									variant="ghost"
									size="icon"
									aria-label={`Edit ayat ${item.reference}`}
									onClick={() => edit(item)}
								>
									<Edit2 />
								</Button>
								<Button
									type="button"
									variant="ghost"
									size="icon"
									aria-label={`Hapus ayat ${item.reference}`}
									onClick={() => remove(item.id)}
									className="text-destructive hover:text-destructive"
								>
									<Trash2 />
								</Button>
							</div>
						</article>
					))}
					{list.length === 0 && (
						<p className="py-8 text-center text-muted-foreground">
							Belum ada ayat Al-Quran. Tambahkan ayat di atas.
						</p>
					)}
				</div>
			</CardContent>
		</Card>
	)
}
