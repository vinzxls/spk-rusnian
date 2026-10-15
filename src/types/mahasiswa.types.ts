import type { User, UserRole } from '../types'

export interface Mahasiswa {
  id: string
  user_id: string
  nim: string
  nama: string
  prodi: string
  fakultas: string
  angkatan: number
  alamat?: string
  username?: string
  role?: UserRole
  created_at: string
  updated_at: string
}

export type MahasiswaWithUser = Mahasiswa & Required<Pick<Mahasiswa, 'username' | 'role'>>

export interface CreateMahasiswaDto {
  nim: string
  nama: string
  prodi: string
  fakultas: string
  angkatan: number
  alamat?: string
  username?: string
  password?: string
  role: 'mahasiswa'
}

export interface UpdateMahasiswaDto extends Partial<Omit<CreateMahasiswaDto, 'nim' | 'role'>> {}

export interface MahasiswaQueryParams {
  search?: string
  angkatan?: number
  prodi?: string
  page?: number
  limit?: number
}

export interface PaginatedMahasiswa {
  data: MahasiswaWithUser[]
  total: number
  page: number
  limit: number
  totalPages: number
}