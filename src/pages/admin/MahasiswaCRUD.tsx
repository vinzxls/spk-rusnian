import { useCallback, useEffect, useState } from 'react'
import type { FormEvent } from 'react'
import { DashboardLayout } from '@/components/layout/DashboardLayout'
import { StatCard } from '@/components/ui/StatCard'
import { Users, FileText, Trophy, AlertCircle } from 'lucide-react'
import { useAuth } from '@/hooks/useAuth'
import { mahasiswaService } from '@/services/mahasiswa.service'
import { kuesionerService } from '@/services/kuesioner.service'
import type { MahasiswaWithUser } from '@/types/mahasiswa.types'

interface FormState {
  nim: string
  nama: string
  prodi: string
  fakultas: string
  angkatan: string
}

const FORM_KOSONG: FormState = {
  nim: '',
  nama: '',
  prodi: 'Ilmu Komputer',
  fakultas: 'MIPA',
  angkatan: String(new Date().getFullYear()),
}

export function MahasiswaCRUD() {
  const { hasRole } = useAuth()
  const [daftar, setDaftar] = useState<MahasiswaWithUser[]>([])
  const [cari, setCari] = useState('')
  const [jumlahKuesioner, setJumlahKuesioner] = useState(0)
  const [formTerbuka, setFormTerbuka] = useState(false)
  const [form, setForm] = useState<FormState>(FORM_KOSONG)
  const [pesan, setPesan] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  const muatData = useCallback(async () => {
    const hasil = await mahasiswaService.findAll({ limit: 1000 })
    setDaftar(hasil.data as MahasiswaWithUser[])
    setJumlahKuesioner((await kuesionerService.getAll()).length)
  }, [])

  useEffect(() => {
    if (hasRole('admin')) void muatData()
  }, [hasRole, muatData])

  if (!hasRole('admin')) {
    return <p className="ds-text-danger">Akses ditolak</p>
  }

  const tersaring = daftar.filter((m) => {
    const q = cari.trim().toLowerCase()
    if (!q) return true
    return m.nim.toLowerCase().includes(q) || m.nama.toLowerCase().includes(q)
  })

  const handleTambah = async (e: FormEvent) => {
    e.preventDefault()
    setError(null)
    setPesan(null)

    const nim = form.nim.trim()
    const nama = form.nama.trim()
    const angkatan = Number(form.angkatan)

    if (!/^\d{8,15}$/.test(nim)) {
      setError('NIM harus berupa 8–15 digit angka.')
      return
    }
    if (!nama) {
      setError('Nama wajib diisi.')
      return
    }
    if (!Number.isInteger(angkatan) || angkatan < 1990 || angkatan > 2100) {
      setError('Angkatan harus tahun yang wajar (1990–2100).')
      return
    }

    try {
      await mahasiswaService.create({
        nim,
        nama,
        prodi: form.prodi.trim() || 'Ilmu Komputer',
        fakultas: form.fakultas.trim() || 'MIPA',
        angkatan,
        role: 'mahasiswa',
      })
      setForm(FORM_KOSONG)
      setFormTerbuka(false)
      setPesan(`Mahasiswa ${nama} (${nim}) berhasil ditambahkan.`)
      await muatData()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Gagal menambah mahasiswa.')
    }
  }

  const handleHapus = async (m: MahasiswaWithUser) => {
    const yakin = window.confirm(`Hapus data ${m.nama} (${m.nim})?`)
    if (!yakin) return

    const berhasil = await mahasiswaService.delete(m.id)
    setPesan(berhasil ? `Data ${m.nama} dihapus.` : 'Data tidak ditemukan.')
    await muatData()
  }

  return (
    <DashboardLayout role="admin" pageTitle="Data Mahasiswa" pageDesc="Kelola data mahasiswa peserta kuesioner">
      <div className="ds-grid ds-grid-4 ds-gap-4 ds-mb-6">
        <StatCard icon={<Users />} title="Total Mahasiswa" value={daftar.length} color="primary" hint="Terdaftar di sistem" />
        <StatCard icon={<FileText />} title="Kuesioner Terisi" value={jumlahKuesioner} color="success" hint={`Dari ${daftar.length} mahasiswa`} />
        <StatCard
          icon={<Trophy />}
          title="Belum Mengisi"
          value={Math.max(daftar.length - jumlahKuesioner, 0)}
          color="warning"
          hint="Menunggu pengisian"
        />
        <StatCard icon={<AlertCircle />} title="Bobot AHP" value="Setara" color="danger" hint="Belum ada pairwise" />
      </div>

      <div className="ds-card">
        <div className="ds-card-header">
          <h3 className="ds-card-title">Daftar Mahasiswa</h3>
        </div>
        <div className="ds-card-content">
          <div className="ds-flex ds-gap-2 ds-mb-4" style={{ flexWrap: 'wrap' }}>
            <input
              type="search"
              className="ds-input"
              placeholder="Cari nama atau NIM..."
              value={cari}
              onChange={(e) => setCari(e.target.value)}
              style={{ maxWidth: 280 }}
              aria-label="Cari mahasiswa"
            />
            <button
              type="button"
              className="ds-btn ds-btn-primary ds-btn-sm"
              onClick={() => {
                setFormTerbuka((v) => !v)
                setError(null)
                setPesan(null)
              }}
              aria-expanded={formTerbuka}
            >
              {formTerbuka ? 'Batal' : 'Tambah Mahasiswa Baru'}
            </button>
          </div>

          {pesan && <div className="ds-alert ds-alert-success" role="status">{pesan}</div>}
          {error && <div className="ds-alert ds-alert-danger" role="alert">{error}</div>}

          {formTerbuka && (
            <form
              onSubmit={handleTambah}
              className="ds-grid ds-grid-3 ds-gap-4"
              style={{ margin: '12px 0 20px', padding: 16, border: '1px solid var(--color-rule)', borderRadius: 'var(--radius-card)' }}
            >
              <div>
                <label htmlFor="nim" className="ds-label ds-required">NIM</label>
                <input
                  id="nim"
                  className="ds-input"
                  value={form.nim}
                  onChange={(e) => setForm({ ...form, nim: e.target.value })}
                  placeholder="202106070002"
                  inputMode="numeric"
                />
              </div>
              <div>
                <label htmlFor="nama" className="ds-label ds-required">Nama Lengkap</label>
                <input
                  id="nama"
                  className="ds-input"
                  value={form.nama}
                  onChange={(e) => setForm({ ...form, nama: e.target.value })}
                  placeholder="Nama mahasiswa"
                />
              </div>
              <div>
                <label htmlFor="angkatan" className="ds-label ds-required">Angkatan</label>
                <input
                  id="angkatan"
                  className="ds-input"
                  value={form.angkatan}
                  onChange={(e) => setForm({ ...form, angkatan: e.target.value })}
                  inputMode="numeric"
                />
              </div>
              <div>
                <label htmlFor="prodi" className="ds-label">Program Studi</label>
                <input
                  id="prodi"
                  className="ds-input"
                  value={form.prodi}
                  onChange={(e) => setForm({ ...form, prodi: e.target.value })}
                />
              </div>
              <div>
                <label htmlFor="fakultas" className="ds-label">Fakultas</label>
                <input
                  id="fakultas"
                  className="ds-input"
                  value={form.fakultas}
                  onChange={(e) => setForm({ ...form, fakultas: e.target.value })}
                />
              </div>
              <div className="ds-flex" style={{ alignItems: 'flex-end' }}>
                <button type="submit" className="ds-btn ds-btn-primary">Simpan</button>
              </div>
            </form>
          )}

          <div className="ds-table-wrapper">
            <table className="ds-table">
              <thead>
                <tr>
                  <th>NIM</th>
                  <th>Nama</th>
                  <th>Prodi</th>
                  <th>Fakultas</th>
                  <th>Angkatan</th>
                  <th style={{ textAlign: 'right' }}>Aksi</th>
                </tr>
              </thead>
              <tbody>
                {tersaring.length === 0 && (
                  <tr>
                    <td colSpan={6} style={{ textAlign: 'center' }}>
                      Tidak ada data mahasiswa yang cocok.
                    </td>
                  </tr>
                )}
                {tersaring.map((m) => (
                  <tr key={m.id}>
                    <td className="font-mono">{m.nim}</td>
                    <td>{m.nama}</td>
                    <td>{m.prodi}</td>
                    <td>{m.fakultas}</td>
                    <td>{m.angkatan}</td>
                    <td style={{ textAlign: 'right' }}>
                      <button
                        type="button"
                        className="ds-btn ds-btn-danger ds-btn-sm"
                        onClick={() => void handleHapus(m)}
                      >
                        Hapus
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </DashboardLayout>
  )
}

export default MahasiswaCRUD
