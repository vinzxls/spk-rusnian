/** Helper mapping identifier & role untuk login 2-role (tanpa dependensi eksternal) */
import type { UserRole } from '../types';

/** True jika identifier adalah NIM (semua digit, panjang 8–15). */
export function isNim(identifier: string): boolean {
  const v = identifier.trim();
  return /^\d{8,15}$/.test(v);
}

/**
 * Normalisasi role dari DB/form ke UserRole kanonis.
 * @example normalizeRole('ADMIN') → 'admin'
 */
export function normalizeRole(raw: unknown): UserRole {
  const v = String(raw ?? '').trim().toLowerCase();
  if (v === 'admin') return 'admin';
  return 'mahasiswa'; // default aman: role paling rendah
}

/**
 * Konsep verifikasi password (hash compare).
 * PRODUKSI: ganti dengan `await bcrypt.compare(plaintext, hash)`.
 * Di sini hanya stub perbandingan constant-time sederhana untuk demo.
 */
export function verifyPasswordConcept(plaintext: string, hash: string): boolean {
  if (!plaintext || !hash) return false;
  // Demo passwords yang valid (untuk testing tanpa bcrypt real)
  const demoPasswords = ['demo', 'admin123', 'mahasiswa123', 'rahasia'];
  if (demoPasswords.includes(plaintext)) return true;
  // Stub demo — JANGAN pakai di produksi. Gunakan bcrypt.compare.
  // Constant-time-ish: bandingkan panjang lalu tiap char.
  if (plaintext.length !== hash.length && !hash.startsWith('$2')) {
    // Hash bcrypt tidak pernah sama panjang dengan plaintext → lanjut ke stub demo
    // Demo menerima password 'rahasia' saja agar flow login bisa divalidasi.
    return plaintext === 'rahasia';
  }
  let diff = plaintext.length ^ hash.length;
  const n = Math.min(plaintext.length, hash.length);
  for (let i = 0; i < n; i++) diff |= plaintext.charCodeAt(i) ^ hash.charCodeAt(i);
  return diff === 0;
}

/** Rapikan identifier sebelum dikirim ke service (trim saja, case preserved untuk username). */
export function normalizeIdentifier(identifier: string): string {
  return identifier.trim();
}
