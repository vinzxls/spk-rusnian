import type {
  Mahasiswa,
  MahasiswaWithUser,
  CreateMahasiswaDto,
  UpdateMahasiswaDto,
  MahasiswaQueryParams,
  PaginatedMahasiswa,
} from '../types/mahasiswa.types'
import { registerMahasiswaAccount, unregisterMahasiswaAccount } from './auth.service'
import { getMahasiswa, saveMahasiswa } from './user-store'

/**
 * Sumber data tunggal untuk data mahasiswa.
 *
 * Sebelumnya modul ini punya array mock sendiri, terpisah dari tabel `users`
 * milik auth.service. Akibatnya mahasiswa yang ditambahkan admin tidak bisa
 * login, dan datanya hilang setiap kali halaman dimuat ulang. Sekarang keduanya
 * membaca/menulis ke services/user-store (localStorage).
 */
function toWithUser(m: {
  id: string
  user_id: string
  nim: string
  nama: string
  prodi: string
  fakultas: string
  angkatan: number
  alamat?: string
  created_at: string
  updated_at: string
}): MahasiswaWithUser {
  return {
    id: m.id,
    user_id: m.user_id,
    nim: m.nim,
    nama: m.nama,
    prodi: m.prodi,
    fakultas: m.fakultas,
    angkatan: m.angkatan,
    alamat: m.alamat,
    username: m.nim,
    role: 'mahasiswa',
    created_at: m.created_at,
    updated_at: m.updated_at,
  }
}

export interface IMahasiswaRepository {
  findAll(params?: MahasiswaQueryParams): Promise<PaginatedMahasiswa>
  findById(id: string): Promise<Mahasiswa | null>
  findByNim(nim: string): Promise<Mahasiswa | null>
  create(dto: CreateMahasiswaDto): Promise<Mahasiswa>
  update(id: string, dto: UpdateMahasiswaDto): Promise<Mahasiswa>
  delete(id: string): Promise<boolean>
}

export class MahasiswaService implements IMahasiswaRepository {
  async findAll(params?: MahasiswaQueryParams): Promise<PaginatedMahasiswa> {
    let data: MahasiswaWithUser[] = getMahasiswa().map(toWithUser)

    if (params?.search) {
      const s = params.search.toLowerCase()
      data = data.filter((m) => m.nim.toLowerCase().includes(s) || m.nama.toLowerCase().includes(s))
    }
    if (params?.angkatan) data = data.filter((m) => m.angkatan === params.angkatan)
    if (params?.prodi) data = data.filter((m) => m.prodi === params.prodi)

    data.sort((a, b) => a.angkatan - b.angkatan || a.nama.localeCompare(b.nama))

    const page = params?.page ?? 1
    const limit = params?.limit ?? 10
    const total = data.length

    return {
      data: data.slice((page - 1) * limit, page * limit),
      total,
      page,
      limit,
      totalPages: Math.max(Math.ceil(total / limit), 1),
    }
  }

  async findById(id: string): Promise<Mahasiswa | null> {
    const m = getMahasiswa().find((x) => x.id === id)
    return m ? toWithUser(m) : null
  }

  async findByNim(nim: string): Promise<Mahasiswa | null> {
    const m = getMahasiswa().find((x) => x.nim === nim)
    return m ? toWithUser(m) : null
  }

  async create(dto: CreateMahasiswaDto): Promise<Mahasiswa> {
    const daftar = getMahasiswa()
    if (daftar.some((x) => x.nim === dto.nim)) {
      throw new Error(`NIM ${dto.nim} sudah terdaftar`)
    }

    const now = new Date().toISOString()
    const userId = `user-${Date.now()}`
    const entry = {
      id: `mhs-${Date.now()}`,
      user_id: userId,
      nim: dto.nim,
      nama: dto.nama,
      prodi: dto.prodi,
      fakultas: dto.fakultas,
      angkatan: dto.angkatan,
      alamat: dto.alamat,
      created_at: now,
      updated_at: now,
    }

    saveMahasiswa([...daftar, entry])

    // Daftarkan sekaligus akun login-nya; tanpa ini mahasiswa baru tidak bisa masuk.
    registerMahasiswaAccount({
      userId,
      nim: entry.nim,
      nama: entry.nama,
      prodi: entry.prodi,
      fakultas: entry.fakultas,
      angkatan: entry.angkatan,
    })

    return toWithUser(entry)
  }

  async update(id: string, dto: UpdateMahasiswaDto): Promise<Mahasiswa> {
    const daftar = getMahasiswa()
    const idx = daftar.findIndex((x) => x.id === id)
    if (idx === -1) throw new Error('Mahasiswa tidak ditemukan')

    const diperbarui = { ...daftar[idx], ...dto, updated_at: new Date().toISOString() }
    const baru = [...daftar]
    baru[idx] = diperbarui
    saveMahasiswa(baru)

    return toWithUser(diperbarui)
  }

  async delete(id: string): Promise<boolean> {
    const daftar = getMahasiswa()
    const target = daftar.find((x) => x.id === id)
    if (!target) return false

    saveMahasiswa(daftar.filter((x) => x.id !== id))
    // Cabut akun login-nya juga, supaya NIM yang sama bisa dipakai lagi.
    unregisterMahasiswaAccount(target.nim)

    return true
  }
}

export const mahasiswaService = new MahasiswaService()
export default mahasiswaService
