import { Fragment, useState } from 'react'
import { Link } from 'react-router-dom'
import { DashboardLayout } from '@/components/layout/DashboardLayout'
import { StatCard } from '@/components/ui/StatCard'
import { badgeKategori } from '@/utils/badge'
import { useAuth } from '@/hooks/useAuth'
import { useHasilRanking } from '@/hooks/useHasilRanking'
import { CRITERIA_LIST } from '@/types/ahp.types'
import { DEFAULT_KATEGORI_KETERANGAN } from '@/types/hasil.types'
import { ClipboardCheck, Trophy, AlertTriangle, Gauge } from 'lucide-react'

const KRITERIA_KEYS = ['C1', 'C2', 'C3', 'C4', 'C5'] as const

export function HasilIdentifikasi() {
  const { hasRole } = useAuth()
  const { hasil, loading, error, jumlahResponden, bobotDariAHP } = useHasilRanking()
  const [terbuka, setTerbuka] = useState<string | null>(null)

  if (!hasRole('admin')) {
    return <p className="ds-text-danger">Akses ditolak</p>
  }

  const ranking = hasil?.ranking ?? []
  const kategori = { Rendah: 0, Sedang: 0, Tinggi: 0, 'Sangat Tinggi': 0 }
  for (const r of ranking) kategori[r.kategoriKecanduan] += 1

  const rataRataQ = ranking.length
    ? ranking.reduce((sum, r) => sum + r.Q, 0) / ranking.length
    : 0

  return (
    <DashboardLayout
      role="admin"
      pageTitle="Hasil Identifikasi"
      pageDesc="Hasil perhitungan AHP + VIKOR per mahasiswa"
    >
      {error && (
        <div className="ds-alert ds-alert-danger ds-mb-4" role="alert">
          <p className="ds-alert-body">{error}</p>
        </div>
      )}

      <div className="ds-grid ds-grid-4 ds-gap-4 ds-mb-6">
        <StatCard
          icon={<ClipboardCheck />}
          title="Responden Dihitung"
          value={loading ? '...' : jumlahResponden}
          color="primary"
          hint="Kuesioner terkirim"
        />
        <StatCard
          icon={<Trophy />}
          title="Kategori Rendah"
          value={loading ? '...' : kategori.Rendah}
          color="success"
          hint={`Sedang: ${kategori.Sedang}`}
        />
        <StatCard
          icon={<AlertTriangle />}
          title="Tinggi / Sangat Tinggi"
          value={loading ? '...' : kategori.Tinggi + kategori['Sangat Tinggi']}
          color="danger"
          hint={`${kategori.Tinggi} tinggi · ${kategori['Sangat Tinggi']} sangat tinggi`}
        />
        <StatCard
          icon={<Gauge />}
          title="Rata-rata Q"
          value={loading ? '...' : rataRataQ.toFixed(4)}
          color="warning"
          hint={bobotDariAHP ? 'Bobot AHP aktif' : 'Bobot setara (belum AHP)'}
        />
      </div>

      {!loading && ranking.length === 0 && (
        <div className="ds-card ds-mb-4">
          <div className="ds-card-content">
            <div className="ds-empty">
              <p className="ds-empty-icon">📋</p>
              <p className="ds-empty-title">Belum ada hasil identifikasi</p>
              <p className="ds-empty-desc">
                Hasil muncul setelah mahasiswa mengisi kuesioner. Lihat{' '}
                <Link to="/admin/kuesioner">Rekap Kuesioner</Link> untuk memantau pengisian.
              </p>
            </div>
          </div>
        </div>
      )}

      {ranking.length > 0 && (
        <div className="ds-card ds-mb-4">
          <div className="ds-card-header">
            <h3 className="ds-card-title">Rincian per Mahasiswa</h3>
            <span className="ds-caption">Klik baris untuk melihat nilai kriteria</span>
          </div>
          <div className="ds-card-content">
            <div className="ds-table-wrapper">
              <table className="ds-table">
                <thead>
                  <tr>
                    <th>Rank</th>
                    <th>NIM</th>
                    <th>Nama</th>
                    <th>Prodi</th>
                    <th style={{ textAlign: 'right' }}>S</th>
                    <th style={{ textAlign: 'right' }}>R</th>
                    <th style={{ textAlign: 'right' }}>Q</th>
                    <th>Kategori</th>
                  </tr>
                </thead>
                <tbody>
                  {ranking.map((r) => {
                    const aktif = terbuka === r.alternativeId
                    return (
                      <Fragment key={r.alternativeId}>
                        <tr
                          onClick={() => setTerbuka(aktif ? null : r.alternativeId)}
                          style={{ cursor: 'pointer' }}
                          aria-expanded={aktif}
                        >
                          <td className="font-mono">#{r.rank}</td>
                          <td className="font-mono">{r.mahasiswaData?.nim || r.alternativeId}</td>
                          <td>{r.alternativeName}</td>
                          <td>{r.mahasiswaData?.prodi || '-'}</td>
                          <td style={{ textAlign: 'right' }} className="font-mono">
                            {r.S.toFixed(4)}
                          </td>
                          <td style={{ textAlign: 'right' }} className="font-mono">
                            {r.R.toFixed(4)}
                          </td>
                          <td style={{ textAlign: 'right' }} className="font-mono">
                            <strong>{r.Q.toFixed(4)}</strong>
                          </td>
                          <td>
                            <span className={badgeKategori(r.kategoriKecanduan)}>
                              <span className="ds-badge-dot" />
                              {r.kategoriKecanduan}
                            </span>
                          </td>
                        </tr>
                        {aktif && (
                          <tr key={`${r.alternativeId}-detail`}>
                            <td colSpan={8} style={{ backgroundColor: 'var(--color-wash)' }}>
                              <p className="ds-label" style={{ marginBottom: 8 }}>
                                Nilai kriteria (rata-rata subkriteria, skala 1–5)
                              </p>
                              <div className="ds-table-wrapper">
                                <table className="ds-table">
                                  <thead>
                                    <tr>
                                      {KRITERIA_KEYS.map((k) => (
                                        <th key={k} style={{ textAlign: 'right' }}>
                                          {k}{' '}
                                          {CRITERIA_LIST.find((c) => c.code === k)?.name}
                                        </th>
                                      ))}
                                    </tr>
                                  </thead>
                                  <tbody>
                                    <tr>
                                      {KRITERIA_KEYS.map((k) => (
                                        <td key={k} style={{ textAlign: 'right' }} className="font-mono">
                                          {r.originalValues[k].toFixed(2)}
                                        </td>
                                      ))}
                                    </tr>
                                  </tbody>
                                </table>
                              </div>
                              <p className="ds-caption" style={{ marginTop: 8 }}>
                                {
                                  DEFAULT_KATEGORI_KETERANGAN.find(
                                    (k) => k.kategori === r.kategoriKecanduan
                                  )?.keterangan
                                }
                              </p>
                            </td>
                          </tr>
                        )}
                      </Fragment>
                    )
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      <div className="ds-card">
        <div className="ds-card-header">
          <h3 className="ds-card-title">Keterangan Kategori</h3>
        </div>
        <div className="ds-card-content">
          <div className="ds-table-wrapper">
            <table className="ds-table">
              <thead>
                <tr>
                  <th>Kategori</th>
                  <th>Rentang Q</th>
                  <th>Keterangan</th>
                </tr>
              </thead>
              <tbody>
                {DEFAULT_KATEGORI_KETERANGAN.map((k) => (
                  <tr key={k.kategori}>
                    <td>
                      <span className={badgeKategori(k.kategori)}>
                        <span className="ds-badge-dot" />
                        {k.kategori}
                      </span>
                    </td>
                    <td className="font-mono">
                      {k.minQ.toFixed(2)} – {k.maxQ.toFixed(2)}
                    </td>
                    <td>{k.keterangan}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="ds-caption" style={{ marginTop: 12 }}>
            S = ukuran utilitas (semakin kecil semakin baik), R = ukuran penyesalan, Q = indeks
            VIKOR gabungan. Q dihitung relatif terhadap kelompok responden, jadi nilainya dapat
            berubah bila jumlah responden bertambah.
          </p>
        </div>
      </div>
    </DashboardLayout>
  )
}

export default HasilIdentifikasi
