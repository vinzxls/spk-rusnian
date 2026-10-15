-- ==========================================================================
-- Seeds awal — Sistem Rusnian (Ilmu Komputer Universitas Pattimura)
-- ==========================================================================
USE `rusnian_db`;

-- 1) Kriteria C1..C5 (dari dokumen: Durasi, Frekuensi, Ketergantungan, Gangguan Akademik, FoMO)
INSERT INTO `kriteria` (`kode_kriteria`, `nama_kriteria`, `jenis`, `bobot`) VALUES
  ('C1', 'Durasi Penggunaan Media Sosial',       'cost', 0.00),
  ('C2', 'Frekuensi Penggunaan Media Sosial',    'cost', 0.00),
  ('C3', 'Ketergantungan Terhadap Media Sosial', 'cost', 0.00),
  ('C4', 'Gangguan Aktivitas Akademik',          'cost', 0.00),
  ('C5', 'Fear of Missing Out (FoMO)',           'cost', 0.00)
ON DUPLICATE KEY UPDATE `nama_kriteria`=VALUES(`nama_kriteria`);

-- 2) Subkriteria A1..A5 per C1..C5 (dari Tabel 3.1 dokumen — skala kecanduan)
INSERT INTO `subkriteria` (`kriteria_id`, `kode_subkriteria`, `nama_subkriteria`, `nilai`) VALUES
  -- C1 Durasi
  (1, 'A1', 'Sangat Rendah', 1), (1, 'A2', 'Rendah', 2), (1, 'A3', 'Sedang', 3), (1, 'A4', 'Tinggi', 4), (1, 'A5', 'Sangat Tinggi', 5),
  -- C2 Frekuensi
  (2, 'A1', 'Sangat Rendah', 1), (2, 'A2', 'Rendah', 2), (2, 'A3', 'Sedang', 3), (2, 'A4', 'Tinggi', 4), (2, 'A5', 'Sangat Tinggi', 5),
  -- C3 Ketergantungan
  (3, 'A1', 'Sangat Rendah', 1), (3, 'A2', 'Rendah', 2), (3, 'A3', 'Sedang', 3), (3, 'A4', 'Tinggi', 4), (3, 'A5', 'Sangat Tinggi', 5),
  -- C4 Gangguan Akademik
  (4, 'A1', 'Sangat Rendah', 1), (4, 'A2', 'Rendah', 2), (4, 'A3', 'Sedang', 3), (4, 'A4', 'Tinggi', 4), (4, 'A5', 'Sangat Tinggi', 5),
  -- C5 FoMO
  (5, 'A1', 'Sangat Rendah', 1), (5, 'A2', 'Rendah', 2), (5, 'A3', 'Sedang', 3), (5, 'A4', 'Tinggi', 4), (5, 'A5', 'Sangat Tinggi', 5)
ON DUPLICATE KEY UPDATE `nama_subkriteria`=VALUES(`nama_subkriteria`), `nilai`=VALUES(`nilai`);

-- 3) Users demo (password: $2a$10$ demo — ganti hash real di runtime via auth.service)
INSERT INTO `users` (`username`, `password_hash`, `role`, `nama_lengkap`) VALUES
  ('admin1', '$2a$10$N.z3HdLyZ5V8xG.IpxxZAu', 'admin',     'Admin Prodi Ilmu Komputer'),
  ('202106070001', '$2a$10$N.z3HdLyZ5V8xG.IpxxZAu', 'mahasiswa', 'Budi Santoso (demo)')
ON DUPLICATE KEY UPDATE `nama_lengkap`=VALUES(`nama_lengkap`);

-- 4) Mahasiswa demo (linked ke user mahasiswa di atas)
INSERT INTO `mahasiswa` (`user_id`, `nim`, `nama`, `prodi`, `fakultas`, `angkatan`) VALUES
  ((SELECT `id` FROM `users` WHERE `username`='202106070001'), '202106070001', 'Budi Santoso', 'Ilmu Komputer', 'MIPA', 2021),
  ((SELECT `id` FROM `users` WHERE `username`='202106070001'), '202106070002', 'Ani Wijaya',   'Ilmu Komputer', 'MIPA', 2022) -- demo duplikat user_id disengaja untuk contoh
ON DUPLICATE KEY UPDATE `nama`=VALUES(`nama`);

-- Catatan: Angkatan ke-2 sebaiknya pakai user terpisah. Di demo sistem, buat via UI CRUD.
