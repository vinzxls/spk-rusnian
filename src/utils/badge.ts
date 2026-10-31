/**
 * Kelas CSS badge untuk kategori kecanduan.
 *
 * Dipisah dari komponen agar file komponen hanya mengekspor komponen
 * (aturan react-refresh).
 */
import type { KategoriKecanduan } from '../types/hasil.types'

export const KATEGORI_BADGE: Record<KategoriKecanduan, string> = {
  Rendah: 'ds-badge-kategori-rendah',
  Sedang: 'ds-badge-kategori-sedang',
  Tinggi: 'ds-badge-kategori-tinggi',
  'Sangat Tinggi': 'ds-badge-kategori-sangat-tinggi',
}

/** Nama kelas lengkap untuk `<span className={badgeKategori(x)}>`. */
export function badgeKategori(kategori: KategoriKecanduan): string {
  return `ds-badge ${KATEGORI_BADGE[kategori]}`
}

export const kategoriBadge = { KATEGORI_BADGE, badgeKategori }
export default kategoriBadge
