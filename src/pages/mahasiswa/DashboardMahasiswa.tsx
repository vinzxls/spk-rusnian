import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { DashboardLayout } from '@/components/layout/DashboardLayout'
import { useAuth } from '@/hooks/useAuth'
import { kuesionerService } from '@/services/kuesioner.service'

export function DashboardMahasiswa() {
  const { user } = useAuth()
  const [hasFilled, setHasFilled] = useState(false)

  useEffect(() => {
    if (user?.id) {
      kuesionerService.getStatus(user.id).then(setHasFilled)
    }
  }, [user])

  return (
    <DashboardLayout
      role="mahasiswa"
      pageTitle="Dashboard Mahasiswa"
      pageDesc="Status pengisian kuesioner kecanduan media sosial"
    >
      <div className="ds-card">
        <div className="ds-card-header">
          <div>
            <h3 className="ds-card-title">Selamat Datang</h3>
            <p className="ds-card-description">Halo, {user?.nama_lengkap || user?.username}.</p>
          </div>
        </div>
        <div className="ds-card-content">
          <p className="ds-body-sm" style={{ marginBottom: 12 }}>
            Silakan isi kuesioner berdasarkan 5 kriteria: Durasi, Frekuensi, Ketergantungan,
            Gangguan Akademik, dan FoMO. Setiap kriteria memiliki 5 subkriteria (skala 1–5).
          </p>
          {hasFilled ? (
            <button className="ds-btn ds-btn-secondary" disabled>
              Kuesioner Sudah Diisi
            </button>
          ) : (
            <Link to="/mahasiswa/kuesioner" className="ds-btn ds-btn-primary">
              Isi Kuesioner Sekarang
            </Link>
          )}
        </div>
      </div>

      <div className="ds-card" style={{ marginTop: 16 }}>
        <div className="ds-card-header">
          <div>
            <h3 className="ds-card-title">Status Kuesioner</h3>
            <p className="ds-card-description">Riwayat pengisian Anda</p>
          </div>
          <span className={`ds-badge ${hasFilled ? 'ds-badge-success' : 'ds-badge-pending'}`}>
            {hasFilled ? 'Sudah Mengisi' : 'Belum Mengisi'}
          </span>
        </div>
        <div className="ds-card-content">
          <div className="ds-empty">
            <div className="ds-empty-icon">{hasFilled ? '✅' : '📝'}</div>
            <p className="ds-empty-title">
              {hasFilled ? 'Terima kasih telah mengisi kuesioner!' : 'Belum ada kuesioner yang diisi'}
            </p>
            <p className="ds-empty-desc">
              {hasFilled
                ? 'Jawaban Anda telah tersimpan ke dalam sistem untuk diproses.'
                : 'Klik tombol di atas untuk mulai mengisi kuesioner.'}
            </p>
          </div>
        </div>
      </div>
    </DashboardLayout>
  )
}
