import { ArrowLeft, Save } from "lucide-react"
import type React from "react"
import { useCallback, useEffect, useId, useMemo, useState } from "react"
import { Button } from "~/components/ui/button"
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "~/components/ui/card"
import { Field, FieldLabel } from "~/components/ui/field"
import { Input } from "~/components/ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "~/components/ui/tabs"
import {
	defaultAnnouncements,
	defaultEvents,
	defaultIqamahIntervals,
	defaultMosqueInfo,
	defaultPrayerSettings,
	defaultVerses,
	type IqamahIntervals,
	usePrayerContext,
} from "~/contexts/PrayerContext"
import {
	ADMIN_CONTENT_LIMITS,
	validateIqamahIntervals,
	validateMosqueInfo,
} from "~/lib/adminPanelLogic"
import {
	SelectField,
	type SelectOption,
	TextareaField,
	TextInputField,
} from "./admin/AdminFields"
import {
	type AdminAnnouncement,
	AnnouncementsSection,
	EventsSection,
	VersesSection,
} from "./admin/ContentSections"
import { useSyncedDraft } from "./admin/useSyncedDraft"

const adminTabs = [
	{ value: "mosque", label: "Informasi Masjid" },
	{ value: "announcements", label: "Pengumuman" },
	{ value: "events", label: "Acara Komunitas" },
	{ value: "verses", label: "Ayat Al-Quran" },
	{ value: "prayer-settings", label: "Pengaturan Shalat" },
	{ value: "iqamah", label: "Waktu Iqamah" },
	{ value: "settings", label: "Pengaturan" },
] as const

const tabValues = new Set<string>(adminTabs.map((tab) => tab.value))
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
const shafaqOptions = [
	{ value: "general", label: "General" },
	{ value: "red", label: "Red" },
	{ value: "white", label: "White" },
]
const schoolOptions = [
	{ value: "0", label: "Shafi" },
	{ value: "1", label: "Hanafi" },
]
const midnightModeOptions = [
	{ value: "0", label: "Standard (Mid Sunset to Sunrise)" },
	{ value: "1", label: "Jafari (Mid Sunset to Fajr)" },
]
const timezoneOptions = [
	{ value: "Asia/Jakarta", label: "WIB (Asia/Jakarta)" },
	{ value: "Asia/Makassar", label: "WITA (Asia/Makassar)" },
	{ value: "Asia/Jayapura", label: "WIT (Asia/Jayapura)" },
]
const iqamahFields: Array<{ key: keyof IqamahIntervals; label: string }> = [
	{ key: "fajr", label: "Subuh (Fajr)" },
	{ key: "dhuhr", label: "Dzuhur (Dhuhr)" },
	{ key: "asr", label: "Ashar (Asr)" },
	{ key: "maghrib", label: "Maghrib" },
	{ key: "isha", label: "Isya (Isha)" },
]

const tabFromUrl = () => {
	const requested = new URLSearchParams(window.location.search).get("tab")
	return requested && tabValues.has(requested) ? requested : "mosque"
}

