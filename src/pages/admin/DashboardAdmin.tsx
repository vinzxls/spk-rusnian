import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { DashboardLayout } from '@/components/layout/DashboardLayout'
import { StatCard } from '@/components/ui/StatCard'
import { Users, FileText, Trophy, AlertCircle } from 'lucide-react'
import { useAuth } from '@/hooks/useAuth'
import { mahasiswaService } from '@/services/mahasiswa.service'
import { kuesionerService } from '@/services/kuesioner.service'
import { hasBobotAHP, ringkasBobot, getBobotAHP } from '@/services/ahp-store'
import { getSyncStatus, refreshFromServer, pushAll } from '@/services/sync.service'

export function DashboardAdmin() {
  const { user } = useAuth()
  const [totalMahasiswa, setTotalMahasiswa] = useState(0)
  const [kuesionerTerisi, setKuesionerTerisi] = useState(0)
  const [bobotAktif, setBobotAktif] = useState(false)
  const [ringkasan, setRingkasan] = useState('')
  const [statusServer, setStatusServer] = useState<'online' | 'offline' | 'unknown'>('unknown')
  const [sibuk, setSibuk] = useState(false)
  const [pesanSync, setPesanSync] = useState<string | null>(null)

  useEffect(() => {
    let aktif = true

    const muat = async () => {
      const { total } = await mahasiswaService.findAll({ limit: 1 })
      const jawaban = await kuesionerService.getAll()
      if (!aktif) return
      setTotalMahasiswa(total)
      setKuesionerTerisi(jawaban.length)
      setBobotAktif(hasBobotAHP())
      setRingkasan(ringkasBobot(getBobotAHP()))
      setStatusServer(getSyncStatus() === 'offline' ? 'offline' : 'online')
    }

    void muat()
    return () => {
      aktif = false
    }
  }, [])

  const tarik = async () => {
    setSibuk(true)
    setPesanSync(null)
    const ok = await refreshFromServer()
    kuesionerService.reloadFromStorage()
    setStatusServer(ok ? 'online' : 'offline')
    setPesanSync(ok ? 'Data berhasil dimuat ulang dari server.' : 'Server tidak dapat dihubungi.')
    const jawaban = await kuesionerService.getAll()
    setKuesionerTerisi(jawaban.length)
    setBobotAktif(hasBobotAHP())
    setRingkasan(ringkasBobot(getBobotAHP()))
    setSibuk(false)
  }

  const kirim = async () => {
    setSibuk(true)
    setPesanSync(null)
    const ok = await pushAll()
    setStatusServer(ok ? 'online' : 'offline')
    setPesanSync(
      ok
        ? 'Semua data lokal berhasil dikirim ke server.'
        : 'Sebagian data gagal dikirim. Periksa koneksi atau api.php di server.'
    )
    setSibuk(false)
  }

  return (
    <DashboardLayout role="admin" pageTitle="Dashboard Admin" pageDesc="Ringkasan sistem identifikasi kecanduan media sosial">
      <div className="ds-grid ds-grid-4 ds-gap-4 ds-mb-6">
        <StatCard
          icon={<Users />}
          title="Total Mahasiswa"
          value={totalMahasiswa}
          color="primary"
          hint="Telah terdaftar"
        />
        <StatCard
          icon={<FileText />}
          title="Kuesioner Terisi"
          value={kuesionerTerisi}
          color="success"
          hint={`Dari ${totalMahasiswa} mahasiswa`}
        />
        <StatCard
          icon={<Trophy />}
          title="Siap Diranking"
          value={kuesionerTerisi}
          color="warning"
          hint={kuesionerTerisi > 0 ? 'Lihat di halaman Ranking' : 'Belum ada data'}
        />
        <StatCard
          icon={<AlertCircle />}
          title="Bobot AHP"
          value={bobotAktif ? 'Aktif' : 'Setara'}
          color={bobotAktif ? 'success' : 'danger'}
          hint={bobotAktif ? ringkasan : 'Belum ada perbandingan berpasangan'}
        />
      </div>

      <div className="ds-card ds-mb-4">
        <div className="ds-card-header" style={{ flexWrap: 'wrap' }}>
          <div>
            <h3 className="ds-card-title">Penyimpanan Data</h3>
            <p className="ds-card-description">
              Data disimpan di server agar bisa diakses dari perangkat mana pun.
            </p>
          </div>
          <span
            className={`ds-badge ${
              statusServer === 'online' ? 'ds-badge-success' : 'ds-badge-warning'
            }`}
          >
            <span className="ds-badge-dot" />
            {statusServer === 'online' ? 'Server terhubung' : 'Mode lokal'}
          </span>
        </div>
        <div className="ds-card-content">
          <p className="ds-body-sm" style={{ marginBottom: 12 }}>
            {statusServer === 'online'
              ? 'Setiap perubahan (mahasiswa, jawaban kuesioner, bobot AHP) otomatis dikirim ke server.'
              : 'Server tidak terdeteksi. Data tetap tersimpan di perangkat ini dan bisa dikirim manual setelah server aktif.'}
          </p>
          <div className="ds-flex ds-gap-2 ds-flex-wrap">
            <button
              type="button"
              className="ds-btn ds-btn-secondary ds-btn-sm"
              onClick={() => void tarik()}
              disabled={sibuk}
            >
              {sibuk ? 'Memproses...' : 'Tarik Data dari Server'}
            </button>
            <button
              type="button"
              className="ds-btn ds-btn-secondary ds-btn-sm"
              onClick={() => void kirim()}
              disabled={sibuk}
            >
              Kirim Data Lokal ke Server
            </button>
          </div>
          {pesanSync && (
            <p className="ds-caption" style={{ marginTop: 10 }} role="status">
              {pesanSync}
            </p>
          )}
        </div>
      </div>

      <div className="ds-grid ds-grid-2 ds-gap-4">
        <div className="ds-card">
          <div className="ds-card-header">
            <div>
              <h3 className="ds-card-title">Selamat Datang</h3>
              <p className="ds-card-description">Halo, {user?.nama_lengkap || user?.username}.</p>
            </div>
          </div>
          <div className="ds-card-content">
            <p className="ds-body-sm">
              Selamat datang di Sistem Identifikasi Tingkat Kecanduan Media Sosial berbasis AHP + VIKOR
              untuk Mahasiswa Ilmu Komputer Universitas Pattimura.
            </p>
          </div>
        </div>

        <div className="ds-card">
          <div className="ds-card-header">
            <div>
              <h3 className="ds-card-title">Quick Actions</h3>
              <p className="ds-card-description">Tindakan cepat untuk mengelola sistem</p>
            </div>
          </div>
          <div className="ds-card-content ds-flex ds-flex-col ds-gap-2">
            <Link to="/admin/kriteria" className="ds-btn ds-btn-secondary ds-btn-block">Kelola Kriteria & Subkriteria</Link>
            <Link to="/admin/mahasiswa" className="ds-btn ds-btn-secondary ds-btn-block">Data Mahasiswa</Link>
            <Link to="/admin/laporan" className="ds-btn ds-btn-primary ds-btn-block">Buat Laporan Hasil</Link>
          </div>
        </div>
      </div>
    </DashboardLayout>
  )
}

export default DashboardAdmin
