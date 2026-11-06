# Sistem Identifikasi Tingkat Kecanduan Media Sosial (AHP + VIKOR)

Sistem pendukung keputusan berbasis web untuk mengidentifikasi tingkat kecanduan media sosial pada mahasiswa Ilmu Komputer Universitas Pattimura menggunakan metode **AHP (Analytical Hierarchy Process)** untuk pembobotan kriteria dan **VIKOR** untuk perangkingan alternatif.

---

## Tech Stack

- **Framework**: React 18 + TypeScript + Vite
- **Routing**: react-router-dom dengan `ProtectedRoute` berbasis role (admin / mahasiswa)
- **Styling**: CSS Custom Properties (`design-system.css`), tanpa framework CSS
- **Penyimpanan server**: PHP + file JSON (`public/api.php`), tanpa database
- **Penyimpanan klien**: localStorage sebagai cache (aplikasi tetap jalan tanpa server)

---

## Struktur Proyek

```
src/
├── types/        → kontrak tipe AHP, VIKOR, hasil, mahasiswa
├── utils/        → kalkulasi murni: ahp-calculator, vikor-calculator, excel, auth-helper
├── services/     → auth, mahasiswa, kuesioner, rekap, sync (localStorage ⇄ server), api
├── components/   → auth/, layout/, admin/, mahasiswa/, ahp/, ui/
├── hooks/        → useAuth (Context global), useHasilRanking
├── styles/       → design-system.css
└── pages/        → admin/ (8 halaman), mahasiswa/ (2 halaman), auth/

public/
├── api.php       → backend JSON: state / push / submit-kuesioner / clear-kuesioner
└── .htaccess     → SPA rewrite (semua rute diarahkan ke index.html)

db/               → skema MySQL lama (arsip, tidak dipakai runtime)
docs/             → penjelasan-fitur.pdf / .html
```

---

## Cara Menjalankan (lokal)

```bash
npm install
npm run dev
```

Akses `http://localhost:5173`.

**Login:**
- Admin: username `admin1`, password `demo`
- Mahasiswa: cukup NIM — `202106070001` (Budi Santoso) atau `202206070001` (Ani Wijaya)

Tanpa `api.php` aplikasi tetap berjalan penuh (mode lokal). Panel admin akan menampilkan badge **Mode lokal**.

---

## Penyimpanan Data

Data disimpan di server lewat `public/api.php` dalam satu berkas `data/state.json`, dilindungi `flock` + atomic rename.

| Endpoint | Method | Fungsi |
|---|---|---|
| `api.php?action=state` | GET | Ambil seluruh state + flag `empty` |
| `api.php?action=push` | POST | Kirim satu koleksi (`users`, `mahasiswa`, `ahp`, `kriteria`, `subkriteria`) |
| `api.php?action=submit-kuesioner` | POST | Upsert **satu** record jawaban (atomik) |

Aturan penting:

- Jawaban kuesioner **tidak pernah** dikirim sebagai satu array. Setiap submit memakai endpoint atomik, sehingga dua mahasiswa yang mengirim bersamaan tidak saling menimpa.
- Setiap perubahan dikirim per-koleksi, bukan seluruh state, agar admin yang menyimpan bobot AHP tidak menghapus data mahasiswa.
- Semua panggilan API tidak pernah melempar error — aplikasi tetap jalan saat offline.
- `data/` dibuat otomatis oleh PHP dan butuh izin tulis; isinya dilindungi `.htaccess`.
- Endpoint penghapus massal sengaja tidak disediakan — satu-satunya cara menghapus data adalah lewat panel admin atau langsung mengedit `data/state.json` di server.

Base URL API dapat diarahkan ke host lain lewat `VITE_API_URL`.

---

## Deploy ke Hosting

1. `npm run build`
2. Unggah **isi** `dist/` ke folder hosting (mis. `public_html/sistems-spk`), termasuk `api.php` dan `.htaccess`.
3. Pastikan folder dapat menulis (PHP akan membuat `data/`).
4. Folder `data/` **jangan** diunggah dari komputer — biarkan server membuatnya.

`dist/router.php` hanyalah alat uji lokal dan tidak ikut dibuat oleh build.

---

## Verifikasi

| Verifikasi | Status |
|---|---|
| `npx tsc --noEmit` | 0 error |
| `npm run lint` | 0 error, 0 warning |
| `npm run build` | sukses |
| Uji end-to-end browser (25 skenario) | 25/25 lulus |
| Uji sinkronisasi multi-perangkat (21 skenario) | 21/21 lulus |
| Uji mode offline (9 skenario) | 9/9 lulus |
| Uji konkurensi API (12 submit bersamaan) | 12/12 tersimpan |

---

*Sistem Identifikasi Kecanduan Media Sosial (AHP + VIKOR) — Universitas Pattimura*