const AdminPanel: React.FC = () => {
	const context = usePrayerContext()
	const mosque = useSyncedDraft(context.mosqueInfo)
	const prayer = useSyncedDraft(context.prayerSettings)
	const iqamah = useSyncedDraft(context.iqamahIntervals)
	const [activeTab, setActiveTab] = useState("mosque")
	const [notice, setNotice] = useState<AdminAnnouncement | null>(null)
	const [mosqueErrors, setMosqueErrors] = useState<Record<string, string>>({})
	const [iqamahErrors, setIqamahErrors] = useState<
		Partial<Record<keyof IqamahIntervals, string>>
	>({})
	const [childDirty, setChildDirty] = useState({
		announcements: false,
		events: false,
		verses: false,
	})
	const [resetKey, setResetKey] = useState(0)
	const ids = {
		name: useId(),
		contact: useId(),
		address: useId(),
		latitude: useId(),
		longitude: useId(),
		method: useId(),
		shafaq: useId(),
		tune: useId(),
		school: useId(),
		midnight: useId(),
		timezone: useId(),
		fajr: useId(),
		dhuhr: useId(),
		asr: useId(),
		maghrib: useId(),
		isha: useId(),
	}
	const isDirty =
		mosque.isDirty ||
		prayer.isDirty ||
		iqamah.isDirty ||
		Object.values(childDirty).some(Boolean)

	const announce = useCallback((next: AdminAnnouncement) => setNotice(next), [])
	const setChildDirtyValue = useCallback(
		(key: keyof typeof childDirty, value: boolean) => {
			setChildDirty((current) =>
				current[key] === value ? current : { ...current, [key]: value },
			)
		},
		[],
	)

	useEffect(() => {
		const handleBeforeUnload = (event: BeforeUnloadEvent) => {
			if (isDirty) event.preventDefault()
		}
		window.addEventListener("beforeunload", handleBeforeUnload)
		return () => window.removeEventListener("beforeunload", handleBeforeUnload)
	}, [isDirty])

	useEffect(() => {
		setActiveTab(tabFromUrl())
		const handlePopState = () => setActiveTab(tabFromUrl())
		window.addEventListener("popstate", handlePopState)
		return () => window.removeEventListener("popstate", handlePopState)
	}, [])

	const changeTab = (value: string) => {
		setActiveTab(value)
		const url = new URL(window.location.href)
		if (value === "mosque") url.searchParams.delete("tab")
		else url.searchParams.set("tab", value)
		window.history.replaceState(
			window.history.state,
			"",
			`${url.pathname}${url.search}${url.hash}`,
		)
	}

	const saveMosque = (event: React.FormEvent) => {
		event.preventDefault()
		const result = validateMosqueInfo(mosque.draft)
		if (!result.ok) {
			const next: Record<string, string> = {}
			for (const error of result.errors) {
				if (error.startsWith("Nama")) next.name = error
				else if (error.startsWith("Alamat")) next.address = error
				else if (error.startsWith("Informasi")) next.contact = error
				else if (error.startsWith("Lintang")) next.latitude = error
				else next.longitude = error
			}
			setMosqueErrors(next)
			document
				.getElementById(ids[Object.keys(next)[0] as keyof typeof ids])
				?.focus()
			return
		}
		setMosqueErrors({})
		context.updateMosqueInfo(result.value)
		mosque.resetDraft(result.value)
		announce({ message: "Informasi masjid berhasil diperbarui!" })
	}

	const savePrayer = (event: React.FormEvent) => {
		event.preventDefault()
		context.updatePrayerSettings(prayer.draft)
		prayer.resetDraft(prayer.draft)
		announce({ message: "Pengaturan waktu shalat berhasil diperbarui!" })
	}
	const saveIqamah = (event: React.FormEvent) => {
		event.preventDefault()
		const result = validateIqamahIntervals(iqamah.draft)
		if (!result.ok) {
			const next: Partial<Record<keyof IqamahIntervals, string>> = {}
			result.errors.forEach((error, index) => {
				const key =
					iqamahFields.find((field) =>
						error.startsWith(field.label.split(" ")[0]),
					)?.key ?? iqamahFields[index]?.key
				if (key) next[key] = error
			})
			setIqamahErrors(next)
			const first = Object.keys(next)[0] as keyof IqamahIntervals | undefined
			if (first) document.getElementById(ids[first])?.focus()
			return
		}
		setIqamahErrors({})
		context.updateIqamahIntervals(result.value)
		iqamah.resetDraft(result.value)
		announce({ message: "Pengaturan iqamah berhasil diperbarui!" })
	}

	const resetDefaults = () => {
		if (
			!window.confirm(
				"Pulihkan seluruh pengaturan ke nilai default? Tindakan ini tidak dapat diurungkan.",
			)
		)
			return
		context.updateMosqueInfo(defaultMosqueInfo)
		context.updateAnnouncements(defaultAnnouncements)
		context.updateEvents(defaultEvents)
		context.updateVerses(defaultVerses)
		context.updatePrayerSettings(defaultPrayerSettings)
		context.updateIqamahIntervals(defaultIqamahIntervals)
		mosque.resetDraft(defaultMosqueInfo)
		prayer.resetDraft(defaultPrayerSettings)
		iqamah.resetDraft(defaultIqamahIntervals)
		setMosqueErrors({})
		setIqamahErrors({})
		setChildDirty({ announcements: false, events: false, verses: false })
		setResetKey((key) => key + 1)
		announce({ message: "Pengaturan berhasil dikembalikan ke default!" })
	}

	const iqamahInputIds = useMemo(
		() => ({
			fajr: ids.fajr,
			dhuhr: ids.dhuhr,
			asr: ids.asr,
			maghrib: ids.maghrib,
			isha: ids.isha,
		}),
		[ids.fajr, ids.dhuhr, ids.asr, ids.maghrib, ids.isha],
	)

	return (
		<div className="min-h-screen bg-muted/40" data-testid="admin-panel">
			<header className="border-b bg-background shadow-sm">
				<div className="mx-auto flex h-16 max-w-7xl items-center gap-4 px-4 sm:px-6 lg:px-8">
					<Button asChild variant="ghost" size="icon">
						<a
							href="/"
							aria-label="Kembali ke tampilan utama"
							onClick={(event) => {
								if (
									isDirty &&
									!window.confirm(
										"Perubahan yang belum disimpan akan hilang. Tetap keluar?",
									)
								)
									event.preventDefault()
							}}
						>
							<ArrowLeft />
						</a>
					</Button>
					<h1 className="font-bold text-2xl text-foreground">Pengaturan</h1>
				</div>
			</header>
			<main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
				{notice && (
					<div
						role="status"
						aria-live="polite"
						className="mb-6 flex items-center justify-between gap-4 rounded-md border bg-background p-4"
					>
						<span>{notice.message}</span>
						{notice.undo && (
							<Button
								type="button"
								variant="outline"
								size="sm"
								onClick={() => {
									notice.undo?.()
									setNotice({ message: "Penghapusan dibatalkan." })
								}}
							>
								Urungkan
							</Button>
						)}
					</div>
				)}
				<Tabs value={activeTab} onValueChange={changeTab} className="space-y-6">
					<TabsList
						aria-label="Bagian pengaturan"
						className="h-auto w-full flex-wrap justify-start"
					>
						{adminTabs.map((tab) => (
							<TabsTrigger key={tab.value} value={tab.value}>
								{tab.label}
							</TabsTrigger>
						))}
					</TabsList>
					<TabsContent value="mosque">
						<Card>
							<CardHeader>
								<CardTitle role="heading" aria-level={2}>
									Informasi Masjid
								</CardTitle>
							</CardHeader>
							<CardContent>
								<form className="space-y-6" onSubmit={saveMosque} noValidate>
									<div className="grid grid-cols-1 gap-6 md:grid-cols-2">
										<TextInputField
											id={ids.name}
											name="mosqueName"
											autoComplete="organization"
											maxLength={ADMIN_CONTENT_LIMITS.mosqueName}
											label="Nama Masjid"
											value={mosque.draft.name}
											error={mosqueErrors.name}
											onChange={(e) =>
												mosque.setDraft({
													...mosque.draft,
													name: e.target.value,
												})
											}
										/>
										<TextInputField
											id={ids.contact}
											name="mosqueContact"
											autoComplete="tel"
											maxLength={ADMIN_CONTENT_LIMITS.mosqueContact}
											label="Informasi Kontak"
											value={mosque.draft.contact}
											error={mosqueErrors.contact}
											onChange={(e) =>
												mosque.setDraft({
													...mosque.draft,
													contact: e.target.value,
												})
											}
										/>
										<TextareaField
											id={ids.address}
											name="mosqueAddress"
											autoComplete="street-address"
											maxLength={ADMIN_CONTENT_LIMITS.mosqueAddress}
											label="Alamat"
											value={mosque.draft.address}
											error={mosqueErrors.address}
											onChange={(e) =>
												mosque.setDraft({
													...mosque.draft,
													address: e.target.value,
												})
											}
											rows={3}
											fieldClassName="md:col-span-2"
										/>
										<TextInputField
											id={ids.latitude}
											name="latitude"
											autoComplete="off"
											label="Lintang (Latitude)"
											type="number"
											step="any"
											value={mosque.draft.latitude}
											error={mosqueErrors.latitude}
											onChange={(e) =>
												mosque.setDraft({
													...mosque.draft,
													latitude: Number.parseFloat(e.target.value),
												})
											}
										/>
										<TextInputField
											id={ids.longitude}
											name="longitude"
											autoComplete="off"
											label="Bujur (Longitude)"
											type="number"
											step="any"
											value={mosque.draft.longitude}
											error={mosqueErrors.longitude}
											onChange={(e) =>
												mosque.setDraft({
													...mosque.draft,
													longitude: Number.parseFloat(e.target.value),
												})
											}
										/>
									</div>
									<Button type="submit">
										<Save /> Simpan Perubahan
									</Button>
								</form>
							</CardContent>
						</Card>
					</TabsContent>
					<TabsContent value="announcements">
						<AnnouncementsSection
							key={`announcements-${resetKey}`}
							announcements={context.announcements}
							onChange={context.updateAnnouncements}
							onAnnounce={announce}
							onDirtyChange={(value) =>
								setChildDirtyValue("announcements", value)
							}
						/>
					</TabsContent>
					<TabsContent value="events">
						<EventsSection
							key={`events-${resetKey}`}
							events={context.events}
							onChange={context.updateEvents}
							onAnnounce={announce}
							onDirtyChange={(value) => setChildDirtyValue("events", value)}
						/>
					</TabsContent>
					<TabsContent value="verses">
						<VersesSection
							key={`verses-${resetKey}`}
							verses={context.verses}
							onChange={context.updateVerses}
							onAnnounce={announce}
							onDirtyChange={(value) => setChildDirtyValue("verses", value)}
						/>
					</TabsContent>
					<TabsContent value="prayer-settings">
						<Card>
							<CardHeader>
								<CardTitle role="heading" aria-level={2}>
									Pengaturan Waktu Shalat
								</CardTitle>
								<CardDescription>
									Konfigurasi metode perhitungan waktu shalat menggunakan
									parameter API Aladhan
								</CardDescription>
							</CardHeader>
							<CardContent>
								<form className="space-y-6" onSubmit={savePrayer}>
									<div className="grid grid-cols-1 gap-6 md:grid-cols-2">
										<SelectField
											id={ids.method}
											name="method"
											label="Metode Perhitungan"
											value={String(prayer.draft.method)}
											options={prayerMethodOptions}
											onValueChange={(value) =>
												prayer.setDraft({
													...prayer.draft,
													method: Number(value),
												})
											}
										/>
										<SelectField
											id={ids.shafaq}
											name="shafaq"
											label="Shafaq (untuk Isya)"
											value={prayer.draft.shafaq}
											options={shafaqOptions}
											onValueChange={(value) =>
												prayer.setDraft({ ...prayer.draft, shafaq: value })
											}
										/>
										<SelectField
											id={ids.school}
											name="school"
											label="Mazhab (untuk Ashar)"
											value={String(prayer.draft.school)}
											options={schoolOptions}
											onValueChange={(value) =>
												prayer.setDraft({
													...prayer.draft,
													school: Number(value),
												})
											}
										/>
										<SelectField
											id={ids.midnight}
											name="midnightMode"
											label="Mode Tengah Malam"
											value={String(prayer.draft.midnightMode)}
											options={midnightModeOptions}
											onValueChange={(value) =>
												prayer.setDraft({
													...prayer.draft,
													midnightMode: Number(value),
												})
											}
										/>
										<SelectField
											id={ids.timezone}
											name="timezone"
											label="Zona Waktu"
											value={prayer.draft.timezonestring}
											options={timezoneOptions}
											onValueChange={(value) =>
												prayer.setDraft({
													...prayer.draft,
													timezonestring: value,
												})
											}
										/>
										<TextInputField
											id={ids.tune}
											name="tune"
											autoComplete="off"
											maxLength={120}
											label="Penyesuaian Waktu (Tune)"
											value={prayer.draft.tune}
											onChange={(e) =>
												prayer.setDraft({
													...prayer.draft,
													tune: e.target.value,
												})
											}
											placeholder="36,36,23,-2,-8,-29,-29,-31,0"
											fieldClassName="md:col-span-2"
											description="Format: Imsak,Fajr,Sunrise,Dhuhr,Asr,Maghrib,Isha,Midnight,Sunset (dalam menit, pisahkan dengan koma)"
										/>
									</div>
									<Button type="submit">
										<Save /> Simpan Pengaturan Shalat
									</Button>
								</form>
							</CardContent>
						</Card>
					</TabsContent>
					<TabsContent value="iqamah">
						<Card>
							<CardHeader>
								<CardTitle role="heading" aria-level={2}>
									Pengaturan Waktu Iqamah
								</CardTitle>
								<CardDescription>
									Atur interval waktu dari adzan hingga iqamah untuk setiap
									waktu shalat
								</CardDescription>
							</CardHeader>
							<CardContent>
								<form className="space-y-6" onSubmit={saveIqamah} noValidate>
									<div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
										{iqamahFields.map((field) => (
											<Field
												key={field.key}
												data-invalid={Boolean(iqamahErrors[field.key])}
											>
												<FieldLabel htmlFor={iqamahInputIds[field.key]}>
													{field.label}
												</FieldLabel>
												<div className="flex items-center gap-2">
													<Input
														id={iqamahInputIds[field.key]}
														name={`${field.key}Iqamah`}
														type="number"
														min="1"
														max="60"
														value={iqamah.draft[field.key]}
														aria-invalid={Boolean(iqamahErrors[field.key])}
														aria-describedby={
															iqamahErrors[field.key]
																? `${iqamahInputIds[field.key]}-error`
																: undefined
														}
														onChange={(e) =>
															iqamah.setDraft({
																...iqamah.draft,
																[field.key]: Number(e.target.value),
															})
														}
													/>
													<span className="text-muted-foreground text-sm">
														menit
													</span>
												</div>
												{iqamahErrors[field.key] && (
													<p
														id={`${iqamahInputIds[field.key]}-error`}
														className="text-destructive text-sm"
													>
														{iqamahErrors[field.key]}
													</p>
												)}
											</Field>
										))}
									</div>
									<div className="rounded-lg border border-primary/20 bg-primary/5 p-4">
										<h3 className="mb-2 font-medium text-primary text-sm">
											Informasi Penting:
										</h3>
										<ul className="space-y-1 text-primary text-sm">
											<li>
												- Waktu iqamah akan otomatis dimulai setelah adzan
												selesai
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
									<Button type="submit">
										<Save /> Simpan Waktu Iqamah
									</Button>
								</form>
							</CardContent>
						</Card>
					</TabsContent>
					<TabsContent value="settings">
						<Card>
							<CardHeader>
								<CardTitle role="heading" aria-level={2}>
									Pengaturan Tampilan
								</CardTitle>
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
								<Button type="button" variant="outline" onClick={resetDefaults}>
									Pulihkan Pengaturan Default
								</Button>
							</CardContent>
						</Card>
					</TabsContent>
				</Tabs>
			</main>
		</div>
	)
}

export default AdminPanel
