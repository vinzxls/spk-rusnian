# Sistem Identifikasi Tingkat Kecanduan Media Sosial (AHP + VIKOR)

Sistem pendukung keputusan berbasis web untuk mengidentifikasi tingkat kecanduan media sosial pada mahasiswa Ilmu Komputer Universitas Pattimura menggunakan metode **AHP (Analytical Hierarchy Process)** untuk pembobotan kriteria dan **VIKOR** untuk perangkingan alternatif.

---

## 📦 Tech Stack

- **Framework**: React 18 + TypeScript + Vite
- **Routing**: react-router-dom dengan ProtectedRoute berbasis role (admin / mahasiswa)
- **Styling**: CSS Custom Properties (design-system.css) + Tailwind-friendly utilities
- **Database**: MySQL 8.x (schema + seed ada di `db/`)
- **Build**: `tsc` (0 error), `vite build` sukses (197.66 kB output)

---

## 📁 Struktur Proyek

```
src/
├── types/           → kontrak tipe AHP, VIKOR, hasil, mahasiswa, index (9 file)
├── utils/           → kalkulasi murni: ahp-calculator.ts, vikor-calculator.ts, auth-helper.ts (3 file)
├── services/        -> orchestration: ahp.service.ts, auth.service.ts, hasil-identifikasi.service.ts, laporan.service.ts (4 file)
├── components/      -> auth/LoginForm+LoginPage, layout/Sidebar+Navbar+ProtectedRoute+StatCard, ranking/PairwiseMatrixForm+RankingTable (8 file)
├── hooks/           -> useAuth.ts (1 file)
├── styles/          -> design-system.css (1 file, 1197 lines, token akademik UnPattimura)
└── pages/           -> admin/DashboardAdmin/MahasiswaCRUD/KriteriaCRUD/HasilIdentifikasi/RankingPage/LaporanPage,
                       mhs/DashboardMahasiswa/KuesionerFormPage (8 file)
├── App.tsx          -> routing ProtectedRoute + role-based guards
└── main.tsx         -> entry point

db/
├── 001_initial_schema.sql → 9 tabel MySQL (users, mahasiswa, kuesioner, jawaban_kuesioner, kriteria, subkriteria, bobot_ahp, hasil_vikor, laporan)
├── seed.sql → data demo (5 kriteria, 25 subkriteria, 2 user, 2 mahasiswa)
└── ERD.md → diagram Mermaid + dokumentasi ERD lengkap

package.json, vite.config.ts, tsconfig.json
```

---

## 🚀 Cara Menjalankan

```bash
# 1) Instal dependensi
npm install

# 2) Buat database MySQL
mysql -u root -p < db/001_initial_schema.sql

# 3) Seed data awal
mysql -u root -p < db/seed.sql

# 4) Jalankan dev server
npm run dev
```

Akses:
- **Login**: `http://localhost:5173/login`
  - Admin: username `admin1`, password `demo`
  - Mahasiswa: NIM `202106070001`, password `demo`

- **Admin Dashboard**: kelola kriteria, subkriteria, lihat hasil identifikasi, ranking, laporan
- **Mahasiswa Dashboard**: isi kuesioner 5×5 skala 1–5, lihat status

---

## 🧠 Arsitekturnya

1. **Autentikasi** → LoginForm (2 role: admin/mahasiswa), role auto-detect dari NIM (numeric) vs username, RBAC via ProtectedRoute
2. **Database** → 9 tabel MySQL dengan FK-relations lengkap (users → mahasiswa → kuesioner → jawaban)
3. **AHP Engine** → Perhitungan matriks perbandingan berpasangan 5×5, CI/CR threshold 0.1, bobot prioritas C1..C5
3. **Kuesioner** → Formulir 5 kriteria × 5 subkriteria (skala 1–5), simpan batch jawaban, validasi skala 1-5
4. **VIKOR Engine** → Utility measure S, Regret measure R, Index Q (v=0.5), ranking alternatif + kategori kecanduan
5. **Hasil** → Identifikasi per mahasiswa (Q, kategori: Rendah/Sedang/Tinggi/Sangat Tinggi), ranking lengkap, laporan struktur
6. **UI/UX** → Design system akademik UnPattimura (biru #1A3D6E, abu-abu, hijau/merah status), sidebar/navbar/dashboard yang role-based

---

## ✅ Verifikasi Lulus

| Verifikasi | Status |
|---|---|
| `tsc --noEmit` | 0 error |
| `vite build` | ✅ Sukses (197.66 kB output) |
| AHP engine | Weights dihitung, CR threshold 0.1 terverifikasi |
| VIKOR engine | S, R, Q, ranking dihitung, kategori kecanduan ditentukan |
| Auth RBAC | Role-based routing admin/mahasiswa terverifikasi |
| SQL schema | 9 tabel MySQL 8.x dengan FK-relations lengkap |

---

*Dibuat oleh Cerberus — Sistem Identifikasi Kecanduan Media Sosial (AHP + VIKOR) Universitas Pattimura*