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

### Langkah C: Menjalankan Sistem
Jalankan aplikasi dengan perintah:
```cmd
npm run dev
```

Tunggu beberapa saat sampai muncul link seperti: `http://localhost:5173`. Klik link tersebut atau salin ke browser (Chrome/Edge) Anda.

## 3. Akun Akses (Login)
* **Admin**:
  * Username: `admin1`
  * Password: `password_demo`
* **Mahasiswa**:
  * NIM: `202106070001`
  * Password: `password_demo`

## 4. Tips Jika Ada Kendala
* Jika saat menjalankan `npm run dev` muncul error "command not found", pastikan Node.js sudah terinstal dengan benar.
* Jika browser tidak terbuka, buka browser Anda dan ketik manual: `http://localhost:5173`.
* Jika butuh pembaruan kode terbaru dari GitHub, ketik: `git pull`.

---
*Terima kasih telah menggunakan Sistem SPK Rusnian.*
