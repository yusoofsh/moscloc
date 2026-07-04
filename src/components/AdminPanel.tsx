import {
	ArrowLeft,
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
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "~/components/ui/card"
import { Field, FieldDescription, FieldLabel } from "~/components/ui/field"
import { Input } from "~/components/ui/input"
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "~/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "~/components/ui/tabs"
import { Textarea } from "~/components/ui/textarea"
import {
	defaultAnnouncements,
	defaultEvents,
	defaultIqamahIntervals,
	defaultMosqueInfo,
	defaultPrayerSettings,
	defaultVerses,
	type Event,
	type IqamahIntervals,
	type PrayerSettings,
	usePrayerContext,
	type Verse,
} from "../contexts/PrayerContext"
import {
	normalizeAnnouncementInput,
	validateIqamahIntervals,
	validateMosqueInfo,
} from "../lib/adminPanelLogic"

interface SelectOption {
	value: string
	label: string
}

interface TextInputFieldProps extends Omit<
	React.ComponentProps<typeof Input>,
	"id"
> {
	id: string
	label: string
	description?: React.ReactNode
	fieldClassName?: string
}

interface TextareaFieldProps extends Omit<
	React.ComponentProps<typeof Textarea>,
	"id"
> {
	id: string
	label: string
	description?: React.ReactNode
	fieldClassName?: string
}

interface SelectFieldProps {
	id: string
	label: string
	value: string
	options: SelectOption[]
	onValueChange: (value: string) => void
	description?: React.ReactNode
}

const adminTabs = [
	{ value: "mosque", label: "Informasi Masjid" },
	{ value: "announcements", label: "Pengumuman" },
	{ value: "events", label: "Acara Komunitas" },
	{ value: "verses", label: "Ayat Al-Quran" },
	{ value: "prayer-settings", label: "Pengaturan Shalat" },
	{ value: "iqamah", label: "Waktu Iqamah" },
	{ value: "settings", label: "Pengaturan" },
]

const prayerMethodOptions: SelectOption[] = [
	{ value: "1", label: "University of Islamic Sciences, Karachi" },
	{ value: "2", label: "Islamic Society of North America" },
	{ value: "3", label: "Muslim World League" },
	{ value: "4", label: "Umm Al-Qura University, Makkah" },
	{ value: "5", label: "Egyptian General Authority of Survey" },
	{ value: "7", label: "Institute of Geophysics, University of Tehran" },
	{ value: "8", label: "Gulf Region" },
	{ value: "9", label: "Kuwait" },
	{ value: "10", label: "Qatar" },
	{ value: "11", label: "Majlis Ugama Islam Singapura, Singapore" },
	{ value: "12", label: "Union Organization islamic de France" },
	{ value: "13", label: "Diyanet İşleri Başkanlığı, Turkey" },
	{ value: "14", label: "Spiritual Administration of Muslims of Russia" },
	{ value: "15", label: "Moonsighting Committee Worldwide" },
	{ value: "16", label: "Dubai (unofficial)" },
	{ value: "20", label: "Custom (Kementerian Agama RI)" },
]

const shafaqOptions: SelectOption[] = [
	{ value: "general", label: "General" },
	{ value: "red", label: "Red" },
	{ value: "white", label: "White" },
]

const schoolOptions: SelectOption[] = [
	{ value: "0", label: "Shafi" },
	{ value: "1", label: "Hanafi" },
]

const midnightModeOptions: SelectOption[] = [
	{ value: "0", label: "Standard (Mid Sunset to Sunrise)" },
	{ value: "1", label: "Jafari (Mid Sunset to Fajr)" },
]

const timezoneOptions: SelectOption[] = [
	{ value: "Asia/Jakarta", label: "WIB (Asia/Jakarta)" },
	{ value: "Asia/Makassar", label: "WITA (Asia/Makassar)" },
	{ value: "Asia/Jayapura", label: "WIT (Asia/Jayapura)" },
]

const iqamahFields: Array<{
	key: keyof IqamahIntervals
	label: string
}> = [
	{ key: "fajr", label: "Subuh (Fajr)" },
	{ key: "dhuhr", label: "Dzuhur (Dhuhr)" },
	{ key: "asr", label: "Ashar (Asr)" },
	{ key: "maghrib", label: "Maghrib" },
	{ key: "isha", label: "Isya (Isha)" },
]

function TextInputField({
	id,
	label,
	description,
	fieldClassName,
	...props
}: TextInputFieldProps) {
	return (
		<Field className={fieldClassName}>
			<FieldLabel htmlFor={id}>{label}</FieldLabel>
			<Input id={id} {...props} />
			{description && <FieldDescription>{description}</FieldDescription>}
		</Field>
	)
}

function TextareaField({
	id,
	label,
	description,
	fieldClassName,
	...props
}: TextareaFieldProps) {
	return (
		<Field className={fieldClassName}>
			<FieldLabel htmlFor={id}>{label}</FieldLabel>
			<Textarea id={id} {...props} />
			{description && <FieldDescription>{description}</FieldDescription>}
		</Field>
	)
}

function SelectField({
	id,
	label,
	value,
	options,
	onValueChange,
	description,
}: SelectFieldProps) {
	const labelId = `${id}-label`

	return (
		<Field>
			<FieldLabel id={labelId}>{label}</FieldLabel>
			<Select value={value} onValueChange={onValueChange}>
				<SelectTrigger id={id} aria-labelledby={labelId} className="w-full">
					<SelectValue />
				</SelectTrigger>
				<SelectContent>
					{options.map((option) => (
						<SelectItem key={option.value} value={option.value}>
							{option.label}
						</SelectItem>
					))}
				</SelectContent>
			</Select>
			{description && <FieldDescription>{description}</FieldDescription>}
		</Field>
	)
}

const AdminPanel: React.FC = () => {
	const {
		mosqueInfo,
		announcements,
		events,
		verses,
		prayerSettings,
		iqamahIntervals,
		updateMosqueInfo,
		updateAnnouncements,
		updateEvents,
		updateVerses,
		updatePrayerSettings,
		updateIqamahIntervals,
	} = usePrayerContext()
	const [activeTab, setActiveTab] = useState("mosque")
	const [formData, setFormData] = useState(mosqueInfo)

	const nameId = useId()
	const contactId = useId()
	const addressId = useId()
	const latitudeId = useId()
	const longitudeId = useId()
	const announcementId = useId()
	const eventTitleId = useId()
	const eventDateId = useId()
	const eventTimeId = useId()
	const eventLocationId = useId()
	const eventImageId = useId()
	const eventDescriptionId = useId()
	const verseArabicId = useId()
	const verseTranslationId = useId()
	const verseReferenceId = useId()
	const methodId = useId()
	const shafaqId = useId()
	const tuneId = useId()
	const schoolId = useId()
	const midnightModeId = useId()
	const timezoneId = useId()
	const fajrIqamahId = useId()
	const dhuhrIqamahId = useId()
	const asrIqamahId = useId()
	const maghribIqamahId = useId()
	const ishaIqamahId = useId()
	const iqamahInputIds: Record<keyof IqamahIntervals, string> = {
		fajr: fajrIqamahId,
		dhuhr: dhuhrIqamahId,
		asr: asrIqamahId,
		maghrib: maghribIqamahId,
		isha: ishaIqamahId,
	}
	const [announcementList, setAnnouncementList] = useState(announcements)
	const [newAnnouncement, setNewAnnouncement] = useState("")
	const [eventList, setEventList] = useState(events)
	const [showEventForm, setShowEventForm] = useState(false)
	const [editingEvent, setEditingEvent] = useState<Event | null>(null)
	const [eventForm, setEventForm] = useState<Omit<Event, "id">>({
		title: "",
		date: "",
		time: "",
		location: "",
		image: "",
		description: "",
	})
	const [verseList, setVerseList] = useState(verses)
	const [showVerseForm, setShowVerseForm] = useState(false)
	const [editingVerse, setEditingVerse] = useState<Verse | null>(null)
	const [verseForm, setVerseForm] = useState<Omit<Verse, "id">>({
		arabic: "",
		translation: "",
		reference: "",
	})
	const [prayerSettingsForm, setPrayerSettingsForm] =
		useState<PrayerSettings>(prayerSettings)
	const [iqamahIntervalsForm, setIqamahIntervalsForm] =
		useState<IqamahIntervals>(iqamahIntervals)

	useEffect(() => {
		setPrayerSettingsForm(prayerSettings)
		setIqamahIntervalsForm(iqamahIntervals)
	}, [prayerSettings, iqamahIntervals])

	const handleSaveMosqueInfo = () => {
		const validation = validateMosqueInfo(formData)

		if (!validation.ok) {
			alert(validation.errors.join("\n"))
			return
		}

		updateMosqueInfo(validation.value)
		alert("Informasi masjid berhasil diperbarui!")
	}

	const handleAddAnnouncement = () => {
		const announcement = normalizeAnnouncementInput(newAnnouncement)

		if (announcement) {
			const updated = [...announcementList, announcement]
			setAnnouncementList(updated)
			updateAnnouncements(updated)
			setNewAnnouncement("")
		}
	}

	const handleDeleteAnnouncement = (index: number) => {
		const updated = announcementList.filter((_, i) => i !== index)
		setAnnouncementList(updated)
		updateAnnouncements(updated)
	}

	const handleAddEvent = () => {
		if (
			eventForm.title &&
			eventForm.date &&
			eventForm.time &&
			eventForm.location
		) {
			const newEvent: Event = {
				...eventForm,
				id: Date.now().toString(),
			}
			const updated = [...eventList, newEvent]
			setEventList(updated)
			updateEvents(updated)
			setEventForm({
				title: "",
				date: "",
				time: "",
				location: "",
				image: "",
				description: "",
			})
			setShowEventForm(false)
		}
	}

	const handleEditEvent = (event: Event) => {
		setEditingEvent(event)
		setEventForm({
			title: event.title,
			date: event.date,
			time: event.time,
			location: event.location,
			image: event.image,
			description: event.description,
		})
		setShowEventForm(true)
	}

	const handleUpdateEvent = () => {
		if (
			editingEvent &&
			eventForm.title &&
			eventForm.date &&
			eventForm.time &&
			eventForm.location
		) {
			const updated = eventList.map((event) =>
				event.id === editingEvent.id
					? { ...eventForm, id: editingEvent.id }
					: event,
			)
			setEventList(updated)
			updateEvents(updated)
			setEditingEvent(null)
			setEventForm({
				title: "",
				date: "",
				time: "",
				location: "",
				image: "",
				description: "",
			})
			setShowEventForm(false)
		}
	}

	const handleDeleteEvent = (id: string) => {
		const updated = eventList.filter((event) => event.id !== id)
		setEventList(updated)
		updateEvents(updated)
	}

	const handleCancelEventForm = () => {
		setShowEventForm(false)
		setEditingEvent(null)
		setEventForm({
			title: "",
			date: "",
			time: "",
			location: "",
			image: "",
			description: "",
		})
	}

	const handleAddVerse = () => {
		if (verseForm.arabic && verseForm.translation && verseForm.reference) {
			const newVerse: Verse = {
				...verseForm,
				id: Date.now().toString(),
			}
			const updated = [...verseList, newVerse]
			setVerseList(updated)
			updateVerses(updated)
			setVerseForm({
				arabic: "",
				translation: "",
				reference: "",
			})
			setShowVerseForm(false)
		}
	}

	const handleEditVerse = (verse: Verse) => {
		setEditingVerse(verse)
		setVerseForm({
			arabic: verse.arabic,
			translation: verse.translation,
			reference: verse.reference,
		})
		setShowVerseForm(true)
	}

	const handleUpdateVerse = () => {
		if (
			editingVerse &&
			verseForm.arabic &&
			verseForm.translation &&
			verseForm.reference
		) {
			const updated = verseList.map((verse) =>
				verse.id === editingVerse.id
					? { ...verseForm, id: editingVerse.id }
					: verse,
			)
			setVerseList(updated)
			updateVerses(updated)
			setEditingVerse(null)
			setVerseForm({
				arabic: "",
				translation: "",
				reference: "",
			})
			setShowVerseForm(false)
		}
	}

	const handleDeleteVerse = (id: string) => {
		const updated = verseList.filter((verse) => verse.id !== id)
		setVerseList(updated)
		updateVerses(updated)
	}

	const handleCancelVerseForm = () => {
		setShowVerseForm(false)
		setEditingVerse(null)
		setVerseForm({
			arabic: "",
			translation: "",
			reference: "",
		})
	}

	const handleSavePrayerSettings = () => {
		updatePrayerSettings(prayerSettingsForm)
		alert("Pengaturan waktu shalat berhasil diperbarui!")
	}

	const handleSaveIqamahIntervals = () => {
		const validation = validateIqamahIntervals(iqamahIntervalsForm)

		if (!validation.ok) {
			alert(validation.errors.join("\n"))
			return
		}

		updateIqamahIntervals(validation.value)
		alert("Pengaturan iqamah berhasil diperbarui!")
	}

	const handleResetDefaults = () => {
		setFormData(defaultMosqueInfo)
		setAnnouncementList(defaultAnnouncements)
		setNewAnnouncement("")
		setEventList(defaultEvents)
		setShowEventForm(false)
		setEditingEvent(null)
		setEventForm({
			title: "",
			date: "",
			time: "",
			location: "",
			image: "",
			description: "",
		})
		setVerseList(defaultVerses)
		setShowVerseForm(false)
		setEditingVerse(null)
		setVerseForm({
			arabic: "",
			translation: "",
			reference: "",
		})
		setPrayerSettingsForm(defaultPrayerSettings)
		setIqamahIntervalsForm(defaultIqamahIntervals)

		updateMosqueInfo(defaultMosqueInfo)
		updateAnnouncements(defaultAnnouncements)
		updateEvents(defaultEvents)
		updateVerses(defaultVerses)
		updatePrayerSettings(defaultPrayerSettings)
		updateIqamahIntervals(defaultIqamahIntervals)
		alert("Pengaturan berhasil dikembalikan ke default!")
	}

	return (
		<div className="min-h-screen bg-muted/40" data-testid="admin-panel">
			<div className="border-b bg-background shadow-sm">
				<div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
					<div className="flex h-16 items-center justify-between">
						<div className="flex items-center gap-4">
							<Button
								type="button"
								variant="ghost"
								size="icon"
								aria-label="Kembali ke tampilan utama"
								onClick={() => {
									window.location.href = "/"
								}}
							>
								<ArrowLeft />
							</Button>
							<h1 className="font-bold text-2xl text-foreground">Pengaturan</h1>
						</div>
					</div>
				</div>
			</div>

			<div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
				<Tabs
					value={activeTab}
					onValueChange={setActiveTab}
					className="space-y-6"
				>
					<TabsList className="h-auto w-full flex-wrap justify-start">
						{adminTabs.map((tab) => (
							<TabsTrigger key={tab.value} value={tab.value}>
								{tab.label}
							</TabsTrigger>
						))}
					</TabsList>

					<TabsContent value="mosque">
						<Card>
							<CardHeader>
								<CardTitle>Informasi Masjid</CardTitle>
							</CardHeader>
							<CardContent className="space-y-6">
								<div className="grid grid-cols-1 gap-6 md:grid-cols-2">
									<TextInputField
										id={nameId}
										label="Nama Masjid"
										type="text"
										value={formData.name}
										onChange={(event) =>
											setFormData({ ...formData, name: event.target.value })
										}
									/>
									<TextInputField
										id={contactId}
										label="Informasi Kontak"
										type="text"
										value={formData.contact}
										onChange={(event) =>
											setFormData({ ...formData, contact: event.target.value })
										}
									/>
									<TextareaField
										id={addressId}
										label="Alamat"
										value={formData.address}
										onChange={(event) =>
											setFormData({ ...formData, address: event.target.value })
										}
										rows={3}
										fieldClassName="md:col-span-2"
									/>
									<TextInputField
										id={latitudeId}
										label="Lintang (Latitude)"
										type="number"
										step="any"
										value={formData.latitude}
										onChange={(event) =>
											setFormData({
												...formData,
												latitude: Number.parseFloat(event.target.value),
											})
										}
									/>
									<TextInputField
										id={longitudeId}
										label="Bujur (Longitude)"
										type="number"
										step="any"
										value={formData.longitude}
										onChange={(event) =>
											setFormData({
												...formData,
												longitude: Number.parseFloat(event.target.value),
											})
										}
									/>
								</div>
								<Button type="button" onClick={handleSaveMosqueInfo}>
									<Save />
									Simpan Perubahan
								</Button>
							</CardContent>
						</Card>
					</TabsContent>

					<TabsContent value="announcements">
						<Card>
							<CardHeader>
								<CardTitle>Kelola Pengumuman</CardTitle>
							</CardHeader>
							<CardContent className="space-y-6">
								<div className="flex flex-col gap-3 sm:flex-row">
									<Field className="flex-1">
										<FieldLabel htmlFor={announcementId}>
											Pengumuman Baru
										</FieldLabel>
										<Input
											id={announcementId}
											type="text"
											value={newAnnouncement}
											onChange={(event) =>
												setNewAnnouncement(event.target.value)
											}
											placeholder="Masukkan pengumuman baru..."
										/>
									</Field>
									<Button
										type="button"
										onClick={handleAddAnnouncement}
										className="self-end"
									>
										<Plus />
										Tambah
									</Button>
								</div>

								<div className="space-y-3">
									{announcementList.map((announcement, index) => (
										<div
											key={announcement}
											className="flex items-center gap-4 rounded-md border bg-muted/50 p-4"
										>
											<div className="flex-1 text-foreground">
												{announcement}
											</div>
											<Button
												type="button"
												variant="ghost"
												size="icon"
												aria-label={`Hapus pengumuman ${index + 1}`}
												onClick={() => handleDeleteAnnouncement(index)}
												className="text-destructive hover:text-destructive"
											>
												<Trash2 />
											</Button>
										</div>
									))}
									{announcementList.length === 0 && (
										<div className="py-8 text-center text-muted-foreground">
											Belum ada pengumuman. Tambahkan pengumuman di atas.
										</div>
									)}
								</div>
							</CardContent>
						</Card>
					</TabsContent>

					<TabsContent value="events">
						<Card>
							<CardHeader className="gap-4 sm:flex-row sm:items-center sm:justify-between">
								<CardTitle>Kelola Acara Komunitas</CardTitle>
								<Button type="button" onClick={() => setShowEventForm(true)}>
									<Plus />
									Tambah Acara
								</Button>
							</CardHeader>
							<CardContent className="space-y-6">
								{showEventForm && (
									<div className="rounded-lg border bg-muted/40 p-6">
										<h3 className="mb-4 font-medium text-foreground text-lg">
											{editingEvent ? "Edit Acara" : "Tambah Acara Baru"}
										</h3>

										<div className="grid grid-cols-1 gap-4 md:grid-cols-2">
											<TextInputField
												id={eventTitleId}
												label="Judul Acara"
												type="text"
												value={eventForm.title}
												onChange={(event) =>
													setEventForm({
														...eventForm,
														title: event.target.value,
													})
												}
												placeholder="Masukkan judul acara"
											/>
											<TextInputField
												id={eventDateId}
												label="Tanggal"
												type="text"
												value={eventForm.date}
												onChange={(event) =>
													setEventForm({
														...eventForm,
														date: event.target.value,
													})
												}
												placeholder="Contoh: Setiap Kamis"
											/>
											<TextInputField
												id={eventTimeId}
												label="Waktu"
												type="text"
												value={eventForm.time}
												onChange={(event) =>
													setEventForm({
														...eventForm,
														time: event.target.value,
													})
												}
												placeholder="Contoh: Ba'da Maghrib"
											/>
											<TextInputField
												id={eventLocationId}
												label="Lokasi"
												type="text"
												value={eventForm.location}
												onChange={(event) =>
													setEventForm({
														...eventForm,
														location: event.target.value,
													})
												}
												placeholder="Contoh: Ruang Utama Masjid"
											/>
											<TextInputField
												id={eventImageId}
												label="URL Gambar"
												type="url"
												value={eventForm.image}
												onChange={(event) =>
													setEventForm({
														...eventForm,
														image: event.target.value,
													})
												}
												placeholder="https://example.com/image.jpg"
												fieldClassName="md:col-span-2"
											/>
											<TextareaField
												id={eventDescriptionId}
												label="Deskripsi"
												value={eventForm.description}
												onChange={(event) =>
													setEventForm({
														...eventForm,
														description: event.target.value,
													})
												}
												rows={3}
												placeholder="Deskripsi singkat tentang acara"
												fieldClassName="md:col-span-2"
											/>
										</div>

										<div className="mt-6 flex gap-3">
											<Button
												type="button"
												onClick={
													editingEvent ? handleUpdateEvent : handleAddEvent
												}
											>
												<Save />
												{editingEvent ? "Update Acara" : "Simpan Acara"}
											</Button>
											<Button
												type="button"
												variant="outline"
												onClick={handleCancelEventForm}
											>
												Batal
											</Button>
										</div>
									</div>
								)}

								<div className="space-y-4">
									{eventList.map((event) => (
										<div
											key={event.id}
											className="flex gap-4 rounded-lg border bg-muted/50 p-4"
										>
											{event.image && (
												<img
													src={event.image}
													alt={event.title}
													className="size-20 rounded-lg object-cover"
												/>
											)}

											<div className="flex-1">
												<h4 className="font-medium text-foreground">
													{event.title}
												</h4>
												<div className="mt-2 space-y-1 text-muted-foreground text-sm">
													<div className="flex items-center gap-2">
														<Calendar size={14} />
														<span>{event.date}</span>
													</div>
													<div className="flex items-center gap-2">
														<Clock size={14} />
														<span>{event.time}</span>
													</div>
													<div className="flex items-center gap-2">
														<MapPin size={14} />
														<span>{event.location}</span>
													</div>
												</div>
												{event.description && (
													<p className="mt-2 text-muted-foreground text-sm">
														{event.description}
													</p>
												)}
											</div>

											<div className="flex gap-2">
												<Button
													type="button"
													variant="ghost"
													size="icon"
													aria-label={`Edit acara ${event.title}`}
													onClick={() => handleEditEvent(event)}
												>
													<Edit2 />
												</Button>
												<Button
													type="button"
													variant="ghost"
													size="icon"
													aria-label={`Hapus acara ${event.title}`}
													onClick={() => handleDeleteEvent(event.id)}
													className="text-destructive hover:text-destructive"
												>
													<Trash2 />
												</Button>
											</div>
										</div>
									))}

									{eventList.length === 0 && (
										<div className="py-8 text-center text-muted-foreground">
											Belum ada acara komunitas. Tambahkan acara di atas.
										</div>
									)}
								</div>
							</CardContent>
						</Card>
					</TabsContent>

					<TabsContent value="verses">
						<Card>
							<CardHeader className="gap-4 sm:flex-row sm:items-center sm:justify-between">
								<CardTitle>Kelola Ayat Al-Quran</CardTitle>
								<Button type="button" onClick={() => setShowVerseForm(true)}>
									<Plus />
									Tambah Ayat
								</Button>
							</CardHeader>
							<CardContent className="space-y-6">
								{showVerseForm && (
									<div className="rounded-lg border bg-muted/40 p-6">
										<h3 className="mb-4 font-medium text-foreground text-lg">
											{editingVerse ? "Edit Ayat" : "Tambah Ayat Baru"}
										</h3>

										<div className="space-y-4">
											<TextareaField
												id={verseArabicId}
												label="Teks Arab"
												value={verseForm.arabic}
												onChange={(event) =>
													setVerseForm({
														...verseForm,
														arabic: event.target.value,
													})
												}
												rows={3}
												className="arabic-text text-right"
												placeholder="النص العربي للآية"
												dir="rtl"
											/>
											<TextareaField
												id={verseTranslationId}
												label="Terjemahan"
												value={verseForm.translation}
												onChange={(event) =>
													setVerseForm({
														...verseForm,
														translation: event.target.value,
													})
												}
												rows={3}
												placeholder="Terjemahan ayat dalam bahasa Indonesia"
											/>
											<TextInputField
												id={verseReferenceId}
												label="Referensi"
												type="text"
												value={verseForm.reference}
												onChange={(event) =>
													setVerseForm({
														...verseForm,
														reference: event.target.value,
													})
												}
												placeholder="Contoh: Al-Baqarah 2:43"
											/>
										</div>

										<div className="mt-6 flex gap-3">
											<Button
												type="button"
												onClick={
													editingVerse ? handleUpdateVerse : handleAddVerse
												}
											>
												<Save />
												{editingVerse ? "Update Ayat" : "Simpan Ayat"}
											</Button>
											<Button
												type="button"
												variant="outline"
												onClick={handleCancelVerseForm}
											>
												Batal
											</Button>
										</div>
									</div>
								)}

								<div className="space-y-4">
									{verseList.map((verse) => (
										<div
											key={verse.id}
											className="rounded-lg border bg-muted/50 p-6"
										>
											<div className="mb-4">
												<div className="arabic-text mb-3 text-right font-light text-foreground text-lg leading-relaxed">
													{verse.arabic}
												</div>
												<div className="mb-2 text-muted-foreground italic">
													"{verse.translation}"
												</div>
												<div className="font-medium text-primary text-sm">
													- {verse.reference}
												</div>
											</div>

											<div className="flex justify-end gap-2">
												<Button
													type="button"
													variant="ghost"
													size="icon"
													aria-label={`Edit ayat ${verse.reference}`}
													onClick={() => handleEditVerse(verse)}
												>
													<Edit2 />
												</Button>
												<Button
													type="button"
													variant="ghost"
													size="icon"
													aria-label={`Hapus ayat ${verse.reference}`}
													onClick={() => handleDeleteVerse(verse.id)}
													className="text-destructive hover:text-destructive"
												>
													<Trash2 />
												</Button>
											</div>
										</div>
									))}

									{verseList.length === 0 && (
										<div className="py-8 text-center text-muted-foreground">
											Belum ada ayat Al-Quran. Tambahkan ayat di atas.
										</div>
									)}
								</div>
							</CardContent>
						</Card>
					</TabsContent>

					<TabsContent value="prayer-settings">
						<Card>
							<CardHeader>
								<CardTitle>Pengaturan Waktu Shalat</CardTitle>
								<CardDescription>
									Konfigurasi metode perhitungan waktu shalat menggunakan
									parameter API Aladhan
								</CardDescription>
							</CardHeader>
							<CardContent className="space-y-6">
								<div className="grid grid-cols-1 gap-6 md:grid-cols-2">
									<SelectField
										id={methodId}
										label="Metode Perhitungan"
										value={String(prayerSettingsForm.method)}
										options={prayerMethodOptions}
										onValueChange={(value) =>
											setPrayerSettingsForm({
												...prayerSettingsForm,
												method: Number(value),
											})
										}
									/>
									<SelectField
										id={shafaqId}
										label="Shafaq (untuk Isya)"
										value={prayerSettingsForm.shafaq}
										options={shafaqOptions}
										onValueChange={(value) =>
											setPrayerSettingsForm({
												...prayerSettingsForm,
												shafaq: value,
											})
										}
									/>
									<SelectField
										id={schoolId}
										label="Mazhab (untuk Ashar)"
										value={String(prayerSettingsForm.school)}
										options={schoolOptions}
										onValueChange={(value) =>
											setPrayerSettingsForm({
												...prayerSettingsForm,
												school: Number(value),
											})
										}
									/>
									<SelectField
										id={midnightModeId}
										label="Mode Tengah Malam"
										value={String(prayerSettingsForm.midnightMode)}
										options={midnightModeOptions}
										onValueChange={(value) =>
											setPrayerSettingsForm({
												...prayerSettingsForm,
												midnightMode: Number(value),
											})
										}
									/>
									<SelectField
										id={timezoneId}
										label="Zona Waktu"
										value={prayerSettingsForm.timezonestring}
										options={timezoneOptions}
										onValueChange={(value) =>
											setPrayerSettingsForm({
												...prayerSettingsForm,
												timezonestring: value,
											})
										}
									/>
									<TextInputField
										id={tuneId}
										label="Penyesuaian Waktu (Tune)"
										type="text"
										value={prayerSettingsForm.tune}
										onChange={(event) =>
											setPrayerSettingsForm({
												...prayerSettingsForm,
												tune: event.target.value,
											})
										}
										placeholder="36,36,23,-2,-8,-29,-29,-31,0"
										fieldClassName="md:col-span-2"
										description="Format: Imsak,Fajr,Sunrise,Dhuhr,Asr,Maghrib,Isha,Midnight,Sunset (dalam menit, pisahkan dengan koma)"
									/>
								</div>
								<Button type="button" onClick={handleSavePrayerSettings}>
									<Save />
									Simpan Pengaturan Shalat
								</Button>
							</CardContent>
						</Card>
					</TabsContent>

					<TabsContent value="iqamah">
						<Card>
							<CardHeader>
								<CardTitle>Pengaturan Waktu Iqamah</CardTitle>
								<CardDescription>
									Atur interval waktu dari adzan hingga iqamah untuk setiap
									waktu shalat
								</CardDescription>
							</CardHeader>
							<CardContent className="space-y-6">
								<div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
									{iqamahFields.map((field) => (
										<Field key={field.key}>
											<FieldLabel htmlFor={iqamahInputIds[field.key]}>
												{field.label}
											</FieldLabel>
											<div className="flex items-center gap-2">
												<Input
													id={iqamahInputIds[field.key]}
													type="number"
													min="1"
													max="60"
													value={iqamahIntervalsForm[field.key]}
													onChange={(event) =>
														setIqamahIntervalsForm({
															...iqamahIntervalsForm,
															[field.key]: Number(event.target.value),
														})
													}
												/>
												<span className="text-muted-foreground text-sm">
													menit
												</span>
											</div>
										</Field>
									))}
								</div>

								<div className="rounded-lg border border-primary/20 bg-primary/5 p-4">
									<h3 className="mb-2 font-medium text-primary text-sm">
										Informasi Penting:
									</h3>
									<ul className="space-y-1 text-primary text-sm">
										<li>
											- Waktu iqamah akan otomatis dimulai setelah adzan selesai
										</li>
										<li>
											- Halaman countdown akan menampilkan waktu mundur hingga
											iqamah
										</li>
										<li>
											- Auto-redirect akan pindah ke halaman iqamah secara
											otomatis
										</li>
										<li>- Akses halaman iqamah di: /iqamah</li>
										<li>- Minimum 1 menit, maksimum 60 menit per shalat</li>
									</ul>
								</div>

								<Button type="button" onClick={handleSaveIqamahIntervals}>
									<Save />
									Simpan Waktu Iqamah
								</Button>
							</CardContent>
						</Card>
					</TabsContent>

					<TabsContent value="settings">
						<Card>
							<CardHeader>
								<CardTitle>Pengaturan Tampilan</CardTitle>
							</CardHeader>
							<CardContent className="space-y-6 text-muted-foreground">
								<p>
									Pengaturan tambahan akan tersedia dalam pembaruan mendatang:
								</p>
								<ul className="mt-4 list-inside list-disc space-y-2">
									<li>Pemilihan metode perhitungan waktu shalat</li>
									<li>Pengaturan penyesuaian waktu</li>
									<li>Kustomisasi tema tampilan</li>
									<li>Notifikasi audio</li>
									<li>Preferensi bahasa</li>
								</ul>
								<Button
									type="button"
									variant="outline"
									onClick={handleResetDefaults}
								>
									Pulihkan Pengaturan Default
								</Button>
							</CardContent>
						</Card>
					</TabsContent>
				</Tabs>
			</div>
		</div>
	)
}

export default AdminPanel
