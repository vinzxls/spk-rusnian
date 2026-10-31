/**
 * Definisi menu sidebar per role.
 *
 * Dipisah dari komponen Sidebar agar file komponen hanya mengekspor komponen
 * (aturan react-refresh) dan susunan menu mudah diubah tanpa menyentuh JSX.
 */
import type { UserRole } from '../../types'

export type IconName =
  | 'home'
  | 'users'
  | 'sliders'
  | 'scale'
  | 'clipboard-check'
  | 'trophy'
  | 'file-text'
  | 'clipboard'
  | 'grid'

export interface NavItem {
  label: string
  to: string
  icon: IconName
  /** Badge angka opsional (mis. jumlah pending) */
  badge?: string
}

export interface NavSection {
  title?: string
  items: NavItem[]
}

/** Menu Admin — sesuai kriteria role-based navigation. */
export const ADMIN_NAV: NavSection[] = [
  {
    title: 'Menu Utama',
    items: [
      { label: 'Dashboard', to: '/admin/dashboard', icon: 'grid' },
      { label: 'Data Mahasiswa', to: '/admin/mahasiswa', icon: 'users' },
      { label: 'Kriteria & Subkriteria', to: '/admin/kriteria', icon: 'sliders' },
    ],
  },
  {
    title: 'Analisis',
    items: [
      { label: 'Pembobotan AHP', to: '/admin/ahp', icon: 'scale' },
      { label: 'Hasil Identifikasi', to: '/admin/hasil-identifikasi', icon: 'clipboard-check' },
      { label: 'Ranking', to: '/admin/ranking', icon: 'trophy' },
      { label: 'Rekap Kuesioner', to: '/admin/kuesioner', icon: 'clipboard' },
      { label: 'Laporan', to: '/admin/laporan', icon: 'file-text' },
    ],
  },
]

/** Menu Mahasiswa. */
export const MAHASISWA_NAV: NavSection[] = [
  {
    title: 'Menu Utama',
    items: [
      { label: 'Dashboard', to: '/mahasiswa/dashboard', icon: 'grid' },
      { label: 'Kuesioner', to: '/mahasiswa/kuesioner', icon: 'clipboard' },
    ],
  },
]

/** Ambil sections navigasi sesuai role. */
export function getNavSections(role: UserRole): NavSection[] {
  return role === 'admin' ? ADMIN_NAV : MAHASISWA_NAV
}

export const navConfig = { ADMIN_NAV, MAHASISWA_NAV, getNavSections }
export default navConfig
