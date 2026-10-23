import { Link } from 'react-router-dom'
import { DashboardLayout } from '@/components/layout/DashboardLayout'
import { StatCard } from '@/components/ui/StatCard'
import { Users, FileText, Trophy, AlertCircle } from 'lucide-react'
import { useAuth } from '@/hooks/useAuth'

export function DashboardAdmin() {
  const { user } = useAuth()

  return (
    <DashboardLayout role="admin" pageTitle="Dashboard Admin" pageDesc="Ringkasan sistem identifikasi kecanduan media sosial">
      <div className="ds-grid ds-grid-4 ds-gap-4 mb-6">
        <StatCard icon={<Users />} title="Total Mahasiswa" value="3" color="primary" hint="Telah terdaftar" />
        <StatCard icon={<FileText />} title="Kuesioner Terisi" value="0" color="success" hint="Dari 3 mahasiswa" />
        <StatCard icon={<Trophy />} title="Ranking Tersedia" value="0" color="warning" hint="Belum dihitung" />
        <StatCard icon={<AlertCircle />} title="Bobot AHP" value="Belum" color="danger" hint="Perlu hitung CI/CR" />
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
            <Link to="/admin/ranking" className="ds-btn ds-btn-primary ds-btn-block">Lihat Ranking VIKOR</Link>
          </div>
        </div>
      </div>
    </DashboardLayout>
  )
}