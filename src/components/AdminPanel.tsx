import {
	ArrowLeft,
	Calendar,
	Clock,
	Edit2,
	MapPin,
	Plus,
	Save,
	Trash2,
} from "lucide-react";
import type React from "react";
import { useEffect, useId, useState } from "react";
import {
	type Event,
	type IqamahIntervals,
	type IqamahSettings,
	type PrayerSettings,
	usePrayerContext,
	type Verse,
} from "../contexts/PrayerContext";

const AdminPanel: React.FC = () => {
	const {
		mosqueInfo,
		announcements,
		events,
		verses,
		prayerSettings,
		iqamahIntervals,
		iqamahSettings,
		updateMosqueInfo,
		updateAnnouncements,
		updateEvents,
		updateVerses,
		updatePrayerSettings,
		updateIqamahIntervals,
		updateIqamahSettings,
	} = usePrayerContext();
	const [activeTab, setActiveTab] = useState("mosque");
	const [formData, setFormData] = useState(mosqueInfo);

	// Generate unique IDs for form controls
	const nameId = useId();
	const contactId = useId();
	const addressId = useId();
	const latitudeId = useId();
	const longitudeId = useId();
	const eventTitleId = useId();
	const eventDateId = useId();
	const eventTimeId = useId();
	const eventLocationId = useId();
	const eventImageId = useId();
	const eventDescriptionId = useId();
	const verseArabicId = useId();
	const verseTranslationId = useId();
	const verseReferenceId = useId();
	const methodId = useId();
	const shafaqId = useId();
	const tuneId = useId();
	const schoolId = useId();
	const midnightModeId = useId();
	const timezoneId = useId();
	const fajrIqamahId = useId();
	const dhuhrIqamahId = useId();
	const asrIqamahId = useId();
	const maghribIqamahId = useId();
	const ishaIqamahId = useId();
	const redirectDelayId = useId();
	const [announcementList, setAnnouncementList] = useState(announcements);
	const [newAnnouncement, setNewAnnouncement] = useState("");
	const [eventList, setEventList] = useState(events);
	const [showEventForm, setShowEventForm] = useState(false);
	const [editingEvent, setEditingEvent] = useState<Event | null>(null);
	const [eventForm, setEventForm] = useState<Omit<Event, "id">>({
		title: "",
		date: "",
		time: "",
		location: "",
		image: "",
		description: "",
	});
	const [verseList, setVerseList] = useState(verses);
	const [showVerseForm, setShowVerseForm] = useState(false);
	const [editingVerse, setEditingVerse] = useState<Verse | null>(null);
	const [verseForm, setVerseForm] = useState<Omit<Verse, "id">>({
		arabic: "",
		translation: "",
		reference: "",
	});
	const [prayerSettingsForm, setPrayerSettingsForm] =
		useState<PrayerSettings>(prayerSettings);
	const [iqamahIntervalsForm, setIqamahIntervalsForm] =
		useState<IqamahIntervals>(iqamahIntervals);
	const [iqamahSettingsForm, setIqamahSettingsForm] =
		useState<IqamahSettings>(iqamahSettings);

	// Sync forms with context data
	useEffect(() => {
		setPrayerSettingsForm(prayerSettings);
		setIqamahIntervalsForm(iqamahIntervals);
		setIqamahSettingsForm(iqamahSettings);
	}, [prayerSettings, iqamahIntervals, iqamahSettings]);

	const handleSaveMosqueInfo = () => {
		updateMosqueInfo(formData);
		alert("Informasi masjid berhasil diperbarui!");
	};

	const handleAddAnnouncement = () => {
		if (newAnnouncement.trim()) {
			const updated = [...announcementList, newAnnouncement.trim()];
			setAnnouncementList(updated);
			updateAnnouncements(updated);
			setNewAnnouncement("");
		}
	};

	const handleDeleteAnnouncement = (index: number) => {
		const updated = announcementList.filter((_, i) => i !== index);
		setAnnouncementList(updated);
		updateAnnouncements(updated);
	};

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
			};
			const updated = [...eventList, newEvent];
			setEventList(updated);
			updateEvents(updated);
			setEventForm({
				title: "",
				date: "",
				time: "",
				location: "",
				image: "",
				description: "",
			});
			setShowEventForm(false);
		}
	};

	const handleEditEvent = (event: Event) => {
		setEditingEvent(event);
		setEventForm({
			title: event.title,
			date: event.date,
			time: event.time,
			location: event.location,
			image: event.image,
			description: event.description,
		});
		setShowEventForm(true);
	};

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
			);
			setEventList(updated);
			updateEvents(updated);
			setEditingEvent(null);
			setEventForm({
				title: "",
				date: "",
				time: "",
				location: "",
				image: "",
				description: "",
			});
			setShowEventForm(false);
		}
	};

	const handleDeleteEvent = (id: string) => {
		const updated = eventList.filter((event) => event.id !== id);
		setEventList(updated);
		updateEvents(updated);
	};

	const handleCancelEventForm = () => {
		setShowEventForm(false);
		setEditingEvent(null);
		setEventForm({
			title: "",
			date: "",
			time: "",
			location: "",
			image: "",
			description: "",
		});
	};

	const handleAddVerse = () => {
		if (verseForm.arabic && verseForm.translation && verseForm.reference) {
			const newVerse: Verse = {
				...verseForm,
				id: Date.now().toString(),
			};
			const updated = [...verseList, newVerse];
			setVerseList(updated);
			updateVerses(updated);
			setVerseForm({
				arabic: "",
				translation: "",
				reference: "",
			});
			setShowVerseForm(false);
		}
	};

	const handleEditVerse = (verse: Verse) => {
		setEditingVerse(verse);
		setVerseForm({
			arabic: verse.arabic,
			translation: verse.translation,
			reference: verse.reference,
		});
		setShowVerseForm(true);
	};

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
			);
			setVerseList(updated);
			updateVerses(updated);
			setEditingVerse(null);
			setVerseForm({
				arabic: "",
				translation: "",
				reference: "",
			});
			setShowVerseForm(false);
		}
	};

	const handleDeleteVerse = (id: string) => {
		const updated = verseList.filter((verse) => verse.id !== id);
		setVerseList(updated);
		updateVerses(updated);
	};

	const handleCancelVerseForm = () => {
		setShowVerseForm(false);
		setEditingVerse(null);
		setVerseForm({
			arabic: "",
			translation: "",
			reference: "",
		});
	};

	const handleSavePrayerSettings = () => {
		updatePrayerSettings(prayerSettingsForm);
		alert("Pengaturan waktu shalat berhasil diperbarui!");
	};

	const handleSaveIqamahIntervals = () => {
		updateIqamahIntervals(iqamahIntervalsForm);
		updateIqamahSettings(iqamahSettingsForm);
		alert("Pengaturan iqamah berhasil diperbarui!");
	};

	return (
		<div className="min-h-screen bg-gray-100">
			{/* Header */}
			<div className="border-b bg-white shadow-sm">
				<div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
					<div className="flex h-16 items-center justify-between">
						<div className="flex items-center gap-4">
							<button
								type="button"
								onClick={() => {
									window.location.href = "/";
								}}
								className="flex items-center gap-2 text-gray-600 hover:text-gray-900"
							>
								<ArrowLeft size={20} />
							</button>
							<h1 className="font-bold text-2xl text-gray-900">Pengaturan</h1>
						</div>
					</div>
				</div>
			</div>

			<div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
				{/* Tabs */}
				<div className="mb-8 rounded-lg bg-white shadow-sm">
					<div className="border-gray-200 border-b">
						<nav className="-mb-px flex space-x-8">
							<button
								type="button"
								onClick={() => setActiveTab("mosque")}
								className={`border-b-2 px-6 py-4 font-medium text-sm ${
									activeTab === "mosque"
										? "border-emerald-500 text-emerald-600"
										: "border-transparent text-gray-500 hover:text-gray-700"
								}`}
							>
								Informasi Masjid
							</button>
							<button
								type="button"
								onClick={() => setActiveTab("announcements")}
								className={`border-b-2 px-6 py-4 font-medium text-sm ${
									activeTab === "announcements"
										? "border-emerald-500 text-emerald-600"
										: "border-transparent text-gray-500 hover:text-gray-700"
								}`}
							>
								Pengumuman
							</button>
							<button
								type="button"
								onClick={() => setActiveTab("events")}
								className={`border-b-2 px-6 py-4 font-medium text-sm ${
									activeTab === "events"
										? "border-emerald-500 text-emerald-600"
										: "border-transparent text-gray-500 hover:text-gray-700"
								}`}
							>
								Acara Komunitas
							</button>
							<button
								type="button"
								onClick={() => setActiveTab("verses")}
								className={`border-b-2 px-6 py-4 font-medium text-sm ${
									activeTab === "verses"
										? "border-emerald-500 text-emerald-600"
										: "border-transparent text-gray-500 hover:text-gray-700"
								}`}
							>
								Ayat Al-Quran
							</button>
							<button
								type="button"
								onClick={() => setActiveTab("prayer-settings")}
								className={`border-b-2 px-6 py-4 font-medium text-sm ${
									activeTab === "prayer-settings"
										? "border-emerald-500 text-emerald-600"
										: "border-transparent text-gray-500 hover:text-gray-700"
								}`}
							>
								Pengaturan Shalat
							</button>
							<button
								type="button"
								onClick={() => setActiveTab("iqamah")}
								className={`border-b-2 px-6 py-4 font-medium text-sm ${
									activeTab === "iqamah"
										? "border-emerald-500 text-emerald-600"
										: "border-transparent text-gray-500 hover:text-gray-700"
								}`}
							>
								Waktu Iqamah
							</button>
							<button
								type="button"
								onClick={() => setActiveTab("settings")}
								className={`border-b-2 px-6 py-4 font-medium text-sm ${
									activeTab === "settings"
										? "border-emerald-500 text-emerald-600"
										: "border-transparent text-gray-500 hover:text-gray-700"
								}`}
							>
								Pengaturan
							</button>
						</nav>
					</div>

					<div className="p-6">
						{activeTab === "mosque" && (
							<div className="space-y-6">
								<h2 className="font-semibold text-gray-900 text-xl">
									Informasi Masjid
								</h2>

								<div className="grid grid-cols-1 gap-6 md:grid-cols-2">
									<div>
										<label
											htmlFor={nameId}
											className="mb-2 block font-medium text-gray-700 text-sm"
										>
											Nama Masjid
										</label>
										<input
											id={nameId}
											type="text"
											value={formData.name}
											onChange={(e) =>
												setFormData({ ...formData, name: e.target.value })
											}
											className="w-full rounded-md border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-emerald-500"
										/>
									</div>

									<div>
										<label
											htmlFor={contactId}
											className="mb-2 block font-medium text-gray-700 text-sm"
										>
											Informasi Kontak
										</label>
										<input
											id={contactId}
											type="text"
											value={formData.contact}
											onChange={(e) =>
												setFormData({ ...formData, contact: e.target.value })
											}
											className="w-full rounded-md border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-emerald-500"
										/>
									</div>

									<div className="md:col-span-2">
										<label
											htmlFor={addressId}
											className="mb-2 block font-medium text-gray-700 text-sm"
										>
											Alamat
										</label>
										<textarea
											id={addressId}
											value={formData.address}
											onChange={(e) =>
												setFormData({ ...formData, address: e.target.value })
											}
											rows={3}
											className="w-full rounded-md border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-emerald-500"
										/>
									</div>

									<div>
										<label
											htmlFor={latitudeId}
											className="mb-2 block font-medium text-gray-700 text-sm"
										>
											Lintang (Latitude)
										</label>
										<input
											id={latitudeId}
											type="number"
											step="any"
											value={formData.latitude}
											onChange={(e) =>
												setFormData({
													...formData,
													latitude: Number.parseFloat(e.target.value),
												})
											}
											className="w-full rounded-md border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-emerald-500"
										/>
									</div>

									<div>
										<label
											htmlFor={longitudeId}
											className="mb-2 block font-medium text-gray-700 text-sm"
										>
											Bujur (Longitude)
										</label>
										<input
											id={longitudeId}
											type="number"
											step="any"
											value={formData.longitude}
											onChange={(e) =>
												setFormData({
													...formData,
													longitude: Number.parseFloat(e.target.value),
												})
											}
											className="w-full rounded-md border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-emerald-500"
										/>
									</div>
								</div>

								<button
									type="button"
									onClick={handleSaveMosqueInfo}
									className="flex items-center gap-2 rounded-md bg-emerald-600 px-6 py-2 text-white transition-colors hover:bg-emerald-700"
								>
									<Save size={16} />
									Simpan Perubahan
								</button>
							</div>
						)}

						{activeTab === "announcements" && (
							<div className="space-y-6">
								<h2 className="font-semibold text-gray-900 text-xl">
									Kelola Pengumuman
								</h2>

								<div className="flex gap-4">
									<input
										type="text"
										value={newAnnouncement}
										onChange={(e) => setNewAnnouncement(e.target.value)}
										placeholder="Masukkan pengumuman baru..."
										className="flex-1 rounded-md border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-emerald-500"
									/>
									<button
										type="button"
										onClick={handleAddAnnouncement}
										className="flex items-center gap-2 rounded-md bg-emerald-600 px-4 py-2 text-white transition-colors hover:bg-emerald-700"
									>
										<Plus size={16} />
										Tambah
									</button>
								</div>

								<div className="space-y-3">
									{announcementList.map((announcement, index) => (
										<div
											key={`announcement-${announcement.slice(0, 20)}-${index}`}
											className="flex items-center gap-4 rounded-md bg-gray-50 p-4"
										>
											<div className="flex-1 text-gray-900">{announcement}</div>
											<button
												type="button"
												onClick={() => handleDeleteAnnouncement(index)}
												className="text-red-600 transition-colors hover:text-red-800"
											>
												<Trash2 size={16} />
											</button>
										</div>
									))}
									{announcementList.length === 0 && (
										<div className="py-8 text-center text-gray-500">
											Belum ada pengumuman. Tambahkan pengumuman di atas.
										</div>
									)}
								</div>
							</div>
						)}

						{activeTab === "events" && (
							<div className="space-y-6">
								<div className="flex items-center justify-between">
									<h2 className="font-semibold text-gray-900 text-xl">
										Kelola Acara Komunitas
									</h2>
									<button
										type="button"
										onClick={() => setShowEventForm(true)}
										className="flex items-center gap-2 rounded-md bg-emerald-600 px-4 py-2 text-white transition-colors hover:bg-emerald-700"
									>
										<Plus size={16} />
										Tambah Acara
									</button>
								</div>

								{showEventForm && (
									<div className="rounded-lg bg-gray-50 p-6">
										<h3 className="mb-4 font-medium text-gray-900 text-lg">
											{editingEvent ? "Edit Acara" : "Tambah Acara Baru"}
										</h3>

										<div className="grid grid-cols-1 gap-4 md:grid-cols-2">
											<div>
												<label
													htmlFor={eventTitleId}
													className="mb-2 block font-medium text-gray-700 text-sm"
												>
													Judul Acara
												</label>
												<input
													id={eventTitleId}
													type="text"
													value={eventForm.title}
													onChange={(e) =>
														setEventForm({
															...eventForm,
															title: e.target.value,
														})
													}
													className="w-full rounded-md border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-emerald-500"
													placeholder="Masukkan judul acara"
												/>
											</div>

											<div>
												<label
													htmlFor={eventDateId}
													className="mb-2 block font-medium text-gray-700 text-sm"
												>
													Tanggal
												</label>
												<input
													id={eventDateId}
													type="text"
													value={eventForm.date}
													onChange={(e) =>
														setEventForm({ ...eventForm, date: e.target.value })
													}
													className="w-full rounded-md border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-emerald-500"
													placeholder="Contoh: Setiap Kamis"
												/>
											</div>

											<div>
												<label
													htmlFor={eventTimeId}
													className="mb-2 block font-medium text-gray-700 text-sm"
												>
													Waktu
												</label>
												<input
													id={eventTimeId}
													type="text"
													value={eventForm.time}
													onChange={(e) =>
														setEventForm({ ...eventForm, time: e.target.value })
													}
													className="w-full rounded-md border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-emerald-500"
													placeholder="Contoh: Ba'da Maghrib"
												/>
											</div>

											<div>
												<label
													htmlFor={eventLocationId}
													className="mb-2 block font-medium text-gray-700 text-sm"
												>
													Lokasi
												</label>
												<input
													id={eventLocationId}
													type="text"
													value={eventForm.location}
													onChange={(e) =>
														setEventForm({
															...eventForm,
															location: e.target.value,
														})
													}
													className="w-full rounded-md border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-emerald-500"
													placeholder="Contoh: Ruang Utama Masjid"
												/>
											</div>

											<div className="md:col-span-2">
												<label
													htmlFor={eventImageId}
													className="mb-2 block font-medium text-gray-700 text-sm"
												>
													URL Gambar
												</label>
												<input
													id={eventImageId}
													type="url"
													value={eventForm.image}
													onChange={(e) =>
														setEventForm({
															...eventForm,
															image: e.target.value,
														})
													}
													className="w-full rounded-md border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-emerald-500"
													placeholder="https://example.com/image.jpg"
												/>
											</div>

											<div className="md:col-span-2">
												<label
													htmlFor={eventDescriptionId}
													className="mb-2 block font-medium text-gray-700 text-sm"
												>
													Deskripsi
												</label>
												<textarea
													id={eventDescriptionId}
													value={eventForm.description}
													onChange={(e) =>
														setEventForm({
															...eventForm,
															description: e.target.value,
														})
													}
													rows={3}
													className="w-full rounded-md border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-emerald-500"
													placeholder="Deskripsi singkat tentang acara"
												/>
											</div>
										</div>

										<div className="mt-6 flex gap-3">
											<button
												type="button"
												onClick={
													editingEvent ? handleUpdateEvent : handleAddEvent
												}
												className="flex items-center gap-2 rounded-md bg-emerald-600 px-4 py-2 text-white transition-colors hover:bg-emerald-700"
											>
												<Save size={16} />
												{editingEvent ? "Update Acara" : "Simpan Acara"}
											</button>
											<button
												type="button"
												onClick={handleCancelEventForm}
												className="rounded-md border border-gray-300 px-4 py-2 text-gray-700 transition-colors hover:bg-gray-50"
											>
												Batal
											</button>
										</div>
									</div>
								)}

								<div className="space-y-4">
									{eventList.map((event) => (
										<div
											key={event.id}
											className="flex gap-4 rounded-lg bg-gray-50 p-4"
										>
											{event.image && (
												<img
													src={event.image}
													alt={event.title}
													className="h-20 w-20 rounded-lg object-cover"
												/>
											)}

											<div className="flex-1">
												<h4 className="font-medium text-gray-900">
													{event.title}
												</h4>
												<div className="mt-2 space-y-1 text-gray-600 text-sm">
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
													<p className="mt-2 text-gray-600 text-sm">
														{event.description}
													</p>
												)}
											</div>

											<div className="flex gap-2">
												<button
													type="button"
													onClick={() => handleEditEvent(event)}
													className="text-emerald-600 transition-colors hover:text-emerald-800"
												>
													<Edit2 size={16} />
												</button>
												<button
													type="button"
													onClick={() => handleDeleteEvent(event.id)}
													className="text-red-600 transition-colors hover:text-red-800"
												>
													<Trash2 size={16} />
												</button>
											</div>
										</div>
									))}

									{eventList.length === 0 && (
										<div className="py-8 text-center text-gray-500">
											Belum ada acara komunitas. Tambahkan acara di atas.
										</div>
									)}
								</div>
							</div>
						)}

						{activeTab === "verses" && (
							<div className="space-y-6">
								<div className="flex items-center justify-between">
									<h2 className="font-semibold text-gray-900 text-xl">
										Kelola Ayat Al-Quran
									</h2>
									<button
										type="button"
										onClick={() => setShowVerseForm(true)}
										className="flex items-center gap-2 rounded-md bg-emerald-600 px-4 py-2 text-white transition-colors hover:bg-emerald-700"
									>
										<Plus size={16} />
										Tambah Ayat
									</button>
								</div>

								{showVerseForm && (
									<div className="rounded-lg bg-gray-50 p-6">
										<h3 className="mb-4 font-medium text-gray-900 text-lg">
											{editingVerse ? "Edit Ayat" : "Tambah Ayat Baru"}
										</h3>

										<div className="space-y-4">
											<div>
												<label
													htmlFor={verseArabicId}
													className="mb-2 block font-medium text-gray-700 text-sm"
												>
													Teks Arab
												</label>
												<textarea
													id={verseArabicId}
													value={verseForm.arabic}
													onChange={(e) =>
														setVerseForm({
															...verseForm,
															arabic: e.target.value,
														})
													}
													rows={3}
													className="w-full rounded-md border border-gray-300 px-3 py-2 text-right focus:outline-none focus:ring-2 focus:ring-emerald-500"
													placeholder="النص العربي للآية"
													dir="rtl"
												/>
											</div>

											<div>
												<label
													htmlFor={verseTranslationId}
													className="mb-2 block font-medium text-gray-700 text-sm"
												>
													Terjemahan
												</label>
												<textarea
													id={verseTranslationId}
													value={verseForm.translation}
													onChange={(e) =>
														setVerseForm({
															...verseForm,
															translation: e.target.value,
														})
													}
													rows={3}
													className="w-full rounded-md border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-emerald-500"
													placeholder="Terjemahan ayat dalam bahasa Indonesia"
												/>
											</div>

											<div>
												<label
													htmlFor={verseReferenceId}
													className="mb-2 block font-medium text-gray-700 text-sm"
												>
													Referensi
												</label>
												<input
													id={verseReferenceId}
													type="text"
													value={verseForm.reference}
													onChange={(e) =>
														setVerseForm({
															...verseForm,
															reference: e.target.value,
														})
													}
													className="w-full rounded-md border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-emerald-500"
													placeholder="Contoh: Al-Baqarah 2:43"
												/>
											</div>
										</div>

										<div className="mt-6 flex gap-3">
											<button
												type="button"
												onClick={
													editingVerse ? handleUpdateVerse : handleAddVerse
												}
												className="flex items-center gap-2 rounded-md bg-emerald-600 px-4 py-2 text-white transition-colors hover:bg-emerald-700"
											>
												<Save size={16} />
												{editingVerse ? "Update Ayat" : "Simpan Ayat"}
											</button>
											<button
												type="button"
												onClick={handleCancelVerseForm}
												className="rounded-md border border-gray-300 px-4 py-2 text-gray-700 transition-colors hover:bg-gray-50"
											>
												Batal
											</button>
										</div>
									</div>
								)}

								<div className="space-y-4">
									{verseList.map((verse) => (
										<div key={verse.id} className="rounded-lg bg-gray-50 p-6">
											<div className="mb-4">
												<div className="arabic-text mb-3 text-right font-light text-gray-800 text-lg leading-relaxed">
													{verse.arabic}
												</div>
												<div className="mb-2 text-gray-700 italic">
													"{verse.translation}"
												</div>
												<div className="font-medium text-emerald-600 text-sm">
													— {verse.reference}
												</div>
											</div>

											<div className="flex justify-end gap-2">
												<button
													type="button"
													onClick={() => handleEditVerse(verse)}
													className="text-emerald-600 transition-colors hover:text-emerald-800"
												>
													<Edit2 size={16} />
												</button>
												<button
													type="button"
													onClick={() => handleDeleteVerse(verse.id)}
													className="text-red-600 transition-colors hover:text-red-800"
												>
													<Trash2 size={16} />
												</button>
											</div>
										</div>
									))}

									{verseList.length === 0 && (
										<div className="py-8 text-center text-gray-500">
											Belum ada ayat Al-Quran. Tambahkan ayat di atas.
										</div>
									)}
								</div>
							</div>
						)}

						{activeTab === "prayer-settings" && (
							<div className="space-y-6">
								<h2 className="font-semibold text-gray-900 text-xl">
									Pengaturan Waktu Shalat
								</h2>
								<p className="text-gray-600 text-sm">
									Konfigurasi metode perhitungan waktu shalat menggunakan
									parameter API Aladhan
								</p>

								<div className="grid grid-cols-1 gap-6 md:grid-cols-2">
									<div>
										<label
											htmlFor={methodId}
											className="mb-2 block font-medium text-gray-700 text-sm"
										>
											Metode Perhitungan
										</label>
										<select
											id={methodId}
											value={prayerSettingsForm.method}
											onChange={(e) =>
												setPrayerSettingsForm({
													...prayerSettingsForm,
													method: Number(e.target.value),
												})
											}
											className="w-full rounded-md border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-emerald-500"
										>
											<option value={1}>
												University of Islamic Sciences, Karachi
											</option>
											<option value={2}>
												Islamic Society of North America
											</option>
											<option value={3}>Muslim World League</option>
											<option value={4}>Umm Al-Qura University, Makkah</option>
											<option value={5}>
												Egyptian General Authority of Survey
											</option>
											<option value={7}>
												Institute of Geophysics, University of Tehran
											</option>
											<option value={8}>Gulf Region</option>
											<option value={9}>Kuwait</option>
											<option value={10}>Qatar</option>
											<option value={11}>
												Majlis Ugama Islam Singapura, Singapore
											</option>
											<option value={12}>
												Union Organization islamic de France
											</option>
											<option value={13}>
												Diyanet İşleri Başkanlığı, Turkey
											</option>
											<option value={14}>
												Spiritual Administration of Muslims of Russia
											</option>
											<option value={15}>
												Moonsighting Committee Worldwide
											</option>
											<option value={16}>Dubai (unofficial)</option>
											<option value={20}>Custom (Kementerian Agama RI)</option>
										</select>
									</div>

									<div>
										<label
											htmlFor={shafaqId}
											className="mb-2 block font-medium text-gray-700 text-sm"
										>
											Shafaq (untuk Isya)
										</label>
										<select
											id={shafaqId}
											value={prayerSettingsForm.shafaq}
											onChange={(e) =>
												setPrayerSettingsForm({
													...prayerSettingsForm,
													shafaq: e.target.value,
												})
											}
											className="w-full rounded-md border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-emerald-500"
										>
											<option value="general">General</option>
											<option value="red">Red</option>
											<option value="white">White</option>
										</select>
									</div>

									<div>
										<label
											htmlFor={schoolId}
											className="mb-2 block font-medium text-gray-700 text-sm"
										>
											Mazhab (untuk Ashar)
										</label>
										<select
											id={schoolId}
											value={prayerSettingsForm.school}
											onChange={(e) =>
												setPrayerSettingsForm({
													...prayerSettingsForm,
													school: Number(e.target.value),
												})
											}
											className="w-full rounded-md border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-emerald-500"
										>
											<option value={0}>Shafi</option>
											<option value={1}>Hanafi</option>
										</select>
									</div>

									<div>
										<label
											htmlFor={midnightModeId}
											className="mb-2 block font-medium text-gray-700 text-sm"
										>
											Mode Tengah Malam
										</label>
										<select
											id={midnightModeId}
											value={prayerSettingsForm.midnightMode}
											onChange={(e) =>
												setPrayerSettingsForm({
													...prayerSettingsForm,
													midnightMode: Number(e.target.value),
												})
											}
											className="w-full rounded-md border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-emerald-500"
										>
											<option value={0}>
												Standard (Mid Sunset to Sunrise)
											</option>
											<option value={1}>Jafari (Mid Sunset to Fajr)</option>
										</select>
									</div>

									<div>
										<label
											htmlFor={timezoneId}
											className="mb-2 block font-medium text-gray-700 text-sm"
										>
											Zona Waktu
										</label>
										<select
											id={timezoneId}
											value={prayerSettingsForm.timezonestring}
											onChange={(e) =>
												setPrayerSettingsForm({
													...prayerSettingsForm,
													timezonestring: e.target.value,
												})
											}
											className="w-full rounded-md border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-emerald-500"
										>
											<option value="Asia/Jakarta">WIB (Asia/Jakarta)</option>
											<option value="Asia/Makassar">
												WITA (Asia/Makassar)
											</option>
											<option value="Asia/Jayapura">WIT (Asia/Jayapura)</option>
										</select>
									</div>

									<div className="md:col-span-2">
										<label
											htmlFor={tuneId}
											className="mb-2 block font-medium text-gray-700 text-sm"
										>
											Penyesuaian Waktu (Tune)
										</label>
										<input
											id={tuneId}
											type="text"
											value={prayerSettingsForm.tune}
											onChange={(e) =>
												setPrayerSettingsForm({
													...prayerSettingsForm,
													tune: e.target.value,
												})
											}
											className="w-full rounded-md border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-emerald-500"
											placeholder="36,36,23,-2,-8,-29,-29,-31,0"
										/>
										<p className="mt-1 text-gray-500 text-xs">
											Format:
											Imsak,Fajr,Sunrise,Dhuhr,Asr,Maghrib,Isha,Midnight,Sunset
											(dalam menit, pisahkan dengan koma)
										</p>
									</div>
								</div>

								<button
									type="button"
									onClick={handleSavePrayerSettings}
									className="flex items-center gap-2 rounded-md bg-emerald-600 px-6 py-2 text-white transition-colors hover:bg-emerald-700"
								>
									<Save size={16} />
									Simpan Pengaturan Shalat
								</button>
							</div>
						)}

						{activeTab === "iqamah" && (
							<div className="space-y-6">
								<h2 className="font-semibold text-gray-900 text-xl">
									Pengaturan Waktu Iqamah
								</h2>
								<p className="text-gray-600 text-sm">
									Atur interval waktu dari adzan hingga iqamah untuk setiap
									waktu shalat
								</p>

								<div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
									<div>
										<label
											htmlFor={fajrIqamahId}
											className="mb-2 block font-medium text-gray-700 text-sm"
										>
											Subuh (Fajr)
										</label>
										<div className="flex items-center gap-2">
											<input
												id={fajrIqamahId}
												type="number"
												min="1"
												max="60"
												value={iqamahIntervalsForm.fajr}
												onChange={(e) =>
													setIqamahIntervalsForm({
														...iqamahIntervalsForm,
														fajr: Number(e.target.value),
													})
												}
												className="w-full rounded-md border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-emerald-500"
											/>
											<span className="text-gray-500 text-sm">menit</span>
										</div>
									</div>

									<div>
										<label
											htmlFor={dhuhrIqamahId}
											className="mb-2 block font-medium text-gray-700 text-sm"
										>
											Dzuhur (Dhuhr)
										</label>
										<div className="flex items-center gap-2">
											<input
												id={dhuhrIqamahId}
												type="number"
												min="1"
												max="60"
												value={iqamahIntervalsForm.dhuhr}
												onChange={(e) =>
													setIqamahIntervalsForm({
														...iqamahIntervalsForm,
														dhuhr: Number(e.target.value),
													})
												}
												className="w-full rounded-md border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-emerald-500"
											/>
											<span className="text-gray-500 text-sm">menit</span>
										</div>
									</div>

									<div>
										<label
											htmlFor={asrIqamahId}
											className="mb-2 block font-medium text-gray-700 text-sm"
										>
											Ashar (Asr)
										</label>
										<div className="flex items-center gap-2">
											<input
												id={asrIqamahId}
												type="number"
												min="1"
												max="60"
												value={iqamahIntervalsForm.asr}
												onChange={(e) =>
													setIqamahIntervalsForm({
														...iqamahIntervalsForm,
														asr: Number(e.target.value),
													})
												}
												className="w-full rounded-md border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-emerald-500"
											/>
											<span className="text-gray-500 text-sm">menit</span>
										</div>
									</div>

									<div>
										<label
											htmlFor={maghribIqamahId}
											className="mb-2 block font-medium text-gray-700 text-sm"
										>
											Maghrib
										</label>
										<div className="flex items-center gap-2">
											<input
												id={maghribIqamahId}
												type="number"
												min="1"
												max="60"
												value={iqamahIntervalsForm.maghrib}
												onChange={(e) =>
													setIqamahIntervalsForm({
														...iqamahIntervalsForm,
														maghrib: Number(e.target.value),
													})
												}
												className="w-full rounded-md border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-emerald-500"
											/>
											<span className="text-gray-500 text-sm">menit</span>
										</div>
									</div>

									<div>
										<label
											htmlFor={ishaIqamahId}
											className="mb-2 block font-medium text-gray-700 text-sm"
										>
											Isya (Isha)
										</label>
										<div className="flex items-center gap-2">
											<input
												id={ishaIqamahId}
												type="number"
												min="1"
												max="60"
												value={iqamahIntervalsForm.isha}
												onChange={(e) =>
													setIqamahIntervalsForm({
														...iqamahIntervalsForm,
														isha: Number(e.target.value),
													})
												}
												className="w-full rounded-md border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-emerald-500"
											/>
											<span className="text-gray-500 text-sm">menit</span>
										</div>
									</div>
								</div>

								<div className="mt-8 space-y-6">
									<h3 className="font-semibold text-gray-900 text-lg">
										Pengaturan Auto-Redirect
									</h3>
									<p className="text-gray-600 text-sm">
										Konfigurasi pengalihan otomatis ke halaman iqamah
									</p>

									<div className="grid grid-cols-1 gap-6 md:grid-cols-2">
										<div>
											<label className="flex items-center gap-3">
												<input
													type="checkbox"
													checked={iqamahSettingsForm.autoRedirect}
													onChange={(e) =>
														setIqamahSettingsForm({
															...iqamahSettingsForm,
															autoRedirect: e.target.checked,
														})
													}
													className="h-4 w-4 rounded border-gray-300 text-emerald-600 focus:ring-emerald-500"
												/>
												<span className="font-medium text-gray-700 text-sm">
													Aktifkan auto-redirect ke halaman iqamah
												</span>
											</label>
											<p className="mt-1 text-gray-500 text-xs">
												Otomatis pindah ke halaman countdown saat waktu iqamah
											</p>
										</div>

										<div>
											<label
												htmlFor={redirectDelayId}
												className="mb-2 block font-medium text-gray-700 text-sm"
											>
												Delay Redirect (detik)
											</label>
											<input
												id={redirectDelayId}
												type="number"
												min="3"
												max="30"
												value={iqamahSettingsForm.redirectDelaySeconds}
												onChange={(e) =>
													setIqamahSettingsForm({
														...iqamahSettingsForm,
														redirectDelaySeconds: Number(e.target.value),
													})
												}
												className="w-full rounded-md border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-emerald-500"
												disabled={!iqamahSettingsForm.autoRedirect}
											/>
											<p className="mt-1 text-gray-500 text-xs">
												Waktu delay sebelum auto-redirect (3-30 detik)
											</p>
										</div>
									</div>
								</div>

								<div className="mt-6 rounded-lg bg-blue-50 p-4">
									<h3 className="mb-2 font-medium text-blue-900 text-sm">
										Informasi Penting:
									</h3>
									<ul className="space-y-1 text-blue-800 text-sm">
										<li>
											• Waktu iqamah akan otomatis dimulai setelah adzan selesai
										</li>
										<li>
											• Halaman countdown akan menampilkan waktu mundur hingga
											iqamah
										</li>
										<li>
											• Auto-redirect akan pindah ke halaman iqamah secara
											otomatis
										</li>
										<li>• Akses halaman iqamah di: /iqamah</li>
										<li>• Minimum 1 menit, maksimum 60 menit per shalat</li>
									</ul>
								</div>

								<button
									type="button"
									onClick={handleSaveIqamahIntervals}
									className="flex items-center gap-2 rounded-md bg-emerald-600 px-6 py-2 text-white transition-colors hover:bg-emerald-700"
								>
									<Save size={16} />
									Simpan Waktu Iqamah
								</button>
							</div>
						)}

						{activeTab === "settings" && (
							<div className="space-y-6">
								<h2 className="font-semibold text-gray-900 text-xl">
									Pengaturan Tampilan
								</h2>
								<div className="text-gray-600">
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
								</div>
							</div>
						)}
					</div>
				</div>
			</div>
		</div>
	);
};

export default AdminPanel;
