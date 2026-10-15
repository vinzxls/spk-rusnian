-- ==========================================================================
-- Sistem Identifikasi Tingkat Kecanduan Media Sosial
-- Mahasiswa Ilmu Komputer Universitas Pattimura (AHP + VIKOR)
-- MySQL 8.x — 9 tabel
-- ==========================================================================
CREATE DATABASE IF NOT EXISTS `rusnian_db`
  DEFAULT CHARACTER SET utf8mb4
  DEFAULT COLLATE utf8mb4_unicode_ci;

USE `rusnian_db`;

-- -----------------------------------------------------
-- 1. users (login admin & mahasiswa)
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `users` (
  `id` INT UNSIGNED NOT NULL AUTO_INCREMENT,
  `username` VARCHAR(50) NOT NULL,
  `password_hash` VARCHAR(255) NOT NULL,
  `role` ENUM('admin','mahasiswa') NOT NULL DEFAULT 'mahasiswa',
  `nama_lengkap` VARCHAR(100) NOT NULL,
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_username` (`username`),
  INDEX `idx_role` (`role`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- -----------------------------------------------------
-- 2. mahasiswa
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `mahasiswa` (
  `id` INT UNSIGNED NOT NULL AUTO_INCREMENT,
  `user_id` INT UNSIGNED NOT NULL,
  `nim` VARCHAR(20) NOT NULL,
  `nama` VARCHAR(100) NOT NULL,
  `prodi` VARCHAR(50) NOT NULL DEFAULT 'Ilmu Komputer',
  `fakultas` VARCHAR(50) NOT NULL DEFAULT 'MIPA',
  `angkatan` YEAR NOT NULL,
  `alamat` TEXT NULL,
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_nim` (`nim`),
  INDEX `idx_user_id` (`user_id`),
  INDEX `idx_nama` (`nama`),
  CONSTRAINT `fk_mahasiswa_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- -----------------------------------------------------
-- 3. kuesioner (periode/paket pengisian)
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `kuesioner` (
  `id` INT UNSIGNED NOT NULL AUTO_INCREMENT,
  `kode_kuesioner` VARCHAR(20) NOT NULL,
  `nama_kuesioner` VARCHAR(100) NOT NULL,
  `deskripsi` TEXT NULL,
  `aktif` TINYINT(1) NOT NULL DEFAULT 1,
  `tanggal_mulai` DATETIME NOT NULL,
  `tanggal_selesai` DATETIME NOT NULL,
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_kode_kuesioner` (`kode_kuesioner`),
  INDEX `idx_aktif` (`aktif`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- -----------------------------------------------------
-- 4. jawaban_kuesioner (jawaban per mahasiswa per kuesioner)
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `jawaban_kuesioner` (
  `id` INT UNSIGNED NOT NULL AUTO_INCREMENT,
  `kuesioner_id` INT UNSIGNED NOT NULL,
  `mahasiswa_id` INT UNSIGNED NOT NULL,
  `jawaban_json` TEXT NOT NULL COMMENT 'JSON: {C1:1..5, C2:1..5, ...} atau per subkriteria',
  `tanggal_isi` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_kuesioner_mahasiswa` (`kuesioner_id`, `mahasiswa_id`),
  INDEX `idx_kuesioner` (`kuesioner_id`),
  INDEX `idx_mahasiswa` (`mahasiswa_id`),
  CONSTRAINT `fk_jawaban_kuesioner` FOREIGN KEY (`kuesioner_id`) REFERENCES `kuesioner` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_jawaban_mahasiswa` FOREIGN KEY (`mahasiswa_id`) REFERENCES `mahasiswa` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- -----------------------------------------------------
-- 5. kriteria (C1..C5)
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `kriteria` (
  `id` INT UNSIGNED NOT NULL AUTO_INCREMENT,
  `kode_kriteria` VARCHAR(10) NOT NULL COMMENT 'C1..C5',
  `nama_kriteria` VARCHAR(100) NOT NULL,
  `jenis` ENUM('benefit','cost') NOT NULL DEFAULT 'cost',
  `bobot` DECIMAL(8,6) NOT NULL DEFAULT 0.000000 COMMENT 'bobot hasil AHP',
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_kode_kriteria` (`kode_kriteria`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- -----------------------------------------------------
-- 6. subkriteria (A1..A5 per kriteria)
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `subkriteria` (
  `id` INT UNSIGNED NOT NULL AUTO_INCREMENT,
  `kriteria_id` INT UNSIGNED NOT NULL,
  `kode_subkriteria` VARCHAR(10) NOT NULL COMMENT 'A1..A5',
  `nama_subkriteria` VARCHAR(100) NOT NULL,
  `nilai` DECIMAL(5,2) NOT NULL COMMENT 'nilai skala 1..5',
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_kriteria_sub` (`kriteria_id`, `kode_subkriteria`),
  INDEX `idx_kriteria` (`kriteria_id`),
  CONSTRAINT `fk_subkriteria_kriteria` FOREIGN KEY (`kriteria_id`) REFERENCES `kriteria` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- -----------------------------------------------------
-- 7. bobot_ahp (pasangan perbandingan Saaty + hasil)
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `bobot_ahp` (
  `id` INT UNSIGNED NOT NULL AUTO_INCREMENT,
  `kriteria_id_1` INT UNSIGNED NOT NULL,
  `kriteria_id_2` INT UNSIGNED NOT NULL,
  `nilai_perbandingan` DECIMAL(8,4) NOT NULL COMMENT 'skala Saaty 1/9..9',
  `bobot_hasil` DECIMAL(8,6) NULL,
  `lambda_max` DECIMAL(10,6) NULL,
  `ci` DECIMAL(10,6) NULL,
  `cr` DECIMAL(10,6) NULL,
  `konsisten` TINYINT(1) NULL DEFAULT NULL COMMENT '1 jika CR < 0.1',
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_pasangan` (`kriteria_id_1`, `kriteria_id_2`),
  INDEX `idx_k1` (`kriteria_id_1`),
  INDEX `idx_k2` (`kriteria_id_2`),
  CONSTRAINT `fk_ahp_k1` FOREIGN KEY (`kriteria_id_1`) REFERENCES `kriteria` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_ahp_k2` FOREIGN KEY (`kriteria_id_2`) REFERENCES `kriteria` (`id`) ON DELETE CASCADE,
  CONSTRAINT `chk_ahp_beda` CHECK (`kriteria_id_1` <> `kriteria_id_2`),
  CONSTRAINT `chk_ahp_nilai` CHECK (`nilai_perbandingan` > 0)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- -----------------------------------------------------
-- 8. hasil_vikor (S, R, Q + ranking per mahasiswa)
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `hasil_vikor` (
  `id` INT UNSIGNED NOT NULL AUTO_INCREMENT,
  `kuesioner_id` INT UNSIGNED NOT NULL,
  `mahasiswa_id` INT UNSIGNED NOT NULL,
  `nilai_s` DECIMAL(10,6) NOT NULL,
  `nilai_r` DECIMAL(10,6) NOT NULL,
  `nilai_q` DECIMAL(10,6) NOT NULL,
  `ranking` INT NOT NULL,
  `kategori` VARCHAR(20) NULL COMMENT 'Rendah/Sedang/Tinggi/Sangat Tinggi',
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_kuesioner_mahasiswa_vikor` (`kuesioner_id`, `mahasiswa_id`),
  INDEX `idx_ranking` (`ranking`),
  INDEX `idx_q` (`nilai_q`),
  CONSTRAINT `fk_vikor_kuesioner` FOREIGN KEY (`kuesioner_id`) REFERENCES `kuesioner` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_vikor_mahasiswa` FOREIGN KEY (`mahasiswa_id`) REFERENCES `mahasiswa` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- -----------------------------------------------------
-- 9. laporan (arsip hasil cetak)
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `laporan` (
  `id` INT UNSIGNED NOT NULL AUTO_INCREMENT,
  `kuesioner_id` INT UNSIGNED NOT NULL,
  `judul` VARCHAR(150) NOT NULL,
  `jenis_laporan` ENUM('individual','rekap','ranking') NOT NULL DEFAULT 'rekap',
  `konten_json` TEXT NULL COMMENT 'snapshot JSON hasil + ranking',
  `file_path` VARCHAR(255) NULL,
  `dibuat_oleh` INT UNSIGNED NULL COMMENT 'users.id admin',
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  INDEX `idx_kuesioner_laporan` (`kuesioner_id`),
  INDEX `idx_jenis` (`jenis_laporan`),
  CONSTRAINT `fk_laporan_kuesioner` FOREIGN KEY (`kuesioner_id`) REFERENCES `kuesioner` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_laporan_user` FOREIGN KEY (`dibuat_oleh`) REFERENCES `users` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
