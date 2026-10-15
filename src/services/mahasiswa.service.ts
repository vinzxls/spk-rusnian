import type {
  Mahasiswa,
  MahasiswaWithUser,
  CreateMahasiswaDto,
  UpdateMahasiswaDto,
  MahasiswaQueryParams,
  PaginatedMahasiswa,
} from '../types/mahasiswa.types'

export interface IMahasiswaRepository {
  findAll(params?: MahasiswaQueryParams): Promise<PaginatedMahasiswa>
  findById(id: string): Promise<Mahasiswa | null>
  findByNim(nim: string): Promise<Mahasiswa | null>
  create(dto: CreateMahasiswaDto): Promise<Mahasiswa>
  update(id: string, dto: UpdateMahasiswaDto): Promise<Mahasiswa>
  delete(id: string): Promise<boolean>
}

const mockMahasiswa: MahasiswaWithUser[] = [
  {
    id: 'mhs-1', user_id: 'user-2', nim: '202106070001', nama: 'Budi Santoso',
    prodi: 'Ilmu Komputer', fakultas: 'MIPA', angkatan: 2021, alamat: 'Jl. Raya No. 1',
    username: '202106070001', role: 'mahasiswa',
    created_at: new Date().toISOString(), updated_at: new Date().toISOString(),
  },
  {
    id: 'mhs-2', user_id: 'user-3', nim: '202206070001', nama: 'Ani Wijaya',
    prodi: 'Ilmu Komputer', fakultas: 'MIPA', angkatan: 2022,
    alamat: 'Jl. Achmad Yani No. 5', username: '202206070001', role: 'mahasiswa',
    created_at: new Date().toISOString(), updated_at: new Date().toISOString(),
  },
]

export class MahasiswaService implements IMahasiswaRepository {
  async findAll(params?: MahasiswaQueryParams): Promise<PaginatedMahasiswa> {
    let data: MahasiswaWithUser[] = [...mockMahasiswa]
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
      total, page, limit, totalPages: Math.ceil(total / limit),
    }
  }

  async findById(id: string): Promise<Mahasiswa | null> {
    return mockMahasiswa.find((x) => x.id === id) ?? null
  }

  async findByNim(nim: string): Promise<Mahasiswa | null> {
    return mockMahasiswa.find((x) => x.nim === nim) ?? null
  }

  async create(dto: CreateMahasiswaDto): Promise<Mahasiswa> {
    if (mockMahasiswa.some((x) => x.nim === dto.nim)) throw new Error(`NIM ${dto.nim} sudah terdaftar`)
    const now = new Date().toISOString()
    const entry: MahasiswaWithUser = {
      id: `mhs-${Date.now()}`, user_id: `user-${Date.now()}`, nim: dto.nim, nama: dto.nama,
      prodi: dto.prodi, fakultas: dto.fakultas, angkatan: dto.angkatan, alamat: dto.alamat,
      username: dto.username ?? dto.nim, role: 'mahasiswa', created_at: now, updated_at: now,
    }
    mockMahasiswa.push(entry)
    return entry
  }

  async update(id: string, dto: UpdateMahasiswaDto): Promise<Mahasiswa> {
    const m = mockMahasiswa.find((x) => x.id === id)
    if (!m) throw new Error('Mahasiswa tidak ditemukan')
    Object.assign(m, dto, { updated_at: new Date().toISOString() })
    return m
  }

  async delete(id: string): Promise<boolean> {
    const idx = mockMahasiswa.findIndex((x) => x.id === id)
    if (idx === -1) return false
    mockMahasiswa.splice(idx, 1)
    return true
  }
}

export const mahasiswaService = new MahasiswaService()
export default mahasiswaService
