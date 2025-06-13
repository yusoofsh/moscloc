import { ArrowLeft, Plus, Save, Trash2 } from "lucide-react";
import type React from "react";
import { useId, useState } from "react";
import { usePrayerContext } from "../contexts/PrayerContext";

const AdminPanel: React.FC = () => {
	const { mosqueInfo, announcements, updateMosqueInfo, updateAnnouncements } =
		usePrayerContext();
	const [activeTab, setActiveTab] = useState("mosque");
	const [formData, setFormData] = useState(mosqueInfo);

	// Generate unique IDs for form controls
	const nameId = useId();
	const contactId = useId();
	const addressId = useId();
	const latitudeId = useId();
	const longitudeId = useId();
	const [announcementList, setAnnouncementList] = useState(announcements);
	const [newAnnouncement, setNewAnnouncement] = useState("");

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
								Kembali ke Tampilan
							</button>
							<h1 className="font-bold text-2xl text-gray-900">Panel Admin</h1>
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
