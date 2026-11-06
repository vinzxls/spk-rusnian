# Panduan Menjalankan Sistem SPK Rusnian

Selamat datang! Panduan ini akan membantu Anda menjalankan sistem Pendukung Keputusan (AHP + VIKOR) di laptop Anda.

## 1. Persiapan
Pastikan laptop Anda sudah terinstal:
* **Node.js**: (Versi 18 atau 20 ke atas)
* **Git**: (Untuk manajemen kode)

## 2. Memulai Sistem
Buka **Command Prompt (CMD)** atau **PowerShell**, lalu ikuti langkah berikut:

### Langkah A: Masuk ke Folder Proyek
Ketik perintah di bawah ini dan tekan Enter:
```cmd
cd C:\Users\Rusni\spk-rusnian
```

### Langkah B: Instalasi Komponen Sistem
Jalankan perintah berikut untuk mengunduh semua library yang diperlukan:
```cmd
npm install
```

> **Wajib dijalankan setiap kali setelah `git pull`.** Perintah `git pull` hanya mengambil kode, bukan library. Kalau ada library baru yang ditambahkan, sistem akan gagal jalan sampai `npm install` dijalankan.

### Langkah C: Menjalankan Sistem
Jalankan aplikasi dengan perintah:
```cmd
npm run dev
```

Tunggu beberapa saat sampai muncul link seperti: `http://localhost:5173`. Klik link tersebut atau salin ke browser (Chrome/Edge) Anda.

## 3. Akun Akses (Login)
* **Admin**:
  * Username: `admin1`
  * Password: `demo`
* **Mahasiswa**:
  * Cukup masukkan **NIM** — tanpa password.
  * NIM: `202106070001` (Budi Santoso)
  * NIM: `202206070001` (Ani Wijaya)

Mahasiswa baru yang ditambahkan admin otomatis bisa login memakai NIM-nya.

## 4. Penyimpanan Data

Data disimpan di **server**, bukan hanya di browser. Artinya:

* Mahasiswa bisa mengisi kuesioner dari HP/laptop mana pun.
* Admin bisa melihat jawaban terbaru dengan menekan **Muat Ulang** di halaman Rekap Kuesioner.
* Menghapus cache/riwayat browser **tidak** menghilangkan data, karena data asli ada di server.

Di Dashboard Admin ada kartu **Penyimpanan Data** dengan status:

* **Server terhubung** — semua perubahan otomatis dikirim ke server.
* **Mode lokal** — server tidak terdeteksi. Data tetap aman di perangkat ini dan bisa dikirim menyusul lewat tombol **Kirim Data Lokal ke Server**.

## 5. Upload ke Hosting

Hanya perlu dilakukan saat ada pembaruan yang ingin dipasang di server (subdomain `sistems-spk.julyofus.space`).

1. Dari komputer, jalankan `npm run build` lalu buat paket `siap_deploy.zip` (isi folder `dist/`).
2. Buka **File Manager Hostinger**, masuk ke folder `public_html/sistems-spk`.
3. Unggah `siap_deploy.zip` ke folder itu, lalu klik **Extract**.
4. Pada kolom **Choose folder name** saat extract, **isi dengan titik** (`.`) atau pastikan foldernya `public_html/sistems-spk`. Jangan dikosongkan — kalau kosong, berkas akan diekstrak ke folder baru dan aplikasi tidak terbaca.
5. Pastikan setelah extract ada berkas berikut **sejajar** di folder yang sama:
   * `index.html`
   * `api.php`
   * `.htaccess`
   * folder `assets/`
6. Hapus `siap_deploy.zip` (dan `default.php` bila ada) dari server setelah extract.
7. Folder `data/` **jangan** dibuat manual dan jangan diunggah — PHP membuatnya otomatis dan butuh izin tulis (biasanya sudah `755`).
8. Buka aplikasinya, login admin, lalu cek kartu **Penyimpanan Data** harus berbunyi **Server terhubung**.

## 6. Cara Memperbarui Sistem
Ketika ada pembaruan kode, jalankan **berurutan** (jangan hanya `git pull`):

```cmd
git pull
npm install
```

Lalu hentikan server yang sedang berjalan dengan **Ctrl + C**, dan jalankan ulang:
```cmd
npm run dev
```

## 7. Tips Jika Ada Kendala

### `Failed to resolve import "..."` atau `Cannot find module`
Artinya ada library yang belum terpasang. Solusi:
```cmd
npm install
```
Lalu **Ctrl + C** pada terminal yang error, dan `npm run dev` lagi.

### Masih error setelah `npm install`
Biasanya cache lama. Reset total library:
```cmd
rmdir /s /q node_modules
del package-lock.json
npm install
npm run dev
```

### Error "command not found" / `npm` tidak dikenali
Pastikan Node.js sudah terinstal. Cek dengan:
```cmd
node -v
npm -v
```
Bila kosong, instal ulang Node.js dari https://nodejs.org (pilih versi LTS).

### Port 5173 sudah dipakai
Tutup terminal lain yang masih menjalankan sistem, atau hentikan dengan **Ctrl + C**. Bisa juga jalankan di port lain:
```cmd
npm run dev -- --port 5174
```

### Browser tidak terbuka otomatis
Buka browser Anda dan ketik manual: `http://localhost:5173`

### Halaman tampak kosong atau data hilang
Data asli ada di server. Buka Dashboard Admin lalu tekan **Tarik Data dari Server**. Bila status masih **Mode lokal**, berarti `api.php` belum ada atau folder `data/` tidak bisa ditulis — hubungi pengelola hosting. Coba juga *hard refresh* dengan **Ctrl + Shift + R**.

### Data yang diisi tidak muncul di perangkat lain
Periksa badge di Dashboard Admin:

* **Server terhubung** → tekan **Muat Ulang** di halaman Rekap Kuesioner.
* **Mode lokal** → server tidak terhubung. Data tersimpan di perangkat itu saja sampai tombol **Kirim Data Lokal ke Server** berhasil.

---

### Catatan
Untuk penggunaan nyata oleh banyak mahasiswa, data disimpan terpusat lewat `public/api.php` (file JSON dengan penguncian `flock`). Pastikan `api.php` terunggah di folder yang sama dengan `index.html` dan folder `data/` dapat ditulis oleh PHP.

---

*Terima kasih telah menggunakan Sistem SPK Rusnian.*
