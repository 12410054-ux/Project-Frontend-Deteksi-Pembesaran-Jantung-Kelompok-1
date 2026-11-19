# 🫀 Ruang Rontgen — AI Kardiomegali, Login Auth & User Administration

Aplikasi web modern berbasis **React 19 SPA (Single Page Application)** dengan backend **Flask & Deep Learning CNN Model** untuk deteksi **Kardiomegali (pembesaran jantung)** pada citra rontgen toraks (*Chest X-Ray*).

Sistem dirancang khusus untuk **Kelas Frontend**, mengimplementasikan arsitektur autentikasi terpadu:
1. **Fitur Login & Pendaftaran Akun (*Authentication & Session*)**
2. **User Administration** (*Sesuai Akun yang Login*)
3. **Data Historis Pengguna** (*Tercatat Otomatis Setelah Login*)
4. **Fokus Tunggal Model AI: CNN Model**

---

## 🔐 Alur Autentikasi & Pengelolaan Data Sistem

### 1. 🔑 Halaman Masuk & Pendaftaran Akun (`AuthView.jsx`)
- Saat pertama kali dibuka atau belum ada sesi aktif, sistem akan menampilkan antarmuka autentikasi.
- **Basis Data Awal Bersih / Kosong**: Sistem dimulai dari 0 data pengguna dan 0 riwayat scan.
- Pengguna dapat langsung mendaftarkan akun pertama pada tab **"Daftar Akun Baru"** dengan mengisi:
  - **Nama Lengkap & Gelar**
  - **Username Unik**
  - **Email**
  - **Kata Sandi (Password)**
  - **Peran Sistem**:
    - **Dokter Spesialis** (`dokter`)
    - **Radiolog** (`radiolog`)
    - **Mahasiswa / Pengguna** (`mahasiswa`)
- Setelah mendaftar atau login, sesi pengguna tersimpan secara aman dan antarmuka beralih ke ruang kerja.

### 2. 👥 User Administration Sesuai Akun Login (`UserAdministration.jsx`)
- Menampilkan kartu profil khusus **"Akun Login Aktif"** di bagian atas halaman yang memuat avatar, nama, username, email, dan peran akun yang sedang digunakan saat ini.
- Baris tabel akun Anda ditandai khusus dengan badge **"Anda"**.
- Fitur administrasi pengguna:
  - Mendaftarkan akun staf/pengguna baru ke sistem.
  - Memperbarui data pengguna (*Edit User*).
  - Mengaktifkan / menonaktifkan status akun (*Active / Inactive toggle*).
  - Menghapus akun (dengan proteksi akun aktif tidak dapat dihapus sendiri).
  - Tombol **"Keluar Sesi (Logout)"** untuk mengakhiri sesi dan kembali ke halaman login.

### 3. 📊 Data Historis Pengguna (`UserHistory.jsx`)
- **Kosong di Awal**: Tidak ada data tiruan/dummy di awal sistem.
- **Pencatatan Otomatis Setelah Login**: Setiap kali pengguna melakukan analisis rontgen di menu **Analisis Rontgen**, citra dan hasil diagnosa AI otomatis dicatat ke basis data SQLite persisten dengan mengaitkan identitas akun pengguna yang sedang login sebagai pemeriksa resmi.
- Metrik KPI, tabel data, modal pratinjau rontgen, dan fitur **Ekspor ke CSV** langsung aktif begitu pemeriksaan dilakukan.

### 4. 🧠 Inferensi AI: CNN Model
- Fokus 100% pada arsitektur **CNN Model** (`cnn_model.keras`).
- Tanpa gangguan pilihan model lain atau preset dummy, menjaga inferensi cepat, ringan, dan stabil.

---

## 📂 Struktur Komponen Proyek

```
frontend/src/
├── components/
│   ├── AuthView.jsx           # 🔐 Halaman Login & Registrasi Akun
│   ├── Navbar.jsx             # Navigasi, info profil aktif, & tombol Logout
│   ├── DropzoneUploader.jsx   # Input citra rontgen & metadata pasien (CNN Model)
│   ├── MedicalImageViewer.jsx # Viewport rontgen (Zoom & Kecerahan)
│   ├── DiagnosisCard.jsx      # Kartu hasil analisis AI & link ke Data Historis
│   ├── UserHistory.jsx        # ⭐ Data Historis Pengguna & Ekspor CSV
│   └── UserAdministration.jsx # ⭐ User Administration sesuai akun login
├── context/
│   └── AppContext.jsx         # Global state (CurrentUser, Auth, Users, History)
├── App.jsx                    # Root layout & proteksi autentikasi (Auth Guard)
└── index.css                  # Desain sistem klinis & autentikasi responsif
```

---

## 🚀 Cara Menjalankan

### Mode Pengembangan Frontend (Vite HMR):
1. **Jalankan Backend**: Jalankan [jalankan_backend.bat](file:///d:/project%20X-ray%20jantung-frontend/jalankan_backend.bat) (Port `5000`)
2. **Jalankan React**: Jalankan [jalankan_react_dev.bat](file:///d:/project%20X-ray%20jantung-frontend/jalankan_react_dev.bat) (Port `5173`)
3. Buka peramban di **`http://localhost:5173`**.

### Mode Produksi Tunggal:
Cukup jalankan [jalankan_backend.bat](file:///d:/project%20X-ray%20jantung-frontend/jalankan_backend.bat) dan buka **`http://127.0.0.1:5000`** (Flask langsung menyajikan antarmuka React 19).
