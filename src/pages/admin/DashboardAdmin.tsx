import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { DashboardLayout } from '@/components/layout/DashboardLayout'
import { StatCard } from '@/components/ui/StatCard'
import { Users, FileText, Trophy, AlertCircle } from 'lucide-react'
import { useAuth } from '@/hooks/useAuth'
import { mahasiswaService } from '@/services/mahasiswa.service'
import { kuesionerService } from '@/services/kuesioner.service'

export function DashboardAdmin() {
  const { user } = useAuth()
  const [totalMahasiswa, setTotalMahasiswa] = useState(0)
  const [kuesionerTerisi, setKuesionerTerisi] = useState(0)

  useEffect(() => {
    let aktif = true

    const muat = async () => {
      const { total } = await mahasiswaService.findAll({ limit: 1 })
      const jawaban = await kuesionerService.getAll()
      if (!aktif) return
      setTotalMahasiswa(total)
      setKuesionerTerisi(jawaban.length)
    }

    void muat()
    return () => {
      aktif = false
    }
  }, [])

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
          hint={kuesionerTerisi > 0 ? 'Lihat di halaman Laporan' : 'Belum ada data'}
        />
        <StatCard
          icon={<AlertCircle />}
          title="Bobot AHP"
          value="Setara"
          color="danger"
          hint="Perbandingan berpasangan belum diinput"
        />
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
